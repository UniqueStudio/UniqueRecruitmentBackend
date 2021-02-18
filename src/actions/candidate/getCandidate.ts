import { RequestHandler } from 'express';
import { CandidateRepo, RecruitmentRepo } from '@database/model';
import { compareTitle } from '@utils/compareTitle';
import { errorRes } from '@utils/errorRes';

export const getCandidate: RequestHandler = async (req, res, next) => {
    try {
        const pending = await RecruitmentRepo.query({ stop: { $gt: Date.now() }, begin: { $lt: Date.now() } });
        const phone = res.locals.phone;
        if (pending.length === 0) {
            return next(errorRes('Recruitment has been ended!', 'warning'));
        }
        const title = pending[0].title;
        const candidate = await CandidateRepo.query({ title, phone });
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        res.json({
            data: candidate.map((item) => {
                return {
                    abandon: item.abandon,
                    rejected: item.rejected,
                    step: item.step,
                    name: item.name,
                    gender: item.gender,
                    grade: item.grade,
                    institute: item.institute,
                    major: item.major,
                    rank: item.rank,
                    mail: item.mail,
                    phone: item.phone,
                    group: item.group,
                    intro: item.intro,
                    isQuick: item.isQuick,
                    title: item.title,
                    referrer: item.referrer,
                };
            })[0],
            type: 'success',
        });
    } catch (error) {
        return next(error);
    }
};
