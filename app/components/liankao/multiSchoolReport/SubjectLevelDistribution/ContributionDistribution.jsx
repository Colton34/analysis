// 联考报告-学科上档贡献率分布：
import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap, NUMBER_MAP as numberMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';
// util
import {makeFactor} from '../../../../api/exam';

export default class ContributionDis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLevel : 0
        }

        var {reportDS, studentsPaperMapByGroup, tableHeadersByLevel, paperSchoolLevelMap} = this.props;
        // debugger;
        var headers = reportDS.headers.toJS(),levels = reportDS.levels.toJS(), subjectLevels=reportDS.subjectLevels.toJS(), headers=reportDS.headers.toJS();

        this.levelSize = _.size(levels);
        this.tableHeadersByLevel = getTableHeadersByLevel(tableHeadersByLevel);
        // console.log('1');
        // debugger;
        this.tableDataByLevel = getTableDataByLevel(studentsPaperMapByGroup, paperSchoolLevelMap, headers, levels, subjectLevels)
        // console.log('2');
        // debugger;
    }

    switchTab(levelNum) {
        this.setState({
            currentLevel: levelNum
        })
    }
    render () {
        var {currentLevel} = this.state;
        return (
            <div style={{marginTop: 30}}>
                <div className={commonClass['sub-title']}>学科分档上线的贡献率</div>
                <div style={{margin: '10px 0 20px'}}>
                    各个学校由于各自实际的客观原因（比如有示范校与普通校之分），学生的学业层次表现有较大的差异。对各学校自身水平而言，存在学科贡献的非均衡性。
                    我们基于学校所有学科实际综合水平的表现来考虑某学科对分档上线的贡献，并联系联考总体的对应情况进行综合分析，提炼出促进分批上线的“学科贡献率”指标。
                    一个学校的“学科贡献率”有正值或者负值。正值数值越大越好，负值的绝对值越大越不好。
                </div>
                {/* tab */}
                <div className='tab-ctn' style={{marginBottom: 10}}>
                    <ul>
                    {
                        _.range(this.levelSize).map((num) => {
                            return (
                                <li key={'levelInfo-li-' + num}onClick={this.switchTab.bind(this, num) } className={'fl ' + (num === this.state.currentLevel ? 'active' : '') } data-num={num}>{numberMap[num + 1]}档线上线学科贡献率</li>
                            )
                        })
                    }
                    </ul>
                </div>
               <TableView hover tableHeaders={this.tableHeadersByLevel[currentLevel]} tableData={this.tableDataByLevel[currentLevel]} TableComponent={EnhanceTable}/>

            </div>
        )
    }

}
/**
 * 将父组件数据做一些处理：删除表头中的“总分”项，添加单元格样式回调函数；
 * @param： tableHeadersByLevel： 由父组件传递。
 */
function getTableHeadersByLevel(tableHeadersByLevel) {
    var localTableHeadersByLevel = _.cloneDeep(tableHeadersByLevel);
    _.forEach(localTableHeadersByLevel, (tableHeaders, levelNum) => {
        tableHeaders[0].splice(1,1); //去掉“总分”项
        _.forEach(tableHeaders[0], header => {
            header.columnStyle = getColumnStyle;
        })
    })
    return localTableHeadersByLevel;
}

/**
 *
 */
function getTableDataByLevel(studentsPaperMapByGroup, paperSchoolLevelMap, headers, levels, subjectLevels) {
    var schoolNames = ['联考全体'].concat(_.keys(_.omit(studentsPaperMapByGroup.totalScore, '联考全体')));//为了让’联考全体‘放在第一位
    var tableDataByLevel = {};

    var oriMatrixByLevel = getOriginalMatrixByLevel(paperSchoolLevelMap, studentsPaperMapByGroup, headers, schoolNames, _.size(levels));
    // debugger;
    var factorMatrixByLevel = getFactorMatrixByLevel(oriMatrixByLevel);
// debugger;
    var levelSize = _.size(levels);
    _.forEach(_.range(levelSize), levelNum => {
        var tableData = [];
        tableDataByLevel[levelNum] = tableData;
        _.forEach(schoolNames.slice(1), (schoolName, rowIndex) => { // 没有“联考全体”一项
            var rowData = {school: schoolName};
            _.forEach(headers.slice(1), (headerInfo, colIndex) => { // 没有“总分”一项

// if(!factorMatrixByLevel[levelNum][rowIndex]) {
//     debugger;
// }

                rowData[headerInfo.id] = factorMatrixByLevel[levelNum][rowIndex][colIndex];
            })
            tableData.push(rowData);
        })
        tableDataByLevel[levelNum] = tableData;
    })
    return tableDataByLevel;
}

