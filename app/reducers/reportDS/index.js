/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:11
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-28 09:15:42
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/report-state';
var initialState = new InitialState;

import {
    INIT_REPORT_DS_SUCCESS,
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS,
    DISABLE_HAVE_INIT
} from '../../lib/constants';

import {Map, List} from 'immutable';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.mergeDeep(state);

    switch(action.type) {
        case INIT_REPORT_DS_SUCCESS:
            var nextState;
            _.each(action.res, function(value, key) {
                value = (Map.isMap(initialState[key])) ? Map(value) : (List.isList(initialState[key]) ? List(value): value);
                nextState = (nextState) ? nextState.set(key, value) : state.set(key, value);
            });
            return nextState;
        case CHANGE_LEVEL:
            var newLevelBuffers = _.map(action.data.levels, (value, key) => 10);
            return state.set('levels', Map(action.data.levels)).set('subjectLevels', Map(action.data.subjectLevels)).set('levelBuffers', List(newLevelBuffers)).set('forseUpdate', !state.forseUpdate);
        case CHANGE_LEVEL_BUFFERS:
            return state.set('levelBuffers', List(action.levelBuffers));
        case DISABLE_HAVE_INIT:
            var newState = state.set('haveInit', false);
            debugger;
            return newState;
    }
    return state;
}

