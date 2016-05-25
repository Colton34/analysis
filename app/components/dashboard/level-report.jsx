import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';

import {NUMBER_MAP as numberMap} from '../../lib/constants';

/*

有个问题：当所考科目不多的时候--即总分不高的时候，比如总共才3科总分才360--这个时候去划分三挡线是480肯定是不合适的，所以分档线应该跟着总分走
    var levels = {
        0: {
            score: 0,
            count: 0,
            percentage: 15
        },
        1: {
            score: 0,
            count: 0,
            percentage: 25
        },
        2: {
            score: 0,
            count: 0,
            percentage: 60
        }
    };
 */

const LevelReport = ({data}) => {
//这里data既是levels，注意是从大到小排序好的

    var counts = [], levelLastIndex = _.size(data) - 1;
    var categories = _.map(data, function (levObj, levelKey) {
        counts.push(levObj.count);

        return ''.concat(numberMap[levelKey-0+1]).concat('档 ').concat(levObj.percentage).concat('%<br />').concat(' 大于').concat(levObj.score).concat('分');
    });
    // counts = [40, 260, 480];//todo: 假数据删除
console.log('counts = ', counts);
// debugger;

    const config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: '分档分析报告'
        },
        credits: {
            enabled: false
        },
        colors: ['#cccdfe'],
        xAxis: {
            //['一档 15%<br /> 大于600分', '二挡 20%<br /> 大于520分','三挡 25%<br /> 大于480分']
            categories: categories, //这个字符串可以在这里进行拼接，res.data中只提供raw number，比如15%和600 等
            title: {
                text: null
            },
            lineWidth: 0,
            tickColor: '#fff'
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                enabled: false
            },
            lineWidth: 0,
            gridLineColor: '#fff'
        },
        series: [{
            name: '人数',
            data: counts
        }],
        legend: {
            enabled: false
        }
    };

    return (
        <div className={dashboardStyle.card} style={{ display: 'flex', padding: 10 }}>

                <ReactHighcharts config={config} style={{ maxWidth: 300, maxHeight: 220, margin: '0 auto' }}></ReactHighcharts>

            <div className={dashboardStyle['detail-btn']}>
                查看详情
            </div>
        </div>
    )
}

export default Radium(LevelReport);
