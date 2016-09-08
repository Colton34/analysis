import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function DisadvantagedSubjectModule({currentSubject, reportDS}) {
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), currentPaperId = currentSubject.pid;
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentPaperId];
    var {categories, disadvantagedSubjectInfo} = getCurrentSubjectDisadvantagedInfo(allStudentsPaperMap, examStudentsInfo, currentPaperId, currentPaperInfo);

    return (
        <div>待填充</div>
    )
}

//遍历每一个examStudentsInfo中的学生
    //遍历sutdentSubjectRankMaps获取到当前学生各个学科的排名信息，并进行排序。判断最后名次的学科是不是当前学科--如果是，则添加到CurrentDisadvantagedSubjectStudents数组里
//最终对CurrentDisadvantagedSubjectStudents数组针对class_name进行group
function getCurrentSubjectDisadvantagedInfo(allStudentsPaperMap, examStudentsInfo, currentPaperId, currentPaperInfo) {
    var currentPaperClasses = currentPaperInfo.realClasses;
    var gradeDisadvantagedSubjectStudents = [], result = {};
    var sutdentSubjectRankMaps = _.map(allStudentsPaperMap, (paperStudentsInfo, pid) => _.keyBy(paperStudentsInfo, 'id'));
    _.each(examStudentsInfo, (studentObj) => {
        var currentStudentSubjectRankInfo = _.compact(_.map(sutdentSubjectRankMaps, (oneSubjectRankMapInfo) => oneSubjectRankMapInfo[studentObj.id]));
        //rank低就是排名靠前，所以差学科是rank高的，即排名靠后的
        if(currentStudentSubjectRankInfo.length == 0) return;
        var currentStudentDisadvantagedSubjectObj = _.last(_.sortBy(currentStudentSubjectRankInfo, 'rank'));
        if(currentStudentDisadvantagedSubjectObj.paperid == currentPaperId) gradeDisadvantagedSubjectStudents.push(currentStudentDisadvantagedSubjectObj);
    });
    var classesDisadvantagedSubjectStudentsMap = _.groupBy(gradeDisadvantagedSubjectStudents, 'class_name');
    var classDisadvantagedStudents = _.map(currentPaperClasses, (classKey) => (classesDisadvantagedSubjectStudentsMap[classKey] || []));

    var categories = _.map(currentPaperClasses, (classKey) => classKey+'班');
    categories.unshift('全年级');

    classDisadvantagedStudents.unshift(gradeDisadvantagedSubjectStudents);

    return {
        categories: categories,
        disadvantagedSubjectInfo: classDisadvantagedStudents
    }
}


