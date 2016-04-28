/*
* @Author: HellMagic
* @Date:   2016-04-08 17:16:06
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-28 11:42:44
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/dashboard-state';

var initialState = new InitialState;

import {
    INIT_GLOBAL_GUIDE_SUCCESS,
    SOME_HOME_ONE,
    SOME_HOME_TWO,
    SOME_HOME_THREE
} from '../../lib/constants';


export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_GLOBAL_GUIDE_SUCCESS:
            return state.set('examGuide', action.res);
        case SOME_HOME_ONE:
        case SOME_HOME_TWO:
        case SOME_HOME_THREE:
            return state;
    }

    return state;
}
