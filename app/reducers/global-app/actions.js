/*
* @Author: HellMagic
* @Date:   2016-04-11 19:41:24
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 18:26:35
*/

'use strict';

import {
    INIT_USER_ME
} from '../../lib/constants';

import {fetchMe} from '../../api/user';

export function initUser(params) {
    return {
        type: INIT_USER_ME,
        promise: fetchMe(params)
    }
}


