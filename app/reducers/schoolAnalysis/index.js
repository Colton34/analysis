/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:31:17
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/school-analysis-state';
var initialState = new InitialState;

import {
    CHANGE_LEVEL,
    CHANGE_LEVEL_BUFFERS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case CHANGE_LEVEL:
            var newLevelBuffers = _.map(action.levels, (value, key) => 5);
            return state.set('levels', action.levels).set('levelBuffers', newLevelBuffers).set('forseUpdate', !state.forseUpdate);
        case CHANGE_LEVEL_BUFFERS:
            return state.set('levelBuffers', action.levelBuffers);
    }
    return state;
}

