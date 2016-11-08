/*
设计：
1、通过添加中间层平滑重构
2、联考校内权限；特定的通用数据结构：联考所有学校全部数据；当前学校数据
    权限：教育局人员（特殊联考学校的校管理员）可以看到联考间总体报告和单个学校导航条，从而查看各个单个学校的报告
         参与联考的普通学校管理员：只能看到当前学校的联考校内分析报告--且没有导航条，且没有联考总体

联考数据结构：
1、newReportDS（通过旧的reportDS转换）
2、获取当前学校的数据


问题：
1.http://fx-engine.yunxiao.com/school?id=25  赣州的联考考试的from值不是20
2.http://fx-engine.yunxiao.com/exam?id=7310-818 这个联考考试下的paper的grade是空
3.规律：有一个联考虚拟学校，此学校的管理员是教育局角色；每一场考试都对应有<examid>-<liankao_schoolid>和<examid>-<schoolid>前者是全部，后者是一个学校的数据

4.怎么从一个普通学校的管理员登录，点击一场自己学校参与的联考的考试examid是<exam1-schoolA>，怎么得到对应的联考的这个考试：exam1这个id不变，但是要获取对应的虚拟学校的id
 */


import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {Map} from 'immutable';

import CommonErrorView from '../common/ErrorView';
import Spinkit from '../common/Spinkit';
import ReportNavHeader from '../common/report/NavHeader';
import ReportTabNav from '../components/liankao/ReportTabNav';
import MultiSchoolReport from '../components/liankao/multiSchoolReport';
import SingleSchoolLianKaoReport from '../components/liankao/singleSchoolReport';
import {initReportDSAction} from '../reducers/reportDS/actions';

import {initParams} from '../lib/util';

import {COLORS_MAP as colorsMap} from '../lib/constants';
import {getQuestionsInfo, newGetSubjectLevelInfo} from '../sdk';

class ContentComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reportType: 'single' //【默认应该是】multi
        }
    }

    changeSchoolReport(item) {
        if(item.type == 'multi') {
            this.setState({
                reportType: item.type
            });
        } else {
            this.setState({
                reportType: item.type,
                currentClass: item.currentClass
            })
        }
    }

    render() {
        var reportDS = this.props.reportDS.toJS();
        var {examInfo, examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, levels, subjectLevels, levelBuffers} = reportDS;
        debugger;
        var propsParams = convertNewReportDS({examInfo, examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, levels, subjectLevels, levelBuffers});
        debugger;
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader examName={examInfo.name} examId={this.props.examid} grade={this.props.grade} reportName={'联考总体分析报告'}/>
                {(this.props.user.auth.isLianKaoManager) ? <ReportTabNav schoolList={examInfo.schools} changeSchoolReport={this.changeSchoolReport.bind(this)} /> : ''}
                {(this.state.reportType == 'multi') ? <MultiSchoolReport user={this.props.user} reportDS={this.props.reportDS} examId={this.props.examid} grade={this.props.grade} /> : <SingleSchoolLianKaoReport {...propsParams} />}
            </div>
        );
    }
}

class LianKaoReport extends React.Component {
    static need = [
        initReportDSAction
    ];

    componentDidMount() {
        if (this.props.reportDS.haveInit || this.props.isLoading) return;
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initReportDS(params);
    }

