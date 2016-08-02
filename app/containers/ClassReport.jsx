import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

import {initSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';
import {CommonErrorView, CommonLoadingView} from '../common/ErrorView';

/*
设计：
    1.一层一层往下拆分；遵从树状组织
    2.数据结构走schoolReprot--TODO:重构成report通用的
 */

class ClassReport extends React.Component {
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
                {(this.props.ifError) ? <CommonErrorView /> : (this.props.isLoading ? <CommonLoadingView /> : (
                    <h1>hi, I'm Class Report, 阿尼呀噻哟~~~</h1>
                ))}
            </div>
        );
    }
}

export default connect(mapStateToProps)(ClassReport);

function mapStateToProps(state) {
    return {
        isLoading: state.global.isLoading,
        ifError: state.global.ifError,

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
