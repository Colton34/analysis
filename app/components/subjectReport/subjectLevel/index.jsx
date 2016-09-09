// 学科报告：学科分档上线情况
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function SubjectLevelModule({reportDS, currentSubject}) {
    var levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var classList = _.keys(studentsGroupByClass);
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentSubject.pid];
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var subjectLevelDistribution = makeCurrentSubjectSegmentsDistribution(subjectLevels, reportDS.examPapersInfo.toJS(), reportDS.allStudentsPaperMap.toJS());

    var levelTotalScores = _.reverse(_.map(levels, (obj) => obj.score));
    var currentSubjectLevelScores = _.reverse(_.map(subjectLevels, (sobj) => sobj[currentSubject.pid].mean));
    var currentSubjectLevelInfo = getCurrentSubjectLevelInfo(subjectLevelDistribution, currentSubject.pid);//注意：levelKey小的代表低档次
    var {levelTableHeaders, levelTableData} = getLevelTableRenderData(currentSubjectLevelInfo, subjectLevels, currentSubject);
    var currentSubjectLevelRank = getCurrentSubjectLevelRank(subjectLevelDistribution, currentSubject.pid);//高档次名次在前
    var currentSubjectLevelClassInfo = getCurrentSubjectLevelClassInfo(subjectLevelDistribution, currentSubject.pid, classList);
    var {classInfoTableHeaders, classInfoTableData} = getClassInfoTableRenderData(currentSubjectLevelClassInfo, levels);
    var classInfoSummary = getclassInfoSummary(currentSubjectLevelClassInfo);

    var levelNumString = _.join(_.range(_.size(levels)).map(num => {return numberMap[num + 1]}), '、');
    var levelSize = _.size(levels);
    return (
        <div id="subjectLevel" className={commonClass['section']}>
            <div style={{marginBottom: 10}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科分档上线情况</span>
                <span className={commonClass['title-desc']} style={{ marginTop: 10 }}>通过科学的算法，将总分分档线分解到各学科，得到学科的分数线。</span>
            </div>
            <p>
                本次考试， 校管理者将总分分为{levelNumString}档分档线，分别而设置成{_.join(levelTotalScores.map(num => {return num + '分'}),'、')}。
                通过科学分解，{currentSubject.subject}学科的{levelNumString}档分数线分别是：{_.join(currentSubjectLevelScores.map(num => {return num + '分'}),'、')}。
            </p>

            <TableView tableHeaders={levelTableHeaders} tableData={levelTableData} TableComponent={EnhanceTable}/>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <p>
                    上表可看到{currentSubject.subject}学科{levelNumString}档线，在全年级学生人数的分布。与本次考试其他各学科进行对比，{currentSubject.subject}学科
                    {
                        currentSubjectLevelRank.map((rank, index) => {
                            return <span key={index}>
                                    对全校学生上{numberMap[index + 1]}档线的学生上档人数排第
                                    <span style={{color: colorsMap.B03, margin: '0 5px'}}>{rank}</span>名
                                    {index !== currentSubjectLevelRank.length -1 ? '，' : '。'}
                                </span>
                        })
                    }。多联系本学科的教学实际，做进一步的教学反思，本学科能如何改进教学，才为全年级的高端教学成就提供更大的贡献。
                </p>
            </div>

            <div style={{margin: '30px 0'}}>
                <span className={commonClass['sub-title']}>班级分档上线人数分布</span>
                <span className={commonClass['title-desc']}>对比各班级分档上线的人数分布，了解对本学科而言，各班级对各档线上线人数贡献的大小。</span>
            </div>
            <TableView tableHeaders={classInfoTableHeaders} tableData={classInfoTableData} TableComponent={EnhanceTable}/>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <p>
                    对本学科而言，
                    {
                        _.map(classInfoSummary, (classList, levelNum) => {
                            if (classList.length){
                                return <span key={levelNum}>{numberMap[levelNum - 0 + 1]}档线学生人数<span style={{fontWeight: 'bold', margin: '0 2px'}}>累计</span>较多的班级是<span style={{color: colorsMap.B03}}>{_.join(classList, '、')}</span>{(levelNum - 0 !== levelSize -1 ? '，' : '。')}</span>
                            } else {
                                return numberMap[levelNum - 0 + 1] + '档线学生人数累计较多的班级是: 只有一个班级没有可比性。';
                            }
                        })
                    }
                </p>
            </div>

        </div>
    )
}

