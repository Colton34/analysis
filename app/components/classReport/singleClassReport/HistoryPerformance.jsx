//历史表现比较。注意：这个还没有考虑好！！！
import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import StatisticalLib from 'simple-statistics';

import {initExamCacheAction, getMoreExamsAction} from '../../../reducers/examsCache/actions';

// import {List} from 'immutable';

/*
设计：
examCache持有examList




 */

/*
问题：提供不了服务端渲染了
设计描述：
0.要有cache
1.组件DisMount里去获取 默认的数据：三次 连续的 同等性质的 考试的数据
2.每次切换考试:
 */

function HistoryContent({examList, examsInfoCache, currentExamIds}) {//这里examList就是跟着currentClass走的
    examList = examList.toJS(), examsInfoCache = examsInfoCache.toJS();
    //根据currentExamIds和examsInfoCache得到要显示对比的考试。examList用来填充选择考试的下拉框
    return (
        <div id='historyPerformance'>
            <h1>Yes, Cached: {examsInfoCache.length}</h1>
        </div>
    )
}

class HistoryPerformance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentExamIds: []
        }
    }

    componentDidMount() {
        // if(this.props.haveInit) //表示examList是ok的
        var params = {request: window.request};

        if(!this.props.haveInit) {
            // console.log('初始化：examList和examInfoCache');
            // debugger;
            // params.examIds = [];
            params.schoolId = this.props.user.schoolId;
            params.grade = this.props.grade;
            params.currentClass = this.props.currentClass;
            this.props.initExamCache(params);
        }

        if(this.props.haveInit) {
            var examsInfoCache = this.props.examsInfoCache.toJS();
            var cacheIds = _.map(examsInfoCache, (obj) => obj.id);//此处id是长id还是短id？怎么获取examsList--并且是跟着当前班级的权限走的，即：只获取此班级-- 班主任 --- 所参与的考试--这个在home的地方应该就有权限控制
            var ifCache = _.every(this.state.currentExamIds, (examid) => _.includes(cacheIds, examid));
            if(!ifCache) {
                var moreExamIds = _.difference(this.state.currentExamIds, cacheIds);
                params.examIds = moreExamIds;
                this.props.getMoreExams(params);
            }
        }
    }

    onChangeExams(examIds) {
        if(examIdsNotChange(examIds, this.state.currentExamIds)) return;
        this.setState({
            currentExamIds: examIds
        })
    }

    render() {
        //isLoading:需要异步获取数据  ifBlankPage:已经拿到数据但是没有东西可以展示  content:有数据展示
        var isLoading = false, ifBlankPage = false;

        if(!this.props.haveInit) {
            //还没有初始化
            // debugger;
            isLoading = true;
        } else {
            //初始化了，是否有数据
            if(this.props.examsInfoCache.size == 0) {
                // debugger;
                ifBlankPage = true;
            } else {
                //有数据，检查当前展示的是否都缓存下来了
                // debugger;
                var examsInfoCache = this.props.examsInfoCache.toJS();
                var cacheIds = _.map(examsInfoCache, (obj) => obj.examid);//此处id是长id还是短id？怎么获取examsList--并且是跟着当前班级的权限走的，即：只获取此班级-- 班主任 --- 所参与的考试--这个在home的地方应该就有权限控制
                isLoading = !_.every(this.state.currentExamIds, (examid) => _.includes(cacheIds, examid));

                // debugger;
                if(this.state.currentExamIds.length == 0 && examsInfoCache.length > 0) {//TODO: 一定保证如果有考试列表那么就不能一个都不选
                    //只会出现在首次
                    // debugger;
                    this.setState({
                        currentExamIds: _.map(examsInfoCache, (obj) => obj.examid)
                    });
                }
            }
        }
        var currentExamIds = this.state.currentExamIds;
        return (
            <div>
                {
                    (isLoading) ? (<h1>isLoading</h1>) : ((ifBlankPage) ? (<h1>Blank Page</h1>) : (<HistoryContent examList={this.props.examList} examsInfoCache={this.props.examsInfoCache} currentExamIds={currentExamIds} />))
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPerformance);

function mapStateToProps(state, ownProps) {
    return {
        user: ownProps.user,
        currentClass: ownProps.currentClass,
        haveInit: state.examsCache.haveInit,
        examList: state.examsCache.examList,
        examsInfoCache: state.examsCache.examsInfoCache
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initExamCache: bindActionCreators(initExamCacheAction, dispatch),
        getMoreExams: bindActionCreators(getMoreExamsAction, dispatch)
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
