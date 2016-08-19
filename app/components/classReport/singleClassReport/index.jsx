import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Header from './Header';
// import TotalScoreTrend from './totalScore-trend';
import TotalScoreTrend from './TotalScoreTrend';
import TotalScoreLevelGuide from './totalScore-levelGuide';
import TotalScoreLevelDistribution from './totalScore-levelDistribution';
import SubjectDistributionScoreLevel from './subjectDistribution-ScoreLevel';
import CriticalStudentDistribution from './CriticalStudentDistribution';
import SubjectPerformance from './SubjectExamPerformance';

import SubjectPerformanceExamInspect from './SubjectInspectPerformance/subjectPerformance-ExamInspect';
import SubjectPerformanceQuestionTopic from './SubjectInspectPerformance/subjectPerformance-QuestionTopic';
import SubjectPerformanceQuestionLevel from './SubjectInspectPerformance/subjectPerformance-QuestionLevel';
import ImportStudentInfo from './ImportStudentInfo';
import HistoryPerformance from './HistoryPerformance';

class SingleClassReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClass: '1'
        }
    }

    //TODO:能选择哪些班级是跟着这个用户的权限走的！！！
    chooseClass(className) {
        this.setState({
            currentClass: className
        })
    }

//Note: 当前先打散，而没有再在结构上进行重组，后面结构化更清晰了会考虑进一步重组。
    render() {
        var studentsGroupByClass = this.props.reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), headers = this.props.reportDS.headers.toJS();
        var classStudents = getClassStudents(studentsGroupByClass, this.state.currentClass);
        var classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, this.state.currentClass);
        var classHeaders = getClassHeaders(headers, classStudentsPaperMap);
        var classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);

        return (
            <div>
{/*                <Header examInfo={this.props.reportDS.examInfo} />
                <TotalScoreTrend reportDS={this.props.reportDS} classStudents={classStudents} />
                <TotalScoreLevelGuide reportDS={this.props.reportDS} classStudents={classStudents} />
                <TotalScoreLevelDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />
                <SubjectDistributionScoreLevel classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeaders={classHeaders} currentClass={this.state.currentClass} reportDS={this.props.reportDS} />
                <CriticalStudentDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />
                <SubjectPerformance classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeaders={classHeaders} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={this.state.currentClass} reportDS={this.props.reportDS} />
                <ImportStudentInfo classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeadersWithTotalScore={classHeadersWithTotalScore} />
*/}

                <HistoryPerformance grade={this.props.grade} currentClass={this.state.currentClass} />
                {/* ... */}
            </div>
        );
    }
}

export default SingleClassReport;


//=================================================  分界线  =================================================
//TODO:注意这里需要替换数据源！！！
function getClassStudents(studentsGroupByClass, currentClass) {
    return studentsGroupByClass[currentClass];
}

function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
    var result = {};
    _.each(allStudentsPaperMap, (students, pid) => {
        var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
        if(classStudents || classStudents.length > 0) result[pid] = classStudents;
    });
    return result;
}

function getClassHeaders(headers, classStudentsPaperMap) {
    var result = [];
    _.each(headers, (headerObj) => {
        if(classStudentsPaperMap[headerObj.id]) result.push(headerObj);
    });
    return result;
}

function getClassHeadersWithTotalScore(headers, classStudentsPaperMap) {
    var result = [];
    _.each(headers, (headerObj) => {
        if(classStudentsPaperMap[headerObj.id]) result.push(headerObj);
    });
    result.unshift(headers[0]);
    return result;
}


/* <ClassNav chooseClass={this.chooseClass.bind(this)} />  -- 被砍掉 */


/*

[
    [
        { "id": "class", "name": "班级", "rowSpan": 2 },
        { "colSpan": 3, "name": "一档", headerStyle: { textAlign: 'center' } },
        { "colSpan": 3, "name": "二档", headerStyle: { textAlign: 'center' } },
        { "colSpan": 3, "name": "三档", headerStyle: { textAlign: 'center' } }
    ],
    [
        { "id": "count_0", "name": "人数" },
        { "id": "sumCount_0", "name": "累计人数" },
        { "id": "sumPercentage_0", "name": "累计上线率" },
        { "id": "count_1", "name": "人数" },
        { "id": "sumCount_1", "name": "累计人数" },
        { "id": "sumPercentage_1", "name": "累计上线率" },
        { "id": "count_2", "name": "人数" },
        { "id": "sumCount_2", "name": "累计人数" },
        { "id": "sumPercentage_2", "name": "累计上线率" }
    ]
]


 */
