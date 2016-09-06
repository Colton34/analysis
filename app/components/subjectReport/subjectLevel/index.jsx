import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

// import {makeSegmentsDistribution} from '../../../sdk';

export default function SubjectLevelModule({reportDS, currentSubject}) {
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentSubject.pid];
    debugger;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    debugger;
    var subjectLevelSegments = getSubjectLevelSegments(reportDS.subjectLevels.toJS(), currentPaperInfo.fullMark, currentSubject.pid);
    debugger;
    var subjectLevelDistribution = makeCurrentSubjectSegmentsDistribution(currentPaperStudentsInfo, subjectLevelSegments);
    debugger;
}


function getSubjectLevelSegments(subjectLevels, subjectFullMark, currentPid) {
    return _.concat(_.map(subjectLevels, (subLevObj) => {
        return subLevObj[currentPid].mean;
    }), [subjectFullMark]);
}

function makeCurrentSubjectSegmentsDistribution(currentPaperStudentsInfo, subjectLevelSegments) {
    //过滤，计算相应的人数
}
