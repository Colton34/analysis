/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-29 14:13:35
*/

'use strict';


import Immutable from 'immutable';

import {getMockExamGuide, getMockScoreRank, getMockClassReport, getMockLevelReport, getMockSubjectReport} from '../../api/exam';
import {
    INIT_GLOBAL_GUIDE,
    INIT_SCORE_RANK,
    INIT_CLASS_REPORT,
    INIT_LEVEL_REPORT,
    INIT_SUBJECT_REPORT
} from '../../lib/constants';

export function initExamGuide() {
    return {
        type: INIT_GLOBAL_GUIDE,
        promise: getMockExamGuide()
    }
}

export function initScoreRank() {
    return {
        type: INIT_SCORE_RANK,
        promise:getMockScoreRank()
    }
}

export function initClassReport() {
    return {
        type: INIT_CLASS_REPORT,
        promise: getMockClassReport()
    }
}

export function initLevelReport() {
    return {
        type: INIT_LEVEL_REPORT,
        promise: getMockLevelReport()
    }
}

export function initSubjectReport() {
    return {
        type: INIT_SUBJECT_REPORT,
        promise: getMockSubjectReport()
    }
}
