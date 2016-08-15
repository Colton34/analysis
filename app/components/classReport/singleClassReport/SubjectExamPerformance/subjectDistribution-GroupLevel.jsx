//学科成绩等级的人数分布比例
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../../common/EnhanceTable';
import TableView from '../../../../common/TableView';

import {makeSegmentsCount} from '../../../../api/exam';
import {LETTER_MAP as letterMap} from '../../../../lib/constants';

import commonClass from '../../../../common/common.css';

export default function SubjectScoreLevelDistribution({reportDS, currentClass, classStudentsPaperMap}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), headers = reportDS.headers.toJS();
    var tableDS = getTableDS(examPapersInfo, classStudentsPaperMap, headers, currentClass);

    var gradeInfo = {0: {percentage: 0.85}, 1: {percentage: 0.7}, 2: {percentage: 0.6}};
    var tableHeaders = [[{id: 'subject', name: '学科成绩分类'}]];
    var headers = _.range(_.size(gradeInfo) + 1).map(num => {
        if (num === _.size(gradeInfo)) {
            return {id: num, name: letterMap[num] + '等人数占比(' + gradeInfo[num-1].percentage + '以下)'}
        }
        return {id: num, name: letterMap[num] + '等人数占比(' + gradeInfo[num].percentage + ')'}
    })
    tableHeaders[0] = tableHeaders[0].concat(headers);

    var tableData = _.map(tableDS, (rowData, index) => {
        var obj = {};
        obj.subject = rowData[0];
        _.each(_.range(_.size(gradeInfo) + 1), num=> {
            obj[num] = rowData[num+1];
        });
        return obj;
    });

    return (
        <div>
            <div style={{marginTop: 30}}>
                <span className={commonClass['sub-title']}>学科成绩等级的人数分布比例</span>
                <span className={commonClass['title-desc']}>本次考试，将班级整体及各学科成绩，分为A,B,C,D等多个等级，来观察不同成绩等级下的学生人数分布。若修改成绩等级参数，请直接联系本校管理员。</span>
            </div>
            <div style={{marginTop: 30}}>
                <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            </div>
        </div>
    )
}


//=================================================  分界线  =================================================
function getTableDS(examPapersInfo, classStudentsPaperMap, headers, currentClass, levelPcentages=[0, 60, 70, 85, 100]) {//Note: 这个等级是固定不变的
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var matrix = [], total = levelPcentages.length -1;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('学科成绩分类');
    matrix.push(titleHeader);

    var subjectHeaders = headers.slice(1);//没有总分这一行

    _.each(subjectHeaders, (headerObj, index) => {
        //每一个科目|
        var paperObj = examPapersInfo[headerObj.id];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        //这应该是当前科目的区分段的count--而不是总分（且一定不包含总分）
        //获取此科目下当前班级学生（不再是所有学生）的成绩
        // var classStudentsPaperMap = _.filter(allStudentsPaperMap[headerObj.id], (obj) => obj['class_name'] == currentClass);
        var result = makeSegmentsCount(classStudentsPaperMap[headerObj.id], segments); //注意：低等次在前
        result = _.reverse(result);//高等次在前
        //不需要再计算百分比了
        // result = _.map(_.reverse(result), (count) => {
        //     var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
        //     return percentage + '%';
        // });
        result.unshift(paperObj.subject);
        matrix.push(result);
    });

    return matrix;
}

function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}
