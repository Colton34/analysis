//学科教学质量分析
import _ from 'lodash';
import React from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import TableView from '../../../common/TableView';

import StudSubjGradeDistribution from './StudSubjGradeDistribution';

 export default  function SubjectTeacherQuality ({reportDS, currentSubject}) {

    return (
        <div id='SubjectTeacherQuality' className={commonClass['section']}>
            <div>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科教学质量分析</span>
            <span className={commonClass['title-desc']}>各班级某学科的表现，是所有考试科目表现的其中之一，它们之间存在一定的关联性，不仅要分析班级平均分的高低，要联系班级及全校多学科的综合水平来考察，班级某一个学科的相对表现水平。这可用学科得分率贡献指数来表达。如下表各班级本科表现：</span>
            </div>
            <div style={{marginTop: 30}}>
            <TableView  tableData={tableData}></TableView>
            </div>
            <div className={subjectReportStyle['analysis-conclusion']}>
                <div>分析诊断：</div>
                <div>对于各班自身学科综合水平而言，经分析得出各个班级本学科的得分率贡献指数，表达该班级本学科对班级学科综合水平的贡献情况。数值为正，越大越好；数值为负，绝对值越大越不好。根据上面的数表， 2 班 ，6 班 班级的  语文  教学值得注意。</div>
            </div>
            <StudSubjGradeDistribution reportDS={reportDS} currentSubject={currentSubject}></StudSubjGradeDistribution>
            <SubjectGradeLevels></SubjectGradeLevels>
            <StudentLevelDistribution></StudentLevelDistribution>
        </div>
    )
}

//班级学科成绩的等级结构比例
function SubjectGradeLevels (){
    return (
        <div>
            <div style={{marginBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>班级学科成绩的等级结构比例</span>
                <span className={commonClass['title-desc']}>将语文学科分为ABCD四个档次，了解各个班级关于本学科的ABCD档人数占比表现的情况</span>
            </div>
            <TableView tableData={tableData}/>
        </div>
    )
}

//学生学科水平的分布
function StudentLevelDistribution (){
    return (
        <div>
            <div style={{marginBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>学生学科水平的分布</span>
                <span className={commonClass['title-desc']}>按成绩高低将学生等分为10组（第1组成绩最高，第10组成绩最低），高分段学生密度越大，表现越有优势，低分段学生密度越大，则需要教学中注意帮助这部分学生突破</span>
            </div>
            <TableView tableData={tableData}/>


        </div>
    )
}


//mork table 数据
var tableData =[['学科','年级','1班','2班'],['学科平均分',128,120,110],['学科得分率贡献指数',0,0.1,0.3]];
