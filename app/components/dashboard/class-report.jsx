import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

const ClassReport = (data) => {
    if(!data || !data.data || (_.size(_.keys(data.data))==0)) return (<div></div>);//所以这也是应该使用Immutable.Record的理由--有默认值就不会有下面的undefined bug


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
        }],
        credits: {
            enabled: false
        }
    };


    return (
        <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}, {display: 'flex', padding: 10}]}>
            <ReactHighcharts config={config} style={{margin: '0 auto'}}></ReactHighcharts>
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
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, overflow: 'hidden'}
};
