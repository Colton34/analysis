import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
//components
import StudentCountDistribution from './CountDistribution';
import ContributionDistribution from './ContributionDistribution';

import {getLevelInfo, getSubjectLevelInfo} from '../../../../sdk';

export default function ({reportDS}) {
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS(), levels = reportDS.levels.toJS(), subjectLevels=reportDS.subjectLevels.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), examFullMark = reportDS.examInfo.toJS().fullMark;
    var papersFullMark = {};
    _.each(examPapersInfo, (obj, pid) => papersFullMark[pid] = obj.fullMark);
    var tableHeadersByLevel = getTableHeadersByLevel(headers, levels, subjectLevels);
    var studentsPaperMapByGroup = getStudentsPaperMapByGroup(examStudentsInfo, allStudentsPaperMap);
    var paperSchoolLevelMap = getPaperSchoolLevelMap(examStudentsInfo, examFullMark, allStudentsPaperMap, levels, subjectLevels, papersFullMark);
    return (
        <div id='subjectLevelDistribution' className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科分档上线情况</span>
                <span className={commonClass['title-desc']}>运用大数据算法将总分的分档分数精确的分解到各学科中，得出各学科的分档分数线。各学科分档上线人数分布，可反映出联考学生在各学科的上线情况。</span>
            </div>
            <StudentCountDistribution reportDS={reportDS} tableHeadersByLevel={tableHeadersByLevel}  paperSchoolLevelMap={paperSchoolLevelMap}/>
            <ContributionDistribution reportDS={reportDS } tableHeadersByLevel={tableHeadersByLevel} studentsPaperMapByGroup ={studentsPaperMapByGroup} paperSchoolLevelMap={paperSchoolLevelMap}/>
        </div>
    )
}
/**
 * 获取tableHeaders数据
 * @params: 均来自reportDS；
 * @return: Object, 其中：key为分档档次，value为相对应的tableHeaders。 注意： 0为一档，1为二挡，以此类推。
 */
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
                if(!levels[levelSize - levelNum - 1]) {
                    debugger;
                }
                header.name = headerInfo.subject + '(' + levels[levelSize - levelNum - 1].score +')';
            } else {
                header.name = headerInfo.subject + '(' + subjectLevels[levelSize - levelNum - 1][headerInfo.id].mean + ')';
            }
            tableHeaders[0].push(header);
        })
    })
    return tableHeadersByLevel;
}


/**
 * @params: 均来自reportDS;
 * @return:
 * {
 *      totalScore: {
 *          '联考全体': [{...}, {...}, ...], //学生obj列表
 *          'xx学校'： [],
 *          ...
 *      },
 *      paperid1: {
 *         '联考全体': [], //学生obj列表
 *          'xx学校'： [],
 *          ...
 *      },
 *      ...
 * }
 */
function getStudentsPaperMapByGroup(examStudentsInfo, allStudentsPaperMap) {
    var result = {};
    result.totalScore = _.groupBy(examStudentsInfo, 'school');
    result.totalScore['联考全体'] = examStudentsInfo;
    _.each(allStudentsPaperMap, (studentList, paperId) => {
        var group = _.groupBy(studentList, 'school');
        result[paperId] = group;
        result[paperId]['联考全体'] = studentList;
    });
    return result;
}


/**
 * @param: studentsPaperMapByGroup: 由父组件传递的结构；
 * @return:
 * {
 *      totalScore: {
 *          '联考全体': {
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          'xx学校'：{
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          ...
 *      },
 *      paperid1: {
 *          '联考全体': {
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          'xx学校'：{
 *              0: [], //第一档（高分档）的学生列表；
 *              1: [],
 *              ...
 *           }
 *          ...
 *      },
 *      ...
 * }
 */

function getPaperSchoolLevelMap(examStudentsInfo, examFullMark, allStudentsPaperMap, levels, subjectLevels, papersFullMark) {
//总体（全体学校）学生  base
//各个学校学生  base
    var studentsGroupBySchool = _.groupBy(examStudentsInfo, 'school');
    var result = {};
    result.totalScore = {};
    _.each(_.keys(papersFullMark), (pid) => result[pid] = {});

    var allSchoolLevelInfo = getLevelInfo(levels, examStudentsInfo, examFullMark);
    var allSchoolSubjectLevelInfo = getSubjectLevelInfo(subjectLevels, allStudentsPaperMap, papersFullMark);

//各个学校（包括全体）
    //各个层级
    var temp;
    _.each(result, (obj, tpid) => {
        temp = {};
        if(tpid == 'totalScore') {
            _.each(allSchoolLevelInfo, (levelInfoObj, levelKey) => {
                temp[levelKey] = levelInfoObj.targets;
            });
        } else {
            _.each(allSchoolSubjectLevelInfo, (subjectLevelInfoObj, levelKey) => {
                temp[levelKey] = subjectLevelInfoObj[tpid].targets;
            });
        }
        obj['联考全体'] = temp;
    });
    var singleSchoolLevelInfoMap = {}, singleSchoolSubjectLevelInfoMap = {}, currentSchoolStudentsPaperMap, currentSchoolLevelInfo, currentSchoolSubjectLevelInfo;
    _.each(studentsGroupBySchool, (singleSchoolStudents, schoolName) => {
        currentSchoolStudentsPaperMap = _.groupBy(_.concat(..._.map(singleSchoolStudents, (student) => student.papers)), 'paperid');;
        currentSchoolLevelInfo = getLevelInfo(levels, singleSchoolStudents, examFullMark);
        currentSchoolSubjectLevelInfo = getSubjectLevelInfo(subjectLevels, currentSchoolStudentsPaperMap, papersFullMark);

        _.each(result, (obj, tpid) => {
            if(tpid == 'totalScore') {
                temp = {};
                _.each(currentSchoolLevelInfo, (sobj, levelKey) => temp[levelKey] = sobj.targets);
                obj[schoolName] = temp;
            } else {
                temp = {};
                _.each(currentSchoolSubjectLevelInfo, (subjectLevelInfoObj, levelKey) => {
                    temp[levelKey] = subjectLevelInfoObj[tpid].targets;
                });
                obj[schoolName] = temp;
            }
        });
    });
    return result;
}
