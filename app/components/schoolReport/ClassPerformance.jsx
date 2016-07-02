import React from 'react';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

import Table from '../../common/Table';
import DropdownList from '../../common/DropdownList';

import {makeSegments, makeFactor, makeSegmentsStudentsCount} from '../../api/exam';
import {NUMBER_MAP as numberMap} from '../../lib/constants';

import styles from '../../common/common.css';
import TableView from './TableView';
import {Table as BootTable} from 'react-bootstrap';

const AverageTable = ({tableHeaderData, tableData}) => {

    return (
        <BootTable  bordered hover responsive>
            <tbody>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    <th className={styles['table-unit']} rowSpan="2">班级</th>
                    {
                        _.map(tableHeaderData, (subject, index) => {
                            return (
                                <th colSpan="2" key={index} className={styles['table-unit']}>{subject}</th>
                            )
                        })
                    }
                </tr>
                <tr style={{ backgroundColor: '#fafafa' }}>
                {
                    _.map(_.range(tableHeaderData.length), (num) => {
                        return _.map(_.range(2), (index) => {
                            if (index === 0)
                                return <th className={styles['table-unit']} key={index}>平均分</th>
                            return <th className={styles['table-unit']} key={index}>平均得分率</th>
                        })
                    })
                }
                </tr>
                {
                    _.map(tableData, (tdList, bindex) => {
                        return (
                            <tr key={'tr' + bindex}>
                                {
                                    _.map(tdList, (td, tindex) => {
                                        return (
                                            <td key={'td' + tindex}className={styles['table-unit']}>
                                                {td}
                                            </td>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </BootTable>
    )
}

/**
 * props:
 * totalScoreLevel: 分档信息
 */
class ClassPerformance extends React.Component {

    constructor(props) {
        super(props);

        var {studentsGroupByClass, examInfo} = this.props;
        var classList = _.map(_.keys(studentsGroupByClass), (className) => {
            return {key: className, value: examInfo.gradeName+className+'班'};
        });

        this.classList = classList;

        this.state = {
            currentClasses: _.take(this.classList, 2)
        }
    }

    onClickDropdownList(classItem) {
        //if(_.includes(this.classList, classItem)) return;
        console.log('change the choosen class = ', classItem.key);
        var {currentClasses} = this.state;
        if (_.includes(currentClasses)) return;
        else if (classItem.selected){
            currentClasses.push(classItem);
            this.setState({
                currentClasses: currentClasses
            });
        } else {
            this.setState({
                currentClasses: _.without(currentClasses, classItem)
            });
        }


        // if(!lineChartMockData[chosenClass]) return ;
        // var obj = {};
        // obj.name = chosenClass;
        // obj.data = lineChartMockData[chosenClass];
        // lineChartRenderData = [].concat([lineChartRenderData[1], obj]);
        // this.forceUpdate();
    }

    render() {
//Props数据结构：
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, levels, headers} = this.props;
//算法数据结构：

// var lineChartRenderData = [{
//                 name: '全校',
//                 data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
//             },{
//                 name: '初一1班',
//                 data: [11.2, 9.6, 19.5, 85.5, 21.8, 12.5, 87.5, 78.5, 33.3, 8.3, 23.9, 5.6]
//             }];
        var headerInfo = theClassExamHeader(studentsGroupByClass);
        var {xAxons, yAxonses} = theClassExamChart(examInfo, examStudentsInfo, examClassesInfo, headers, this.state.currentClasses);
        var subjectMeanInfo = makeClassExamMeanInfo(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo, studentsGroupByClass, headers);
        var meanTableBodyData = theClassExamMeanTable(examInfo, subjectMeanInfo, headers);
        var factorsTableData = theClassExamMeanFactorsTable(examInfo, subjectMeanInfo, studentsGroupByClass, headers);
        var groupTableData = theClassExamTotalScoreGroupTable(examInfo, examStudentsInfo);
//自定义Module数据结构：
        var _this = this;
        var meanTableHeaderData = _.map(headers, (headerObj) => headerObj.subject);

        var config = {
            title: {
                text: '',
                x: -20 //center
            },
            xAxis: {
                categories: xAxons
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
                valueSuffix: '人数'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: yAxonses,
            credits: {
                enabled: false
            }
        };

        return (
            <div className={styles['school-report-layout']}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    班级的考试基本表现
                </div>

                {/*--------------------------------  班级考试基本表现Header -------------------------------------*/}
                <div className={styles['school-report-content']}>
                    <p>
                        各班级在这次考试中各自的表现均不相同，我们要对各班分析他们的突出表现及差异。观察各班的表现，要注意班级教学的实际，
                        同时也要联系各班级的历史客观因素，试分析评价要客观些。
                    </p>
                    <p>
                        （1）从班级学生总分分布看，前面“各班
                        <span className={styles['school-report-dynamic']}>
                        {_.join(_.map(_.range(_.size(levels)), (index) => numberMap[index+1]), '、')}
                        档</span>上线学生人数分布表”，反映出各个班级总分较高学生的人数分布。
                    </p>
                    <p>
                        （2）考虑到各个班级有各自的具体情况，可以基于各班的自身水平来考察高端及低端学生的分布，反映出学生总分的分布趋势。通过大数据归类分析我们发现，以各班自身水平衡量，高分学生人数较多的
                        班级有：
                        {/*--------------------------------  TODO：班级考试表现的Header -------------------------------------*/}
                        <span className={styles['school-report-dynamic']}>{_.join(headerInfo.greater, '、')}</span>，
                        高分学生人数比低分学生人数较少的班级有
                        <span className={styles['school-report-dynamic']}>{_.join(headerInfo.lesser, '、')}</span>。
                        <br/>
                        （注意： 这是一各班自身水平为基础而得出的结论，不是单用学生总分在全校中的排队为依据的，可能会有特别好的班级也会出现相对于班级自身水平的高分学生人数少于低分学生人数的
                          ，说明该班级还没有充分挖掘出学生的潜力。）
                    </p>
                    {/*--------------------------------  班级考试表现的趋势图表 -------------------------------------*/}
                    <p>班级学生总分分布趋势图：</p>
                    <span style={{position: 'absolute', right: 0}}>
                        <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this)} classList={_this.classList} isMultiChoice={true}/>
                    </span>
                    <ReactHighcharts config={config} style={{ margin: '0 auto', marginTop: 40 }}></ReactHighcharts>

                    {/*--------------------------------  班级考试基本表现平均分表格 -------------------------------------*/}
                    <p>（3）从平均水平看，全校和班级的各学科平均得分率见下表所示：</p>
                    <TableView tableHeaderData={meanTableHeaderData} tableData={meanTableBodyData} TableComponent={AverageTable} reserveRows={6}/>

                    {/* 如果样式一样的话，那么这个“显示更多班级”可以抽出来了，属于Table的一部分--逻辑是一样的 */}
                    {/*  _.keys(studentsGroupByClass).length > 5 ? (<a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>) : ''   */}
                    <div className={styles.tips}>
                        <p>数据图表说明部分：表中各个班级的平均分与平均得分率的高低，一目了然。</p>
                        <p>平均分：表达的是一个代表性水平的指标。但各班也有各班的具体情况，不仅要看平均分数的高低，还要看各班在自身水平基础上，可能有的学科表现更好，有的学科表现不足。即下面第（4）点分析的内容。</p>
                    </div>
                    {/*--------------------------------  班级考试基本表现贡献指数表格 -------------------------------------*/}
                    <p>
                        (4) 各班的平均得分率看起来有高有低，也不能简单通过排队就评价教学质量的高低，需要结合各班具有自身的具体情况和原因基于客观分析（比如有尖子班、普通版之分）。
                        但相对于班级自身综合水平而言，各班各学科的平均得分率贡献指数（见下表）可以反映出各个班级教学对其自身综合水平影响的大小。（指数值为正，是促使提高；
                        为负， 是拖后腿。）
                    </p>
                    <TableView tableData={factorsTableData} reserveRows={6}/>

                    {/* _.keys(studentsGroupByClass).length > 5 ? (<a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>) : ''  */}

                    <div className={styles.tips}>
                        <p>班级的学科平均得分率水平贡献指数：</p>
                        <p>指班级的学科得分率与全校各班级该学科的平均得分率之间的差值，反应班级该学科水平对整体贡献的大小。</p>
                    </div>

                {/*--------------------------------  班级考试基本表现学生分组表格 -------------------------------------*/}
                    <p>
                        （5）将学校分数从高到低，分为十组学生，每一组学生之间的水平相差不大，按这样方式，我们可以看见各班在这样的十组中所存在的人数如下：
                    </p>
                    <TableView tableData={groupTableData} reserveRows={7}/>
                    {/*  _.keys(studentsGroupByClass).length > 5 ? (                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>) : ''    */}
                    <div className={styles.tips}>
                        <p>说明：</p>
                        <p>从以上数据表格中，按总人数平均分为十组，可以看见不同组（及不同分数段中）在不同班级的人数分布情况。</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default ClassPerformance;


//这个是不是也要遵从：2， 4， 7 原则？
function theClassExamHeader(studentsGroupByClass) {
    //对各个班级计算：1.此班级中排名中间的学生的成绩 2.此班级的平局分  3.二者的差
    //studentsGroupByClass应该就是排好序的。
    //问题：只能说明高分段和低分段的比较，但是不能说明是总体是高分多还是低分多，比如[1, 1, 1, 1, 1]和[99, 99, 99, 99, 99]，diff都是0

    //偏度：均值 - 中位数 (纵轴就是“频数”) -- 正偏度：右侧较少，左侧较多；  负偏度：左侧较多，右侧较少。如果对应到横坐标从左到右是依次升序的分数，那么，
    //按照偏度的大小排序，越大则低分多，高分少，低分多。

/*
        var baseLineCount = counts.length - 1;
        var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));

        if(targetCount == 0) return;

 */
    var baseLineCount = _.size(studentsGroupByClass) - 1;
    var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));
    if(targetCount == 0) return {};
    var results = _.map(studentsGroupByClass, (students, className) => {
        var diff = _.round(_.subtract(_.mean(_.map(students, (student) => student.score)), students[parseInt(students.length/2)].score), 2);
        return {
            diff: diff,
            class: className+'班'
        }
    });
    //diff越小则低分段比高分段多，diff越大则高分段比低分段多。因为这里还是没有确定什么是高分，什么是低分。
    results = _.sortBy(results, 'diff');
    return {
        greater: _.map(_.take(results, targetCount), (obj) => obj.class),
        lesser: _.map(_.takeRight(results, targetCount), (obj) => obj.class)
    }
}

//一个班级或两个班级的图表
function theClassExamChart(examInfo, examStudentsInfo, examClassesInfo, headers, currentClasses) {
    var classKeys = _.keys(examClassesInfo);

    if(!currentClasses || currentClasses.length == 0) currentClasses = _.map(_.range(2), (index) => examClassesInfo[classKeys[index]]);//初始化的时候显示默认的2个班级
    var examStudentsGroupByClass = _.groupBy(examStudentsInfo, 'class');
    // var result = {};

    var segments = makeSegments(examInfo.fullMark);
    var xAxons = _.slice(segments, 1);

//只有班级没有全校！！！
    var yAxonses = _.map(currentClasses, (classItem) => {
        var students = examStudentsGroupByClass[classItem.key];
        var yAxons = makeSegmentsStudentsCount(students, segments);
        return {
            name: classItem.value,
            data: yAxons
        }
    });

    //TODO: yAxons
    return {xAxons: xAxons, yAxonses: yAxonses};
}

function theClassExamMeanTable(examInfo, subjectMeanInfo, headers) {
//TODO: 注意原型图中少画了总分这一项（有很多地方都是），而这里添加了关于总分的数据（还是第一列，跟着headers走）
    var matrix = [];

    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;
    var totalSchoolRow = [];
    _.each(headers, (headerObj) => {
        totalSchoolRow = _.concat(totalSchoolRow, [totalSchoolMeanObj[headerObj.id].mean, totalSchoolMeanObj[headerObj.id].meanRate])
    });
    totalSchoolRow.unshift('全校');
    matrix.push(totalSchoolRow);

    _.each(subjectMeanInfo, (subjectMeanObj, theKey) => {
        if(theKey == 'totalSchool') return;

        var classMeanObj = subjectMeanInfo[theKey];

        var classRow = [];
        _.each(headers, (headerObj) => {
            classRow = _.concat(classRow, [classMeanObj[headerObj.id].mean, classMeanObj[headerObj.id].meanRate])
        });
        classRow.unshift(examInfo.gradeName+theKey+'班');
        matrix.push(classRow);
    });
    return matrix;
}

/**
 * //是平均得分率的小数表示的matrix
 * @param  {[type]} subjectMeanInfo [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function theClassExamMeanFactorsTable(examInfo, subjectMeanInfo, studentsGroupByClass, headers) {
    //注意：原型图中是画错的，取离差后肯定就没有totalScore（总分）这一列了，因为在第二步的时候消除了
    var titleHeader = _.map(headers.slice(1), (obj) => obj.subject);
    titleHeader.unshift('班级');

    var originalMatrix = makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers);
    var factorsMatrix = makeFactor(originalMatrix);

    var classKeys = _.keys(studentsGroupByClass);
    _.each(factorsMatrix, (factorsInfoRow, index) => {
        factorsInfoRow.unshift(examInfo.gradeName+classKeys[index]+'班');
    });

    factorsMatrix.unshift(titleHeader);

    return factorsMatrix;
}

function makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers) {
    var matrix = [];
    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;

    matrix.push(_.map(headers, (headerObj) => totalSchoolMeanObj[headerObj.id].meanRate));

    _.each(subjectMeanInfo, (subjectMenaObj, theKey) => {
        if(theKey == 'totalSchool') return;
        matrix.push(_.map(headers, (headerObj) => subjectMenaObj[headerObj.id].meanRate));
    });
    return matrix;
}

//按照分组得到的总分区间段查看学生人数
/*
    {
        <组id>: {
            groupCount:
            groupStudentsGroupByClass:{
                <className>: <students>
            }
        },
        ...
    }

    将上述的Map打散，为了符合横向扫描的方式
    [
        {class: , groupKey: students: },

    ]
*/
function theClassExamTotalScoreGroupTable(examInfo, examStudentsInfo, groupLength) {
    groupLength = groupLength || 10;
    var groupStudentsInfo = makeGroupStudentsInfo(groupLength, examStudentsInfo);

    var groupHeaders = _.map(_.range(groupLength), (index) => {
        return {index: index, title: '第' + numberMap[index+1] + '组<br/>(前' + (index+1) + '0%)', id: index }
    });
    var titleHeader = _.concat(['班级'], _.map(groupHeaders, (headerObj, index) => headerObj.title));

    var table = [], totalSchoolInfo = [];

    table.push(titleHeader);

    var allGroupStudentInfoArr = []; //因为后面维度不一样了，所以这里需要打散收集信息然后再group
    _.each(groupStudentsInfo, (groupObj, groupKey) => {
        totalSchoolInfo.push(groupObj.groupCount);
        _.each(groupObj.classStudents, (students, className) => {
            allGroupStudentInfoArr.push({ 'class': className, groupKey: groupKey, students: students });
        });
    });


    totalSchoolInfo.unshift('全校');
    table.push(totalSchoolInfo);

    var groupStudentInfoByClass = _.groupBy(allGroupStudentInfoArr, 'class');

    _.each(groupStudentInfoByClass, (groupStudentsObjArr, className) => {
        //一行
        var classGroupCountRow = _.map(_.range(groupLength), (index) => {
            //本来可以直接对groupKey进行排序，但是这样不会知道具体是哪个组的值缺少了，所以还是需要对应key去确定
            var target = _.find(groupStudentsObjArr, (sobj) => sobj.groupKey == index);
            return target ? target.students.length : 0;
        });
        classGroupCountRow.unshift(examInfo.gradeName+className+'班');
        table.push(classGroupCountRow);
    });

    return table;
}

function makeClassExamMeanInfo(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo, studentsGroupByClass, headers) {
    var result = {};
    result.totalSchool = makeOriginalSubjectInfoRow(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo);
    _.each(studentsGroupByClass, (students, className) => {
        result[className] = makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo, examClassesInfo);
    });
    return result;
}

//一行的得分率！！！
function makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo, examClassesInfo) {
    var result = {};
    result.totalScore = {};

    result.totalScore.mean = _.round(_.mean(_.map(students, (student) => student.score)), 2);
    result.totalScore.count = _.filter(students, (student) => student.score >= result.totalScore.mean).length;
    result.totalScore.meanRate = _.round(_.divide(result.totalScore.mean, examInfo.fullMark), 2);//注意这里没有使用百分制

    result.totalScore.countPercentage = _.round(_.multiply(_.divide(result.totalScore.count, students.length), 100), 2);//注意这里使用了百分制
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};

        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.count = _.filter(papers, (paper) => paper.score >= obj.mean).length;
        obj.meanRate = _.round(_.divide(obj.mean, examPapersInfo[pid].fullMark), 2);//注意这里没有使用百分制
        obj.countPercentage = _.round(_.multiply(_.divide(obj.count, students.length), 100), 2);//注意这里使用了百分制

        result[pid] = obj;
    });
    return result;
}


//groupLength来源于dialog的设置
function makeGroupStudentsInfo(groupLength, students) {
    //需要原始的“根据考生总分排序好的” studentsInfo 数组
    //将数组内的元素分成10组，计算每一组中各个班级学生人数
    var result = {}, flagCount = students.length, totalStudentCount = students.length;
    _.each(_.range(groupLength), function(index) {
        var groupCount = (index == groupLength-1) ? flagCount : (_.ceil(_.divide(totalStudentCount, groupLength)));
        //当前组的学生数组：
        var currentGroupStudents = _.slice(students, (flagCount - groupCount), flagCount);
        //对当前组的学生按照班级进行group
        var groupStudentsGroupByClass = _.groupBy(currentGroupStudents, 'class');
        flagCount -= groupCount;
        result[index] = { groupCount: groupCount, classStudents: groupStudentsGroupByClass, flagCount: flagCount };
    });
    return result;
}


/*
var lineChartMockData ={
    '全校': [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
    '初一1班':  [11.2, 9.6, 19.5, 85.5, 21.8, 12.5, 87.5, 78.5, 33.3, 8.3, 23.9, 5.6],
    '初一2班':  [11.2, 77.6, 92.5, 15.5, 8.8, 21.5, 58.5, 70.5, 31.3, 38.3, 23.9, 9.9]
}

var lineChartRenderData = [{
                name: '全校',
                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            },{
                name: '初一1班',
                data: [11.2, 9.6, 19.5, 85.5, 21.8, 12.5, 87.5, 78.5, 33.3, 8.3, 23.9, 5.6]
            }];


let td_averageScoreRate = {
    ths: [
        '总分','语文', '数学', '英语'
    ],
    tds: [
        ['全部', 0.8, 0.8, 0.8, 0.9,0.8, 0.8, 0.8, 0.9],
        ['初一1班', 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
        ['初一2班', 0.6, 0.6, 0.6, 0.6, 0.7, 0.7, 0.7, 0.7],
        ['初一3班', 0.78, 0.78, 0.78, 0.78, 0.7, 0.7, 0.7, 0.7]
    ]
}

let td_subjectAveScoreRate = {
    ths : [
        '班级', '总分', '语文', '数学','英语', '化学'
    ],
    tds: [
        ['一班', 0.8, 0.7, 0.6, 0.5, 0.78],
        ['二班', 0.8, 0.6, 0.5, 0.9, 0.88],
        ['三班', 0.8, 0.6, 0.5, 0.9, 0.88],
        ['四班', 0.23, 0.43, 0.32, 0.68, 0.87],
        ['五班', 0.78, 0.62, 0.48, 0.7, 0.9]
    ]
}

let td_scoreGroup = {
    ths: [
      '班级', '第一组[0, 106]', '第二组[106,305]', '第三组[305,420]', '第四组[420, 480]', '第五组[480,540]','第六组[540, 610]',
      '第七组[610,690]', '第八组[610,690]','第九组[690, 750]'
    ],
    tds: [
        ['全校', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['1班', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['2班', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['3班', 203, 346, 465, 203, 334, 203, 346, 465, 203]
    ]
}

 */
