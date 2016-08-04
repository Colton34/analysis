/*
* @Author: HellMagic
* @Date:   2016-08-04 12:45:38
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-04 12:48:36
*/

'use strict';

import {
    CHANGE_CLASS
} from '../../lib/constants';

export function changeLevelAction(className) {
    return {
        type: CHANGE_CLASS,
        className: className
    }
}
