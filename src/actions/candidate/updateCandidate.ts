import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { io } from '../../app';

import { CANDIDATE_EDIT_INTERVAL, GENDERS, GRADES, GROUPS_, RANKS } from '@config/consts';
import { CandidateRepo, RecruitmentRepo } from '@database/model';
import { copyFile } from '@utils/copyFile';
import { errorRes } from '@utils/errorRes';

export const updateCandidate: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errorRes(errors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        const { id } = res.locals;
        const {
            name,
            grade,
            institute,
            major,
            rank,
            mail,
            phone,
            group,
            gender,
            intro,
            title,
            isQuick,
            referrer,
        } = req.body;
        let filepath = '';
        if (req.file) {
            const { originalname: filename, path: oldPath } = req.file;
            filepath = path.join('./data/resumes', title, group);
            filepath = await copyFile(oldPath, filepath, `${name} - ${filename}`);
        }
        const candidate = await CandidateRepo.queryById(id);
        if (!candidate) {
            return next(errorRes("Phone number hasn't signup", 'warning'));
        }
        const { lastEdit } = candidate;
        if (Date.now() - lastEdit < CANDIDATE_EDIT_INTERVAL) {
            return next(errorRes('Too frequent editing', 'warning'));
        }
        const preGroup = candidate.group;
        const info = await CandidateRepo.updateById(id, {
            grade,
            institute,
            major,
            rank,
            mail,
            gender,
            intro,
            isQuick,
            referrer,
            lastEdit: Date.now(),
        });
        const updateGroupCount = async (groupName: string) => {
            await RecruitmentRepo.update(
                { title, 'groups.name': groupName },
                {
                    'groups.$.total': await CandidateRepo.count({ title, group }),
                    'groups.$.steps.0': await CandidateRepo.count({ title, group, step: 0 }),
                    total: await CandidateRepo.count({ title }),
                }
            );
        };
        await updateGroupCount(preGroup);
        await updateGroupCount(group);
        res.json({ type: 'success' });
        io.emit('updateCandidate', { candidate: info });
        io.emit('updateRecruitment');
    } catch (err) {
        return next(err);
    }
};

export const verifyTitle = body('title')
    .matches(/\d{4}[ASC]/, 'g')
    .withMessage('Title is invalid!')
    .custom(async (title) => {
        const recruitment = (await RecruitmentRepo.query({ title }))[0];
        if (!recruitment) {
            throw new Error("Current recruitment doesn't exist!");
        }
        if (Date.now() < recruitment.begin) {
            throw new Error('Current recruitment is not started!');
        }
        if (Date.now() > recruitment.end) {
            throw new Error('Current recruitment has ended!');
        }
    });

export const updateCandidateVerify = [
    body('name').isString().withMessage('Name is invalid!'),
    body('mail').isEmail().withMessage('Mail is invalid!'),
    body('grade').isInt({ lt: GRADES.length, gt: -1 }).withMessage('Grade is invalid!'),
    body('institute').isString().withMessage('Institute is invalid!'),
    body('major').isString().withMessage('Major is invalid!'),
    body('gender').isInt({ lt: GENDERS.length, gt: -1 }).withMessage('Gender is invalid!'),
    body('isQuick').isBoolean().withMessage('IsQuick is invalid!'),
    body('phone').isMobilePhone('zh-CN').withMessage('Phone is invalid!'),
    body('group')
        .isIn(GROUPS_)
        .withMessage('Group is invalid!')
        .custom((group, { req }) => !(group === 'design' && !req.file))
        .withMessage('Signing up Design team needs works'),
    body('rank').isInt({ lt: RANKS.length, gt: -1 }).withMessage('Rank is invalid!'),
    body('intro').isString().withMessage('Intro is invalid!'),
    body('referrer').isString().withMessage('Referrer is invalid!'),
    verifyTitle,
];
