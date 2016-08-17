/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-16 21:08:12
*/

'use strict';

import {initReportDS, saveBaseline} from '../../api/exam';
import {
    INIT_REPORT_DS,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS,
    SAVE_BASELINE,
    CHANGE_EXAMS
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

export function saveBaselineAction(params) {
    return {
        type: SAVE_BASELINE,
        promise: saveBaseline(params)
    }
}

export function changeExamsAction(examids) {

}
