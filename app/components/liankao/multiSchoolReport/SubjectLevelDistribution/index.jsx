import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
//components
import StudentCountDistribution from './CountDistribution';
import ContributionDistribution from './ContributionDistribution';

export default function ({reportDS}) {
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS(), levels = reportDS.levels.toJS(), subjectLevels=reportDS.subjectLevels.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS();
    var tableHeadersByLevel = getTableHeadersByLevel(headers, levels, subjectLevels);
    var studentsPaperMapByGroup = getStudentsPaperMapByGroup(examStudentsInfo, allStudentsPaperMap);
    var paperSchoolLevelMap = getPaperSchoolLevelMap(studentsPaperMapByGroup, levels, subjectLevels);
    return (
        <div id='subjectLevelDistribution' className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科分档上线情况</span>
                <span className={commonClass['title-desc']}>运用大数据算法将总分的分档分数精确的分解到各学科中，得出各学科的分档分数线及分档上线人数分布，可反映出联考学生在各学科的上线情况。</span>
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
    allStudentsPaperMap.totalScore = examStudentsInfo;
    _.forEach(allStudentsPaperMap, (studentList, paperid) => {
        var group = _.groupBy(studentList, 'school');
        allStudentsPaperMap[paperid] = group;
        allStudentsPaperMap[paperid]['联考全体'] = studentList;
    })
    return allStudentsPaperMap;
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
function getPaperSchoolLevelMap(studentsPaperMapByGroup, levels, subjectLevels) {
    var paperSchoolLevelMap = _.cloneDeep(studentsPaperMapByGroup); 

    var levelSize = _.size(levels);
    _.forEach(paperSchoolLevelMap, (subjectInfo, paperid)  => {
        _.forEach(subjectInfo, (schoolStudents, schoolName) => {
            var studentsByLevel = {};
            var locations = []; // 记录slice时候的end值；
            for (let i = 0; i < levelSize; i++) {
                locations.push(_.sortedIndexBy(schoolStudents, { score: paperid === 'totalScore' ? levels[i].score : subjectLevels[i][paperid].mean}, 'score'));
            }
            for (let i = 0; i < levelSize; i++) {
                if (i !== levelSize - 1) {
                    studentsByLevel[levelSize - i - 1] = schoolStudents.slice(locations[i], locations[i + 1]);
                } else {
                    studentsByLevel[levelSize - i - 1] = schoolStudents.slice(locations[i]);
                }
            }
            paperSchoolLevelMap[paperid][schoolName] = studentsByLevel;
        })
    })
    return paperSchoolLevelMap;
}