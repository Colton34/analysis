//自定义成绩等级的人数比例对比

import _ from 'lodash';
import React, { PropTypes } from 'react';

import Dialog from './Dialog';
import TableView from '../../../../common/TableView';
import DropdownList from '../../../../common/DropdownList';
import EnhanceTable from '../../../../common/EnhanceTable';

import {makeSegmentsCount} from '../../../../api/exam';

import commonClass from '../../../../common/common.css';
import {LETTER_MAP as letterMap, COLORS_MAP as colorsMap} from '../../../../lib/constants';

class CustomScoreLevel extends React.Component {
    constructor(props) {
        super(props);
        var headers = this.props.reportDS.headers.toJS();
        this.formatedSubjects = getFormatedSubjects(headers);
        this.state = {
            currentSubject: this.formatedSubjects[0], //subject
            showDialog: false,
            levelPercentages: [0, 60, 70, 85, 100]
        }
    }

    updateLevelPercentages(newLevelPercentages) {
        console.log('newLevelPercentages:' + newLevelPercentages)
        this.setState({
            levelPercentages: newLevelPercentages
        })
    }

    onSelectSubject(subjectObj) {
        this.setState({
            currentSubject: subjectObj
        })
    }
    render() {
        var examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), headers = this.props.reportDS.headers.toJS(), gradeName = this.props.reportDS.examInfo.toJS().gradeName;
        var theDS = getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName, this.state.levelPercentages);

        var {tableHeaders, tableBodyData} = getFormatedData(theDS[this.state.currentSubject.id]);
        return (
            <div id='customScoreLevel' className={commonClass['section']} >
                <div style={{ position: 'relative' }}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>自定义成绩等级的人数比例对比</span>
                    <span className={commonClass['title-desc']}></span>

                    <DropdownList list={this.formatedSubjects} style={{position: 'absolute', top: 0, right: 214, zIndex: 1}} onClickDropdownList={this.onSelectSubject.bind(this)}/>
                    <Dialog levelPercentages={this.state.levelPercentages} updateGrades={this.updateLevelPercentages.bind(this) } examPapersInfo={examPapersInfo} />
                </div>
              <div style={{marginTop: 30}}>
                    <TableView id='customScoreLevelTable' tableHeaders= {tableHeaders} tableData={tableBodyData} TableComponent={EnhanceTable} options={{canDownload: true}}/>
                </div>
            </div>
        )
    }
}

function getFormatedData(theDS) {
    var tableHeaders = getTableHeaders(theDS[0]);
    var tableBodyData = getTableBodyData(_.slice(theDS, 1));
    return {
        tableHeaders: tableHeaders,
        tableBodyData: tableBodyData
    }
}

// [
//     [{id: 'class', name: '班级'}, {id: 'A', name: 'A等(0.85)'}...]
// ]
function getTableHeaders(headerDS) {
    return [_.map(headerDS, (v, i) => {
        return (i == 0) ? {id: 'class', name: v} : {id: letterMap[i-1], name: v}
    })]
}

// [
//     {A: 13, B: 14, C: 6, D: 13, class: '初一1班'}
// ]
function getTableBodyData(bodyDS) {
    return _.map(bodyDS, (rowData) => {
        var obj = {};
        _.each(rowData, (v, i) => {
            (i == 0) ? obj['class'] = v : obj[letterMap[i-1]] = v;
        });
        return obj;
    })
}

export default CustomScoreLevel;

//=================================================  分界线  =================================================
function getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName, levelPcentages=[0, 60, 70, 85, 100]) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var result = {}, total = levelPcentages.length -1, matrix;
    var titleHeader = ['班级'];
    _.forEach(_.range(total), index => {
        if (index === 0) {
            titleHeader.push(letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'以上）');
        } else if (index === total-1) {
            titleHeader.push(letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index], 100), 2) +'以下）');
        } else {
            titleHeader.push(header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'-' + _.round(_.divide(levelPcentages[total-index], 100), 2) + '）');
        }
    })
    // var titleHeader = _.map(_.range(total), (index) => {
    //     return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    // });
    // titleHeader.unshift('班级');

    _.each(examPapersInfo, (paperObj, index) => {
        //每一个科目|
        matrix = [];
        matrix.push(titleHeader); //Note: 本来Header是不随着科目改变而改变的（但是有些会，比如header是班级列表的时候，因为不同的科目有可能参加的班级不同，但是这里都是统一的levelPercentages--当然是跟着this.state.levelPcentages）
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[paperObj.id], 'class_name');
        //这应该是当前科目的区分段的count--而不是总分（且一定不包含总分）
        //获取此科目下当前班级学生（不再是所有学生）的成绩
        _.each(paperStudentsGroupByClass, (studentsArr, className) => {
            var temp = makeSegmentsCount(studentsArr, segments);
            temp = _.map(_.reverse(temp), (count) => {
                var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
                return percentage + '%';
            });
            temp.unshift(gradeName+className+'班');
            matrix.push(temp);
        });

        result[paperObj.id] = matrix;
    });

    return result;
}

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}


function getFormatedSubjects(headers) {
    return _.map(_.slice(headers, 1), (headerObj) => {
        return {value: headerObj.subject, totalScore: headerObj.fullMark, fullMark: headerObj.fullMark, id: headerObj.id} //TODO:这个命名有问题，需要改！
    })
}
