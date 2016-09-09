import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {browserHistory} from 'react-router';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import dashboardStyle from './dashboard.css';
import {COLORS_MAP as colorsMap} from '../../lib/constants';
import {SUBJECTS_WEIGHT as subjectWeight} from '../../lib/constants';

class CardHeader extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            hoverLink: false
        }
    }

    onHeaderMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    onHeaderMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        return (
            <div onClick={this.props.toViewAnalysis}
                onMouseEnter={this.onHeaderMouseEnter.bind(this)}
                onMouseLeave={this.onHeaderMouseLeave.bind(this)}
                style={_.assign({}, localStyles.linkHeader, this.state.hoverLink ? { color: '#27aef8' } : { color: '#333' }) }>
                <div id='scoreRankHeader' style={_.assign({},{ height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#333' })}>
                    <span style={{ color: '#333', fontSize: 16, marginRight: 10, color: 'inherit'}}>学科分析报告</span>
                    <span style={{ float: 'right', color: 'inherit' }}><i className='icon-right-open-2'></i></span>
                </div>
            </div>
        )
    }
}

class SubjectReport extends React.Component {
    constructor(props) {
        super(props);
    }
    viewSubjectReport() {
        var {examid, grade} = this.props;
        var targetUrl = grade ? '/subject/report?examid=' + examid + '&grade=' + grade : '/subject/report?examid=' + examid;
        browserHistory.push(targetUrl);
    }
    render() {
        var meanRateInfo = formatSubjectMeanRateInfo(this.props.data);
        var xData = _.map(meanRateInfo,(obj) => {return obj.subject});
        var seriesData = _.map(meanRateInfo,(obj) => {return obj.meanRate})
        debugger;
        var config = {
            chart: {
                type: 'column'
            },
            title: {
                text: '(平均得分率)',
                floating: true,
                x: -95,
                y: 3,
                style: {
                    "color": "#767676",
                    "fontSize": "12px"
                }
            },
            xAxis: {
                tickWidth: '0px',//不显示刻度
                categories: xData,
            },
            yAxis: {
                allowDecimals: true,//刻度允许小数
                lineWidth: 1,
                gridLineDashStyle: 'Dash',
                gridLineColor: colorsMap.C03,
                title: {
                    text: ''
                },
            },
            credits: {
                enabled: false
            },

            legend: {
                enabled: false,
                align: 'center',
                verticalAlign: 'top',
                symbolHeight: 1,
                symbolWidth: 0
            },
            plotOptions: {
                column: {
                    pointWidth: 16,//柱宽
                }
            },
            series: [
                {
                    color: colorsMap.B03,
                    data: seriesData
                }
            ],
            tooltip: {
                enabled: true,
                backgroundColor: '#000',
                borderColor: '#000',
                style: {
                    color: '#fff'
                },
                formatter: function () {
                    return this.point.y
                }
            },
        };
        return (
        <div style={{display: 'inline-block', height: 317, padding: '0 10px 0 0', cursor: 'pointer'}}  className='col-lg-4 dashboard-card'
            onClick={this.viewSubjectReport.bind(this)}>
            <div style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                <CardHeader toViewAnalysis={this.viewSubjectReport.bind(this)} />
                <ReactHighcharts config={config} style={{ maxWidth: 330, maxHeight: 230, marginTop: 20}}></ReactHighcharts>
            </div>
        </div>
    )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
}

export default Radium(SubjectReport);

function formatSubjectMeanRateInfo(origianlInfo) {
    var result = [], restPapers = [];
    var totalScoreMeanRateInfo = origianlInfo[0];
    origianlInfo = _.slice(origianlInfo, 1);
    _.each(origianlInfo, (obj) => {
        var index = _.findIndex(subjectWeight, (s) => ((s == obj.subject) || (_.includes(obj.subject, s))));
        if (index >= 0) {
            result.push({
                index: index,
                subject: obj.subject,
                meanRate: obj.meanRate
            });
        } else {
            restPapers.push(obj);
        }
    });
    result = _.sortBy(result, 'index');
    result.unshift(totalScoreMeanRateInfo);
    result = _.concat(result, restPapers);
    return result;
}
