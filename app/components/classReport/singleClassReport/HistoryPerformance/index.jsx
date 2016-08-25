import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import StatisticalLib from 'simple-statistics';
import ReactHighcharts from 'react-highcharts';

import DropdownList from '../../../../common/DropdownList';
import StandardScoreContrast from './StandardScoreContrast';
import RankRateContrast from './RankRateContrast';

import commonClass from '../../../../common/common.css';
import {initExamCacheAction, getMoreExamsInfoAction} from '../../../../reducers/examsCache/actions';

import {
    SUBJECTS_WEIGHT as subjectWeight,
} from '../../../../lib/constants';

/**----------------------------mock data----------------------------------------------- */
var examList = [{value:'放假效果抽检'}, {value:'勇能考试'}, {value:'八十八所中学大联考'}]
/**----------------------------mock data end----------------------------------------------- */


// export default function HistoryPerformance() {

//     return (
//         <div id='historyPerformance' className={commonClass['section']} style={{position: 'relative'}}>
//             <div style={{marginBottom: 10}}>
//                 <span className={commonClass['title-bar']}></span>
//                 <span className={commonClass['title']}>历史表现比较</span>
//                 <span className={commonClass['title-desc']}>通过相同性质的考试比较，可以发现各学科标准分与排名率的变化</span>
//             </div>
//             <DropdownList list={examList} style={{position: 'absolute', top: 30, right: 30, zIndex: 1,borderRadius:2}}/>
//             <StandardScoreContrast/>
//             <RankRateContrast/>
//         </div>
//     )
// }
class HistoryContent extends React.Component {
    constructor(props) {
        super(props);
        console.log('初始化此班级的default exams');
        // debugger;
        var initExams = _.map(this.props.currentClassExamsInfoCache, (obj) => {
            return {
                key: obj.examid,
                value: obj.examInfo.name
            }
        });
        this.state = {
            currentExams: initExams
        }
    }

    componentWillReceiveProps(nextProps) {
        var initExams = _.map(nextProps.currentClassExamsInfoCache, (obj) => {
            return {
                key: obj.examid,
                value: obj.examInfo.name
            }
        });
        this.setState({
            currentExams: initExams
        });
    }

    onChangeExams(exams) {
        debugger;
        if(isCurrentExamsNoChange(exams, this.state.currentExams)) return; //根本没有改变currentExams
        debugger;
        this.setState({
            currentExams: exams
        });
        if(isCurrentExamsInCache(exams, this.props.currentClassExamsInfoCache)) return; //虽然真正改变了currentExams但是命中缓存了
        debugger;
        this.props.getMoreExamsInfo(); //没有命中缓存，需要getMoreExamsInfo
    }

    render() {
        if(!isCurrentExamsInCache(this.state.currentExams, this.props.currentClassExamsInfoCache)) return (<div></div>);
        console.log('一切数据都已ready，渲染');
        console.log(this.props.currentClassExamsList);//暂时不叫做currentClassExamsListCache--因为没有cache的操作，等如果后期需要对exams "GetMore"的时候再使用”currentClassExamsListCache“这个名字
        var currentExamsInfo = getCurrentExamsInfoFromCache(this.state.currentExams, this.props.currentClassExamsInfoCache);
        var currentExamsList = _.map(this.props.currentClassExamsList, (obj) => {
            return {
                key: obj.id,
                value: obj.name
            }
        });

        var currentClassExamsZScore = getCurrentClassExamsZScore(currentExamsInfo, this.props.currentClass);
        var categories = getConfigCategories(currentClassExamsZScore);

        // var currentValidExamsZScore = getCurrentValidExamsZScore(currentExamsInfo, this.props.currentClass);//并且要求自己--currentClass--在这几场考试所考的科目是一样的！！！那么以什么标准为准呢？只能靠筛选--全部科目（不要取交集！！！不科学）
        // debugger;


//TODO: onClickDropdownList={this.onChangeExams.bind(this)}
        return (
            <div id='historyPerformance' className={commonClass['section']} style={{position: 'relative'}}>
                <div style={{marginBottom: 10}}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>历史表现比较</span>
                    <span className={commonClass['title-desc']}>通过相同性质的考试比较，可以发现各学科标准分与排名率的变化</span>
                </div>
                <DropdownList list={currentExamsList} style={{position: 'absolute', top: 30, right: 30, zIndex: 1,borderRadius:2}}/>
                <StandardScoreContrast currentClassExamsZScore={currentClassExamsZScore} categories={categories} />
                {/*<RankRateContrast currentExamsZScore={currentExamsZScore} categories={categories} currentClass={this.props.currentClass} />*/}
            </div>
        );
    }
}

