/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:11
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:23:43
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/report-state';
var initialState = new InitialState;

import {
    INIT_REPORT_DS_SUCCESS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_REPORT_DS_SUCCESS:
            var nextState;
            _.each(action.res, function(value, key) {
                nextState = (nextState) ? nextState.set(key, value) : state.set(key, value);
            });
            return nextState;
    }
    return state;
}

