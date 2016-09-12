import React from 'react';
import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import ReactHighcharts from 'react-highcharts';
import StatisticalLib from 'simple-statistics';

import { COLORS_MAP as colorsMap, B03, C04, C07, C12, C14 } from '../../lib/constants';
import {makeSegments, makeSegmentsCount} from '../../api/exam';
import subjectReportStyle from '../../styles/subjectReport.css';
const FullScoreTrend = ({reportDS}) => {
    var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS();
//算法数据结构：
    var result = theTotalScoreTrenderChart(examInfo, examStudentsInfo);

    // y轴数据预处理, 第一个区间两边均为闭区间，其他均为左开右闭
    result['y-axon'] = result['y-axon'].map((num, index) => {
        var obj = {};
        obj.y = num;
        obj.low = index === 0 ? 0 : result['x-axon'][index - 1];
        obj.high = result['x-axon'][index];
        if (index === 0) {
            obj.first = true;
        }
        return obj;
    })

//自定义Module数据结构
    var config = {
        colors:['#00adfb'],
        title: {
            text: '(人数)',
            floating:true,
            x:-370,
            y:5,
            style:{
              "color": "#767676",
               "fontSize": "14px"
            }

        },
        xAxis: {
          tickWidth:'0px',//不显示刻度
          title:{//x轴标签
              align:'high',
              text:'分数',
              margin:0,
              offset:7
          },
        categories: result['x-axon']
        },
        yAxis: {
          lineWidth:1,
          gridLineDashStyle:'Dash',
            gridLineColor:'#f2f2f3',
            title: {
                text: '',
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#f2f2f3'
            }]
        },
        tooltip: {
            backgroundColor:'#000',
            borderColor:'#000',
            style:{
                color:'#fff'
            },
            formatter: function(){
                 return (this.point.low>0?'(':'[')+this.point.low + '-' + this.point.high +']区间人数<br />'+ this.point.y +'人,占'
                 +Math.round(((this.point.y/examInfo.realStudentsCount)*100))+'%';
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            enabled: false
        },
        series: [{
            name: 'school',
            data: result['y-axon']
        }],
        credits: {
            enabled: false
        }
    }
    var summaryInfo = getSummaryInfo(examStudentsInfo);
    return (
        <div id='fullScoreTrend' style={{padding: '30px 0 30px 30px', borderRadius: 2, backgroundColor: '#fff', position: 'relative', marginBottom: 20}}>
             <div style={{marginBottom: 30}}>
                <span style={{border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left'}}></span>
                <span style={{fontSize: 18, color: C12, marginRight: 20}}>总分分布图</span> <span className={schoolReportStyles['title-desc']}>学生总分分布趋势，可反映本次考试全校学生的综合学习水平</span>
             </div>
             <div>
                <ReactHighcharts config={config} style={{ width: 870, height: 330, display: 'inline-block'}}></ReactHighcharts>
                <FullScoreInfo yData={result['y-axon']}/>
                <div style={{paddingRight:30}}>
                    <div className={subjectReportStyle['analysis-conclusion']}>
                        <div>分析诊断：</div>
                        <div>{summaryInfo}</div>
                    </div>
                </div>
                <div style={{clear: 'both'}}></div>
             </div>
        </div>
    )
}


export default FullScoreTrend;

/**
 * props:
 * yData: highChart图数据的y轴数据
 */
class FullScoreInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showScroll : false,
            needScroll: this.props.yData.length > 8 ? true : false  //列表超过8个就会需要滚动条
        }
    }
    onMouseEnter() {
        if (!this.state.needScroll) return;
        this.setState({showScroll: true})
    }
    onMouseLeave() {
        if (!this.state.needScroll) return ;
        this.setState({showScroll: false});
    }
    render() {
        var {yData} = this.props;
        return (
            <ul style={_.assign({ width: 240, height: 360, padding: '20px 0 40px 20px', marginBottom: 0, backgroundColor: C14, border: '1px solid ' + C04, position: 'absolute', right: 0, top: 38,listStyleType: 'none', fontSize: 12 }, this.state.showScroll ? { overflowY: 'scroll'}: {overflowY: 'hidden'})} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
                {
                    yData.map((data, index) => {
                        return (
                            <li key={'fullScoreTrend-li-' + index} style={{height: 40, lineHeight: '40px', display: 'table-row' }}>
                                <span className={schoolReportStyles['list-dot']} style={{ width: 20, height: 40, lineHeight: '40px', textAlign: 'center', display: 'table-cell', verticalAlign: 'middle'}}></span>
                                <span style={{ marginRight: 20, display: 'table-cell', width: 110, textAlign: 'left', borderBottom: '1px dashed ' + C04}}>{(index === 0 ? '[' + data.low : '(' + data.low) + ',' + data.high + ']分区间'}</span>
                                <span style={{ marginRight: 20, display: 'table-cell', width: 50, textAlign: 'left',  borderBottom: '1px dashed ' + C04}}>{data.y}</span>
                                <span style={{ display: 'table-cell', textAlign: 'left', borderBottom: '1px dashed ' + C04, }}>人</span>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }
 }
function theTotalScoreTrenderChart(examInfo, examStudentsInfo) {
    var segments = makeSegments(examInfo.fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsCount(examStudentsInfo, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function getSummaryInfo(examStudentsInfo) {
    var skewness = _.round(StatisticalLib.sampleSkewness(_.map(examStudentsInfo, (obj) => obj.score)), 2);
    if(skewness < -0.3) {
        return '以全年级总分平均分来衡量，这次考试本年级高于平均分的学生人数较多，相应高分段的学生人数密度来的较大，而低分段学生的成绩拉扯全年级平均分较为显著，请提醒班主任及学科老师多关注底端的学生。鼓励他们提高总分水平，极有利于提高本班总平均分水平。';
    } else if(skewness < -0.5) {
        return '以全年级总平均分来衡量，这次考试本年级高于平均分的学生人数稍多一点，相应高分段的学生密度还是大一些。低分段学生的成绩对本年级总分水平有一定的影响，鼓励他们提高总分水平，有利于提高本年级的总平均水平。';
    } else if(skewness < 0.05) {
        return '以全年级总平均分来衡量，这次考试本年级处于总平均分两边的学生人数基本相当。总分分布比较对称。';
    } else if(skewness < 0.3) {
        return '以全年级总分平均分来衡量，这次考试本年级高于平均分的学生人数比平均分以下学生人数稍少一点，相应低分段学生人数密度稍大一些。但是高分度学生的总分水平比较给力，他们对全年级总平均分的提高有较大贡献。';
    } else  return '以全年级总分平均分来衡量，这次考试本年级低于平均分的学生人数较多，相应高分段学生人数密来的较小。但是高分度学生的总分水平很给力，他们对全年级总平均分的保持较高水平有极大贡献。';

}
