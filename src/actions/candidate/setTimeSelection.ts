import { RequestHandler } from 'express';
import { body, param, validationResult } from 'express-validator';
import { checkInterview } from '@utils/checkInterview';
import { errorRes } from '@utils/errorRes';
import { CandidateRepo, RecruitmentRepo } from '@database/model';
import { GROUP_INTERVIEW_STEP, TEAM_INTERVIEW_STEP } from '@config/consts';
import { group } from 'console';

export const setTimeSelection: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errorRes(errors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        const { id } = res.locals;
        const { teamInterview, groupInterview, abandon } = req.body;
        const candidate = await CandidateRepo.queryById(id);
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        const { interviews, rejected, step } = candidate;
        if (candidate.abandon) {
            return next(errorRes('You have already abandoned!', 'warning'));
        }
        if (rejected) {
            return next(errorRes('You are already rejected!', 'warning'));
        }
        if (abandon) {
            candidate.abandon = true;
            await candidate.save();
            return res.json({ type: 'success' });
        }
        if (step === GROUP_INTERVIEW_STEP) {
            if (!groupInterview) {
                return next(errorRes('Interview time is invalid!', 'warning'));
            }
            if (interviews.group.selection.length) {
                return next(errorRes('You have already submitted!', 'warning'));
            }
            candidate.interviews.group.selection = groupInterview;
            await candidate.save();
            return res.json({ type: 'success' });
        }
        if (step === TEAM_INTERVIEW_STEP) {
            if (!teamInterview) {
                return next(errorRes('Interview time is invalid!', 'warning'));
            }
            if (interviews.team.selection.length) {
                return next(errorRes('You have already submitted!', 'warning'));
            }
            candidate.interviews.team.selection = teamInterview;
            await candidate.save();
            return res.json({ type: 'success' });
        }
        return next(errorRes('Failed to set!', 'warning'));
    } catch (error) {
        return next(error);
    }
};

export const setTimeSelectionVerify = [
    body('teamInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
    body('groupInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
];
