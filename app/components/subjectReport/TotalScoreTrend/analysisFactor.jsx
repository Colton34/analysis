import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import StatisticalLib from 'simple-statistics';

var functionList = [getSubjectName, getRealStudentCount, getLostStudentCount, getFullMark, getMaxScore, getMinScore, getMeanScore, getStandardDeviation, getDiscriminationFactor, getDifficulty];

//TODO:会缺少阿尔法信度系数和相关系数，看一下PRD。
export default function AnalysisFactor({currentPaperInfo, currentPaperStudentsInfo}) {
    var paperScores = _.map(currentPaperStudentsInfo, (obj) => obj.score);//Note:已经排好序了，从小到大
    var tableData = [['科目', '参考总人数', '缺考人数', '满分', '最高分', '最低分', '平均分', '标准差', '差异系数', '难度'], []];
    _.forEach(functionList, func => {
        tableData[1].push(func({currentPaperInfo, paperScores}));
    })

    return (
        <div>
            <div style={{marginBottom: 30}}>
                <span className={commonClass['sub-title']}>学科考试常用分析指标</span>
                <span className={commonClass['title-desc']}>观察本次考试的常用分析指标，结合年级及班级自身情况，发现本学科教学信息</span>
            </div>
            <TableView tableData={tableData}/>
        </div>
    )
}


function getSubjectName({currentPaperInfo}) {
    return currentPaperInfo.subject;//学科
}
function getFullMark({currentPaperInfo}) {
    return currentPaperInfo.fullMark;//满分
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
function getDifficulty({paperScores, currentPaperInfo}) {
    var mean = _.mean(paperScores);
    return _.round(_.divide(mean, currentPaperInfo.fullMark), 2);//难度
}
function getRealStudentCount({currentPaperInfo}) {
    return currentPaperInfo.realStudentsCount;//实考人数
}
function getLostStudentCount({currentPaperInfo}) {
    return currentPaperInfo.lostStudentsCount;//缺考人数
}
