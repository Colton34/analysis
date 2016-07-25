import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';
import {List} from 'immutable';

import Table from '../../common/Table';

import {updateLevelBuffersAction} from '../../reducers/schoolAnalysis/actions';
import {makeSegmentsStudentsCount} from '../../api/exam';
import {NUMBER_MAP as numberMap, A11, A12, B03, B04, B08, C12, C05, C07} from '../../lib/constants';

import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import TableView from './TableView';

var {Header, Title, Body, Footer} = Modal;

let localStyle = {
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'}
}

class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.isValid = _.map(_.range(this.props.levelBuffers.length), (index) => true);
        this.isUpdate = false;
        this.levelBuffers = this.props.levelBuffers;
        this.state = {
            hasError: false,
            errorMsg: ''
        }
    }

    onChange(ref, event) {
        this.refs[ref].value = event.target.value;
    }

    onInputBlur(index) {
        var value = parseInt(this.refs['buffer-'+ index].value); //TODO: 为什么不能直接取value？
        //TODO:因为这里直接对没有值的情况return了，所以必须都有有效的初始值！！！这里初始值都是10

        var levBufLastIndex = this.levelBuffers.length - 1;
        if (!(value && _.isNumber(value) && value >= 0)) {
            console.log('输入不是有效的数字');
            this.isValid[levBufLastIndex-index] = false;
            this.setState({
                hasError: true,
                errorMsg: numberMap[index + 1 + ''] + '档浮动分数输入不是有效数字'
            })
            return;
        };
        this.isValid[levBufLastIndex-index] = true;
        if(this.levelBuffers[levBufLastIndex-index] == value) {
            console.log('没有更新');
            return;
        }

        //levelBuffers的顺序是和levels对应的--显示的时候是倒序
        this.levelBuffers[levBufLastIndex-index] = value;
        //检测如果添加了此buffer，那么保证顺序是对的，由小到大。拿到当前生成的两个值，左边的要比它左边的大，右边的要比它右边的小（前提是如果左右边有值的话）：
        var newSegments = makeCriticalSegments(this.levelBuffers, this.props.levels);
        var segmentsIsValid = _.every(_.range(newSegments.length-1), (index) => (newSegments[index+1] > newSegments[index]));
        if(!segmentsIsValid) {
            console.log('newSegments is invalid');
            this.setState({
                hasError: true,
                errorMsg: '浮动分数过大'
            })
            return;
        }
        this.isUpdate = true;
        if(this.state.hasError) {
            this.setState({
                hasError: false,
                errorMsg: ''
            })
        }
    }

    okClickHandler() {
        var formValid = _.every(this.isValid, (flag) => flag);

        if(!formValid || this.state.hasError) {
            console.log('表单没通过');
            this.setState({
                hasError: true,
                errorMsg: '浮动分数填写有误'
            })
            return;
        }
        if(!this.isUpdate) {
            console.log('表单没有更新');
            this.setState({
                hasError: true,
                errorMsg: '未更新浮动分数'
            })
            return;
        }
        this.isUpdate = false;

        if(this.state.hasError) {
            this.setState({
                hasError: false,
                errorMsg: ''
            })
        }
        //调用父类传递来的函数  this.props.updateLevelBuffers(this.levelBuffers)，从而更新父类
        this.props.updateLevelBuffers(this.levelBuffers);
        this.props.onHide();

        // var levels = this.props.totalScoreLevel.length;
        // var floatScores = [];
        // for(var i=0; i < levels; i++) {
        //     floatScores.push(parseFloat(this.refs['float-' + i].value));
        // }
        // console.log('================== set float scores: ' + JSON.stringify(floatScores));
    }

    onHide() {
        this.setState({
            hasError: false,
            errorMsg: ''
        })
        this.isValid = _.map(_.range(this.props.levelBuffers.length), (index) => true);
        this.isUpdate = false;
        this.props.onHide();
    }
    render() {
        // var {totalScoreLevel} = this.props;
        var _this = this;

        // this.levelBuffers = this.props.levelBuffers;
        // this.isValid = _.map(_.range(this.levelBuffers.length), (index) => true);
        // this.isUpdate = false;
        var {levels} = this.props;
        var levelNum = _.size(levels);
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.onHide.bind(this) }>
                <Header closeButton style={{textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                    设置临界分数
                </Header>
                <Body style={{padding: 30}}>
                    <div style={{ minHeight: 150}}>
                        <div style={{marginBottom: 20}}>
                            考试成绩分为{levelNum}档，
                        {
                            _.join(_.range(levelNum).map(num => {
                                var index = levelNum - num -1;
                                return numberMap[num + 1] + '档' + levels[index].score + '分'
                            }), ',')
                        }
                        </div>
                        <div>
                        {
                            _.map(this.levelBuffers, (buffer, index) => {
                                return (
                                    <div key={index} style={{marginBottom: index === this.levelBuffers.length - 1 ? 0 : 30}}>
                                        {numberMap[index+1]}档线上下浮分数：
                                        <input ref={'buffer-' + index} onBlur={_this.onInputBlur.bind(_this, index) } defaultValue={this.levelBuffers[this.levelBuffers.length-1-index]} style={{ width: 280, heigth: 34, display: 'inline-block', textAlign: 'left', paddingLeft: 20, margin: '0 20px'}}/>分
                                    </div>
                                )
                            })
                        }
                        </div>
                    </div>
                    <div style={_.assign({},{color: A11, width: '100%', textAlign: 'center', marginTop: 20}, this.state.hasError ? {display: 'inline-block'} : {display: 'none'})}>{this.state.errorMsg}</div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0, padding: '0 0 30px 0' }}>
                    <a href="javascript:void(0)" style={_.assign({}, localStyle.btn, { backgroundColor: '#59bde5', color: '#fff' })} onClick={_this.okClickHandler.bind(_this) }>
                        确定
                    </a>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={this.props.onHide}>
                        取消
                    </a>
                </Footer>
            </Modal>
        )
    }
}
/**
 * props:
 * totalScoreLevel: 分档数据;
 *
 *
 */
class GroupAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false
        }
    }
    onShowDialog() {
        this.setState({
            showDialog: true
        })
    }
    onHideDialog() {
        this.setState({
            showDialog: false
        })
    }

//     updateLevelBuffers(newLevelBuffers) {
// console.log('updateLevelBuffers = ', newLevelBuffers);

//         this.setState({
//             levelBuffers: newLevelBuffers
//         });
//     }

    render() {
//Props数据结构：
        var {examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers} = this.props;

        levelBuffers = (List.isList(levelBuffers)) ? levelBuffers.toJS() : levelBuffers;
        if((!levelBuffers || _.size(levelBuffers) == 0)) return (<div></div>)
//算法数据结构：
        var {tableData, criticalLevelInfo} = criticalStudentsTable(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers);

        var disData = criticalStudentsDiscription(criticalLevelInfo); //缺少UI

        var levels=[];
        for(let i in criticalLevelInfo){
          levels[i]=(criticalLevelInfo[i].sort(function(a,b){return a.count<b.count;})).slice(0,3);
        }//每档前三
        var xdata=['一档','二档','三档','四档','五档'];//x轴要显示的数据列表
        var finData=xdata.slice(0,levels.length);
        var colorList=['#00abfe','#00d3c8','#45c44e','#00abfe','#45c44e'];//颜色列表
        var serisData=[];var datas=[];
        for(let i=0;i<3;i++){
          serisData[i]=[];
            for(let j=0;j<levels.length;j++){
              serisData[i][j]={
                  name:examInfo.gradeName+levels[j][i].class+'班',
                  y:levels[j][i].count,
                  color:colorList[j]

            };
          }

        }
//自定义Module数据结构：
var config={
chart: {
    type: 'column'
},
title: {
    text: '',
},
subtitle: {
    text: '(人数)',
    floating:true,
    x:-500,
    y:43,
    style:{
      "color": "#767676",
       "fontSize": "12px"
    }

},

xAxis: {
  tickWidth:'0px',//不显示刻度
    categories: finData
},
yAxis: {
  lineWidth:1,
gridLineDashStyle:'Dash',
title: {
                text: ''
            },
},
credits:{
  enabled:false
},
tooltip:{
enabled:false,
backgroundColor:'#000',
borderColor:'#000',
style:{
  color:'#fff'
},
formatter: function(){
     return this.point.name;
}
},
legend:{
enabled:false,
align:'center',
verticalAlign:'top'
},
plotOptions: {
            column: {
              cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000',
                    style: {
                        fontWeight: 'bold'
                    },
                    formatter: function() {
                        return this.point.name ;
                    }
                }
            }
        },
  series: [{
    name:'一档',

    data:serisData[0],
  },
  {
    name:'二档',
    data:serisData[1],
  },
  {
    name:'三档',
    data:serisData[2]
  }
]

};
        return (
            <div id='groupAnalysis' className={schoolReportStyles['section']}>
                <div style={{ marginBottom: 30 }}>
                    <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                    <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>临界生群体分析</span>
                    <span style={{ fontSize: 12, color: C07 }}>临界生群体分析，通过设置临界分数线来计算全校及各班的总分在不同分档分数线左右徘徊的人数分布</span>
                    <a href="javascript:void(0)" onClick={this.onShowDialog.bind(this) }className={styles.button} style={{ width: 120, height: 30, backgroundColor: A12, color: '#fff', float: 'right', borderRadius: 2, lineHeight: '30px' }}>
                        <i className='icon-cog-2'></i>
                        设置临界分数
                    </a>
                </div>
                <TableView tableData={tableData} reserveRows={7}/>
                {/*****************临界生较多班级*************/}
                <p style={{ marginBottom: 20, marginTop: 40 }}>
                    <span className={schoolReportStyles['sub-title']}>临界生较多班级</span>
                  <span className={schoolReportStyles['title-desc']}>临界生较多班级，存在更大提高班级该档上线率的空间，学校和班级应该基于更多关注，对整体教学成就有显著的积极作用。</span>
                </p>
                {/* todo： 图待补充 */}
                <div style={{width:1110,height:280,display:'inline-block',paddingTop:30,marginRight:30}}>
                  <ReactHighcharts config={config} style={{width: '100%', height: '100%'}}></ReactHighcharts>
                </div>
                <Dialog levels={levels} levelBuffers={levelBuffers} updateLevelBuffers={this.props.updateLevelBuffers} show={this.state.showDialog} onHide={this.onHideDialog.bind(this) }/>
            </div>
        )
    }
}

