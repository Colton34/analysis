import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

const SubjectReport = (data) => {

    if(!data || !data.data || (_.size(_.keys(data))==0) || data.data.size == 0) return (<div></div>);
console.log('subjectReport = ', data.data);

    const config = {
        chart: {
            polar: true,
            type: 'line'
        },

        title: {
            text: '学科分析报告',
            x: -80
        },

        pane: {
            size: '80%'
        },


        credits: {
            enabled: false
        },

        xAxis: {
            categories: data.data.subjects,
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        series: [{
            name: '科目',
            data: data.data.weight,
            pointPlacement: 'on'
        }]

    };

    return (
        <div style={[styles.item, styles.common.radius, {display: 'flex', padding: 10}]}>
            <ReactHighcharts config={config} style={{margin: '0 auto'}}></ReactHighcharts>
        </div>
    )
}

export default Radium(SubjectReport);

const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, overflow: 'hidden'}
};

