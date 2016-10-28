/*
* @Author: HellMagic
* @Date:   2016-10-13 21:12:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-28 18:58:04
*/

'use strict';

import {List} from 'immutable';
import InitialState from '../../states/helper-state';

import {FETCH_EQUIVALENT_SCORE_INFO_LIST_SUCCESS} from '../../lib/constants';

var initialState = new InitialState;

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case FETCH_EQUIVALENT_SCORE_INFO_LIST_SUCCESS:
            return state.set('equivalentScoreInfoList', List(action.res)).set('haveInit', true);
    }
    return state;
}
