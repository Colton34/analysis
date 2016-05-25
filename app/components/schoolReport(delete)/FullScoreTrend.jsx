import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';


const FullScoreTrend = () => {
    var config = {
        title: {
            text: '',
            x: -20 //center
        },
        xAxis: {
            categories: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700]
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
            valueSuffix: '人数'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'school',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }],
        credits: {
            enabled: false
        }
    }
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -120, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 200 }}>
                总分分布趋势
            </div>
            <div className={styles['school-report-content']}>
                <p style={{ marginTop: 40 }}>总分趋势分布图，表达了全小学生总分的人数分布。相对于学校总平均水平而言，高分段人数比低分段人数 要多 ， 可能同时存在有 尖子生很给力 的现象。</p>
                <ReactHighcharts config={config} style={{ margin: '0 auto', marginTop: 40 }}></ReactHighcharts>
                <div style={{ width: 760, height: 90, backgroundColor: '#e9f7f0', margin: '0 auto', marginTop: 20, padding: 15 }}>
                    <p style={{ marginBottom: 20 }}>说明: </p>

                    总分分布趋势可以看出学校本次考试从低到高分的学生人数分布情况， 更加直观的展示出本次考试的总体水平。
                </div>
            </div>
        </div>
    )
}


export default FullScoreTrend;