import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

export default function StudentSubjectCompare({zoubanLessonStudentsInfo, lessonsByStudent, currentStudent}) {
    var categories = getCategories(lessonsByStudent);
    var studentRankRateDiff = getStudentLessonRankRateDiff(zoubanLessonStudentsInfo, lessonsByStudent, currentStudent);
    debugger;

    return (
        <div>待填充</div>
    )
}

function getCategories(lessonsByStudent) {
    return _.map(lessonsByStudent, (obj) => obj.name);
}

function getStudentLessonRankRateDiff(zoubanLessonStudentsInfo, lessonsByStudent, currentStudent) {
    var currentLessonStudents, targetStudent, studentRankRate, lessonMean, gradeTargetStudent;
    return _.map(lessonsByStudent, (lessonObj) => {
        currentLessonStudents = _.unionBy(..._.values(zoubanLessonStudentsInfo[lessonObj.objectId]), (obj) => obj.id);
        targetStudent = _.find(currentLessonStudents, (obj) => obj.id == currentStudent.value);
        studentRankRate = _.round(_.divide(targetStudent.lessonRank, currentLessonStudents.length), 2);

        lessonMean = _.round(_.mean(_.map(currentLessonStudents, (obj) => obj.score)), 2);
        gradeTargetStudent = _.chain(currentLessonStudents).map((obj) => {
            return {
                diff: Math.abs(obj.score-lessonMean),
                value: obj
            }
        }).sortBy('diff').first().value().value;
        var gradeRankRate = _.round(_.divide(gradeTargetStudent.lessonRank, currentLessonStudents.length), 2);
        return _.round(_.subtract(studentRankRate, gradeRankRate), 2);
    });
}



//各个学科所参加考试的人数
//当前学生在所考的各个学科中的名次
//各个学科的平均分，此平均分所对应的排名--各个学生所对应的分数和此平均分的绝对值，绝对值最小的即为target
