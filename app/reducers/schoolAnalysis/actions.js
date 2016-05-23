/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:28
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-22 21:49:29
*/

'use strict';

import _ from 'lodash';

import {fetchSchoolAnalysisData} from '../../api/mexam';
import {
    FETCH_SCHOOL_ANALYSIS_DATA,
    CHANGE_LEVEL
} from '../../lib/constants';

export function initSchoolAnalysisAction(params) {
    return {
        type: FETCH_SCHOOL_ANALYSIS_DATA,
        promise: fetchSchoolAnalysisData(params)
    }
}

export function changeLevelAction(levels) {
    return {
        type: CHANGE_LEVEL,
        levels: levels
    }
}
