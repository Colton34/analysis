import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
export default function QuestionDetail({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}) {
    var tableData = getTableData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo);
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>每小题得分情况</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{marginTop:30}}>
            <TableView hover  tableData={tableData}></TableView>
            </div>
        </div>
    )
}


function getTableData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo){
    var tableHeader = ['题号','满分','最低分','最高分','平均分','得分率','难度','区分度','查看原题'];
    var tableData = [];
    tableData.push(tableHeader);
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
    _.forEach(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var maxScore = _.max(question[currentClass].scores);
        var rowData = [];
        rowData.push(currentLessonQuestions[index].name);
        rowData.push(currentLessonQuestions[index].score);
        rowData.push(_.min(question[currentClass].scores));
        rowData.push(_.max(question[currentClass].scores));
        rowData.push(question[currentClass].mean);
        rowData.push(_.round(_.multiply(question[currentClass].rate,100),2)+'%');
        rowData.push(question[currentClass].rate);//难度 需确认
        rowData.push(question.lesson.separations);
        rowData.push('查看原题');
    tableData.push(rowData);
    });
return tableData;

}
