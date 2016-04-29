import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';

const ClassReport = (data) => {

console.log('classReport = ', data.data);

    var title = data.data.title.concat('班级分析报告');
    var subtitle = data.data.title.concat('平局分对比Top5');
    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        xAxis: {
            categories: data.data.sortedClass,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '平均分值'
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: '班级',
            data: data.data.sortedScore

        }]
    };

    return (
        <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}]}>
            <ReactHighcharts config={config}></ReactHighcharts>
        </div>
    )
}

export default Radium(ClassReport);

const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, overflow: 'hidder'}
};
