/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:28
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:30:56
*/

'use strict';

import _ from 'lodash';

import {
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS
} from '../../lib/constants';

// export function initSchoolAnalysisAction(params) {
//     return {
//         type: FETCH_SCHOOL_ANALYSIS_DATA,
//         promise: fetchSchoolAnalysisData(params)
//     }
// }

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
