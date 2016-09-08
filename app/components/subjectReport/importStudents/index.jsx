//重点学生信息模块
import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import ClassImportGoodStudents from './classImportGoodStudents';
import ClassImportBadStudents from './classImportBadStudents';
import DisadvantagedSubjectModule from './disadvantagedSubject';

export default function ImportStudentsModule({reportDS, currentSubject}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var rankTopStudents = getTopStudentsInfo(currentPaperStudentsInfo);//排名前十的学生
    var allStudent = getTopStudentAllInfo(rankTopStudents,examStudentsInfo);
    return (
        <div id='ImportStudentsModule' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>重点学生信息</span>
            <span className={commonClass['title-desc']}>本学科成绩，在全校排名前10的学生</span>
            <div>
                <table  style={_.assign({}, { width: '100%', minHeight: 220, margin: '30px 0 0 30px'}) }>
                    <thead>
                        <tr>
                            <th >名次</th>
                            <th >姓名</th>
                            <th >班级</th>
                            <th >总分</th>
                            <th >语文成绩</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            allStudent.map((student, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{student.rank?student.rank:''}</td>
                                        <td>{student.name?student.name:''}</td>
                                        <td>{student.class?student.class:''}</td>
                                        <td>{student.score?student.score:''}</td>
                                        <td>{student.subjectScore?student.subjectScore:''}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <ClassImportGoodStudents currentPaperStudentsInfo={currentPaperStudentsInfo}></ClassImportGoodStudents>
            <ClassImportBadStudents currentPaperStudentsInfo={currentPaperStudentsInfo}></ClassImportBadStudents>
            <DisadvantagedSubjectModule currentSubject={currentSubject} reportDS={reportDS} />
        </div>
    )
}


function getTopStudentsInfo(currentPaperStudentsInfo){
    var papserStudentsByScore = _.groupBy(currentPaperStudentsInfo, 'score');
    var papserStudentsByScoreInfo = _.map(papserStudentsByScore, (v, k) => {
        return {
            score: k,
            students: v
        }
    });
    var orderedPaperStudentScoreInfo = _.orderBy(papserStudentsByScoreInfo, ['score'], 'desc');
    var rankTopStudentsArr = _.take(orderedPaperStudentScoreInfo, 10);
    var rankTopStudents = [];
    _.each(rankTopStudentsArr, (sarr) => {
        rankTopStudents = _.concat(rankTopStudents, sarr);
    });
    return rankTopStudents;
}
function getTopStudentAllInfo(rankTopStudents,examStudentsInfo){
    var allStudent = [];
    _.forEach(rankTopStudents,function(obj,index){
        _.forEach(_.range(_.size(obj.students)),function(num){
             allStudent.push( {
                 rank:index+1,
                 class:obj.students[num].class_name,
                 subjectScore:obj.students[num].score,
                 id:obj.students[num].id,
                 score:getScoreById(obj.students[num].id,examStudentsInfo,'score'),
                 name:getScoreById(obj.students[num].id,examStudentsInfo,'name'),
             });
        });
    });
    return allStudent;
}
function getScoreById(id,examStudentsInfo,pro){
     return _.result(_.find(examStudentsInfo,function(arr){
         return arr.id==id;
     }),pro)
 }
