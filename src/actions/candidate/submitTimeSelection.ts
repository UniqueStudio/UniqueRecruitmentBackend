import { RequestHandler } from 'express';
import { body, param, validationResult } from 'express-validator';
import { checkInterview } from '@utils/checkInterview';

export const submitTimeSelection: RequestHandler = async (req, res, next) => {
    try {
    } catch (error) {
        return next(error);
    }
};

export const submitTimeSelectionVerify = [
    body('teamInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
    body('groupInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
];
