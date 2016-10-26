import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import { Modal } from 'react-bootstrap';

import {fetchLessonQuestionPic} from '../../../api/exam';
var {Header, Title, Body, Footer} = Modal;

export default class QuestionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.lessonQuestions = _.keyBy(this.props.zoubanExamInfo.lessons, 'objectId')[this.props.currentLesson.key].questions
        this.state = {
            isDisplay: false,
            isPicReady: false,
            currentLessonPics: [],
            currentQuestionPic: '',
            currentQuestionName: ''
        }
        this.showPicDialog = this.showPicDialog.bind(this);
    }

    componentDidMount() {
        //初始化加载图片
        var questionIds = _.map(this.lessonQuestions, (obj) => obj.qid);
        var examObjectId = this.props.zoubanExamInfo.objectId;
        var _this = this;
        debugger;
        fetchLessonQuestionPic({request: window.request, questionIds: questionIds, examObjectId: examObjectId}).then(function(picUrls) {
            debugger;
            _this.setState({
                currentLessonPics: picUrls,
                isPicReady: true
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        //如果lessonid没有变则找的图片也没有变，否则获取新的lesson的图片--暂时不做任何缓存
        if(nextProps.currentLesson.key == this.props.currentLesson.key) return;
        debugger;
        this.setState({
            isPicReady: false
        });
        this.lessonQuestions = _.keyBy(nextProps.zoubanExamInfo.lessons, 'objectId')[nextProps.currentLesson.key].questions
        var questionIds = _.map(this.lessonQuestions, (obj) => obj.qid);
        var examObjectId = nextProps.zoubanExamInfo.objectId;
        var _this = this;
        fetchLessonQuestionPic({request: window.request, questionIds: questionIds, examObjectId: examObjectId}).then(function(picUrls) {
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
        var {currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo} = this.props;
        var tableData = getTableData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo, this.showPicDialog);
        debugger;
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>每小题得分情况</span>
                <span className={commonClass['title-desc']}></span>
                {(this.state.isPicReady) ? (
                    <div style={{marginTop:30}}>
                        <TableView hover tableData={tableData}></TableView>
                        <CheckQuestionImageDialog isDisplay={this.state.isDisplay} hideModal={this.hideModal.bind(this)} currentQuestionPic={this.state.currentQuestionPic} currentQuestionName={this.state.currentQuestionName} />
                    </div>
                    ) : (<h4>正在加载，请稍后...</h4>)}
            </div>
        );
    }
}

// export default function QuestionDetail({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}) {
//     var tableData = getTableData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo);
//     return (
//         <div className={commonClass['section']}>
//             <span className={commonClass['title-bar']}></span>
//             <span className={commonClass['title']}>每小题得分情况</span>
//             <span className={commonClass['title-desc']}></span>
//             <div style={{marginTop:30}}>
//             <TableView hover  tableData={tableData}></TableView>
//             <CheckQuestionImageDialog />
//             </div>
//         </div>
//     )
// }


function getTableData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo, showPicDialog){
    var tableHeader = ['题号','满分','最低分','最高分','平均分','得分率','难度','区分度','查看原题'];
    var tableData = [];
    tableData.push(tableHeader);
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
    _.forEach(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var maxScore = _.max(question[currentClass].scores);
        var rowData = [];
        rowData.push(currentLessonQuestions[index].name);
        rowData.push(currentLessonQuestions[index].score);
        rowData.push(_.min(question[currentClass].scores));
        rowData.push(_.max(question[currentClass].scores));
        rowData.push(question[currentClass].mean);
        rowData.push(_.round(_.multiply(question[currentClass].rate,100),2)+'%');
        rowData.push(question[currentClass].rate);
        rowData.push(question.lesson.separations);
        rowData.push(<CheckQuestionImageLink index={index} showPicDialog={showPicDialog} />);
        tableData.push(rowData);
    });
    return tableData;
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
            <div>
                <Modal show={ this.props.isDisplay } onHide={this.props.hideModal} dialogClassName={'ModalDialog'}>
                    <img src={this.props.currentQuestionPic} alt={this.props.currentQuestionName} />
                </Modal>
            </div>
        );
    }
}
