import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Header from './Header';
import TotalScoreTrend from './TotalScoreTrend';
import TotalScoreLevelGuide from './totalScore-levelGuide';
import TotalScoreLevelDistribution from './totalScore-levelDistribution';
import SubjectDistributionScoreLevel from './subjectDistribution-ScoreLevel';
import CriticalStudentDistribution from './CriticalStudentDistribution';
import SubjectPerformance from './SubjectExamPerformance';
import SubjectInspectPerformance from './SubjectInspectPerformance';
import Wishes from './Wishes';

import ImportStudentInfo from './ImportStudentInfo';
// import HistoryPerformance from './HistoryPerformanceMe';
import HistoryPerformance from './HistoryPerformance';

class SingleClassReport extends React.Component {
    constructor(props) {
        super(props);
    }

//TODO: Note: 当前先打散，而没有再在结构上进行重组，后面结构化更清晰了会考虑进一步重组。
    render() {
        var {reportDS, grade, currentClass} = this.props;
        var studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
        var classStudents = getClassStudents(studentsGroupByClass, currentClass);
        var classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, currentClass);
        var classHeaders = getClassHeaders(headers, classStudentsPaperMap);
        var classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);

        var isCustomAnalysis = (reportDS.examInfo.toJS().from == '40');
        return (
            <div>
                <Header examInfo={reportDS.examInfo} currentClass={currentClass}/>
                <TotalScoreTrend reportDS={reportDS} classStudents={classStudents} />
                <TotalScoreLevelGuide reportDS={reportDS} classStudents={classStudents}/>
                <TotalScoreLevelDistribution reportDS={reportDS} currentClass={currentClass} />
                <SubjectDistributionScoreLevel classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={currentClass} reportDS={reportDS} />
                <CriticalStudentDistribution classStudents={classStudents} reportDS={reportDS} />
                <SubjectPerformance classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeaders={classHeaders} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={currentClass} reportDS={reportDS} />
                <SubjectInspectPerformance reportDS={reportDS} currentClass={currentClass} classHeaders={classHeaders} />
                <ImportStudentInfo reportDS={reportDS.toJS()} currentClass={currentClass} classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeadersWithTotalScore={classHeadersWithTotalScore} />
                {(!isCustomAnalysis) ? (<HistoryPerformance user={this.props.user} grade={grade} currentClass={currentClass} />) : (<div></div>)}
                <Wishes />
            </div>
        );
    }
}

export default SingleClassReport;


//=================================================  分界线  =================================================
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
