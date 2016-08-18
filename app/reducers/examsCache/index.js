/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:54
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-18 11:17:00
*/

'use strict';
import _ from 'lodash';
import {List} from 'immutable';
import InitialState from '../../states/exams-cache-state';

var initialState = new InitialState;

import {
    GET_MORE_EXAMS_SUCCESS,
    INIT_EXAMCACHE_SUCCESS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_EXAMCACHE_SUCCESS:
            var newExamsInfoCache;
            _.each(action.res.examsInfoCache, (obj) => {
                newExamsInfoCache = (List.isList(newExamsInfoCache)) ? newExamsInfoCache.push(obj) : state.examsInfoCache.push(obj);
            });
            console.log('初始化examInfo和examList完毕，去显示');
            // debugger;
            return state.set('examList', List(action.res.examList)).set('examsInfoCache', newExamsInfoCache).set('haveInit', true);

        case GET_MORE_EXAMS_SUCCESS:
            var newExamsInfoCache;
            _.each(action.res, (obj) => {
                newExamsInfoCache = (List.isList(newExamsInfoCache)) ? newExamsInfoCache.push(obj) : state.examsInfoCache.push(obj);
            });
            console.log('获取更多更新的exams完毕');
            debugger;
            return state.set('examsInfoCache', newExamsInfoCache);
    }
    return state;
}
