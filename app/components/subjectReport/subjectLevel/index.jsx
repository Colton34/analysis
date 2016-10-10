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
    var classInfoSummary = getclassInfoSummary(classInfoTableData);
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
                    上表可看到{currentSubject.subject}学科{levelNumString}档上线人数的分布，与本次考试其他各学科进行对比，{currentSubject.subject}学科
                    {
                        currentSubjectLevelRank.map((rank, index) => {
                            return <span key={index}>
                                    对{numberMap[index + 1]}档上线人数排第
                                    <span style={{color: colorsMap.B03, margin: '0 5px'}}>{rank}</span>名
                                    {index !== currentSubjectLevelRank.length -1 ? '，' : '。'}
                                </span>
                        })
                    }多联系本学科的教学实际，做进一步的教学反思，本学科能如何改进教学，才为全年级的高端教学成就提供更大的贡献。
                </p>
            </div>

            <div style={{margin: '30px 0'}}>
                <span className={commonClass['sub-title']}>班级分档上线人数分布</span>
                <span className={commonClass['title-desc']}>对比各班级分档上线的人数分布，了解对本学科而言，各班级对各档线上线人数贡献的大小。</span>
            </div>
            <TableView tableHeaders={classInfoTableHeaders} tableData={classInfoTableData} TableComponent={EnhanceTable}/>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                {
                    classInfoTableHeaders[0].length>3?(<p>
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
                    </p>):(<p>只有一个学科没有可比性</p>)
                }
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
    //TODO:这里错了！！！
    return fillSubjectSumInfo(result, allStudentsPaperMap);
    // return result;
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
            var targets = (low >= high) ? [] : (levelKey == (_.size(subjectLevels)-1) ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high)))) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score < high)))));
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
    //低档次应该是累计高的
    var tempArr = [];
    _.each(_.reverse(_.values(originalResult)), (subjectsInfo, index) => {
        var sumSubjectsInfo = {};
        _.each(subjectsInfo, (obj, pid) => {
            var sumCount = (index == 0) ? (obj.count) : (tempArr[index-1][pid].sumCount + obj.count);
            var sumPercentage = _.round(_.divide(sumCount, allStudentsPaperMap[pid].length), 2);
            var newSumObj = _.assign({}, obj, {sumCount: sumCount, sumPercentage: sumPercentage});
            sumSubjectsInfo[pid] = newSumObj;
        });
        tempArr.push(sumSubjectsInfo);
    });
    var result = {}, levelLastIndex = tempArr.length - 1;
    _.each(tempArr, (value, index) => {
        result[(levelLastIndex - index) + ''] = value;
    });
    return result;
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
        var currentSubjectLevelObj = currentSubjectLevelInfo[levelSize - levelNum - 1];
        _.forEach(subHeads, (subHead, index) => {
            rowData[subHead.id + '_' + levelNum] = currentSubjectLevelObj[subHead.id];
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

    var tableData = [], levelLastIndex = _.size(levels) - 1;
    _.forEach(currentSubjectLevelClassInfo, (levelInfo, levelNum) => {
        var rowData = {}, currentSubjectLevelClassObj = currentSubjectLevelClassInfo[levelLastIndex - levelNum];
        rowData.level = numberMap[levelNum - 0 + 1] + '档上线人数';
        _.forEach(currentSubjectLevelClassObj, (count, className) => {
           rowData[className] = count;
        })
        tableData.push(rowData);
    })
    return {classInfoTableHeaders: tableHeaders, classInfoTableData: tableData};
}

function getclassInfoSummary(classInfoTableData) {
    //输入：高档次在前的count info
    //输出：高档次在前，levelKey: classList
    // var result = _.cloneDeep(classInfoTableData[0]);//各个班高档次的累计就是自身
    //然后低档次的是累计
    var classSumInfo = {};
    _.each(classInfoTableData, (value, index) => {
        //当前档次
        if(index == 0) {
            classSumInfo[index] = _.cloneDeep(value);
        } else {
            var temp = {};
            _.each(value, (count, className) => {
                var lastSumCount = classSumInfo[index - 1][className] || 0;
                temp[className] = lastSumCount + count;
            });
            classSumInfo[index] = temp;
        }
    });
    //求各个档次的classList
    var result = {};
    _.each(classSumInfo, (value, levelKey) => {
        delete value.level;
        delete value.totalSchool;
        var temp = _.map(value, (sumCount, className) => {
            return {
                sumCount: sumCount,
                className: className
            }
        });
        if(temp.length == 1) return result[levelKey] = [];
        var baseLineCount = temp.length;
        var targetCount = (baseLineCount == 2 || baseLineCount == 3) ? 1 : ((baseLineCount >= 4 && baseLineCount < 7) ? 2 : ((baseLineCount >= 7) ? 3 : 0));
        result[levelKey] = _.map(_.take(_.orderBy(temp, ['sumCount'], ['desc']), targetCount), (obj) => obj.className);
    });
    return result;
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
        });
        result[levelKey] = temp;
    });
    return result;
}
