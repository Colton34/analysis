import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';

export default class StudentLessonQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.tableHeader = getTableHeader();
        this.state = {
            currentLesson: this.props.lessonsByStudent[0]

        }
        debugger
    }

    onSelectLesson(selectedLesson) {
        this.setState({
            currentLesson: selectedLesson
        });
    }

    render() {
        if(_.size(this.props.currentStudent) == 0) return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学生各学科试题分析</span>
                <span className={commonClass['title-desc']}></span>
                <div style={{display:'tableCell',textAlign:'center',padding:'50px 0px'}}>
                    <span>请先选择学生后查看数据</span>
                </div>
            </div>
        );
        var currentLesson = this.state.currentLesson || this.props.lessonsByStudent[0];
        var tableBody = getTableBody(currentLesson, this.props.currentStudent, this.props.zoubanLessonStudentsInfo, this.props.zuobanLessonQuestionInfo);
        tableBody.unshift(this.tableHeader);
debugger
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学生各学科试题分析</span>
                <span className={commonClass['title-desc']}></span>
                <div>
                    <div>
                        <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                            <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                                <span style={{ marginRight: 10}}>学科：</span>
                                    {_.map(this.props.lessonsByStudent, (lessonObj, index) => {
                                        return (
                                            <a key={'papers-' + index}  onClick={this.onSelectLesson.bind(this, lessonObj)} style={lessonObj.name===currentLesson.name?localStyle.activeSubject: localStyle.subject}>{lessonObj.name}</a>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop:30}}>
                    <TableView hover  tableData={tableBody}></TableView>
                    </div>
                </div>
            </div>
        );
    }
}

function getTableHeader() {
    return ['题号', '试题满分', '自己得分', '试题得分率', '试题平均分', '查看原题'];
}

function getTableBody(currentLesson, currentStudent, zoubanLessonStudentsInfo, zuobanLessonQuestionInfo) {
    var currentLessonStudents = _.unionBy(..._.values(zoubanLessonStudentsInfo[currentLesson.objectId]), (obj) => obj.id);
    var row, currentStudentInfo = _.find(currentLessonStudents, (obj) => obj.id), currentQuestionLessonInfo;
    return _.map(currentLesson.questions, (questionObj, index) => {
        row = [];
        row.push(questionObj.name, questionObj.score);
        row.push(currentStudentInfo.questionScores[index]);
        currentQuestionLessonInfo = zuobanLessonQuestionInfo[currentLesson.objectId][index].lesson;
        row.push(currentQuestionLessonInfo.rate);
        row.push(currentQuestionLessonInfo.mean);
        row.push('查看题目');
        return row;
    });
}

var localStyle = {
    subject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    }
}
