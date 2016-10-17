import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import DropdownList from '../../../common/DropdownList';
import ExamScore from './ExamScore';
import SubjectCompare from './SubjectCompare';
import QuestionAnalysis from './QuestionAnalysis';
import KnowledgePointAnalysis from './KnowledgePointAnalysis';
export default class StudentPersonalModule extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        return (
            <div>
                <div className={commonClass['section']}>
                <div>
                    <span>选择学科：</span>
                    <div style={{width:200,display:'inline-block',position:'absolute',zIndex:10}}><DropdownList list={subjects} surfaceBtnStyle={_.assign({ width:'200px',height:'22px',lineHeight:'22px',borderRadius:0,border:'1px solid rgb(242,242,242)',color:'#333'})}/></div>

                </div>
                <div style={{marginTop:20,position:'relative'}}>
                    <span>选择学生：</span>
                    <div style={{width:200,display:'inline-block',position:'absolute',zIndex:10,left:68}}><DropdownList list={classes} surfaceBtnStyle={_.assign({ width:'200px',height:'22px',lineHeight:'22px',borderRadius:0,border:'1px solid rgb(242,242,242)',color:'#333'})}/></div>
                    <div style={{width:200,display:'inline-block',position:'absolute',zIndex:10,top:0,left:300}}><DropdownList list={students} surfaceBtnStyle={_.assign({ width:'200px',height:'22px',lineHeight:'22px',borderRadius:0,border:'1px solid rgb(242,242,242)',color:'#333'})}/></div>
                </div>
                </div>
                <ExamScore></ExamScore>
                <SubjectCompare></SubjectCompare>
                <QuestionAnalysis></QuestionAnalysis>
                <KnowledgePointAnalysis></KnowledgePointAnalysis>
            </div>
        );
    }
}
var  subjects=[{
    key:'chinese',value:'语文'
},
{
    key:'math',value:'数学'
}];
var  classes = [{
    key:'weixu',value:'10_魏旭'
},{
    key:'weixu1',value:'10_魏旭1'
}];
var  students = [{
    key:'xiaoding',value:'小丁'
},{
    key:'zhangmeng',value:'张萌'
}];
