/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:28
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 15:52:56
*/

'use strict';
import {initSchoolAnalysisData} from '../../api/exam';
import _ from 'lodash';
import {
    FETCH_SCHOOL_ANALYSIS_RAW_DATA
} from '../../lib/constants';

/*
initSchoolAnalysisData: 返回的接口格式：
{
    studentScoreInfoMap: studentScoreInfoMap,
    paperInfo: paperInfo,
    classInfo: classInfo
}
说明：
studentScoreInfoMap:
{
    <studentId>: {id: student.id, kaohao: student.kaohao, name: student.name, class: student.class, <paperId>: <paper_score>..., totalScore: <total_score>},
    ...
}

paperInfo：
{
    <paperId> : {name: '', fullMark: 100}
}

classInfo:
About Class
{
    'A1': {studentsCount: 100},
    'A2': {studentsCount: 120}
}
 */

export function clientInitSchoolAnalysis(params) {
    params.isClient = true;
    return {
        type: FETCH_SCHOOL_ANALYSIS_RAW_DATA,
        promise: fetchSchoolAnalysisRawData(params)
    }
}

export function serverInitSchoolAnalysis(params) {
    params.isClient = false;
    return {
        type: FETCH_SCHOOL_ANALYSIS_RAW_DATA,
        promise: fetchSchoolAnalysisRawData(params)
    }
}

function fetchSchoolAnalysisRawData(params) {
    return initSchoolAnalysisData(params);
}

export function testData(examid) {
    return (dispatch) => {
        return initSchoolAnalysisData(examid).then(function(res) {
console.log('size = ', _.size(resRawData.studentScoreInfoMap));
            dispatch({type: 'TESTDATA'})
        })
    }
}
