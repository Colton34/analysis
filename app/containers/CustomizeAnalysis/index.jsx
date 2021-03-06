import React from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link, browserHistory} from 'react-router';
import {Map, List} from 'immutable';

import MainPage from '../../components/customizeAnalysis/MainPage';
import SubjectInput from '../../components/customizeAnalysis/SubjectInput';
import ExamSelect from '../../components/customizeAnalysis/ExamSelect';
import QuestionConfirm from '../../components/customizeAnalysis/QuestionConfirm';
import StudentConfirm from '../../components/customizeAnalysis/StudentConfirm';
import PageHeader from '../../components/customizeAnalysis/Header';
import Footer from '../../components/customizeAnalysis/Footer';

import {initHomeAction} from '../../reducers/home/actions';
import {changeQuesitonNameAction, setGroupMapAction, setPageIndexAction,
    saveCurrentSubjectAction, setAnalysisNameAction, setCreateStatusAction,
    editSubjectAction, delSubjectAction, changeCurrentSubjectNameAction,
    discardCurrentSubjectAction, updateSubjectSqmAction, setCurSubjectSqmAction} from '../../reducers/customAnalysis/actions';
import {initParams} from '../../lib/util';
import {NEXT_PAGE, PREV_PAGE} from '../../lib/constants';
import matrixBase from '../../lib/matrixBase';
import { Modal } from 'react-bootstrap';
var {Header, Title, Body} = Modal;
var uuid = require('node-uuid');

var examPath = "/exam";
var customBaseUrl = examPath + '/custom/analysis';
/**
 * {
 *  timeRange : {startDate : '', endDate : ''},
 *  src : {                 //在合成该科目时的数据源
 *      paperId : {
 *          from : 'sys' or 'upload'
 *          examId : '考试Id(upload类型的可无)'
 *          paperId : '试卷Id(upload类型的可无)'
 *          grade : '年级名称'
 *          examName : '考试名称'
 *          oriSQM : 原始的SQM
 *          SQM : 最终勾选的SQM
 *      }, ...
 *  }
 *  groupMap: 学生按班级分类的map,"确认学生"一步用到
 *  SQM : 合并最终结果
 *  }
 */
class CustomizeAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            generatingAnalysis: false,
            showDialog: false,
            dialogMsg: ''
        }
    }
    componentDidMount() {
        if (this.props.examList.size === 0) {
            var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
            this.props.initHome(params);
        }
    }


    changeCurrentSubjectName(name) {
        this.props.changeCurrentSubjectName(name);
    }

    onBackHomePage() {
        location.href = '/';
    }
    onPrevPage() {
        var {pageIndex} = this.props;
        if (pageIndex === 0) return;
        this.props.setPageIndex(PREV_PAGE);
    }
    onNextPage() {
        var {pageIndex} = this.props;
        if (pageIndex === 3) {
            this.props.saveCurrentSubject();
        } else {
            this.props.setPageIndex(NEXT_PAGE);
        }
    }
    onGenerateAnalysis() {
        if (this.state.generatingAnalysis === true) return;
        if (this.props.analysisName === '') {
            this.setState({
                showDialog: true,
                dialogMsg: '请输入自定义分析名称'
            })
            return;
        }
        if (this.isDuplicateAnalysisName()) {
            this.setState({
                showDialog: true,
                dialogMsg: '已存在相同名称的分析，请修改'
            })
            return;
        }
        this.setState({
            generatingAnalysis: true
        })
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        for (var subjectName in resultSet) {
            var newSQM = this.deleteStudentFromSQM(resultSet[subjectName])
            this.props.updateSubjectSqm(subjectName, newSQM);
        }
        _.each(resultSet, (value, subjectName) => {
            var newSQM = this.deleteStudentFromSQM(resultSet[subjectName]);
            value.newSQM = newSQM;
        });

        // var postData = makeExamSchema(resultSet, this.props.analysisName);
        var postData = makeExamSchema2(resultSet, this.props.analysisName);

        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        params.request.post(customBaseUrl, { data: postData }).then(function (res) {
            //创建成功后进入到此分析的Dashboard
            debugger;
            browserHistory.push('/dashboard?examid=' + res.data.examId+'&grade='+res.data.grade);
        }).catch(function (err) {
            console.log('自定义分析创建失败：', err);
            this.generatingAnalysis = false;
        });
    }

    deleteStudentFromSQM(subject) {
        var result = subject.SQM;
        if (subject.groupMap) {
            var students = this.map2Students(subject.groupMap);
            var xuehaoArray = _.map(students, function (item) {
                return item.kaohao;
            });
            result = matrixBase.getByNames(subject.SQM, 'row', 'kaohao', xuehaoArray);
        }
        return result;
    }
    map2Students(map) {
        var res = [];
        for (var i in map) {
            if (map[i].status == 'inUse') {
                res = res.concat(map[i].array);
            }
        }
        return res;
    }
    onHideDialog() {
        this.setState({
            showDialog: false
        })
    }
    isDuplicateAnalysisName() {
        for (var seq in this.props.examList) {
            for (var examSeq in this.props.examList[seq].values) {
                if (this.props.analysisName === this.props.examList[seq].values[examSeq].examName)
                    return true;
            }
        }
        return false;
    }
    render() {
        var {status, pageIndex} = this.props;
        var examList = (List.isList(this.props.examList)) ? this.props.examList.toJS() : this.props.examList;
        var currentSubject = Map.isMap(this.props.currentSubject) ? this.props.currentSubject.toJS() : this.props.currentSubject;
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        var user = Map.isMap(this.props.user) ? this.props.user.toJS() : this.props.user;

        var customExamList = [];
        examList = filterAuthExamList(examList, user.auth);
        _.each(examList, (obj, index) => {
            customExamList = _.concat(customExamList, obj.values);
        });

        return (
            <div style={{ width: 1000, minHeight: 600, margin: '20px auto', background: '#fff', paddingBottom: 30 }}>
                <PageHeader
                    pageIndex={pageIndex}
                    status={status}
                    onDiscardCurrent={this.props.discardCurrentSubject}
                    onBackHomePage={this.onBackHomePage} />
                {
                    status !== 'create' &&
                    <MainPage
                        resultSet={resultSet}
                        analysisName={this.props.analysisName}
                        setAnalysisName={this.props.setAnalysisName}
                        changeToCreateStatus={this.props.setCreateStatus}
                        onEditSubject={this.props.onEditSubject}
                        onDelSubject={this.props.onDelSubject}
                        onGenerateAnalysis={this.onGenerateAnalysis.bind(this) }
                        isGenerating={this.state.generatingAnalysis}
                        />
                }
                {
                    status === 'create' && pageIndex === 0 &&
                    <SubjectInput
                        onNextPage={this.onNextPage.bind(this) }
                        subjectList={Object.keys(resultSet) }
                        currentSubject={currentSubject}
                        changeCurrentSubjectName={this.changeCurrentSubjectName.bind(this) }
                        pageIndex={pageIndex} />

                }
                {

                    status === 'create' && pageIndex === 1 &&
                    <ExamSelect
                        examList={customExamList}
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        currentSubject={currentSubject}
                        resultSet={resultSet}
                        user={user}
                        />

                }
                {

                    status === 'create' && pageIndex === 2 &&
                    <QuestionConfirm
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        mergedSQM={currentSubject.SQM}
                        changeQuestionName={this.props.changeQuesitonName}/>


                }
                {/* 这里为什么有两个currentSubject？？？  currentSubject={this.props.currentSubject}  */}
                {
                    status === 'create' && pageIndex === 3 &&
                    <StudentConfirm
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        onChangeGroupMap={this.props.setGroupMap}
                        currentSubject={currentSubject}
                        setCurSubjectSqm={this.props.setCurSubjectSqm}
                        user={user}/>
                }
                <InfoDialog content={this.state.dialogMsg} show={this.state.showDialog} onHide={this.onHideDialog.bind(this) } />
            </div>
        )
    }
}

