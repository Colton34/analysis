/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:54
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-24 16:22:13
*/

'use strict';
import _ from 'lodash';
import {Map} from 'immutable';
import InitialState from '../../states/exams-cache-state';

var initialState = new InitialState;

import {
    EXAMS_CACHE_IS_LOADING,

    GET_MORE_EXAMS_INFO_REQUEST,
    GET_MORE_EXAMS_INFO_SUCCESS,

    INIT_EXAMCACHE_REQUEST,
    INIT_EXAMCACHE_SUCCESS,
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_EXAMCACHE_REQUEST:
        case GET_MORE_EXAMS_INFO_REQUEST:
            return state.set('isLoading', true);
        case INIT_EXAMCACHE_SUCCESS:
            var newClassExamsList = state.examsListCache.set(action.res.currentClass, action.res.examsList);
            var newClassExamsInfoCache = state.examsInfoCache.set(action.res.currentClass, action.res.examsInfoCache);
            return state.set('examsListCache', newClassExamsList).set('examsInfoCache', newClassExamsInfoCache).set('isLoading', false);
        case GET_MORE_EXAMS_INFO_SUCCESS:
            var newExamsInfoCache = state.examsInfoCache.set(action.res.currentClass, _.concat(state.examsInfoCache.get(action.res.currentClass, action.res.newExamsInfo)));
            debugger;
            return state.set('examsInfoCache', newExamsInfoCache).set('isLoading', false);
    }
    return state;
}

//For Test:
        // case 'test':
        //     console.log('reducer test success');
        //     return state.set('test', 'b');
        // case 'testPromise_SUCCESS':
        //     console.log('reducer testPromise success');
        //     debugger;
        //     return state.set('testList', action.res.testList);
        // case 'testAsync_SUCCESS':
        //     console.log('reducer testAsync success');
        //     debugger;
        //     return state.set('testList', action.testList);
