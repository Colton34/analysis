/*
* @Author: HellMagic
* @Date:   2016-08-17 08:36:54
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-17 09:05:37
*/

'use strict';
import _ from 'lodash';
import {List} from 'immutable';
import InitialState from '../../states/exams-cache-state';

var initialState = new InitialState;

import {
    GET_MORE_EXAMS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case GET_MORE_EXAMS:
            var newExamsInfoCache;
            _.each(action.res, (obj) => {
                newExamsInfoCache = (List.isList(newExamsInfoCache)) ? newExamsInfoCache.push(obj) : state.examsInfoCache.push(obj);
            });
            return state.set('examsInfoCache', newExamsInfoCache);
    }
    return state;
}
