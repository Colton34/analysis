/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-28 19:14:32
*/

'use strict';


import Immutable from 'immutable';

import {getMockExamGuide} from '../../api/exam';
import {
    INIT_GLOBAL_GUIDE,
    INIT_SCORE_RANK
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
