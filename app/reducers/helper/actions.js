/*
* @Author: HellMagic
* @Date:   2016-10-13 21:11:56
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-14 11:03:47
*/

'use strict';

import {fetchExamList} from '../../api/exam';
import {FETCH_EXAM_LIST} from '../../lib/constants';

export function fetchExamListAction(params) {
    return {
        type: FETCH_EXAM_LIST,
        promise: fetchExamList(params)
    }
}
