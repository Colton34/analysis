import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {List} from 'immutable';

import Header from '../components/schoolReport/Header';
import FullScoreTrend from '../components/schoolReport/FullScoreTrend';
import ScoreDistribution from '../components/schoolReport/ScoreDistribution';
import SubjectDistribution from '../components/schoolReport/SubjectDistribution';
import ClassPerformance from '../components/schoolReport/ClassPerformance';
import SubjectPerformance from '../components/schoolReport/SubjectPerformance';
import GroupAnalysis from '../components/schoolReport/GroupAnalysis';
import StudentPerformance from '../components/schoolReport/StudentPerformance/StudentPerformance';;

import {initSchoolAnalysisAction, changeLevelAction} from '../reducers/schoolAnalysis/actions';
import {initParams, convertJS} from '../lib/util';

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
class SchoolReport extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ];

    componentDidMount() {
        console.log('SchoolAnalysis componentDidMount');
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initSchoolAnalysis(params);
    }


    render() {
        //var _this = this;
        var {totalScoreLevel} = this.props.schoolAnalysis;  
        totalScoreLevel = (List.isList(totalScoreLevel) ? totalScoreLevel.toJS(): totalScoreLevel);
        
        return (
            <div style={{ width: 1000, margin: '0 auto', marginTop: 20, backgroundColor: '#fff' }}>
                <Header headerInfo={headerInfo}/>
                <FullScoreTrend/>
                <ScoreDistribution totalScoreLevel={totalScoreLevel} changeLevels={this.props.changeLevels}/>
                <SubjectDistribution totalScoreLevel={totalScoreLevel}/>
                <ClassPerformance totalScoreLevel={totalScoreLevel}/>
                <SubjectPerformance/>
                <GroupAnalysis totalScoreLevel={totalScoreLevel}/>
                <StudentPerformance/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        schoolAnalysis: state.schoolAnalysis
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initSchoolAnalysis: bindActionCreators(initSchoolAnalysisAction, dispatch),
        changeLevels: bindActionCreators(changeLevelAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolReport);
