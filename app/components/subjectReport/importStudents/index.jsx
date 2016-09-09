//学科报告：重点学生信息模块
import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import ClassImportGoodStudents from './classImportGoodStudents';
import ClassImportBadStudents from './classImportBadStudents';
import DisadvantagedSubjectModule from './disadvantagedSubject';
var tabletdStyle = {width:'220px',textAlign:'center'};
var tablethStyle = {lineHeight:'40px',verticalAlign:'center'};


export default function ImportStudentsModule({reportDS, currentSubject}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var topStudents = getTopStudentsInfo(currentPaperStudentsInfo, examStudentsInfo);//排名前十的学生
    // var topStudents = getTopStudentAllInfo(rankTopStudents,examStudentsInfo);
    return (
        <div id='importantStudents' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>重点学生信息</span>
            <span className={commonClass['title-desc']}>本学科成绩，在全校排名前10的学生</span>
            <div style={{width: 1140, height: '100%', border: '1px solid' + colorsMap.C05, borderRadius: 2,marginBottom:20,marginTop:'20px'}}>
                <table  style={_.assign({}, { width: '1100px', minHeight: 220, margin: '30px auto',fontSize:'12px',color:'#333'}) }>
                    <thead>
                        <tr style={{fontSize:'14px'}}>
                            <th style={tabletdStyle}>名次</th>
                            <th style={tabletdStyle}>姓名</th>
                            <th style={tabletdStyle}>班级</th>
                            <th style={tabletdStyle}>总分</th>
                            <th style={tabletdStyle}>{currentSubject.name}成绩</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            topStudents.map((student, index) => {
                                {
                                    var localStyle = {};
                                    switch (student.rank) {
                                        case 1:
                                            localStyle = {width:'22px',height:'22px',borderRadius:'50%',lineHeight:'22px', backgroundColor:'#ee6b52',color:'#fff',marginLeft:'98px '}; break;

                                        case 2:

                                                localStyle = {width:'22px',height:'22px',borderRadius:'50%',lineHeight:'22px', backgroundColor:'#f6953d',color:'#fff',marginLeft:'98px '}; break;

                                        case 3:

                                                localStyle = {width:'22px',height:'22px',borderRadius:'50%',lineHeight:'22px', backgroundColor:'#f7be38',color:'#fff',marginLeft:'98px '}; break;

                                        default:
                                            localStyle = {width:'22px',height:'22px',borderRadius:'50%',lineHeight:'22px', backgroundColor:'#f2f2f2',color:'#999',marginLeft:'98px '}
                                    }
                                }

                                return (
                                    <tr key={index} style={tablethStyle}>
                                        <td style={tabletdStyle}>
                                            <div style={localStyle}>{student.rank}</div>
                                        </td>
                                        <td style={tabletdStyle}>{student.name?student.name:''}</td>
                                        <td style={tabletdStyle}>{student.class?student.class:''}</td>
                                        <td style={tabletdStyle}>{student.score?student.score:''}</td>
                                        <td style={tabletdStyle}>{student.subjectScore?student.subjectScore:''}</td>
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

function getTopStudentsInfo(currentPaperStudentsInfo, examStudentsInfo) {
    //从后面去除分数高的
    var hashExamStudentsInfo = _.keyBy(examStudentsInfo, 'id');
    var topStudents = _.reverse(_.takeRight(currentPaperStudentsInfo, 10));
    return _.map(topStudents, (obj) => {
        var paperScore = obj.score;
        var className = obj['class_name'];
        var rank = obj.rank;
        var totalScore = hashExamStudentsInfo[obj.id].score;
        var name = hashExamStudentsInfo[obj.id].name;
        return {
            rank: obj.rank,
            class: obj['class_name'],
            subjectScore: obj.score,
            id: obj.id,
            score: hashExamStudentsInfo[obj.id].score,
            name: hashExamStudentsInfo[obj.id].name
        }
    });
}
