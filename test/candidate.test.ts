import request from 'supertest';
import { app } from '../src/app';
import { CandidateRepo, RecruitmentRepo, UserRepo } from '../src/database/model';
import { generateJWT } from '../src/utils/generateJWT';
import { updateCandidate } from './helper/updateCandidate';
import { loginCandidate } from './helper/loginCandidate';
import { initialEditTime } from './helper/initialEditTime';

beforeAll(async () => {
    const users = await UserRepo.query({ weChatID: 'foo' });
    await RecruitmentRepo.delete({ title: '2021C' });
    expect(users.length).toBe(1);
    const token = generateJWT({ id: users[0]._id }, 100000);
    await request(app)
        .post('/recruitment')
        .set({
            Authorization: token,
        })
        .send({
            title: '2021C',
            begin: `${Date.now()}`,
            stop: `${Date.now() + 5000000}`,
            end: `${Date.now() + 10000000}`,
            code: '1234',
        })
        .then((res) => {});
});
describe('post /login', () => {
    it('login by candidate should return success', async (done) => {
        request(app)
            .post('/candidate/login')
            .send({ phone: 13343485564, code: 1 })
            .end((err, res) => {
                const result = JSON.parse(res.text);
                console.log(result);
                expect(result.type).toBe('success');
                done();
            });
    });
});

describe('get post put /candidate', () => {
    let token = '';

    it('add candidate should return success', async (done) => {
        await CandidateRepo.delete({ name: 'test', title: '2021C', phone: '13343485564' });
        const res = await updateCandidate('post');
        expect(res.type).toBe('success');
        done();
    });

    it('get candidate by user should return success', async (done) => {
        const users = await UserRepo.query({ weChatID: 'foo' });
        expect(users.length).toBe(1);
        const token = generateJWT({ id: users[0]._id }, 100000);
        request(app)
            .get(`/candidate/${JSON.stringify({ title: '2021C', group: 'web' })}`)
            .set({
                Authorization: token,
            })
            .end((err, res) => {
                console.log(res.text);
                expect(JSON.parse(res.text).type).toBe('success');
                done();
            });
    });

    it('candidate can get personal info', async (done) => {
        token = await loginCandidate();

        request(app)
            .get('/candidate')
            .set({ Authorization: token })
            .send()
            .end((err, res) => {
                const result = JSON.parse(res.text);
                console.log(result);
                expect(result.type).toBe('success');
                done();
            });
    });
    it('candidate can change personal info', async (done) => {
        token = await loginCandidate();
        await initialEditTime();
        const result = await updateCandidate('put', token, {
            name: 'bar',
            mail: 'foo@bar.com',
            referrer: 'bar',
            isQuick: true,
            intro: 'bar',
            group: 'ios',
            phone: '13343485565',
            major: 'bar',
            institute: 'bar',
            gender: 0,
            grade: 4,
        });
        const candidates = await CandidateRepo.query({ phone: '13343485564' });
        expect(candidates.length).toBe(1);
        const candidate = candidates[0];
        expect(result.type).toBe('success');
        expect(candidate.group).toBe('ios');
        expect(candidate.isQuick).toBe(true);
        expect(candidate.intro).toBe('bar');
        expect(candidate.mail).toBe('foo@bar.com');
        expect(candidate.phone).toBe('13343485564');
        expect(candidate.major).toBe('bar');
        expect(candidate.institute).toBe('bar');
        expect(candidate.grade).toBe(4);
        expect(candidate.gender).toBe(1);
        done();
    });
    it('frequent update candidate should return false', async (done) => {
        token = await loginCandidate();
        await initialEditTime();
        let result = await updateCandidate('put', token);
        expect(result.type).toBe('success');
        result = await updateCandidate('put', token);
        expect(result.type).toBe('warning');
        done();
    });
});
