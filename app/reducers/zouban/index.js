/*
* @Author: HellMagic
* @Date:   2016-10-15 11:38:23
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 17:29:19
*/

'use strict';

import {List, Map} from 'immutable';
import InitialState from '../../states/zouban-state';

import {INIT_ZOUBAN_DS_SUCCESS} from '../../lib/constants';

var initialState = new InitialState;

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_ZOUBAN_DS_SUCCESS:
            var nextState;
            _.each(action.res, function(value, key) {
                value = (Map.isMap(initialState[key])) ? Map(value) : (List.isList(initialState[key]) ? List(value): value);
                nextState = (nextState) ? nextState.set(key, value) : state.set(key, value);
            });
            return nextState;
    }
    return state;
}