/*
{
    <levelKey>: {
        <pid>: {mean: , count: , sumCount: , sumPercentage: }
    }
}
*/
function makeCurrentSubjectSegmentsDistribution(subjectLevels, examPapersInfo, allStudentsPaperMap) {
    //计算各个档次，各个科目在此档次的人数分布--不是累计，后面有累计
    var result = makeCurrentSubjectSegmentCountInfo(subjectLevels, examPapersInfo, allStudentsPaperMap);
    //然后再填充sumCount信息和sumPercentage的信息，得到最终的DS
    fillSubjectSumInfo(result, allStudentsPaperMap);
    return result;
}

function makeCurrentSubjectSegmentCountInfo(subjectLevels, examPapersInfo, allStudentsPaperMap) {
    //过滤，计算相应的人数。Note:由于样本的关系，可能会出现低档次的某科目平均分高于高档次，此种情况把count【暂时】设置为0，待补充算法
    //最低档次线是两边闭合，其他档次都是左开右合
    var result = {};
    _.each(subjectLevels, (subLevObj, levelKey) => {
        var currentLevelSubjectsDisInfo = {};
        _.each(subLevObj, (obj, pid) => {
            var low = obj.mean;
            var high = (subjectLevels[parseInt(levelKey)+1+'']) ? subjectLevels[parseInt(levelKey)+1+''][pid].mean : examPapersInfo[pid].fullMark;
            //TODO:明天！！！这里！
            // debugger;
            // var count = (low >= high) ? 0 : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high))).length) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low < obj.score) && (obj.score <= high))).length));
            var targets = (low >= high) ? [] : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high)))) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low < obj.score) && (obj.score <= high)))));
            // debugger;
            currentLevelSubjectsDisInfo[pid] = {
                mean: obj.mean,
                count: targets.length,
                targets: targets
            }
        });
        result[levelKey] = currentLevelSubjectsDisInfo;
    });
    return result;
}

function fillSubjectSumInfo(originalResult, allStudentsPaperMap) {
    _.each(originalResult, (subjectsInfo, levelKey) => {
        _.each(subjectsInfo, (obj, pid) => {
            obj.sumCount = (levelKey == '0') ? (obj.count) : (originalResult[levelKey-1][pid].sumCount + obj.count);
            obj.sumPercentage = _.round(_.divide(obj.sumCount, allStudentsPaperMap[pid].length), 2);
        });
    });
}

function getCurrentSubjectLevelInfo(subjectLevelDistribution, currentSubjectPid) {
    var result = {};
    _.each(subjectLevelDistribution, (obj, levelKey) => {
        result[levelKey] = _.pick(obj[currentSubjectPid], ['count', 'sumCount', 'sumPercentage']);
    });
    return result;
}

function getLevelTableRenderData(currentSubjectLevelInfo, subjectLevels, currentSubject) {
    var levelSize = _.size(subjectLevels);
    var tableHeaders = [[{name: '科目', id: 'subject', rowSpan: 2}], []];
    var subHeads = [{name:'人数', id: 'count'} , {name: '累计人数', id: 'sumCount'}, {name:'累计上线率', id:'sumPercentage'}];
    _.forEachRight(subjectLevels, (levelInfo, levelNum) => {
        tableHeaders[0].push({name: numberMap[levelSize - levelNum] + '档（' + levelInfo[currentSubject.pid].mean +'分）', colSpan: 3, headerStyle: {textAlign: 'center'}});
        _.forEach(subHeads, subHead => {
            var subHeadObj = {};
            subHeadObj.name = subHead.name;
            subHeadObj.id = subHead.id + '_' + (levelSize - levelNum -1);
            tableHeaders[1].push(subHeadObj);
        })
    })

    var tableData = [];
    var rowData = {subject: currentSubject.subject};
    _.forEach(currentSubjectLevelInfo, (levelInfo, levelNum) => {
        _.forEach(subHeads, (subHead, index) => {
            rowData[subHead.id + '_' + levelNum] = levelInfo[subHead.id];
        })
    })
    tableData.push(rowData);
    return {levelTableHeaders: tableHeaders, levelTableData: tableData};

}

