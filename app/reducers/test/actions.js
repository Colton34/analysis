/*
* @Author: HellMagic
* @Date:   2016-08-01 08:59:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-01 09:03:24
*/

'use strict';

import {TEST_CHANGE_ONE, TEST_CHANGE_TWO} from '../../lib/constants';

export function changeOne() {
    return {
        type: TEST_CHANGE_ONE,
        data: 'one'
    }
}

export function changeTwo() {
    return {
        type: TEST_CHANGE_TWO,
        data: 'two'
    }
}
