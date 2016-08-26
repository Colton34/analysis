import _ from 'lodash';
import React from 'react';
import StatisticalLib from 'simple-statistics';

import DropdownList from '../../../../common/DropdownList';
import ExamInspect from './subjectPerformance-ExamInspect';
import QuestionLevel from './subjectPerformance-QuestionLevel';
import QuestionAbility from './subjectPerformance-QuestionAbility';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

const Card = ({title, desc, style, titleStyle}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 560,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({lineHeight: '40px', fontSize: 32, marginTop: 15, width: 560}, localStyle.lengthControl, titleStyle ? titleStyle : {})}
                    title={title}
                    >
                    {title}
                </p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}

class SubjectInspectPerformance extends React.Component {
    constructor(props) {
        super(props);

        var {reportDS, currentClass, classHeaders} = this.props;
        var examPapersInfo = reportDS.examPapersInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
        this.examPapersInfo = examPapersInfo;
        this.theExamInspectDS = getExamInspectDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
        this.questionLevelDS = getQuestionLevelDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
        this.subjects = _.map(classHeaders, (obj) => {
            return {
                key: obj.id,
                value: obj.subject
            }
        });
        this.state = {
            currentSubject: this.subjects[0]
        }
        this.downloadData = getClassScoreTableData(this.state.currentSubject.key, currentClass, this.examPapersInfo, studentsGroupByClass);
    }

    componentWillReceiveProps(nextProps) {
        var {reportDS, currentClass, classHeaders} = nextProps;
        var examPapersInfo = reportDS.examPapersInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
        this.examPapersInfo = examPapersInfo;
        this.theExamInspectDS = getExamInspectDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
        this.questionLevelDS = getQuestionLevelDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
        this.subjects = _.map(classHeaders, (obj) => {
            return {
                key: obj.id,
                value: obj.subject
            }
        });
        this.state = {
            currentSubject: this.subjects[0]
        }
        this.downloadData = getClassScoreTableData(this.state.currentSubject.key, currentClass, this.examPapersInfo, studentsGroupByClass);
    }

    onClickDropdownList(item) {
        this.setState({
            currentSubject: item
        })
    }

    onDownloadClassScoreTable() {
        if (!this.downloadData)
            return;
        var {headerKeys, tableHeaders, tableData} = this.downloadData;
        var url = '/api/v1/file/export/rank/report';
        var inputKeys = "<input type='hidden' name='" + 'keys' + "' value='" + JSON.stringify(headerKeys) + "' />";
        var inputNames = "<input type='hidden' name='" + 'names' + "' value='" + JSON.stringify(tableHeaders) + "' />";
        var inputMatrix = "<input type='hidden' name='" + 'matrix' + "' value='" + JSON.stringify(tableData) + "' />";
        $('<form action="' + url + '" method="' + ('post') + '">' + inputKeys + inputNames + inputMatrix + '</form>')
            .appendTo('body').submit().remove();
    }
    render() {
        var subjects = this.subjects;
        var currentSubject = this.state.currentSubject;
        var questions = this.examPapersInfo[currentSubject.key].questions;
        this.theExamInspectDS[currentSubject.key].questions = questions;
        var {best, worst} = getBestAndWorstQuestions(this.theExamInspectDS[currentSubject.key]);
        var bestQuestionNames = _.map(best, (obj) => obj.name), worstQuestionNames = _.map(worst, (obj) => obj.name);
        var {gradeQuestionLevelGroupMeanRate, classQuestionLevelGroupMeanRate} = this.questionLevelDS[currentSubject.key];

        return (
            <div id='subjectInspectPerformance' className={commonClass['section']}>
                <div style={{ marginBottom: 30 ,position:'relative'}}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>学科考试内在表现</span>
                    <span className={commonClass['title-desc']}>相对于本班的自身水平，学科有表现较好的试题和表现不足的试题</span>

                    <span className={commonClass['button']} style={{width: 132, height: 34, lineHeight: '34px', background: colorsMap.B03, color: '#fff', borderRadius: 3, float:'right', cursor: 'pointer'}}
                           onClick={this.onDownloadClassScoreTable.bind(this)}>
                        <i className='icon-download-1'></i>下载题目得分表
                    </span>
                    <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this)} style={{float: 'right', marginRight: 10,position:'absolute',right:'130px',top:'0px'}} list={subjects} surfaceBtnStyle={{width: 100, height: 34}}/>
                </div>
                <div style={{marginBottom: 30, zIndex: 0}}>
                    <Card title={bestQuestionNames.join(' ')} titleStyle={{color: colorsMap.B04}} desc={'表现较好的题目'} style={{marginRight: 20}}/>
                    <Card title={worstQuestionNames.join(' ')} titleStyle={{color: colorsMap.B08}} desc={'表现较不足的题目'}/>
                </div>
                <div >
                  <span>下图是本次考试，{this.state.currentSubject.value}学科所有试题区分度/难度的表现分布情况，其中通过柱形图重点展示出表现较好和表现不足的部分试题。</span>
                  <ul style={{paddingLeft:15}}>
                    <li style={{paddingLeft:0,marginTop:'5px',fontSize:'14px',color:'#6a6a6a'}}>绿色柱行图表示题目表现较好，该题目本班的得分率高于全年级的平均得分率。图形高度表示高于的大小.</li>
                    <li style={{paddingLeft:0,fontSize:'14px',color:'#6a6a6a'}}>红色柱形图表示题目表现不足，该题目本班的得分率低于全年级的平均得分率。图形高度表示低于的大小.</li>
                  </ul>
                </div>
                <ExamInspect best={best} worst={worst} />
                <div style={{marginTop: 30}}>
                    <QuestionLevel gradeQuestionLevelGroupMeanRate={gradeQuestionLevelGroupMeanRate} classQuestionLevelGroupMeanRate={classQuestionLevelGroupMeanRate} />
                    <QuestionAbility />
                </div>
            </div>
        );
    }
}

