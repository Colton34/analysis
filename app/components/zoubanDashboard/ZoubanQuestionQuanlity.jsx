import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from '../dashboard/dashboard.css';

export default function ZoubanQuestionQuanlity({zoubanExamInfo, zuobanLessonQuestionInfo, goNext}) {
    var simpleLesson = zoubanExamInfo.lessons[0];
    var simpleClass = simpleLesson.classes[0];
    var {goodQuestion,badQuestion} = getCardSummary(zuobanLessonQuestionInfo, simpleClass, simpleLesson);
    debugger;
    return (
        <div style={{display: 'inline-block', height: 317, padding: '0px 10px 0px 0px', cursor: 'pointer'}}  className='col-lg-4' onClick={goNext}>
            <div className='dashboard-card' style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                <CardHeader  />
                <div>
                    <div style={{padding:'20px 0px'}}> <span>学科：</span><span>{simpleLesson.name}</span>,<span>班级：</span><span>{simpleClass}</span></div>
                    <div style={{padding:'10px 0px'}}><span>表现好的题目：</span></div>
                    <div style={{padding:'10px 0px 10px 30px',color: 'rgb(105, 193, 112)'}}><span>{goodQuestion}</span></div>
                    <div style={{padding:'10px 0px'}}><span>表现不足的题目：</span></div>
                    <div style={{padding:'10px 0px 10px 30px',}}><span>{badQuestion}</span></div>
                </div>
            </div>
        </div>
    )
}
class CardHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverLink: false
        }
    }
     onHeaderMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    onHeaderMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        return (
            <Link to={{ pathname: '/rank/report', query: this.props.queryOptions}}
                onMouseEnter={this.onHeaderMouseEnter.bind(this) }
                onMouseLeave={this.onHeaderMouseLeave.bind(this) }
                style={_.assign({}, styles.linkHeader, this.state.hoverLink ? { color: '#27aef8', textDecoration: 'none' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>学科试题质量分析</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </Link>
        )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
}
const styles = {
    linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
};
function getCardSummary(zuobanLessonQuestionInfo, simpleClass, simpleLesson){
    var simpleQuestions = simpleLesson.questions;
    var questionsPerformArry = _.map(zuobanLessonQuestionInfo[simpleLesson.objectId],function(question,index){
        var performance = _.subtract(question[simpleClass].mean, question.lesson.mean);
        return {
            name:simpleQuestions[index].name,
            performance:performance
        }
    });
    var goodQuestion =_.map(_.takeRight(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    var badQuestion = _.map(_.take(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    return {goodQuestion,badQuestion};
}
