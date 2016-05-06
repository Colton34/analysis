/*
* @Author: HellMagic
* @Date:   2016-05-04 20:39:14
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 17:58:28
*/

'use strict';


import _ from 'lodash';

import InitialState from '../../states/home-state';
var initialState = new InitialState;

import {
    INIT_HOME_SUCCESS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case 'INIT_HOME_SUCCESS':
            return state.set('examList', action.res).set('haveInit', true);
    }

    return state;
}
