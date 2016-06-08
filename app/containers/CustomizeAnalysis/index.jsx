import React from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Map,List} from 'immutable';

import MainPage from '../../components/customizeAnalysis/MainPage';
import SubjectInput from '../../components/customizeAnalysis/SubjectInput';
import ExamSelect from '../../components/customizeAnalysis/ExamSelect';
import QuestionConfirm from '../../components/customizeAnalysis/QuestionConfirm';
import StudentConfirm from '../../components/customizeAnalysis/StudentConfirm';
import Header from '../../components/customizeAnalysis/Header';
import Footer from '../../components/customizeAnalysis/Footer';

import {initHomeAction} from '../../reducers/home/actions';
import {changeQuesitonNameAction, setGroupMapAction, setPageIndexAction,
        saveCurrentSubjectAction, setAnalysisNameAction, setCreateStatusAction,
        editSubjectAction, delSubjectAction, changeCurrentSubjectNameAction,
        discardCurrentSubjectAction, updateSubjectSqmAction} from '../../reducers/customAnalysis/actions';
import {initParams} from '../../lib/util';
import {NEXT_PAGE,PREV_PAGE} from '../../lib/constants';
import matrixBase from '../../lib/matrixBase';

/**
 * {
 *  timeRange : {startDate : '', endDate : ''},
 *  src : {                 //在合成该科目时的数据源
 *      paperId : {
 *          from : 'sys' or 'upload'
 *          examId : '考试Id(upload类型的可无)'
 *          paperId : '试卷Id(upload类型的可无)'
 *          grade : '年级名称'
 *          examName : '考试名称'
 *          oriSQM : 原始的SQM
 *          SQM : 最终勾选的SQM
 *      }, ...
 *  }
 *  groupMap: 学生按班级分类的map,"确认学生"一步用到
 *  SQM : 合并最终结果
 *  }
 */
class CustomizeAnalysis extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        if(this.props.examList.length === 0) {
            console.log('============ should init home');
            var params = initParams(this.props.params, this.props.location, {'request': window.request});
            this.props.initHome(params);
        }
    }
    
   
    changeCurrentSubjectName(name) {
        console.log('======== subject name: ' + name);
        this.props.changeCurrentSubjectName(name);   
       
    }
   
    onBackHomePage() {
        location.href = '/';
    }
    onPrevPage() {
        console.log('in onPrevPage function');
        var {pageIndex} = this.props;
        if (pageIndex === 0) return;
        this.props.setPageIndex(PREV_PAGE);
    }
    onNextPage() {
        console.log('in onNextPage funciton');
        var {pageIndex} = this.props;
        if (pageIndex === 3) {
            this.props.saveCurrentSubject();
        } else {
            this.props.setPageIndex(NEXT_PAGE);
        }
    }
    onGenerateAnalysis() {
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        for (var subjectName in resultSet) {
            var newSQM = this.deleteStudentFromSQM(resultSet[subjectName])
            this.props.updateSubjectSqm(subjectName, newSQM);
        }
        alert('敬请期待！');
    }
    deleteStudentFromSQM(subject){
        var result = subject.SQM;
        if (subject.groupMap) {
            var students = this.map2Students(subject.groupMap);
            var xuehaoArray = _.map(students, function (item) {
                return item.kaohao;
            });
            result = matrixBase.getByNames(subject.SQM, 'row', 'kaohao', xuehaoArray);
        }
        return result;
    }
    map2Students(map) {
        var res = [];
        for (var i in map) {
            if (map[i].status == 'inUse') {
                res = res.concat(map[i].array);
            }
        }
        return res;
    }
    render() {
        var {status, pageIndex} = this.props;
        var examList = (List.isList(this.props.examList)) ? this.props.examList.toJS() : this.props.examList;
        var currentSubject = Map.isMap(this.props.currentSubject) ? this.props.currentSubject.toJS() : this.props.currentSubject;
        var resultSet = Map.isMap(this.props.resultSet) ? this.props.resultSet.toJS() : this.props.resultSet;
        var customExamList = [];
        _.each(examList, (obj, index) => {
            customExamList = _.concat(customExamList, obj.values);
        });
        return (
            <div style={{ width: 1000, minHeight: 600, margin: '20px auto', background: '#fff', paddingBottom: 30 }}>
                <Header 
                    pageIndex={pageIndex}
                    status={status}
                    onDiscardCurrent={this.props.discardCurrentSubject}
                    onBackHomePage={this.onBackHomePage} />
                {
                    status !== 'create' &&
                    <MainPage 
                        resultSet={resultSet} 
                        analysisName={this.props.analysisName} 
                        setAnalysisName={this.props.setAnalysisName}
                        changeToCreateStatus={this.props.setCreateStatus} 
                        onEditSubject={this.props.onEditSubject} 
                        onDelSubject={this.props.onDelSubject} 
                        onGenerateAnalysis={this.onGenerateAnalysis.bind(this)}/>

                }
                {
                    status === 'create' && pageIndex === 0 &&
                    <SubjectInput 
                        onNextPage={this.onNextPage.bind(this) }
                        subjectList={Object.keys(resultSet)}
                        currentSubject={currentSubject}
                        changeCurrentSubjectName={this.changeCurrentSubjectName.bind(this)}
                        pageIndex={pageIndex} />

                }
                {

                    status === 'create' && pageIndex === 1 &&
                    <ExamSelect 
                        examList={customExamList} 
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        currentSubject={currentSubject}
                        />

                }
                {

                    status === 'create' && pageIndex === 2 &&
                    <QuestionConfirm 
                        pageIndex={pageIndex} 
                        onPrevPage={this.onPrevPage.bind(this) } 
                        onNextPage={this.onNextPage.bind(this) }
                        mergedSQM={currentSubject.SQM} 
                        changeQuestionName={this.props.changeQuesitonName}/>


                }
                {
                    status === 'create' && pageIndex === 3 &&
                    <StudentConfirm  
                        pageIndex={pageIndex}
                        onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) }
                        onChangeGroupMap={this.props.setGroupMap}
                        currentSubject={currentSubject} />
                }


            </div>
        )
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(CustomizeAnalysis);

function mapStateToProps(state) {
    return {
        examList: state.home.examList,
        currentSubject: state.customAnalysis.currentSubject,
        pageIndex: state.customAnalysis.pageIndex,
        resultSet: state.customAnalysis.resultSet,
        analysisName: state.customAnalysis.analysisName,
        status: state.customAnalysis.status
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initHome: bindActionCreators(initHomeAction, dispatch),
        changeQuesitonName: bindActionCreators(changeQuesitonNameAction, dispatch),
        setGroupMap: bindActionCreators(setGroupMapAction, dispatch),
        setPageIndex: bindActionCreators(setPageIndexAction, dispatch),
        saveCurrentSubject: bindActionCreators(saveCurrentSubjectAction, dispatch),
        setAnalysisName: bindActionCreators(setAnalysisNameAction, dispatch),
        setCreateStatus: bindActionCreators(setCreateStatusAction, dispatch),
        onEditSubject: bindActionCreators(editSubjectAction, dispatch),
        onDelSubject: bindActionCreators(delSubjectAction, dispatch),
        changeCurrentSubjectName: bindActionCreators(changeCurrentSubjectNameAction, dispatch),
        discardCurrentSubject: bindActionCreators(discardCurrentSubjectAction, dispatch),
        updateSubjectSqm: bindActionCreators(updateSubjectSqmAction, dispatch)
    }
}