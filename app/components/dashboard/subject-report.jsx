import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
const ReactHighcharts = require('react-highcharts');

const config = {
    chart: {
        polar: true,
        type: 'line'
    },

    title: {
        text: 'Budget vs spending',
        x: -80
    },

    pane: {
        size: '80%'
    },

    xAxis: {
        categories: ['语文', '数学', '英语', '政治',
                '历史', '地理'],
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
        data: [43000, 19000, 60000, 35000, 17000, 10000],
        pointPlacement: 'on'
    }],
    credits: {
        enabled: false
    }

};

const SubjectReport = (data) => {
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

