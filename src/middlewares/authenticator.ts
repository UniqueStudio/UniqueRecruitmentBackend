import { NextFunction, Request, RequestHandler, Response } from 'express';
import { errorRes } from '@utils/errorRes';
import { verifyJWT } from '@utils/verifyJWT';

export const authenticator = (type: 'user' | 'candidate'): RequestHandler => (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const jwt = req.get('Authorization');
    if (!jwt) {
        return next(errorRes('No JWT provided!', 'warning'));
    }
    try {
        if (type === 'user') {
            res.locals.id = verifyJWT(jwt);
        } else {
            res.locals.id = verifyJWT(jwt);
        }
        next();
    } catch (e) {
        return next(errorRes('JWT is invalid!', 'warning'));
    }
};
