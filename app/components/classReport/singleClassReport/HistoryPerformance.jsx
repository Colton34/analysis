//历史表现比较。注意：这个还没有考虑好！！！
import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';

export default function ImportStudentInfo({reportDS, classStudents, classStudentsPaperMap}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
    var result = getExamZScore(examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, headers);
    debugger;
}


//=================================================  分界线  =================================================
//z-score: (班级平均分-全校平均分)/标准差  标准差：各个班级平均分最为数组
//默认情况下：连续的  同等性质的

//Note: 排名率？不清楚，暂时不做


function getExamsZScore(exams) {
    _.each(exams, (examObj) => {
        //(班级平均分) - 学校平均分 / 学校级别的标准差

    })
}

//设计：走服务端异步计算数据。。。

//如果对比多场考试，多场考试考了不同的科目，怎么对比，怎么显示（几种排列组合）
function getExamZScore(examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, headers) {
    var gradeScores, classMean, gradeMean, gradeStandardDeviation, zScore;
    var result = [];
    _.each(headers, (headerObj, index) => {
        if(headerObj.id == 'totalScore') {
            gradeScores = _.map(examStudentsInfo, (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudents, (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation);
            result.push(zScore);
        } else {
            var currentClassPaperStudents = classStudentsPaperMap[headerObj.id];
            if(!currentClassPaperStudents) return;
            gradeScores = _.map(allStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation);
            result.push(zScore);
        }
    });
    return result;
}



