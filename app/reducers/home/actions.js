/*
* @Author: HellMagic
* @Date:   2016-05-04 20:39:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 17:21:53
*/

'use strict';

import _ from 'lodash';

import {fetchHomeData} from '../../api/exam';
import {serverInitHome} from '../../../server/server-render';
import {
    INIT_HOME
} from '../../lib/constants';

export function clientInitHomeAction(params) {
    return {
        type: INIT_HOME,
        promise:initHomeData(params)
    }
}

export function serverInitHomeAction(params) {
    return {
        type: INIT_HOME,
        promise: serverInitHome(params)
    }
}

