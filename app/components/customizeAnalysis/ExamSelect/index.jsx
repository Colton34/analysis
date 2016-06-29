/**
 * todos:
 * daterangepicker;
 * label style for input checkbox;
 * upload download buttons' style;
 * alert -> dialog;
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import Radium from 'radium';
import _ from 'lodash';
import moment from 'moment';
import {Map} from 'immutable';

import {
    addPaperInfoAction,
    subtractPaperInfoAction,
    checkAllQuestionAction,
    checkOneQuestionAction,
    setPaperSqmAction,
    setMergedSqmAction
} from '../../../reducers/customAnalysis/actions';
import PageFooter from '../Footer';
import {FROM_FLAG as fromFlag} from '../../../lib/constants';
import matrixBase from '../../../lib/matrixBase.js';

import {initParams, saveAs} from '../../../lib/util';
import ownClassNames from './examSelect.css';

var {Header, Title, Body, Footer} = Modal;

var FileUpload = require('../../../common/FileUpload');
import {FROM_YUJUAN_TEXT, FROM_CUSTOM_TEXT, PAPER_ORIGIN} from '../../../lib/constants';
import InfoDialog from '../../../common/InfoDialog';

var examList = [
    {
        name: '2016年永丰中学第六次月考',
        event_time: '2016-05-10T05:50:00.000Z',
        from: 1,
        id: 16789,
        grade: '初三',
        '[papers]': [ //注意：这里修改属性名'[papers]'为'papers'
            {
                subject: '数学',
                id: '5732ae730000051411235472'
            }, {
                subject: '语文',
                id: '5733042b0000051411238c7f'
            }
        ]
    }
]

//如果是联考，studentInfos每个元素会有一个school属性
var paperInfos = {
    '5732ae730000051411235472': {
        x: [{ "name": "第1题", "score": 2 }, { "name": "第2题", "score": 2 }, { "name": "第3题", "score": 2 }, { "name": "第4题", "score": 2 }, { "name": "第5题", "score": 2 }],
        y: [{ "name": "曾佳", "kaohao": "10210", "class": "2", "id": 3593903, "score": 100 }, { "name": "田雨灵", "kaohao": "10307", "class": "3", "id": 3593940, "score": 100 }, { "name": "梁家警", "kaohao": "10313", "class": "3", "id": 3593946, "score": 100 }, { "name": "罗治湘", "kaohao": "10609", "class": "6", "id": 3594065, "score": 100 }, { "name": "龚嘉欣", "kaohao": "10530", "class": "5", "id": 3594044, "score": 100 }],
        m: [[2, 2, 2, 1, 2], [2, 0, 2, 2, 2], [1, 2, 2, 2, 2], [2, 0, 2, 0, 2], [1, 2, 2, 2, 2]]
    },
    '5733042b0000051411238c7f': {
        x: [{ "name": "第1题", "score": 3 }, { "name": "第2题", "score": 2 }, { "name": "第3题", "score": 7 }, { "name": "第4题", "score": 2 }, { "name": "第5题", "score": 2 }],
        y: [{ "name": "曾佳", "kaohao": "10210", "class": "2", "id": 3593903, "score": 100 }, { "name": "田雨灵", "kaohao": "10307", "class": "3", "id": 3593940, "score": 100 }, { "name": "梁家警", "kaohao": "10313", "class": "3", "id": 3593946, "score": 100 }, { "name": "罗治湘", "kaohao": "10609", "class": "6", "id": 3594065, "score": 100 }, { "name": "龚嘉欣", "kaohao": "10530", "class": "5", "id": 3594044, "score": 100 }],
        m: [[2, 2, 4, 1, 2], [3, 0, 7, 2, 2], [1, 2, 2, 2, 2], [2, 1, 7, 0, 2], [3, 2, 2, 2, 2]]
    }
}

var MERGE_TYPE = {
    same: 0,
    merge: 1,
    accumulate: 2,
    zipAsOne: 3

}

/**
 * props:
 * isLiankao: 是否联考
 * pageIndex: 当前的页码；
 * onPrevPage: '上一步'回调函数
 * onNextPage: '下一步'回调函数
 * currentSubject: 当前分析数据
 * resultSet: 暂存各科目数据的结构；
 */
