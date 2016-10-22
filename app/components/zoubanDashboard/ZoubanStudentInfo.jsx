import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function ZoubanStudentInfo({zoubanLessonStudentsInfo, zoubanExamInfo}) {
    debugger;
    var lessonMap = _.keyBy(zoubanExamInfo.lessons, 'objectId');
    var simpleLessonObjectId = _.keys(zoubanLessonStudentsInfo)[0];
    var simpleLesson = zoubanLessonStudentsInfo[simpleLessonObjectId];
    var simpleLessonStudents = _.sortBy(_.unionBy(..._.values(simpleLesson), (obj) => obj.id), 'score');
    var simpleStudent = simpleLessonStudents[_.ceil(_.multiply(0.8, simpleLessonStudents.length))];
//上面是找到拥有此优势学科的学生，下面获取到此学生其他各个学科的排名，找到排名最靠后的--使用排名是因为分数是绝对值，不具有比较的意义。
    var simpleStudentDisadvantageLesson = getSimpleStudentDisadvantage(zoubanLessonStudentsInfo, simpleStudent, zoubanExamInfo);
    var result = {
        name: simpleStudent.name,
        totalScore: simpleStudent.score,
        advantage: lessonMap[simpleLessonObjectId].name,
        disadvantage: simpleStudentDisadvantageLesson
    }
    debugger;
    return (
        <div>待填充</div>
    )
}

function getSimpleStudentDisadvantage(zoubanLessonStudentsInfo, simpleStudent, zoubanExamInfo) {
    var lessonStudentsMap, lessonMap = _.keyBy(zoubanExamInfo.lessons, 'objectId');
    var simpleStudentLessonRanks = []
    _.each(zoubanLessonStudentsInfo, (lessonStudentsInfo, lessonObjectId) => {
        lessonStudentsMap = _.keyBy(_.unionBy(..._.values(lessonStudentsInfo), (obj) => obj.id), 'id');
        if(!lessonStudentsMap[simpleStudent.id]) return;
        simpleStudentLessonRanks.push({
            name: lessonMap[lessonObjectId].name,
            rank: lessonStudentsMap[simpleStudent.id].lessonRank
        });
    });
    return _.last(_.sortBy(simpleStudentLessonRanks, 'rank')).name;
}
