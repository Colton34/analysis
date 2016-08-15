import _ from 'lodash';
import React from 'react';

import StudentLevel from './subjectDistribution-StudentLevel';
import SubjectPerformanceTable from './subjectPerformance-Exam';
import ScoreContriFactor from './subjectDistribution-ScoreContriFactor';
import SubjectDistributionGroupLevel from './subjectDistribution-GroupLevel';

import commonClass from '../../../../common/common.css';

export default function SubjectPerformance({classStudents, classStudentsPaperMap, classHeaders, classHeadersWithTotalScore, currentClass, reportDS}) {
    return (
        <div id='subjectPerformance' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科考试表现分析</span>
            <span className={commonClass['title-desc']}>学科考试表现，通过对不同学科之间基本指标数据的分析，发现学校各学科的教学信息</span>

            <SubjectPerformanceTable classStudents={classStudents} classStudentsPaperMap={classStudentsPaperMap} classHeaders={classHeaders} currentClass={currentClass} reportDS={reportDS} />
            <ScoreContriFactor classStudents={classStudents} classHeadersWithTotalScore={classHeadersWithTotalScore} currentClass={currentClass} reportDS={reportDS} />
            <StudentLevel classHeaders={classHeaders} reportDS={reportDS} classStudents={classStudents} currentClass={currentClass} />
            <SubjectDistributionGroupLevel reportDS={reportDS} currentClass={currentClass} classStudentsPaperMap={classStudentsPaperMap} />
        </div>
    )
}
