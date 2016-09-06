//考试基本情况
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import {makeSegmentsDistribution, makeSegments} from '../../../sdk';
import StatisticalLib from 'simple-statistics';

//components
import InfoCards from './InfoCards';
import TrendChart from './TrendChart';
import AnalysisFactor from './analysisFactor';

export default function Trend({reportDS, currentSubject}) {

    var examPapersInfo = reportDS.examPapersInfo.toJS();
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
    var currentPaperInfo = examPapersInfo[currentSubject.pid];
    var currentPaperStudentsInfo = allStudentsPaperMap[currentSubject.pid];

    var summaryInfo = getSummaryInfo(currentPaperStudentsInfo);

    return (
        <div id='totalScoreTrend' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>考试基本情况</span>
            <span className={commonClass['title-desc']}>帮助您整体把握本次考试 {currentSubject.subject} 学科的基本情况</span>

            <InfoCards currentPaperInfo={currentPaperInfo} currentPaperStudentsInfo={currentPaperStudentsInfo} />
            <TrendChart currentPaperInfo={currentPaperInfo} currentPaperStudentsInfo={currentPaperStudentsInfo}></TrendChart>
            <div className={subjectReportStyle['analysis-conclusion']}>
                <div>分析诊断：</div>
                <div>{currentPaperInfo.subject}{summaryInfo}</div>
            </div>
            <AnalysisFactor currentPaperInfo={currentPaperInfo} currentPaperStudentsInfo={currentPaperStudentsInfo} />
            <div className={commonClass['analysis-conclusion']}></div>
        </div>
    )
}



//=================================================  分界线  =================================================



//Note: 这里是classStudents，那么需要currentPaperStudentsInfo
function getSummaryInfo(currentPaperStudentsInfo) {
    var skewness = _.round(StatisticalLib.sampleSkewness(_.map(currentPaperStudentsInfo, (obj) => obj.score)), 2);
    if(skewness < 0.5) {
        return '学科试卷难度过大，学科要求过高，对中低端学生给予的展现空间不足。';
    } else if(skewness < 0.6) {
        return '学科试卷整体要求较高，试卷难度较难。';
    } else if(skewness < 0.7) {
        return '学科试卷要求有点偏高，试卷难度偏难';
    } else if(skewness < 0.8) {
        return '学科试卷比较适应学生群体水平，考试要求属正常范围。';
    } else if(skewness < 0.9){
        return '学科要求偏宽，试卷整体难度偏容易。';
    }else
        return '学科试卷难度过容易，不利于中高端学生的学业水平展现。';

}
