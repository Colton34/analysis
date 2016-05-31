import React from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {List} from 'immutable';

import MainPage from '../../components/customizeAnalysis/MainPage';
import SubjectInput from '../../components/customizeAnalysis/SubjectInput';
import ExamSelect from '../../components/customizeAnalysis/ExamSelect';
import QuestionConfirm from '../../components/customizeAnalysis/QuestionConfirm';
import StudentConfirm from '../../components/customizeAnalysis/StudentConfirm';
import Header from '../../components/customizeAnalysis/Header';
import Footer from '../../components/customizeAnalysis/Footer';

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
        this.state = {
            pageIndex: 0,        //当前页面索引0,1,2,3,4
            status: '',          //页面状态'create' or ''
            currentSubject: { src: {}, groupMap: {}, name: '' },       //当前正在操作的科目所有信息,包括名称,来源,合并方式,以及最终结果, 称为subjectTrace
            resultSet: {
            },       //已经编辑完成的科目,内部是 subjectName : subjectTrace
            analysisName: ''

        }
    }
    getAnalysisName(name) {
        console.log('================== analysis name:' + name);
        this.setState({
            analysisName: name
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })


    }
    changeToCreateStatus() {
        this.setState({
            status: 'create'
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    changeCurrentSubjectName(name) {
        console.log('======== subject name: ' + name);
        var newCurrentSubject = this.state.currentSubject;
        newCurrentSubject.name = name;
        this.setState({
            currentSubject: newCurrentSubject
        }, () => {
            console.log('================== currentSubject:' + JSON.stringify(this.state.currentSubject));
        })
    }
    onDiscardCurrent() {
        console.log('in discard current function');
        this.setState({
            status: '',
            currentSubject: {},
            pageIndex: 0
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    onBackHomePage() {
        location.href = '/';
    }
    onPrevPage() {
        console.log('in onPrevPage function');
        var {pageIndex} = this.state;
        if (pageIndex === 0) return;
        this.setState({
            pageIndex: (pageIndex - 1)
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    onNextPage() {
        console.log('in onNextPage funciton');
        var {pageIndex} = this.state;
        if (pageIndex === 3) {
            var {resultSet, currentSubject} = this.state;
            resultSet[currentSubject.name] = currentSubject;
            this.setState({
                pageIndex: 0,
                status: '',
                currentSubject: {},
                resultSet: resultSet
            }, () => {
                console.log('================== state:' + JSON.stringify(this.state));
            })
        } else {
            this.setState({
                pageIndex: pageIndex + 1
            }, () => {
                console.log('================== state:' + JSON.stringify(this.state));
            })
        }
    }
    onEditSubject(subjectName) {
        console.log('subjectName:' + subjectName);
        var subjectObj = this.state.resultSet[subjectName];
        this.setState({
            currentSubject: subjectObj,
            status: 'create',
            pageIndex: 0
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    onDelSubject(subjectName) {
        console.log('on delete subject:' + subjectName);
        if (!this.state.resultSet[subjectName]) return;
        var {resultSet} = this.state;
        delete resultSet[subjectName];
        this.setState({
            resultSet: resultSet
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    saveExamInfos(currenPapers, mergedSQM) {
        var {currentSubject} = this.state;
        currentSubject.src = currenPapers;
        currentSubject.SQM = mergedSQM;
        this.setState({
            currentSubject: currentSubject
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    onChangeGroupMap(groupMap) {
        var {currentSubject} = this.state;
        currentSubject.groupMap = groupMap;
        this.setState({
            currentSubject: currentSubject
        }, () => {
            console.log('================== state:' + JSON.stringify(this.state));
        })
    }
    onChangeQuestionName(oldName, newName) {
        var {currentSubject} = this.state;
        for (var i = 0; i < currentSubject.SQM.x.length; i++) {
            if (currentSubject.SQM.x[i].name === oldName) {
                currentSubject.SQM.x[i].name = newName;
                break;
            }
        }
        this.setState({
            currentSubject: currentSubject
        })

    }
    render() {
        var {status, pageIndex} = this.state;
        var examList = (List.isList(this.props.examList)) ? this.props.examList.toJS() : this.props.examList;
        var customExamList = [];
        _.each(examList, (obj, index) => {
            customExamList = _.concat(customExamList, obj.values);
        });

        return (
            <div style={{ width: 1000, minHeight: 600, margin: '20px auto', background: '#fff', paddingBottom: 30 }}>
                <Header pageIndex={this.state.pageIndex} status={this.state.status} onDiscardCurrent={this.onDiscardCurrent.bind(this) } onBackHomePage={this.onBackHomePage}/>
                {
                    status !== 'create' &&
                    <MainPage resultSet={this.state.resultSet} analysisName={this.state.analysisName} getAnalysisName={this.getAnalysisName.bind(this) }
                        changeToCreateStatus={this.changeToCreateStatus.bind(this) } onEditSubject={this.onEditSubject.bind(this) } onDelSubject={this.onDelSubject.bind(this) }/>

                }
                {
                    status === 'create' && pageIndex === 0 &&
                    <SubjectInput onNextPage={this.onNextPage.bind(this) } subjectList={Object.keys(this.state.resultSet) }
                        currentSubject={this.state.currentSubject} changeCurrentSubjectName={this.changeCurrentSubjectName.bind(this) } pageIndex={this.state.pageIndex}/>

                }
                {

                    status === 'create' && pageIndex === 1 &&
                    <ExamSelect examList={customExamList} pageIndex={this.state.pageIndex} onPrevPage={this.onPrevPage.bind(this) }
                        onNextPage={this.onNextPage.bind(this) } saveExamInfos={this.saveExamInfos.bind(this) } currentSubject= {this.state.currentSubject}/>

                }
                {

                    status === 'create' && pageIndex === 2 &&
                    <QuestionConfirm pageIndex={this.state.pageIndex} onPrevPage={this.onPrevPage.bind(this) } onNextPage={this.onNextPage.bind(this) }
                        mergedSQM={this.state.currentSubject.SQM} onChangeQuestionName={this.onChangeQuestionName.bind(this) }/>


                }
                {
                    status === 'create' && pageIndex === 3 &&
                    <StudentConfirm  pageIndex={this.state.pageIndex} onPrevPage={this.onPrevPage.bind(this) } onNextPage={this.onNextPage.bind(this) }
                        onChangeGroupMap={this.onChangeGroupMap.bind(this) } currentSubject={this.state.currentSubject}/>

                }


            </div>
        )
    }
}



export default connect(mapStateToProps)(CustomizeAnalysis);

function mapStateToProps(state) {
    return {
        examList: state.home.examList
    }
}
