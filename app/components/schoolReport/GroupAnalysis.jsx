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
import {NUMBER_MAP as numberMap} from '../../lib/constants';

import styles from '../../common/common.css';
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
            return;
        };


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
            return;
        }
        this.isUpdate = true;
    }

    okClickHandler() {
        var formValid = _.every(this.isValid, (flag) => flag);

        if(!formValid) {
            console.log('表单没通过');
            return;
        }

        if(!this.isUpdate) {
            console.log('表单没有更新');
            return;
        }
        this.isUpdate = false;

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

    render() {
        // var {totalScoreLevel} = this.props;
        var _this = this;

        this.levelBuffers = this.props.levelBuffers;
        this.isValid = _.map(_.range(this.levelBuffers.length), (index) => true);
        this.isUpdate = false;

        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide.bind(this) }>
                <Header closeButton style={{textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                    设置临界生分数
                </Header>
                <Body style={{padding: 30}}>
                    <div style={{ minHeight: 150, display: 'table', margin:'0 auto'}}>
                        <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                        {
                            _.map(this.levelBuffers, (buffer, index) => {
                                return (
                                    <div key={index} style={{textAlign: 'center', marginBottom: index === this.levelBuffers.length - 1 ? 0 : 30}}>
                                        {numberMap[index+1]}档线上下浮分数：
                                        <input ref={'buffer-' + index} onBlur={_this.onInputBlur.bind(_this, index) } defaultValue={this.levelBuffers[this.levelBuffers.length-1-index]} style={{ width: 140, heigth: 28, display: 'inline-block', textAlign: 'center' }}/>分
                                    </div>
                                )
                            })
                        }
                        </div>
                    </div>
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
        // debugger;
//自定义Module数据结构：

        return (
            <div className={styles['school-report-layout']}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    临界生群体分析
                </div>

            {/*--------------------------------  临界生群体分析Header -------------------------------------*/}
                <div className={styles['school-report-content']}>
                    <p>
                        将临近总分各分数线上下的群体视为“临界生”，学校可以给他们多一点关注，找到他们的薄弱点、有针对性促进一下，他们就坑稳定、甚至提升总分档次。
                        这个无论是对学生个人，还是对学校整体的教学成就，都有显著的积极作用。全校临界生群体规模，见下表：
                    </p>
                    <a href="javascript:void(0)" onClick={this.onShowDialog.bind(this) }className={styles.button} style={{ width: 130, height: 30, position: 'absolute', right: 0, color: '#b686c9' }}>
                        <i className='icon-cog-2'></i>
                        设置临界分数
                    </a>

                    {/*--------------------------------  临界生群体分析表格 -------------------------------------*/}
                    <TableView tableData={tableData} reserveRows={6}/>

                    {/*     _.keys(studentsGroupByClass).length > 5 ? (<a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>) : ''   */}

                {/*--------------------------------  TODO: 临界生群体分析说明 -------------------------------------*/}

{/*

                                            {_.map(_.range(_.size(levels)), (lindex) => {
                                                return (
                                                    <span key={lindex} style={{ color: '#00955e' }}>{_.join(disData[index].top, '、')}</span>{numberMap[index]}档临界生人数较{pindex == 0 ? '多' : '少'}{(pindex == 0 && lindex == (_.size(levels)-1)) ? '可以更多的关注这几个班级的同学。' : (lindex == (_.size(levels)-1) ? '。' : '，')}
                                                )
                                            })}

*/}

                    <div className={styles.tips}>
                        <p>数据分析表明：</p>
                        {
                            (_.size(disData.top) == 0 || _.size(disData.low) == 0) ? (<p>只有一个班级，没有可比性</p>) : (
                                    _.map(_.range(2), (pindex) => {
                                            return (
                                                <p key={pindex}>
                                                    {
                                                        _.map(_.range(_.size(levels)), (lindex) => {
                                                            return (
                                                                <span key={lindex} >
                                                                    <span style={(pindex == 0) ? {color: '#c96925'} : { color: '#00955e' } }>{_.join(disData[(pindex ==0) ? 'top' : 'low'][lindex], '、')}</span>{numberMap[lindex+1]}档临界生人数较{(pindex == 0) ? '多' : '少'}
                                                                    {(pindex == 0 && lindex == (_.size(levels)-1)) ? '可以更多的关注这几个班的同学' : (lindex == (_.size(levels)-1) ? '。' : '，')}
                                                                </span>
                                                            )
                                                        })
                                                    }
                                                </p>
                                            )
                                        }
                                    )
                                )
                        }
                    </div>
                </div>
                <Dialog levels={levels} levelBuffers={levelBuffers} updateLevelBuffers={this.props.updateLevelBuffers} show={this.state.showDialog} onHide={this.onHideDialog.bind(this)}/>
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
// debugger;

// console.log('=============== criticalStudentsTable');
// console.log(table);
// console.log('=====================================');

//     var criticalDis = criticalStudentsDiscription(criticalLevelInfo);  Done

// console.log('=============== criticalStudentsDiscription');
// console.log(criticalDis);
// console.log('=====================================');

    return {tableData: table, criticalLevelInfo: criticalLevelInfo};
}

function makeCriticalSegments(levelBuffers, levels) {
    //[<thirdScore-thirdBuffer>, <thirdScore+thirdBuffer>, ...]
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
