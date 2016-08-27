//总分分档学生人数分布

import _ from 'lodash';
import React from 'react';

import EnhanceTable from '../../../common/EnhanceTable';
import TableView from '../../../common/TableView';

import {makeSegmentsCount} from '../../../api/exam';

import commonClass from '../../../common/common.css';
import singleClassReportStyle from './singleClassReport.css';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';

var FIELDNAMES_ENUM =  {count: '档内人数', 'sumCount': '累计人数', 'sumPercentage': '累计上线率'};

const Card = ({title, desc, style}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 336,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({fontSize: 30, marginTop: 15})}>{title}</p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}

var localStyle = {
    card: {
        display: 'inline-block', width: 336, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    }
}


export default class LevelDistribution extends React.Component {
    constructor(props) {
        super(props);
        var levelSize =
        this.state = {
            mouseEnter: false,
            needScroll: _.size(this.props.reportDS.levels.toJS()) > 3 ? true: false
        }
    }
    onMouseEnter() {
        if (!this.state.needScroll) return ;
        this.setState({
            mouseEnter: true
        })
    }
    onMouseLeave() {
        if (!this.state.needScroll) return ;
        this.setState({
            mouseEnter: false
        })
    }
    render() {
        var {reportDS, currentClass} = this.props;
        var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), levels = reportDS.levels.toJS(), headers = reportDS.headers.toJS();

