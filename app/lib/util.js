/*
* @Author: HellMagic
* @Date:   2016-04-29 15:02:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-29 15:03:57
*/

'use strict';

export function convertJS(data) {
    return JSON.parse(JSON.stringify(data));
    // var data = JSON.stringify(this.props.dashboard.examGuide);
    // var jsdata = JSON.parse(data);
}
