//重点学生信息
import _ from 'lodash';
import React, { PropTypes } from 'react';


export default function ImportStudentInfo({reportDS, classStudents, classStudentsPaperMap}) {

}

//=================================================  分界线  =================================================
//算法：
    //排名前5的学生，和排名后5的学生。
    //重点求解此学生 各个科目 在班级中的排名
    //allStudentsPaperMap 排序？ 找到目标学生（根据student id） 得到其这一科目的排名
function getDS(classStudents, classStudentsPaperMap, headers) {
    var classStudentsCount = classStudents.length;
    var betterStudents = _.reverse(_.takeRight(classStudents, 5)), worseStudents = _.take(classStudents, 5);
    var betterTableDS = getStudentSubjectRankInfo(betterStudents, classStudentsPaperMap, headers, true, classStudentsCount);
    var worseTableDS = getStudentSubjectRankInfo(worseStudents, classStudentsPaperMap, headers, false, classStudentsCount);
    debugger;
}

function getTableHeader(headers, classPapersMap) {
//只能是此班级考试的科目
}

function getStudentSubjectRankInfo(students, classStudentsPaperMap, headers, isGood, classStudentsCount) {
    //横向扫描，一个学生的维度
    var tableDS = [];
    _.map(students, (studentObj, index) => {
        var rowData = [];
        var totalScoreRank = (isGood) ? (index+1) : (classStudentsCount-index);
        rowData.push(totalScoreRank);
        var subjectScoreRanks = [];
        _.each(headers, (headerObj, index) => {
            var classPaperStudents = classStudentsPaperMap[headerObj.id];
            if(!classPaperStudents) return;
            var targetIndex = _.findIndex(classPaperStudents, (s) => s.id == studentObj.id);
            var totalCount = classPaperStudents.length;
            subjectScoreRanks.push((totalCount - targetIndex));
        });
        rowData = _.concat(rowData, subjectScoreRanks);
        rowData.unshift(studentObj.name);
        tableDS.push(rowData);
    });
    return (isGood) ? tableDS : _.reverse(tableDS);
}


// function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
//     var result = {};
//     _.each(allStudentsPaperMap, (students, pid) => {
//         var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
//         if(classStudents || classStudents.length > 0) result[pid] = classStudents;
//     });
//     return result;
// }
