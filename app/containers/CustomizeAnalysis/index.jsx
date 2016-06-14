import React from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link, browserHistory} from 'react-router';
import {Map,List} from 'immutable';

import MainPage from '../../components/customizeAnalysis/MainPage';
import SubjectInput from '../../components/customizeAnalysis/SubjectInput';
import ExamSelect from '../../components/customizeAnalysis/ExamSelect';
import QuestionConfirm from '../../components/customizeAnalysis/QuestionConfirm';
import StudentConfirm from '../../components/customizeAnalysis/StudentConfirm';
import Header from '../../components/customizeAnalysis/Header';
import Footer from '../../components/customizeAnalysis/Footer';

import {initHomeAction} from '../../reducers/home/actions';
import {changeQuesitonNameAction, setGroupMapAction, setPageIndexAction,
        saveCurrentSubjectAction, setAnalysisNameAction, setCreateStatusAction,
        editSubjectAction, delSubjectAction, changeCurrentSubjectNameAction,
        discardCurrentSubjectAction, updateSubjectSqmAction} from '../../reducers/customAnalysis/actions';
import {initParams} from '../../lib/util';
import {NEXT_PAGE,PREV_PAGE} from '../../lib/constants';
import matrixBase from '../../lib/matrixBase';
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
    }
    componentDidMount(){
        // var existsExamList = (List.isList(this.props.examList)) ? this.props.examList.toJS() : this.props.examList
        if(this.props.examList.size === 0) {
            console.log('============ should init home');
            var params = initParams(this.props.params, this.props.location, {'request': window.request});
            this.props.initHome(params);
        }
    }


    changeCurrentSubjectName(name) {
        console.log('======== subject name: ' + name);
        this.props.changeCurrentSubjectName(name);

    }

    onBackHomePage() {
        location.href = '/';
    }
    onPrevPage() {
        console.log('in onPrevPage function');
        var {pageIndex} = this.props;
        if (pageIndex === 0) return;
        this.props.setPageIndex(PREV_PAGE);
    }
    onNextPage() {
        console.log('in onNextPage funciton');
        var {pageIndex} = this.props;
        if (pageIndex === 3) {
            this.props.saveCurrentSubject();
        } else {
            this.props.setPageIndex(NEXT_PAGE);
        }
    }
    onGenerateAnalysis() {
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        for (var subjectName in resultSet) {
            var newSQM = this.deleteStudentFromSQM(resultSet[subjectName])
            this.props.updateSubjectSqm(subjectName, newSQM);
        }

        var resultSetJS = this.props.resultSet.toJS();
        // var currentSubjectJS = this.props.currentSubject.toJS();
        var postData = makeExamSchema(resultSetJS, this.props.analysisName);
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        //创建成功后根据返回的examId去到其相应的dashboard--这部分API要添加新的，就不是之前的API了

        // $.post(url, {data: postData}, function(data, textStatus) {
        //     console.log('textStatus = ', textStatus);
        //     console.log('data = ', data);
        // });
        params.request.post(customBaseUrl, {data: postData}).then(function(res) {
            //创建成功后进入到此分析的Dashboard
            console.log('res.data = ', res.data);
            debugger;
            browserHistory.push('/dashboard?examid=' + res.data.examId);
        }).catch(function(err) {
            console.log('自定义分析创建失败：', err);
        });
        // debugger;

        // alert('敬请期待！');
    }

    onDeleteAnalysis() {
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        params.request.put(customBaseUrl, {examId: "575f845b0000031b156333fe"}).then(function(res) {
            //删除成功后？？？
            console.log('res.data - ', res.data);
        }).then(function(err) {
            console.log('');
        })
    }

    deleteStudentFromSQM(subject){
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
    render() {
        var {status, pageIndex} = this.props;
        var examList = (List.isList(this.props.examList)) ? this.props.examList.toJS() : this.props.examList;
        var currentSubject = Map.isMap(this.props.currentSubject) ? this.props.currentSubject.toJS() : this.props.currentSubject;
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        var customExamList = [];
        _.each(examList, (obj, index) => {
            customExamList = _.concat(customExamList, obj.values);
        });
        return (
            <div style={{ width: 1000, minHeight: 600, margin: '20px auto', background: '#fff', paddingBottom: 30 }}>
                <Header
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
                        onGenerateAnalysis={this.onGenerateAnalysis.bind(this)}
                        onDeleteAnalysis={this.onDeleteAnalysis.bind(this)}/>
                }
                {
                    status === 'create' && pageIndex === 0 &&
                    <SubjectInput
                        onNextPage={this.onNextPage.bind(this) }
                        subjectList={Object.keys(resultSet)}
                        currentSubject={currentSubject}
                        changeCurrentSubjectName={this.changeCurrentSubjectName.bind(this)}
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
                {
                    status === 'create' && pageIndex === 3 &&
                    <StudentConfirm
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        onChangeGroupMap={this.props.setGroupMap}
                        currentSubject={currentSubject} />
                }


            </div>
        )
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(CustomizeAnalysis);

function mapStateToProps(state) {
    return {
        examList: state.home.examList,
        currentSubject: state.customAnalysis.currentSubject,
        pageIndex: state.customAnalysis.pageIndex,
        resultSet: state.customAnalysis.resultSet,
        analysisName: state.customAnalysis.analysisName,
        status: state.customAnalysis.status
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
        updateSubjectSqm: bindActionCreators(updateSubjectSqmAction, dispatch)
    }
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
    // debugger;
    var examStudentsInfo = _.sortBy(makeExamStudentsInfo(resultSet, subjectsIdArr), 'score');
    // debugger;
    var examPapersInfo = makeExamPapersInfo(resultSet, subjectsIdArr);
    // debugger;
    var examClassesInfo = makeExamClassesInfo(resultSet);
    // debugger;

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
    gradeName: -- 暂时先不填写
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
        var sqmItem = item.SQM;
        if(!sqmItem) return;
        return _.sum(_.map(sqmItem.x, (questionObj) => questionObj.score));
    }));

    var realClasses = [], realStudentsCount = 0;
    _.each(resultSet, (item, subjectName) => {
        var groupMapItem = item.groupMap;
        if(!groupMapItem) return;
        var selectedClasses = _.map(_.filter(groupMapItem, (obj, className) => obj.status == 'inUse'), (classObj, index) => classObj.name);
        var newAddClasses = _.difference(selectedClasses ,realClasses);
        realStudentsCount += _.sum(_.map(newAddClasses, (className) => groupMapItem[className].count));
        realClasses = _.concat(realClasses, newAddClasses);
    });

    return {
        name: analysisName,
        startTime: Date.now(), // new Date()
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

    // debugger;
    var studentsInfoMap = {};
    _.each(resultSet, (item, subjectName) => {
        var sqmItem = item.SQM;
        if(!sqmItem) return;
        var questions = sqmItem.x, students = sqmItem.y, matrix = sqmItem.m;
        var studentsPaperScore = _.map(matrix, (questionScoresArr) => _.sum(questionScoresArr));
        //一个科目： {_count: , class: , id: , kaohao: , name: , score: }
        _.each(sqmItem.y, (studentObj, index) => {
            var obj = studentsInfoMap[studentObj.id];
            if(!obj) {
                obj = _.assign(_.pick(studentObj, ['class', 'id', 'kaohao', 'name']), { "[papers]": [] });
                studentsInfoMap[studentObj.id] = obj;
            }
            var ids = _.find(subjectsIdArr, (obj) => obj.subject == subjectName);
            obj["[papers]"].push({paperid: ids.id, score: studentsPaperScore[index]});
        });
    });
    //给所有的学生添加总分信息
    return _.map(studentsInfoMap, (studentObj, studentId) => {
        var totalScore = _.sum(_.map(studentObj["[papers]"], (paperObj) => paperObj.score));
        return _.assign(studentObj, {score: totalScore});
    });
}

function makeExamPapersInfo(resultSet, subjectsIdArr) {
    var result = _.map(resultSet, (item, subjectName) => {
        var sqmItem = item.SQM;
        if(!sqmItem) return;
        var questions = sqmItem.x, matrix = sqmItem.m;
        var obj = _.find(subjectsIdArr, (sobj) => sobj.subject == subjectName);    //_.pick(item, ['id', 'paper', 'subject']);   //id是pid，paper是ObjectId
        var fullMark = _.sum(_.map(questions, (questionObj) => questionObj.score));
        var realClassesArr = _.filter(item.groupMap, (obj) => obj.status == 'inUse');
        var realClasses = _.map(realClassesArr, (classObj) => classObj.name);
        var realStudentsCount = _.sum(_.map(realClassesArr, (classObj) => classObj.count));
        var classCountArr = _.map(realClassesArr, (classObj) => {
            return { name: classObj.name, count: classObj.count };
        });
        return _.assign(obj, { fullMark: fullMark, "[questions]": questions, "[realClasses]": realClasses, "[lostClasses]": [], realStudentsCount: realStudentsCount, lostStudentsCount: 0, "[class]": classCountArr});
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
        if(!groupMapItem) return;
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