class ExamSelect extends React.Component {
    constructor(props) {
        super(props);
        //var {currentSubject} = this.props;

        this.state = {
            //currentPapers: currentSubject.src ? currentSubject.src : {},
            showDialog: false,
            showInfoDialog: false,
            startDate: moment().month(moment().month() - 12),  //默认显示一年内的考试
            endDate: moment(),
            examList: this.props.examList,
            infoDialogMsg: ''
        }
    }
    componentDidMount() {
        this.getExamList();
    }
     /**
     * 计算每个paper的SQM，准备合并
    */
    onNextPage() {
       var currentPapers = this.props.currentSubject.src;
        var sqmMap = {};

        for (var paperId in currentPapers) {
            var currentPaper = currentPapers[paperId];
            var {examName, paperName} = currentPaper;
            var questions = [];
            _.forEach(currentPaper.oriSQM.x, questionInfo => {
                if (questionInfo.selected)
                    questions.push(questionInfo.name);
            })
            //currentPaper.SQM = matrixBase.getByNames(currentPaper.oriSQM, 'col', 'name', questions);
            var SQM = matrixBase.getByNames(currentPaper.oriSQM, 'col', 'name', questions);
            if (SQM) {
                _.forEach(SQM.x, questionInfo => {
                    questionInfo.exam = examName;
                    questionInfo.paper = paperName;
                })
                //sqmList.push({ sqm: SQM, pid: paperId });
                sqmMap[paperId] = SQM;
            }
        }
        //this.props.setPaperSqm(sqmList)
        var manfen,
            hasZipAsOne = true,
            tmpManfen = -999999,
            legalSQMs = [];
        _.each(sqmMap, (sqm, paperId) => {
            var SQM = sqm;
            if (SQM && SQM.x) {

                legalSQMs.push(SQM);
                manfen = 0;

                _.forEach(SQM.x, item => {
                    manfen += item.score;
                });
                if (tmpManfen === -999999) {
                    tmpManfen = manfen;
                }
                if (tmpManfen !== manfen) {
                    hasZipAsOne &= false;
                }
            }
        })
        if (legalSQMs.length === 0) {
            this.setState({
                showInfoDialog: true,
                infoDialogMsg: '请先选择考试题目'
            })
        } else if (legalSQMs.length === 1) {
            this.setState({
                sqmMap: sqmMap
            }, ()=>{
                this.doMerge(MERGE_TYPE.same, legalSQMs);
            })
        } else {
            this.setState({
                showDialog: true,
                hasZipAsOne: hasZipAsOne,
                legalSQMs: legalSQMs,
                sqmMap: sqmMap
            }, () => {
                console.log('============== after set showDialog:' + this.state.showDialog);
            })
        }
        //在doMerge方法中调用this.props.onNextPage()
    }

    // 选中某个请先选择考试题目请先选择考试题目时载入该科目的数据；
    onSelectPaper(exam, event) {
        //对所选择的paper加是不是和当前所有的paper都是同属于一个年级的校验！思路--进入到选择考试页后，一旦开始选择了一个，则设置currentGrade，然后再
        //选择其他的paper的时候，比对paper.grade和currentGrade是不是一样，不一样则给错误提示。如果选择的paper都清空了，则currentGrade也清空，从而能修改设置
        //新的年级~注意：年级是针对exam的，而这里一次选择只是针对一个科目的（一个科目肯定要保证所勾选的是同一年级），但是不同科目同样也要保证是同一年级！所以这个
        //currentGrade应该是resultSet里的一个直属属性--它指代了resultSet中所有分析的科目都是来自同一年级。

// console.log(exam);
// console.log(event);

        //对一个paper的checkbox交互，判断是增加还是减少，执行相应的action，从而执行相应的更新操作
        var checked = event.target.checked;
        var paperId = event.target.value;

        if (checked) {
            var $target = $(event.target);
            var $parent = $target.parents('.exam-item');
            var examName = $parent.find('.exam-name').text();
            var paperOrigin = PAPER_ORIGIN.system;
            var paperName = $target.data('subject');
            var paperGrade = $target.data('grade');

            //校验是否同一年级
            if (!this.isGradeValid(paperGrade)) {
                return;
            }

            var isFromCustom = (exam.from === 40);
            var paperInfo = {
                isFromCustom: isFromCustom,
                examId: exam.id,
                origin: paperOrigin,
                paperId: paperId,
                examName: examName,
                paperName: paperName,
                grade: paperGrade
            }
            var {papersCache} = this.props;
            papersCache = Map.isMap(papersCache) ? papersCache.toJS() : papersCache;
            this.props.addPaperInfo(papersCache, paperInfo);
        } else {
            this.props.subtractPaperInfo(paperId);
        }
    }

