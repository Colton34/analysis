import React, { PropTypes } from 'react';
const ReactHighcharts = require('react-highcharts');
import classNames from 'classnames/bind';
import dashboardStyle from './dashboard.css';
import _ from 'lodash';

let colorSpread = ['#963ffc', '#44cbcb', '#999bfc', '#2fca22', '#ca9acb'];
let data = {
    1: {
        average: 9.1,
        right: 31,
        wrong: 29,
        xData: ['A', 'B', 'C', 'D'],
        yData: [5, 7, 17, 31]
    }
}

const getBackgroundColor = (num) => {
    num = num.toString();
    if (!colorSpread[num]) {
        return '#9933ff';
    }
    return colorSpread[num];
}
const PaperComment = () => {
    var config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: data['1'].xData,
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        colors: ['#6dbee2'],
        series: [{
            name: '人数',
            data: data['1'].yData
        }],
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        }
    };
    return (
        <div style={{ padding: '0 15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap', margin: '15px 0 5px 0'}}>
                {
                    _.range(5).map(function (num) {
                        var color = colorSpread[num.toString()] ? colorSpread[num.toString()] : '#f36947';
                        return (
                            <span key={'question' + num} style={Object.assign({}, localStyle.questionItem, { backgroundColor: color }) }>第{num + 1}题</span>
                        )
                    })
                }
                <span  style={localStyle.questionItem}>...</span>
            </div>
            <div>
                第1题，平均得分 {data['1'].average} (答对{data['1'].right}人，答错{data['1'].wrong}人，班级平均得分率：50%)
            </div>

            <ReactHighcharts config={config} style={{ maxWidth: 300, maxHeight: 160, margin: '0 auto' }}></ReactHighcharts>
            <div className={dashboardStyle['detail-btn']}>查看详情</div>


        </div>
    )
}

export default PaperComment;

const localStyle = {
    questionItem: {
        textAlign: 'center', color: '#fff', width: '15%', height: 20, backgroundColor: '#f36947', display: 'inline-block', margin: '0 2px'
    }
};
