//学科考试内在表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ECharts from 'react-echarts';
//mork 数据
var goodQuestion = '第一题第二题';
var badQuestion = '第三题第四题';
var currentSubject = '语文';

//K线图数据
var chartData = [{
    distinguish:0.12,
    number:'第14题',
    value:[0.26,0.12,0.26,0.12]
},
{
    distinguish:0.12,
    number:'第14题',
    value:[0.4,0.42,0.4,0.42]
},
{
    distinguish:0.12,
    number:'第14题',
    value:[0.35,0.45,0.35,0.45]
},
{
    distinguish:0.12,
    number:'第14题',
    value:[0.12,0.32,0.12,0.32]
},
{
    distinguish:0.12,
    number:'第14题',
    value:[0.56,0.65,0.56,0.65]
}
];
//雷达图数据
var classQuestionLevelGroupMeanRate= [0.2, 0.27, 0.44, 0.58, 0.68];
var gradeQuestionLevelGroupMeanRate = [0.2, 0.31, 0.44, 0.57, 0.7];
//mork 数据结束
export default function QuestionPerformance({}) {
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科试题考试内在表现</span>
            <span className={commonClass['title-desc']}></span>
            <SummaryCard />
            <SummaryText />
            <PerformanceChart />
            <QuestionMeanRateChart />
        </div>
    )
}

function SummaryCard({}) {
    return (
        <div style={{marginTop:30}}>
            <Card title={goodQuestion} titleStyle={{color: colorsMap.B04,fontSize:'24px'}} desc={'表现较好的题目'} style={{marginRight:20}}></Card>
            <Card title={badQuestion} titleStyle={{color: colorsMap.B08,fontSize:'24px'}} desc={'表现不足的题目'} ></Card>
        </div>
    )
}

function SummaryText({}) {
    return (
        <div style={{marginTop:30}}>
          <span>下图是本次考试，{currentSubject}学科所有试题区分度/难度的表现分布情况，其中通过柱形图重点展示出表现较好和表现不足的部分试题。</span>
          <ul style={{paddingLeft:15}}>
            <li style={{paddingLeft:0,marginTop:'5px',fontSize:'14px',color:'#6a6a6a'}}>绿色柱形图表示题目表现较好，该题目本班的得分率高于全年级的平均得分率。图形高度表示高于的大小.</li>
            <li style={{paddingLeft:0,fontSize:'14px',color:'#6a6a6a'}}>红色柱形图表示题目表现不足，该题目本班的得分率低于全年级的平均得分率。图形高度表示低于的大小.</li>
          </ul>
        </div>
    )
}

function PerformanceChart({}) {
    var option = {
        title: {
            text: '',
        },
        xAxis: {
            name:'(区分度)',
            nameLocation:'end',
            nameTextStyle:{
                color:'#767676',
                fontSize:12
            },
            type: 'category',
            axisLine: {//轴线
                lineStyle:{
                    color:'#c0d0e0',
                }
            },
            axisTick:{//刻度
                show:false,
            },
            splitLine: {//分割线
                show: true,
                lineStyle:{
                    color:'#f2f2f2',
                    type:'dashed'
                }
            },
        },
        yAxis: {
            // scale: false,//刻度是否从零开始
            name:'(得分率)',
            nameLocation:'end',
            nameTextStyle:{
                color:'#767676',
                fontSize:12
            },
            axisLine: {//轴线
                lineStyle:{
                    color:'#c0d0e0',
                }
            },
            axisTick:{//刻度
                show:false,
            },
            splitLine: {//分割线
                show: true,
                lineStyle:{
                    color:'#f2f2f2',
                    type:'dashed'
                }
            },
        },
        textStyle:{
                 color:'#000'
               },
        // tooltip: {
        //                formatter: function (param) {
        //                    return param.data.number+'<br/>'+'区分度：'+param.data.distinguish+'<br/>'+'得分率：'+param.data.value[0]+'<br/>'+'高于年级平均：'+(param.data.value[1]-param.data.value[0]).toFixed(2);
        //                }
        //            },
        series: [
            {
                type: 'candlestick',
                itemStyle: {
                    normal: {
                    //  width:10,
                        color: 'rgb(105, 193, 112)',
                        color0: 'rgb(238, 107, 82)',
                        borderColor: 'rgb(105, 193, 112)',
                        borderColor0: 'rgb(238, 107, 82)'
                    }
                }
            }
        ]
    };
    option.xAxis.data = _.map(chartData, (obj) => obj.distinguish);
    option.series[0].data = chartData;
    return (
        <div >
            <ECharts option={option} style={{width:1340,height:400,position:'relative',left:-100,top:0}}></ECharts>
        </div>
    )
}

function QuestionMeanRateChart({}) {
    var questionLevelTitles = ['容易题组', '较容易题组', '中等题组', '较难题组', '最难题组'];
    var indicator = _.map(questionLevelTitles, (qt) => {
        return {
            name: qt,
            max: 1
        }
    });
    var option = {
        tooltip: {},
        legend: {
            data: ['班级平均得分率', '年级平均得分率'],
            right:25,
            top:25,
            orient:'vertical',
            textStyle:{
              color:'#6a6a6a'
            },
        },
        radar: {
            indicator: indicator,
            radius:150,
            splitNumber:3,//刻度数目
            axisTick:{show:false},//刻度
            axisLabel:{show:false},//刻度数字
            splitArea: {
                    areaStyle: {
                        color: ['#fff',
                        '#fff', '#fff',
                        '#fff', '#fff'],
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        shadowBlur: 0
                    }
                },
                name: {
               textStyle: {
                   color: '#6a6a6a'
               }
           },
                splitLine: {//分割线颜色
                lineStyle: {
                    color: '#f2f2f3'
                },
              },
                axisLine: {
               lineStyle: {
                   color: '#f2f2f3'
               }
           }


        },
        series: [{
            name: '班级vs年级',
            type: 'radar',
            //areaStyle: {normal: {}},
            color:['#0099ff','#B1B1B1']
        }]
    };
    option.series[0].data = [
        {
            value: _.reverse(classQuestionLevelGroupMeanRate),
            name: '班级平均得分率'
        },
        {
            value: _.reverse(gradeQuestionLevelGroupMeanRate),
            name: '年级平均得分率'
        }
    ];
    return (
        <div>
            <span className={commonClass['sub-title']}>试题难度表现的差异情况</span>
            <div style={{width: 1140, height: 400, border: '1px solid' + colorsMap.C05, borderRadius: 2,marginBottom:20,marginTop:30}}>
                <div style={{width:600,height:400,margin:'0 auto'}}>
                    <ECharts option={option} ></ECharts>
                </div>
            </div>
        </div>
    )
}

const Card = ({title, desc, style, titleStyle}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 560,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({lineHeight: '40px', fontSize: 32, marginTop: 15, width: 560}, localStyle.lengthControl, titleStyle ? titleStyle : {})}
                    title={title}
                    >
                    {title}
                </p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}
var localStyle = {
    card: {
        display: 'inline-block', width: 560, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    },
    lengthControl: {
        overflow: 'hidden', whiteSpace: 'pre', textOverflow: 'ellipsis'
    }
}
