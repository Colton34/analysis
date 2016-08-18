/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:41
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-18 11:10:41
*/

'use strict';

import {INIT_EXAMCACHE, GET_MORE_EXAMS} from '../../lib/constants';
import {initExamCache, getMoreExams} from '../../api/exam';

export function initExamCacheAction(params) {
    console.log('初始化examCache和examList');
    // debugger;
    return {
        type: INIT_EXAMCACHE,
        promise: initExamCache(params)
    }
}

export function getMoreExamsAction(params) {
    console.log('获取更多的exams');
    // debugger;
    return {
        type: GET_MORE_EXAMS,
        promise: getMoreExams(params)
    }
}