/**
 * @param: studentsPaperMapByGroup: 由父组件传递的结构；
 * @return:
 * {
 *      totalScore: {
 *          '联考全体': {
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          'xx学校'：{
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          ...
 *      },
 *      paperid1: {
 *          '联考全体': {
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          'xx学校'：{
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          ...
 *      },
 *      ...
 * }
 */
function getPaperSchoolLevelMap(studentsPaperMapByGroup, levels, subjectLevels) {
    var paperSchoolLevelMap = studentsPaperMapByGroup; //会修改传入的参数内容

    var levelSize = _.size(levels);
    _.forEach(studentsPaperMapByGroup, (subjectInfo, paperid)  => {
        _.forEach(subjectInfo, (schoolStudents, schoolName) => {
            var studentsByLevel = {};
            _.forEach(schoolStudents, studentInfo =>{
                if(paperid === 'totalScore') {
                    for(let i = 0; i < levelSize; i++){
                        if (studentInfo.score < levels[i].score){
                            if(!studentsByLevel[levelSize - i -1]){ // 让高档次放在前
                                studentsByLevel[levelSize - i -1] = [];
                            }
                            studentsByLevel[levelSize - i -1].push(studentInfo);
                            break;
                        }
                    }
                } else {
                    for(let i=0; i < levelSize; i++) {
                        if(studentInfo.score < subjectLevels[i][paperid].mean){
                            if(!studentsByLevel[levelSize - i -1]) {
                                studentsByLevel[levelSize - i -1] = [];
                            }
                            studentsByLevel[levelSize - i -1].push(studentInfo);
                            break;
                        }
                    }
                }
            })
            studentsPaperMapByGroup[paperid][schoolName] = studentsByLevel;
        })
    })
    return paperSchoolLevelMap;
}

/**
 *
 * @return: Object, 其中key为档次（0代表高分档）， value是相应的originalMatrix;
 */
function getOriginalMatrixByLevel(paperSchoolLevelMap, studentsPaperMapByGroup, headers, schoolNames, levelSize) {
    debugger;
    var oriMatrixByLevel = {};
    _.forEach(_.range(levelSize), levelNum => {
        var oriMatrix = [];
        _.forEach(schoolNames, schoolName => {
            var rowData = [];
            _.forEach(headers, headerInfo => {
                var levelStudentsMap = paperSchoolLevelMap[headerInfo.id][schoolName]; // 考虑某些学校没参加某科目的情况;
                if(!levelStudentsMap[levelNum] || !studentsPaperMapByGroup[headerInfo.id][schoolName]) {
                    debugger;
                }
                var levelRate = levelStudentsMap ? _.round(levelStudentsMap[levelNum].length / studentsPaperMapByGroup[headerInfo.id][schoolName].length, 2) : '--';
                //var scoreRate = levelStudentsMap ? _.round(_.meanBy(paperSchoolLevelMap[headerInfo.id][schoolName][levelNum], studentInfo => {return studentInfo.score}) / headerInfo.fullMark, 2) : '--';
                rowData.push(levelRate);
            })
            oriMatrix.push(rowData);
        })
        oriMatrixByLevel[levelNum] = oriMatrix;
    })
    debugger;
    return oriMatrixByLevel;
}

/**
 *
 * @return: Object, 其中key为档次（0代表高分档）， value是相应的factorMatrix;
 *
 */
function getFactorMatrixByLevel(oriMatrixByLevel) {
    var factorMatrixByLevel = {};
    _.forEach(oriMatrixByLevel, (oriMatrix, levelNum) => {
        var factorMatrix = makeFactor(oriMatrix);
        factorMatrixByLevel[levelNum] = factorMatrix;
    })
    return factorMatrixByLevel;
}

/**
 * 获取单元格的样式：如果数据小于0，则标红；
 * @return: inline style object;
 */
function getColumnStyle(cell) {
    if (cell < 0) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}