function getClassInfoTableRenderData(currentSubjectLevelClassInfo, levels) {
    var tableHeaders = [[{id: 'level', name: '学科上线人数'}, {id: 'totalSchool', name: '全年级'}]];
    var classList = _.keys(_.omit(currentSubjectLevelClassInfo[0], ['totalSchool']));
    _.forEach(classList, (className) => {
        tableHeaders[0].push({id: className, name: className+'班'});
    })

    var tableData = [];
    _.forEach(currentSubjectLevelClassInfo, (levelInfo, levelNum) => {
        var rowData = {};
        rowData.level = numberMap[levelNum - 0 + 1] + '档上线人数';
        _.forEach(levelInfo, (count, className) => {
           rowData[className] = count;
        })
        tableData.push(rowData);
    })
    return {classInfoTableHeaders: tableHeaders, classInfoTableData: tableData};
}

function getclassInfoSummary(currentSubjectLevelClassInfo) {
    var summaryInfo = {};
    var classSize = _.size(currentSubjectLevelClassInfo[0]) - 1;

    //考虑只有一个班的情况
    if (classSize === 1) {
        _.forEach(_.range(_.size(currentSubjectLevelClassInfo)), num => {
            summaryInfo[num] = [];
        })
        return summaryInfo;
    }
    _.forEach(currentSubjectLevelClassInfo, (levelInfo, levelNum) => {
        var countClassMap = {};
        _.forEach(levelInfo, (count, className) => {
            if (className === 'totalSchool')
                return;
            // 计算累计, 例如二档线要计算一、二档线的总和；
            var countSum = 0;
            _.forEach(_.range(levelNum - 0 + 1), num => {
                countSum += currentSubjectLevelClassInfo[num][className];
            })
            if (countClassMap[countSum]) {
                countClassMap[countSum].push(className + '班');
            } else {
                countClassMap[countSum] = [className + '班'];
            }
        })
        //var countSort = _.sortBy(_.values(_.omit(levelInfo, ['totalSchool'])));
        var countSort = _.sortBy(_.keys(countClassMap).map(countStr => {return parseInt(countStr)}));
        summaryInfo[levelNum] = _.flatten(_.reverse(classSize > 2 ? _.takeRight(countSort, 2) : _.takeRight(countSort, 1)).map(count => { return countClassMap[count]}));
    })
    return summaryInfo;
}

function getCurrentSubjectLevelRank(subjectLevelDistribution, currentSubjectPid) {
    //计算当前学科在各个分档线的排名--使用count，而不是sumCount
    var temp;
    var result = _.map(subjectLevelDistribution, (obj, levelKey) => {
        temp = _.map(obj, (sobj, pid) => {
            return {
                pid: pid,
                count: sobj.count,
                subject: sobj.subject
            }
        });
        temp = _.orderBy(temp, ['count'], ['desc']);
        return (_.findIndex(temp, (obj) => obj.pid == currentSubjectPid) + 1);
    });
    return _.reverse(result);
}

function getCurrentSubjectLevelClassInfo(subjectLevelDistribution, currentSubjectPid, classList) {
    var result = {}, currentSubjectLevelStudentsGroup, temp;
    _.each(subjectLevelDistribution, (obj, levelKey) => {
        temp = {};
        currentSubjectLevelStudentsGroup = _.groupBy(obj[currentSubjectPid].targets, 'class_name');

        temp.totalSchool = obj[currentSubjectPid].targets.length;
        // 按照classList来遍历班级，避免有的有的档次没有某些班；
        _.forEach(classList, className => {
            temp[className] = currentSubjectLevelStudentsGroup[className] ? currentSubjectLevelStudentsGroup[className].length : 0;
        })
        // _.each(currentSubjectLevelStudentsGroup, (cstudents, classKey) => {
        //     temp[classKey] = cstudents.length;
        // });
        result[levelKey] = temp;
    });
    return result;
}
