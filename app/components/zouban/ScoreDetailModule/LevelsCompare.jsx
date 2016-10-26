import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import {Button} from 'react-bootstrap';
import DropdownList from '../../../common/DropdownList';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';

import {makeSegmentsDistribution} from '../../../sdk';
import {downloadData} from '../../../lib/util';

import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap, LETTER_MAP as letterMap, LETTER_TITLE_MAP as letterTitleMap} from '../../../lib/constants';

class LevelsCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLesson: this.props.zoubanExamInfo.lessons[0],
            segmentPercentages: [0, 0.6, 0.7, 0.85, 1]
        }
    }

    selectedLesson(selectedLesson) {
        this.setState({
            currentLesson: selectedLesson,
            segmentPercentages: [0, 0.6, 0.7, 0.85, 1]
        });
    }

    clickDownloadTable(levelHeaderTitles, levelHeaderPercentages, tableBody) {
        var downloadFields = _.concat(_.map(levelHeaderTitles, (obj) => obj.name), _.map(levelHeaderPercentages, (obj, index) => (letterMap[parseInt(index/2)] + obj.name)));
        var downloadKeys = _.concat(_.map(levelHeaderTitles, (obj) => obj.id), _.map(levelHeaderPercentages, (obj) => obj.id));
        var downloadTableData = _.map(tableBody, (obj) => _.map(downloadKeys, (fieldKey) => obj[fieldKey]));
        downloadData(downloadFields, downloadFields, downloadTableData, '各班学科等级对比');
    }

    render(){
        var currentLessonClasses = _.keys(this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId]);
        var currentLessonLevelDis = getCurrentLessonSegmentDistributon(this.state.currentLesson.fullMark, this.state.segmentPercentages, currentLessonClasses, this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId]);
        var {tableHeader, levelHeaderTitles, levelHeaderPercentages} = getTableHeader(this.state.segmentPercentages);
        var tableBody = getTableBody(currentLessonLevelDis, levelHeaderTitles, levelHeaderPercentages);
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>各班学科等级对比</span>
                <span className={commonClass['title-desc']}></span>
                <div>
                    <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                        <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                            <span style={{ marginRight: 10}}>学科：</span>
                                {_.map(this.props.zoubanExamInfo.lessons, (lessonObj, index) => {
                                    return (
                                        <a key={'papers-' + index} onClick={this.selectedLesson.bind(this, lessonObj)} style={lessonObj.objectId == this.state.currentLesson.objectId?localStyle.activeSubject: localStyle.subject}>{lessonObj.name}</a>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <Button onClick={this.clickDownloadTable.bind(this, levelHeaderTitles, levelHeaderPercentages, tableBody)} style={{ margin: '0 2px', backgroundColor: '#2eabeb', color: '#fff', border: 0,float:'right'}}>下载表格</Button>
                <div style={{marginTop:30}}>
                    <TableView tableHeaders={tableHeader} tableData={tableBody} TableComponent={EnhanceTable}></TableView>
                </div>
            </div>
        )
    }
}

export default LevelsCompare;

function getCurrentLessonSegmentDistributon(currentLessonFullMark, segmentPercentages, classes, currentLessonStudentsInfo) {
    var result = {};
    var segments = _.map(segmentPercentages, (percentage) => _.round(_.multiply(percentage, currentLessonFullMark), 2));
    var gradeLessonStudents = _.union(..._.values(currentLessonStudentsInfo));
    var gradeLevelItem = getLevelCompareInfoItem(segments, gradeLessonStudents, '全部考生');
    result.lesson = gradeLevelItem;
    _.each(classes, (className) => {
        result[className] = getLevelCompareInfoItem(segments, currentLessonStudentsInfo[className], className);
    });
    return result;
}

function getLevelCompareInfoItem(segments, students, key) {
    var count = students.length;
    var mean = _.round(_.mean(_.map(students, (studentObj) => studentObj.score)), 2);
    var segmentDis = makeSegmentsDistribution(segments, students);
    //四个等级，但是是从低到高
    var infos = _.reverse(_.map(segmentDis, (obj) => {
        return {
            count: obj.count,
            percentage: (_.round(_.multiply(_.divide(obj.count, count), 100), 2)) + '%'
        }
    }));
    return {
        key: key,
        count: count,
        mean: mean,
        infos: infos
    }
}


var localStyle = {
    subject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px',padding:'0px 10px'
    },

}

