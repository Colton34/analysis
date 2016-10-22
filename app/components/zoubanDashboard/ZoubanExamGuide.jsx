import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function ZoubanExamGuide({zoubanExamInfo, zoubanExamStudentsInfo}) {
    var {lessonCount, classesCount, studentsCount} = getInfo(zoubanExamInfo, zoubanExamStudentsInfo);
    debugger;//好像有问题：班级个数比学生人数还要多
    return (
        <div>待填充</div>
    )
}

function getInfo(zoubanExamInfo, zoubanExamStudentsInfo) {
    var lessonCount = zoubanExamInfo.lessons.length;
    var classesCount = _.union(..._.map(zoubanExamInfo.lessons, (lessonObj) => lessonObj.classes)).length;
    var studentsCount = zoubanExamStudentsInfo.length;
    return {
        lessonCount: lessonCount,
        classesCount: classesCount,
        studentsCount: studentsCount
    }
}
