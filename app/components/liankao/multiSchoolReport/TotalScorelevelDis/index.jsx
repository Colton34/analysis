import _ from 'lodash';
import React, { PropTypes } from 'react';

import HeaderModule from './headerModule';
import TableContentModule from './TableContentModule';
import SummaryInfoModule from './summaryInfoModule';

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
        var levelStudentsInfoBySchool = getLevelStudentsInfoBySchool(this.props.reportDS);
        debugger;
        return (
            <div>
                <HeaderModule reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} />
                <TableContentModule reportDS={this.props.reportDS} levelStudentsInfoBySchool={levelStudentsInfoBySchool} />
                <SummaryInfoModule reportDS={this.props.reportDS} levelStudentsInfoBySchool={levelStudentsInfoBySchool} />
            </div>
        );
    }
}

function getLevelStudentsInfoBySchool(reportDS) {
    //通过每一档的count和score得到每一档所拥有的学生信息
    var result = {}, levels = reportDS.levels.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examFullMark = reportDS.examInfo.toJS().fullMark;
    _.each(levels, (levelObj, levelKey) => {
        var currentLevelStudentsInfo = getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark);
        result[levelKey] = _.groupBy(currentLevelStudentsInfo, 'school'); //注意这里的key是学校名称
    })
    return result;
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
