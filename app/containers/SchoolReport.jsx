/*
1.总分分档分析的说明就是按照dis1--即人数来算，而不是靠离差结果那么麻烦
2.学科考试表现第一个文案的计算方法：
    各个学科的平均得分率；某学科中最大班级的平均得分率减去最小班级的平均得分率（其实就是max-min的差值）
3.学科考试表现第二个文案不再计算了
 */

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Map, List} from 'immutable';

//设计：这里是所有view container的page view。
//尽量是木偶组件


import Header from '../components/schoolReport/Header';
import FullScoreTrend from '../components/schoolReport/FullScoreTrend';
import ScoreDistribution from '../components/schoolReport/ScoreDistribution';
import SubjectDistribution from '../components/schoolReport/SubjectDistribution';
import ClassPerformance from '../components/schoolReport/ClassPerformance';
import SubjectPerformance from '../components/schoolReport/SubjectPerformance';
import GroupAnalysis from '../components/schoolReport/GroupAnalysis';
import StudentPerformance from '../components/schoolReport/StudentPerformance/StudentPerformance';;

import {initSchoolAnalysisAction, changeLevelAction} from '../reducers/schoolAnalysis/actions';
import {initParams} from '../lib/util';
import {SUBJECTS_WEIGHT as subjectWeight} from '../lib/constants';

class SchoolReport extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ];

    componentDidMount() {
        if (this.props.haveInit) return;

//TODO: 将initParams的参数调换一下位置--request是肯定要有的，所以应该放在前面，不叫做other而是request
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initSchoolAnalysis(params);
    }

    render() {
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, headers, levels} = this.props;

        examInfo = (Map.isMap(examInfo)) ? examInfo.toJS() : examInfo;
        examStudentsInfo = (List.isList(examStudentsInfo)) ? examStudentsInfo.toJS() : examStudentsInfo;
        examPapersInfo = (Map.isMap(examPapersInfo)) ? examPapersInfo.toJS() : examPapersInfo;
        examClassesInfo = (Map.isMap(examClassesInfo)) ? examClassesInfo.toJS() : examClassesInfo;
        studentsGroupByClass = (Map.isMap(studentsGroupByClass)) ? studentsGroupByClass.toJS() : studentsGroupByClass;
        allStudentsPaperMap = (Map.isMap(allStudentsPaperMap)) ? allStudentsPaperMap.toJS() : allStudentsPaperMap;
        headers = (List.isList(headers)) ? headers.toJS() : headers;
        levels = (Map.isMap(levels)) ? levels.toJS() : levels;

// console.log('SchoolReport 重绘');
// debugger;


        if((!examInfo || _.size(examInfo) == 0) || (!examStudentsInfo || examStudentsInfo.length == 0) ||
            (!examPapersInfo || _.size(examPapersInfo) == 0) || (!examClassesInfo || _.size(examClassesInfo) == 0) ||
            (!studentsGroupByClass || _.size(studentsGroupByClass) == 0) || (!allStudentsPaperMap || _.size(allStudentsPaperMap) == 0) ||
             (!headers || _.size(headers) == 0) || (!levels || _.size(levels) == 0)) return (<div></div>) //显示 loading

// debugger;

        return (
            <div style={{ width: 1000, margin: '0 auto', marginTop: 20, backgroundColor: '#fff' }}>
                <Header examInfo = {examInfo}/>
                <FullScoreTrend examInfo = {examInfo} examStudentsInfo = {examStudentsInfo} />
                <ScoreDistribution
                examInfo = {examInfo}
                examStudentsInfo = {examStudentsInfo}
                examClassesInfo = {examClassesInfo}
                studentsGroupByClass = {studentsGroupByClass}
                levels = {levels}
                changeLevels = {this.props.changeLevels} />
                <SubjectDistribution
                examInfo = {examInfo}
                examStudentsInfo = {examStudentsInfo}
                examPapersInfo = {examPapersInfo}
                examClassesInfo = {examClassesInfo}
                studentsGroupByClass = {studentsGroupByClass}
                allStudentsPaperMap = {allStudentsPaperMap}
                levels = {levels}
                headers = {headers}/>
                <ClassPerformance
                examInfo = {examInfo}
                examStudentsInfo = {examStudentsInfo}
                examPapersInfo = {examPapersInfo}
                examClassesInfo = {examClassesInfo}
                studentsGroupByClass = {studentsGroupByClass}
                levels = {levels}
                headers = {headers} />
                <SubjectPerformance
                examStudentsInfo={examStudentsInfo}
                examPapersInfo={examPapersInfo}
                allStudentsPaperMap={allStudentsPaperMap}
                headers={headers} />
                <GroupAnalysis
                examInfo={examInfo}
                examStudentsInfo={examStudentsInfo}
                studentsGroupByClass={studentsGroupByClass}
                levels={levels} />
                <StudentPerformance
                examInfo={examInfo}
                examStudentsInfo={examStudentsInfo}
                allStudentsPaperMap={allStudentsPaperMap}
                headers={headers} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        haveInit: state.schoolAnalysis.haveInit,
        examInfo: state.schoolAnalysis.examInfo,
        examStudentsInfo: state.schoolAnalysis.examStudentsInfo,
        examPapersInfo: state.schoolAnalysis.examPapersInfo,
        examClassesInfo: state.schoolAnalysis.examClassesInfo,
        studentsGroupByClass: state.schoolAnalysis.studentsGroupByClass,
        allStudentsPaperMap: state.schoolAnalysis.allStudentsPaperMap,
        headers: state.schoolAnalysis.headers,
        levels: state.schoolAnalysis.levels
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initSchoolAnalysis: bindActionCreators(initSchoolAnalysisAction, dispatch),
        changeLevels: bindActionCreators(changeLevelAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolReport);


/*
Mock Data:
var headerInfo = {
    examName: '遵义县2016年下高二期末考试',
    examTime: '2016.6.12-2016.6.15',
    grade: '初一',
    classNum: 20,
    studentNum: 2300,
    subjectList: ['语文', '数学', '英语', '物理', '化学', '生物']
}

var defaultLevelInfo = [
    {
        score: 520,
        rate: 15,
        num: 100
    },
    {
        score: 480,
        rate: 35,
        num: 360
    },
    {
        score: 360,
        rate: 50,
        num: 890
    }
]


 */
