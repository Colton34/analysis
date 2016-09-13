import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';
import {List} from 'immutable';

import Table from '../../common/Table';

import {makeSegmentsCount, makeSegmentsCountInfo} from '../../api/exam';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap, A11, A12, B03, B04, B08, C12, C05, C07} from '../../lib/constants';

import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import TableView from '../../common/TableView';
import EnhanceTable from '../../common/EnhanceTable';
var {Header, Title, Body, Footer} = Modal;

import {initParams} from '../../lib/util';

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

    componentWillReceiveProps(nextProps) {
        this.isValid = _.map(_.range(nextProps.levelBuffers.length), (index) => true);
        this.isUpdate = false;
        this.levelBuffers = nextProps.levelBuffers;
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
        var invalidIndex = -1;
        var segmentsIsValid = true;

        segmentsIsValid = _.every(_.range(newSegments.length-1), (index) => {
            var valid = newSegments[index+1] > newSegments[index]
            invalidIndex = valid ? -1 : (levBufLastIndex - parseInt(index/2));
            return valid;
        });
        if(!segmentsIsValid) {
            console.log('newSegments is invalid');
            this.setState({
                hasError: true,
                errorMsg: numberMap[invalidIndex] + '、' + numberMap[invalidIndex + 1] + '档浮动分数重合'
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

        var newBaseline = getNewBaseline(this.props.levels, this.props.examStudentsInfo, this.props.examPapersInfo, this.props.examId, this.props.examInfo, this.levelBuffers);
        var params = initParams({ 'request': window.request, examId: this.props.examId, grade: this.props.grade, baseline: newBaseline });
        this.props.saveBaseline(params);

        this.props.onHide();
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
        var _this = this;
        var {levels} = this.props;
        var levelNum = _.size(levels);
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.onHide.bind(this) }>
                <Header closeButton={false} style={{textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                     <button className={styles['dialog-close']} onClick={this.onHide.bind(this)}>
                        <i className='icon-cancel-3'></i>
                    </button>
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
                                        <input ref={'buffer-' + index} onBlur={_this.onInputBlur.bind(_this, index) } defaultValue={this.levelBuffers[this.levelBuffers.length-1-index]} style={{ width: 280, height: 34, display: 'inline-block', textAlign: 'left', paddingLeft: 20, margin: '0 20px'}}/>分
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
            showDialog: false, 
            currentLevel: 0
        }
        var {reportDS} = props;
        var examStudentsInfo = reportDS.examStudentsInfo.toJS(),
            studentsGroupByClass = reportDS.studentsGroupByClass.toJS(),
            levels = reportDS.levels.toJS(),
            levelBuffers = reportDS.levelBuffers.toJS(), 
            headers = reportDS.headers.toJS(),
            subjectLevels = reportDS.subjectLevels.toJS();
        var classList = _.keys(studentsGroupByClass);
        this.tableRenderData = getCriticalStudentsTableRenderData(examStudentsInfo, levels, levelBuffers, headers, classList, subjectLevels);
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
    switchTab(num) {
        this.setState({
            currentLevel: num
        })
    }
    render() {
        //Props数据结构：
        var {reportDS} = this.props;
        var {currentLevel} = this.state;
        var examInfo = reportDS.examInfo.toJS(),
            examStudentsInfo = reportDS.examStudentsInfo.toJS(),
            examPapersInfo = reportDS.examPapersInfo.toJS(),
            studentsGroupByClass = reportDS.studentsGroupByClass.toJS(),
            levels = reportDS.levels.toJS(),
            levelBuffers = reportDS.levelBuffers.toJS(), 
            headers = reportDS.headers.toJS(),
            subjectLevels = reportDS.subjectLevels.toJS();
        //算法数据结构：
        var {tableData, criticalLevelInfo} = criticalStudentsTable(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers);

        var xAxis = _.map(levels, (levObj, levelKey) => numberMap[(levelKey-0)+1]+'档');
        var disData = criticalStudentsDiscription(criticalLevelInfo);

        var serisData = {}, colorList=['#0099ff','#33cc33','#33cccc','#ff9900','#ff6633','#6666cc'];//TODO: 颜色列表
        _.each(disData, (dataMap, dataKey) => {
            var serisItem = [];
            _.each(dataMap, (dataArr, levelKey) => {
                _.each(dataArr, (data, index) => {
                    var eachLevelIndex = serisItem[index];
                    if(!eachLevelIndex) {
                        eachLevelIndex = [];
                        serisItem[index] = eachLevelIndex;
                    }
                    eachLevelIndex.push({
                        name: data.class + '班',
                        y: data.count,
                        color: colorList[levelKey-0]
                    });
                });
            });
            serisData[dataKey] = serisItem;
        });
        var serisDataTop = _.map(serisData.top, (data, index) => {
            return {
                name: numberMap[index] + '档',
                data: data
            }
        });
        var serisDataLow = _.map(serisData.low, (data, index) => {
            return {
                name: numberMap[index] + '档',
                data: data
            }
        });


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
                categories: xAxis
            },
            yAxis: {
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
            tooltip:{
                enabled:true,
                backgroundColor:'#000',
                borderColor:'#000',
                style:{
                    color:'#fff'
                },
                formatter: function(){
                    return this.point.y;
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
                  pointWidth:16,
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
            series: serisDataTop
        };
        var showHighChart = (_.size(disData.top) == 0) || (_.size(disData.low) == 0);
        return (
            <div id='groupAnalysis' className={schoolReportStyles['section']}>
                <div style={{ marginBottom: 30 }}>
                    <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                    <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>临界生群体分析</span>
                    <span className={schoolReportStyles['title-desc']}>临界生群体分析，通过设置临界分数线来计算全校及各班的总分在不同分档分数线左右徘徊的人数分布</span>
                    <a href="javascript:void(0)" onClick={this.onShowDialog.bind(this) }className={styles.button} style={{ width: 120, height: 30, backgroundColor: colorsMap.B03, color: '#fff', float: 'right', borderRadius: 2, lineHeight: '30px' }}>
                        <i className='icon-cog-2'></i>
                        设置临界分数
                    </a>
                </div>
                {/****************** 切换标签 *************** */}
                <div className='tab-ctn'>
                    <ul>
                        {
                            _.range(_.size(levels)).map((num) => {
                                return (
                                    <li key={'levelInfo-li-' + num} onClick={this.switchTab.bind(this, num) } className={'fl ' + (num === this.state.currentLevel ? 'active' : '') } data-num={num}>{numberMap[num + 1]}档线临界生分析</li>
                                )
                            })
                        }
                    </ul>
                </div>
                <TableView hover tableHeaders={this.tableRenderData[currentLevel].tableHeaders} tableData={this.tableRenderData[currentLevel].tableData} TableComponent={EnhanceTable} reserveRows={7}/>
                {/*****************临界生较多班级*************/}
                <p style={{ marginBottom: 20, marginTop: 40 }}>
                    <span className={schoolReportStyles['sub-title']}>临界生较多班级</span>
                  <span className={schoolReportStyles['title-desc']}>临界生较多班级，存在更大提高班级该档上线率的空间，学校和班级应该基于更多关注，对整体教学成就有显著的积极作用。</span>
                </p>
                {
                    showHighChart ? (
                        <div style={{color: colorsMap.C10}}>只有一个班级没有可比性</div>
                    )  : (
                        <div style={{ width: 1110, height: 280, display: 'inline-block', paddingTop: 30, marginRight: 30 }}>
                            <ReactHighcharts config={config} style={{ width: '100%', height: '100%' }}></ReactHighcharts>
                        </div>
                    )
                }

                <Dialog examId={this.props.examId} grade={this.props.grade} levels={levels} levelBuffers={levelBuffers} examInfo={examInfo} examStudentsInfo={examStudentsInfo} examPapersInfo={examPapersInfo} updateLevelBuffers={this.props.updateLevelBuffers} saveBaseline={this.props.saveBaseline} show={this.state.showDialog} onHide={this.onHideDialog.bind(this) }/>
            </div>
        )
    }
}

//设计：这里将GroupAnalysis作为container，而不是pure render function--就是为了降级，将整个校级分析只是作为一个集装箱，而不是container component
export default GroupAnalysis;

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

    var totalSchoolCounts = makeSegmentsCount(examStudentsInfo, segments);

    var totalSchool = _.filter(totalSchoolCounts, (count, index) => (index % 2 == 0));

    _.reverse(totalSchool);
    totalSchool.unshift('全校');
    table.push(totalSchool);

    _.each(studentsGroupByClass, (students, className) => {
        var classCounts = makeSegmentsCount(students, segments);
        var classRow = _.filter(classCounts, (count, index) => (index % 2 == 0));//从低到高
        _.reverse(classRow); //从高到底

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
function criticalStudentsDiscription(criticalLevelInfo) {
    //上面的 criticalLevelInfo，已经是反转后的数据了--但是只是针对level进行反转，但是还需要对最终的结果展示进行反转
    var result = {top: {}, low: {}};
    _.each(criticalLevelInfo, (counts, levelKey) => {
        var baseLineCount = counts.length - 1;
        var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));

        if(targetCount == 0) return;

        var orderedCounts = _.sortBy(counts, 'count');// 降序
        var top = _.reverse(_.takeRight(orderedCounts, targetCount));
        result.top[levelKey] = top;
        var low = _.reverse(_.take(orderedCounts, targetCount));
        result.low[levelKey] = low;
    });
    return result;//小值代表高档
}

//TODO:重构
function getNewBaseline(levels, examStudentsInfo, examPapersInfo, examId, examInfo, levelBuffers) {
    //通过新的levels计算subjectMeans，levelBuffer不变
    var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
    _.each(levels, (levObj, levelKey) => {
        var subjectMean = makeLevelSubjectMean(levObj.score, examStudentsInfo, examPapersInfo, examInfo.fullMark);
        var subjectLevels = _.values(subjectMean);
        result['[subjectLevels]'].push({levelKey: levelKey, values: subjectLevels});
        result['[levels]'].push({key: levelKey, score: levObj.score, percentage: levObj.percentage, count: levObj.count});
        result['[levelBuffers]'].push({key: levelKey, score: levelBuffers[levelKey-0]});
        //拼装 [levels]，[subjectLevels]和[levelBuffers]所对应的每一个实体，放入到相对应的数组中，最后返回gradeExamLevels
    });
    return result;
}

function makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark) {
    var result = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(levelScore));
    var count = result.length;

    var currentLowScore, currentHighScore;
    currentLowScore = currentHighScore = _.round(levelScore);

    while ((count < 25) && (currentLowScore >= 0) && (currentHighScore <= examFullMark)) {
        currentLowScore = currentLowScore - 1;
        currentHighScore = currentHighScore + 1;
        var currentLowStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentLowScore));
        var currentHighStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentHighScore));

        var currentTargetCount = _.min([currentLowStudents.length, currentHighStudents.length]);
        var currentTagretLowStudents = _.take(currentLowStudents, currentTargetCount);
        var currentTargetHighStudents = _.take(currentHighStudents, currentTargetCount);
        count += _.multiply(2, currentTargetCount);
        result = _.concat(result, currentTagretLowStudents, currentTargetHighStudents);
    }

    //result即是最后获取到的满足分析条件的样本，根据此样本可以获取各个科目的平均分信息
    return makeSubjectMean(result, examPapersInfo);
}

