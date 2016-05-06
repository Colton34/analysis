/*
* @Author: HellMagic
* @Date:   2016-04-29 15:02:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 20:10:02
*/

'use strict';

import _ from 'lodash';

export function convertJS(data) {
    return JSON.parse(JSON.stringify(data));
    // var data = JSON.stringify(this.props.dashboard.examGuide);
    // var jsdata = JSON.parse(data);
}

export function initParams(params, location, other) {
    params = params || {};
    var query = location.query || {};
    params = _.merge(params, query);
    if(other && _.isObject(other)) params = _.merge(params, other);
    return params;
}
