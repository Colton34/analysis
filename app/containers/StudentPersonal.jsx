import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Spinkit from '../common/Spinkit';
import StudentScoreInfo from '../components/zoubanStudent/StudentScoreInfo';
import StudentSubjectCompare from '../components/zoubanStudent/StudentSubjectCompare';
import StudentLessonQuestion from '../components/zoubanStudent/StudentLessonQuestion';

import {initParams} from '../lib/util';
import commonClass from '../styles/common.css';
import {COLORS_MAP as colorsMap} from '../lib/constants';
import {initZoubanDSAction} from '../reducers/zouban/actions';

import CommonErrorView from '../common/ErrorView';

class StudentPersonalContent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var {zoubanExamInfo, zoubanExamStudentsInfo, zoubanLessonStudentsInfo, zuobanLessonQuestionInfo} = this.props.zouban;
        var user = this.props.user.toJS();
        var currentStudent = {value: '1234', label: '小明'};
        zoubanExamInfo = zoubanExamInfo.toJS(), zoubanExamStudentsInfo = zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = zoubanLessonStudentsInfo.toJS(), zuobanLessonQuestionInfo = zuobanLessonQuestionInfo.toJS();
        debugger;
        return (
            <div>
                <StudentScoreInfo zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} currentStudent={this.state.currentStudent} lessonsByStudent={lessonsByStudent} />
                <StudentSubjectCompare zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} lessonsByStudent={lessonsByStudent} currentStudent={this.state.currentStudent} />
                <StudentLessonQuestion currentStudent={this.state.currentStudent} lessonsByStudent={lessonsByStudent} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} />
            </div>
        );
    }
}

class StudentPersonal extends React.Component {
    static need = [initZoubanDSAction]

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        if(this.props.zouban.haveInit) return;
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.initZoubanDS(params);
    }

    render() {
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                {(this.props.ifError) ? (<CommonErrorView />) : ((this.props.isLoading || !this.props.zouban.haveInit) ? (<Spinkit />) : (<StudentPersonalContent user={this.props.user} zouban={this.props.zouban} />))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentPersonal);
function mapStateToProps(state, props) {
    return {
        user: state.global.user,
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,
        zouban: state.zouban
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initZoubanDS: bindActionCreators(initZoubanDSAction, dispatch)
    }
}