/**
 * 返回所给学生各科成绩的平均分。注意这里没有没有包括总分(totalScore)的平均分信息
 * @param  {[type]} students       [description]
 * @param  {[type]} examPapersInfo [description]
 * @return {[type]}                [description]
 */
function makeSubjectMean(students, examPapersInfo) {
    var result = {};
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};
        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.name = examPapersInfo[pid].subject; //TODO: 这里还是统一称作 'subject' 比较好
        obj.id = pid;

        result[pid] = obj;
    });
    return result;
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
function getCriticalStudentsTableRenderData(allStudents, levels, levelBuffers, headers, classList, subjectLevels) {
    var renderData = {};
    var studentsInfo = makeCriticalStudentsInfo(allStudents, levels, levelBuffers); // 其中0代表一档
    //获取tableHeaders
    var tableHeaders = getTableHeaders(headers);
    var levelSize = _.size(levels);
    //依次获取各档次的表格数据；
    _.forEach(studentsInfo, (students, levelNum) => {
        var tableData = getOneLevelTableData(levels, subjectLevels, tableHeaders, students, classList, levelNum);
        renderData[levelNum] = {tableHeaders, tableData};
    })
    return renderData;

}
// 确定高档位的位置
function makeCriticalStudentsInfo(students, levels, levelBuffers) {
    var criticalLevelInfo = {};
    _.forEach(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCountsInfoArr = makeSegmentsCountInfo(students, segments);
    var classRow = _.filter(classCountsInfoArr, (countInfo, index) => (index % 2 == 0));//从低到高
    classRow = _.reverse(classRow); //从高到底

    _.forEach(classRow, (arr, index) => {
        criticalLevelInfo[index] = arr;//这里是反转后的数据。
    });

    return criticalLevelInfo;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.forEach(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}

function getTableHeaders(headers) {
    var tableHeaders = [[{id: 'class', name: '班级'}, {id: 'count', name: '临界生人数'}]];
    _.forEach(headers, headerInfo => {
        var headerObj = {};
        headerObj.id = headerInfo.id;
        headerObj.name = headerInfo.subject + '平均分';
        if (headerInfo.id !== 'class'  || headerInfo.id !== 'count') {
            headerObj.columnStyle = getTableColumnStyle;
        }
        tableHeaders[0].push(headerObj);
    })
    return tableHeaders;
}

function getOneLevelTableData(levels, subjectLevels, tableHeaders, students, classList, currentLevel) {
    var meanDataByClass = getMeanDataByClass(students);
    var classNames = ['分档分数线', '全年级'].concat(classList);
    var tableData = [];
    _.forEach(classNames, (className, index) => {
        var rowData = {};
        if(index >= 1) {
            _.forEach(tableHeaders[0], header => {
                if (header.id === 'class') {
                    rowData.class = index !== 1 ? className + '班' : '全年级';
                } else if (header.id === 'count') {
                    rowData.count = index !== 1 ? (meanDataByClass[className] ? meanDataByClass[className].totalScore.count : 0) : students.length;
                } else {
                    if (index !== 1){ // 各班级
                        var subjectMeanInfo = meanDataByClass[className] && meanDataByClass[className][header.id] ? meanDataByClass[className][header.id]: 0; 
                        rowData[header.id] = subjectMeanInfo ? _.round(subjectMeanInfo.scoreSum / subjectMeanInfo.count, 2) : 0;
                    } else { // 全年级
                        var subjectMeanInfo = meanDataByClass.totalGrade[header.id];
                        rowData[header.id] = subjectMeanInfo ? _.round(subjectMeanInfo.scoreSum / subjectMeanInfo.count, 2) : 0;
                    }
                    
                }
            })
        } else if (index === 0) { //分档分数线
            var levelSize = _.size(levels);
            _.forEach(tableHeaders[0], header => {
                if (header.id === 'class') {
                    rowData.class = '分档分数线';
                } else if (header.id === 'count') {
                    rowData.count = '--';
                } else if (header.id === 'totalScore'){
                    rowData.totalScore = levels[levelSize - currentLevel - 1].score;
                } else {
                    rowData[header.id] = subjectLevels[levelSize - currentLevel - 1][header.id].mean;
                }
            })
        }
     tableData.push(rowData);
    })
    return tableData;
}
/**
 * 获取的数据结构是：
 *  {
 *      totalGrade: {
 *          totalScore: {count: , scoreSum: },
 *          paperid1: {count: , scoreSum: },
 *          ...
 *      },
 *      className1: {
 *         totalScore: {count: , scoreSum: },
 *         paperid1: {count: , scoreSum: },
 *         ...    
 *     },
 *      ...
 *  }
 * 遍历一遍临界生列表就可以获得全年级和各班的人数、分数数据；
 * 
 */
function getMeanDataByClass(students) {
    var meanDataInfo = {
        totalGrade: {
            totalScore: {count: 0, scoreSum: 0}
        }
    };
    _.forEach(students, studentObj => {
        //记录全年级总分数据
        meanDataInfo.totalGrade.totalScore.count += 1;
        meanDataInfo.totalGrade.totalScore.scoreSum += studentObj.score;

        // 记录班级总分数据
        if (!meanDataInfo[studentObj.class]) {
            meanDataInfo[studentObj.class] = {
                totalScore: {count: 0, scoreSum: 0}
            }
        } 
        meanDataInfo[studentObj.class].totalScore.count += 1;
        meanDataInfo[studentObj.class].totalScore.scoreSum += studentObj.score;
        
        // 遍历该生所有科目考试
        _.forEach(studentObj.papers, paperObj => {
            // 记录到全年级数据
            if (!meanDataInfo.totalGrade[paperObj.paperid]) {
                meanDataInfo.totalGrade[paperObj.paperid] = {count: 0, scoreSum: 0};
            }
            meanDataInfo.totalGrade[paperObj.paperid].count += 1;
            meanDataInfo.totalGrade[paperObj.paperid].scoreSum += paperObj.score;
            // 记录到班级数据里
            if (!meanDataInfo[studentObj.class][paperObj.paperid]) {
                meanDataInfo[studentObj.class][paperObj.paperid] = {count: 0, scoreSum: 0};
            }
            meanDataInfo[studentObj.class][paperObj.paperid].count += 1;
            meanDataInfo[studentObj.class][paperObj.paperid].scoreSum += paperObj.score;
        })
    })
    return meanDataInfo;
}

function getTableColumnStyle(cell, rowData, rowIndex, columnIndex, id, tableData){
    if (cell < tableData[0][id]) {
        return {color: colorsMap.B08}
    } else {
        return {}
    }
}