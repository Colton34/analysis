//TODO: 不再需要了！！！

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

import {initParams} from '../lib/util';
import {CommonErrorView, CommonLoadingView} from '../common/ErrorView';
import {initSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';

//TODO:ClassNav需要的数据结构设计--同样也走report DS
//疑问：这个东西的权限是什么？？？
class ClassNav extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ]

    componentDidMount() {
        if (this.props.haveInit) return;
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initSchoolAnalysis(params);
    }

    render() {
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : (this.props.isLoading ? <CommonLoadingView /> : (
                    <h1>hi, I'm ClassNav, 萨瓦迪卡~~~</h1>
                ))}
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
