import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import { Modal } from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;


export default class QuestionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: false,
            isPicReady: false,
            picUrl: ''
        }
        this.showPicDialog = this.showPicDialog.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        //如果lessonid没有变则找的图片也没有变，否则获取新的lesson的图片--暂时不做任何缓存
    }

    showPicDialog() {
        debugger;
        //加载图片
        var _this = this;
        setTimeout(function() {
            _this.setState({
                picUrl: "http://haofenshu.kssws.ks-cdn.com/file/vs/53595/1.png"
            });
        }, 2000);
        this.setState({
            isDisplay: true
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
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>每小题得分情况</span>
                <span className={commonClass['title-desc']}></span>
                <div style={{marginTop:30}}>
                    <TableView hover tableData={tableData}></TableView>
                    <CheckQuestionImageDialog isDisplay={this.state.isDisplay} hideModal={this.hideModal.bind(this)} picUrl={this.state.picUrl} />
                </div>
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
        rowData.push(<CheckQuestionImageLink showPicDialog={showPicDialog} />);
    tableData.push(rowData);
    });
    return tableData;
}

class CheckQuestionImageLink extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <a onClick={this.props.showPicDialog}>查看原题</a>
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
                <Modal show={ this.props.isDisplay } ref="dialog"  onHide={this.props.hideModal}>
                    {this.props.picUrl ? (<img src={this.props.picUrl} alt="题目1"/>) : (<h5>正在加载...</h5>)}
                </Modal>
            </div>
        );
    }
}
