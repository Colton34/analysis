//学科平均分排名
import _ from 'lodash';
import React, { PropTypes } from 'react';

export default  function MeanScoreRank({reportDS}) {

}

//=================================================  分界线  =================================================
// export default  function MeanScoreRank({reportDS}) {
//     var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), gradeName = reportDS.examInfo.toJS().gradeName;
//     var theDS = getDS(allStudentsPaperMap, examClassesInfo, examPapersInfo, gradeName);
//     debugger;
// }

//以各个学科为一级key，班级为二级key组织数据。计算每个学科下面每个班级当前学科的平均分
function getDS(allStudentsPaperMap, examClassesInfo, examPapersInfo, gradeName) {
    var result = {};
    var theClasses, theMeans;
    _.each(allStudentsPaperMap, (paperStudents, pid) => {
        result[pid] = {}, theClasses = [], theMeans = [];
        var classPaperStudentMap = _.groupBy(paperStudents, 'class_name');
        _.each(examClassesInfo, (classObj, className) => {
            var classPaperStudents = classPaperStudentMap[className];
            if(classPaperStudents && classPaperStudents.length > 0) {
                theClasses.push(gradeName + className + '班');
                theMeans.push(_.round(_.mean(_.map(classPaperStudents, (studentPaperObj) => studentPaperObj.score)), 2));
            }
        });
        result[pid].theClasses = theClasses;
        result[pid].theMeans = theMeans;
    });
    return result;
}

function temp(currentPaper, allStudentsPaperMap) {

}
