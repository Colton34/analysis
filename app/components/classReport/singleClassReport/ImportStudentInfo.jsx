//重点学生信息
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../common/EnhanceTable';
import TableView from '../../../common/TableView';

import commonClass from '../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import {downloadTable} from '../../../lib/util';

var headerMapper = {
    id: '学号', name: '姓名', class: '班级', totalScore: '总分', groupRank: '年级排名', classRank: '班级排名', score: '分数'
}

export default class ImportantStudentInfo extends React.Component  {
    constructor(props) {
        super(props);

        var {reportDS} = this.props;
        var {allStudentsPaperMap, examPapersInfo, studentsGroupByClass} = reportDS;
        this.studentRankByClass = getStudentRankByClass(allStudentsPaperMap, studentsGroupByClass);

        _.forEach(examPapersInfo, paperObj => {
            headerMapper[paperObj.id] = paperObj.subject;
        })
        //获取 headSeq
        this.headSeq = ['id', 'name', 'score_totalScore', 'groupRank_totalScore', 'classRank_totalScore'];
        _.forEach(examPapersInfo, paperObj => {
            _.forEach(['score', 'groupRank', 'classRank'], item => {
                this.headSeq.push(item + '_' + paperObj.id)
            })
        })

    }

    onDownloadScoreTable() {
        var {currentClass} = this.props;
        var headSelect = {};
        _.forEach(this.headSeq, head => {
            headSelect[head] = true;
        })
        downloadTable(this.headSeq, headSelect, headerMapper, this.studentRankByClass[currentClass]);
    }

    render() {
        var {classStudents, classHeadersWithTotalScore, classStudentsPaperMap} = this.props;
        var {betterTableDS, worseTableDS} = getDS(classStudents, classStudentsPaperMap, classHeadersWithTotalScore);
        var tableHeaders = [[{ id: 'name', name: '姓名' }]];
        _.each(classHeadersWithTotalScore, (headerObj) => {
            tableHeaders[0].push({ id: headerObj.subject, name: headerObj.subject + '排名' })
        });
        var betterTableData = getTableData(betterTableDS, classHeadersWithTotalScore), worseTableData = getTableData(worseTableDS, classHeadersWithTotalScore);
        return (
            <div id='studentInfo' className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <div style={{ marginBottom: 30 }}>
                    <span className={commonClass['title']}>重点学生信息</span>
                    <span className={commonClass['title-desc']}></span>
                    <span className={commonClass['button']} style={{ width: 160, height: 34, lineHeight: '34px', background: colorsMap.B03, color: '#fff', float: 'right' }}
                          onClick={this.onDownloadScoreTable.bind(this)}>
                        <i className='icon-download-1'></i>
                        下载学生学科得分表
                    </span>
                </div>
                <div style={{ margin: '0 0 30px 0' }}>
                    <span className={commonClass['sub-title']}>班级前五名学生</span>
                    <span className={commonClass['title-desc']}>在总分排序中，名列较前的班级学生，要注意他们各个学科表现是否都比较优秀，对他们的短板学科要格外引起关注</span>
                </div>
                <TableView tableHeaders={tableHeaders} tableData={betterTableData} TableComponent={EnhanceTable}/>
                <div style={{ margin: '50px 0 30px 0' }}>
                    <span className={commonClass['sub-title']}>班级后五名学生</span>
                    <span className={commonClass['title-desc']}>总分排序比较靠后的同学，他们不是所有学科都靠后，他们都有表现相对较好的学科，表明他们有潜力完全可以表现更加优秀，需要多给予他们帮助与鼓励，他们会取得更大的进步</span>
                </div>
                <TableView tableHeaders={tableHeaders} tableData={worseTableData} TableComponent={EnhanceTable}/>
            </div>
        )
    }

}

//=================================================  分界线  =================================================
//算法：
    //排名前5的学生，和排名后5的学生。
    //重点求解此学生 各个科目 在班级中的排名
    //allStudentsPaperMap 排序？ 找到目标学生（根据student id） 得到其这一科目的排名
function getDS(classStudents, classStudentsPaperMap, classHeadersWithTotalScore) {
    var classStudentsCount = classStudents.length;
    var betterStudents = _.reverse(_.takeRight(classStudents, 5)), worseStudents = _.take(classStudents, 5);
    var betterTableDS = getStudentSubjectRankInfo(betterStudents, classStudentsPaperMap, classHeadersWithTotalScore, true, classStudentsCount);
    var worseTableDS = getStudentSubjectRankInfo(worseStudents, classStudentsPaperMap, classHeadersWithTotalScore, false, classStudentsCount);
    return {
        betterTableDS: betterTableDS,
        worseTableDS: worseTableDS
    }
}

function getTableData(tableDS, classHeadersWithTotalScore) {
    return _.map(tableDS, (rowData) => {
        var obj = {};
        _.each(rowData, (d, i) => {
            (i == 0) ? (obj.name = i) : (obj[classHeadersWithTotalScore[i-1].subject] = i);
        });
        return obj;
    });
}

