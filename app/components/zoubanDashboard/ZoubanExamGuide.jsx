import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function ZoubanExamGuide({zoubanExamInfo, zoubanExamStudentsInfo}) {
    var {lessonCount, classesCount, studentsCount} = getInfo(zoubanExamInfo, zoubanExamStudentsInfo);
    return (
        <div className='row'>
            <div style={{ width: '100%', height: 87, lineHeight: '87px', backgroundColor: '#fff', borderRadius: 2, display: 'table-cell', verticalAlign: 'middle'}}>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{lessonCount}</span>
                    <span style={localStyle.descStyle}>考试学科数</span>
                    <span style={localStyle.borderBox}></span>
                </div>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{classesCount}</span>
                    <span style={localStyle.descStyle}>考试班级数</span>
                    <span style={localStyle.borderBox}></span>
                </div>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{studentsCount}</span>
                    <span>考试学生数</span>
                </div>
            </div>
        </div>
    )
}

var localStyle = {
    inlineBox: {width: 375, height: 45, lineHeight: '45px', float: 'left', display: 'inline-block', marginLeft: 25, position: 'relative'},
    borderBox: {display: 'inline-block', height: 27,borderRight: '1px solid #efefef', position: 'absolute', top: '50%', marginTop: -13.5, right: 0},
    numStyle:  {color: '#1daef8', fontSize: 36, marginRight: 10 },
    descStyle: {fontSize: 14}
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
