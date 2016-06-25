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
        <div className='row'>
            <div style={{ width: '100%', height: 90, lineHeight: '90px', backgroundColor: '#fff', borderRadius: 5 }}>
                <div style={{ width: 275, height: 45, lineHeight: '45px', display: 'inline-block', borderRight: '1px solid #efefef', marginLeft: 25 }}>
                    <span style={{ color: '#59bde5', fontSize: 28, marginRight: 10 }}>{data.subjectCount}</span>
                    <span>考试学科数</span>
                </div>
                <div style={{ width: 275, height: 45, lineHeight: '45px', display: 'inline-block', borderRight: '1px solid #efefef', marginLeft: 20 }}>
                    <span style={{ color: '#59bde5', fontSize: 28, marginRight: 10 }}>{data.realClassesCount}</span>
                    <span>考试班级数</span>
                </div>
                <div style={{ width: 275, height: 45, lineHeight: '45px', display: 'inline-block', borderRight: '1px solid #efefef', marginLeft: 20 }}>
                    <span style={{ color: '#59bde5', fontSize: 28, marginRight: 10 }}>{data.realStudentsCount}</span>
                    <span>考试学生数</span>
                </div>
                <div style={{ width: 275, height: 45, lineHeight: '45px', display: 'inline-block', marginLeft: 20 }}>
                    <span style={{ color: '#de5d44', fontSize: 28, marginRight: 10 }}>{data.lostStudentsCount}</span>
                    <span>缺考学生数</span>
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
