import _ from 'lodash';
import React, { PropTypes } from 'react';

import {NUMBER_MAP as numberMap} from '../../../lib/constants';

export default function StudentsGroupLevel({currentSubject, reportDS}) {
    var paperFullMark = reportDS.examPapersInfo.toJS()[currentSubject.pid].fullMark;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];

    var theTableDS = getTableDS(paperFullMark, currentPaperStudentsInfo);
    debugger;

    return (
        <div>待填充</div>
    )
}

function getTableDS(paperFullMark, currentPaperStudentsInfo) {
    var tableDS = [];
    var tableHeaders = _.map(_.range(10), (i) => '第' + numberMap[i+1] + '组');
    tableHeaders.unshift('班级');
    tableDS.push(tableHeaders);

    var segmentStudents = getSegmentStudents(currentPaperStudentsInfo);
    segmentStudents = _.groupBy(segmentStudents, 'class_name');
    _.each(segmentStudents, (students, classKey) => {
        var classSegmentGroup = _.groupBy(students, 'index');
        var classSegmentCounts = _.map(_.range(10), (i) => {
            return ((classSegmentGroup[i]) ? classSegmentGroup[i].length : 0);
        });
        classSegmentCounts.unshift(classKey + '班');
        tableDS.push(classSegmentCounts);
    });

    return tableDS;
}

function getSegmentStudents(currentPaperStudentsInfo, groupLength=10) {
    var result = [], flagCount = currentPaperStudentsInfo.length, totalStudentCount = currentPaperStudentsInfo.length;

    _.each(_.range(groupLength), (index) => {
        var groupCount = (index == groupLength-1) ? flagCount : (_.ceil(_.divide(totalStudentCount, groupLength)));
        var currentGroupStudents = _.slice(currentPaperStudentsInfo, (flagCount - groupCount), flagCount);
        _.each(currentGroupStudents, (obj) => obj.index = index);
        result = _.concat(result, currentGroupStudents);
        flagCount -= groupCount;
    });
    return result;
}



function makeGroupStudentsInfo(students, groupLength=10) {
    var result = {}, flagCount = students.length, totalStudentCount = students.length;
    _.each(_.range(groupLength), function(index) {
        var groupCount = (index == groupLength-1) ? flagCount : (_.ceil(_.divide(totalStudentCount, groupLength)));
        //当前组的学生数组：
        var currentGroupStudents = _.slice(students, (flagCount - groupCount), flagCount);
        //对当前组的学生按照班级进行group
        var groupStudentsGroupByClass = currentGroupStudents[0]['class_name']  ? _.groupBy(currentGroupStudents, 'class_name')  : _.groupBy(currentGroupStudents, 'class');
        flagCount -= groupCount;
        result[index] = { groupCount: groupCount, classStudents: groupStudentsGroupByClass, flagCount: flagCount };
    });
    return result;
}