//设计：这里将GroupAnalysis作为container，而不是pure render function--就是为了降级，将整个校级分析只是作为一个集装箱，而不是container component
export default connect(mapStateToProps, mapDispatchToProps)(GroupAnalysis);

function mapStateToProps(state) {
    return {
        levelBuffers: state.schoolAnalysis.levelBuffers
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateLevelBuffers: bindActionCreators(updateLevelBuffersAction, dispatch)
    }
}

function criticalStudentsTable(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers) {
    // levels = levels || makeDefaultLevles(examInfo, examStudentsInfo);
    // levelBuffers = levelBuffers || _.map(_.range(_.size(levels)), (index) => 10);

    var table = [], criticalLevelInfo = {};

    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });

    var titleHeader = _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index+1] + '档临界生人数';
    });
    titleHeader.unshift('分档临界生');

    table.push(titleHeader);

    var segments = makeCriticalSegments(levelBuffers, levels);

    var totalSchoolCounts = makeSegmentsStudentsCount(examStudentsInfo, segments);

    var totalSchool = _.filter(totalSchoolCounts, (count, index) => (index % 2 == 0));

    totalSchool = _.reverse(totalSchool);
    totalSchool.unshift('全校');
    table.push(totalSchool);

    _.each(studentsGroupByClass, (students, className) => {
        var classCounts = makeSegmentsStudentsCount(students, segments);
        var classRow = _.filter(classCounts, (count, index) => (index % 2 == 0));//从低到高
        classRow = _.reverse(classRow); //从高到底

        _.each(classRow, (count, index) => {
            criticalLevelInfo[index].push({'class': className, count: count});//因为这里使用的是反转后得到classRow，所以这里criticalLevelInfo中的
                                                                                    //levelKey是颠倒后的，即小值代表高档
        });

        classRow.unshift(examInfo.gradeName+className+'班');
        table.push(classRow);
    });
    return {tableData: table, criticalLevelInfo: criticalLevelInfo};
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}

//TODO:如果是1个班级--即targetCount===0，即result的top和low中没有任何内容的时候，显示文案“无可比性...”
function criticalStudentsDiscription(criticalLevelInfo) {  //Done
    //上面的 criticalLevelInfo，已经是反转后的数据了
    // 每一档
    var result = {top: {}, low: {}};
    _.each(criticalLevelInfo, (counts, levelKey) => {
        var baseLineCount = counts.length - 1;
        var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));

        if(targetCount == 0) return;

        var orderedCounts = _.sortBy(counts, 'count');// 升序
        var top = _.map(_.takeRight(orderedCounts, targetCount), (cobj) => cobj.class+'班');
        result.top[levelKey] = top;
        var low = _.map(_.take(orderedCounts, targetCount), (cobj) => cobj.class+'班');
        result.low[levelKey] = low;
    });
    return result;//小值代表高档
}

/*
let tableData = {
    ths: [
        '分档临界生', '一档临界生人数', '二档临界生人数', '三档临界生人数'
    ],
    tds: [
        ['全部', 30, 43, 64],
        ['1班', 30, 43, 64],
        ['2班', 30, 43, 64],
        ['3班', 30, 43, 64]
    ]
}

 */
