import { body, param, validationResult } from 'express-validator';


import { TITLE_REGEX } from '@config/consts';
import { Group, Handler, Time } from '@config/types';
import { RecruitmentRepo, UserRepo } from '@database/model';
import { io } from '@servers/websocket';
import { checkInterview } from '@utils/checkInterview';
import { errorRes } from '@utils/errorRes';

interface Body {
    begin: number;
    end: number;
    stop: number;
    group: Group;
    teamInterview?: Time[];
    groupInterview?: Time[];
}

export const setRecruitment: Handler<Body> = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(errorRes(errors.array({ onlyFirstError: true })[0]['msg'], 'warning'));
        }
        const user = await UserRepo.queryById(res.locals.id);
        if (!user) {
            return next(errorRes('User doesn\'t exist!', 'warning'));
        }
        const { isAdmin, isCaptain, group: userGroup } = user;
        if (!isAdmin && !isCaptain) {
            return next(errorRes('Permission denied', 'warning'));
        }
        const { title } = req.params;
        const { begin, end, stop, groupInterview, teamInterview, group } = req.body;
        await RecruitmentRepo.update({ title }, {
            begin,
            end,
            stop,
        });
        if (teamInterview && teamInterview.length) {
            await RecruitmentRepo.update({ title }, {
                interview: teamInterview
            });
        }
        if (groupInterview && groupInterview.length) {
            if (!group) {
                return next(errorRes('Group isn\'t specified!', 'warning'));
            }
            if (!isAdmin && group !== userGroup) {
                return next(errorRes('Permission denied', 'warning'));
            }
            await RecruitmentRepo.update({
                title,
                'groups.name': group,
            }, {
                'groups.$.interview': groupInterview,
            });
        }
        io.emit('updateRecruitment');
        return res.json({ type: 'success' });
    } catch (error) {
        return next(error);
    }
};

export const setRecruitmentVerify = [
    param('title').matches(TITLE_REGEX).withMessage('Title is invalid!')
        .custom(async (title) => {
            const recruitment = (await RecruitmentRepo.query({ title }))[0];
            if (!recruitment) {
                throw new Error('Current recruitment doesn\'t exist!');
            }
            // if (Date.now() < recruitment.begin) {
            //     throw new Error('Current recruitment is not started!');
            // }
            if (Date.now() > recruitment.end) {
                throw new Error('Current recruitment has ended!');
            }
        }),
    body('begin').isInt().withMessage('Begin time is invalid!')
        .custom((begin, { req: { body: { stop } } }) => begin < stop).withMessage('Stop applying time should be later than begin time'),
    body('stop').isInt().withMessage('Stop applying time is invalid!')
        .custom((stop, { req: { body: { end } } }) => stop < end).withMessage('End time should be later than stop applying time'),
    body('end').isInt().withMessage('End time is invalid!')
        .custom((end, { req: { body: { begin } } }) => end > begin).withMessage('End time should be later than begin time'),
    body('teamInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
    body('groupInterview').custom(checkInterview).withMessage('Interview time is invalid!'),
];
