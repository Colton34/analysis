import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';


const LevelReport = (data) => {
    const config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: '分档报告'
        },
        xAxis: {
            categories: ['一档 15%<br /> 大于600分', '二挡 20%<br /> 大于520分','三挡 25%<br /> 大于480分'], //这个字符串可以在这里进行拼接，res.data中只提供raw number，比如15%和
                                                                                                                // 600 等
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
        }]
    };

    return (
        <div style={[styles.item, styles.common.radius]}>
            <ReactHighcharts config={config}></ReactHighcharts>
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
