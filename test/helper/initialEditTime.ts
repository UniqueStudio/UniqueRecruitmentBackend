import { CandidateRepo } from '../../src/database/model';

export const initialEditTime = async () => {
    const candidates = await CandidateRepo.query({ phone: '13343485564' });
    expect(candidates.length).toBe(1);
    let candidate = candidates[0];
    candidate.lastEdit = 0;
    await candidate.save();
};
