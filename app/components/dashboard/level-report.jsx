import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

const LevelReport = (data) => {
    if(!data || !data.data || (_.size(_.keys(data))==0)) return (<div></div>);
    const leveFlag = ['一档', '二挡', '三挡'];
console.log('levelReport = ', data.data);
    var categories = _.map(data.data.levels, function(value, index) {
        return ''.concat(leveFlag[index]).concat(' ').concat(value[0]).concat('<br />').concat(' 大于').concat(value[1]).concat('分');
    });


console.log('levelCountItem = ', data.data.levelCountItem);


    const config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: '分档报告'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            //['一档 15%<br /> 大于600分', '二挡 20%<br /> 大于520分','三挡 25%<br /> 大于480分']
            categories: categories, //这个字符串可以在这里进行拼接，res.data中只提供raw number，比如15%和600 等
            title: {
                text: null
            }
        },
        tooltip: {
            valueSuffix: '分'
        },
        series: [{
            name: '分数',
            data: data.data.levelCountItem
        }]
    };

    return (
        <div style={[styles.item, styles.common.radius].concat({display: 'flex', padding: 10})}>
            <ReactHighcharts config={config} style={{margin: '0 auto'}}></ReactHighcharts>
        </div>
    )
}

export default Radium(LevelReport);

const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, overflow: 'hidder'}
};
