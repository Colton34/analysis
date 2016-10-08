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

const GlobalGuideCom = ({data, isLiankao}) => {
    return (
        <div className='row'>
            <div style={{ width: '100%', height: 87, lineHeight: '87px', backgroundColor: '#fff', borderRadius: 2, display: 'table-cell', verticalAlign: 'middle'}}>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{data.subjectCount}</span>
                    <span style={localStyle.descStyle}>考试学科数</span>
                    <span style={localStyle.borderBox}></span>
                </div>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{data.realClassesCount}</span>
                    <span style={localStyle.descStyle}>考试{isLiankao ? '学校': '班级'}数</span>
                    <span style={localStyle.borderBox}></span>
                </div>
                <div style={localStyle.inlineBox}>
                    <span style={localStyle.numStyle}>{data.realStudentsCount}</span>
                    <span>考试学生数</span>

                </div>
{/*
                <div style={localStyle.inlineBox}>
                    <span style={_.assign({}, localStyle.numStyle, {color: '#f4664b'})}>{data.lostStudentsCount}</span>
                    <span>缺考学生数</span>
                </div>
*/}
            </div>
        </div>
    )
}

var localStyle = {
    inlineBox: {width: 375, height: 45, lineHeight: '45px', float: 'left', display: 'inline-block', marginLeft: 25, position: 'relative'},
    borderBox: {display: 'inline-block', height: 27,borderRight: '1px solid #efefef', position: 'absolute', top: '50%', marginTop: -13.5, right: 0},
    numStyle:  {color: '#1daef8', fontSize: 36, marginRight: 10 },
    descStyle: {fontSize: 14}
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
