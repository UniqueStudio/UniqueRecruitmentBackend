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
    getForm,
    getFormVerify,
    getResume,
    newGetForm,
    newGetFormVerify,
    newSetCandidate,
    newSetCandidateVerify,
    setCandidate,
    setCandidateVerify,
    handleCandidateLoginVerify,
    handleCandidateLogin,
} from '../actions/candidate';

const router = Router();

// add new candidate
router.post('/', fileHandler.single('resume'), addCandidateVerify, codeChecker('candidate'), addCandidate);

//login
router.post('/login', handleCandidateLoginVerify, codeChecker('candidate'), handleCandidateLogin);

// generate form
router.get('/:cid/form/:formId', getFormVerify, getForm);

router.get('/form/:hash', newGetFormVerify, newGetForm);

router.use(authenticator);

// set candidates data
router.put('/:cid/form/:formId', setCandidateVerify, setCandidate);

router.put('/form/:hash', newSetCandidateVerify, newSetCandidate);

// allocate one
router.put('/:cid/interview/:type', allocateOneVerify, allocateOne);

// allocate all
router.put('/interview/:type', allocateAllVerify, allocateAll);

// get all candidates
router.get('/:query', getCandidateVerify, getCandidates);

// get resume of a candidate
router.get('/:cid/resume', getResume);

export const candidate = router;
