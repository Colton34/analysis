import _ from 'lodash';
import React, { PropTypes } from 'react';

//这里给的reportDS的levels中并没有studentsInfo而只是一个数字，所以需要在这里重新计算一下，重构的时候对这个数据结构添加targetStudents信息
export default class SummaryInfoModule extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        var levelStudentsInfoBySchool = getLevelStudentsInfoBySchool(this.props.reportDS);
        var allStudentBySchool = _.groupBy(examStudentsInfo, 'school');
        var summaryCardInfo = getSummaryCard(levelStudentsInfoBySchool, examStudentsInfo, allStudentBySchool);
        var summayrChartInfo = getSummaryChart(levelStudentsInfoBySchool, allStudentBySchool);
        return (
            <div>待填充</div>
        );
    }
}

function getSummaryCard(levelStudentsInfoBySchool, examStudentsInfo, allStudentBySchool) {
    //数组，排序，取值
    var result = {}, allSchools = _.keys(allStudentBySchool);
    _.each(levelStudentsInfoBySchool, (levelSchoolStudents, levelKey) => {
        //求取最低学校可能会有问题（在班级那边也是，而且更有可能出现）--如果某些学校压根在本档次没有人数，那么levelStudentsInfoBySchool数据结构中是没有此学校的key的，有多个这样的学校就更“麻烦”。总学校的个数可以通过直接对examStudentsInfo进行school group即可
        var existSchools = _.keys(levelSchoolStudents);
        var notExistSchools = _.difference(allSchools, existSchools);
        var temp = _.map(levelSchoolStudents, (students, schoolName) => {
            return {
                count: students.length,
                school: schoolName
            }
        });
        temp = _.sortBy(temp, 'count');
        result[levelKey] = {
            high: _.last(temp).school,
            low: _.first(temp).school
        }
    });
    return result;
}

function getSummaryChart(levelStudentsInfoBySchool, allStudentBySchool) {
    //需要调整一下key
    //以各个学校为key，里面是各个level
    //注意：有可能某个学校下面没有某一档次数据，则填充0。需要计算其他，那么就需要知道此学校一共有多少人--其实是一共有多少人参与了此考试--这个可以通过对examStudentsInfo进行groupBy得到
    var result = {};
    _.each(levelStudentsInfoBySchool, (levelSchoolStudents, levelKey) => {
        _.each(levelSchoolStudents, (students, schoolName) => {
            if(!result[schoolName]) result[schoolName] = {};
            result[schoolName][levelKey] = students.length;
        })
    });
    _.each(result, (schoolLevelCountInfo, schoolName) => {
        var schoolLevelCounts = _.values(schoolLevelCountInfo);
        var schoolAllExistStudentCount = allStudentBySchool[schoolName].length;
        var otherCount = schoolAllExistStudentCount - _.sum(schoolLevelCounts);
        schoolLevelCountInfo.other = otherCount;
        schoolLevelCountInfo.all = schoolAllExistStudentCount;
    });
    return result;
    //计算other count
}

function getLevelStudentsInfoBySchool(reportDS) {
    //通过每一档的count和score得到每一档所拥有的学生信息
    var result = {}, levels = reportDS.levels.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examFullMark = reportDS.examInfo.toJS().fullMark;
    _.each(levels, (levelObj, levelKey) => {
        var currentLevelStudentsInfo = getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark);
        result[levelKey] = _.groupBy(currentLevelStudentsInfo, 'school'); //注意这里的key是学校名称
    })
    return result;
}


function getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark) {
    var currentLevelScore = levels[levelKey].score, levelLastIndex = _.size(levels)-1, targetStudents;
    if(levelKey == '0') {
        var highLevelScore = levels[(parseInt(levelKey)+1)+''].score;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score <= highLevelScore));
    } else if(levelKey == levelLastIndex+'') {
        var highLevelScore = examFullMark;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore));
    } else {
        var highLevelScore = levels[(parseInt(levelKey)+1)+''].score;
        targetStudents = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore));
    }
    return targetStudents;
}
