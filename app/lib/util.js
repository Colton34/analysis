/*
* @Author: HellMagic
* @Date:   2016-04-29 15:02:12
* @Last Modified by:   liucong
* @Last Modified time: 2016-08-04 15:15:47
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

export function initParams(custom, params, location) {
    return _.merge({}, custom, params, ((location) ? location.query : {}));
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

export function downloadTable(headSeq, headSelect, headerMapper, renderRows) {
    var validColumnKeys = [], validColumnNames = [];
    _.each(headSeq, (headKey) => {
        if(headSelect[headKey]) {
            validColumnKeys.push(headKey);
            var keys = _.split(headKey, '_');
            var names = _.map(keys, (k) => headerMapper[k]);
            var theName = _.join(_.reverse(names), '');
            validColumnNames.push(theName);
        }
    });
    //从每一行学生数据中拿到需要的数据
    var validStudentInfoMatrix = _.map(renderRows, (studentRowObj) => {
        return _.map(validColumnKeys, (key) => studentRowObj[key]);
    });
    var url = '/api/v1/file/export/rank/report';
    var inputKeys = "<input type='hidden' name='" + 'keys' + "' value='" + JSON.stringify(validColumnKeys) + "' />";
    var inputNames = "<input type='hidden' name='" + 'names' + "' value='" + JSON.stringify(validColumnNames) + "' />";
    var inputMatrix = "<input type='hidden' name='" + 'matrix' + "' value='" + JSON.stringify(validStudentInfoMatrix) + "' />";
    $('<form action="' + url + '" method="' + ('post') + '">' + inputKeys + inputNames + inputMatrix + '</form>')
        .appendTo('body').submit().remove();
}
