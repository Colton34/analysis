import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

import {initSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';

//TODO:ClassNav需要的数据结构设计--同样也走report DS
//疑问：这个东西的权限是什么？？？
class ClassNav extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ]

    componentDidMount() {
        if (this.props.haveInit) return;
        //TODO: 将initParams的参数调换一下位置--request是肯定要有的，所以应该放在前面，不叫做other而是request
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initSchoolAnalysis(params);
    }

    render() {
        return (
            <div>
                <h1>I'm ClassNav</h1>
            </div>
        );
    }
}

export default connect(mapStateToProps)(ClassNav);

function mapStateToProps(state) {
    return {
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,

        haveInit: state.schoolAnalysis.haveInit,
        examInfo: state.schoolAnalysis.examInfo,
        examStudentsInfo: state.schoolAnalysis.examStudentsInfo,
        examPapersInfo: state.schoolAnalysis.examPapersInfo,
        examClassesInfo: state.schoolAnalysis.examClassesInfo,
        studentsGroupByClass: state.schoolAnalysis.studentsGroupByClass,
        allStudentsPaperMap: state.schoolAnalysis.allStudentsPaperMap,
        headers: state.schoolAnalysis.headers,
        levels: state.schoolAnalysis.levels
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initSchoolAnalysis : bindActionCreators(initSchoolAnalysisAction, dispatch)
    }
}
