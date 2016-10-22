import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import commonClass from '../../../styles/common.css';

import ExamScore from './ExamScore';
import SubjectCompare from './SubjectCompare';
import QuestionAnalysis from './QuestionAnalysis';
import KnowledgePointAnalysis from './KnowledgePointAnalysis';

import Select from '../../../common/Selector/Select';

class StudentPersonalModule extends React.Component {
    constructor(props) {
        super(props);
        this.zoubanExamInfo = this.props.zoubanExamInfo.toJS();
        this.zoubanExamStudentsInfo = this.props.zoubanExamStudentsInfo.toJS();
        this.zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo.toJS();
        this.zuobanLessonQuestionInfo = this.props.zuobanLessonQuestionInfo.toJS();
        debugger
        this.lessons = getLessons(this.zoubanExamInfo);
        this.state={
            currentLesson:this.lessons[1],
            currentClass:{},
            currentStudent:{}
        }
    }


    changeLesson(value){
    this.setState({
        currentLesson:value
    });
    }
    transforStudentInfo(currentStudent,currentClass){

        this.setState({
            currentClass:currentClass,
            currentStudent:currentStudent
        })

    }
    render() {

        var currentClass = this.state.currentClass;
        var currentStudent = this.state.currentStudent;

        return (
            <div>
                <div className={commonClass['section']}>
                <div style={{height:34}}>
                    <span style={{lineHeight:'34px'}}>选择学科：</span>
                    <div style={{width:200,display:'inline-block',position:'absolute',zIndex:100}}>
                        <Select value={this.state.currentLesson} placeholder="选择学科" options={this.lessons} onChange={this.changeLesson.bind(this)}></Select>
                    </div>
                </div>
                <SelectClass  transforStudentInfo={this.transforStudentInfo.bind(this)} currentLesson={this.state.currentLesson} zoubanExamInfo={this.zoubanExamInfo} zoubanExamStudentsInfo={this.zoubanExamStudentsInfo} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}/>

                </div>
                <ExamScore currentLesson={this.state.currentLesson} currentClass={this.state.currentClass} currentStudent={this.state.currentStudent} zoubanExamInfo={this.zoubanExamInfo} zoubanExamStudentsInfo={this.zoubanExamStudentsInfo} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}></ExamScore>
                <SubjectCompare currentLesson={this.state.currentLesson} currentClass={this.state.currentClass} currentStudent={this.state.currentStudent} zoubanExamInfo={this.zoubanExamInfo} zoubanExamStudentsInfo={this.zoubanExamStudentsInfo} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}></SubjectCompare>
                <QuestionAnalysis currentLesson={this.state.currentLesson} currentClass={this.state.currentClass} currentStudent={this.state.currentStudent} zoubanExamInfo={this.zoubanExamInfo} zoubanExamStudentsInfo={this.zoubanExamStudentsInfo} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zuobanLessonQuestionInfo={this.zuobanLessonQuestionInfo}></QuestionAnalysis>
                {/*<KnowledgePointAnalysis></KnowledgePointAnalysis>*/}
            </div>
        );
    }
}

export default connect(mapStateToProps)(StudentPersonalModule);

class SelectClass extends React.Component{
    constructor(props) {
        super(props);
        this.currentLesson = this.props.currentLesson;
        this.zoubanExamInfo = this.props.zoubanExamInfo;
        this.classes = getClasses(this.currentLesson,this.zoubanExamInfo);
        this.state={
            currentClass:this.classes[0]
        }
    }
    componentWillReceiveProps(nextProps){
        var {currentLesson,zoubanExamInfo} = nextProps;
        this.currentLesson = currentLesson;
        this.zoubanExamInfo = zoubanExamInfo;
        this.classes = getClasses(this.currentLesson,this.zoubanExamInfo);
        this.setState({
            currentClass:this.classes[0]
        })
    }
    changeClass(value){
        this.setState({
            currentClass:value
        })
    }
    render(){

        var zoubanExamStudentsInfo = this.props.zoubanExamStudentsInfo;
        var zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo;
        var zuobanLessonQuestionInfo = this.props.zuobanLessonQuestionInfo;
        return (
            <div style={{marginTop:20,position:'relative',height:'34px'}}>
                <span style={{lineHeight:'34px'}}>选择学生：</span>
                <div style={{width:200,display:'inline-block',position:'absolute',zIndex:10,left:68}}>
                    <Select value={this.state.currentClass} placeholder="选择班级" options={this.classes} onChange={this.changeClass.bind(this)}></Select>
                </div>
                <SelectStudent  transforStudentInfo={this.props.transforStudentInfo} currentLesson={this.currentLesson} currentClass={this.state.currentClass} zoubanExamInfo={this.zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo}zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} />
            </div>
        )
    }
}
class SelectStudent extends React.Component{
    constructor(props) {
        super(props);
    this.currentClass = this.props.currentClass;
    this.currentLesson = this.props.currentLesson;
    this.zoubanExamStudentsInfo = this.props.zoubanExamStudentsInfo;
    this.zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo;
    this.students = getStudents(this.currentLesson,this.currentClass,this.zoubanExamStudentsInfo,this.zoubanLessonStudentsInfo);
    this.state = {
        currentStudent:this.students[0]
    }
    }
    componentWillReceiveProps(nextProps){
        this.currentClass = nextProps.currentClass;
        this.currentLesson = nextProps.currentLesson;
        this.zoubanExamStudentsInfo = nextProps.zoubanExamStudentsInfo;
        this.zoubanLessonStudentsInfo = nextProps.zoubanLessonStudentsInfo;
        this.students = getStudents(this.currentLesson,this.currentClass,this.zoubanExamStudentsInfo,this.zoubanLessonStudentsInfo);
        this.setState ({
            currentStudent:this.students[0]
        })
    }
    changeStudent(newStudent){
        this.setState({
            currentStudent:newStudent
        })
        console.log(newStudent);
        this.props.transforStudentInfo(this.state.currentStudent,this.currentClass);
    }
    render(){
        var zoubanExamInfo = this.props.zoubanExamInfo;
        var zuobanLessonQuestionInfo = this.props.zuobanLessonQuestionInfo;

        return (
            <div style={{width:200,display:'inline-block',position:'absolute',zIndex:10,top:0,left:300}}>
                <Select value={this.state.currentStudent} placeholder="选择学生" options={this.students} onChange={this.changeStudent.bind(this)}></Select>
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        zoubanExamInfo: state.zouban.zoubanExamInfo,
        zoubanExamStudentsInfo: state.zouban.zoubanExamStudentsInfo,
        zoubanLessonStudentsInfo: state.zouban.zoubanLessonStudentsInfo,
        zuobanLessonQuestionInfo: state.zouban.zuobanLessonQuestionInfo
    }
}

function getLessons(zoubanExamInfo){
    var lessons = _.map(zoubanExamInfo.lessons,function(lesson){
        return {
            key:lesson.objectId,
            label:lesson.name
        }
    });
    return lessons;
}
function getClasses(currentLesson,zoubanExamInfo){
    var temp = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).classes;
    var classes = _.map(temp,(obj)=>{
        return {
            key:obj,
            label:obj
        }
    });
    return classes;
}
function getStudents(currentLesson,currentClass,zoubanExamStudentsInfo,zoubanLessonStudentsInfo){
     var students = _.map(zoubanLessonStudentsInfo[currentLesson.key][currentClass.key],function(student){

        var studentName = (_.find(zoubanExamStudentsInfo,function(obj){
            return obj.id===student.id;
        })).name;
        return {
            key:student.id,
            label:studentName
        }
    });
    return students;
}
