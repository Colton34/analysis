/*
* @Author: HellMagic
* @Date:   2016-05-04 20:39:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 21:02:12
*/

'use strict';

import _ from 'lodash';

import {fetchHomeData} from '../../api/exam';
import {
    INIT_HOME
} from '../../lib/constants';

export function initHomeAction(params) {
    return {
        type: INIT_HOME,
        promise: fetchHomeData(params)
    }
}
