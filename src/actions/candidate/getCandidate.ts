import { RequestHandler } from 'express';
import { CandidateRepo, RecruitmentRepo } from '@database/model';
import { errorRes } from '@utils/errorRes';

export const getCandidate: RequestHandler = async (req, res, next) => {
    try {
        const { id } = res.locals;
        const candidate = await CandidateRepo.queryById(id);
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        res.json({
            data: {
                abandon: candidate.abandon,
                rejected: candidate.rejected,
                step: candidate.step,
                name: candidate.name,
                gender: candidate.gender,
                grade: candidate.grade,
                institute: candidate.institute,
                major: candidate.major,
                rank: candidate.rank,
                mail: candidate.mail,
                phone: candidate.phone,
                group: candidate.group,
                intro: candidate.intro,
                isQuick: candidate.isQuick,
                title: candidate.title,
                referrer: candidate.referrer,
                interviews: candidate.interviews,
                groupInterview: candidate.groupInterview,
                teamInterview: candidate.teamInterview,
                lastEdit: candidate.lastEdit,
            },
            type: 'success',
        });
    } catch (error) {
        return next(error);
    }
};
