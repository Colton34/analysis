import React from 'react';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

import styles from '../../common/common.css';

import Table from '../../common/Table.jsx';
import DropdownList from '../../common/DropdownList';

import {NUMBER_MAP as numberMap} from '../../lib/constants';
import {makeFactor} from '../../api/exam';
import TableView from './TableView';
import Radium from 'radium';

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

const SubjectDistribution = ({examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, levels, headers}) => {

    //算法数据结构：
    var levLastIndex = _.size(levels) - 1;

    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        xAxis: {

        },
        yAxis: {
            title: '',
            reversedStacks: false
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        tooltip: {
            pointFormat: '<b>{point.name}:{point.y:.1f}</b>'
        },
        credits: {
            enabled: false
        }
    };

    var resultData = _.map(levels, (levObj, levelKey) => {
        var currentLevel = levels[(levLastIndex - levelKey) + ''];

        var {subjectLevelInfo, subjectsMean} = makeSubjectLevelInfo(currentLevel.score, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, examPapersInfo, examInfo.fullMark);

        //按行横向扫描的各行RowData
        var tableData = theSubjectLevelTable(subjectLevelInfo, subjectsMean, examInfo, headers);
        /*
        disData: {
            <className> : {maxSubjects: [], minSubjects: []}
        }

         */
        var disData = theSubjectLevelDiscription(subjectLevelInfo, examPapersInfo, headers);
        /*
        chartData: {
            xAxons: [<className>],
            yAxons: [ [{count: , subject: , nice: true}, {count: , subject: , nice: false}], ... ]
        }
        */
        var chartData = theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers);

        var chartConfig = _.cloneDeep(config);
        chartConfig['xAxis']['categories'] = chartData['xAxons'];
        var series = [{ data: [], color: '#74c13b', stack: 0 }, { data: [], color: '#f2cd45', stack: 0 }];
        _.each(chartData['yAxons'], (yInfoArr, index) => {
            series[0].data.push({ name: yInfoArr[0].subject, y: yInfoArr[0].count, dataLabels: { enabled: true, format:'{point.name}', y: -10, inside: false, style:{fontWeight:'bold', color: '#333'}}});
            series[1].data.push({ name: yInfoArr[1].subject, y: yInfoArr[1].count, dataLabels: { enabled: true, format:'{point.name}', y:  10, inside: false, style:{fontWeight:'bold', color: '#333'}}});
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
        <div style={{ position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学科分档上线学生人数的分布
            </div>
            <div style={{ width: 720, margin: '0 auto', marginTop: 50 }}>
                <p style={{ marginBottom: 15 }}>
                    总分是由各个学科的分数构成的，我们用大数据分析技术能科学地将总分分数线分解到各个学科，形成各个学科的
                    <span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档分数线。
                    有了学科分数线，就能明确得到全校及班级各个学科<span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档上线的学生人数。
                    下面几个表分别表示<span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档各个学科的上线人数。
                </p>
                <p style={{ color: '#a883fc', marginBottom: 20 }}>
                    对每个档次而言，学科提供的上线人数越多，该学科就为学生总分上线提供了更大的可能性。
                    这可以视为该学科的教学贡献。反之，学科上线人数越少，该学科对高端学生的培养处于短板，需要引起高度重视。
                </p>
                {
                    _.map(_.range(_.size(levels)), (index) => {
                        var levelStr = numberMap[index + 1];
                        var {tableData, disData, chartConfig} = resultData[index];
                        return (
                            <div key={index}>
                                {/*--------------------------------  学科分档上线学生人数分布表格 -------------------------------------*/}
                                <p>学校各学科{levelStr}档上线学生人数表：</p>
                                <TableView tableData={tableData} TableComponent={Table} reserveRows={6}/>

                                {/*--------------------------------  学科分档上线学生人数分布分析说明 -------------------------------------*/}
                                <div style={{ backgroundColor: '#e7f9f0', padding: '5px 10px', marginTop: 15 }}>
                                    <p>{levelStr}档上线数据分析表明： </p>

                                    {
                                        (disData['totalSchool']) ? (
                                            <p>对于全校，<span style={{ color: '#c96925' }}>{_.join(disData['totalSchool'].maxSubjects, '、') }学科</span>在本次考试中一档上线率贡献较大，
                                                <span style={{ color: '#c96925' }}>{_.join(disData['totalSchool'].minSubjects, '、') }学科</span>对高层次的学生培养处于弱势，需要引起高度重视。</p>
                                                ) : (<p>只要一个学科没有可比性</p>)
                                    }



                                    <p style={{ margin: '10px 0' }}>对于各班级而言，各个学科的表现是不一样的，经分析，可得到如下结论：</p>
                                    {/*
                                        _.map(studentsGroupByClass, (students, className) => {
                                            return (<p key={className}>
                                                对于<span style={{ color: '#00955e' }}>{className}班，{_.join(disData[className].maxSubjects, '、') }</span>贡献较大，
                                                <span style={{ color: '#00955e' }}>{_.join(disData[className].minSubjects, '、') }</span>贡献较小；
                                            </p>)
                                        })*/
                                    }
                                    <TextView studentsGroupByClass={studentsGroupByClass} disData={disData}/>
                                </div>
                                {/*--------------------------------  学科分档上线学生人数离差图 -------------------------------------*/}
                                <p>
                                    各班级的具体情况不一样，综合全校各班级各学科提供的学生总分上线贡献的因素，
                                    各班级{levelStr}档上线贡献率最大和最小学科如下图所示：
                                </p>
                                <p>学科上线率离差：</p>
                                <ReactHighcharts config={chartConfig}></ReactHighcharts>
                                <div style={{ backgroundColor: '#e7f9f0', padding: '15px 0', marginTop: 15, fontSize: 12 }}>
                                    班级学科上线率离差： 指班级的学科上线率与全校各班级该学科的平均上线率之间的差值，反映了班级该学科对上线贡献的大小。
                                </div>
                            </div>
                        )
                    })
                }
            </div>
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
            if (!this.state.showAll){
                var top = $(document).scrollTop();
                $(document).scrollTop(top - 200);
            }
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
                            ) : (<p>只有一个科目没有可比性</p>)
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
function theSubjectLevelTable(subjectLevelInfo, subjectsMean, examInfo, headers) {
    //此档的内容
    var table = [];
    var titleHeader = _.map(headers, (headerObj, index) => {
        return headerObj.subject + ' (' + subjectsMean[headerObj.id].mean + ')';
    });
    titleHeader.unshift('班级');

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(headers, (headerObj) => {
        return totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        if (theKey == 'totalSchool') return;
        var classRow = _.map(headers, (headerObj) => {
            return subjectLevelObj[headerObj.id];
        });
        classRow.unshift(examInfo.gradeName + theKey + '班');
        table.push(classRow);
    });

    table.unshift(titleHeader);

    return table;
}


function theSubjectLevelDiscription(subjectLevelInfo, examPapersInfo, headers) {
    var result = {};

//注意：有的班级考的科目多，有的考的科目少。。。所以显示什么药具体到class里面。如果一个班级只考了一个科目那么result中就没有此班级
    var subjectLevelArr, maxSubjects, minSubjects;
    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        subjectLevelArr = _.sortBy(_.filter(_.map(subjectLevelObj, (count, key) => {
            return { count: count, key: key };
        }), (obj) => obj.key != 'totalScore'), 'count');

        var baseLineCount = subjectLevelArr.length - 1;
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
function theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers) {
    //TODO:可能需要把计算出的最大和最小作为数据结构，因为分析说明其实就是这个图表的文字版说明
    //去掉总分的信息，因为最后的factors中是没有总分这一项的
    var titleHeader = _.map(headers.slice(1), (obj) => obj.subject);
    //构造基本的原matrix
    var originalMatrix = makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, headers);
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

function makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, headers) {
    var matrix = []; //一维是“班级”--横着来
    //把全校的数据放到第一位
    var totalSchoolObj = subjectLevelInfo.totalSchool;
    matrix.push(_.map(headers, (headerObj) => _.round(_.divide(totalSchoolObj[headerObj.id], examInfo.realStudentsCount), 2)));

    _.each(subjectLevelInfo, (subjectsOrTotalScoreObj, theKey) => {
        if (theKey == 'totalSchool') return;
        matrix.push(_.map(headers, (headerObj) => _.round(_.divide(subjectsOrTotalScoreObj[headerObj.id], examClassesInfo[theKey].realStudentsCount), 2)));
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
    var subjectsMean = makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark);
    // var schoolTotalScoreMean = _.round(_.mean(_.map(_.filter(examStudentsInfo, (student) => student.score > levelScore), (student) => student.score)), 2); //总分的平均分 = （scope下所有学生中，分数大于此档线的所有学生成绩的平均分）== 不正确，此处总分的平均分即为设置的此档的分档线的分数

    subjectsMean.totalScore = { id: 'totalScore', mean: levelScore, name: '总分' };

    var result = {};
    result.totalSchool = {};

    result.totalSchool.totalScore = _.filter(examStudentsInfo, (student) => student.score > levelScore).length;

    _.each(subjectsMean, (subMean, pid) => {
        if (pid == 'totalScore') return;

        result.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score > subMean.mean).length;
    });

    _.each(studentsGroupByClass, (classStudents, className) => {
        var temp = {};
        // var classTotalScoreMean = _.round(_.mean(_.map(classStudents, (student) => student.score)), 2);
        temp.totalScore = _.filter(classStudents, (student) => student.score > levelScore).length;

        _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
            temp[pid] = _.filter(papers, (paper) => paper.score > subjectsMean[pid].mean).length;
        });

        result[className] = temp;
    });

    return { subjectLevelInfo: result, subjectsMean: subjectsMean }
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
