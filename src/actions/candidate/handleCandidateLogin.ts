import crypto from 'crypto';
import { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { errorRes } from '@utils/errorRes';
import { generateJWT } from '@utils/generateJWT';
import { CandidateRepo } from '@database/model';

export const handleCandidateLogin: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errorRes(errors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        const { phone } = req.body;
        const candidate = (await CandidateRepo.query({ phone }))[0];
        if (!candidate) {
            return next(errorRes("Candidate doesn't exist!", 'warning'));
        }
        const token = generateJWT({ id: candidate._id }, 604800);
        res.json({ token, type: 'success' });
    } catch (error) {
        return next(error);
    }
};

export const handleCandidateLoginVerify = [
    body('phone').isMobilePhone('zh-CN').withMessage('Phone is invalid!'),
    body('code').isInt().withMessage('Code is invalid!'),
];
