/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 15:29:30
*/

'use strict';

import {initReportDS} from '../../api/exam';
import {
    INIT_REPORT_DS,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS
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
