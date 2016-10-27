import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import commonClass from '../../../styles/common.css';

import QuestionDistribution from './QuestionDistribution';
import QuestionDetail from './QuestionDetail';

class QuestionDistributionDetail extends React.Component {
    constructor(props) {
        super(props);
        var currentLesson = this.props.currentLesson;
        this.currentLesson = currentLesson;
        this.zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo;
        this.zoubanExamInfo = this.props.zoubanExamInfo;
        this.zuobanLessonQuestionInfo = this.props.zuobanLessonQuestionInfo;
        this.classes = _.keys(this.zoubanLessonStudentsInfo[currentLesson.key]);
        this.state={
            currentClass:lesson
        }
    }
    componentWillReceiveProps(nextProps){
        var {currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo} = nextProps;
        this.currentLesson = currentLesson;
        this.zoubanExamInfo =zoubanExamInfo;
        this.zuobanLessonQuestionInfo = zuobanLessonQuestionInfo;
        this.zoubanLessonStudentsInfo = zoubanLessonStudentsInfo;
        this.classes = _.keys(this.zoubanLessonStudentsInfo[currentLesson.key]);
        this.state={
            currentClass:lesson
        }
    }
    changeClass(newClass){
    this.setState({
        currentClass:newClass
    });
    console.log(newClass);
    }
    render() {
        return (
            <div>
                {/*<PaperClassSelector currentClass={this.state.currentClass} classes={this.classes} changeClass={this.changeClass.bind(this)}/>*/}
                <QuestionDistribution currentClass={this.state.currentClass} currentLesson={this.currentLesson} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zoubanExamInfo={this.zoubanExamInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}/>
                <QuestionDetail currentClass={this.state.currentClass} currentLesson={this.currentLesson} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zoubanExamInfo={this.zoubanExamInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}/>
            </div>
        );
    }
}
 export default QuestionDistributionDetail;
class PaperClassSelector extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillReceiveProps(nextProps){
        var {currentClass} = nextProps;
        this.setState={
            currentClass:currentClass
        }
    }
    render() {
        var currentClass= this.props.currentClass;var classes = this.props.classes;
        return (
            <div style={{height: 50, lineHeight: '50px',marginTop:0,padding:'0 0 0 30px',marginBottom:0}} className={commonClass['section']}>
                <span style={{ float: 'left', marginRight: 10}}>教学班:</span>
                <span style={{float: 'left', width: 1100}}>
                    <span style={{display: 'inline-block', marginRight: 30, minWidth: 50}}>
                        <input value='lesson' onClick={this.props.changeClass.bind(this,'lesson')} style={{ marginRight: 5, cursor: 'pointer'}} type='radio' name='classes' checked={currentClass==='lesson'}/>
                        <span>全部</span>
                    </span>
                    {
                        classes.map((className, index) => {
                            return (
                                <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                    <input value={className} onClick={this.props.changeClass.bind(this,className)} style={{ marginRight: 5, cursor: 'pointer' }} type='radio' name='classes' checked={currentClass===className}/>
                                    <span>{className}</span>
                                </span>
                            )
                        })
                    }
                </span>
                <div style={{clear: 'both'}}></div>
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
