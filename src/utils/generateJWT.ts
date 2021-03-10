import jwt from 'jsonwebtoken';
import { secret } from '@/config/consts';
import { Payload } from '@/config/types';
import { isDev } from './environment';

export const generateJWT = (payload: Payload, expire: number) => {
    return jwt.sign(payload, isDev() ? 'DEV' : secret, {
        expiresIn: expire,
    });
};
