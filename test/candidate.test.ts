import request from 'supertest';
import { app } from '../src/app';
import { CandidateRepo, UserRepo } from '../src/database/model';
import { generateJWT } from '../src/utils/generateJWT';

describe('/candidate', () => {
    let token = '';
    it('add candidate should return success', async (done) => {
        await CandidateRepo.delete({ name: 'test', title: '2021C', phone: '13343485564' });
        request(app)
            .post('/candidate')
            .field('name', 'test')
            .field('mail', 'aa@bb.cc')
            .field('referrer', '123')
            .field('code', '1234')
            .field('isQuick', 'false')
            .field('intro', '123')
            .field('title', '2021C')
            .field('group', 'web')
            .field('phone', '13343485564')
            .field('rank', 0)
            .field('major', 'test')
            .field('institute', 'test')
            .field('grade', 6)
            .field('gender', 1)
            .field('code', 1)
            .attach('resume', './package.json')
            .end((err, res) => {
                const result = JSON.parse(res.text);
                console.log(result);
                expect(result.type).toBe('success');
                done();
            });
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
    it('candidate can get personal info', async (done) => {
        await request(app)
            .post('/candidate/login')
            .send({ phone: 13343485564, code: 1 })
            .then((res) => {
                const result = JSON.parse(res.text);
                token = result.token;
            });
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
        await request(app)
            .post('/candidate/login')
            .send({ phone: 13343485564, code: 1 })
            .then((res) => {
                const result = JSON.parse(res.text);
                token = result.token;
            });
        const candidate = await CandidateRepo.query({ phone: '13343485564' })[0];
        candidate.lastEdit = 0;
        await candidate.save();

        await request(app)
            .put('/candidate')
            .set({ Authorization: token })
            .field('name', 'test')
            .field('mail', 'aa@bb.cc')
            .field('referrer', '123')
            .field('code', '1234')
            .field('isQuick', 'false')
            .field('intro', '123')
            .field('title', '2021C')
            .field('group', 'ios')
            .field('phone', '13343485564')
            .field('rank', 0)
            .field('major', 'test')
            .field('institute', 'test')
            .field('grade', 6)
            .field('gender', 1)
            .field('code', 1)
            .then((res) => {
                const result = JSON.parse(res.text);
                console.log(result);
                expect(result.type).toBe('success');
            });
        expect(candidate.group).toBe('ios');
    });
});
