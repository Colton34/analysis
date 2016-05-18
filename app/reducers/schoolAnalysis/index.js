/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 17:03:38
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/school-analysis-state';
var initialState = new InitialState;

import {
    FETCH_SCHOOL_ANALYSIS_DATA_SUCCESS,
    INIT_SCHOOL_ANALYSIS_SUCCESS,
    CHANGE_LEVEL
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case 'FETCH_SCHOOL_ANALYSIS_DATA_SUCCESS':
// console.log('action.res.data = ', _.keys(action.res.data.classInfo).length);
            return state;
        case 'TESTDATA':
            console.log('TESTDATA OK');
            return state;
        case CHANGE_LEVEL: 
            return state.set('totalScoreLevel', action.levelList)
    }

    return state;
}

