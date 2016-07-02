import React from 'react';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

import styles from '../../../common/common.css';
import localStyle from './studentPerformance.css';
import Radium from 'radium';
import TableView from '../TableView';
import {Table as BootTable} from 'react-bootstrap';
var localCss = {
    btn: {
        display: 'inline-block', width: 115, height: 25, color: '#333', lineHeight: '25px', textDecoration: 'none', textAlign: 'center', border: '1px solid #e9e8e6',
        ':hover': { textDecoration: 'none' },
        ':link': { textDecoration: 'none' }
    },

}

const Table = ({tableHeaderData, isGood, inputNum, current, tableData}) => {
    return (
        <BootTable bordered hover responsive>
            <tbody>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    <th rowSpan="2" className={styles['table-unit']}>班级</th>
                    {
                        _.map(tableHeaderData, (th, index) => {
                            return (
                                <th key={index} className={styles['table-unit']}>{th}</th>
                            )
                        })
                    }
                </tr>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    {
                        _.map(tableHeaderData, (th, index) => {
                            return (
                                <th key={index} className={styles['table-unit']}>{(isGood ? '前' : '后') + inputNum + (current.key == 'ranking' ? '名' : '%') }</th>
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
                                            <td key={index} className={styles['table-unit']}>
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
        this.state = {
            active: false,
            current: this.selectItems[0], //默认按照名词排列
            coveredItems: this.selectItems.slice(1),
            rankingNum: 30, //默认是 名词排列 的 前30名
            percentageNum: 30,
            inputNum: 30
        }
    }
    handleBodyClick(event) {
        if($(event.target).parents('#dropdownList').length === 0) {
            this.setState({
                active: false
            })
         }
    }
    componentDidMount() {
        this.clickHandlerRef = this.handleBodyClick.bind(this);
        $('body').bind('click', this.clickHandlerRef)
    }
    componentWillUnmount() {
        $('body').unbind('click', this.clickHandlerRef);
    }
    toggleList() {
        this.setState({ active: !this.state.active })
    }

    chooseItem(content) {
        //TODO: setState(newState)中newState不一定需要把所有的stae属性都添加上去吧，没有就是不修改吧？
        var newState = { current: content, active: false, coveredItems: _.without(this.selectItems, content) };
        newState.inputNum = (content.key == 'ranking') ? this.state.rankingNum : this.state.percentageNum;
        this.setState(newState);
    }

    onInputChange(event) {
        var value = parseInt(event.target.value);
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

    render() {
        //Props数据结构：
        var {examInfo, examStudentsInfo, allStudentsPaperMap, headers, isGood, tableHeaderData} = this.props;
        //算法数据结构：
        //如果是ranking，那么直接就是value, 如果是percentage，那么需要算出来value
        var countFlag = (this.state.current.key == 'ranking') ? this.state.rankingNum : _.ceil(_.multiply(_.divide(this.state.percentageNum, 100), examInfo.realStudentsCount));
        var tableBodyData = theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers, isGood, countFlag);
        //自定义Module数据结构：
        var _this = this;

        return (
            <div>
                <div style={{ position: 'absolute', right: 180 }}>
                    <a key={'ddbtn-head'} style={[localCss.btn, {position: 'relative'}]} href="javascript:void(0)" onClick={this.toggleList.bind(this) }>
                        {this.state.current.value}
                        <span className='dropdown' style={{ position: 'absolute', right: 10, color:'#bfbfbf' }}>
                            <span className='caret'></span>
                        </span>
                    </a>
                    <ul id='dropDownList' className={this.state.active ? localStyle.list : localStyle.hide}>
                        {
                            _.map(_this.state.coveredItems, (item, index) => {
                                return (
                                    <li key={index}>
                                        <a key={'ddbtn-' + index} style={[localCss.btn, { backgroundColor: '#f2f2f2', color: '#333' }]} href="javascript:void(0)" onClick={this.chooseItem.bind(this, item) }>
                                            {item.value}
                                        </a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                {/* 名次/比例输入框  */}
                <div style={{ float: 'right', marginRight: -90, marginBottom: 10 }}>
                    年级{(isGood) ? '前' : '后'}<input defaultValue={_this.state.inputNum} onBlur={_this.onInputChange.bind(_this) } style={{ display: 'inline-block', width: 45, height: 22, lineHeight: '22px' }}/> {_this.state.current.key === 'ranking' ? '名' : '%'}
                </div>
                <TableView TableComponent={Table} tableHeaderData={tableHeaderData} isGood={isGood} inputNum={this.state.inputNum} current={this.state.current} tableData={tableBodyData}/>

            </div>
        )
    }
}


const StudentPerformance = ({examInfo, examStudentsInfo, allStudentsPaperMap, headers}) => {
    //算法数据结构：

    //自定义Module数据结构：
    var topStudents = _.reverse(_.takeRight(examStudentsInfo, 10));
    var lowStudents = _.reverse(_.take(examStudentsInfo, 10));
    var tableHeaderData = _.map(headers, (headerObj) => headerObj.subject);

    return (
        <div className={styles['school-report-layout']} style={{ paddingBottom: 100 }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ padding: '0 10px', position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 300 }}>
                学校有必要知道的学生重点信息
            </div>

            {/*--------------------------------  有关学生重要信息的图表 -------------------------------------*/}
            <div className={styles['school-report-content']}>
                <p>（1）这次考试，全校总分前后十名的学生是：</p>
                <div>
                    <div style={{ margin: '0 auto', width: 500 }}>
                        <div style={{ display: 'inline-block' }}>
                            <div className={localStyle['first-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #6dd0a8', margin: '0 auto' }}>
                                {
                                    _.map(topStudents, (student, index) => {
                                        return (
                                            <div key={index} className={localStyle['student-box']}>
                                                <div style={{ fontSize: 14, color: '#3bba80' }}>{student.name}</div>
                                                <div style={{ fontSize: 12 }}>({student.class + '班'}) </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div style={{ display: 'inline-block', float: 'right' }}>
                            <div className={localStyle['last-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #f9b4a2', margin: '0 auto' }}>
                                {
                                    _.map(lowStudents, (student, index) => {
                                        return (
                                            <div key={index} className={localStyle['student-box']}>
                                                <div style={{ fontSize: 14, color: '#f68a72' }}>{student.name}</div>
                                                <div style={{ fontSize: 12 }}>({student.class + '班'}) </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/*--------------------------------  有关学生重要信息的表格 -------------------------------------*/}
                <div style={{ marginTop: 60 }}>
                    <p>（2）全校各个班级在各个学科优秀的学生人数，见下表：</p>
                    <StudentPerformanceTable
                        examInfo={examInfo}
                        examStudentsInfo={examStudentsInfo}
                        allStudentsPaperMap={allStudentsPaperMap}
                        headers={headers}
                        isGood={true}
                        tableHeaderData={tableHeaderData}
                        />
                </div>
                <div style={{ marginTop: 40 }}>
                    <p>（3）全校各班级在各学科欠佳的学生数，如下表所示。希望相应班级任课教师多多帮助他们进步。</p>
                    <StudentPerformanceTable
                        examInfo={examInfo}
                        examStudentsInfo={examStudentsInfo}
                        allStudentsPaperMap={allStudentsPaperMap}
                        headers={headers}
                        isGood={false}
                        tableHeaderData={tableHeaderData}
                        />
                </div>
                <div style={{ marginTop: 30 }}>
                    <p>
                        注：每个学生都有精准的个人学业诊断分析报告，学生或家长可免费通过“好分数网”查阅个人考试的基本情况。网址：
                        <a href="http://hfs.yunxiao.com">hfs.yunxiao.com</a>, 账户名为学生本人学号，初始密码为学生家长的电话号码。
                    </p>
                </div>
            </div>
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
            // console.log(value[headerObj.id]);
            value[headerObj.id] ? row.push(value[headerObj.id]) : row.push(0);
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
