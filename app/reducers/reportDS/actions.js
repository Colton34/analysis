/*
* @Author: HellMagic
* @Date:   2016-08-02 16:38:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:32:36
*/

'use strict';

import {initReportDS} from '../../api/exam';
import {
    INIT_REPORT_DS
}

export function initReportDSAction(params) {
    return {
        type: INIT_REPORT_DS,
        promise: initReportDS(params)
    }
}
