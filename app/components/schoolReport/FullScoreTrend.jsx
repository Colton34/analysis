import React from 'react';
import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import ReactHighcharts from 'react-highcharts';

import {makeSegments, makeSegmentsStudentsCount} from '../../api/exam';

const FullScoreTrend = ({examInfo, examStudentsInfo}) => {
//算法数据结构：
    var result = theTotalScoreTrenderChart(examInfo, examStudentsInfo);

    // y轴数据预处理
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
        title: {
            text: '',
            x: -20 //center
        },
        xAxis: {
            categories: result['x-axon']
        },
        yAxis: {
            title: {
                text: '人数'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function(){
                return '分数区间：<b>' + 
                        (this.point.first ? '[' : '(') + 
                        this.point.low + ',' + this.point.high + ']</b><br/>' + 
                        '人数:<b>' + this.point.y + '人</b>';
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
        <div className={schoolReportStyles['section']}>
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
                    <p>从总分分布曲线图来看，基本呈现“钟型分布”，即中档学生人数较多，两端（高分段，低分段）学生人数较少，这种分布属于正常状态，但作为学校水平性考试，还是希望高分段学生人数更多为好</p>
                </div>
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
