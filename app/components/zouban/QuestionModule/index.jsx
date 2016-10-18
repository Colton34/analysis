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
var  subjects =[{
    name:'语文',
},{
    name:'数学'
}];
var classes = ['1班','2班','3班'];
class QuestionModule extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <SubjectSelector />
                <PaperClassSelector />
                <QuestionPerformance />
                <QuestionDistribution />
                <QuestionDetail />
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

        return (
            <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                    <span style={{ marginRight: 10}}>学科：</span>
                        {subjects.map((subjectObj, index) => {
                            return (
                                <a key={'papers-' + index}    style={ localStyle.subject}>{subjectObj.name}</a>
                            )
                        })
                    }
                </div>

            </div>

        );
    }
}

class PaperClassSelector extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {

        return (
            <div style={{heigth: 50, lineHeight: '50px',marginTop:0,padding:'0 0 0 30px'}} className={commonClass['section']}>
                <span style={{ float: 'left', marginRight: 10}}>教学班:</span>
                <span style={{float: 'left', width: 800}}>
                    <span style={{display: 'inline-block', marginRight: 30, minWidth: 50}}>
                        <input value='全部' style={{ marginRight: 5, cursor: 'pointer'}} type='checkbox' />
                        <span>全部</span>
                    </span>
                    {
                        classes.map((className, index) => {
                            return (
                                <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                    <input value={className} style={{ marginRight: 5, cursor: 'pointer' }} type='checkbox' />
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
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    },

}
