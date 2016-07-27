import React from 'react';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from './dashboard.css';
import ReactHighcharts from 'react-highcharts';

/**
 * grade, examid, 
 * toViewSchoolAnalysis: 返回校级报告的函数
 */
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
            <div onClick={this.props.toViewSchoolAnalysis}
                onMouseEnter={this.onHeaderMouseEnter.bind(this)}
                onMouseLeave={this.onHeaderMouseLeave.bind(this)}
                style={_.assign({}, localStyles.linkHeader, this.state.hoverLink ? { color: '#27aef8' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>校级分析报告</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </div>
        )
    }
}

class SchoolReportCard extends React.Component {
   constructor(props) {
        super(props);
   }
   toViewSchoolAnalysis() {
        var {grade, examid} = this.props;
        var targetUrl = grade ? '/school/report?examid=' + examid + '&grade=' + grade : '/school/report?examid=' + examid;
        browserHistory.push(targetUrl);
    }
    render() {
        var _this = this;
        var {examid, grade, data} = this.props;
        var queryOptions = (grade) ? {examid: examid, grade: grade} : {examid: examid};

        // y轴数据预处理
        data['y-axon'] = data['y-axon'].map((num, index) => {
            var obj = {};
            obj.y = num;
            obj.low = index === 0 ? 0 : data['x-axon'][index - 1];
            obj.high = data['x-axon'][index];
            if (index === 0) {
                obj.first = true;
            }
            return obj;
        })
        var config = {
             chart: {
                type: 'line'
            },
            title: {
                text: '',
                x: -20 //center
            },
            xAxis: {
                categories: data['x-axon']
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
                enabled: false
            },
            series: [{
                name: 'school',
                data: data['y-axon']
            }],
            credits: {
                enabled: false
            }
        }
        return (
            <div style={{ display: 'inline-block', height: 388, padding: '0 0 0 10px', cursor: 'pointer'}} onClick={this.toViewSchoolAnalysis.bind(this)} className='col-md-6'>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                    <CardHeader grade={grade} examid={examid} toViewSchoolAnalysis={this.toViewSchoolAnalysis.bind(this)}/>
                    {/*<div className={dashboardStyle['school-report-img']} style={{marginTop: 30}}></div>*/}
                    <ReactHighcharts config={config} style={{ width: 535, height: 240, marginTop: 30}}></ReactHighcharts>
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
export default SchoolReportCard;