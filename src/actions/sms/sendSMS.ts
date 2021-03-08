import { Request, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import moment from 'moment';
import fetch from 'node-fetch';
import { shortenURL } from '@utils/shortenURL';
import { formURL, GROUP_INTERVIEW_STEP, smsAPI, TEAM_INTERVIEW_STEP, token } from '@config/consts';
import { CandidateRepo, PayloadRepo, RecruitmentRepo } from '@database/model';
import { redisAsync } from '../../redis';
import { errorRes } from '@utils/errorRes';
import { generateSMS } from '@utils/generateSMS';
import md5 from '@utils/md5';
import { titleConverter } from '@utils/titleConverter';

const padZero = (toPad: number) => toPad.toString().padStart(2, '0');

const dateTranslator = (timestamp: number) => {
    const date = moment(timestamp).utcOffset(8);
    return `${date.month() + 1}月${date.date()}日${padZero(date.hour())}:${padZero(date.minute())}`;
};

const setPasser = async (id: string, nextStep: number) => {
    const candidateInfo = await CandidateRepo.queryById(id);
    if (!candidateInfo) {
        return new Error("Candidate doesn't exist!");
    }
    if (nextStep === GROUP_INTERVIEW_STEP) {
        candidateInfo.groupInterview = true;
    }
    if (nextStep === TEAM_INTERVIEW_STEP) {
        candidateInfo.teamInterview = true;
    }
    await candidateInfo.save();
};

const send = (req: Request) => {
    const { step, type, time, place, rest, next: nextStep, candidates } = req.body;
    let recruitmentId = '';
    return candidates.map(async (id: string) => {
        const candidateInfo = await CandidateRepo.queryById(id);
        if (!candidateInfo) {
            return new Error("Candidate doesn't exist!");
        }
        const { name, title, group, interviews, phone } = candidateInfo;
        let hash = '';
        try {
            if (type === 'accept') {
                //TODO: 废弃formid的设定
                if (!recruitmentId) {
                    // 仅执行一次，用于生成含有recruitment id的formId
                    // 以后所有的candidates都可以复用这个formId
                    const recruitment = (await RecruitmentRepo.query({ title }))[0];
                    if (recruitment.end < Date.now()) {
                        return new Error('This recruitment has already ended!');
                    }
                    if (nextStep === 2) {
                        // 组面
                        const data = recruitment.groups.find((groupData) => groupData.name === group);
                        if (!data) {
                            return new Error("Group doesn't exist!");
                        }
                        if (!data.interview.length) {
                            return new Error('Please set group interview time first!');
                        }
                    } else if (nextStep === 4) {
                        // 群面
                        if (!recruitment.interview.length) {
                            return new Error('Please set team interview time first!');
                        }
                    }
                    recruitmentId = `${recruitment._id}`;
                }
                const payload = {
                    recruitmentId,
                    id,
                    step: nextStep === 2 ? 'group' : 'team',
                    group,
                };
                hash = md5(payload);
                Promise.all([
                    PayloadRepo.createAndInsert({ ...payload, hash }),
                    redisAsync.set(`payload:${hash}`, id, 'EX', 60 * 60 * 24 * 2),
                ]).catch((e) => {
                    throw new Error(`Error in ${name}: ${e}`);
                });
                setPasser(id, nextStep);
            }
            if (type === 'reject') {
                await CandidateRepo.updateById(id, { rejected: true });
            }
            const url = recruitmentId ? await shortenURL(`${formURL}/${hash}`) : '';
            let allocated;
            if (type === 'group' || type === 'team') {
                allocated = interviews[type].allocation;
            }
            const smsBody = generateSMS({
                name,
                title: titleConverter(title),
                step,
                type,
                group,
                rest,
                nextStep,
                url,
                time: type === 'accept' ? time : allocated && dateTranslator(allocated),
                place,
            });
            const response = await fetch(smsAPI, {
                method: 'POST',
                headers: {
                    Token: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone,
                    ...smsBody,
                }),
            });
            const { code, message }: { code: number; message: string } = await response.json();
            if (code !== 200) {
                return new Error(`Error in ${name}: ${message.replace('\n', '')}`);
            }
            return;
        } catch ({ message }) {
            return new Error(`Error in ${name}: ${message}`);
        }
    });
};

export const sendSMS: RequestHandler = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return next(errorRes(validationErrors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        Promise.all(send(req))
            .then((values) => {
                const errors = values.filter((value) => value instanceof Error).map(({ message }) => message);
                if (errors.length) {
                    res.json({ type: 'warning', messages: errors });
                } else {
                    res.json({ type: 'success' });
                }
            })
            .catch((error) => next(error));
    } catch (error) {
        return next(error);
    }
};

export const sendSMSVerify = [body('type').isIn(['accept', 'reject', 'group', 'team']).withMessage('Type is invalid!')];
