import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import QuestionCompare from './QuestionCompare';
import AverageCompare from './AverageCompare';
import StudentLevelsDistribution from './StudentLevelsDistribution';
import LevelsCompare from './LevelsCompare';

import commonClass from '../../../styles/common.css';

class ScoreDetailModule extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        var {zoubanExamInfo, zoubanExamStudentsInfo, zoubanLessonStudentsInfo, zuobanLessonQuestionInfo} = this.props;
        zoubanExamInfo = zoubanExamInfo.toJS(), zoubanExamStudentsInfo = zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = zoubanLessonStudentsInfo.toJS(), zuobanLessonQuestionInfo = zuobanLessonQuestionInfo.toJS();
        return (
            <div>
                <QuestionCompare zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo}></QuestionCompare>
                <AverageCompare zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo}></AverageCompare>
                <StudentLevelsDistribution zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo}></StudentLevelsDistribution>
                <LevelsCompare zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo}></LevelsCompare>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ScoreDetailModule);

function mapStateToProps(state) {
    return {
        zoubanExamInfo: state.zouban.zoubanExamInfo,
        zoubanExamStudentsInfo: state.zouban.zoubanExamStudentsInfo,
        zoubanLessonStudentsInfo: state.zouban.zoubanLessonStudentsInfo,
        zuobanLessonQuestionInfo: state.zouban.zuobanLessonQuestionInfo
    }
}
