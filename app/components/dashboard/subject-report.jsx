import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {browserHistory} from 'react-router';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';
import {COLORS_MAP as colorsMap} from '../../lib/constants';


/**
 * toViewAnalysis: 返回校级报告的函数
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
    render(){
        var config={
            chart: {
                type: 'column'
            },
            title: {
                text: '(贡献指数)',
                floating:true,
                x:-510,
                y:43,
                style:{
                    "color": "#767676",
                    "fontSize": "12px"
                }
            },
            subtitle: {
                text: '',
                floating:true,
                x:-520,
                y:20,
                style:{
                    "color": "#000",
                    "fontSize": "14px"
                }
            },
            xAxis: {
                tickWidth:'0px',//不显示刻度
                title:{
                    align:'high',
                    text:'学科',
                    margin:0,
                    offset:7
                },
                categories:['语文','数学']//x轴数据
            },
            yAxis: {
                allowDecimals:true,//刻度允许小数
                lineWidth:1,
                gridLineDashStyle:'Dash',
                gridLineColor:'#f2f2f3',
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#f2f2f3'
                }],
            },
            credits:{
                enabled:false
            },
            legend:{
                enabled:true,
                align:'center',
                verticalAlign:'top'
            },
            plotOptions: {
                column: {
                    pointWidth:16,//柱宽
                }
            },
            tooltip:{
                enabled:true,
                backgroundColor:'#000',
                borderColor:'#000',
                style:{
                    color:'#fff'
                },
                formatter: function(){
                    return this.point.y
                }
            },
            series:{
                name:'mingzi',
                data:[10,20]
            }
        };

        return (
        <div style={{display: 'inline-block', height: 317, padding: '0 10px 0 0', cursor: 'pointer'}}  className='col-lg-4 dashboard-card'
            onClick={this.viewSubjectReport.bind(this)}
            >
            <div style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                <CardHeader toViewAnalysis={this.viewSubjectReport.bind(this)} />
                {/*}<ReactHighcharts config={config} style={{ maxWidth: 330, maxHeight: 230, marginTop: 20}}></ReactHighcharts>*/}
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
