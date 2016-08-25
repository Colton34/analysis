// 历史表现比较：按排名率比较
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

export default function RankRateContrast() {
    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: '(排名率)',
            floating: true,
            x: -510,
            y: 43,
            style: {
                "color": "#767676",
                "fontSize": "12px"
            }
        },
        subtitle: {
            text: '按排名率比较',
            floating: true,
            x: -520,
            y: 20,
            style: {
                "color": "#000",
                "fontSize": "14px"
            }
        },
        xAxis: {
            tickWidth: '0px',//不显示刻度
            categories: ['语文', '数学', '英语', '政治', '地理', '历史', '化学', '物理', '生物', '语文'],
        },
        yAxis: {
            allowDecimals: true,//刻度允许小数
            lineWidth: 1,
            gridLineDashStyle: 'Dash',
            gridLineColor: '#f2f2f3',
            title: {
                text: ''
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#f2f2f3'
            }],
        },
        credits: {
            enabled: false
        },

        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'top'
        },
        plotOptions: {
            column: {
                pointWidth: 16,//柱宽
            }
        },
        series: [
            {
                name: '第一次期中考试',
                color: '#0099ff',
                data: [0.1, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.2, 0.1, 0.2],
            }, {
                name: '第一次期末考试',
                color: '#33cccc',
                data: [0.1, 0.3, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3],
            }
        ],
        tooltip: {
            enabled: false,
            backgroundColor: '#000',
            borderColor: '#000',
            style: {
                color: '#fff'
            },
            formatter: function () {
                return this.series.name + ':' + this.point.y + '人'
            }
        },
    };
    return (
        <ReactHighcharts config={config} style={{ width: '100%', height: '400px' }}></ReactHighcharts>
    )
}

//前提条件：考试的班级相同，考试的科目也要相同
function temp(currentExamsZScore, categories, currentClass) {
    //每场考试中当前班级和其他班级的各个科目的Z值比较的名次
    var data, target, temp, rowData;
    _.each(currentExamsZScore, (classExamsZScore, examid) => {
        //一场考试得出一个结果
        temp = {};
        _.each(classExamsZScore, (currentClassExamsZScore, className) => {
            //每个班级的ZScoreInfo，按照categories得到相关数值的数组，然后和本班的比较--如果本班没有数据那么就是"undefined"即可
            data = _.map(categories, (obj) => {
                target = _.find(currentClassExamsZScore.examZScore, (zsObj) => zsObj.pid == obj.id);
                return (target) ? parseFloat(target.zScore) : 'undefined'
            });
            temp[className] = data;
            //已经按照cetagories组织好，进行对比，排名
            rowData = _.map(categories, (obj, i) => {
                if (temp[currentClass][i] == 'undefined') return 'undefined';
                var classSubjectZScore = _.map(temp, (values, className) => {
                    return {
                        zScore: values[i],
                        className: className
                    }
                });
//当前这个班级是考了这个科目，但是上次考试一共5个班级考了，这次考试只有3个考了。。。名次怎么算？
            })
        })
    })
}
