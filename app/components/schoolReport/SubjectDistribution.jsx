import React from 'react';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';

import Table from '../../common/Table.jsx';
import DropdownList from '../../common/DropdownList';

import {NUMBER_MAP as numberMap, A11, A12, B03, B04, B08, C12, C05, C07} from '../../lib/constants';
import {makeFactor} from '../../api/exam';
import TableView from './TableView';
import Radium from 'radium';
import {Tabs, Tab} from 'react-bootstrap';

var localStyle= {
    expanBtn: {
        float: 'left', textDecoration: 'none',
        ':hover': {
            textDecoration: 'none'
        },
        ':link' : {
            textDecoration: 'none'
        }
    }
}

class InfoBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showScroll: false,
            needScroll: _.size(this.props.disData) > 4 ? true : false
        }
    }

    onMouseEnter(e){
        if (!this.state.needScroll) return;
        this.setState({
            showScroll: true
        })
    }
    onMouseLeave(e){
        if (!this.state.needScroll) return;
        this.setState({
            showScroll: false
        })
    }

    render() {
        var {disData, studentsGroupByClass} = this.props;
        var disDataSize = _.size(disData);
        return (
            <div style={_.assign({}, { width: '100%', height: 150, marginTop: 30 }, disDataSize > 4 && this.state.showScroll ? { overflowX: 'scroll' } : {overflowX: 'hidden'})}
                 onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
                <div style={_.assign({}, { width: disDataSize * 235 }) }>
                    {/**先渲染全校数据 */}
                    <div style={{ display: 'inline-block', border: '1px solid ' + C05, width: 215, height: 115, padding: 20, marginRight: 20 }}>
                        <p style={{ marginBottom: 10, fontSize: 12 }}>全校上线贡献率</p>
                        {
                            disData['totalSchool'] ? (
                                <div>
                                    <p style={{ fontSize: 12, marginBottom: 0 }}>贡献率高：<span style={{ color: B08 }}>{_.join(disData['totalSchool'].maxSubjects, '、') }</span></p>
                                    <p style={{ fontSize: 12 }}>贡献率低：<span style={{ color: B04 }}>{_.join(disData['totalSchool'].minSubjects, '、') }</span></p>
                                </div>
                            ) : <p>只有一个科目没有可比性</p>
                        }
                    </div>
                    {
                        _.map(studentsGroupByClass, (students, className) => {
                            return (
                                <div style={{ display: 'inline-block', border: '1px solid ' + C05, width: 215, height: 115, padding: 20, marginRight: 20, fontSize: 12 }}>
                                    <p style={{ marginBottom: 10, fontSize: 12 }}>{className + '班'}上线贡献率</p>
                                    {
                                        disData[className] ? (
                                            <div>
                                                <p style={{ fontSize: 12, marginBottom: 0 }}>贡献率高：<span style={{ color: B08 }}>{_.join(disData[className].maxSubjects, '、') }</span></p>
                                                <p style={{ fontSize: 12 }}>贡献率低：<span style={{ color: B04 }}>{_.join(disData[className].minSubjects, '、') }</span></p>
                                            </div>
                                        ) : <p>只有一个科目没有可比性</p>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

/**
 * props:
 * levels: 包含分档信息的object;
 * resultData: 计算的结果；
 * studentsGroupByClass
 */
class LevelInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            activeTab: 0
        }
    }

    switchTab(event) {
        this.setState({
            activeTab: $(event.target).data('num')
        })
    }
    render() {
        var {levels, resultData, studentsGroupByClass}  = this.props;
        var {activeTab} = this.state;
        var levelStr = numberMap[activeTab + 1];
        var {tableData, disData, chartConfig} = resultData[activeTab];
        var disDataSize = _.size(disData);
        return (
            <div >
                {/* tab */}
                <div className='tab-ctn'>
                    <ul>
                    {
                        _.range(_.size(levels)).map((num) => {
                            return(
                                <li onClick={this.switchTab.bind(this)} className={'fl ' + (num === this.state.activeTab ? 'active' : '')} data-num={num}>{numberMap[num + 1]}档线上线学生人数分布</li>
                            )
                        })
                    }
                    </ul>
                </div>
                {/* 主要内容显示区 */}
                <div id='info-block'>
                   <TableView tableData={tableData} TableComponent={Table} reserveRows={7}/>
                   {/** 各科贡献率方块*/}
                   <InfoBlock studentsGroupByClass={studentsGroupByClass} disData={disData}/>
                    {/* 离差图 */}
                    <p style={{margin: '50px 0 30px 0'}}>
                        <span style={{fontSize: 16}}>学科上线率离差</span>
                        <span style={{fontSize: 12, color: C07}}>通过各班级学科上线率的差异，（学科上线率离差 = 班级某学科上线率 - 全校该学科平均上线率），反映了该学科对班级上线贡献的大小，政治白哦是该科贡献大，负值表示贡献小</span>
                    </p>
                   <ReactHighcharts config={chartConfig} style={{width: '100%'}}></ReactHighcharts>
                </div>
            </div>
        )
    }



}
const SubjectDistribution = ({examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, levels, headers}) => {

    //算法数据结构：
    var levLastIndex = _.size(levels) - 1;

    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: '(上线率离差)',
            floating:true,
            x:-480,
            y:5,
            style:{
              "color": "#767676",
               "fontSize": "14px"
            }
        },
        legend: {
            enabled: false
        },
        xAxis: {
          gridLineColor:'#f2f2f2',
            tickWidth:'0px',//不显示刻度
            gridLineWidth:1,
            gridLineDashStyle:'Dash',

        },
        yAxis: {
          lineWidth:1,
          gridLineColor:'#f2f2f2',
          gridLineDashStyle:'Dash',
            title: '',
            reversedStacks: false
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        tooltip: {
            pointFormat: '<b>{point.name}:{point.y:.1f}</b>',
            enabled: false
        },
        credits: {
            enabled: false
        }
    };

    var resultData = _.map(levels, (levObj, levelKey) => {
        var currentLevel = levels[(levLastIndex - levelKey) + ''];

//Note:（坑）本来这里subjectsMean应该是全量的--即exam中有多少papers就会有多少paper的mean信息（这和前面通过班级找此班级下各科的paper mean的方式不同）--所以理论上
//不会碰到从班级找paper时遇到因为“某班级没有考试某一科目那么就没有科目平均分的信息”的问题，但是因为走了"25算法"，此算法当遇到科目之间总分差距很大的时候，一样会导致求
//不到某一科目的平均分。如果遇到这种情况则给出被过滤掉的科目的信息，让用户知道。
        var {subjectLevelInfo, subjectsMean} = makeSubjectLevelInfo(currentLevel.score, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, examPapersInfo, examInfo.fullMark);

//设计：通过headers和subjectMean得到orderdValidSubjectMean：即，通过headers是有序的，并且避免了因为特殊原因而没有求到某些科目平均分而导致不能接着计算的问题。
//这些因为特殊原因出问题的科目记录下来给你给提示。

        var {validOrderedSubjectMean, unvalids} = filterMakeOrderedSubjectMean(headers, subjectsMean);
// console.log('unvalids == ', unvalids); -- 这里打印出（后面考虑给用户提示）被无辜抹掉的科目

        //按行横向扫描的各行RowData
        // var tableData = theSubjectLevelTable(subjectLevelInfo, subjectsMean, examInfo, headers);
        var tableData = theSubjectLevelTable(subjectLevelInfo, validOrderedSubjectMean, examInfo);
        /*
        disData: {
            <className> : {maxSubjects: [], minSubjects: []}
        }

         */
        var disData = theSubjectLevelDiscription(subjectLevelInfo, examPapersInfo);
        /*
        chartData: {
            xAxons: [<className>],
            yAxons: [ [{count: , subject: , nice: true}, {count: , subject: , nice: false}], ... ]
        }
        */
        var chartData = theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers);

        var chartConfig = _.cloneDeep(config);
        chartConfig['xAxis']['categories'] = chartData['xAxons'];
        var series = [{ data: [], color: '#00adfb', stack: 0 }, { data: [], color: '#e7e7e7', stack: 0 }];
        _.each(chartData['yAxons'], (yInfoArr, index) => {
            series[0].data.push({ name: yInfoArr[0].subject, y: yInfoArr[0].count, dataLabels: { enabled: true, format:'{null}', y: -10, inside: false, style:{fontWeight:'bold', color: '#333'}}}); // 绿色柱
            series[1].data.push({ name: yInfoArr[1].subject, y: yInfoArr[1].count, dataLabels: { enabled: true, format:'{null}', y:  10, inside: false, style:{fontWeight:'bold', color: '#333'}}}); // 黄色柱
        });
        chartConfig['series'] = series;

        return { //这里返回的数据就是从高档到低档
            tableData: tableData,
            disData: disData,
            chartConfig: chartConfig
        };
    });
    //自定义Module数据结构
    var levelCommonInfo = _.join(_.map(_.range(_.size(levels)), (index) => numberMap[index + 1]));
    return (
        <div id='subjectDistribution' className={schoolReportStyles['section']}>
            <div style={{ marginBottom: 30 }}>
                <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>学科分档上线学生人数的分布</span>
                <span style={{ fontSize: 12, color: C07 }}>运用大数据算法将总分的分档分数精确地分解到各学科中，得出各学科的个档分数线及其分档上线人数分布，可反映出全校各班在各学科的上线情况</span>
            </div>
            <LevelInfo levels={levels} resultData={resultData} studentsGroupByClass={studentsGroupByClass}/>
        </div>

    )
}
export default SubjectDistribution;
/**
 * props:
 * studentsGroupByClass： 各班级贡献大小数据；
 * disData
 */
@Radium
class TextView extends React.Component {
    constructor(props) {
        super(props);
        var {studentsGroupByClass} = this.props;
        this.classNames = _.keys(studentsGroupByClass);
        var showAllEnable = this.classNames.length > 5 ? true : false;
        var showClassList = showAllEnable ? this.classNames.slice(0, 5) : this.classNames;
        this.state = {
            showAllEnable: showAllEnable,
            showAll: false,
            showData: showAllEnable ? _.pick(studentsGroupByClass, showClassList): studentsGroupByClass
        }
    }
    componentWillReceiveProps(nextProps) {
        var {studentsGroupByClass} = nextProps;
        this.classNames = _.keys(studentsGroupByClass);
        var showAllEnable = this.classNames.length > 5 ? true : false;
        var showClassList = showAllEnable ? this.classNames.slice(0, 5) : this.classNames;
        this.setState({
            showAllEnable: showAllEnable,
            showAll: false,
            showData: showAllEnable ? _.pick(studentsGroupByClass, showClassList): studentsGroupByClass
        })
    }
    onClickShowAllBtn(event) {
        this.setState({
            showAll: !this.state.showAll,
            showData: !this.state.showAll ? this.props.studentsGroupByClass : (_.pick(this.props.studentsGroupByClass, this.classNames.slice(0, 5)))
        }, ()=> {
            // if (!this.state.showAll){
            //     var top = $(document).scrollTop();
            //     $(document).scrollTop(top - 200);
            // }
        })
    }
    render() {
        var {disData} = this.props;

        return (
            <div>
            {
                _.map(this.state.showData, (students, className) => {
                    return (<div  key={className}>
                    {
                        (disData[className]) ? (
                                <p>
                                    对于<span style={{ color: '#00955e' }}>{className}班，{_.join(disData[className].maxSubjects, '、') }</span>贡献较大，
                                    <span style={{ color: '#00955e' }}>{_.join(disData[className].minSubjects, '、') }</span>贡献较小；
                                </p>
                            ) : (<p>对于<span style={{ color: '#00955e' }}>{className}班，只有一个科目没有可比性</span></p>)
                    }
                    </div>)
                })
            }
            {
                this.state.showAllEnable ?
                    (this.state.showAll ?
                        <a key={'expanBtn-0'} onClick={this.onClickShowAllBtn.bind(this)} href='javascript:;' style={localStyle.expanBtn}>收缩内容<i className='icon-up-open-2'></i></a> :
                        <a key={'expanBtn-1'} onClick={this.onClickShowAllBtn.bind(this)} href='javascript:;' style={localStyle.expanBtn}>...展开内容</a>
                       ) : ''
            }
            <div style={{clear: 'both'}}></div>
            </div>
        )
    }
}

/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function theSubjectLevelTable(subjectLevelInfo, validOrderedSubjectMean, examInfo) {
    //此档的内容
    //这里面依然会有二连杀：即虽然上面已经避免了可能会因为paper mean的"25xx"算法而导致漏掉一些科目的平均分，但是当去求某一个班级的数据的时候依然要考虑此班级有可能
    //没有考某一科目！！！
    var table = [];
    var titleHeader = _.map(validOrderedSubjectMean, (headerObj, index) => {
        return headerObj.subject + ' <br/>(' + headerObj.mean + ')';
    });
    titleHeader.unshift('班级');

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        if (theKey == 'totalSchool') return;
        var classRow = _.map(validOrderedSubjectMean, (headerObj) => {
            var temp = (_.isUndefined(subjectLevelObj[headerObj.id])) ? '无数据' : subjectLevelObj[headerObj.id];
            return temp;
        });
        classRow.unshift(examInfo.gradeName + theKey + '班');
        table.push(classRow);
    });

    table.unshift(titleHeader);

    return table;
}


