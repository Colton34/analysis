/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 18:45:24
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/school-analysis-state';
var initialState = new InitialState;

import {
    INIT_SCHOOL_ANALYSIS_SUCCESS,
    FETCH_SCHOOL_ANALYSIS_RAW_DATA_SUCCESS
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case 'FETCH_SCHOOL_ANALYSIS_RAW_DATA_SUCCESS':
            console.log('=================================================');
            // console.log('action.res = ', action.res);
// console.log('keys.length = ', _.keys(action.res.data).length);
//不用反序列化了！
console.log('action.res.data = ', _.keys(action.res.data.classInfo).length);
            // var data = JSON.parse(action.res.data);
            // console.log('size = ', _.size(JSON.parse(action.res.data).studentScoreInfoMap));
            console.log('=================================================');
            return state;
        case 'TESTDATA':
            console.log('TESTDATA OK');
            return state;
    }

    return state;
}

