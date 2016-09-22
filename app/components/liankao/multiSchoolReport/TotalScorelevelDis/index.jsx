import _ from 'lodash';
import React, { PropTypes } from 'react';

import HeaderModule from './headerModule';
//import TableContentModule from './Here';
import SummaryInfoModule from './summaryInfoModule';
import TableContentModule from './TableContentModule';


/*
Note:

 */
export default class TotalScoreDisModule extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        console.log('父亲comdid');
    }

    render() {
        var allStudentBySchool = _.groupBy(this.props.reportDS.examStudentsInfo.toJS(), 'school');
        var {levelStudentsInfo, levelStudentsInfoBySchool} = getLevelStudentsInfoBySchool(this.props.reportDS, allStudentBySchool);
        
        return (
            <div>
                <HeaderModule reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} />
                <TableContentModule reportDS={this.props.reportDS} allStudentBySchool={allStudentBySchool} levelStudentsInfoBySchool={levelStudentsInfoBySchool} />
                <SummaryInfoModule reportDS={this.props.reportDS} allStudentBySchool={allStudentBySchool} levelStudentsInfo={levelStudentsInfo} levelStudentsInfoBySchool={levelStudentsInfoBySchool} />
            </div>
        );
    }
}

function getLevelStudentsInfoBySchool(reportDS, allStudentBySchool) {
    //通过每一档的count和score得到每一档所拥有的学生信息
    var levelStudentsInfo = {}, levels = reportDS.levels.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examFullMark = reportDS.examInfo.toJS().fullMark;
    _.each(levels, (levelObj, levelKey) => {
        var currentLevelStudentsInfo = getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark);
        levelStudentsInfo[levelKey] = _.groupBy(currentLevelStudentsInfo, 'school'); //注意这里的key是学校名称
    })
    var levelStudentsInfoBySchool = getSchoolLevelMap(levelStudentsInfo, allStudentBySchool);
    return {
        levelStudentsInfo: levelStudentsInfo,
        levelStudentsInfoBySchool: levelStudentsInfoBySchool
    }
}

function getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark) {
    var currentLevelScore = levels[levelKey].score, levelLastIndex = _.size(levels)-1, targetStudents;
    if(levelKey == '0') {
        var highLevelScore = levels[(parseInt(levelKey)+1)+''].score;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score <= highLevelScore));
    } else if(levelKey == levelLastIndex+'') {
        var highLevelScore = examFullMark;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore));
    } else {
        var highLevelScore = levels[(parseInt(levelKey)+1)+''].score;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore));
    }
    return targetStudents;
}

function getSchoolLevelMap(levelStudentsInfoBySchool, allStudentBySchool) {
    var result = {};
    _.each(levelStudentsInfoBySchool, (levelSchoolStudents, levelKey) => {
        _.each(levelSchoolStudents, (students, schoolName) => {
            if(!result[schoolName]) result[schoolName] = {};
            result[schoolName][levelKey] = students.length;
        })
    });
    _.each(result, (schoolLevelCountInfo, schoolName) => {
        var schoolLevelCounts = _.values(schoolLevelCountInfo);
        var schoolAllExistStudentCount = allStudentBySchool[schoolName].length;
        var otherCount = schoolAllExistStudentCount - _.sum(schoolLevelCounts);
        schoolLevelCountInfo.other = otherCount;
        schoolLevelCountInfo.all = schoolAllExistStudentCount;
    });
    return result;
}
