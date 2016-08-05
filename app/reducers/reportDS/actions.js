/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-05 09:41:04
*/

'use strict';

import {initReportDS} from '../../api/exam';
import {
    INIT_REPORT_DS,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS,
    SAVE_LEVLE,
    SAVE_SUBJECT_LEVEL,
    SAVE_LEVEL_BUFFER
} from '../../lib/constants';

export function initReportDSAction(params) {
    return {
        type: INIT_REPORT_DS,
        promise: initReportDS(params)
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

export function saveLevelAction(levels) {
    return {
        type: SAVE_LEVLE,
        levels: levels
    }
}

export function saveSubjectLevelAction(subjectLevels) {
    return {
        type: SAVE_SUBJECT_LEVEL,
        subjectLevels: subjectLevels
    }
}

export function saveLevelBuffersAction(levelBuffers) {
    return {
        type: SAVE_LEVEL_BUFFER,
        levelBuffers: levelBuffers
    }
}
