import React from 'react';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

import styles from '../../../common/common.css';
import schoolReportStyles from '../schoolReport.css';
import localStyle from './studentPerformance.css';
import Radium from 'radium';
import TableView from '../TableView';
import {Table as BootTable} from 'react-bootstrap';
import {COLORS_MAP as colorsMap, A11, A12, B03, B04, B06, B07, B08, C09, C12, C05, C07} from '../../../lib/constants';

var localCss = {
    btn: {
        display: 'inline-block', width: 115, height: 25, color: '#333', lineHeight: '25px', textDecoration: 'none', textAlign: 'center', border: '1px solid #e9e8e6',
        ':hover': { textDecoration: 'none' },
        ':link': { textDecoration: 'none' }
    },
    tableCell: {
        fontSize: 12, textAlign: 'left', verticalAlign: 'middle', minWidth: 50, minHeight: 30
    }


}

const Table = ({tableHeaderData, isGood, current, tableData}) => {
    return (
        <BootTable bordered hover responsive style={{marginBottom: 0}}>
            <tbody>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    <th className={styles['table-unit']} style={{borderColor: colorsMap.C04}}>班级</th>
                    {
                        _.map(tableHeaderData, (th, index) => {
                            return (
                                <th key={index} className={styles['table-unit']} style={{minWidth: 100, borderColor: colorsMap.C04}}>{th}</th>
                            )
                        })
                    }
                </tr>
                {
                    _.map(tableData, (rowData, rindex) => {
                        return (
                            <tr key={rindex}>
                                {
                                    _.map(rowData, (data, index) => {
                                        return (
                                            <td key={index} className={styles['table-unit']} style={{minWidth: 100, borderColor: colorsMap.C04}}>
                                                {data}
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
 * 传入 “前 或 后”  studentPosition
 * 学科列表 subjectList
 * 班级&成绩列表 classData
 *
 */
@Radium
class StudentPerformanceTable extends React.Component {
    //变动的交互模块和当前显示的模块是同一个模块--这种方式应该是比较好处理的。就像之前select所控制的图表，那么select和图表就应该在一起
    //dropList的数据就在此Table中
    constructor(props) {
        super(props);
        this.selectItems = [{ key: 'ranking', value: '名次统计' }, { key: 'percentage', value: '比例统计' }];
        this.isValid = true;
        this.default = 30;
        this.state = {
            current: this.selectItems[0], //默认按照名词排列
            rankingNum: 30, //默认是 名词排列 的 前30名
            percentageNum: 30,
            inputNum: 30
        }
    }

    chooseItem(content) {
        //TODO: setState(newState)中newState不一定需要把所有的stae属性都添加上去吧，没有就是不修改吧？
        if (this.state.current.key === content.key) return;
        var newState = {current: content };
        newState.inputNum = this.default;//(content.key == 'ranking') ? this.state.rankingNum : this.state.percentageNum;
        if (content.key === 'ranking') {
            newState.rankingNum = this.default;
        } else {
            newState.percentageNum = this.default;
        }
        this.setState(newState, ()=> {
            console.log('after set state: ' + this.state.inputNum);
        });
    }

    onConfirmChange() {
        var value = parseInt(this.state.inputNum);
        if (!(value && _.isNumber(value) && value > 0)) {
            console.log('输入不是有效数字');
            this.isValid = false;
            return;
        }

        //不同类型所要求的数值的规则不同
        var newConfig = {};
        if (this.state.current.key == 'ranking') {
            if (value > this.props.examInfo.realStudentsCount) {
                this.isValid = false;
                return;
            } else {
                newConfig.rankingNum = value;
                newConfig.inputNum = value;
            }
        } else if (this.state.current.key == 'percentage') {
            if (value > 100) {
                this.isValid = false;
                return;
            } else {
                newConfig.percentageNum = value;
                newConfig.inputNum = value;
            }
        }

        this.isValid = true;
        this.setState(newConfig);
    }
    onChangeInput(event) {
        this.setState({
            inputNum: event.target.value
        })
    }
    render() {
        var {current} = this.state;
        //Props数据结构：
        var {examInfo, examStudentsInfo, allStudentsPaperMap, headers, isGood, tableHeaderData} = this.props;
        //算法数据结构：
        //如果是ranking，那么直接就是value, 如果是percentage，那么需要算出来value
        var countFlag = (this.state.current.key == 'ranking') ? this.state.rankingNum : _.ceil(_.multiply(_.divide(this.state.percentageNum, 100), examInfo.realStudentsCount));
        var tableBodyData = theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers, isGood, countFlag);
        //自定义Module数据结构：
        var _this = this;

        return (
            <div style={{position: 'relative'}}>
                {/*---------------------------------    switch按钮  ---------------------------------------------- */}
                 <div style={{position: 'absolute', top: -55, left: '50%', marginLeft: -80, width: 160, height: 30, borderRadius: 2, border: '1px solid ' + colorsMap.B03 }}>
                    <div style={_.assign({},{position: 'absolute', top: -1, width: 80, height: 30, zIndex: 0, borderRadius: 2, backgroundColor: colorsMap.B03, transition: 'left .2s linear'}, current.key === 'ranking' ? {left: 0} : {left: 80})}></div>
                    {
                        this.selectItems.map((item, index) => {
                            return (
                                <div key={'statisticType-' + index} style={_.assign({}, {position: 'relative', background: 'transparent', display: 'inline-block', width: '50%', height: '100%', textAlign: 'center', lineHeight: '30px', cursor: 'pointer', zIndex: 1, transition: 'color .2s linear'}, current.key === item.key ? {color: '#fff'} : {color: colorsMap.B03})}
                                     onClick={this.chooseItem.bind(this, item)}>
                                    {item.value}
                                </div>
                            )
                        })
                    }
                </div>
                {/* 名次/比例输入框  */}
                <div style={{position: 'absolute', right: 0, top: -55 }}>
                    <span style={{marginRight: 8}}>年级{(isGood) ? '前' : '后'}</span>
                    <input ref='numInput' value={this.state.inputNum} onChange={this.onChangeInput.bind(this)} style={{ fontSize:'14px',display: 'inline-block', width: 52, height: 30, lineHeight: '30px', textAlign:'center', marginRight: 5, border: '1px solid ' + colorsMap.C04}}/>
                    <span style={{marginRight: 10}}>{_this.state.current.key === 'ranking' ? '名' : '%'}</span>
                    <span onClick={this.onConfirmChange.bind(this)} style={{display: 'inline-block', width: 42, height: 30, lineHeight: '30px', borderRadius: 2, backgroundColor: colorsMap.B03, color: '#fff', cursor: 'pointer', textAlign: 'center'}}>
                        确定
                    </span>
                </div>
                <TableView TableComponent={Table} tableHeaderData={tableHeaderData} isGood={isGood} current={this.state.current} tableData={tableBodyData}/>
            </div>
        )
    }
}


const StudentPerformance = ({reportDS}) => {
    //算法数据结构：
    var examInfo = reportDS.examInfo.toJS(),
        examStudentsInfo = reportDS.examStudentsInfo.toJS(),
        allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(),
        headers = reportDS.headers.toJS();
    //自定义Module数据结构：
    var topStudents = _.reverse(_.takeRight(examStudentsInfo, 10));
    var lowStudents = _.reverse(_.take(examStudentsInfo, 10));
    var tableHeaderData = _.map(headers, (headerObj) => headerObj.subject);
    var rankColors = [B08, B07, B06];
    var students = [topStudents, lowStudents];
    return (
        <div id='studentPerformance' className={schoolReportStyles['section']} style={{ paddingBottom: 30 }}>
            <div style={{ marginBottom: 30 }}>
                <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>分数排行榜</span>
                <span className={schoolReportStyles['title-desc']}>分数排行榜，可得出相对优秀及相对落后的学生在各个班级中的分布数量</span>
            </div>
            {/******************************   前后十名列表 *******************************************/}
            <div id='rank-table'>
            {
                _.range(2).map(posNum => {
                    {/* 分别渲染前、后十名列表 */}
                    return (
                        <div key={'table-' + posNum} style={_.assign({}, { width: 555, minHeight: 338, display: 'inline-block', border: '1px solid ' + colorsMap.C04, paddingTop: 30 }, posNum === 0 ? { marginRight: 30 } : {}) }>
                            <div style={{ padding: '0 30px 20px 0', marginLeft: 30, borderBottom: '1px solid ' + colorsMap.C04 }}>{'本次考试' + (posNum === 0 ? '前' : '后') + '十名的学生'}</div>
                            {
                                _.range(2).map(num => {
                                    {/* 分别渲染列表内的左右边表格 */ }
                                    return (
                                        <table key={'table-' + posNum + '-' + num} style={_.assign({}, { width: 240, minHeight: 220, margin: '30px 0 0 30px', float: 'left' }, num === 0 ? { borderRight: '1px solid ' + C05 } : {}) }>
                                            <thead>
                                                <tr>
                                                    <th style={localCss.tableCell}>名次</th>
                                                    <th style={localCss.tableCell}>姓名</th>
                                                    <th style={localCss.tableCell}>班级</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    students[posNum].slice(num * 5, (num + 1) * 5).map((student, index) => {
                                                        return (
                                                            <tr key={posNum + '-student-tr-' + num + index}>
                                                                {
                                                                    _.range(3).map(tdNum => {
                                                                        var rank = num * 5 + index;
                                                                        switch (tdNum) {
                                                                            case 0:
                                                                                return (
                                                                                    <td key={posNum + '-student-' + rank + '-' + tdNum} style={localCss.tableCell}>
                                                                                        <div style={_.assign({}, { width: 22, height: 22, borderRadius: '50%', textAlign: 'center', lineHeight: '22px' }, (rank > 2 || posNum === 1)? { backgroundColor: colorsMap.C03, color: colorsMap.C09 } : { backgroundColor: rankColors[rank], color: '#fff' }) }>
                                                                                            {rank + 1}
                                                                                        </div>
                                                                                    </td>)
                                                                            case 1:
                                                                                return (
                                                                                    <td key={posNum + '-student-' + rank + '-' + tdNum} style={localCss.tableCell}>{student.name}</td>
                                                                                )
                                                                            case 2:
                                                                                return (
                                                                                    <td key={posNum + '-student-' + rank + '-' + tdNum} style={localCss.tableCell}>{student.class + '班'}</td>
                                                                                )
                                                                        }
                                                                    })
                                                                }
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    )
                                })
                            }
                        </div>
                    )
                    })
            }
            </div>
             {/*--------------------------------  优秀学生人数表格 -------------------------------------*/}
            <p style={{ marginBottom: 30, marginTop: 50 }}>
                <span className={schoolReportStyles['sub-title']}>优秀学生人数</span>
            </p>
            <StudentPerformanceTable
                examInfo={examInfo}
                examStudentsInfo={examStudentsInfo}
                allStudentsPaperMap={allStudentsPaperMap}
                headers={headers}
                isGood={true}
                tableHeaderData={tableHeaderData}
                />
             {/*--------------------------------  待提高学生人数表格 -------------------------------------*/}
            <p style={{ marginBottom: 30, marginTop: 50 }}>
                <span className={schoolReportStyles['sub-title']}>待提高学生人数</span>
            </p>
            <StudentPerformanceTable
                examInfo={examInfo}
                examStudentsInfo={examStudentsInfo}
                allStudentsPaperMap={allStudentsPaperMap}
                headers={headers}
                isGood={false}
                tableHeaderData={tableHeaderData}
                />
        </div>
    )
}


export default StudentPerformance;

/*
{
    <className>: {
        totalScore: {
            top:
            low:
        },
        <pid>: {
            top:
            low:
        }
    }
}
*/

/**
 * [theStudentExamTables description]
 * @param  {[type]} examInfo            [description]
 * @param  {[type]} examStudentsInfo    [description]
 * @param  {[type]} allStudentsPaperMap [description]
 * @param  {[type]} headers             [description]
 * @param  {[type]} type                是优秀还是差的
 * @param  {[type]} value               计算的数值
 * @return {[type]}                     [description]
 */
function theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers, isGood, countFlag) {
    var result = {};
    _.each(examInfo.realClasses, (className) => {
        result[className] = {};
    });

    var totalScoreStudentsGroupByClass = (isGood) ? _.groupBy(_.takeRight(examStudentsInfo, countFlag), 'class') : _.groupBy(_.take(examStudentsInfo, countFlag), 'class');
    _.each(examInfo.realClasses, (className, index) => {
        result[className].totalScore = totalScoreStudentsGroupByClass[className] ? totalScoreStudentsGroupByClass[className].length : 0;
    });
    _.each(allStudentsPaperMap, (papers, pid) => {
        var orderPapers = _.sortBy(papers, 'score');
        var subjectScoreStudentsByClass = (isGood) ? _.groupBy(_.takeRight(orderPapers, countFlag), 'class_name') : _.groupBy(_.take(orderPapers, countFlag), 'class_name');
        _.each(examInfo.realClasses, (className, index) => {
            result[className][pid] = subjectScoreStudentsByClass[className] ? subjectScoreStudentsByClass[className].length : 0;
        });
    });

    var table = [];
    _.each(result, (value, className) => {
        var row = [];
        //headers就是真正考的科目+总分
        _.each(headers, (headerObj, index) => {
            row.push(value[headerObj.id]);
        });
        row.unshift(examInfo.gradeName + className + '班');
        table.push(row);
    });

    return table;
}


/*
Mock Data:
let studentList = {
    firstTen: [
        {
            name: '宋江',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }],
    lastTen: [
        {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }
    ]
}


var classData = {
    '初一一班': [78, 98, 32, 42, 28, 89, 21],
    '初一二班': [78, 98, 32, 42, 28, 89, 21],
    '初一三班': [78, 98, 32, 42, 28, 89, 21],
    '初一四班': [78, 98, 32, 42, 28, 89, 21]
}

 */

// function theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers) {
//     var result = {};
//     _.each(examInfo.realClasses, (className) => {
//         result[className] = {};
//     });

// //总分的相关信息
//     var totalScoreTopStudentsGroupByClass = _.groupBy(_.takeRight(examStudentsInfo, 30), 'class');
//     var totalScoreLowStudentsGroupByClass = _.groupBy(_.take(examStudentsInfo, 30), 'class');

//     _.each(totalScoreTopStudentsGroupByClass, (students, className) => {
//         result[className].totalScore = { top: students.length };
//     });

//     _.each(totalScoreLowStudentsGroupByClass, (students, className) => {
//         if(!result[className].totalScore) {
//             result[className].totalScore = { low: students.length };
//         } else {
//             result[className].totalScore.low = students.length;
//         }
//     });

//     _.each(allStudentsPaperMap, (papers, pid) => {
//         var orderPapers = _.sortBy(papers, 'score');

//         var topPapers = _.takeRight(orderPapers, 30); //这个30，不是固定的，而且如果是比例的话，要把比例换算成数值
//         var lowPapers = _.take(orderPapers, 30);

//         var topPapersGroupByClassName = _.groupBy(topPapers, 'class_name');
//         var lowPapersGroupByClassName = _.groupBy(lowPapers, 'class_name');

//         _.each(topPapersGroupByClassName, (cpapers, className) => {
//             result[className][pid] = { top: cpapers.length };
//         });
//         _.each(lowPapersGroupByClassName, (cpapers, className) => {
//             if(!result[className][pid]) {
//                 result[className][pid] = { low: cpapers.length };
//             } else {
//                 result[className][pid].low = cpapers.length;
//             }
//         });
//     });
// //TODO: select可以变化多种计算方式，会改变matrix table的数据
//     var topMatrix = [], lowMatrix = [];
//     _.each(result, (value, className) => {
//         var tempTop = [], tempLow = [];
//          _.each(headers, (headerObj, index) => {
//             var tempTopCount = value[headerObj.id] ? (value[headerObj.id].top ? value[headerObj.id].top : 0) : 0;
//             var tempLowCount = value[headerObj.id] ? (value[headerObj.id].low ? value[headerObj.id].low : 0) : 0;

//             tempTop.push(tempTopCount);
//             tempLow.push(tempLowCount);
//         });

//         tempTop.unshift(examInfo.gradeName+className+'班');
//         tempLow.unshift(examInfo.gradeName+className+'班');

//         topMatrix.push(tempTop);
//         lowMatrix.push(tempLow);
//     });

//     return {topTableData: topMatrix, lowTableData: lowMatrix}
// }
