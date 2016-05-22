/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-22 20:15:19
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/school-analysis-state';
var initialState = new InitialState;

import {
    FETCH_SCHOOL_ANALYSIS_DATA_SUCCESS,
    INIT_SCHOOL_ANALYSIS_SUCCESS,
    CHANGE_LEVEL
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case FETCH_SCHOOL_ANALYSIS_DATA_SUCCESS:
            var nextState;
            _.each(action.res, function(value, key) {
                nextState = (nextState) ? nextState.set(key, value) : state.set(key, value);
            });
            return nextState;
        case CHANGE_LEVEL:
            return state.set('levels', action.levels);
    }
    return state;
}

