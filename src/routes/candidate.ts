import { Router } from 'express';
import { authenticator } from '@mw/authenticator';
import { codeChecker } from '@mw/codeChecker';
import { fileHandler } from '@mw/fileHandler';

import {
    addCandidate,
    addCandidateVerify,
    allocateAll,
    allocateAllVerify,
    allocateOne,
    allocateOneVerify,
    getCandidates,
    getCandidateVerify,
    getResume,
    newSetCandidate,
    newSetCandidateVerify,
    setCandidate,
    setCandidateVerify,
    handleCandidateLoginVerify,
    handleCandidateLogin,
    getCandidate,
    updateCandidateVerify,
    updateCandidate,
    getTimeSelection,
    setTimeSelection,
    setTimeSelectionVerify,
} from '../actions/candidate';

const router = Router();

// add new candidate
router.post('/', fileHandler.single('resume'), addCandidateVerify, codeChecker('candidate'), addCandidate);

router.get('/', authenticator('candidate'), getCandidate);

router.put('/', authenticator('candidate'), fileHandler.single('resume'), updateCandidateVerify, updateCandidate);

//login
router.post('/login', handleCandidateLoginVerify, codeChecker('candidate'), handleCandidateLogin);

//time selection

router.get('/time', authenticator('candidate'), getTimeSelection);

router.post('/time', authenticator('candidate'), setTimeSelectionVerify, setTimeSelection);

router.use(authenticator('user'));

// allocate one
router.put('/:cid/interview/:type', allocateOneVerify, allocateOne);

// allocate all
router.put('/interview/:type', allocateAllVerify, allocateAll);

// get all candidates
router.get('/:query', getCandidateVerify, getCandidates);

// get resume of a candidate
router.get('/:cid/resume', getResume);

export const candidate = router;