        var {totalScoreLevelInfoByClass, totalScoreLevelInfoByLevel} = makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels, currentClass);
        var headerDS = getHeaderDS(totalScoreLevelInfoByLevel, currentClass); //{0:3, 1:5, 2:4}
        var tableHeaderDS = getTableHeaderDS(levels);
        var tableBodyDS = getTableBodyDS(totalScoreLevelInfoByClass, currentClass, levels, examInfo.gradeName);

        var levelSize = _.size(levels);
        return (
            <div id='levelDistribution' className={commonClass['section']}>
                <div>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>总分分档学生人数分布</span>
                    <span className={commonClass['title-desc']}>总分分档上线学生人数分布，可得出班级在学业综合水平上的分层表现</span>
                </div>
                <TableView id={'levelDistributionTable'} hover style={{ marginTop: 30 }}
                    tableHeaders={tableHeaderDS} tableData={tableBodyDS} TableComponent={EnhanceTable} reserveRows={6}/>

                <div className={singleClassReportStyle['analysis-conclusion']}>
                    <p>分析诊断：</p>
                    <p style={{ marginBottom: 30 }}>从上表中可以观察到班级各档线的学生上线人数分布情况，及与全年级整体上档情况的比较。对各班级各档上线人数多少进行班级间的排名，下面是班级在{_.join(_.range(levelSize).map(num => { return numberMap[num + 1] }), '、') }档上线人数的年级排名: </p>
                    <div style={_.assign({},{ width: '100%'}, this.state.mouseEnter ? {overflowX: 'scroll'} : {overflow: 'hidden'})} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
                        <div style={{ width: levelSize <= 3 ? '100%' : levelSize * 336 + (levelSize - 1) * 20 }}>
                            {
                                _.range(_.size(headerDS)).map(num => {
                                    return <Card key={num} title={'第' + headerDS[num] + '名'} desc={numberMap[num + 1] + '档上线人数年级排名'} style={num !== levelSize - 1 ? { marginRight: 20 } : {}}/>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}



//=================================================  分界线  =================================================
//1.各个档次本班在全年级的排名
//2.人数，累计人数，累计上线比

/**
 * 获取总分分档的info数据结构（info数据结构是一种具有典型格式的数据结构： {totalSchool: {...}, <className>: {...} } ）每一个key中的value对象中的key就是横向扫描
 * 的属性，个数和顺序都一样！！！这里totalSchool和<className>其实就是列的key，所以info是一个二重的Map，按照需要的matrixTable创建，横向扫描，一重key是列的key，二
 * 重key是行的key。列key没有顺序，行key有顺序。（比如如果是分档，则高档在前，依次排列，如果是科目，则语数外在前，按照subjectWeight排列）
 * @param  {[type]} examInfo             [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} examClassesInfo      [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} levels               [description]
 * @return 这里横向轴是分档所以对象就是分档信息
 *     {
 *         totalSchool: {
 *
 *         },
 *         <className>: {
 *
 *         }
 * }
 */
//resultByClass是totalScoreLevelInfo按照第一级是className（或'totalSchool'这个特殊的class key）作为key，第二级是levelKey，而resultByLevel的第一级是levelKey，第二级是className,
//而且不包含totalSchool这个特殊的key
function makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels, currentClass) {
    var levelSegments = _.map(levels, (levObj) => levObj.score);
    levelSegments.push(examInfo.fullMark);

    var resultByClass = {}, resultByLevel = {};
    var countsGroupByLevel = makeSegmentsCount(examStudentsInfo, levelSegments);
    resultByClass.totalSchool = {};

    _.each(countsGroupByLevel, (count, levelKey) => {
        resultByClass.totalSchool[levelKey] = makeLevelInfoItem(levelKey, countsGroupByLevel, examInfo.realStudentsCount); //TODO:levels中的percentage就是累占比呀！
    });

    _.each(studentsGroupByClass, (studentsFromClass, className) => {
        var classCountsGroupByLevel = makeSegmentsCount(studentsFromClass, levelSegments);
        var temp = {};
        _.each(classCountsGroupByLevel, (count, levelKey) => {
            temp[levelKey] = makeLevelInfoItem(levelKey, classCountsGroupByLevel, examClassesInfo[className].realStudentsCount, className);
            if(!resultByLevel[levelKey]) resultByLevel[levelKey] = [];
            resultByLevel[levelKey].push(temp[levelKey]);
        });
        resultByClass[className] = temp;
    });

    return {totalScoreLevelInfoByClass: resultByClass, totalScoreLevelInfoByLevel: resultByLevel};
}

function makeLevelInfoItem(levelKey, countsGroupByLevel, baseCount, className) {
    var levItem = {};

    levItem.count = countsGroupByLevel[levelKey];
    levItem.sumCount = _.sum(_.map(_.pickBy(countsGroupByLevel, (v, k) => k >= levelKey), (count) => count));
    levItem.sumPercentage = _.round(_.multiply(_.divide(levItem.sumCount, baseCount), 100), 2);
    levItem.class = className;

    return levItem;
}

function getHeaderDS(totalScoreLevelInfoByLevel, currentClass) {
    var result = {}, levelLastIndex = _.size(totalScoreLevelInfoByLevel) - 1;
    _.each(totalScoreLevelInfoByLevel, (infoArr, levelKey) => {
        var temp = _.sortBy(infoArr, 'count');//TODO:确认，是根据“count”而不是"sumCount"的比较！！！
        var targetIndex = _.findIndex(temp, (obj) => obj.class == currentClass);
        if(targetIndex < 0) return;//TODO:应该给Tip Error！-- 这也是需要改进的：清晰明了的错误提示
        result[levelLastIndex - levelKey] = (temp.length - targetIndex);
    });
    return result;
}


function getTableHeaderDS(levels) {
    var levelValues = [], levelFields = [];
    _.each(levels, (levObj, levelKey) => {
        levelValues.push({"colSpan": 3, "name": numberMap[levelKey-0+1]+'档', headerStyle: { textAlign: 'center' } });
        _.each(FIELDNAMES_ENUM, (fieldValue, fieldKey) => {
            levelFields.push(_.assign({},{'id': fieldKey+'_'+levelKey, name: fieldValue}, fieldKey !== 'sumPercentage' ? {} : {dataFormat: percentageDataFormat}));
        });
    });
     levelValues = [{rowSpan: 2, id: 'class', name: '班级'}].concat(levelValues);
    return {levelValues: levelValues, levelFields: levelFields};
}

function getTableBodyDS(totalScoreLevelInfoByClass, currentClass, levels, gradeName) {
    //Note: 直接从这里取需要的数据即可。只需要全校和本班的数据
    //高档次是0
    var totalSchoolInfo = totalScoreLevelInfoByClass.totalSchool, currentClassInfo = totalScoreLevelInfoByClass[currentClass];
    var levelLastIndex = _.size(levels) - 1;

    var tableBodyDS = [], totalSchoolDS = {}, classDS = {};
    _.each(_.range(_.size(levels)), (index) => {
        var tempValue = totalSchoolInfo[levelLastIndex-index];
        _.each(FIELDNAMES_ENUM, (fieldValue, fieldKey) => {
            totalSchoolDS[fieldKey+'_'+index] = tempValue[fieldKey];
        });
    });
    totalSchoolDS['class'] = '全年级上档人数';
    tableBodyDS.push(totalSchoolDS);
    _.each(_.range(_.size(levels)), (index) => {
        var tempValue = currentClassInfo[levelLastIndex-index];
        _.each(FIELDNAMES_ENUM, (fieldValue, fieldKey) => {
            classDS[fieldKey+'_'+index] = tempValue[fieldKey];
        });
    });
    classDS['class'] = '本班上档人数';//gradeName+currentClass+'班';
    tableBodyDS.push(classDS);
    return tableBodyDS;
}

function percentageDataFormat(cellData, rowData) {
    return cellData + '%';
}

//============  Mock Data

// [
//     [
//         { "id": "class", "name": "班级", "rowSpan": 2 },
//         { "colSpan": 3, "name": "一档", headerStyle: { textAlign: 'center' } },
//         { "colSpan": 3, "name": "二档", headerStyle: { textAlign: 'center' } },
//         { "colSpan": 3, "name": "三档", headerStyle: { textAlign: 'center' } }
//     ],
//     [
//         { "id": "count_0", "name": "人数" },
//         { "id": "sumCount_0", "name": "累计人数" },
//         { "id": "sumPercentage_0", "name": "累计上线率" },
//         { "id": "count_1", "name": "人数" },
//         { "id": "sumCount_1", "name": "累计人数" },
//         { "id": "sumPercentage_1", "name": "累计上线率" },
//         { "id": "count_2", "name": "人数" },
//         { "id": "sumCount_2", "name": "累计人数" },
//         { "id": "sumPercentage_2", "name": "累计上线率" }
//     ]
// ]


// "count_0":151,
// "sumCount_0":151,
// "sumPercentage_0":14.97,
//
// "count_1":100,
// "sumCount_1":251,
// "sumPercentage_1":24.88,
// "count_2":355,
// "sumCount_2":606,
// "sumPercentage_2":60.06,
// "class":"全校",
