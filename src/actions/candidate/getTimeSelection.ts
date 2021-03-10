import { RequestHandler } from 'express';
import { CandidateRepo, RecruitmentRepo } from '@/database/model';
import { errorRes } from '@/utils/errorRes';
import { GROUP_INTERVIEW_STEP, TEAM_INTERVIEW_STEP } from '@/config/consts';

export const getTimeSelection: RequestHandler = async (req, res, next) => {
    try {
        const pending = await RecruitmentRepo.query({ stop: { $gt: Date.now() }, begin: { $lt: Date.now() } });
        if (pending.length === 0) {
            return next(errorRes('Recruitment has been ended!', 'warning'));
        }
        const { id } = res.locals;
        const candidate = await CandidateRepo.queryById(id);
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        const { step, group: groupName, groupInterview, teamInterview } = candidate;
        if (step === GROUP_INTERVIEW_STEP) {
            if (groupInterview === false) {
                return next(errorRes("Candidate doesn't enter interview process", 'error'));
            } else {
                const groupData = pending[0].groups.find((group) => group.name === groupName);
                return res.json({ type: 'success', time: groupData!.interview });
            }
        }
        if (step === TEAM_INTERVIEW_STEP) {
            if (teamInterview === false) {
                return next(errorRes("Candidate doesn't enter interview process", 'error'));
            } else {
                return res.json({ type: 'success', time: pending[0].interview });
            }
        }
        return next(errorRes("Candidate doesn't enter interview process", 'error'));
    } catch (error) {
        return next(error);
    }
};
