//历史表现比较。注意：这个还没有考虑好！！！
import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import StatisticalLib from 'simple-statistics';

import {initHomeAction} from '../../../reducers/home/actions';
import {getMoreExamsAction} from '../../../reducers/examsCache/actions';

// import {List} from 'immutable';

// export default function HistoryPerformance({reportDS, classStudents, classStudentsPaperMap}) {
//     var examStudentsInfo = reportDS.examStudentsInfo.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
//     var result = getExamZScore(examStudentsInfo, classStudents, allStudentsPaperMap, classStudentsPaperMap, headers);
//     debugger;
// }


/*
问题：提供不了服务端渲染了
设计描述：
0.要有cache
1.组件DisMount里去获取 默认的数据：三次 连续的 同等性质的 考试的数据
2.每次切换考试:



 */

function HistoryContent({examsInfoList}) {
    return (
        <div>
            <h1>Yes, Cached: {examsInfoList.length}</h1>
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
        var params = {request: window.request};
        if(this.state.currentExamIds.length == 0 && this.props.examsInfoCache.size == 0) {
            params.examIds = [];
            this.props.getMoreExams(params);
        }
        if(!this.props.examListHaveInit) this.props.initHome(params);

        var examsInfoCache = this.props.examsInfoCache.toJS();
        var cacheIds = _.map(examsInfoCache, (obj) => obj.id);//此处id是长id还是短id？怎么获取examsList--并且是跟着当前班级的权限走的，即：只获取此班级-- 班主任 --- 所参与的考试--这个在home的地方应该就有权限控制
        var ifCache = _.every(this.state.currentExamIds, (examid) => _.includes(cacheIds, examid));
        if(!ifCache) {
            var moreExamIds = _.difference(this.state.currentExamIds, cacheIds);
            params.examIds = moreExamIds;
            this.props.getMoreExams(params);
        }
    }

    onChangeExams(examIds) {
        if(examIdsNotChange(examIds, this.state.currentExamIds)) return;
        this.setState({
            currentExamIds: examIds
        })
    }

    render() {
        var examsInfoCache = this.props.examsInfoCache.toJS();
        var cacheIds = _.map(examsInfoCache, (obj) => obj.id);//此处id是长id还是短id？怎么获取examsList--并且是跟着当前班级的权限走的，即：只获取此班级-- 班主任 --- 所参与的考试--这个在home的地方应该就有权限控制
        var ifCache = _.every(this.state.currentExamIds, (examid) => _.includes(cacheIds, examid));
        ifCache = (ifCache && (this.state.currentExamIds.length > 0)); //必须至少有两个需要显示，所以有此条件判断~
        var examsInfoList = _.map(this.state.currentExamIds, (examid) => {
            return _.find(examsInfoCache, (obj) => obj.id == examid);
        });
        return (
            <div>
                {
                    (ifCache && this.props.examListHaveInit) ? <HistoryContent examsInfoList={examsInfoList} /> : (<h1>No, get more</h1>)
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPerformance);

function mapStateToProps(state) {
    return {
        examListHaveInit: state.home.haveInit,
        examList: state.home.examList,
        examsInfoCache: state.examsCache.examsInfoCache
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initHome: bindActionCreators(initHomeAction, dispatch),
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



