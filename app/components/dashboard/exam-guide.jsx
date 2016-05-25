import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';

import {initExamGuide} from '../../reducers/dashboard/actions';

/*

    return {
        subjectCount: exam['[papers]'].length,
        realClassesCount: exam.realClasses.length,
        realStudentsCount: exam.realStudentsCount,
        lostStudentsCount: exam.lostStudentsCount
    };

 */

const GlobalGuideCom = ({data}) => {
//     if(!data || !data.data || (_.size(_.keys(data))==0)) return (<div></div>);
// console.log('examGuide = ', data);

    return (
        <div className={dashboardStyle.card}>
            <div className={dashboardStyle['card-title']}>考试总览</div>
            <div  style={{marginTop: 30, marginBottom: 30}}>
                <div style={{float: 'left', marginLeft: 40}}>
                    <div style={styles.dataNum}>{data.subjectCount}</div>
                    <div>考试学科数</div>
                </div>
                <div style={{float: 'right', marginRight: 40}}>
                    <div style={styles.dataNum}>{data.realClassesCount}</div>
                    <div>考试班级数</div>
                </div>
            </div>
            <div style={{clear: 'both'}}></div>
            <div style={{marginTop:30, marginBottom: 30}}>
                <div style={{float: 'left', marginLeft: 40}}>
                    <div style={styles.dataNum}>{data.realStudentsCount}</div>
                    <div>考试学生数</div>
                </div>
                <div style={{float: 'right', marginRight: 40}}>
                    <div style={styles.dataNum}>{data.lostStudentsCount}</div>
                    <div>缺考学生数</div>
                </div>
            </div>
        </div>
    )
}

GlobalGuideCom.propTypes = {
    data: PropTypes.object.isRequired
};

export default Radium(GlobalGuideCom);

const styles = {
    dataNum: {
        textAlign: 'center',
        color: '#0f6afc',
        fontSize: 24,
        marginBottom: 20
    }
};
