import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../../styles/common.css';
import {COLORS_MAP as colorsMap, LETTER_MAP as letterMap} from '../../../../../lib/constants';
// components
import TableView from '../../../../../common/TableView';
import EnhanceTable from '../../../../../common/EnhanceTable';
import DropdownList from '../../../../../common/DropdownList';
//utils
import {makeSegmentsCount} from '../../../../../api/exam';

export default class ScoreLevelBySchool extends React.Component {
    constructor(props){
        super(props);
        var headers = props.reportDS.headers.toJS().slice(1);
        this.subjectList = headers.map(header => {return {id: header.id, value: header.subject, fullMark: header.fullMark}});
        this.state = {
            currentSubject: this.subjectList[0]
        }
        //按学科、学校将学生分组
        var allStudentsPaperMap = props.reportDS.allStudentsPaperMap.toJS();
        _.forEach(allStudentsPaperMap, (studentList, paperId) => {
            var groupBySchool = _.groupBy(studentList, 'school');
            groupBySchool['联考全体'] = studentList;
            allStudentsPaperMap[paperId] = groupBySchool;
        })
        this.studentsPaperMapBySchool = allStudentsPaperMap;

    }
    onSelectSubejct(item) {
        this.setState({
            currentSubject: item
        })
    }
    render() {
        var {currentSubject} = this.state;
        var {levelPercentages, reportDS} = this.props;
        var examStudentsInfo = reportDS.examStudentsInfo.toJS();

        var {tableHeaders, tableData} = getTableRenderData(levelPercentages, this.studentsPaperMapBySchool, currentSubject);
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ margin: '30px 0 20px 0' }}>
                    <span className={commonClass['sub-title']}>各个学校的学科水平等级结构表现</span>
                    <span className={commonClass['title-desc']}></span>
                </div>
                <DropdownList list={this.subjectList} style={{position: 'absolute', right: 0, top: 0, zIndex: 1}} onClickDropdownList={this.onSelectSubejct.bind(this)}/>
                <div style={{marginBottom: 10}}><span style={{color: colorsMap.B03}}>{currentSubject.value}</span>等级结构表现</div>
                <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            </div>
        )
    }
}

function getTableRenderData(levelPercentages, studentsPaperMapBySchool, currentSubject) {
    var tableHeaders = getTableHeaders(levelPercentages);
    var tableData = getTableData(levelPercentages, studentsPaperMapBySchool, currentSubject);

    return {tableHeaders, tableData};
}   

function getTableHeaders(levelPercentages) {
    var tableHeaders = [[{id: 'school', name: '学校'}]];
    var total = levelPercentages.length -1;
     _.forEach(_.range(total), index => {
        var header = {};
        if (index === 0) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'以上）';
        } else if (index === total-1) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index], 100), 2) +'以下）';
        } else {
            header.name = header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'-' + _.round(_.divide(levelPercentages[total-index], 100), 2) + '）';
        }
        header.id = letterMap[index];
        header.dataFormat = getTableDataFormat;
        tableHeaders[0].push(header);
    })
    return tableHeaders;
}

function getTableData(levelPercentages, studentsPaperMapBySchool, currentSubject) {
    var tableData = [];
    var segments = makeSubjectLevelSegments(currentSubject.fullMark, levelPercentages);
    var paperScoreBySchool = studentsPaperMapBySchool[currentSubject.id];
    var schoolList = ['联考全体'].concat(_.keys(_.omit(paperScoreBySchool, '联考全体'))); //让联考全体排最前

    _.forEach(schoolList, schoolName => {
        var rowData = {};
        rowData.school = schoolName;
        
        var result = makeSegmentsCount(paperScoreBySchool[schoolName], segments);
        _.reverse(result);//使高档次在前
        _.forEach(result, (count, index) => {
            rowData[letterMap[index]] = _.round(count / paperScoreBySchool[schoolName].length, 5);
        })
        tableData.push(rowData);
    })
    return tableData;
}

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPercentages) {
    return _.map(levelPercentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}

function getTableDataFormat(cell) {
    return _.round(cell * 100, 2) + '%';
}

