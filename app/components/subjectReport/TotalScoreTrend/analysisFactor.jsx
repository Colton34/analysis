import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';

//TODO:会缺少阿尔法信度系数和相关系数，看一下PRD。
export default function AnalysisFactor({currentPaperInfo, currentPaperStudentsInfo}) {
    var gradeStudentsCurrentPaperScores = _.map(currentPaperStudentsInfo, (obj) => obj.score);//Note:已经排好序了，从小到大
    debugger;

    return (
        <div>
            <span>待渲染</span>
        </div>
    )
}


function getSubjectName({headerObj}) {
    return headerObj.subject;//学科
}
function getFullMark({examPapersInfo, headerObj}) {
    return examPapersInfo[headerObj.id].fullMark;//满分
}
function getMaxScore({paperScores}) {
    return _.max(paperScores);//最高分
}
function getMinScore({paperScores}) {
    return _.min(paperScores);//最低分
}
function getMeanScore({paperScores}) {
    return _.round(_.mean(paperScores), 2);//平均分
}
function getStandardDeviation({paperScores}) {
    return _.round(StatisticalLib.standardDeviation(paperScores), 2);//标准差
}
function getDiscriminationFactor({paperScores}) {
    var sdevia = _.round(StatisticalLib.standardDeviation(paperScores), 2);
    var mean = _.mean(paperScores);
    return _.round(_.divide(sdevia, mean), 2);//差异系数: 标准差/平均分
}
function getDifficulty({paperScores, examPapersInfo, headerObj}) {
    var mean = _.mean(paperScores);
    return _.round(_.divide(mean, examPapersInfo[headerObj.id].fullMark), 2);//难度
}
function getRealStudentCount({examPapersInfo, headerObj, currentClass}) {
    return examPapersInfo[headerObj.id].classes[currentClass];//实考人数
}
function getLostStudentCount({examClassesInfo, currentClass, examPapersInfo, headerObj}) {
    return examClassesInfo[currentClass].students.length - examPapersInfo[headerObj.id].classes[currentClass];//缺考人数
}
