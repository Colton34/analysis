import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';

const ClassReport = ({data}) => {
    console.log('data.data = ', data.data);
    if (!data || !data.data || (_.size(_.keys(data.data)) == 0) || data.data.size == 0) return (<div></div>);//所以这也是应该使用Immutable.Record的理由--有默认值就不会有下面的undefined bug



    var title = data.data.title.concat('初一年级班级平均分对比top5');
    var subtitle = data.data.title.concat('');
    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: title,
            floating: true,
            align: 'center',
            y: 10,
            style: {
                fontSize: '5px'
            }
        },
        subtitle: {
            text: subtitle
        },
        colors: ['#FDBF2A'],
        xAxis: {
            categories: data.data.sortedClass,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '平均分值'
            },
            gridLineColor: '#fff',
            plotLines: [{
                color: 'red',                                //线的颜色，定义为红色
                dashStyle: 'solid',                          //默认是值，这里定义为长虚线
                value: data.data.averageScore,              //定义在那个值上显示标示线
                width: 2,                                    //标示线的宽度，2px
                label: {
                    text: '年级平均分',                       //标签的内容
                    align: 'right',                         //标签的水平位置，水平居左,默认是水平居中center
                    x: 10,                                   //标签相对于被定位的位置水平偏移的像素，重新定位，水平居左10px
                    style: {
                        fontSize: '14px'
                    }
                },
                zIndex: 5
            }]
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
        },
        legend: {
            enabled: false
        }
    };


    return (
        <div>
            <div style={{ marginTop: 20 }}>
                <ReactHighcharts config={config} style={{ maxWidth: 300, maxHeight: 200, margin: '0 auto' }}></ReactHighcharts>
            </div>
            <div className={dashboardStyle['detail-btn']}>查看详情</div>
        </div>
    )
}

export default Radium(ClassReport);