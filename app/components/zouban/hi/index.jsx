import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';
import Select from '../../../common/Selector/Select';

import StudentScoreInfo from './StudentScoreInfo';
import StudentSubjectCompare from './StudentSubjectCompare';
import StudentLessonQuestion from './StudentLessonQuestion';

class StudentPersonalModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStudent: {}
        }
    }

    selectStudent(selectedStudent) {
        this.setState({
            currentStudent: selectedStudent
        })
    }

    render() {
        var {zoubanExamInfo, zoubanExamStudentsInfo, zoubanLessonStudentsInfo, zuobanLessonQuestionInfo} = this.props;
        zoubanExamInfo = zoubanExamInfo.toJS(), zoubanExamStudentsInfo = zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = zoubanLessonStudentsInfo.toJS(), zuobanLessonQuestionInfo = zuobanLessonQuestionInfo.toJS();
        debugger;
        return (
            <div>
                <SelectorGroup zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} selectStudent={this.selectStudent.bind(this)} />
                <StudentScoreInfo zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} currentStudent={this.state.currentStudent} />
            </div>
        );
    }
}

export default connect(mapStateToProps)(StudentPersonalModule);
function mapStateToProps(state) {
    return {
        zoubanExamInfo: state.zouban.zoubanExamInfo,
        zoubanExamStudentsInfo: state.zouban.zoubanExamStudentsInfo,
        zoubanLessonStudentsInfo: state.zouban.zoubanLessonStudentsInfo,
        zuobanLessonQuestionInfo: state.zouban.zuobanLessonQuestionInfo
    }
}


class LessonSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Select
                    options={this.props.lessons}
                    value={this.props.currentLesson}
                    onChange={this.props.handleSelectLesson}
                />
            </div>
        );
    }
}

class ClassSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Select
                    simpleValue
                    options={this.props.classes}
                    value={this.props.currentClass}
                    onChange={this.props.handleSelectClass}
                />
            </div>
        );
    }
}

class StudentSelector extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <Select
                    options={this.props.currentClassStudents}
                    value={this.props.currentStudent}
                    onChange={this.props.handleSelectStudent}
                />
            </div>
        );
    }
}


class SelectorGroup extends React.Component {
    constructor(props) {
        super(props);
        this.lessons = _.map(this.props.zoubanExamInfo.lessons, (obj) => _.assign({}, obj, {value: obj.objectId, label: obj.name}));
        this.state = {
            currentLesson: {},
            currentLessonClasses: [],
            currentClass: '',
            currentClassStudents: [],
            currentStudent: {}
        }
    }

    handleSelectLesson(selectedLesson) {
        var currentLessonClasses = _.map(selectedLesson.classes, (className) => {
            return {
                label: className,
                value: className
            }
        });
        this.setState({
            currentLesson: selectedLesson,
            currentLessonClasses: currentLessonClasses,
            currentClass: '',
            currentClassStudents: [],
            currentStudent: {}
        });
    }

    handleSelectClass(selectedClass) {
        debugger;
        var currentClassStudents = _.map(this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId][selectedClass], (obj) => {
            return {
                value: obj.id,
                label: obj.name
            }
        });
        debugger;
        this.setState({
            currentClass: selectedClass,
            currentClassStudents: currentClassStudents,
            currentStudent: {}
        })
    }

    handleSelectStudent(selectedStudent) {
        debugger;
        this.setState({
            currentStudent: selectedStudent
        });
        this.props.selectStudent(selectedStudent);
    }

    render() {
        return (
            <div>
                <LessonSelector placeholder='请选择年级' lessons={this.lessons} currentLesson={this.state.currentLesson} handleSelectLesson={this.handleSelectLesson.bind(this)} />
                <ClassSelector placeholder='请选择班级' classes={this.state.currentLessonClasses} currentClass={this.state.currentClass} handleSelectClass={this.handleSelectClass.bind(this)} />
                <StudentSelector placeholder='请选择学生' currentClassStudents={this.state.currentClassStudents} currentStudent={this.state.currentStudent} handleSelectStudent={this.handleSelectStudent.bind(this)} />
            </div>
        );
    }
}

class PersonalReportContent extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div></div>
        );
    }
}