const InfoDialog = ({content, show, onHide}) => {
    return (
        <Modal show={ show } onHide={onHide} bsSize='sm'>
            <Header closeButton={true} style={{ fontWeight: 'bold', textAlign: 'center' }}>提示</Header>
            <Body style={{ textAlign: 'center' }}>
                {content}
            </Body>
        </Modal>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomizeAnalysis);

function mapStateToProps(state) {
    return {
        examList: state.home.examList,
        currentSubject: state.customAnalysis.currentSubject,
        pageIndex: state.customAnalysis.pageIndex,
        resultSet: state.customAnalysis.resultSet,
        analysisName: state.customAnalysis.analysisName,
        status: state.customAnalysis.status,
        user: state.global.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initHome: bindActionCreators(initHomeAction, dispatch),
        changeQuesitonName: bindActionCreators(changeQuesitonNameAction, dispatch),
        setGroupMap: bindActionCreators(setGroupMapAction, dispatch),
        setPageIndex: bindActionCreators(setPageIndexAction, dispatch),
        saveCurrentSubject: bindActionCreators(saveCurrentSubjectAction, dispatch),
        setAnalysisName: bindActionCreators(setAnalysisNameAction, dispatch),
        setCreateStatus: bindActionCreators(setCreateStatusAction, dispatch),
        onEditSubject: bindActionCreators(editSubjectAction, dispatch),
        onDelSubject: bindActionCreators(delSubjectAction, dispatch),
        changeCurrentSubjectName: bindActionCreators(changeCurrentSubjectNameAction, dispatch),
        discardCurrentSubject: bindActionCreators(discardCurrentSubjectAction, dispatch),
        updateSubjectSqm: bindActionCreators(updateSubjectSqmAction, dispatch),
        setCurSubjectSqm: bindActionCreators(setCurSubjectSqmAction, dispatch)
    }
}

function filterAuthExamList(originalExamList, auth) {
    //针对时间戳中的每一个exam实体都进行auth匹配，这里匹配到科目
    //当前能获取到自定义分析的就相当于自己是此自定义分析考试的校领导，所以没有问题。而能创建自定义分析最开始也是有一个年级属性的--但是有个问题，在没有上权限之前一个初二的老师可以创建初三的自定义考试，但是有了权限之后他就看不到了
    if(auth.isSchoolManager) return originalExamList;
    var authGrades = _.keys(auth.gradeAuth);
    var result = [];
    _.each(originalExamList, (obj) => {
        //这个在服务端应该是已经过滤好的
        // var validExams = _.filter(obj.values, (examItem) => {
        //     return _.includes(authGrades, examItem.grade);
        // });
        // if(validExams.length == 0) return;
        //有对应的年级exam实例--则，针对validExams获取科目。你是2班的语文老师，但是2班没有考试语文，3班考试了
        var validExams = obj.values;
        _.each(validExams, (examItem) => {
            var examPapers = examItem.papers;
            if(examItem.from == '40') return;
            //如果是此年级的年级组长--那么可以看到所有科目；或者如果是此年级某n(n>0)班级的班主任，那么也可以看到所有科目，则都不需要对此exam再进行科目过滤
            if((_.isBoolean(auth.gradeAuth[examItem.grade]) && auth.gradeAuth[examItem.grade]) || ((_.isObject(auth.gradeAuth[examItem.grade])) && auth.gradeAuth[examItem.grade].groupManagers.length > 0)) return;
            //否则：
            var authSubjectManagerSubjects = _.map(auth.gradeAuth[examItem.grade].subjectManagers, (obj) => obj.subject);
            var authSubjectTeacherSubjects = _.map(auth.gradeAuth[examItem.grade].subjectTeachers, (obj) => obj.subject);
            var allAuthSubjects = _.union(authSubjectManagerSubjects, authSubjectTeacherSubjects);
            var authValidSubjectObjs = _.filter(examPapers, (paperObj) => {
                return _.includes(allAuthSubjects, paperObj.subject);
            });
            examItem.papers = authValidSubjectObjs;
        });
        //Note: 保证显示的都是有paper内容的
        validExams = _.filter(validExams, (examItem) => examItem.papers.length > 0);
        if(validExams.length > 0) result.push({timeKey: obj.timeKey, values: validExams });
    });
    return result;
}




//设计：在创建分析post数据组件成后端存储的schema的数据

/*
问题：
1. groupMap中的_count是什么？

 */

/*
当前的数据结构：
resultSet: {
    <subjectName>: {
        name: <subjectName>
        SQM: {
            x: [<question>] -- 已经是筛选后的有效题目
            y: [<student>]  -- 已经是筛选后的有效学生。一个学生有一下信息：{_count: , class: , id: , kaohao: , name: , score: } 不清楚_count是什么？
            m: [[], ...]  -- 当前学生此科目下各个小题的得分
        }
        src: 最开始的信息源，没有经过任何过滤的。{<paperObjectId>: {oriSQM: , SQM: , examName: , paperName: , paperId: , from: } , ...}
        groupMap: { <className>: {array: [<student--同上的student object>], count: <此班级的人数，即array.length>, name: <className>, status: 'inUse'(或者为空字符'')}, ...}
    },
    ...
}

最后提交的时候这里面没东西了，只剩下四个key，但是对应的没有value
currentSubject: {
    SQM: ,
    groupMap: ,
    name: ,
    src:
}

*/

function makeExamSchema2(resultSet, analysisName) {
    debugger;
    var papers = _.map(resultSet, (obj, subjectName) => {
        return {
            grade: obj.grade,
            matrix: obj.newSQM,
            paper_name: analysisName + '-' + subjectName,
            subject: subjectName
        }
    });

    return {
        exam_name: analysisName,
        papers: papers
    }
}


function makeExamSchema(resultSet, analysisName) {
    var subjectKeys = _.keys(resultSet);
    var subjectsIdArr = _.map(subjectKeys, (subjectName) => {
        return {
            subject: subjectName,
            id: uuid.v1(),  //如果选择这种方式生成，那么后面如果再创建就不好关联了。
            paper: uuid.v4()
        }
    });

    var examInfo = makeExamInfo(resultSet, analysisName);
    var examStudentsInfo = _.sortBy(makeExamStudentsInfo(resultSet, subjectsIdArr), 'score');
    var examPapersInfo = makeExamPapersInfo(resultSet, subjectsIdArr);
    var examClassesInfo = makeExamClassesInfo(resultSet);
    return {
        "info": examInfo,
        "[studentsInfo]": examStudentsInfo,
        "[papersInfo]": examPapersInfo,
        "[classesInfo]": examClassesInfo,
        isValid: true
    }
}

function makeExamInfo(resultSet, analysisName) {
    /*

        name:  ??
        gradeName: -- 暂时先不填写 -- TODO: 给examInfo添加gradeName
        startTime:  --post存入的时间
        realClasses:
        lostClasses:
        realStudentsCount:
        lostStudentsCount:
        subjects:
        fullMark:

    */
    var subjects = _.keys(resultSet);
    //fullMark=所有科目中所有选中的小题的积分和
    var fullMark = _.sum(_.map(resultSet, (item, subjectName) => {
        var sqmItem = item.newSQM;
        if (!sqmItem) return;
        return _.sum(_.map(sqmItem.x, (questionObj) => questionObj.score));
    }));

    var realClasses = [], realStudentsCount = 0;
    _.each(resultSet, (item, subjectName) => {
        var groupMapItem = item.groupMap;
        if (!groupMapItem) return;
        var selectedClasses = _.map(_.filter(groupMapItem, (obj, className) => obj.status == 'inUse'), (classObj, index) => classObj.name);
        var newAddClasses = _.difference(selectedClasses, realClasses);
        realStudentsCount += _.sum(_.map(newAddClasses, (className) => groupMapItem[className].count));
        realClasses = _.concat(realClasses, newAddClasses);
    });
    var gradeName = resultSet[subjects[0]] ? resultSet[subjects[0]].grade : '';

    return {
        name: analysisName,
        gradeName: gradeName, //暂时先填充个空字符
        startTime: Date.now(), // new Date()
        from: 40,
        realClasses: realClasses,
        lostClasses: [],
        realStudentsCount: realStudentsCount,
        lostStudentsCount: 0,
        subjects: subjects,
        fullMark: fullMark
    };
}

function makeExamStudentsInfo(resultSet, subjectsIdArr) {
    /*

Note: studentsInfo中的papers object数组中的paperid就是paper中id，但是rankcache中却是走的paper中的paper

    examStudentsInfo
    [
        {
            id:
            name:
            class:
            score:
            papers: [
                {paperid: , score: }
            ]
        },
        ...
    ]
    */
    var studentsInfoMap = {};
    _.each(resultSet, (item, subjectName) => {
        var sqmItem = item.newSQM;
        if (!sqmItem) return;
        var questions = sqmItem.x, students = sqmItem.y, matrix = sqmItem.m;
        var studentsPaperScore = _.map(matrix, (questionScoresArr) => _.sum(questionScoresArr));
        //一个科目： {_count: , class: , id: , kaohao: , name: , score: }
        _.each(students, (studentObj, index) => {
            var obj = studentsInfoMap[studentObj.kaohao];
            if (!obj) {
                obj = _.assign(_.pick(studentObj, ['class', 'id', 'kaohao', 'name']), { "[papers]": [], '[questionScores]': [] });
                studentsInfoMap[studentObj.kaohao] = obj;
            }
            var ids = _.find(subjectsIdArr, (obj) => obj.subject == subjectName);
            obj["[papers]"].push({ paperid: ids.id, score: studentsPaperScore[index], class_name: studentObj.class, id: studentObj.id });
            obj['[questionScores]'].push({paperid: ids.id, '[scores]': matrix[index]}); //TODO：因为本身获取的时候就没有给answers，所以后面需要补充上，当前就先不存储answers。
        });
    });
    //给所有的学生添加总分信息
    return _.map(studentsInfoMap, (studentObj, studentId) => {
        var totalScore = _.sum(_.map(studentObj["[papers]"], (paperObj) => paperObj.score));
        return _.assign(studentObj, { score: totalScore });
    });
}

function makeExamPapersInfo(resultSet, subjectsIdArr) {
    //TODO: 在这里给papersInfo中的每一个paper对象添加grade属性。Schema已经修改过了。
    var result = _.map(resultSet, (item, subjectName) => {
        var sqmItem = item.newSQM;
        if (!sqmItem) return;
        var questions = sqmItem.x, students = sqmItem.y, matrix = sqmItem.m;
        var obj = _.find(subjectsIdArr, (sobj) => sobj.subject == subjectName);    //_.pick(item, ['id', 'paper', 'subject']);   //id是pid，paper是ObjectId
        var fullMark = _.sum(_.map(questions, (questionObj) => questionObj.score));
        var realClassesArr = _.filter(item.groupMap, (obj) => obj.status == 'inUse');
        var realClasses = _.map(realClassesArr, (classObj) => classObj.name);
        var realStudentsCount = _.sum(_.map(realClassesArr, (classObj) => classObj.count));
        var classCountArr = _.map(realClassesArr, (classObj) => {
            return { name: classObj.name, count: classObj.count };
        });
        return _.assign(obj, { grade: item.grade, fullMark: fullMark, "[questions]": questions, '[students]': students, matrix: matrix, "[realClasses]": realClasses, "[lostClasses]": [], realStudentsCount: realStudentsCount, lostStudentsCount: 0, "[class]": classCountArr });
    });
    return result;
    /*
    //虽然这里用到的数据结构是Map，但是因为存储的原因，只能存储数组，所以需要转换成数组。
    examPapersInfo
    {
        <pid>: {
            id:
            paper:
            subject:
            fullMark:
            questions:
            realClasses:
            lostClasses:
            realStudentsCount:
            lostStudentsCount:
            class: {
                <className>: <此科目此班级参加考试的人数>
            }
        },
        ...
    }
    */
}

function makeExamClassesInfo(resultSet) {
    /*
    examClassesInfo : 班级的整个exam的参加考试人数没有太大的意义（特别是对于统计计算，因为肯定是走哪个科目的这个班级的参加考试人数--这个在papersInfo的class中有）
    {
        <className>: {
            name:
            students:
            realStudentsCount:
            losstStudentsCount:
        }
    }

    */
    var result = [];
    _.each(resultSet, (item, subjectName) => {
        var groupMapItem = item.groupMap;
        if (!groupMapItem) return;
        var selectedClasses = _.map(_.filter(groupMapItem, (obj, className) => obj.status == 'inUse'), (classObj, index) => classObj.name);
        var newAddClasses = _.map(_.difference(selectedClasses, result), (className) => {
            return {
                name: className,
                "[students]": groupMapItem[className].array,
                realStudentsCount: groupMapItem[className].count,
                lostStudentsCount: 0
            }
        });
        // realStudentsCount += _.sum(_.map(newAddClasses, (className) => groupMapItem[className].count));
        result = _.concat(result, newAddClasses);
    });
    return result;
}
/*
TOOD:
校验：当选择不同年级的paper在同一个分析组里的时候要提醒不可以。


 */

/*
转换步骤：

resultSet中每一个科目：
    对m进行聚合，得到对应y的每一个学生当前科目的成绩。
    遍历y，组成 {<studentId>: {id: , class: , kaohao: , name: , score: <这个是总成绩>, papers: [ {id: , paper: , subject: , fullMark: , questions: , realClasses: , lostClasses: [], realStudentsCount: , lostStudentsCount: 0, class: { <className>: <此科目此班级选中的人数>} }, ... ] } }  //本来对papers进行初始化为空数组。real的东西，可以通过x进行gourpByClass得到。
*/

/*
要转换的数据结构：
examInfo:
{
    name:  ??
    gradeName: -- 暂时先不填写
    startTime:  --post存入的时间
    realClasses:
    lostClasses:
    realStudentsCount:
    lostStudentsCount:
    subjects:
    fullMark:

}

examStudentsInfo
[
    {
        id:
        name:
        class:
        score:
        papers: [
            {paperid: , score: }
        ]
    },
    ...
]

examPapersInfo
{
    <pid>: {
        id:
        paper:
        subject:
        fullMark:
        questions:
        realClasses:
        lostClasses:
        realStudentsCount:
        lostStudentsCount:
        class: {
            <className>: <此科目此班级参加考试的人数>
        }
    },
    ...
}

examClassesInfo : 班级的整个exam的参加考试人数没有太大的意义（特别是对于统计计算，因为肯定是走哪个科目的这个班级的参加考试人数--这个在papersInfo的class中有）
{
    <className>: {
        name:
        students:
        realStudentsCount:
        losstStudentsCount:
    }
}

 */

/*

@Exam : {   // school的下一层级
    name : String,
    create_time : NOW,
    event_time : Time,
    type : Integer,
    schoolid : Integer,
    from : 1,                   // 1: 阅卷1.x, 10: 阅卷2.x, 20: 联考合并, 30: 上传, 40: 分析系统生成

    [papers!id] : {  //这场考试下所有的课次
        id : String,
        name : String,
        grade : String,
        subject : String,
        event_time : Time,
        publish_time : Time,
        paper : PeterId,        // @Paper or @PaperFromUser
        pic : String,           // 大概是原卷
        from : 1,               // 1: 阅卷1.x, 10: 阅卷2.x, 20: 联考合并, 30: 上传, 40: 分析系统生成

        manfen : Integer,
        flushed : FALSE,
        has_yuanti : FALSE,
        +scores : Object    [98, 101, 74...]  -- 注意，自定义分析的总分需要重新计算，而不能使用原始给的score--因为那个是跟着原始exam走的，而不是自定义的题量
    }
}


//可能会添加这两个表--Paper中最主要是之前没有的ansers信息，但是有answers就要有sutdents，然后这个信息要开始的时候给到前端去
@Paper : {  // exam下一层次
    id : String,
    name : String,
    grade : String,
    subject : String,
    create_time : NOW,
    event_time : Time,

    tikuid : Integer,
    paper_pic : String,         // 这是啥？原卷
    answer_pic : String,        // ?
    manfen : Integer,

    +[questions] : {    // 这里的index和matrix、answers对应
        name : String,
        score : Integer,
        answer : String,
        qid : @Question
    },
    +[students!kaohao] : {
        xuehao : String,
        kaohao : String,
        name : String,
        class : String,
        school : String,        // for liankao——以学校为维度，联考已经被拆开了
        score : Integer,
        id : Integer
    },
    +matrix : Object,            // Array of Array of Integer   [[1,2,3,12], [3,6,4,9]]
    +answers : Object,           // Array of Array of String    [[a,b,c,url]]

    // may be not fulfilled
    [ques_knowledge] : {
        [knowledges!id] : {
            id : Integer,
            name : String
        }
    }
}

//最主要保留Question的内容
@Question : {       // can only get from rank-serv
    paperid : String,
    name : String,
    manfen : Integer,
    style : String,

    pic : String,                       // 原题
    answer : String,
    [xb_answer_pic] : String,

    // +results : Object
}

 */



