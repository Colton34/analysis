import React, { PropTypes } from 'react';
import {Component} from 'react';

import Header from '../components/schoolReport/Header';
import FullScoreTrend from '../components/schoolReport/FullScoreTrend';
import ScoreDistribution from '../components/schoolReport/ScoreDistribution';
import SubjectDistribution from '../components/schoolReport/SubjectDistribution';
import ClassPerformance from '../components/schoolReport/ClassPerformance';
import SubjectPerformance from '../components/schoolReport/SubjectPerformance';
import GroupAnalysis from '../components/schoolReport/GroupAnalysis';
import StudentPerformance from '../components/schoolReport/StudentPerformance/StudentPerformance';;
class SchoolReport extends Component {
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

export default SchoolReport;