function getTableHeader(segmentPercentages) {
    var headerKeys = [
            {id:'key', name:'班级',rowSpan:2},
            {id:'count', name:'参考人数',rowSpan:2},
            {id:'mean', name:'平均分',rowSpan:2}
        ]
    var header = [
        headerKeys
    ];
    var {levelHeaderTitles, levelHeaderPercentages} = getLevelHeader(segmentPercentages);
    header[0] = _.concat(header[0], levelHeaderTitles);
    header[1] = levelHeaderPercentages;
    return {
        tableHeader: header,
        levelHeaderTitles: headerKeys,
        levelHeaderPercentages: levelHeaderPercentages
    };
}

function getLevelHeader(segmentPercentages) {
    var levelHeaderTitles = [], levelHeaderPercentages = [], lastIndex = _.size(segmentPercentages)-2;
    _.each(_.range(_.size(segmentPercentages)-1), (index) => {
        levelHeaderTitles.push({name: `${letterMap[index]}等（${letterTitleMap[index]}，得分率${(index == 0) ? (segmentPercentages[lastIndex-index]+'以上') : ((index == lastIndex) ? (segmentPercentages[lastIndex-index]+'以下') : (segmentPercentages[lastIndex-index]+'-'+segmentPercentages[lastIndex-index+1])) })`, colSpan:2});
        levelHeaderPercentages.push({id: 'number'+index, 'name': '人数'}, {id: 'percentage'+index, name: '占比'});
    });
    return {
        levelHeaderTitles: levelHeaderTitles,
        levelHeaderPercentages: levelHeaderPercentages
    }
}

function getTableBody(currentLessonLevelDis, levelHeaderTitles, levelHeaderPercentages) {
    var result = [];
    result.push(getTableRowItem(currentLessonLevelDis.lesson, levelHeaderTitles, levelHeaderPercentages));
    _.each(currentLessonLevelDis, (obj, key) => {
        if(key == 'lesson') return;
        result.push(getTableRowItem(currentLessonLevelDis[key], levelHeaderTitles, levelHeaderPercentages));
    });
    return result;
}

function getTableRowItem(levelDisInfo, levelHeaderTitles, levelHeaderPercentages) {
    var item = {};
    _.each(levelHeaderTitles, (obj) => {
        item[obj.id] = levelDisInfo[obj.id]
    });
    var countsArr = [], percentagesArr = [];
    _.each(levelDisInfo.infos, (infoObj, index) => {
        item[levelHeaderPercentages[index * 2].id] = infoObj.count;
        item[levelHeaderPercentages[index*2+1].id] = infoObj.percentage;
    });
    return item;
}

//==================================== Mock Scheam ====================================
var tableHeaders = [
    [
        {id:'key', name:'班级',rowSpan:2},
        {id:'count', name:'参考人数',rowSpan:2},
        {id:'mean', name:'平均分',rowSpan:2},
        {name:'A等，优秀 得分率0.85以上',colSpan:2} ,
        {name:'B等 良好 得分率0.7-0.85',colSpan:2} ,
        {name:'C等，及格 得分率0.6-0.7',colSpan:2} ,
        {name:'D等，不及格 得分率0.6以下',colSpan:2} ,
    ],
    [
        {id:'number0',name:'人数'},{id:'percentage0',name:'占比'},
        {id:'number1',name:'人数'},{id:'percentage1',name:'占比'},
        {id:'number2',name:'人数'},{id:'percentage2',name:'占比'},
        {id:'number3',name:'人数'},{id:'percentage3',name:'占比'},
    ]
];
var tableData = [
    {
        key:'10_魏旭',
        count:50,
        mean:60,
        number0:30,
        percentage0:'30%',
        number1:30,
        percentage1:'30%',
        number2:30,
        percentage2:'30%',
        number3:30,
        percentage3:'30%'

    },
    {
        key:'10_魏旭',
        count:50,
        mean:60,
        number0:30,
        percentage0:'30%',
        number1:30,
        percentage1:'30%',
        number2:30,
        percentage2:'30%',
        number3:30,
        percentage3:'30%'

    }
];
 var classes = ['语文','数学','英语'];
