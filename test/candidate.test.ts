import request from 'supertest';
import { app } from '../src/app';
import { CandidateRepo, UserRepo } from '../src/database/model';
import { generateJWT } from '../src/utils/generateJWT';

describe('POST&&GET /candidate', () => {
    it('should return success', async (done) => {
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
    it('should return success', async (done) => {
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
});
