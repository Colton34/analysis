/*
* @Author: HellMagic
* @Date:   2016-04-09 22:26:48
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 16:25:48
*/

'use strict';


import Immutable from 'immutable';

import {fetchDashboardData} from '../../api/exam';
import {
    INIT_DASHBOARD
} from '../../lib/constants';

export function initDashboardAction(params) {
    return {
        type: INIT_DASHBOARD,
        promise:fetchDashboardData(params)
    }
}