export default SubjectInspectPerformance;

var localStyle = {
    card: {
        display: 'inline-block', width: 560, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    },
    lengthControl: {
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
    }
}


//=================================================  ExamInspectPerformance  =================================================
//Note: 题目贡献指数 = 班级此道题目平均得分率 - 全校此道题目平均得分率。指数值为正，是促进作用；为负，是拖后腿。
function getExamInspectDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var result = {}, currentClassStudents = studentsGroupByClass[currentClass];
    var allStudentsPaperQuestionInfo = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });
    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var classQuestionScoreRates = getClassQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass);
        var gradeQuestionScoreRates = getGradeQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
        var questionContriFactors = _.map(classQuestionScoreRates, (x, i) => _.round(_.subtract(x, gradeQuestionScoreRates[i]), 2));
        var gradeQuestionSeparation = getGradeQuestionSeparation(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
        result[pid] = {
            gradeQuestionScoreRates: gradeQuestionScoreRates,
            classQuestionScoreRates: classQuestionScoreRates,
            questionContriFactors: questionContriFactors,
            questionSeparation: gradeQuestionSeparation
        };
    });
    return result;
}

//Warning:所有有关学科的计算都应该是先找到“真正考试了此学科的所有考生”，然后再筛选出“此班级的学生”
function getClassQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var currentClassPaperStudents = _.filter(allStudentsPaperMap[pid], (studentObj) => studentObj['class_name'] == currentClass);
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(currentClassPaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var gradePaperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(gradePaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//firstInput: 某一道题目得分  secondInput: 此道题目所属科目的成绩
function getGradeQuestionSeparation(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var paperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        var questionScores = _.map(paperStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]);
        var paperScores = _.map(paperStudents, (studentObj) => studentObj.score);
        return StatisticalLib.sampleCorrelation(questionScores, paperScores).toFixed(2);
    });
}

function getBestAndWorstQuestions({gradeQuestionScoreRates, classQuestionScoreRates, questionContriFactors, questionSeparation, questions}) {
    var temp = _.map(questions, (obj, i) => {
        return {
            name: obj.name,
            gradeRate: gradeQuestionScoreRates[i],
            classRate: classQuestionScoreRates[i],
            factor: questionContriFactors[i],
            separation: questionSeparation[i]
        }
    });
    temp = _.sortBy(temp, 'factor');
    if(temp.length >= 10) {
        return {
            best: _.takeRight(temp, 5),
            worst: _.take(temp, 5)
        }
    } else {
        var flag = _.ceil(_.divide(temp.length, 2));
        return {
            best: _.takeRight(temp, flag),
            worst: _.take(temp, temp.length-flag)
        }
    }
}

//=================================================  分界线  =================================================
//算法：
//1.计算每一道题目的难度。
//2.按照难度高低排序，分类出5个难度等级
//3.计算班级和年级在这五种难度类型的题目上的平均得分率=（这一类型中所有题目的得分率之和/题目数量）

