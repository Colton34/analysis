/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 20:56:14
*/

'use strict';

import {
    INIT_GLOBAL_GUIDE
} from '../../lib/constants';

import Immutable from 'immutable';

import {getMockExamGuide} from '../../api/exam';

export function initExamGuide() {
    return {
        type: INIT_GLOBAL_GUIDE,
        promise: getMockExamGuide()
    }

    // return dispatch => {
    //     return getMockExamGuide()
    //         .then((resData) => {
    //             dispatch({type: INIT_GLOBAL_GUIDE_SUCCESS, payload: { data: resData }})
    //         })
    //         .catch((error) => {
    //             //设计：全局的Action去处理error
    //             console.log('home action initHome error: ', error);
    //         })
    //     ;
    // }
}


