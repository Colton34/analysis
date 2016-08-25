/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:41
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-24 16:21:12
*/

'use strict';

import {INIT_EXAMCACHE, GET_MORE_EXAMS_INFO} from '../../lib/constants';
import {initExamCache, getMoreExamsInfo} from '../../api/exam';

export function initExamCacheAction(params) {
    return {
        type: INIT_EXAMCACHE,
        promise: initExamCache(params)
    }
}

export function getMoreExamsInfoAction(params) {
console.log('获取更多的exams');
debugger;
    return {
        type: GET_MORE_EXAMS_INFO,
        promise: getMoreExamsInfo(params)
    }
}

export function testAction() {
    return {
        type: 'test'
    }
}

export function testPromiseAction() {
    return {
        type: 'testPromise',
        promise: Promise.resolve({testList: [{name: 'liu'}, {name: 'cong'}]})
    }
}

export function testAsyncAction() {
    return function(dispatch, getState) {
        setTimeout(function() {
            dispatch({type: 'testAsync_SUCCESS', testList: [{name: 'liu'}, {name: 'cong'}]})
        }, 1000)
    }
}
