import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../common/DropdownList';
class AverageCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentClass:{key:'yuwen',value:'yuwen'}
        }
    }
    onClickDropdownList(item) {
        this.setState({
            currentClass: item
        })
    }

    render(){
        var config={
            chart: {
                type: 'column'
            },
            colors:['#0099ff'],
            title: {
                text: '平均分',
                floating:true,
                x:-510,
                y:43,
                style:{
                    "color": "#767676",
                    "fontSize": "12px"
                }
            },

            xAxis: {
                tickWidth:'0px',//不显示刻度
                title:{
                    align:'high',
                    text:'科目',
                    margin:0,
                    offset:7
                },
                categories:classes//x轴数据
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
            series:[{
                name:'平均分',
                data:data
            }]
        };
    return (
        <div className={commonClass['section']} style={{position:'relative'}}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>教学班平均分对比</span>
            <span className={commonClass['title-desc']}></span>
            <div>
                <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                    <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                        <span style={{ marginRight: 10}}>学科：</span>
                            {classes.map((course, index) => {
                                return (
                                    <a key={'papers-' + index}    style={ localStyle.subject}>{course}</a>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            <div style={{width:92,height:32,position: 'absolute', right: 50, top: 110,zIndex:10}}>
            <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this) } list={classList} fixWidth/>
            </div>
            <div style={{marginTop:30}}>
            <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
            </div>
        </div>
    )
    }
}

export default AverageCompare;
var localStyle = {
    subject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    },

}

var classes = ['语文1','数学1','英语1','语文2','数学2','英语2'];
var data = [20,30,40,50,60,70];
var classList = [{
    key:'chinese',
    value:'语文'
},{
    key:'math',
    value:'数学'
}];
