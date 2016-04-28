/*
* @Author: HellMagic
* @Date:   2016-04-27 19:33:24
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 19:34:22
*/

'use strict';

export function getMockUser() {
    return Promise.resolve({
        name: 'HellMagic',
        age: 10
    })
}
