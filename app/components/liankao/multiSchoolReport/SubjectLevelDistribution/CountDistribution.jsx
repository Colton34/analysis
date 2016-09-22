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
            currentLevel : 0 // 表示高分档；
        }
        var {reportDS, paperSchoolLevelMap} = props;
        var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS(), levels = reportDS.levels.toJS(), subjectLevels=reportDS.subjectLevels.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS();
        this.levelSize = _.size(levels);
        this.examPapersInfo = reportDS.examPapersInfo.toJS();
        this.tableDataByLevel = getTableDataByLevel(paperSchoolLevelMap, headers, levels, subjectLevels);
        this.summaryInfo = getSummaryInfo(this.tableDataByLevel);
    }
    switchTab(levelNum) {
        this.setState({
            currentLevel: levelNum
        })
    }
    render() {
        var {currentLevel} = this.state;
        var {tableHeadersByLevel} = this.props;
        return (
            <div style={{marginTop: 30}}>
                <div className={commonClass['sub-title']}>学科分档上线学生人数分布</div>
                <div style={{margin: '10px 0 20px'}}>
                   对每个档次而言，学科提供的上线人数越多，该学科就为联考总分上线提供了更大的可能性。
                   这可以视为该学科对总分上线提供了更大的可能性，促进作用大。反 之，学科上线人数越少，该学科对总分上线提供的促进作用较小。
                    下面三个表分别显示{_.join(_.range(this.levelSize).map(num => {return numberMap[num + 1]}), '、')}档各个学科的上线人数。
                </div>
                {/* tab */}
                <div className='tab-ctn' style={{marginBottom: 10}}>
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
                <TableView hover tableHeaders={tableHeadersByLevel[currentLevel]} tableData={this.tableDataByLevel[currentLevel]} TableComponent={EnhanceTable}/>
                <div className={commonClass['analysis-conclusion']}>
                    <p>分析诊断:</p>
                    <div>
                        从以上数据可以明显看到，
                        {
                            _.range(this.levelSize).map(num => {
                                return (
                                    <span key={'countDis-summaryInfo-' + num}>
                                        {
                                            num !== 0 ? numberMap[num + 1] + '档上线，' : ''
                                        }
                                        <span style={{color: colorsMap.B03}}>{_.join(_.map(this.summaryInfo[num], paperid => {return this.examPapersInfo[paperid].subject}), '、')}</span>
                                        {   
                                            num !== 0 ? '学科的促进作用来得较大。' : '学科一档线上线人数较多，它们对促使更多学生总分达到一档水平带来的可能性更大，可以说它们对一档上线的促进作用来得较大。'
                                        }
                                    </span>
                                )
                            })
                        }
                        相应的，学科上线人数较少，
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * @params: paperSchoolLevelMap来自父组件，其余来自reportDS;
 * @return: Object, 其中：key为分档档次，value为相应的tableData。 注意： 0为一档，1为二挡，以此类推。
 */
function getTableDataByLevel(paperSchoolLevelMap, headers, levels, subjectLevels) {
    var schoolNames = ['联考全体'].concat(_.keys(_.omit(paperSchoolLevelMap.totalScore, '联考全体'))); //为了让’联考全体‘放在第一位

    var tableDataByLevel = {};
    var levelSize = _.size(levels);
    _.forEach(_.range(levelSize), levelNum => {
        var tableData = [];
        tableDataByLevel[levelNum] = tableData;
        _.forEach(schoolNames, schoolName => {
            var rowData = {school: schoolName};
            _.forEach(headers, headerInfo => {
                var schoolLevelStudents = paperSchoolLevelMap[headerInfo.id][schoolName];
                rowData[headerInfo.id]  = schoolLevelStudents ? schoolLevelStudents[levelNum].length : 0;
            })
            tableData.push(rowData);
        })
    })
    return tableDataByLevel;
}

/**
 * 根据联考全体中各学科上档人数，获取各档人数最多的学科。
 * @return: 
 *  {
 *      0: [paperid1, paperid2...], //0表示第一档（高分档）
 *      1：[paperidx...],
 *      ...
 *  }
 */
function getSummaryInfo(tableDataByLevel) {
    var summaryInfo = {};

    _.forEach(tableDataByLevel, (tableData, levelNum) => {
       var countIdMap = getCountIdMap(tableData[0]);
       var countList = _.keys(countIdMap);
       countList =  _.sortBy(countList, countStr => {return parseFloat(countStr)});
       summaryInfo[levelNum] = countIdMap[_.last(countList)];
    })
    return summaryInfo;

}

/**
 * 按各学科上线人数，生成一个key为人数，value为相应学科id列表的map；
 * @param: rowData: [Object]表示一行表格数据；
 * @return {
 *      count1: [paperid1, paperid2...],
 *      count2: [paperidx...],
 *      ...
 * }
 */
function getCountIdMap(rowData) {
     var countIdMap = {};

     _.forEach(rowData, (count, id) => {
         if (id === 'totalScore' || id === 'school') return;
         if (!countIdMap[count]) {
             countIdMap[count] = [];
         }
         countIdMap[count].push(id);
     })
     return countIdMap;
}