import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';

import {initExamGuide} from '../../reducers/dashboard/actions';


const GlobalGuideCom = ({data}) => {
//     if(!data || !data.data || (_.size(_.keys(data))==0)) return (<div></div>);
// console.log('examGuide = ', data);

    return (
        <div style={[styles.item, styles.common.radius]}>
            <div style={{fontWeight: 'blod', marginTop: 10}}>考试总览</div>
            <div  style={{marginTop: 30, marginBottom: 30}}>
                <div style={{float: 'left', marginLeft: 40}}>
                    <div style={{marginBottom: 20}}>{data.subjectCount}</div>
                    <div>考试学科数</div>
                </div>
                <div style={{float: 'right', marginRight: 40}}>
                    <div style={{marginBottom: 20}}>{data.totalProblemCount}</div>
                    <div>考试总题数</div>
                </div>
            </div>
            <div style={{clear: 'both'}}></div>
            <div  style={{marginTop:30, marginBottom: 30}}>
                <div style={{float: 'left', marginLeft: 40}}>
                    <div style={{marginBottom: 20}}>{data.classCount}</div>
                    <div>考试班级数</div>
                </div>
                <div style={{float: 'right', marginRight: 40}}>
                    <div style={{marginBottom: 20}}>{data.totalStudentCount}</div>
                    <div>考试学生数</div>
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
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15}
};
