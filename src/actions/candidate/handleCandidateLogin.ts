import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { errorRes } from '@/utils/errorRes';
import { generateJWT } from '@/utils/generateJWT';
import { CandidateRepo, RecruitmentRepo } from '@/database/model';
import { JWT_EXPIRE_TIME } from '@/config/consts';

export const handleCandidateLogin: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errorRes(errors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        const { phone } = req.body;
        const pending = await RecruitmentRepo.query({ stop: { $gt: Date.now() }, begin: { $lt: Date.now() } });
        if (pending.length === 0) {
            return next(errorRes('Recruitment has been ended!', 'warning'));
        }
        const title = pending[0].title;
        const candidate = (await CandidateRepo.query({ phone, title }))[0];
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        const id = candidate._id;
        const token = generateJWT({ id }, JWT_EXPIRE_TIME);
        res.json({ token, type: 'success' });
    } catch (error) {
        return next(error);
    }
};

export const handleCandidateLoginVerify = [
    body('phone').isMobilePhone('zh-CN').withMessage('Phone is invalid!'),
    body('code').isInt().withMessage('Code is invalid!'),
];
