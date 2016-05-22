import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Map, List} from 'immutable';

//设计：这里是所有view container的page view。
//尽量是木偶组件


import Header from '../components/schoolReport/Header';
import FullScoreTrend from '../components/schoolReport/FullScoreTrend';
import ScoreDistribution from '../components/schoolReport/ScoreDistribution';
import SubjectDistribution from '../components/schoolReport/SubjectDistribution';
import ClassPerformance from '../components/schoolReport/ClassPerformance';
import SubjectPerformance from '../components/schoolReport/SubjectPerformance';
import GroupAnalysis from '../components/schoolReport/GroupAnalysis';
import StudentPerformance from '../components/schoolReport/StudentPerformance/StudentPerformance';;

import {initSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';
import {initParams, convertJS} from '../lib/util';
import {SUBJECTS_WEIGHT as subjectWeight} from '../lib/constants';

class SchoolReport extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ];

    componentDidMount() {
        if (this.props.haveInit) return;

        console.log('SchoolAnalysis componentDidMount');
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initSchoolAnalysis(params);
    }

    render() {
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, levels} = this.props;

        examInfo = (Map.isMap(examInfo)) ? examInfo.toJS() : examInfo;
        examStudentsInfo = (List.isList(examStudentsInfo)) ? examStudentsInfo.toJS() : examStudentsInfo;
        examPapersInfo = (Map.isMap(examPapersInfo)) ? examPapersInfo.toJS() : examPapersInfo;
        examClassesInfo = (Map.isMap(examClassesInfo)) ? examClassesInfo.toJS() : examClassesInfo;
        levels = (Map.isMap(levels)) ? levels.toJS() : levels;

        if((!examInfo || _.size(examInfo) == 0) || (!examStudentsInfo || examStudentsInfo.length == 0) ||
            (!examPapersInfo || _.size(examPapersInfo) == 0) || (!examClassesInfo || _.size(examClassesInfo) == 0) ||
            (!levels || _.size(levels) == 0)) return (<div></div>) //显示 loading

        var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class');
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperid');

        var headers = [];
        _.each(examPapersInfo, (paper, pid) => {
            var index = _.findIndex(subjectWeight, (s) => (s == paper.subject));
            if(index >= 0) {
                headers.push({ index: index, subject: paper.subject, id: pid });
            }
        });
        headers = _.sortBy(headers, 'index');
        headers.unshift({subject: '总分', id: 'totalScore' });


debugger;

        return (
            <div style={{ width: 1000, margin: '0 auto', marginTop: 20, backgroundColor: '#fff' }}>
                <h1>This School Analysis</h1>
            </div>
        )
    }
}

/*

                <Header headerInfo={headerInfo}/>
                <FullScoreTrend/>
                <ScoreDistribution totalScoreLevel={totalScoreLevel} changeLevels={this.props.changeLevels}/>
                <SubjectDistribution totalScoreLevel={totalScoreLevel}/>
                <ClassPerformance totalScoreLevel={totalScoreLevel}/>
                <SubjectPerformance/>
                <GroupAnalysis totalScoreLevel={totalScoreLevel}/>
                <StudentPerformance/>

 */

function mapStateToProps(state) {
    return {
        haveInit: state.schoolAnalysis.haveInit,
        examInfo: state.schoolAnalysis.examInfo,
        examStudentsInfo: state.schoolAnalysis.examStudentsInfo,
        examPapersInfo: state.schoolAnalysis.examPapersInfo,
        examClassesInfo: state.schoolAnalysis.examClassesInfo,
        levels: state.schoolAnalysis.levels
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initSchoolAnalysis: bindActionCreators(initSchoolAnalysisAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolReport);


/*
Mock Data:
var headerInfo = {
    examName: '遵义县2016年下高二期末考试',
    examTime: '2016.6.12-2016.6.15',
    grade: '初一',
    classNum: 20,
    studentNum: 2300,
    subjectList: ['语文', '数学', '英语', '物理', '化学', '生物']
}

var defaultLevelInfo = [
    {
        score: 520,
        rate: 15,
        num: 100
    },
    {
        score: 480,
        rate: 35,
        num: 360
    },
    {
        score: 360,
        rate: 50,
        num: 890
    }
]


 */
