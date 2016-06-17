/*
* @Author: HellMagic
* @Date:   2016-04-29 15:02:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-14 17:15:18
*/

'use strict';

import _ from 'lodash';

var numberMapper = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十'

}
export function convertJS(data) {
    return JSON.parse(JSON.stringify(data));
}

export function initParams(params, location, other) {
    params = params || {};
    var query = location.query || {};
    params = _.merge(params, query);
    if(other && _.isObject(other)) params = _.merge(params, other);
    return params;
}

export function getNumberCharacter(num) {
    if (!parseInt(num)) return ;
    return numberMapper[num.toString()];
}

export function saveAs(uri) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.href = uri;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}
