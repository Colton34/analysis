import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function ZoubanQuestionQuanlity({zoubanExamInfo, zuobanLessonQuestionInfo}) {
    var simpleLesson = zoubanExamInfo.lessons[0];
    var simpleClass = simpleLesson.classes[0];
    var {goodQuestion,badQuestion} = getCardSummary(zuobanLessonQuestionInfo, simpleClass, simpleLesson);
    debugger;
    return (
        <div>待填充</div>
    )
}


function getCardSummary(zuobanLessonQuestionInfo, simpleClass, simpleLesson){
    var simpleQuestions = simpleLesson.questions;
    var questionsPerformArry = _.map(zuobanLessonQuestionInfo[simpleLesson.objectId],function(question,index){
        var performance = _.subtract(question[simpleClass].mean, question.lesson.mean);
        return {
            name:simpleQuestions[index].name,
            performance:performance
        }
    });
    var goodQuestion =_.map(_.takeRight(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    var badQuestion = _.map(_.take(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    return {goodQuestion,badQuestion};
}
