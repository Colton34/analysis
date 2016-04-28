/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-28 16:11:29
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
}


export function hi() {
    return {
        type: 'hi',
        data: 'gooooo'
    }
}
