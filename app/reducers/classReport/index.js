/*
* @Author: HellMagic
* @Date:   2016-08-04 12:45:32
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-04 12:54:04
*/

'use strict';

import InitialState from '../../states/class-report-state';
var initialState = new InitialState;

import {
    CHANGE_CLASS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.mergeDeep(state);

    switch(action.type) {
        case CHANGE_CLASS:
            return state.set('className', action.className);
    }
    return state;
}
