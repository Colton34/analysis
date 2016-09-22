import React from 'react';
import _ from 'lodash';
//styles
import commonClass from '../../../../styles/common.css';
// components
import SchoolSubjectPerformance from './SchoolSubjectPerformance';
import SubjectContribution from './SubjectContri';
import ScoreLevel from './ScoreLevel/index';
import ScoreRateDiff from './ScoreRateDiff';

export default function({reportDS}) {
    var headers = reportDS.headers.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examInfo = reportDS.examInfo.toJS();
    var subjectInfoBySchool = getSubjectInfoBySchool(examStudentsInfo, headers, examInfo);
    return (
        <div id='subjectPerformance' className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科考试基本表现</span>
            </div>
            <SchoolSubjectPerformance subjectInfoBySchool={subjectInfoBySchool} headers={headers}/>
            <SubjectContribution subjectInfoBySchool={subjectInfoBySchool} headers={headers}/>
            <ScoreLevel reportDS={reportDS}/>
            <ScoreRateDiff subjectInfoBySchool={subjectInfoBySchool} headers={headers}/>
        </div>
    )
}


/**
 * 按学校、科目统计人数与总分；
 * @param 入参均来自reportDS
 * @return {
 *      total: { //全部学校总体信息
 *          totalScore: {count: x, sum: x, fullMark: x}, //分别表示人数、分数和、该科目满分
 *          pid1: {count: x, sum: x, fullMark: x},
 *          ...
 *      },
 *      schoolName1: { //学校名
 *          totalScore: {count: x, sum: x, fullMark: x}, //分别表示人数、分数和、该科目满分
 *          pid1: {count: x, sum: x, fullMark: x},
 *          ...
 *      },
 *      ...
 *  }
 */
function getSubjectInfoBySchool(examStudentsInfo, headers, examInfo) {
    var data = {};
    var paperidInfoMap = getPaperidInfoMap(headers, examInfo);

    _.forEach(examStudentsInfo, studentInfo => {
        // 将“总分”信息记录在总体信息内
        if(!data.total) {
            data.total = {totalScore: {count: 0, sum: 0, fullMark: examInfo.fullMark}};
        }
        data.total.totalScore.count += 1;
        data.total.totalScore.sum += studentInfo.score;
        // 将总分信息记录在相应学校内
        if (!data[studentInfo.school]) {
            data[studentInfo.school] = {totalScore: {count: 0, sum: 0, fullMark: examInfo.fullMark}};
        }
        data[studentInfo.school].totalScore.count += 1;
        data[studentInfo.school].totalScore.sum += studentInfo.score;

        //遍历各个学科
        _.forEach(studentInfo.papers, paperInfo => {
            // 记录到联考总体信息   
            var {paperid} = paperInfo;
            if (!data.total[paperid]) {
                data.total[paperid] = {count: 0, sum: 0, fullMark: paperidInfoMap[paperid].fullMark}
            }
            data.total[paperid].count += 1;
            data.total[paperid].sum += paperInfo.score;
            // 记录到相关学校信息
            if (!data[studentInfo.school][paperid]) {
                data[studentInfo.school][paperid] = {count: 0, sum: 0, fullMark: paperidInfoMap[paperid].fullMark};
            }
            data[studentInfo.school][paperid].count += 1;
            data[studentInfo.school][paperid].sum += paperInfo.score;
        })
    })

    return data;
}

/**
 * @param:  headers\examInfo均来自 reportDS
 * @return: 
 *   {
 *      totalScore: {id: , subject: , fullMark: } // 总分信息
 *      pid1: {id: , subject: , fullMark: }       // 各个科目
 *      ...
 *   } 
 */
function getPaperidInfoMap(headers, examInfo) {
    var mapper = {};
    _.forEach(headers, headerInfo => {
        mapper[headerInfo.id] = headerInfo;
    })
    mapper.totalScore.fullMark = examInfo.fullMark; //需要用到所有学科的总分信息；
    return mapper;
}