class HistoryPerformance extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
console.log('componentDidMount');

        if(!this.props.isLoading) return;
console.log('componentDidMount 进行初始化')
// debugger;
        var params = {request: window.request};
        params.schoolId = this.props.user.schoolId;
        params.grade = this.props.grade;
        params.currentClass = this.props.currentClass;
        this.props.initExamCache(params);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.currentClass != nextProps.currentClass && !this.props.examsInfoCache.get(nextProps.currentClass) && !nextProps.isLoading) {//!nextProps.isLoading--因为对isLoading的修改也会触发componentWillReceiveProps
console.log('切换班级了，并且此班级没有缓存过，去获取此班级数据');
            var params = {request: window.request};
            params.schoolId = nextProps.user.schoolId;
            params.grade = nextProps.grade;
            params.currentClass = nextProps.currentClass;
            this.props.initExamCache(params);
        }
    }

    getMoreExamsInfo() {
        var params = {request: window.request};
        params.schoolId = this.props.user.schoolId;
        params.grade = this.props.grade;
        params.currentClass = this.props.currentClass;
        this.props.getMoreExamsInfo(params);
    }

    render() {
        return (
            <div>
                {
                    (this.props.isLoading) ? (<h1>isLoading</h1>) : (<HistoryContent currentClass={this.props.currentClass} currentClassExamsList={this.props.examsListCache.get(this.props.currentClass)} currentClassExamsInfoCache={this.props.examsInfoCache.get(this.props.currentClass)} getMoreExamsInfo={this.getMoreExamsInfo.bind(this)} />)
                }
            </div>
        );
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(HistoryPerformance);

function mapStateToProps(state, ownProps) {
    return {
        user: ownProps.user,
        grade: ownProps.grade,
        currentClass: ownProps.currentClass,
        isLoading: state.examsCache.isLoading,
        examsListCache: state.examsCache.examsListCache,
        examsInfoCache: state.examsCache.examsInfoCache
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initExamCache: bindActionCreators(initExamCacheAction, dispatch),
        getMoreExamsInfo: bindActionCreators(getMoreExamsInfoAction, dispatch)
    }
}

function getCurrentExamsInfoFromCache(currentExams, examsInfoCache) {
    var currentExamIds = _.map(currentExams, (obj) => obj.key);
    return _.filter(examsInfoCache, (obj) => _.includes(currentExamIds, obj.examid));
}

function isCurrentExamsNoChange(newExams, oldExams) {
    if(newExams.length != oldExams.length) return false;
    var newExamIds = _.map(newExams, (obj) => obj.key);
    var oldExamIds = _.map(oldExams, (obj) => obj.key);
    return _.every(newExamIds, (id) => _.includes(oldExamIds, id));
}

function isCurrentExamsInCache(newExams, examsInfoCache) {
    var newExamIds = _.map(newExams, (obj) => obj.key);
    var cachedIds = _.map(examsInfoCache, (obj) => obj.examid);
    return _.every(newExamIds, (id) => _.includes(cachedIds, id));
}


//=================================================  迁移分界线  =================================================
//z-score: (班级平均分-全校平均分)/标准差  标准差：各个班级平均分最为数组
//当前每场考试下各个班级的ZScore
    //一场考试下面各个班级的ZScore信息--得出此场考试下，此班级各个科目的名次

//TODO:
//设计：首先肯定是要计算本班的ZScoreInfo--因为要画第一个图。但是下面获取当前currentExams中哪几场考试的ZScore，要进行过滤：和当前班级 考试的班级相同，考试的科目也要相同 的几场考试

// function getCurrentClassExamsZScore(currentExamsInfo, currentClass) {
//     var result = {};
//     _.each(currentExamsInfo, (eObj) => {
//         var studentsGroupByClass = _.groupBy(eObj.examStudentsInfo, 'class');
//         // debugger;
//         var allStudentsPaperMap = _.groupBy(_.concat(..._.map(eObj.examStudentsInfo, (student) => student.papers)), 'paperid');
//         // debugger;
//         // debugger;
//         var headers = getHeaders(eObj.examPapersInfo);
//         var classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, currentClass);
//         // debugger;
//         var classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);
//         // debugger;
//         // debugger;
//         var examZScore = getExamZScore(eObj.examStudentsInfo, studentsGroupByClass[currentClass], allStudentsPaperMap, classStudentsPaperMap, classHeadersWithTotalScore);
//         // debugger;
//         result[eObj.examid] = {
//             examid: eObj.examid,
//             name: eObj.examInfo.name,
//             examZScore: examZScore
//         }
//     });
//     return result;
// }

/*
排名：适用于期中考试，期末考试。关键在于”排名“是基于比较的，所以要保证”比较的基数“相同。
选了4场考试：
    1 A, B, C （总共：A, B, C, A`, C`）
    2 A, B, C （总共：A, B, C）

    3 B, C, D （总共：B, C, D, D`）
    4 B, C, D （总共：B, C, D）

选择内容多的展示？

 */


function getCurrentValidExamsZScore(currentExamsInfo, currentClass) {
//0.这几场考试所考的科目都相同，参与的班级也都相同
//1.每个班级都参与所有考试的所有科目
}

//TODO:设计
// function getCurrentExamsZScore(currentExamsInfo) {
//     var result = {};
//     var validCurrentExamsInfo = getValidCurrentExamsInfo(currentExamsInfo);
//     _.each(currentExamsInfo, (eObj) => {
//         var studentsGroupByClass = _.groupBy(eObj.examStudentsInfo, 'class');
//         // debugger;
//         var allStudentsPaperMap = _.groupBy(_.concat(..._.map(eObj.examStudentsInfo, (student) => student.papers)), 'paperid');
//         // debugger;
//         // debugger;
//         var headers = getHeaders(eObj.examPapersInfo);
//         // debugger;
//         result[eObj.examid] = {};
//         var classStudentsPaperMap, classHeadersWithTotalScore;
//         _.each(studentsGroupByClass, (classStudents, className) => {
//             classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, className);
//             classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);
//             var examZScore = getExamZScore(eObj.examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, classHeadersWithTotalScore);
//             result[eObj.examid][className] = {
//                 examid: eObj.examid,
//                 name: eObj.examInfo.name,
//                 examZScore: examZScore
//             }
//         });
//     });
//     return result;
// }



// function getCurrentClassExamsZScore(currentExamsZScore, currentClass) {
//     var result = {};
//     _.each(currentExamsZScore, (zObj, examid) => {
//         result[examid] = zObj[currentClass];
//     });
//     return result;
// }

function getCurrentClassExamsZScore(currentExamsInfo, currentClass) {
    var result = {};
    _.each(currentExamsInfo, (obj) => {
        // debugger;
        var studentsGroupByClass = _.groupBy(obj.examStudentsInfo, 'class');
        // debugger;
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(obj.examStudentsInfo, (student) => student.papers)), 'paperid');
        // debugger;
        var classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, currentClass);
        // debugger;
        var headers = getHeaders(obj.examPapersInfo);
        // debugger;
        var classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);
        var examZScore = getExamZScore(obj.examStudentsInfo, studentsGroupByClass[currentClass], allStudentsPaperMap, classStudentsPaperMap, classHeadersWithTotalScore);
        // debugger;
        result[obj.examid] = {
            examid: obj.examid,
            name: obj.examInfo.name,
            examZScore: examZScore
        };
    });
    return result;
}

