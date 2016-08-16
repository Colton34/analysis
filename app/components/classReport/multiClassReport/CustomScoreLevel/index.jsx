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
/**----------------------mock data------------------------------ */
var examPapersInfo = { "103865-25": { "lostClasses": ["1", "2", "3", "4", "5", "6", "7", "8"], "classes": { "9": 41, "10": 57, "11": 55, "12": 56, "13": 53, "14": 51, "15": 55, "16": 48, "17": 57, "18": 34, "19": 31, "20": 58 }, "realClasses": ["9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "subject": "数学", "paper": "574c593a0000052e5bf8ef53", "lostStudentsCount": 83, "realStudentsCount": 596, "id": "103865-25", "fullMark": 150 }, "103863-25": { "lostClasses": ["9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "classes": { "1": 35, "2": 48, "3": 54, "4": 50, "5": 55, "6": 55, "7": 56, "8": 47 }, "realClasses": ["1", "2", "3", "4", "5", "6", "7", "8"], "subject": "数学", "paper": "574c593a0000052e5bf8ef54", "lostStudentsCount": 122, "realStudentsCount": 400, "id": "103863-25", "fullMark": 150 }, "103861-25": { "lostClasses": [], "classes": { "1": 39, "2": 48, "3": 54, "4": 49, "5": 56, "6": 54, "7": 56, "8": 47, "9": 41, "10": 58, "11": 55, "12": 56, "13": 53, "14": 52, "15": 55, "16": 48, "17": 58, "18": 36, "19": 31, "20": 57 }, "realClasses": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "subject": "语文", "paper": "574a29970000052e5bf81a2e", "lostStudentsCount": 198, "realStudentsCount": 1003, "id": "103861-25", "fullMark": 150 }, "103862-25": { "lostClasses": [], "classes": { "1": 35, "2": 47, "3": 54, "4": 48, "5": 55, "6": 55, "7": 56, "8": 47, "9": 41, "10": 57, "11": 55, "12": 55, "13": 52, "14": 48, "15": 53, "16": 48, "17": 56, "18": 31, "19": 26, "20": 54 }, "realClasses": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "subject": "英语", "paper": "574d53800000052e5bf94209", "lostStudentsCount": 228, "realStudentsCount": 973, "id": "103862-25", "fullMark": 150 }, "103864-25": { "lostClasses": ["9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "classes": { "1": 34, "2": 46, "3": 54, "4": 50, "5": 55, "6": 53, "7": 56, "8": 47 }, "realClasses": ["1", "2", "3", "4", "5", "6", "7", "8"], "subject": "文综", "paper": "574c64740000052e5bf8f055", "lostStudentsCount": 127, "realStudentsCount": 395, "id": "103864-25", "fullMark": 300 }, "103866-25": { "lostClasses": ["1", "2", "3", "4", "5", "6", "7", "8"], "classes": { "9": 41, "10": 57, "11": 55, "12": 55, "13": 52, "14": 48, "15": 52, "16": 48, "17": 56, "18": 33, "19": 30, "20": 54 }, "realClasses": ["9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"], "subject": "理综", "paper": "574c54be0000052e5bf8ec53", "lostStudentsCount": 98, "realStudentsCount": 581, "id": "103866-25", "fullMark": 300 } }

var subjects = [{value: '语文'}, {value: '数学'}, {value: '英语'}];

var classes = ['初一1班', '初一2班', '初一3班', '初一4班', '初一5班'];

/**----------------------mock data end------------------------------ */

class CustomScoreLevel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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

    render() {
//         var tableRenderData = composeData(this.state.levelPercentages);
// debugger;


    var examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), headers = this.props.reportDS.headers.toJS(), gradeName = this.props.reportDS.examInfo.toJS().gradeName;
    var theDS = getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName, this.state.levelPercentages);
    var {tableHeaders, tableBodyData} = getFormatedData(theDS);
debugger;

        return (
            <div id='customScoreLevel' className={commonClass['section']} >
                <div style={{ position: 'relative' }}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>自定义成绩等级的人数比例对比</span>
                    <span className={commonClass['title-desc']}></span>

                    <DropdownList list={subjects} style={{position: 'absolute', top: 0, right: 214,zIndex:100}}/>
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

// function composeData(levelPercentages) {
//     var tableHeaders = [[{id: 'class', name: '班级'}]];
//     var levels = levelPercentages.slice(1, levelPercentages.length -1)
//     var levelLen = levels.length;
//     _.forEachRight(_.range(levelLen + 1), num => {
//         var obj = {};
//         var levelLetter = letterMap[levelLen - num];
//         obj.id = levelLetter;
//         obj.name = num ===  0? levelLetter + '等(' + levels[num] / 100+ '以下)' : levelLetter + '等(' + levels[num -1] / 100 + ')';
//         tableHeaders[0].push(obj);
//     })

//     var tableData = [];
//     _.forEach(classes, (className, index) => {
//         var obj = {};
//         obj.class = className;
//         _.forEach(_.range(levelLen + 1), num => {
//             var levelLetter = letterMap[num];
//             obj[levelLetter] = parseInt(Math.random() * 20);

//         })
//         tableData.push(obj);
//     })
//     return {tableHeaders: tableHeaders, tableData: tableData};
// }
export default CustomScoreLevel;

//=================================================  分界线  =================================================
function getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName, levelPcentages=[0, 60, 70, 85, 100]) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var result = {}, total = levelPcentages.length -1, matrix;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('班级');

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

    return matrix;
}

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}
