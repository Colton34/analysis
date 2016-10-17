/*
* @Author: HellMagic
* @Date:   2016-10-13 21:11:56
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 12:32:08
*/

'use strict';

import {fetchEquivalentScoreInfoList} from '../../api/exam';
import {FETCH_EQUIVALENT_SCORE_INFO_LIST} from '../../lib/constants';

export function fetchEquivalentScoreInfoListAction(params) {
    return {
        type: FETCH_EQUIVALENT_SCORE_INFO_LIST,
        promise: fetchEquivalentScoreInfoList(params)
    }
}