function theSubjectLevelDiscription(subjectLevelInfo, examPapersInfo) {
    var result = {};

//注意：有的班级考的科目多，有的考的科目少。。。所以显示什么要具体到class里面。如果一个班级只考了一个科目那么result中就没有此班级
    var subjectLevelArr, maxSubjects, minSubjects;
    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        subjectLevelArr = _.sortBy(_.filter(_.map(subjectLevelObj, (count, key) => {
            return { count: count, key: key };
        }), (obj) => obj.key != 'totalScore'), 'count');

//TODO: 这里不应该是“length-1”了，按照算法的描述就应该是length...其他地方使用这个变量是不是有其他原因--需要check
        var baseLineCount = subjectLevelArr.length;
        var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));

        if(targetCount == 0) return;

        maxSubjects = _.reverse(_.map(_.takeRight(subjectLevelArr, targetCount), (obj) => examPapersInfo[obj.key].subject));
        minSubjects = _.reverse(_.map(_.take(subjectLevelArr, targetCount), (obj) => examPapersInfo[obj.key].subject));
        result[theKey] = { maxSubjects: maxSubjects, minSubjects: minSubjects };
    });

    return result;
}

//建立离差图形的数据结构
/*
{
    "totalSchool": {
        totalSchool:
        <pid1>:
        <pid2>:
        ...
    },
    'A1': {
        totalSchool:
        <pid1>:
        <pid2>:
        ...
    },
    ...
}

由 pid 组成的 header

 */
function theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, validOrderedSubjectMean) {
    //TODO:可能需要把计算出的最大和最小作为数据结构，因为分析说明其实就是这个图表的文字版说明
    //去掉总分的信息，因为最后的factors中是没有总分这一项的
    var titleHeader = _.map(validOrderedSubjectMean.slice(1), (obj) => obj.subject);
    //构造基本的原matrix
    var originalMatrix = makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, validOrderedSubjectMean);
    //factorsMatrix中每一行（即一重数组的长度应该和titleHeader相同，且位置意义对应）
    var factorsMatrix = makeFactor(originalMatrix);
    //扫描每一行，得到最大和最小的坐标，然后到titHeader中获取科目名称，返回{subject: , count: } 班级的顺序就是studentsGroupByClass的顺序
    var xAxons = _.map(_.keys(studentsGroupByClass), (className) => (examInfo.gradeName + className + '班'));
    var yAxons = _.map(factorsMatrix, (factorsInfo) => {
        var fmax = _.max(factorsInfo), fmin = _.min(factorsInfo);

        var fmaxIndex = _.findIndex(factorsInfo, (item) => item == fmax);
        var fminIndex = _.findIndex(factorsInfo, (item) => item == fmin);

        var fmaxSubject = titleHeader[fmaxIndex], fminSubject = titleHeader[fminIndex];
        return [{ subject: fmaxSubject, count: fmax, nice: true }, { subject: fminSubject, count: fmin, nice: false }];
    });

    return { xAxons: xAxons, yAxons: yAxons }

}

function makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, validOrderedSubjectMean) {
    var matrix = []; //一维是“班级”--横着来
    //把全校的数据放到第一位
    var totalSchoolObj = subjectLevelInfo.totalSchool;
    //求得上线人数比
    matrix.push(_.map(validOrderedSubjectMean, (headerObj) => _.round(_.divide(totalSchoolObj[headerObj.id], examInfo.realStudentsCount), 2)));

    _.each(subjectLevelInfo, (subjectsOrTotalScoreObj, theKey) => {
        if (theKey == 'totalSchool') return;
        matrix.push(_.map(validOrderedSubjectMean, (headerObj) => {
            var temp = (_.isUndefined(subjectsOrTotalScoreObj[headerObj.id])) ? '无数据' : _.round(_.divide(subjectsOrTotalScoreObj[headerObj.id], examClassesInfo[theKey].realStudentsCount), 2);
            return temp;
        }));
    });
    return matrix;
}

/**
 * 创建学科分析需要的info数据结构
 * @param  {[type]} levelScore           [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} allStudentsPaperMap  [description]
 * @param  {[type]} examPapersInfo       [description]
 * @param  {[type]} examFullMark         [description]
 * @return {[type]}                      info格式的学科分析的数据结构
 * {
 *     totalSchool: {
 *         totalScore: <count>
 *         <pid>: <count>
 *
 *     },
 *     <className>: {
 *         totalScore: <count>
 *         <pid>: <count>
 *     },
 *     ...
 * }
 */