    onCheckAllQuestions(ref, event) {
        var checked = event.target.checked;
        this.refs[ref].checked = checked;
        var paperId = event.target.value;
        this.props.checkAllQuestion(paperId, checked);
    }

    onCheckQuestion(ref, event) {
        // 获得当前题目的基本信息： 属于哪个paper， 它的题号是多少；
        // 根据paperId， 找到currenPapers中的paper，然后根据题号找到当前题号;
        // 修改题号的选中信息， 然后修改整体的state；

        var questionInfo = event.target.value;
        var paperId = questionInfo.split('-')[0];
        var questionName = questionInfo.split('-')[1];
        var checked = event.target.checked;
        this.props.checkOneQuestion(paperId, questionName, checked);
    }

    doMerge(mergeType, SQMs) {
        console.log('merge matrix');
        // todo: 合并题目
        var
            finSQM,
            count = 1;

        switch (mergeType) {
            case MERGE_TYPE.same: {
                finSQM = SQMs[0];
                break;
            }
            case MERGE_TYPE.merge: {
                finSQM = matrixBase.mergeMatrices(SQMs, 1, 'name', 'kaohao');
                break;
            }
            case MERGE_TYPE.accumulate: {
                finSQM = matrixBase.mergeMatrices(SQMs, 2, 'name', 'kaohao');
                break;
            }
            case MERGE_TYPE.zipAsOne: {
                SQMs = _.map(SQMs, function (sqm) {
                    var
                        examName = sqm.x[0].exam,
                        paperName = sqm.x[0].paper,
                        score = sqm.hasOwnProperty('x') ? sqm.x.reduce(function(sum, each){ return sum + each.score}, 0) : 0,
                        result = matrixBase.sumByOrie(sqm, '第1题', 'row');



                    result['x'][0]['exam'] = examName;
                    result['x'][0]['paper'] = paperName;
                    result['x'][0]['score'] = score;
                    return result
                });
                finSQM = matrixBase.mergeMatrices(SQMs, 1, 'name', 'kaohao');
                break;
            }
        }

        _.each(finSQM.x, function (item) {
            item.default = "第" + (count++) + "题";
        });
        //console.log('========== merge result: ' + JSON.stringify(finSQM));
        var {currentSubject} = this.props;
        if (mergeType === currentSubject.mergeType && currentSubject.SQM !== undefined && !this.diff(finSQM.x, currentSubject.SQM.x)) {
            this.props.onNextPage();
            return;
        }
        // 保存finSQM & 每个paper的SQM
        this.props.setMergedSqm(finSQM, this.state.sqmMap, mergeType);
        this.props.onNextPage();
    }
    onHideDialog() {
        this.setState({ showDialog: false });
    }
    onHideInfoDialog() {
        this.setState({showInfoDialog: false});
    }
    handleChangeStart(date) {
        var self = this;
        this.setState({
            startDate: date
        }, () => {
            self.getExamList();
        })
    }
    handleChangeEnd(date) {
        var self = this;
        this.setState({
            endDate: date
        }, () => {
            self.getExamList();
        })
    }
    getExamList() {
        var {startDate, endDate} = this.state;
        var newList = _.filter(this.props.examList, exam => {
            return moment(exam.time) >= startDate && moment(exam.time) <= endDate
        })
        this.setState({
            examList: newList
        })
    }

    downloadTPL(isLiankao) {
        console.log('downloadTPL');
        var path = isLiankao ? '/file/download/tpl?liankao=true' : '/file/download/tpl';
        saveAs(window.request.defaults.baseURL+path);
    }