function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
    var result = {};
    _.each(allStudentsPaperMap, (students, pid) => {
        var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
        if(classStudents || classStudents.length > 0) result[pid] = classStudents;
    });
    return result;
}

function getHeaders(examPapersInfo) {
    var headers = [], restPapers = [];
    _.each(examPapersInfo, (paper, pid) => {
        var index = _.findIndex(subjectWeight, (s) => (s == paper.subject));
        if (index >= 0) {
            headers.push({
                index: index,
                subject: paper.subject,
                id: pid,
                fullMark: paper.fullMark
            });
        } else {
            restPapers.push({id: pid, subject: paper.subject});
        }
    });
    headers = _.sortBy(headers, 'index');
    headers.unshift({
        subject: '总分',
        id: 'totalScore'
    });
    headers = _.concat(headers, restPapers);
    return headers;
}

function getClassHeadersWithTotalScore(headers, classStudentsPaperMap) {
    var result = [];
    _.each(headers, (headerObj) => {
        if(classStudentsPaperMap[headerObj.id]) result.push(headerObj);
    });
    result.unshift(headers[0]);
    return result;
}

/*

{pid: , subject: , zScore: }

 */


function getExamZScore(examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, classHeadersWithTotalScore) {
    //观察一下classHeadersWithTotoalScore
    // debugger;
    var gradeScores, classMean, gradeMean, gradeStandardDeviation, zScore;
    var result = [];
    _.each(classHeadersWithTotalScore, (headerObj, index) => {
        if(headerObj.id == 'totalScore') {
            gradeScores = _.map(examStudentsInfo, (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudents, (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            // debugger;
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation).toFixed(2);
        } else {
            var currentClassPaperStudents = classStudentsPaperMap[headerObj.id];
            if(!currentClassPaperStudents) return;
            gradeScores = _.map(allStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            // debugger;
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            // debugger;
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation).toFixed(2);
        }
        result.push({pid: headerObj.id, subject: headerObj.subject, zScore: zScore});
    });
    return result;
}

function getConfigCategories(currentClassExamsZScore) {
    //取全集，按照sweight的顺序 pid subject zScore
    var temp = _.unionBy(..._.map(currentClassExamsZScore, (zObj) => zObj.examZScore), (obj) => obj.subject);
    // debugger;
    var results = [], theRest = [];
    _.each(temp, (obj) => {
        if(obj.pid == 'totalScore') return;
        var index = _.findIndex(subjectWeight, (s) => (s == obj.subject));
        if (index >= 0) {
            results.push({
                index: index,
                subject: obj.subject,
                id: obj.pid
            });
        } else {
            theRest.push({id: obj.pid, subject: obj.subject});
        }
    });
    results = _.sortBy(results, 'index');
    results.unshift({
        subject: '总分',
        id: 'totalScore'
    });
    results = _.concat(results, theRest);
    return results;
}

//根据计算得到的标准分进行排名：
function getExamSubjectRank() {

}


//Just For Test::
// class HistoryPerformance extends React.Component {
//     constructor(props) {
//         console.log('constructor');
//       super(props);

//     }

//     componentWillMount() {
//         console.log('componentWillMount');
//     }

//     componentDidMount() {
//         console.log('componentDidMount');
//         // this.props.testFun();
//         // debugger;
//         // this.props.testAsyncFun();
//         // this.props.testPromiseFun();
//     }

//     componentWillReceiveProps(nextProps) {
//         debugger;
//         var params = {request: window.request};
//         console.log('componentWillReceiveProps');
//     }

//     componentWillUpdate(nextProps, nextState) {
//       console.log('componentWillUpdate');
//     }

//     componentWillUnmount() {
//         console.log('componentWillUnmount');
//     }

//     testTheAsync() {
//         this.props.testAsyncFun();
//     }

//     render() {
//         return (
//             <div>
//                 <h3 onClick={this.testTheAsync.bind(this)}>点击</h3>
//             </div>
//         );
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(HistoryPerformance);

// function mapStateToProps(state) {
//     return {
//         test: state.examsCache.test,
//         testList: state.examsCache.testList
//     }
// }

// function mapDispatchToProps(dispatch) {
//     return {
//         testFun: bindActionCreators(testAction, dispatch),
//         testPromiseFun: bindActionCreators(testPromiseAction, dispatch),
//         testAsyncFun: bindActionCreators(testAsyncAction, dispatch)
//     }
// }



