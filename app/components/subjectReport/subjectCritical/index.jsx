//学科报告：分档临界生情况
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import {makeSegmentsCountInfo} from '../../../api/exam';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';
import {Link} from 'react-router';

/**
 * props:
 * //({reportDS, currentSubject})
 */
export default class SubejctCriticalModule extends React.Component{
    constructor(props){

        super(props);
        this.state = {
            currentLevel: 0 //高分档数字小
        }
    }
    getTableDataColor(data) {
        if (data < 0) {
            return colorsMap.B08;
        } else {
            return 'inherit';
        }
    }
    switchTab(num) {
        this.setState({
            currentLevel: num
        })
    }
    render(){
        var {reportDS, currentSubject} = this.props;
        var {currentLevel} = this.state;
        var criticalStudentInfo = getCriticalStudentInfo(reportDS);
        var {tableData, badPerformanceClass} = getRenderData(reportDS, criticalStudentInfo, currentLevel, currentSubject);
        var levelSize = _.size(reportDS.levels.toJS());

        return (
            <div id="subjectCritical" className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>分档临界生情况</span>
                <span className={commonClass['title-desc']}>对比本学科各班级临界生情况，关注临界生群体，提高年级教学质量</span>

                {/****************** 切换标签 *************** */}
                <div className='tab-ctn'>
                    <ul>
                        {
                            _.range(levelSize).map((num) => {
                                return (
                                    <li key={'levelInfo-li-' + num} onClick={this.switchTab.bind(this, num) } className={'fl ' + (num === this.state.currentLevel ? 'active' : '') } data-num={num}>{numberMap[num + 1]}档线上线学生人数分布</li>
                                )
                            })
                        }
                    </ul>
                </div>
                 {/********************************* */}
                <TableView tableData={tableData} style={{marginTop: 30}} colorCallback={this.getTableDataColor}/>

                <div className={commonClass['analysis-conclusion']}>
                    <p>分析诊断：</p>
                    <p>
                    {
                        badPerformanceClass.length ? '从差异来看，对各班级临界生而言，' + currentSubject.subject + '学科表现欠佳的班级是' + _.join(badPerformanceClass, '、') + '。'
                            : '针对各班级临界生而言，整体来看学科平均表现都在学科分档线之上，但也要去具体关注每一个临界生学生的具体表现。'

                    }
                    </p>
                </div>
            </div>
    )
    }

}

function makeCriticalStudentsInfo(students, levels, levelBuffers) {
    var criticalLevelInfo = {};
    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCountsInfoArr = makeSegmentsCountInfo(students, segments);
    var classRow = _.filter(classCountsInfoArr, (countInfo, index) => (index % 2 == 0));//从低到高
    _.reverse(classRow); //从高到底

    _.each(classRow, (arr, index) => {
        criticalLevelInfo[index] = arr;//这里是反转后的数据。
    });

    return criticalLevelInfo;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}

function getCriticalStudentInfo(reportDS) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var examInfo = reportDS.examInfo.toJS();
    var levels = reportDS.levels.toJS();
    var levelBuffers = reportDS.levelBuffers.toJS();
    var criticalStudentInfo = makeCriticalStudentsInfo(examStudentsInfo, levels, levelBuffers);//全年级临界生
    _.forEach(criticalStudentInfo, (levelArray, level) => {
        criticalStudentInfo[level] = _.groupBy(levelArray, 'class');
    })
    return criticalStudentInfo;
}
function getRenderData(reportDS, criticalStudentInfo, currentLevel, currentSubject) {
    var tableData = [['分档临界生', '年级']];
    var studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var classList = [];
    _.forEach(studentsGroupByClass, (classInfo, className) => {
        tableData[0].push(className + '班');
        classList.push(className);
    })

    var criticalStudentCountRowData = getCriticalStudentCountRowData(criticalStudentInfo, classList, currentLevel);
    tableData.push(criticalStudentCountRowData);

    var subjectMeanRowData = getSubjectMeanRowData(criticalStudentInfo, classList, currentSubject, currentLevel);
    tableData.push(subjectMeanRowData);

    var subjectLevels = reportDS.subjectLevels.toJS(); //注意高分档在后
    var {deviationRowData, badPerformanceClass} = getDeviationRowData(subjectMeanRowData, classList, subjectLevels, currentLevel, currentSubject);
    tableData.push(deviationRowData);

    return {tableData, badPerformanceClass};
}

function getCriticalStudentCountRowData(criticalLevelInfo, classList, currentLevel) {
    var rowData = [numberMap[currentLevel+1] + '档临界生人数'];
    //先计算全年级的
    var sum = 0;
    _.forEach(criticalLevelInfo[currentLevel], (studentList, className) =>{
        sum += studentList.length;
    })
    rowData.push(sum);
    //计算各个班级：
    _.forEach(classList, className => {
        rowData.push(criticalLevelInfo[currentLevel][className] ? criticalLevelInfo[currentLevel][className].length : 0)
    })
    return rowData;
}

function getSubjectMeanRowData(criticalLevelInfo, classList, currentSubject, currentLevel) {
    var rowData =['临界生本学科平均分'];
    //全年级的：
    var sum = 0;
    var studentsNum = 0;
    _.forEach(criticalLevelInfo[currentLevel], (studentList, className) => {
        studentsNum += studentList.length;
        _.forEach(studentList, student => {
            _.forEach(student.papers, paper => {
                if (paper.paperid === currentSubject.pid) {
                    sum += paper.score;
                }
            })
        })
    })
    rowData.push(_.round(sum / studentsNum, 2));

    //各个班级：
    _.forEach(classList, className => {
        if(criticalLevelInfo[currentLevel][className]) {
            var sum = 0;
            var studentNum = criticalLevelInfo[currentLevel][className].length;
            _.forEach(criticalLevelInfo[currentLevel][className], studentInfo => {
                _.forEach(studentInfo.papers, paper => {
                    if (paper.paperid === currentSubject.pid) {
                        sum += paper.score;
                    }
                })
            })
            rowData.push(_.round(sum / studentNum, 2));
        } else {
            rowData.push(0);
        }
    })
    return rowData;
}

function  getDeviationRowData(subjectMeanRowData, classList, subjectLevels, currentLevel, currentSubject) {
    var rowData = ['与学科档线差异'];
    var badPerformanceClass = [];
    var meanData = subjectMeanRowData.slice(2);
    var subjectMean = subjectLevels[_.size(subjectLevels) - currentLevel - 1][currentSubject.pid].mean;
    // 全年级：
    rowData.push(_.round(subjectMeanRowData[1] - subjectMean, 2));
    // 各班级
    _.forEach(classList, (className, index) => {
        if (meanData[index] === 0) {
            rowData.push('--');
        } else {
            rowData.push(_.round(meanData[index] - subjectMean, 2));
            if (meanData[index] - subjectMean < 0) {
                badPerformanceClass.push(classList[index] + '班');
            }
        }

    })
    return {deviationRowData: rowData, badPerformanceClass: badPerformanceClass};
}