    render() {
        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
        if (!examid || !grade) return;
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : ((this.props.isLoading || !this.props.reportDS.haveInit) ? <Spinkit /> : (
                    <ContentComponent examid={examid} grade={grade} reportDS={this.props.reportDS} user={this.props.user.toJS()} />
                ))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LianKaoReport);

function mapStateToProps(state) {
    return {
        isLoading: state.global.isLoading,
        ifError: state.global.ifError,
        user: state.global.user,
        reportDS: state.reportDS
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initReportDS : bindActionCreators(initReportDSAction, dispatch),
    }
}


/*
examInfo: {
    id:
    objectId: 【暂缺】
    name:
    fullMark:
    [from]:<可选>
    gradeName://原来有些可能是grade
    eventTime://原来是startTime
    [schools]: {id: , name: } [只有联考才有]
    papers: [//原来是subjects。这里数组的顺序和papersInfo的数组顺序一致--都是根据subjectWeight来排序的
        {id: , objectId: , name: , subject: , fullMark: , questions: },
        ...
    ],
    [classes]: ['classOne', ...] 【只有普通考试才有--联考，走班都没有】
}

examStudentsInfo: [
    {
        id:
        name:
        school:
        class: {name: , rank: }
        score:
        rank:
    }
]


 */

function convertNewReportDS({examInfo, examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, levelBuffers, levels, subjectLevels}) {
    var {paperObjectIdMap, papersFullMark} = getPaperObjectIdMap(examPapersInfo);
    var sutdentsQuestionInfo = getStudentQuestionsInfo(examStudentsInfo);
    var newExamInfo = makeExamInfo(examInfo, examPapersInfo, headers);
    var newExamStudentsInfo = makeExamStudentsInfo(examStudentsInfo);
    var newPaperStudentsInfo = makePaperStudentsInfo(allStudentsPaperMap, sutdentsQuestionInfo, paperObjectIdMap);
    var newPaperQuestionsInfo = makePaperQuestionsInfo(examPapersInfo, allStudentsPaperMap, paperObjectIdMap);
    var {newLevels, newSubjectLevels} = makeLevelsInfo(levels, subjectLevels, allStudentsPaperMap, papersFullMark);
    newExamInfo.schools = _.keys(_.groupBy(examStudentsInfo, 'school'));
    return {
        examInfo: newExamInfo,
        examStudentsInfo: newExamStudentsInfo,
        paperStudentsInfo: newPaperStudentsInfo,
        paperQuestionsInfo: newPaperQuestionsInfo,
        levels: newLevels,
        subjectLevels: newSubjectLevels,
        levelBuffers: levelBuffers
    }
    //设置为null？还是delete -- 采用mark的方式确定可被垃圾回收
}

function makeExamInfo(examInfo, examPapersInfo, headers) {
    var result = _.pick(examInfo, ['id', 'name', 'gradeName', 'fullMark']);
    result.objectId = examInfo._id;
    result.eventTime = result['event_time'];
    var paperObj, temp;
    //注意这里的id都是pid而不是objectId
    result.papers = _.map(_.slice(headers, 1), (headerObj) => {
        paperObj = examPapersInfo[headerObj.id];
        temp = _.pick(paperObj, ['id', 'subject', 'fullMark', 'questions']);
        temp.objectId = paperObj.paper;
        //TODO:缺少paper.name
        return temp;
    });
    return result;
}

function makeExamStudentsInfo(examStudentsInfo) {
    return _.map(examStudentsInfo, (studentObj) => _.pick(studentObj, ['id', 'name', 'school', 'score', 'rank']));
}

/*
paperStudentsInfo: {
    <objectId>: {
        <className>: [
            id:
            score:
            gradeRank:
            classRank:
            questionScores:
            questionAnswers:
        ]
    }
}

注意：这里面有一个【rank】--它是开始的时候allPaperStudentsMap添加进入的--即是此学生在此科目的总体排名，就暂时用这个field key，如果群体不是所有学校而是一个学校那么就作为schoolRank，再下面可能还有classRank，缺少questionScores和questionAnswers

 */

function makePaperStudentsInfo(allStudentsPaperMap, sutdentsQuestionInfo, paperObjectIdMap) {
    var paperStudentsInfo = {};
    var paperSchoolStudentsGroup, paperSchoolClassStudentsGroup
    //注意：allStudentsPaperMap的key是paperid而不是paperObjectId
    _.each(allStudentsPaperMap, (paperStudents, paperid) => {
        paperStudentsInfo[paperObjectIdMap[paperid]] = {};
        paperSchoolStudentsGroup = _.groupBy(paperStudents, 'school');
        _.each(paperSchoolStudentsGroup, (paperSchoolStudents, schoolName) => {
            paperSchoolClassStudentsGroup = _.groupBy(paperSchoolStudents, 'class_name');
            _.each(paperSchoolClassStudentsGroup, (paperSchoolClassStudents, className) => {
                _.each(paperSchoolClassStudents, (studentObj) => {
                    //TODO:这里没有健壮性判断
                    studentObj.questionScores = sutdentsQuestionInfo[studentObj.id][paperid].scores;
                    studentObj.questionAnswers = sutdentsQuestionInfo[studentObj.id][paperid].answers;
                });
            });
            paperStudentsInfo[paperObjectIdMap[paperid]][schoolName] = paperSchoolClassStudentsGroup;
        });
        //TODO:这里需要将paperid更换为paperObjectId
    });
    return paperStudentsInfo;
}

function getStudentQuestionsInfo(examStudentsInfo) {
    var result = {}, temp;
    _.each(_.keyBy(examStudentsInfo, 'id'), (studentObj, studentId) => result[studentId] = _.keyBy(studentObj.questionScores, 'paperid'));
    return result;
}

/*

paperQuestionsInfo: {
    <objectId>: [
        {
            grade: {
                scores:
                mean:
                rate:
                separation:
            },
            <className>: {
                scores:
                mean:
                rate:
            },
            ...
        },
        ...
    ],
    ...
}

 */

function makePaperQuestionsInfo(examPapersInfo, allStudentsPaperMap, paperObjectIdMap) {
    var result = {}, paperStudetns, allStudentsQuestionsInfo, schoolStudentsQuestionsInfo, obj;
    _.each(examPapersInfo, (paperObj) => {
        allStudentsQuestionsInfo = getQuestionsInfo(allStudentsPaperMap[paperObj.id], paperObj.questions, true);
        schoolStudentsQuestionsInfo = {};
        _.each(_.groupBy(allStudentsPaperMap[paperObj.id], 'school'), (paperSchoolStudents, schoolName) => {
            schoolStudentsQuestionsInfo[schoolName] = getQuestionsInfo(paperSchoolStudents, paperObj.questions);
        });
        //TODO:这里修改为paperObjectId
        result[paperObjectIdMap[paperObj.id]] = _.map(paperObj.questions, (questionObj, index) => {
            obj = { paper: allStudentsQuestionsInfo[index] };
            _.each(schoolStudentsQuestionsInfo, (schoolPaperQuestionsInfoArr, schoolName) => {
                obj[schoolName] = schoolPaperQuestionsInfoArr[index];
            });
            return obj;
        });
    });
    return result;
}

function getPaperObjectIdMap(examPapersInfo) {
    var paperObjectIdMap = {}, papersFullMark = {};
    _.each(examPapersInfo, (paperObj, pid) => {paperObjectIdMap[pid] = paperObj.paper, papersFullMark[pid] = paperObj.fullMark});
    return {paperObjectIdMap, papersFullMark};
}

//TODO: 1.转换成数组，从高档到低档  2.为sublectLevels补充需要的sum数据已经targets
function makeLevelsInfo(levels, subjectLevels, allStudentsPaperMap, papersFullMark) {
    var levelLastIndex = _.size(levels) - 1;
    var levelsArr = [], subjectLevelsArr = [];
    _.each(_.range(_.size(levels)), (i) => {
        levelsArr.push(levels[(levelLastIndex-i)+'']);
        subjectLevelsArr.push(subjectLevels[(levelLastIndex-i)+'']);
    });
    var subjectLevelsInfo = newGetSubjectLevelInfo(subjectLevelsArr, allStudentsPaperMap, papersFullMark);
    return {
        newLevels: levelsArr,
        newSubjectLevels: subjectLevelsInfo
    }
}


