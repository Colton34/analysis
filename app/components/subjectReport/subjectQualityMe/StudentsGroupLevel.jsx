import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function StudentsGroupLevel({currentSubject, reportDS}) {
    var paperFullMark = reportDS.examPapersInfo.toJS()[currentSubject.pid].fullMark;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];

    var tableData = getTableDS(paperFullMark, currentPaperStudentsInfo);
    var summaryInfo = getSummaryInfo(tableData);
    return (
        <div>
            <div style={{margin: '30px 0'}}>
                <span className={commonClass['sub-title']}>学生学科水平的分布</span>
                <span className={commonClass['title-desc']}>按成绩高低将学生等分为10组（第1组成绩最高，第10组成绩最低），高分段学生密度越大，表现越有优势，低分段学生密度越大，则需要教学中注意帮助这部分学生突破</span>
            </div>

            <TableView tableData={tableData}/>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <p>各班中有的学科成绩较高的学生比较密集，有的学科成绩较低的学生比较密集，如下所示：</p>
                <p>高分段学生密集的班级排名：<span style={{color: colorsMap.B03}}>{_.join(summaryInfo.high.map(item => {return item.className}), '、')}</span>。其中<span style={{color: colorsMap.B03}}>{summaryInfo.high[0].className}</span>高分段人数最多。</p>
                <p>低分段学生密集的班级排名：<span style={{color: colorsMap.B03}}>{_.join(summaryInfo.low.map(item => {return item.className}), '、')}</span>。其中<span style={{color: colorsMap.B03}}>{summaryInfo.low[0].className}</span>低分段人数最多，需要注意。</p>
                <div>学生学科成绩两极分化的班级：{summaryInfo.polar.length ? <span style={{color: colorsMap.B03}}>{_.join(summaryInfo.polar, '、')}</span> : '无'}。</div>
            </div>
        </div>
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

 function getSummaryInfo(tableData) {
     var summaryInfo = {high: [], low: [], polar: []};
     var classNum = tableData.length - 1;
     for (let i = 1 ; i <= classNum; i++) {
         var data = tableData[i].slice(1);
         var highSum = _.sum(_.take(data,3));
         var lowSum = _.sum(_.takeRight(data, 3));
         var className = tableData[i][0];
         if (highSum > lowSum) {
             summaryInfo.high.push({className: className, count: highSum});
         } else if (highSum < lowSum) {
             summaryInfo.low.push({className: className, count: lowSum});
         } else {
             summaryInfo.polar.push(className);
         }
         summaryInfo.high = _.orderBy(summaryInfo.high, ['count'], ['desc']);
         summaryInfo.low = _.orderBy(summaryInfo.low, ['count'], ['desc']);
     }
     return summaryInfo;
 }
