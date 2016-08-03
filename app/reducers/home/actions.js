/*
* @Author: HellMagic
* @Date:   2016-05-04 20:39:20
* @Last Modified by:   liucong
* @Last Modified time: 2016-08-03 15:39:22
*/

'use strict';

import _ from 'lodash';

import {initHomeData} from '../../api/exam';
import {
    INIT_HOME
} from '../../lib/constants';

export function initHomeAction(params) {
    return {
        type: INIT_HOME,
        promise: initHomeData(params)
    }
}
