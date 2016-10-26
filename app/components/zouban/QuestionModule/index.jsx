//因为这里只有一个select的位置，所以一个父亲多个孩子
/*
设计：
原则：
1、颗粒度保持较小--没有交互的统统封装成stateless function


SubjectSelector
PaperClassSelector

QuestionPerformance
QuestionDistribution
QuestionDetail


 */

import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import commonClass from '../../../styles/common.css';
import QuestionPerformance from './QuestionPerformance';
import QuestionDistribution from './QuestionDistribution';
import QuestionDetail from './QuestionDetail';
import QuestionDistributionDetail from './QuestionDistribution-detail';

class QuestionModule extends React.Component {
    constructor(props) {
        super(props);
        var zoubanExamInfo = this.props.zoubanExamInfo.toJS();
        this.lessons = getLessons(zoubanExamInfo);
        this.state={
            currentLesson:this.lessons[1]
        }
    }
    changeLesson(selectedLesson){
        this.setState({
            currentLesson:selectedLesson
        });
        console.log(selectedLesson);
    }
    render() {
        var zoubanExamInfo = this.props.zoubanExamInfo.toJS();
        var zoubanExamStudentsInfo = this.props.zoubanExamStudentsInfo.toJS();
        var zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo.toJS();
        var zuobanLessonQuestionInfo = this.props.zuobanLessonQuestionInfo.toJS();
        return (
            <div>
                <SubjectSelector  lessons={this.lessons} currentLesson={this.state.currentLesson} changeLesson={this.changeLesson.bind(this)}/>
                <QuestionPerformance  currentLesson={this.state.currentLesson} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamInfo={zoubanExamInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo}/>
                <QuestionDistributionDetail currentLesson={this.state.currentLesson} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamInfo={zoubanExamInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} />
            </div>
        );
    }
}

export default connect(mapStateToProps)(QuestionModule);

function mapStateToProps(state) {
    return {
        zoubanExamInfo: state.zouban.zoubanExamInfo,
        zoubanExamStudentsInfo: state.zouban.zoubanExamStudentsInfo,
        zoubanLessonStudentsInfo: state.zouban.zoubanLessonStudentsInfo,
        zuobanLessonQuestionInfo: state.zouban.zuobanLessonQuestionInfo
    }
}


class SubjectSelector extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var lessons = this.props.lessons;
        var currentLesson = this.props.currentLesson;
        return (
            <div style={{ padding: '5px 30px 0 30px'}} className={commonClass['section']}>
                <div style={{heigth: 50, lineHeight: '50px'}}>
                    <span style={{ marginRight: 10}}>学科：</span>
                        {lessons.map((lessonObj, index) => {
                            return (
                                <a key={'papers-' + index}  onClick={this.props.changeLesson.bind(this,lessonObj)}  style={ lessonObj.key===currentLesson.key?localStyle.activeSubject:localStyle.subject}>{lessonObj.value}</a>
                            )
                        })
                    }
                </div>

            </div>

        );
    }
}

var localStyle = {
    subject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px',padding:'0px 10px'
    },

}
function getLessons(zoubanExamInfo){
    var lessons = _.map(zoubanExamInfo.lessons,function(lesson){
        return {
            key:lesson.objectId,
            value:lesson.name
        }
    });
    return lessons;
}
