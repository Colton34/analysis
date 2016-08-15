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
import SubjectPerformanceExam from './SubjectExamPerformance/subjectPerformance-Exam';
import SubjectDistributionScoreContriFactor from './SubjectExamPerformance/subjectDistribution-ScoreContriFactor';
import SubjectDistributionStudentLevel from './SubjectExamPerformance/subjectDistribution-StudentLevel';
import SubjectDistributionGroupLevel from './SubjectExamPerformance/subjectDistribution-GroupLevel';
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
        var classHeader = getClassHeaders(headers, classStudentsPaperMap);

        return (
            <div>
                <Header examInfo={this.props.reportDS.examInfo} />
                <TotalScoreTrend reportDS={this.props.reportDS} classStudents={classStudents} />
                <TotalScoreLevelGuide reportDS={this.props.reportDS} classStudents={classStudents} />
                <TotalScoreLevelDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />
                {/*<SubjectDistributionScoreLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<CriticalStudentDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceExam reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionScoreContriFactor reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionStudentLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionGroupLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceExamInspect reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceQuestionTopic reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceQuestionLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />  TODO:未完 */}
                {/*<ImportStudentInfo reportDS={this.props.reportDS} classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} currentClass={this.state.currentClass} />*/}
                {/*<HistoryPerformance reportDS={this.props.reportDS} classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} /> 未完成  */}
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
    _.each(headers, (headObj) => {
        if(classStudentsPaperMap[headObj.id]) result.push(headObj);
    });
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
