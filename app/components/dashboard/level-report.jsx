import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
const ReactHighcharts = require('react-highcharts');

const config = {
    chart: {
        type: 'bar'
    },
    title: {
        text: '分档报告'
    },
    xAxis: {
        categories: ['一档 15%<br /> 大于600分', '二挡 20%<br /> 大于520分','三挡 25%<br /> 大于480分'],
        title: {
            text: null
        }
    },
    tooltip: {
        valueSuffix: '分'
    },
    series: [{
        name: '分数',
        data: [40, 260, 480]
    }],
    credits: {
        enabled: false
    }
};

const LevelReport = (data) => {
    return (
        <div style={[styles.item, styles.common.radius].concat({display: 'flex', padding: 10})}>
            <ReactHighcharts config={config} style={{margin: '0 auto'}}></ReactHighcharts>
        </div>
    )
}

export default Radium(LevelReport);

const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, overflow: 'hidder'}
};
