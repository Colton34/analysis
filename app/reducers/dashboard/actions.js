/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   liucong
* @Last Modified time: 2016-08-03 15:39:51
*/

'use strict';


import Immutable from 'immutable';

import {initDashboardData} from '../../api/exam';
import {
    INIT_DASHBOARD
} from '../../lib/constants';

export function initDashboardAction(params) {
    return {
        type: INIT_DASHBOARD,
        promise:initDashboardData(params)
    }
}
