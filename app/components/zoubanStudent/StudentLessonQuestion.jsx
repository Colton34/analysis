import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import commonClass from '../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../lib/constants';
import TableView from '../../common/TableView';
import { Modal } from 'react-bootstrap';
import {fetchLessonQuestionPic} from '../../api/exam';
var {Header, Title, Body, Footer} = Modal;

export default class StudentLessonQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.tableHeader = getTableHeader();
        this.state = {
            currentLesson: this.props.lessonsByStudent[0],
            isDisplay: false,
            isPicReady: false,
            currentLessonPics: [],
            currentQuestionPic: '',
            currentQuestionName: ''
        }
        this.showPicDialog = this.showPicDialog.bind(this);
    }

    componentDidMount() {
        debugger;
        this.lessonQuestions = this.state.currentLesson.questions;
        debugger;
        var questionIds = _.map(this.lessonQuestions, (obj) => obj.qid);
        debugger;
        var examObjectId = this.props.zoubanExamInfo.objectId;
        debugger;
        var _this = this;
        fetchLessonQuestionPic({request: window.request, questionIds: questionIds, examObjectId: examObjectId}).then(function(picUrls) {
            _this.setState({
                isPicReady: true,
                currentLessonPics: picUrls
            });
        });
    }

    // componentWillReceiveProps(nextProps) {

    // }

    onSelectLesson(selectedLesson) {
        //TODO:切换lesson，重新获取对应的question pics
        debugger;
        this.setState({
            isPicReady: false,
            currentLesson: selectedLesson
        });
        this.lessonQuestions = selectedLesson.questions;
        debugger;
        var questionIds = _.map(this.lessonQuestions, (obj) => obj.qid);
        var examObjectId = this.props.zoubanExamInfo.objectId;
        debugger;
        var _this = this;
        fetchLessonQuestionPic({request: window.request, questionIds: questionIds, examObjectId: examObjectId}).then(function(picUrls) {
            debugger;
            _this.setState({
                isPicReady: true,
                currentLessonPics: picUrls
            });
        });
    }

    showPicDialog(index) {
        this.setState({
            isDisplay: true,
            currentQuestionPic: this.state.currentLessonPics[index],
            currentQuestionName: this.lessonQuestions[index].name
        })
    }

    hideModal() {
        this.setState({
            isDisplay: false
        })
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
        var tableBody = getTableBody(currentLesson, this.props.currentStudent, this.props.zoubanLessonStudentsInfo, this.props.zuobanLessonQuestionInfo, this.showPicDialog);
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

                    {(this.state.isPicReady) ? (
                        <div style={{marginTop:30}}>
                            <TableView hover tableData={tableBody}></TableView>
                            <CheckQuestionImageDialog isDisplay={this.state.isDisplay} hideModal={this.hideModal.bind(this)} currentQuestionPic={this.state.currentQuestionPic} currentQuestionName={this.state.currentQuestionName} />
                        </div>
                        ) : (<h4>正在加载，请稍后...</h4>)}
                    </div>
                </div>
            </div>
        );
    }
}

class CheckQuestionImageLink extends React.Component {
    constructor(props) {
        super(props);
    }

    showPicDialog() {
        this.props.showPicDialog(this.props.index);
    }

    render() {
        return (
            <div>
                <a onClick={this.showPicDialog.bind(this)}>查看原题</a>
            </div>
        );
    }
}

class CheckQuestionImageDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        debugger;
        return (
            <div >
                <Modal show={ this.props.isDisplay } onHide={this.props.hideModal} dialogClassName={'ModalDialog'}>
                    <img src={this.props.currentQuestionPic} alt={this.props.currentQuestionName} style={{width:'1200px'}}/>
                </Modal>
            </div>
        );
    }
}

function getTableHeader() {
    return ['题号', '试题满分', '自己得分', '试题得分率', '试题平均分', '查看原题'];
}

function getTableBody(currentLesson, currentStudent, zoubanLessonStudentsInfo, zuobanLessonQuestionInfo, showPicDialog) {
    var currentLessonStudents = _.unionBy(..._.values(zoubanLessonStudentsInfo[currentLesson.objectId]), (obj) => obj.id);
    var row, currentStudentInfo = _.find(currentLessonStudents, (obj) => obj.id), currentQuestionLessonInfo;
    return _.map(currentLesson.questions, (questionObj, index) => {
        row = [];
        row.push(questionObj.name, questionObj.score);
        row.push(currentStudentInfo.questionScores[index]);
        currentQuestionLessonInfo = zuobanLessonQuestionInfo[currentLesson.objectId][index].lesson;
        row.push(currentQuestionLessonInfo.rate);
        row.push(currentQuestionLessonInfo.mean);
        row.push(<CheckQuestionImageLink index={index} showPicDialog={showPicDialog} />);
        return row;
    });
}

var localStyle = {
    subject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px',padding:'0px 10px'
    }
}
