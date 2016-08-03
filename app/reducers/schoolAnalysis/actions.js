/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:28
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 14:20:42
*/

'use strict';

import _ from 'lodash';

import {
    INIT_SCHOOL_ANALYSIS,
    INIT_SCHOOL_ANALYSIS_PART,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS
} from '../../lib/constants';
import {initSchoolAnalysis, initSchoolAnalysisPart} from '../../api/exam';


export function initSchoolAnalysisAction(params) {
    console.log('2');
    return {
        type: INIT_SCHOOL_ANALYSIS,
        promise: initSchoolAnalysis(params)
    }
}

export function initSchoolAnalysisPartAction(params) {
    return {
        type: INIT_SCHOOL_ANALYSIS_PART,
        promise: initSchoolAnalysisPart(params)
    }
}

export function changeLevelAction(levels) {
    return {
        type: CHANGE_LEVEL,
        levels: levels
    }
}

export function updateLevelBuffersAction(levelBuffers) {
    return {
        type: CHANGE_LEVEL_BUFFERS,
        levelBuffers: levelBuffers
    }
}
