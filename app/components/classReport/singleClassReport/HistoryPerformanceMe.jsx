import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import StatisticalLib from 'simple-statistics';

import {initExamCacheAction, getMoreExamsInfoAction} from '../../../reducers/examsCache/actions';

// import {List} from 'immutable';

/*
设计：
examCache持有examList


        var isLoading = false, ifBlankPage = false;
        if(!this.props.haveInit) {
            isLoading = true;
        } else {
            var currentClassExamsInfo = this.props.examsInfoCache.get(this.props.currentClass);
            if(!currentClassExamsInfo || currentClassExamsInfo.length == 0) {
                ifBlankPage = true;
            } else {
                var examsInfoCache = this.props.examsInfoCache.toJS();
                var cacheIds = _.map(examsInfoCache, (obj) => obj.examid);//此处id是长id还是短id？怎么获取examsListCache--并且是跟着当前班级的权限走的，即：只获取此班级-- 班主任 --- 所参与的考试--这个在home的地方应该就有权限控制
                isLoading = !_.every(this.state.currentExams, (obj) => _.includes(cacheIds, obj.key));
            }
        }
        var currentExams = this.state.currentExams;



examInfoObj: {
    examid: ,
    examInfo:
    examStudentsInfo:
    examPapersInfo:
    examClassesInfo:
}

examListObj: {
    id: ,
    name: ,
    event_time:
}

 */

class HistoryContent extends React.Component {
    constructor(props) {
        super(props);
        console.log('初始化此班级的default exams');
        debugger;
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
        if(isCurrentExamsNoChange(exams, this.state.currentExams)) return; //根本没有改变currentExams
        this.setState({
            currentExams: exams
        });
        if(isCurrentExamsInCache(exams, this.props.currentClassExamsInfoCache)) return; //虽然真正改变了currentExams但是命中缓存了
        this.props.getMoreExamsInfo(); //没有命中缓存，需要getMoreExamsInfo
    }

    render() {
        if(!isCurrentExamsInCache(this.state.currentExams, this.props.currentClassExamsInfoCache)) return (<div></div>);
        console.log('一切数据都已ready，渲染');
        console.log(this.props.currentClassExamsList);//暂时不叫做currentClassExamsListCache--因为没有cache的操作，等如果后期需要对exams "GetMore"的时候再使用”currentClassExamsListCache“这个名字
        var currentExamsInfo = getCurrentExamsInfoFromCache(this.state.currentExams, this.props.currentClassExamsInfoCache);
        debugger;

//this.props.currentClassExamsList currentExamsInfo 去填充！！！

        return (
            <div></div>
        );
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

class HistoryPerformance extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
console.log('componentDidMount');

        if(!this.props.isLoading) return;
console.log('componentDidMount 进行初始化')
debugger;
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

        if(!this.props.isLoading) {
            console.log(this.props.currentClass);

            console.log(this.props.examsListCache);
            console.log(this.props.examsListCache.get(this.props.currentClass));

            console.log(this.props.examsInfoCache);
            console.log(this.props.examsInfoCache.get(this.props.currentClass));

            debugger;
        }

        return (
            <div>
                {
                    (this.props.isLoading) ? (<h1>isLoading</h1>) : (<HistoryContent currentClassExamsList={this.props.examsListCache.get(this.props.currentClass)} currentClassExamsInfoCache={this.props.examsInfoCache.get(this.props.currentClass)} getMoreExamsInfo={this.getMoreExamsInfo.bind(this)} />)
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

function examIdsNotChange(newExamIds, oldExamIds) {
    if(newExamIds.length !== oldExamIds.length) return false;
    return _.every(newExamIds, (id) => _.includes(oldExamIds, id));
}




//=================================================  分界线  =================================================
//z-score: (班级平均分-全校平均分)/标准差  标准差：各个班级平均分最为数组
//默认情况下：连续的  同等性质的

//Note: 排名率？不清楚，暂时不做


function getExamsZScore(exams) {
    _.each(exams, (examObj) => {
        //(班级平均分) - 学校平均分 / 学校级别的标准差

    })
}

//设计：走服务端异步计算数据。。。

//如果对比多场考试，多场考试考了不同的科目，怎么对比，怎么显示（几种排列组合）
function getExamZScore(examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, headers) {
    var gradeScores, classMean, gradeMean, gradeStandardDeviation, zScore;
    var result = [];
    _.each(headers, (headerObj, index) => {
        if(headerObj.id == 'totalScore') {
            gradeScores = _.map(examStudentsInfo, (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudents, (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation);
            result.push(zScore);
        } else {
            var currentClassPaperStudents = classStudentsPaperMap[headerObj.id];
            if(!currentClassPaperStudents) return;
            gradeScores = _.map(allStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score);
            classMean = _.mean(_.map(classStudentsPaperMap[headerObj.id], (studentObj) => studentObj.score));
            gradeMean = _.mean(gradeScores);
            gradeStandardDeviation = StatisticalLib.standardDeviation(gradeScores);
            zScore = StatisticalLib.zScore(classMean, gradeMean, gradeStandardDeviation);
            result.push(zScore);
        }
    });
    return result;
}

//根据计算得到的标准分进行排名：
function getExamSubjectRank() {

}


                // debugger;
                // if(this.state.currentExamIds.length == 0 && examsInfoCache.length > 0) {//TODO: 一定保证如果有考试列表那么就不能一个都不选
                //     //只会出现在首次
                //     // debugger;
                //     this.setState({
                //         currentExamIds: _.map(examsInfoCache, (obj) => obj.examid)
                //     });
                // }


// function HistoryContent({examsListCache, examsInfoCache, currentExams}) {//这里examList就是跟着currentClass走的
//     examsListCache = examsListCache.toJS(), examsInfoCache = examsInfoCache.toJS();
//     debugger;
//     //根据currentExamIds和examsInfoCache得到要显示对比的考试。examList用来填充选择考试的下拉框
//     return (
//         <div id='historyPerformance'>
//             <h1>Yes, Cached: {examsInfoCache.length}</h1>
//         </div>
//     )
// }
