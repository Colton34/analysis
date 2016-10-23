import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link, browserHistory, withRouter} from 'react-router';

import Spinkit from '../common/Spinkit';
import CommonErrorView from '../common/ErrorView';
import ReportNavHeader from '../common/report/NavHeader';

import {initParams} from '../lib/util';
import {initZoubanDSAction} from '../reducers/zouban/actions';

import ZoubanNavHeader from '../components/zoubanDashboard/ZoubanNavHeader';
import ZoubanExamGuide from '../components/zoubanDashboard/ZoubanExamGuide';
import ZoubanRank from '../components/zoubanDashboard/ZoubanRank';
import ZoubanScoreDetail from '../components/zoubanDashboard/ZoubanScoreDetail';
import ZoubanQuestionQuanlity from '../components/zoubanDashboard/ZoubanQuestionQuanlity';
import ZoubanStudentInfo from '../components/zoubanDashboard/ZoubanStudentInfo';
import KnowledgePointAnalysis from '../components/zoubanDashboard/KnowledgePointAnalysis';
import {COLORS_MAP as colorsMap} from '../lib/constants';

const nextPathMap = {
    rank: '/zouban/rank/score',
    question: '/zouban/question/quality',
    class: '/zouban/detail/class',
    personal: '/zouban/personal/report'
};

class ZoubanDashboard extends React.Component {
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
        var {examid, grade} = this.props.location.query;
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                {(this.props.ifError) ? (<CommonErrorView />) : ((this.props.isLoading || !this.props.zouban.haveInit) ? (<Spinkit />) : (<ZoubanDashboardContent examid={examid} grade={grade} zouban={this.props.zouban} />))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoubanDashboard);
function mapStateToProps(state, props) {
    return {
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


class ZoubanDashboardContent extends React.Component {
    constructor(props) {
        super(props);

    }

    goNext(pathKey, queryString) {
        debugger;
        var targetUrl = nextPathMap[pathKey] + queryString;
        debugger;
        browserHistory.push(targetUrl);
    }

    render() {
        var zoubanExamInfo = this.props.zouban.zoubanExamInfo.toJS(), zoubanExamStudentsInfo = this.props.zouban.zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = this.props.zouban.zoubanLessonStudentsInfo.toJS(), zuobanLessonQuestionInfo = this.props.zouban.zuobanLessonQuestionInfo.toJS();
        debugger;
        var queryString = `?examid=${this.props.examid}&grade=${this.props.grade}`;
        debugger;

        return (
            <div style={{width: 1200, margin: '0 auto'}} className='container'>
                <ZoubanNavHeader zoubanExamInfo={zoubanExamInfo} />
                <ZoubanExamGuide zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} />
                <div className='row' style={{ marginTop: 20 }}>
                <ZoubanRank zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} goNext={this.goNext.bind(this, 'rank', queryString)} />
                <ZoubanScoreDetail zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} goNext={this.goNext.bind(this, 'class', queryString)} />
                </div>
                <div className='row' style={{ marginTop: 20 }}>
                <ZoubanQuestionQuanlity zoubanExamInfo={zoubanExamInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} goNext={this.goNext.bind(this, 'question', queryString)} />
                <KnowledgePointAnalysis />
                <ZoubanStudentInfo zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamInfo={zoubanExamInfo} goNext={this.goNext.bind(this, 'personal', queryString)} />
                </div>
            </div>
        );
    }
}

