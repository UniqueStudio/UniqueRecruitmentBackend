import { Socket } from 'socket.io';
import { verifyJWT } from '../../lib/checker';
import { ObjectId } from 'mongodb';
import { database, io } from '../../app';

let processing: string[] = []; // deal with conflicts
export const onMoveCandidate = (socket: Socket) => (cid: string, from: number, to: number, token: string) => {
    (async () => {
        try {
            verifyJWT(token);
            if (!processing.includes(cid)) {
                processing.push(cid);
                await database.update('candidates', { _id: new ObjectId(cid) }, { step: to });
                socket.broadcast.emit('moveCandidate', cid, from, to);
                socket.emit('moveCandidateSuccess');
                processing = processing.filter(i => i !== cid);
            } else {
                socket.emit('moveCandidateError', '候选人已被拖动', 'warning', { cid, from, to });
                return;
            }
            const candidate = (await database.query('candidates', { _id: new ObjectId(cid) }))[0];
            const recruitment = (await database.query('recruitments', { title: candidate['title'] }))[0];
            const data = recruitment['data'].map((i: object) => {
                if (i['group'] === candidate['group']) {
                    if (!i['steps'][to]) i['steps'][to] = 0;
                    if (!i['steps'][from]) i['steps'][from] = 0;
                    i['steps'][to] += 1;
                    i['steps'][from] -= 1;
                    if (i['steps'][to] < 0) i['steps'][to] = 0;
                    if (i['steps'][from] < 0) i['steps'][from] = 0;
                }
                return i;
            });
            await database.update('recruitments', { title: candidate['title'] }, { data });
            io.emit('updateRecruitment');
        } catch (err) {
            socket.emit('moveCandidateError', err.message, 'danger', { cid, from, to });
        }
    })();
};
