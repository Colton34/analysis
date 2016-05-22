/*
* @Author: HellMagic
* @Date:   2016-05-04 11:27:28
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-22 16:28:59
*/

'use strict';

import _ from 'lodash';

import {fetchSchoolAnalysisData} from '../../api/mexam';
import {
    FETCH_SCHOOL_ANALYSIS_DATA,
    CHANGE_LEVEL
} from '../../lib/constants';

/*
fetchSchoolAnalysisData: 返回的接口格式：
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

export function initSchoolAnalysisAction(params) {
    return {
        type: FETCH_SCHOOL_ANALYSIS_DATA,
        promise: fetchSchoolAnalysisData(params)
    }
}


//下面都是各种组织数据结构的算法，当前是为了初始化，后面一些交互改变其实也差不多



//=============================

// export function testData(examid) {
//     return (dispatch) => {
//         return fetchSchoolAnalysisData(examid).then(function(res) {
// console.log('size = ', _.size(resRawData.studentScoreInfoMap));
//             dispatch({type: 'TESTDATA'})
//         })
//     }
// }

export function changeLevelAction(levelList) {
    return {
        type: CHANGE_LEVEL,
        levelList: levelList
    }
}
