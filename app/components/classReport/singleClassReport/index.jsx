import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Header from './Header';
import TotalScoreTrend from './TotalScoreTrend';
import TotalScoreLevelGuide from './totalScore-levelGuide';
import TotalScoreLevelDistribution from './totalScore-levelDistribution';
import SubjectDistributionScoreLevel from './subjectDistribution-ScoreLevel';
import CriticalStudentDistribution from './CriticalStudentDistribution';
import SubjectPerformance from './SubjectExamPerformance';
import SubjectInspectPerformance from './SubjectInspectPerformance';
import Wishes from './Wishes';

import ImportStudentInfo from './ImportStudentInfo';
import HistoryPerformance from './HistoryPerformance/index';

class SingleClassReport extends React.Component {
    constructor(props) {
        super(props);
        var realClasses = this.props.reportDS.examInfo.toJS().realClasses;
        this.authClasses = getAuthClasses(this.props.user.auth, this.props.grade, this.props.gradeName, realClasses);
        this.state = {
            currentClass: this.authClasses[0].key
        }
    }

    //TODO:能选择哪些班级是跟着这个用户的权限走的！！！
    chooseClass(className) {
        this.setState({
            currentClass: className
        })
    }

//Note: 当前先打散，而没有再在结构上进行重组，后面结构化更清晰了会考虑进一步重组。
    render() {
        var studentsGroupByClass = this.props.reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), headers = this.props.reportDS.headers.toJS();
        var classStudents = getClassStudents(studentsGroupByClass, this.state.currentClass);
        var classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, this.state.currentClass);
        var classHeaders = getClassHeaders(headers, classStudentsPaperMap);
        var classHeadersWithTotalScore = getClassHeadersWithTotalScore(headers, classStudentsPaperMap);

        var {currentClass} = this.state;
        var {reportDS, changeLevels, saveBaseline, examid, grade} = this.props;
        return (
            <div>
                <Header examInfo={this.props.reportDS.examInfo} currentClass={currentClass}/>
                <TotalScoreTrend reportDS={this.props.reportDS} classStudents={classStudents} />
                <TotalScoreLevelGuide reportDS={this.props.reportDS} classStudents={classStudents} changeLevels={changeLevels} saveBaseline={saveBaseline} examid={examid} grade={grade}/>
                <TotalScoreLevelDistribution reportDS={this.props.reportDS} currentClass={this.state.currentClass} />
                <SubjectDistributionScoreLevel classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={this.state.currentClass} reportDS={this.props.reportDS} />
                <CriticalStudentDistribution classStudents={classStudents} reportDS={this.props.reportDS} />
                <SubjectPerformance classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeaders={classHeaders} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={this.state.currentClass} reportDS={this.props.reportDS} />
                <SubjectInspectPerformance reportDS={this.props.reportDS} currentClass={this.state.currentClass} classHeaders={classHeaders} />
                <ImportStudentInfo reportDS={reportDS.toJS()} currentClass={currentClass} classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeadersWithTotalScore={classHeadersWithTotalScore} />
                <HistoryPerformance user={this.props.user} grade={this.props.grade} currentClass={this.state.currentClass} />
                <Wishes />
            </div>
        );
    }
}

export default SingleClassReport;


//=================================================  分界线  =================================================
//TODO:注意这里需要替换数据源！！！
function getClassStudents(studentsGroupByClass, currentClass) {
    return studentsGroupByClass[currentClass];
}

function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
    var result = {};
    _.each(allStudentsPaperMap, (students, pid) => {
        var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
        if(classStudents || classStudents.length > 0) result[pid] = classStudents;
    });
    return result;
}

function getClassHeaders(headers, classStudentsPaperMap) {
    var result = [];
    _.each(headers, (headerObj) => {
        if(classStudentsPaperMap[headerObj.id]) result.push(headerObj);
    });
    return result;
}

function getClassHeadersWithTotalScore(headers, classStudentsPaperMap) {
    var result = [];
    _.each(headers, (headerObj) => {
        if(classStudentsPaperMap[headerObj.id]) result.push(headerObj);
    });
    result.unshift(headers[0]);
    return result;
}

function getAuthClasses(auth, gradeKey, gradeName, realClasses) {
    //获取此页面需要的auth classes
    //如果是校级领导，年级主任，任意一门学科的学科组长，那么都将看到所有学生--因为这里涉及的自定义分析到选择学生页面没有学科的筛选了，就没办法和学科再联系一起了
    if(gradeKey && (auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]))) {
        return _.map(realClasses, (classKey) => {
            return {
                key: classKey,
                value: gradeKey + classKey + '班'
            }
        })
    }
    //Note: 是自定义--不属于自己管理的年级。自定义可能是没有gradeKey传递--是undefined
    if(!gradeKey || !auth.gradeAuth[gradeKey]) {
        return _.map(realClasses, (classKey) => {
            return {
                key: classKey,
                value: gradeName + classKey + '班'
            }
        })
    }

    return _.map(auth.gradeAuth[gradeKey].groupManagers, (obj) => {
        return {
            key: obj.group,
            value: gradeKey + obj.group + '班'
        }
    });
}


/* <ClassNav chooseClass={this.chooseClass.bind(this)} />  -- 被砍掉 */


/*

[
    [
        { "id": "class", "name": "班级", "rowSpan": 2 },
        { "colSpan": 3, "name": "一档", headerStyle: { textAlign: 'center' } },
        { "colSpan": 3, "name": "二档", headerStyle: { textAlign: 'center' } },
        { "colSpan": 3, "name": "三档", headerStyle: { textAlign: 'center' } }
    ],
    [
        { "id": "count_0", "name": "人数" },
        { "id": "sumCount_0", "name": "累计人数" },
        { "id": "sumPercentage_0", "name": "累计上线率" },
        { "id": "count_1", "name": "人数" },
        { "id": "sumCount_1", "name": "累计人数" },
        { "id": "sumPercentage_1", "name": "累计上线率" },
        { "id": "count_2", "name": "人数" },
        { "id": "sumCount_2", "name": "累计人数" },
        { "id": "sumPercentage_2", "name": "累计上线率" }
    ]
]


 */