function getStudentSubjectRankInfo(students, classStudentsPaperMap, classHeadersWithTotalScore, isGood, classStudentsCount) {
    //横向扫描，一个学生的维度
    var tableDS = [];
    _.map(students, (studentObj, index) => {
        var rowData = [];
        var totalScoreRank = (isGood) ? (index+1) : (classStudentsCount-index);
        rowData.push(totalScoreRank);
        var subjectScoreRanks = [];
        _.each(classHeadersWithTotalScore, (headerObj, index) => {
            var classPaperStudents = classStudentsPaperMap[headerObj.id];
            if(!classPaperStudents) return;
            var targetIndex = _.findIndex(classPaperStudents, (s) => s.id == studentObj.id);
            var totalCount = classPaperStudents.length;
            subjectScoreRanks.push((totalCount - targetIndex));
        });
        rowData = _.concat(rowData, subjectScoreRanks);
        rowData.unshift(studentObj.name);
        tableDS.push(rowData);
    });
    return (isGood) ? tableDS : _.reverse(tableDS);
}


// function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
//     var result = {};
//     _.each(allStudentsPaperMap, (students, pid) => {
//         var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
//         if(classStudents || classStudents.length > 0) result[pid] = classStudents;
//     });
//     return result;
// }


//=============================  Mock Data ========================================
// var subjects = ['总分', '数学', '语文', '英语', '物理', '化学', '生物', '地理'];
// var students = ['李承鹏', '马怀', '李振', '杨络', '马王', '王春秋'];

// var tableDataHigh = [];
// var tableDataLow = [];

// _.forEach(students, (student, index) => {
//     var obj = {};
//     obj.name = student;
//     _.forEach(subjects, subject => {
//         obj[subject] = parseInt(Math.random() * 10);
//     })
//     tableDataHigh.push(obj);

//     _.forEach(subjects, subject => {
//         obj[subject] = parseInt(Math.random() * 50);
//     })
//     tableDataLow.push(obj);
// })
function getRankCache(allStudentsPaperMap, studentsGroupByClass) {
    var rankCache = {};
    rankCache.totalScore = {};
    _.forEach(studentsGroupByClass, (studentList, className) => {
        rankCache.totalScore[className] = [];
        var students = rankCache.totalScore[className];
        _.forEach(studentList, studentInfo => {
            students.push(_.assign({ class_name: studentInfo.class }, _.omit(studentInfo, ['class', 'papers'])));
        })
    })

    _.forEach(allStudentsPaperMap, (studentList, paperId) => {
        var obj = {};
        obj[paperId] =  _.groupBy(studentList, 'class_name');
        rankCache = _.assign({}, rankCache, obj);
    })

    return rankCache;
}

// 生成所有学生的待显示数据
function generateStudentInfos(rankCache) {
    var studentInfos = {};
    _.forEach(rankCache, (classGroup, scoreType) => {
        var scoreMap = {};
        var allStudents = [];
        _.forEach(classGroup, (studentsArr, className) => {
            var classScoreMap = {};
            var classStudents = [];
            _.forEach(studentsArr, (studentObj, index) => {
                // 记录班级中各个学生的成绩
                if (classScoreMap[studentObj.score] === undefined) {
                    classScoreMap[studentObj.score] = { count: 1 };
                } else {
                    classScoreMap[studentObj.score].count += 1;
                }

                if (scoreMap[studentObj.score] === undefined) {
                    scoreMap[studentObj.score] = { count: 1 };
                } else {
                    scoreMap[studentObj.score].count += 1;
                }

                // 添加学生信息
                allStudents.push({ id: studentObj.id, score: studentObj.score });
                classStudents.push({ id: studentObj.id, score: studentObj.score });

                if (!studentInfos[studentObj.id]) {
                    studentInfos[studentObj.id] = _.pick(studentObj, ['id', 'name', 'class_name']);
                }
                // 学生分数赋值
                studentInfos[studentObj.id]['score_' + scoreType] = studentObj.score;
            })
            //计算班级成绩排名
            var classScoreRank = _.orderBy(_.keys(classScoreMap).map(scoreStr => { return parseFloat(scoreStr) }), [], 'desc');
            // 给班级scoreMap赋值
            _.forEach(classScoreRank, (score, index) => {
                if (index === 0) {
                    classScoreMap[score].rank = 1;
                } else {
                    let preScoreObj = classScoreMap[classScoreRank[index - 1]];
                    classScoreMap[score].rank = preScoreObj.rank + preScoreObj.count;
                }
            })
            // 遍历班级学生，赋予班级排名
            _.forEach(classStudents, studentObj => {
                //把studentinfos对应考号的学生排名附上
                studentInfos[studentObj.id]['classRank_' + scoreType] = classScoreMap[studentObj.score].rank;
            })

        })
        //对所有成绩排序
        var scoreRank = _.orderBy(_.keys(scoreMap).map(scoreStr => { return parseFloat(scoreStr) }), [], 'desc');
        // 遍历scoreRank, 给scoreMap赋值
        _.forEach(scoreRank, (score, index) => {
            if (index === 0) {
                scoreMap[score].rank = 1;
            } else {
                let preScoreObj = scoreMap[scoreRank[index - 1]];
                scoreMap[score].rank = preScoreObj.rank + preScoreObj.count;
            }
        })
        // 遍历所有的学生信息,给学生赋群体排名
        _.forEach(allStudents, studentObj => {
            studentInfos[studentObj.id]['groupRank_' + scoreType] = scoreMap[studentObj.score].rank;
        })
    })
    return studentInfos;
}

function getStudentRankByClass(allStudentsPaperMap, studentsGroupByClass) {
    var rankCache = getRankCache(allStudentsPaperMap, studentsGroupByClass);
    var studentInfos = generateStudentInfos(rankCache);
    var studentRankByClass = _.groupBy(studentInfos, 'class_name');
    return studentRankByClass;
}
