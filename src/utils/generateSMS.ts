import { STEPS } from '@config/consts';

interface Model {
    type: string;
    name: string;
    group: string;
    title: string;
    step: number;
    nextStep: number;
    time: string;
    place: string;
    rest: string;
    url: string;
}

export const generateSMS = ({ name, title, step, type, group, time, place, rest, nextStep }: Model) => {
    const suffix = ' (请勿回复本短信)';
    if (!name) throw new Error('Name not provided!');
    switch (type) {
        case 'accept': {
            if (!group) throw new Error('Group not provided!');
            if (!title) throw new Error('Title not provided!');
            let defaultRest = '';
            switch (nextStep) {
                case 2:
                case 4:
                    defaultRest = `，请进入选手dashboard系统选择面试时间`;
                    break;
                case 1:
                case 3:
                    if (!time || !place) throw new Error('Time or place not provided!');
                    defaultRest = `，请于${time}在${place}参加${STEPS[nextStep]}，请务必准时到场`;
                    break;
                case 5:
                    defaultRest = `，你已成功加入${group}组`;
                    break;
                default:
                    throw new Error('Next step is invalid!');
            }
            rest = `${rest || defaultRest}${suffix}`;
            // {1}你好，你通过了{2}{3}组{4}审核{5}
            return { template: 670901, param_list: [name, title, group, STEPS[step], rest] };
        }
        case 'reject': {
            if (!group) throw new Error('Group not provided!');
            if (!title) throw new Error('Title not provided!');
            if (step === undefined || step < 0 || step > 4) throw new Error('Step is invalid!');
            const defaultRest = '不要灰心，继续学习。期待与更强大的你的相遇！';
            rest = `${rest || defaultRest}${suffix}`;
            // {1}你好，你没有通过{2}{3}组{4}审核，请你{5}
            return { template: 670903, param_list: [name, title, group, STEPS[step], rest] };
        }
        case 'group': {
            if (!group) throw new Error('Group not provided!');
            if (!place) throw new Error('Place not provided!');
            if (!time) throw new Error('Time not provided!');
            // {1}你好，请于{2}在启明学院亮胜楼{3}参加{4}，请准时到场。
            return { template: 670906, param_list: [name, time, place, `${group}组组面`] };
        }
        case 'team': {
            if (!place) throw new Error('Place not provided!');
            if (!time) throw new Error('Time not provided!');
            // {1}你好，请于{2}在启明学院亮胜楼{3}参加{4}，请准时到场。
            return { template: 670906, param_list: [name, time, place, `团队群面`] };
        }

        default:
            throw new Error('Type not provided!');
    }
};
