/*
* @Author: HellMagic
* @Date:   2016-04-27 19:33:24
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 18:24:42
*/

'use strict';

import axios from 'axios';
import _ from 'lodash';

var userPath = "/user";

export function fetchMe(params) {
    var url = userPath + '/me';
    return params.request.get(url);
}

export function getMockUser() {
    return Promise.resolve({
        name: 'HellMagic',
        age: 10
    })
}
