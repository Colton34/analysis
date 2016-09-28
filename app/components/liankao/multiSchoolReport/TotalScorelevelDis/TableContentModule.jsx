import _ from 'lodash';
import React, { PropTypes } from 'react';

import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import commonClass from '../../../../styles/common.css';
import { NUMBER_MAP as numberMap} from '../../../../lib/constants';
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';
export default function TableContentModule({reportDS, allStudentBySchool, levelStudentsInfoBySchool}) {
    var levels = reportDS.levels.toJS(), allStudentsCount = reportDS.examStudentsInfo.toJS().length;
    var theTableDS = getTableDS(levels, allStudentsCount, levelStudentsInfoBySchool, allStudentBySchool);
    var tableHeader = getTableHeader(levels);
    var tableBodyData = matchTableBodyData(theTableDS,tableHeader);

    return (
            <div  className={commonClass['section']} style={{marginBottom:0,paddingBottom:0}}>
                <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>总分分档上线学生人数分布</span>
                <span className={commonClass['title-desc']}>总分分档上线学生人数分布，可得到联考下各学校在学业综合水平上的分层表现</span>
                </div>
                <div style={{padding:' 30px 0'}}>
                <span>联考全体学生
                {
                    (_.map(levels,(value,key) => {return numberMap[key-0+1];})).join('、')
                }档上线人数分别为
                {
                    _.reverse((_.map(levels,(level) => {return level.count+'人';}))).join('、')
                }，累计上线率分别为：
                {
                    _.reverse((_.map(levels,(level) => {return level.percentage+'%';}))).join('、')
                }。
                </span>
                </div>
                <span style={{display:'block',marginBottom:20}}>各校的上线情况见下表：</span>
                {/*   此处放table    */}
                <TableView tableData={tableBodyData} tableHeaders={tableHeader} TableComponent={EnhanceTable}></TableView>
            </div>
   )
}
/*
levels都是{ 0: , 1: , 2: } -- 保持Map的形式，防止有的level没有值，使用index就窜了
 */
function getTableDS(levels, allStudentsCount, levelStudentsInfoBySchool, allStudentBySchool) {
    var tableDS = [];
    var totalSchoolLevelInfo = {};
    _.each(levels, (levelObj, levelKey) => {
        totalSchoolLevelInfo[levelKey] = levelObj.count;
    });
    var totalSchoolRow = getLevelItem(levels, totalSchoolLevelInfo, allStudentsCount);
    totalSchoolRow.unshift('联考全体');
    tableDS.push(totalSchoolRow);

    _.each(levelStudentsInfoBySchool, (levelSchoolStudentsInfo, schoolName) => {
        var currentSchoolLevelInfo = _.pick(levelSchoolStudentsInfo, _.keys(levels));
        var currentSchoolRow = getLevelItem(levels, currentSchoolLevelInfo, allStudentBySchool[schoolName].length);
        currentSchoolRow.unshift(schoolName);
        tableDS.push(currentSchoolRow);
    });

    return tableDS;
}

function getLevelItem(levels, levelCountInfo, baseCount) {
    //计算sumCount和sumPercentage。注意levels中的percentage即是sumPercentage
    var result = [];
    var levelLastIndex = _.size(levels) - 1;
    _.each(levels, (levelObj, levelKey) => {
        var count = levelCountInfo[(levelLastIndex - levelKey) + ''] || 0;
        var sumCount = _.sum(_.values(_.pickBy(levelCountInfo, (v, k) => k >= (levelLastIndex - levelKey))));
        var sumPercentage = _.round(_.multiply(_.divide(sumCount, baseCount), 100), 2);
        result = _.concat(result, [count, sumCount, sumPercentage]);
    });
    return result;
}

function getTableHeader(levels){
    var lastIndex = _.size(levels)-1;
    var tableHeader = [[],[]];
    tableHeader[0].push({
        id:'school',
        name:'学校',
        rowSpan:2
    });
    _.forEach(_.range(_.size(levels)),function(index){
        tableHeader[0].push({
            name:numberMap[index-0+1]+'档（'+levels[lastIndex-index].score+'分)',
            colSpan:3,
            headerStyle : {textAlign: 'center'}
        })
    });
    _.forEach(_.range(_.size(levels)),function(index){
        tableHeader[1].push({name:'人数',id:'count_'+index});
        tableHeader[1].push({name:'累计人数',id:'sumCount_'+index});
        tableHeader[1].push({name:'累计上线率',id:'sumPercentage_'+index, dataFormat: getPercentageFormat, headerStyle: {minWidth: 115}});
    });

    return tableHeader;
}

function matchTableBodyData(theTableDS,tableHeader){
     var tableBodyData = _.map(_.range(_.size(theTableDS)),function(key){
         var lowData = {};
        _.forEach(tableHeader[1],function(obj,index){
            lowData[obj.id]=theTableDS[key][index-0+1];
            lowData[tableHeader[0][0].id]=theTableDS[key][0];
        });
    return lowData;

    });
    return tableBodyData;
}

function getPercentageFormat(cell) {
    return cell + '%';
}
