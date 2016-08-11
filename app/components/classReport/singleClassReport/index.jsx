import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import ClassNav from './ClassNav';
import HeaderInfo from './Header/HeaderInfo';
import ModuleNav from './Header/ModuleNav';
import TotalScoreTrend from './totalScore-trend';
import TotalScoreLevelGuide from './totalScore-levelGuide';
import TotalScoreLevelDistribution from './totalScore-levelDistribution';
import SubjectDistributionScoreLevel from './subjectDistribution-ScoreLevel';
import CriticalStudentDistribution from './CriticalStudentDistribution';
import SubjectPerformanceExam from './SubjectExamPerformance/subjectPerformance-Exam';
import SubjectDistributionScoreContriFactor from './SubjectExamPerformance/subjectDistribution-ScoreContriFactor';
import SubjectDistributionStudentLevel from './SubjectExamPerformance/subjectDistribution-StudentLevel';
import SubjectDistributionGroupLevel from './SubjectExamPerformance/subjectDistribution-GroupLevel';
import SubjectPerformanceExamInspect from './SubjectInspectPerformance/subjectPerformance-ExamInspect';

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
        return (
            <div>
                <h3>SingleClassReport</h3>
                <HeaderInfo examInfo={this.props.reportDS.examInfo} />
                <ModuleNav />
                {/*<TotalScoreTrend reportDS={this.props.reportDS} currentClass={this.state.currentClass} /> */}
                {/*<TotalScoreLevelGuide reportDS={this.props.reportDS} currentClass={this.state.currentClass} /> */}
                {/*<TotalScoreLevelDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionScoreLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<CriticalStudentDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceExam reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionScoreContriFactor reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionStudentLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectDistributionGroupLevel reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                {/*<SubjectPerformanceExamInspect reportDS={this.props.reportDS} currentClass={this.state.currentClass} />*/}
                <SubjectPerformanceExamInspect reportDS={this.props.reportDS} currentClass={this.state.currentClass} />
                {/* ... */}
            </div>
        );
    }
}

export default SingleClassReport;


//=================================================  分界线  =================================================


/* <ClassNav chooseClass={this.chooseClass.bind(this)} />  -- 被砍掉 */
