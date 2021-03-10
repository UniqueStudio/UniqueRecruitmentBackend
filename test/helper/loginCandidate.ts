import request from 'supertest';
import { app } from '../../src/app';
export const loginCandidate = async () => {
    let token = '';
    await request(app)
        .post('/candidate/login')
        .send({ phone: 13343485564, code: 1 })
        .then((res) => {
            const result = JSON.parse(res.text);
            token = result.token;
        });
    return token;
};
