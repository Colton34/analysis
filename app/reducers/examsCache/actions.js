/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:41
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-17 09:23:38
*/

'use strict';

import {GET_MORE_EXAMS} from '../../lib/constants';
import {getMoreExams} from '../../api/exam';

export function getMoreExamsAction(params) {
    return {
        type: GET_MORE_EXAMS,
        promise: getMoreExams(params)
    }
}
