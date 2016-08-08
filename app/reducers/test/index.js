/*
* @Author: HellMagic
* @Date:   2016-08-01 08:57:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-01 16:22:00
*/

'use strict';

import {TEST_CHANGE_ONE, TEST_CHANGE_TWO} from '../../lib/constants';
import {initOne, initTwo} from '../../states/test-state';
import {Map, List} from 'immutable';

//设计成嵌套的reducer
export function one(state, action) {
    if(_.isUndefined(state)) return initOne;
    if(!(state instanceof Map)) return initOne.merge(state);

    switch(action.type) {
        case TEST_CHANGE_ONE:
            var oldAge = state.getIn(['a', 'age']);
            return state.setIn(['a', 'age'], oldAge+1);
    }

    return state
}

export function two(state, action) {
    if(_.isUndefined(state)) return initTwo;
    if(!(state instanceof List)) return initTwo.merge(state);

    switch(action.type) {
        case TEST_CHANGE_TWO:
            return state.push(0);
    }

    return state;
}