//问：怎么突出“与同等水平学生相比”？？？
function getQuestionLevelDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var allStudentsPaperQuestionInfo = {}, result = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var gradePaperStudents = allStudentsPaperMap[pid];
        var currentClassPaperStudents = _.filter(gradePaperStudents, (studentObj) => studentObj['class_name'] == currentClass);

        var gradeQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, gradePaperStudents, allStudentsPaperQuestionInfo);
        var classQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, currentClassPaperStudents, allStudentsPaperQuestionInfo);

        var gradeQuestionLevelGroup = getGradeQuestionLevelGroup(paperObj.questions, gradeQuestionScoreRates);//怎么分五组？某一类型题组上的得分率
        result[pid] = getQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, paperObj.questions);
    });
    return result;
}

function getQuestionScoreRate(questions, pid, students, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//怎么分组？？？--（得分率最高-得分率最低）/ 5
function getGradeQuestionLevelGroup(questions, gradeQuestionScoreRates) {
    var temp = _.map(questions, (obj, index) => {
        return {
            name: obj.name,
            score: obj.score,
            gradeRate: gradeQuestionScoreRates[index],
            qid: obj.qid
        }
    });
    temp = _.sortBy(temp, 'gradeRate');

    var segments = getStepSegments(temp);
    // 0.3, 0.4, 0.5, 0.6, 0.7, 0.8
    var gradeQuestionLevelGroup = {};
    _.each(_.range(segments.length-1), (index) => {
        var targets = _.filter(temp, (obj) => (index == 0) ? (segments[index] <= obj.gradeRate && obj.gradeRate <= segments[index+1]) : (segments[index] < obj.gradeRate && obj.gradeRate <= segments[index+1]));
        gradeQuestionLevelGroup[index] = targets;
    });
    return gradeQuestionLevelGroup;
}

function getQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, questions) {
    var classQuestionLevelGroup = getClassQuestionLevelGroup(gradeQuestionLevelGroup, classQuestionScoreRates, questions);
    var classQuestionLevelGroupMeanRate = _.map(classQuestionLevelGroup, (questionRateMap) => _.round(_.mean(_.values(questionRateMap)), 2));
    var gradeQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup, (questionRateArr) => _.round(_.mean(_.map(questionRateArr, (obj) => obj.gradeRate)), 2));
    return {
        gradeQuestionLevelGroupMeanRate: gradeQuestionLevelGroupMeanRate,
        classQuestionLevelGroupMeanRate: classQuestionLevelGroupMeanRate
    }
}

//注意：gradeQuestionLevelGroup是倒序的，最难在最前面
function getClassQuestionLevelGroup(gradeQuestionLevelGroup, classQuestionScoreRates, questions) {
    var classQuestionLevelGroup = {};
    var classQuestionScoreRateMap = {};
    _.each(questions, (obj, index) => classQuestionScoreRateMap[obj.qid] = classQuestionScoreRates[index]);
    _.each(gradeQuestionLevelGroup, (objs, key) => {
        var qids = _.map(objs, (obj) => obj.qid);
        classQuestionLevelGroup[key] = _.pick(classQuestionScoreRateMap, qids);
    });
    return classQuestionLevelGroup;
}

function getStepSegments(gradeRateInfo) {
    var step = _.round(_.divide(_.subtract(_.last(gradeRateInfo).gradeRate, _.first(gradeRateInfo).gradeRate), 5), 2);
    var segments = [];
    segments.push(_.first(gradeRateInfo).gradeRate);
    _.each(_.range(4), (index) => {
        var nextRate = _.round(_.sum([segments[index], step]), 2);
        segments.push(nextRate);
    });
    segments.push(_.last(gradeRateInfo).gradeRate);
    return segments;
}

function getClassScoreTableData(paperId, currentClass, examPapersInfo, studentsGroupByClass) {
    var headerKeys = ['name', 'id'];
    var tableHeaders = ['姓名', '考号'];
    _.forEach(examPapersInfo[paperId].questions, questionInfo => {
        headerKeys.push(questionInfo.qid);
        tableHeaders.push(questionInfo.name);

    })

    var tableData = [];
    _.forEach(studentsGroupByClass[currentClass], studentInfo => {
        _.forEach(studentInfo.questionScores, paperScoreData => {
            if (paperScoreData.paperid === paperId) {
                var tableRow = [studentInfo.name, studentInfo.id];
                _.forEach(paperScoreData.scores, score => {
                    tableRow.push(score);
                })
                tableData.push(tableRow);
            }
        })
    })
    return {headerKeys, tableHeaders, tableData};
}