    isGradeValid(paperGrade) {
        var {currentSubject, resultSet} = this.props;
        if (currentSubject.grade !== '' && currentSubject.grade !== paperGrade) {
            this.setState({
                infoDialogMsg: '请选择同一年级的考试',
                showInfoDialog: true
            })
            return false;
        }
        if (_.keys(resultSet).length !== 0) {
            for (var subjectName in resultSet) {
                if (resultSet[subjectName].grade !== paperGrade) {
                    this.setState({
                        infoDialogMsg: '科目: ' + subjectName + ', 已选择年级：' + resultSet[subjectName].grade + ',请选择相同年级.',
                        showInfoDialog: true
                    })
                    return false;
                } else {
                    return true;
                }
            }
        }
        return true;
    }

    onDelUploadPaper(event) {
        var paperId = $(event.target).data('paperid');
        this.props.subtractPaperInfo(paperId + '');
    }

    /**
     * 比较两个SQM.x对象是否有差别, 忽略'default'字段
     */
    diff(x1, x2){
        var result = true;
        if(x1 && x2 && x1.length === x2.length){
            for(var i in x1){
                result &= x1[i].exam == x2[i].exam &&
                x1[i].name == x2[i].name &&
                x1[i].paper == x2[i].paper &&
                x1[i].score == x2[i].score;
                if(!result){
                    break;
                }
            }
        }else{
            result = false;
        }

        return !result;
    }
    render() {
        //var selectedExams = Object.keys(this.state.selectedExamInfos);
        var {currentSubject} = this.props;
        var currentPapers = Map.isMap(currentSubject) ? currentSubject.toJS().src : currentSubject.src;
        var {examList} = this.state;

        var paperIds = Object.keys(currentPapers);
        var _this = this;
        var options = {
            baseUrl : '/api/v1/file/import/exam/data',
            chooseAndUpload : true,
            fileFieldName : 'importData', //指定上传文件的名字，而不是使用默认的呃file.name，这个名字和multer的single对应。
            chooseFile : function(files){
                console.log('filename',typeof files == 'string' ? files : files[0].name);
            },
            uploading : function(progress){
                console.log('loading...',progress.loaded/progress.total+'%');
            },
            uploadSuccess : function(resp){
                /*通过mill找到对应的文件，删除对应tmpFile*/
                // 检查是否同一年级
                if (!_this.isGradeValid(resp.grade)) {
                    return;
                }
                // 填充currentPaper
                var paperInfo = {
                    isFromCustom: false,
                    origin: PAPER_ORIGIN.upload,
                    paperId: _.now(),
                    paperName: resp.subject,
                    examName: '自定义考试数据',
                    grade: resp.grade,
                    sqm: resp.matrix
                }
                //为统一reducer处理
                paperInfo.sqm.id = paperInfo.paperId;
                var {papersCache} = _this.props;
                papersCache = Map.isMap(papersCache) ? papersCache.toJS() : papersCache;
                _this.props.addPaperInfo(papersCache, paperInfo);
                console.log('upload success', resp);
            },
            uploadError : function(err){
                console.log('Error: ', err);
            },
            uploadFail : function(resp){
                console.log('Fail: ', resp);
            }
        };
        return (
            <div>
                <div className={ownClassNames['container']}>
                    <div className={'col-md-5'}>
                        <div style={{ marginBottom: 30 }}>
                            <DatePicker
                                selected={this.state.startDate}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeStart.bind(this) } />
                            <DatePicker
                                selected={this.state.endDate}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeEnd.bind(this) } />
                        </div>

