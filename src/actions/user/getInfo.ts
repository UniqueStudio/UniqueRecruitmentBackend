import { RequestHandler } from 'express';
import { UserRepo } from '../../database/model';
import { errorRes } from '../../utils/errorRes';

export const getInfo: RequestHandler = async (req, res, next) => {
    try {
        const user = await UserRepo.queryProtectedById(res.locals.id, 'password');
        if (!user) {
            return next(errorRes('User doesn\'t exist!', 'warning'));
        }
        res.json({ data: user, type: 'success' });
    } catch (error) {
        return next(error);
    }
};
