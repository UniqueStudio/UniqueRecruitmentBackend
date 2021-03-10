import request from 'supertest';
import { app } from '../../src/app';

export type Group = 'web' | 'lab' | 'ai' | 'game' | 'android' | 'ios' | 'design' | 'pm';
export type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0-5: from 报名 to 通过
export type Gender = 0 | 1 | 2; // 1: Male, 2: Female, 0: Other
export type Grade = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0-6: from 大一 to 研三
export type Rank = 0 | 1 | 2 | 3 | 4; // 1: 10%, 2: 25%, 3: 50%, 4: 100%, 0: null
export type Evaluation = 0 | 1 | 2; // 0: bad, 1: so-so, 2: good

interface Candidate {
    name?: string;
    gender?: Gender;
    grade?: Grade;
    institute?: string;
    major?: string;
    rank?: Rank;
    mail?: string;
    phone?: string;
    group?: Group;
    title?: string; // e.g. 2018A || 2018S (A: AUTUMN, S: SPRING, C: CAMP)
    intro?: string;
    isQuick?: boolean;
    referrer?: string;
    code?: string;
}
export const updateCandidate = async (method: 'put' | 'post', token?: string, object?: Candidate) => {
    let result: any;
    let body: Candidate = {
        referrer: 'jnw',
        name: 'test',
        mail: 'aa@bb.cc',
        code: '1234',
        isQuick: false,
        intro: '123',
        title: '2021C',
        group: 'web',
        phone: '13343485564',
        rank: 0,
        major: 'test',
        institute: 'test',
        grade: 6,
        gender: 1,
    };
    if (object) {
        body = {
            ...body,
            ...object,
        };
    }
    if (method === 'put') {
        await request(app)
            .put('/candidate')
            .set({ Authorization: token })
            .send(body)
            .then((res) => {
                result = JSON.parse(res.text);
            });
    } else {
        await request(app)
            .post('/candidate')
            .send(body)
            .then((res) => {
                result = JSON.parse(res.text);
            });
    }
    return result;
};
