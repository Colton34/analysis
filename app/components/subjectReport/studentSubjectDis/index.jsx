import _ from 'lodash';
import React, { PropTypes } from 'react';
import {makeSegmentsDistribution, makeSegments} from '../../../sdk';

class StudentSubjectDis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStep: 10
        }
    }

//TODO: change currentStep listener

    render() {
        var paperFullMark = this.props.reportDS.examPapersInfo.toJS()[this.props.currentSubject.pid].fullMark;
        var currentPaperStudents = this.props.reportDS.allStudentsPaperMap.toJS()[this.props.currentSubject.pid];
        var subjectMaxScore = _.last(currentPaperStudents).score;
        var segments = makeSegments(paperFullMark, 0, this.state.currentStep);
        var {classHeaders, classDis} = getSegmentsClassDis(segments, currentPaperStudents);
        debugger;
        return (
            <div>待填充</div>
        );
    }
}

export default StudentSubjectDis;

function getSegmentsClassDis(segments, currentPaperStudents) {
//先得到按照班级的扫描，得到一个班级，各个分数段的分布，然后再转换成需要的matrix
    var classDis = [];
    //索引，班级，数目
    var currentPaperClassStudentGroup = _.groupBy(currentPaperStudents, 'class_name');
    var classHeaders = _.map(_.keys(currentPaperClassStudentGroup), (classKey) => classKey+'班');
    _.each(currentPaperClassStudentGroup, (paperClassStudents, classKey) => {
        var currentSegmentsDis = makeSegmentsDistribution(segments, paperClassStudents, 'score');
        var formatSegmentsDis = _.map(currentSegmentsDis, (obj) => {
            return {
                key: '[' + obj.low + '-' + obj.high + ']',
                index: obj.index,
                count: obj.count,
                className: classKey
            }
        });
        classDis = _.concat(classDis, formatSegmentsDis);
    });
    classDis = _.groupBy(classDis, 'key');
    return {
        classHeaders: classHeaders,
        classDis: classDis
    }
}