                        <div id='examList'>
                            {
                                examList.map((exam, index) => {
                                    var date = new Date(exam.time);

                                    return (
                                        <div className='exam-item' key={'exam-' + index}>
                                            <p id={exam.id} className='exam-name' style={{ marginBottom: 4 }}>{exam.examName}</p>
                                            <ul className={ownClassNames['exam-summary']}>
                                                <li className={ownClassNames['exam-info-li']}>{date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate() + 1) }</li>
                                                <li className={ownClassNames['exam-info-li']}>{exam.grade}</li>
                                                <li className={ownClassNames['exam-info-li'] + ' ' + 'paper-from'}>来自<span style={exam['from'] == 1 ? {} : { color: '#f9d061' }}>{fromFlag[exam['from']]}</span></li>
                                            </ul>
                                            <ul className={ownClassNames['subjects']}>
                                                {
                                                    exam['papers'].map((paper, index) => {
                                                        return (
                                                            <li key={'subject-' + index} className={ownClassNames['subject-li']}>
                                                                <div className={ownClassNames['checkbox']}>
                                                                    <input id={'checkbox-subject-' + index} type='checkbox' value={paper.id} data-subject={paper.subject} data-grade={exam.grade}
                                                                        onChange={this.onSelectPaper.bind(this, exam) }checked={paperIds.indexOf(paper.id) !== -1 ? true : false}/>
                                                                    <label for={'checkbox-subject-' + index}/>
                                                                    <span>{paper.subject}</span>
                                                                </div>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className={'col-md-7'}>
                        <div style={{ marginBottom: 20, position: 'relative'}}>
                            {
                                this.props.isLiankao ?
                                    <button style={{position: 'absolute', top: 0}} onClick={this.downloadTPL.bind(this, true)} className={ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2-primary']}>下载联考导入模板</button>
                                    : <button style={{position: 'absolute', top: 0}} onClick={this.downloadTPL.bind(this, false)} className={ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2-primary']}>下载校考导入模板</button>
                            }
                            <FileUpload options={options} style={{display: 'inline-block'}}>
                                <button ref="chooseAndUpload" className={ownClassNames['fileUpload'] + ' ' + ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn-primary']} style={{ fontSize: 12, marginLeft: 125}}>
                                    导入线下考试数据
                                </button>
                            </FileUpload>
                        </div>
                        <div className={ownClassNames['right-main']}>
                            {
                                paperIds.map((paperId, index) => {
                                    var isAllChecked = true;
                                    _.forEach(currentPapers[paperId].oriSQM.x, (questionInfo) => {
                                        if (questionInfo.selected === undefined)
                                            questionInfo.selected = true;
                                        isAllChecked &= questionInfo.selected;
                                    })
                                    return (
                                        <div key={'qblock-' + index} className={ownClassNames['data-question-list']} data-paperId={paperId} >
                                            <div style={{ marginBottom: 20 }}>
                                                <span className={ownClassNames['qblock-name']}>{currentPapers[paperId].paperName + ':' + currentPapers[paperId].examName}</span>
                                                <div className={ownClassNames['checkbox']} style={{ width: 76 }}>
                                                    <input type="checkbox" id={"checker-question-all-" + paperId} ref={"checker-question-all-" + paperId} name="checker-question-all" value={paperId}
                                                        onChange={this.onCheckAllQuestions.bind(this, "checker-question-all-" + paperId) } checked={isAllChecked ? true : false} />
                                                    <label for={'checker-question-all-' + paperId}></label>
                                                    <span>全选</span>
                                                </div>
                                                {currentPapers[paperId].origin === PAPER_ORIGIN.upload ? <span style={localStyle.paperDelBtn} data-paperid={paperId} onClick={this.onDelUploadPaper.bind(this)}>删除</span>:''}
                                            </div>
                                            <div id={'qlist-' + paperId} style={{ overflow: 'auto' }}>
                                                <ul>
                                                    {
                                                        currentPapers[paperId].oriSQM.x.map((questionInfo, index) => {
                                                            return (
                                                                <li key={'question-list-item-' + index} className={ownClassNames['question-list-item']}>
                                                                    <input  type="checkbox" id={'qlist-item-' + paperId + '-' + questionInfo.name} ref={'qlist-item-' + paperId + '-' + questionInfo.name} value={paperId + '-' +
                                                                        questionInfo.name} onChange={this.onCheckQuestion.bind(this, 'qlist-item-' + paperId + '-' + questionInfo.name) } checked={questionInfo.selected || questionInfo.selected === undefined ? true : false}/>
                                                                    <label for={'qlist-item-' + paperId + ' ' + questionInfo.name } />
                                                                    <span>{questionInfo.name}</span>
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div style={{clear:'both'}}></div>
                </div>
                <PageFooter pageIndex={this.props.pageIndex} onPrevPage={this.props.onPrevPage} onNextPage={this.onNextPage.bind(this) }/>
                <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this) }
                    doMerge={this.doMerge.bind(this) } hasZipAsOne={this.state.hasZipAsOne} legalSQMs={this.state.legalSQMs}/>
                <InfoDialog show={this.state.showInfoDialog} onHide={this.onHideInfoDialog.bind(this)} content={this.state.infoDialogMsg}/>
            </div>
        )
    }

}

@Radium
class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }
    doMerge(type) {
        console.log('type:' + type);
        this.props.doMerge(type, this.props.legalSQMs);
        this.props.onHide();
    }
    render() {

        var _this = this;
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide} bsSize='lg'>
                <Header closeButton style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                    选择合并题目的方式
                </Header>
                <Body className="apply-content">
                    <span className={ownClassNames['merge-tips']}>说明：题目合并是因为，您选择了多个学科，学科下的题目可能不一样，现在提供以下3种方式供您选择</span>
                    <h4>题目合并</h4>
                    <div className={ownClassNames['merge-image']}></div>
                    <br/>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 127 }}>试卷一</span>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 127 }}>试卷二</span>
                    <span className={ownClassNames['merge-tips']}>合并后试卷题目</span>
                    <hr/>
                    <h4>题目累加</h4>
                    <div className={ownClassNames['accumulate-image']}></div>
                    <br/>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 127 }}>试卷一</span>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 147 }}>试卷二</span>
                    <span className={ownClassNames['merge-tips']}>合并后试卷题目</span>
                    <hr/>
                    <h4>将题目合并为一题</h4>
                    <div className={ownClassNames['zipone-image']}></div>
                    <br/>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 127 }}>试卷一</span>
                    <span className={ownClassNames['merge-tips']} style={{ marginRight: 147 }}>试卷二</span>
                    <span className={ownClassNames['merge-tips']}>合并后试卷题目</span>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center' }}>
                    <a key='btn-merge' href="javascript:void(0)" style={localStyle.btn} onClick={this.doMerge.bind(this, MERGE_TYPE.merge) }>
                        题目合并
                    </a>
                    <a key='btn-accu' href="javascript:void(0)" style={localStyle.btn} onClick={this.doMerge.bind(this, MERGE_TYPE.accumulate) }>
                        题目累加
                    </a>
                    {
                        this.props.hasZipAsOne ?
                            <a key='btn-zip' href="javascript:void(0)" style={localStyle.btn} onClick={this.doMerge.bind(this, MERGE_TYPE.zipAsOne) }>
                                将题目合并成一题
                            </a> : ''
                    }
                </Footer>
            </Modal>
        )
    }
}


