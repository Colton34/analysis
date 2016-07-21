import React from 'react';
import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import ReactHighcharts from 'react-highcharts';
import { B03, C04, C07, C12, C14 } from '../../lib/constants';
import {makeSegments, makeSegmentsStudentsCount} from '../../api/exam';

const FullScoreTrend = ({examInfo, examStudentsInfo}) => {
//算法数据结构：
    var result = theTotalScoreTrenderChart(examInfo, examStudentsInfo);

    // y轴数据预处理, 第一个区间两边均为闭区间，其他均为左开右闭
    result['y-axon'] = result['y-axon'].map((num, index) => {
        var obj = {};
        obj.y = num;
        obj.low = index === 0 ? 0 : result['x-axon'][index - 1];
        obj.high = result['x-axon'][index];
        if (index === 0) {
            obj.first = true;
        }
        return obj;
    })

//自定义Module数据结构
    var config = {
        colors:['#00adfb'],
        title: {
            text: '(人数)',
            floating:true,
            x:-370,
            y:5,
            style:{
              "color": "#767676",
               "fontSize": "14px"
            }

        },
        xAxis: {
          tickWidth:'0px',//不显示刻度
            categories: result['x-axon']
        },
        yAxis: {
          lineWidth:1,
          gridLineDashStyle:'Dash',
            title: {
                text: '',
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
        backgroundColor:'#000',
        borderColor:'#000',
        style:{
          color:'#fff'
        },
            formatter: function(){
                 return this.point.low + '-' + this.point.high +
                '区间人数<br />' + this.point.y + '人,占';
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            enabled: false
        },
        series: [{
            name: 'school',
            data: result['y-axon']
        }],
        credits: {
            enabled: false
        }
    }
    return (
        <div id='fullScoreTrend' style={{padding: '30px 0 30px 30px', borderRadius: 2, backgroundColor: '#fff', position: 'relative', marginBottom: 20}}>
            {/**
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div className={schoolReportStyles['section-title']} style={{ position: 'absolute', left: '50%', marginLeft: -120, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, width: 200 }}>
                总分分布趋势
            </div>
            <div className={styles['school-report-content']} style={{fontSize: 14, lineHeight: '22px'}}>
                <p style={{ marginTop: 40 }}>总学生总分趋势的分布图：是这次考试检测全校学生学生综合水平状况的一个基本表现特征。</p>
                <p>总分分布曲线图如下：</p>
                <ReactHighcharts config={config} style={{ margin: '0 auto', marginTop: 40 }}></ReactHighcharts>
                <div style={{ width: 760, minHeight: 90, backgroundColor: '#e9f7f0', margin: '0 auto', marginTop: 20}} className={styles['tips']}>
                    <p style={{ marginBottom: 20 }}>对于这次考试: </p>
                    <p>从总分分布曲线图可以看出，这次考试学生总分的分布情况，直观的反映了本次学生考试分数集中的区间，注意这些现象，有意识的调整教学。</p>
                </div>
            </div>
             */}
             <div style={{marginBottom: 30}}>
                <span style={{border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left'}}></span>
                <span style={{fontSize: 18, color: C12, marginRight: 20}}>总分分布趋势</span> <span style={{fontSize: 12, color: C07}}>学生总分分布趋势，可反映本次考试全校学生的综合学习水平</span>
             </div>
             <div style={{}}>
                <ReactHighcharts config={config} style={{ width: 870, height: 330, display: 'inline-block'}}></ReactHighcharts>
                <ul style={{width: 240, height: 360, padding: '30px 0 40px 20px', marginBottom: 0, backgroundColor: C14, border: '1px solid ' + C04, position: 'absolute', right: 0, bottom: 0, overflowY: 'scroll', listStyleType: 'none'}}>
                {
                    result['y-axon'].map((data, index) => {
                        return (
                            <li key={'fullScoreTrend-li-' + index} style={{borderBottom: '1px dashed ' + C04, height: 40, lineHeight: '40px', display: 'table-row'}}>
                                <span className={schoolReportStyles['list-dot']} style={{width: 20, height: 40, lineHeight: '40px', textAlign: 'center', display: 'table-cell'}}></span>
                                <span style={{marginRight: 20, display: 'table-cell', width: 110, textAlign: 'left'}}>{(index === 0 ? '[' + data.low : '(' + data.low) + ',' + data.high + ']分区间'}</span>
                                <span style={{marginRight: 20, display: 'table-cell', width: 50, textAlign: 'left'}}>{data.y}</span>
                                <span style={{display: 'table-cell', textAlign: 'left'}}>人</span>
                            </li>
                        )
                    })
                }
                </ul>
                <div style={{clear: 'both'}}></div>
             </div>
        </div>
    )
}


export default FullScoreTrend;

function theTotalScoreTrenderChart(examInfo, examStudentsInfo) {
    var segments = makeSegments(examInfo.fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsStudentsCount(examStudentsInfo, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}
