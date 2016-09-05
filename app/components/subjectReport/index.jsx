import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

class SubjectsNav extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        // var authSubjects = [{subject: '语文', pid: '123'}];
        return (
            <div>
                {
                    _.map(this.props.authSubjects, (obj) => {
                        return (
                            <button onClick={this.props.changeSubject.bind(null, obj)}>{obj.subject}</button>
                        )
                    })
                }
            </div>
        );
    }
}

// class SubjectReportContent extends React.Component {
//     constructor(props) {
//         super(props);

//     }

//     render() {
//         return (
//             <div>学科报告内容</div>
//         );
//     }
// }


//1.authSubjects类似headers--是渲染的标准
class ReportContent extends React.Component {
    constructor(props) {
        super(props);
        this.ifShowSubjectNav = (this.props.authSubjects.length > 1);
        this.state = {
            currentSubject: this.props.authSubjects[0]
        };
    }

    onChangeSubject(subjectObj) {
        debugger;
        console.log(subjectObj.subject);
        this.setState({
            currentSubject: subjectObj
        })
    }

    render() {
        return (
            <div>
                {(this.ifShowSubjectNav) ? (<SubjectsNav authSubjects={this.props.authSubjects} changeSubject={this.onChangeSubject.bind(this)} />) : ''}

            </div>
        );
    }
}

export default ReportContent;