let localStyle = {
    btn: {
        minWidth: 86,
        height: 32,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'solid',
        textAlign: 'center',
        verticalAlign: 'middle',
        display: 'inline-block',
        padding: '1px 10px',
        cursor: 'pointer',
        backgroundColor: '#54bde7',
        borderColor: '#54bde7',
        color: '#fff',
        marginLeft: 5,
        marginBottom: 0,
        fontSize: 14,
        lineHeight: '32px',

        ':hover': {
            backgroundColor: '#56b5db',
            borderColor: '#56b5db',
            color: '#fff'
        }
    },
    paperDelBtn: {
        float: 'right', minWidth: 10, fontSize: 12, lineHeight: '15px', height: 18, padding: '1px 1px 0 1px', borderColor: '#f16b4d', color: '#f16b4d',backgroundColor: '#fff',
        borderRadius: 2, border: '1px solid', textAlign: 'center', display: 'inline-block', cursor: 'pointer'
    }
}


/**
 * examList从外层给。因为在内层不曾改变examList。而且这样只要不出这个custrom view的路由，那么这个数据结构就能一直用
 */
export default connect(mapStateToProps, mapDispatchToProps)(ExamSelect);

//从外部的props中获取 examList和papersCache
function mapStateToProps(state) {
    return {
        papersCache: state.customAnalysis.papersCache,
        papersInfo: state.customAnalysis.papersInfo
    }
}

function mapDispatchToProps(dispatch) {
    return {
        addPaperInfo: bindActionCreators(addPaperInfoAction, dispatch),
        subtractPaperInfo: bindActionCreators(subtractPaperInfoAction, dispatch),
        checkAllQuestion: bindActionCreators(checkAllQuestionAction, dispatch),
        checkOneQuestion: bindActionCreators(checkOneQuestionAction, dispatch),
        setPaperSqm: bindActionCreators(setPaperSqmAction, dispatch),
        setMergedSqm: bindActionCreators(setMergedSqmAction, dispatch)
    }
}


/*

                                    <span>导入线下考试数据</span>
                                    <input type="file" name="detailScore" id="btn-upload-detail-score-excel" className={ownClassNames['upload-input']}/>

 */
