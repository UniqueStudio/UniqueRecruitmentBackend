import jwt from 'jsonwebtoken';
import { secret } from '@/config/consts';
import { FormPayload } from '@/config/types';
import { isDev } from './environment';

export const extractJWT = (token?: string): FormPayload => {
    if (!token) {
        throw new Error('Missing token');
    }
    if (token.indexOf('Bearer ') === 0) {
        token = token.replace('Bearer ', '');
    }

    const payload = jwt.verify(token, isDev() ? 'DEV' : secret) as FormPayload;
    return payload;
};

export const verifyJWT = (token?: string) => {
    const { id } = extractJWT(token);
    return id;
};
