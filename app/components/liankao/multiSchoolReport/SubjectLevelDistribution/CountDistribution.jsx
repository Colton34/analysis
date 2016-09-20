// 联考报告-学科上档人数分布：
import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap, NUMBER_MAP as numberMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

/**
 * props: reportDS
 */
export default class StudentCountDistribution extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLevel : 0
        }
        var {reportDS} = props;
        var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS(), levels = reportDS.levels.toJS(), subjectLevels=reportDS.subjectLevels.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS();
        this.levelSize = _.size(levels);
        this.tableHeadersByLevel = getTableHeadersByLevel(headers, levels, subjectLevels);
        this.tableDataByLevel = getTableDataByLevel(examStudentsInfo, allStudentsPaperMap, headers, levels, subjectLevels);
        

    }
    switchTab(levelNum) {
        this.setState({
            currentLevel: levelNum
        })
    }
    render() {
        var {currentLevel} = this.state;
        return (
            <div>
                {/* tab */}
                <div className='tab-ctn'>
                    <ul>
                    {
                        _.range(this.levelSize).map((num) => {
                            return (
                                <li key={'levelInfo-li-' + num}onClick={this.switchTab.bind(this, num) } className={'fl ' + (num === this.state.currentLevel ? 'active' : '') } data-num={num}>{numberMap[num + 1]}档线上线学生人数分布</li>
                            )
                        })
                    }
                    </ul>
                </div>
                <TableView tableHeaders={this.tableHeadersByLevel[currentLevel]} tableData={this.tableDataByLevel[currentLevel]} TableComponent={EnhanceTable}/>
            </div>
        )
    }
}

function getTableRenderData(){
    var tableHeaders = getTableHeaders();
    var tableData = getTableData();
    return {tableHeaders, tableData};
}

function getTableHeadersByLevel(headers, levels, subjectLevels) {
    var tableHeadersByLevel = {};
    var levelSize = _.size(levels);
    _.forEach(_.range(levelSize), levelNum => {
        var tableHeaders = [[{id: 'school', name: '学校'}]];
        tableHeadersByLevel[levelNum] = tableHeaders;
        
        _.forEach(headers, headerInfo => {
            var header = {};
            header.id = headerInfo.id;
            if(headerInfo.id === 'totalScore') {
                header.name = headerInfo.subject + '(' + levels[levelSize - levelNum - 1].score +')';
            } else {
                header.name = headerInfo.subject + '(' + subjectLevels[levelSize - levelNum - 1][headerInfo.id].mean + ')';
            }
            tableHeaders[0].push(header);
        })
    })
    return tableHeadersByLevel;
}

function getTableDataByLevel(examStudentsInfo, allStudentsPaperMap, headers, levels, subjectLevels) {
    allStudentsPaperMap.totalScore = examStudentsInfo;
    var studentsPaperMapByGroup = getStudentsPaperMapByGroup(allStudentsPaperMap);
    var schoolNames = ['联考全体'].concat(_.keys(_.omit(studentsPaperMapByGroup.totalScore, '联考全体'))); //为了让’联考全体‘放在第一位

    var tableDataByLevel = {};
    var levelSize = _.size(levels);
    _.forEach(_.range(levelSize), levelNum => {
        var tableData = [];
        tableDataByLevel[levelNum] = tableData;
        _.forEach(schoolNames, schoolName => {
            var rowData = {school: schoolName};
            _.forEach(headers, headerInfo => {
                if (headerInfo.id === 'totalScore') {
                    var levelScore = levels[levelSize - levelNum -1].score;
                    var qualifiedStudents = _.filter(studentsPaperMapByGroup['totalScore'][schoolName], studentInfo => {return studentInfo.score >= levelScore});
                } else {
                    var subjectLevelScore = subjectLevels[levelSize - levelNum -1][headerInfo.id].mean;
                    var qualifiedStudents = _.filter(studentsPaperMapByGroup[headerInfo.id][schoolName], studentInfo => {return studentInfo.score >= subjectLevelScore})
                }
                rowData[headerInfo.id]  = qualifiedStudents.length; 
            })
            tableData.push(rowData);
        })
    })
    return tableDataByLevel;
}

//传入的参数较reportDS多了一个'total'属性（代表全体考生）
function getStudentsPaperMapByGroup(studentsPaperMap) {
    _.forEach(studentsPaperMap, (studentList, paperid) => {
        var group = _.groupBy(studentList, 'school');
        studentsPaperMap[paperid] = group;
        studentsPaperMap[paperid]['联考全体'] = studentList;
    })
    return studentsPaperMap;
}