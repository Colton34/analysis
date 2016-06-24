import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';

const ClassReport = ({data}) => {
    // console.log('data.data = ', data.data);
    // if (!data || !data.data || (_.size(_.keys(data.data)) == 0) || data.data.size == 0) return (<div></div>);//所以这也是应该使用Immutable.Record的理由--有默认值就不会有下面的undefined bug


/*

        // var classReport = {
        //     data: {
        //         title: '',
        //         sortedClass: ['1班', '2班', '3班', '4班', '5班'],
        //         averageScore: 90,
        //         sortedScore: [49.9, 71.5, 106.4, 129.2, 144.0]
        //     }
        // }

    return {
        gradeMean: scoreMean,
        top5ClassesMean: _.takeRight(orderedClassesMean)
    };

 */
    var classNames = _.map(data['top5ClassesMean'], (obj) => obj.name+'班');
    var gradeMeans = _.range(classNames.length).map(num => {
        var obj = {};
        obj.name = '年级平均分';
        obj.value = data.gradeMean;
        obj.y = data.gradeMean;
        return obj;
    })
    var classMeans =  _.map(data['top5ClassesMean'], (obj) => {
        var newObj = {};
        newObj.name = obj.name + '班',
        newObj.value = obj.mean;
        newObj.y = obj.mean - data.gradeMean;
        return newObj;
    });
    var config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        tooltip: {
            pointFormat: '平均分:{point.value}'
        },
        colors: ['#24aef8','#35d1c7'],
        xAxis: {
            categories: classNames,
            crosshair: true,
            tickColor: '#fff',
            lineColor: '#fff'
        },
        yAxis: {
            min: 0,
            gridLineColor: '#fff'
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: '各班平均分',
            data: classMeans
        },{
            name: '年级平均分',
            data: gradeMeans
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            align: 'left'
        }
    };


    return (
        <div style={{display: 'inline-block', height: 340, padding: '0 0 0 10px'}}  className='col-lg-4'>
            <div style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px'}}>
                <div id='scoreRankHeader' style={{ height: 50, lineHeight: '50px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}>
                    <span style={{ color: '#333', fontSize: 16, marginRight: 10 }}>班级分析报告</span>
                    <span style={{ color: '#333', fontSize: 12 }}>平均分TOP5</span>
                    <span style={{ float: 'right', color: '#bfbfbf' }}>{'>'}</span>
                </div>
                 <ReactHighcharts config={config} style={{ maxWidth: 330, maxHeight: 230, marginTop: 30}}></ReactHighcharts>
            </div>
        </div>
    )
}

export default Radium(ClassReport);
