import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Header from './Header';
import TotalScoreTrend from './TotalScoreTrend';
import SubjectLevelModule from './subjectLevel';

import SubjectQualityModule from './subjectQualityMe';
// import StudentSubjectDis from './studentSubjectDis';
// import ClassSubjectLevel from './classSubjectLevel';
// import StudentsGroupLevel from './studentsGroupLevel';
import SubjectCritical from './subjectCritical';

import ImportStudentsModule from './importStudents';

import SubjectTeacherQuality from './SubjectTeacherQuality';

import ExamQuestionPerfromance from './examQuestionPerformance';
import ClassDiffQuestionModule from './classDiffQuestion';
import ClassSubjectQuestion from './classSubjectQuestion';
import Wishes from './Wishes';
//当前学科报告内
class ReportContent extends React.Component {
    constructor(props) {
        super(props);
        //TODO: 根据currentSubject和reportDS得到匹配当前科目的基础数据--作为base data
    }

/*

                <ExamQuestionPerfromance currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <ClassDiffQuestionModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                ////<ClassSubjectQuestion currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <ImportStudentsModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <SubjectQualityModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />


                <Header currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <TotalScoreTrend currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <SubjectLevelModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <SubjectCritical currentSubject={this.props.currentSubject} reportDS={this.props.reportDS}/>
                <SubjectQualityModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <StudentSubjectDis currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <StudentsGroupLevel currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                /////<ClassSubjectLevel currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
 */


    render() {
        return (
            <div>
                <Header currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <TotalScoreTrend currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <SubjectLevelModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <SubjectCritical currentSubject={this.props.currentSubject} reportDS={this.props.reportDS}/>
                <SubjectQualityModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <ExamQuestionPerfromance currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <ImportStudentsModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
                <Wishes />
            </div>
        );
    }
}

export default ReportContent;



// <div>
//     <Header currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
//     <TotalScoreTrend currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
//     <SubjectLevelModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
//     <SubjectCritical currentSubject={this.props.currentSubject} reportDS={this.props.reportDS}/>
//     <SubjectQualityModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
//     <ExamQuestionPerfromance currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
//     <ImportStudentsModule currentSubject={this.props.currentSubject} reportDS={this.props.reportDS} />
// </div>
