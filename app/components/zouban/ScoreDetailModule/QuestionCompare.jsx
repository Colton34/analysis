import _ from 'lodash';
import React, { PropTypes } from 'react';

import {Button} from 'react-bootstrap';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';

import {downloadData} from '../../../lib/util';

import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

class QuestionCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentLesson: this.props.zoubanExamInfo.lessons[0]
        }
    }

    onClickListener(selectedLesson) {
        this.setState({
            currentLesson: selectedLesson
        })
    }

    clickDownloadTable(tableHeader, tableBody) {
        downloadData(tableHeader, tableHeader, tableBody, '教学班试题得分率对比');
    }

    render(){
        var tableHeader = getTableHeader(this.props.zoubanLessonStudentsInfo, this.state.currentLesson.objectId);
        var headerKeys = _.concat(['lesson'], _.slice(tableHeader, 2));
        var tableBody = getTableBody(this.props.zuobanLessonQuestionInfo, this.state.currentLesson.objectId, this.state.currentLesson.questions, headerKeys);
        tableBody.unshift(tableHeader);
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>教学班试题得分率对比</span>
                <span className={commonClass['title-desc']}></span>
                <div>
                    <div style={{ padding: '5px 30px 0 0px',marginBottom:0}} className={commonClass['section']}>
                        <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                            <span style={{ marginRight: 10}}>学科：</span>
                                {_.map(this.props.zoubanExamInfo.lessons, (lessonObj, index) => {
                                    return (
                                        <a key={'papers-' + index} onClick={this.onClickListener.bind(this, lessonObj)} style={ (lessonObj.objectId == this.state.currentLesson.objectId) ?localStyle.activeSubject:localStyle.subject}>{lessonObj.name}</a>
                                    )
                                })
                            }
                            <Button onClick={this.clickDownloadTable.bind(this, tableHeader, tableBody)} style={{ margin: '0 2px', backgroundColor: '#2eabeb', color: '#fff', border: 0,float:'right'}}>下载表格</Button>
                        </div>
                    </div>
                </div>

                <div style={{marginTop:30}}>
                    <TableView hover  tableData={tableBody}></TableView>
                </div>
            </div>
        )
    }
}

export default QuestionCompare;

var localStyle = {
    subject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px',padding:'0px 10px'
    },

}

function getTableHeader(zoubanLessonStudentsInfo, currentLessonObjectId) {
    var arr = ['题目','年级平均得分率'];
    return _.concat(arr, _.keys(zoubanLessonStudentsInfo[currentLessonObjectId]));
}

function getTableBody(zuobanLessonQuestionInfo, currentLessonObjectId, questions, headerKeys) {
    var row;
    return _.map(zuobanLessonQuestionInfo[currentLessonObjectId], (questionInfo, index) => {
        row = [];
        row.push(questions[index].name);
        row = _.concat(row, _.map(headerKeys, (key) => questionInfo[key].rate));
        return row;
    });
}
