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
                <div>{summaryInfo}</div>
            </div>
            <AnalysisFactor currentPaperInfo={currentPaperInfo} currentPaperStudentsInfo={currentPaperStudentsInfo} reportDS={reportDS} currentSubject={currentSubject} />
        </div>
    )
}



//=================================================  分界线  =================================================



//Note: 这里是classStudents，那么需要currentPaperStudentsInfo
function getSummaryInfo(currentPaperStudentsInfo) {
    var skewness = _.round(StatisticalLib.sampleSkewness(_.map(currentPaperStudentsInfo, (obj) => obj.score)), 2);
    if(skewness < -0.3) {
        return '以全年级学科平均分来衡量，这次考试本年级高于学科平均分的学生人数较多，相应高分段的学生人数密度来的较大，而低分段学生的成绩拉扯全年级本学科平均分较为显著，'
        '请学科组长与任课老师多关注低端的学生。鼓励他们提高总分水平，极有利于提高本班总平均分水平。';
    } else if(skewness < -0.5) {
        return '以全年级学科平均分来衡量，这次考试全年级高于学科平均分的学生人数稍多一点，相应高分段的学生密度还是大一些。低分段学生的成绩对全年级学科分有一定的影响，鼓励他们提高总分水平，有利于提高全年级的本学科总平均水平。';
    } else if(skewness < 0.05) {
        return '以全年级本学科平均分来衡量，这次考试本班处于平均分两边的学生人数基本相当。总分分布比较对称。';
    } else if(skewness < 0.3) {
        return '以全年级学科平均分来衡量，这次考试全年级高于平均分的学生人数比平均分以下学生人数稍少一点，相应低分段学生人数密度稍大一些。但是高分度学生的总分水平比较给力，他们对全年级学科平均分的提高有较大的贡献。';
    } else  return '以全年级总分平均分来衡量，这次考试全年级低于平均分的学生人数较多，相应高分段学生人数密度来的较小。但是高分度学生的总分水平很给力，他们对全年级学科平均分的保持较高有极大的贡献。';

}
