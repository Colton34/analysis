//学科考试表现

import React, { PropTypes } from 'react';


export default function ExamPerformance(arguments) {

}


//=================================================  分界线  =================================================
//TODO:使用分析库重写。把所有通用的标准数据都列举一下。找到班级的实考人数和缺考人数
function getTableData(examPapersInfo, headers, studentsGroupByClass, examClassesInfo, currentClass) {
    var table = [];
    var currentClassStudents = studentsGroupByClass[currentClass]; //相当于examStudentsInfo
    var currentStudentsPaperMap = _.groupBy(_.concat(..._.map(currentClassStudents, (student) => student.papers)), 'paperid');

    var titleHeader = ['学科', '满分', '最高分', '最低分', '平均分', '标准差', '差异系数', '难度', '实考人数', '缺考人数'];

    table.push(titleHeader);

    var subjectHeaders = headers.slice(1); //去掉排在第一位的id: totalSchool，这样剩下的就都是科目了

    _.each(subjectHeaders, (headerObj, index) => {
        //有多少个科目就有多少行
        var subjectRow = [];
        subjectRow.push(headerObj.subject); //学科
        subjectRow.push(examPapersInfo[headerObj.id].fullMark); //满分
        var paperScores = _.map(currentStudentsPaperMap[headerObj.id], (paper) => paper.score);
        subjectRow.push(_.max(paperScores)); //最高分
        subjectRow.push(_.min(paperScores)); //最低分
        var mean = _.round(_.mean(paperScores), 2);
        subjectRow.push(mean); //平均分
        var sqrt = _.round(Math.sqrt(_.divide((_.sum(_.map(paperScores, (paperScoreItem) => Math.pow((paperScoreItem - mean), 2)))), paperScores.length)), 2);
        subjectRow.push(sqrt); //标准差
        subjectRow.push(_.round(_.divide(sqrt, mean), 2)); //差异系数: 标准差/平均分
        subjectRow.push(_.round(_.divide(mean, examPapersInfo[headerObj.id].fullMark), 2)); //难度
        subjectRow.push(examClassesInfo[currentClass].realStudentsCount); //实考人数
        subjectRow.push(examClassesInfo[currentClass].lostStudentsCount); //缺考人数

        table.push(subjectRow);
    });

    return table;
}
