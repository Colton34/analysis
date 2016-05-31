/*
* @Author: HellMagic
* @Date:   2016-05-30 18:32:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 13:42:13
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/custom-analysis-state';
var initialState = new InitialState;

import {
    ADD_PAPER_INFO_SUCCESS,
    SUBTRACT_PAPER_INFO
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case ADD_PAPER_INFO_SUCCESS:
            //如果是cached的，那么只更新paperInfo，如果不是cached的那么更新paperCache和paperInfo。注意：pid是ObjectId，id是paperId
            var nextState = state.setIn(['papersInfo', action.res.pid], action.res);
            if(!action.isCached) nextState = nextState.setIn(['papersCache', action.res.pid], action.res);
            return nextState;
        case SUBTRACT_PAPER_INFO:
            return state.set('papersInfo', state.papersInfo.delete(action.pid));
    }
    return state;
}