function makeSubjectLevelInfo(levelScore, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, examPapersInfo, examFullMark) {
    var subjectsMean = makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark);//这里有可能拿不到全科。。。
    // var schoolTotalScoreMean = _.round(_.mean(_.map(_.filter(examStudentsInfo, (student) => student.score > levelScore), (student) => student.score)), 2); //总分的平均分 = （scope下所有学生中，分数大于此档线的所有学生成绩的平均分）== 不正确，此处总分的平均分即为设置的此档的分档线的分数

    subjectsMean.totalScore = { id: 'totalScore', mean: levelScore, name: '总分' };

    var result = {};
    result.totalSchool = {};

    result.totalSchool.totalScore = _.filter(examStudentsInfo, (student) => student.score > levelScore).length;//TODO:这里使用">"没有问题么？

    _.each(subjectsMean, (subMean, pid) => {
        if (pid == 'totalScore') return;

        result.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score > subMean.mean).length;
    });

    _.each(studentsGroupByClass, (classStudents, className) => {
        var temp = {};
        // var classTotalScoreMean = _.round(_.mean(_.map(classStudents, (student) => student.score)), 2);
        temp.totalScore = _.filter(classStudents, (student) => student.score > levelScore).length;
        //Note: 这里的算法没有问题：subjectsMean是全部有效的，而这里遍历的pid是跟着当前班级所考的科目走的
        _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
            temp[pid] = _.filter(papers, (paper) => paper.score > subjectsMean[pid].mean).length;
        });

        result[className] = temp;
    });

    return { subjectLevelInfo: result, subjectsMean: subjectsMean }
}

function filterMakeOrderedSubjectMean(headers, subjectsMean) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var valids = [], unvalids = [];
    _.each(headers, (headerObj) => {
        if(subjectsMean[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectsMean[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectsMean[headerObj.id].mean});
        }
    });
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}

//计算每一档次各科的平均分
//算法：获取所有考生基数中 总分**等于**此档分数线 的所有考生；如果这些考生的人数不足够样本数（当前是固定值25），则扩展1分（单位），再获取，注意：
//  1.分数都四舍五入（包括分档线）
//  2.一定要滑动窗口两边的数量是相同的，保证平均分不变（注意有“选择的某个分数上没有对应学生的情况”）
//  3.当遇到从n中取m（其中n > m）
//  一定要保证每次取的人都是相同的（根据examStudentsInfo的顺序），这样每次计算的科目平局分才是相同的
//  ，不断重复上述过程，直到满足样本数量
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
Mock Data:
let tableData = {
    ths: [
        '班级', '语文', '数学', '英语', '化学'
    ],
    tds: [
        ['全部', 132, 112, 134, 124],
        ['初一1班', 12, 23, 23, 34],
        ['初一2班', 34, 34, 54, 54],
        ['初一3班', 34, 46, 65, 23],
        ['初一4班', 23, 23, 11, 23],
        ['初一5班', 45, 12, 45, 53]
    ]
}
 */
