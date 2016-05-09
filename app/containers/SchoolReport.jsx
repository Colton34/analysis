import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

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

class SchoolReport extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ];

    componentDidMount() {
        console.log('SchoolAnalysis componentDidMount');
        var params = initParams(this.props.params, this.props.location, {'request': window.request});
        this.props.initSchoolAnalysis(params);
    }


    render () {
        return (
            <div style={{width: 1000,margin: '0 auto', marginTop: 20, backgroundColor: '#fff'}}>
                <Header/>
                <FullScoreTrend/>
                <ScoreDistribution/>
                <SubjectDistribution/>
                <ClassPerformance/>
                <SubjectPerformance/>
                <GroupAnalysis/>
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
        initSchoolAnalysis: bindActionCreators(initSchoolAnalysisAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolReport);
