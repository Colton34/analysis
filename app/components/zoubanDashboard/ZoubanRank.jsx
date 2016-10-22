import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function ZoubanRank({zoubanLessonStudentsInfo, zoubanExamStudentsInfo}) {
    //取任意一个科目的前六名
    var dataMatrix = getDataMatrix(zoubanLessonStudentsInfo, zoubanExamStudentsInfo);//排名为什么没有见到第二名！！！
    debugger;
    return (
        <div>待填充</div>
    )
}

function getDataMatrix(zoubanLessonStudentsInfo, zoubanExamStudentsInfo) {
    var zoubanExamStudentsInfoMap = _.keyBy(zoubanExamStudentsInfo, 'id');
    var lessonStudentsInfo = zoubanLessonStudentsInfo[_.keys(zoubanLessonStudentsInfo)[0]];
    var lessonAllStudentsInfo = _.unionBy(..._.values(lessonStudentsInfo), (obj) => obj.id);
    debugger;
    var targets = _.take(_.orderBy(lessonAllStudentsInfo, ['score'], ['desc']), 6);
    var header = ['名次', '姓名', '教学班', '分数'];
    debugger;
    var body = _.map(targets, (obj) => {
        return [obj.lessonRank, zoubanExamStudentsInfoMap[obj.id].name, obj['class_name'], obj.score]
    });
    body.unshift(header);
    return body;
}
