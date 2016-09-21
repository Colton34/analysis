import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function TableContentModule({reportDS, allStudentBySchool, levelStudentsInfoBySchool}) {
    // var levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS();
    var levels = reportDS.levels.toJS(), allStudentsCount = reportDS.examStudentsInfo.toJS().length;
    var theTableDS = getTableDS(levels, allStudentsCount, levelStudentsInfoBySchool, allStudentBySchool);
    return (
        <div>待填充</div>
   )
}


/*
levels都是{ 0: , 1: , 2: } -- 保持Map的形式，防止有的level没有值，使用index就窜了
 */
function getTableDS(levels, allStudentsCount, levelStudentsInfoBySchool, allStudentBySchool) {
    var tableDS = [];
    var totalSchoolLevelInfo = {};
    _.each(levels, (levelObj, levelKey) => {
        totalSchoolLevelInfo[levelKey] = levelObj.count;
    });
    var totalSchoolRow = getLevelItem(levels, totalSchoolLevelInfo, allStudentsCount);
    totalSchoolRow.unshift('联考全体');
    tableDS.push(totalSchoolRow);

    _.each(levelStudentsInfoBySchool, (levelSchoolStudentsInfo, schoolName) => {
        var currentSchoolLevelInfo = _.pick(levelSchoolStudentsInfo, _.keys(levels));
        var currentSchoolRow = getLevelItem(levels, currentSchoolLevelInfo, allStudentBySchool[schoolName].length);
        currentSchoolRow.unshift(schoolName);
        tableDS.push(currentSchoolRow);
    });

    return tableDS;
}


function getLevelItem(levels, levelCountInfo, baseCount) {
    //计算sumCount和sumPercentage。注意levels中的percentage即是sumPercentage
    var result = [];
    _.each(levels, (levelObj, levelKey) => {
        var count = levelCountInfo[levelKey] || 0;
        var sumCount = _.sum(_.values(_.pickBy(levelCountInfo, (v, k) => k >= levelKey)));
        var sumPercentage = _.round(_.multiply(_.divide(sumCount, baseCount), 100), 2);
        result = _.concat(result, [count, sumCount, sumPercentage]);
    });
    return result;
}
