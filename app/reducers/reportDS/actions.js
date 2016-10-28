/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-28 09:12:35
*/

'use strict';

import {initReportDS, saveBaseline} from '../../api/exam';
import {
    INIT_REPORT_DS,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS,
    SAVE_BASELINE,
    CHANGE_EXAMS,
    DISABLE_HAVE_INIT
} from '../../lib/constants';

export function initReportDSAction(params) {
    return {
        type: INIT_REPORT_DS,
        promise: initReportDS(params)
    }
}

export function changeLevelAction(data) {
    return {
        type: CHANGE_LEVEL,
        data: data
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

export function disableHaveInitAction() {
    return {
        type: DISABLE_HAVE_INIT
    }
}
