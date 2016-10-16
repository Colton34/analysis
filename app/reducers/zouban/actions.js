/*
* @Author: HellMagic
* @Date:   2016-10-15 11:38:17
* @Last Modified by:   liucong
* @Last Modified time: 2016-10-16 11:32:21
*/

'use strict';

import {initZoubanDS} from '../../api/exam';
import {INIT_ZOUBAN_DS} from '../../lib/constants';

export function initZoubanDSAction(params) {
    return {
        type: INIT_ZOUBAN_DS,
        promise: initZoubanDS(params)
    }
}
