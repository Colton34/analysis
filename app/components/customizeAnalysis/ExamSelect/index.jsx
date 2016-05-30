/**
 * todos: 
 * daterangepicker; 
 * label style for input checkbox;
 * upload download buttons' style;
 * alert -> dialog;
 */

import React from 'react';
import ownClassNames from './examSelect.css';
import _ from 'lodash';
import PageFooter from '../Footer';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {ExamOrigin} from '../../../lib/constants.js';
import matrixBase from '../../../lib/matrixBase.js';
import { Modal } from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;
import Radium from 'radium';

require('react-datepicker/dist/react-datepicker.css');
var examList = [
    {
        name: '2016年永丰中学第六次月考',
        event_time: '2016-05-10T05:50:00.000Z',
        from: ExamOrigin.YUEJUAN,
        id: 16789,
        grade: '初三',
        '[papers]': [
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
// var examInfos = {
//     '5732ae730000051411235472': {
//         subject: '数学',
//         questionInfos: [{ "name": "第1题", "score": 3, "selected": true}, { "name": "第2题", "score": 3, "selected": true}, { "name": "第3题", "score": 3, "selected": true}, { "name": "第4题", "score": 3, "selected": true}, { "name": "第5题", "score": 3, "selected": true}],
//         studentInfos: [{ "name": "潘琳洁", "kaohao": "130615", "class": "6", "id": 3155561, "score": 118 }, { "name": "陈子彦", "kaohao": "132210", "class": "22", "id": 3156491, "score": 114 }, { "name": "徐伶依", "kaohao": "132252", "class": "22", "id": 3156520, "score": 113 }, { "name": "肖雨儿", "kaohao": "130813", "class": "8", "id": 3155678, "score": 113 }, { "name": "陈远", "kaohao": "132238", "class": "22", "id": 3156513, "score": 113 }, { "name": "祝睿", "kaohao": "130642", "class": "6", "id": 3155577, "score": 112 }, { "name": "徐凯鸿", "kaohao": "130643", "class": "6", "id": 3155578, "score": 112 }, { "name": "黄梦琦", "kaohao": "130644", "class": "6", "id": 3155579, "score": 112 }, { "name": "严博瀚", "kaohao": "132268", "class": "22", "id": 3156532, "score": 112 }]
//     },
//     '5733042b0000051411238c7f': {
//         subject: '语文',
//         questionInfos: [{ "name": "第1题", "score": 1, "selected": true}, { "name": "第2题", "score": 1, "selected": true}, { "name": "第3题", "score": 1, "selected": true}, { "name": "第4题", "score": 1, "selected": true}, { "name": "第5题", "score": 1, "selected": true}, { "name": "第6题", "score": 1, "selected": true}, { "name": "第7题", "score": 1, "selected": true}],
//         studentInfos: [{ "name": "许志鹏", "kaohao": "10336", "class": "3", "id": 3593969, "score": 99 }, { "name": "贺新奕", "kaohao": "10116", "class": "1", "id": 3593867, "score": 97 }, { "name": "彭国阳", "kaohao": "10514", "class": "5", "id": 3594028, "score": 97 }, { "name": "许晓红", "kaohao": "10428", "class": "4", "id": 3594001, "score": 97 }, { "name": "马世景", "kaohao": "10505", "class": "5", "id": 3594019, "score": 97 }, { "name": "吴冠宇", "kaohao": "10435", "class": "4", "id": 3594008, "score": 97 }]
//     }

// }

var PAPER_FROM = {
    system: 'sys',
    upload: 'upload'
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
 */
class ExamSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPapers: this.props.currentSubject.src ? this.props.currentSubject.src : {},// {paperId: {}}的结构
            showDialog: false,
            startDate: moment().month(-1),
            endDate: moment(),
            examList: examList
        }
    }
    onNextPage() {
        this.cacheCurrentSQM();
        this.chooseMergeMethod();

        //在doMerge方法中调用this.props.onNextPage()
    }
    // 选中某个考试科目时载入该科目的数据； 
    onSelectExam(event) {
        var checked = event.target.checked;
        var paperId = event.target.value;
        var {currentPapers} = this.state;

        if (checked) {
            //获取考试数据填入currentPapers
            var $target = $(event.target);
            var $parent = $target.parents('.exam-item');
            var examName = $parent.find('.exam-name').text();
            var paperFrom = $parent.find('.paper-from').text() === '自定义' ? PAPER_FROM.upload : PAPER_FROM.system;
            var paperName = $target.data('subject');
            currentPapers[paperId] = {
                from: paperFrom,
                paperId: paperId,
                oriSQM: paperInfos[paperId],
                examName: examName,
                paperName: paperName
            }
            this.setState({
                currentPapers: currentPapers
            }, () => {
                console.log("================ state:" + JSON.stringify(this.state))
            })
        } else {
            delete currentPapers[paperId];
            this.setState({
                currentPapers: currentPapers
            })
        }
    }

    onCheckAllQuestions(ref, event) {
        var checked = event.target.checked;
        this.refs[ref].checked = checked;
        var paperId = event.target.value;
        if (checked) {
            var {currentPapers} = this.state;
            _.forEach(currentPapers[paperId].oriSQM.x, (questionInfo) => {
                questionInfo.selected = true;
            })
            this.setState({
                currentPapers: currentPapers
            })
        } else {
            var {currentPapers} = this.state;
            _.forEach(currentPapers[paperId].oriSQM.x, (questionInfo) => {
                questionInfo.selected = false;
            })
            this.setState({
                currentPapers: currentPapers
            })
        }

        // var elements = $('#qlist-' + event.target.value).find('input[type="checkbox"]');
        // elements.prop('checked', checked);

    }
    onCheckQuestion(ref, event) {
        // 获得当前题目的基本信息： 属于哪个paper， 它的题号是多少；
        // 根据paperId， 找到currenPapers中的paper，然后根据题号找到当前题号;
        // 修改题号的选中信息， 然后修改整体的state；

        var questionInfo = event.target.value;
        var paperId = questionInfo.split('-')[0];
        var questionName = questionInfo.split('-')[1];
        var {currentPapers} = this.state;
        var checked = event.target.checked;
        //this.refs[ref].checked = checked;
        var len = currentPapers[paperId].oriSQM.x.length;
        for (var i = 0; i < len; i++) {
            var target = currentPapers[paperId].oriSQM.x[i];
            if (target.name === questionName) {
                target.selected = checked;
                break;
            }
        }

        this.setState({
            currentPapers: currentPapers
        })

        // var $elems = $('#qlist-' + examId).find('input[type="checkbox"]');
        // var isAll = true;
        // _.forEach($elems, ($ele) => {
        //     isAll &= $ele.checked;
        // })
        // $('#checker-question-all-' + examId).prop('checked', isAll);
    }
    /**
     * 把当前paper选中的题目保存到src对应的paper的SQM中去, 如果没有选中, 则把src对应的paper清空掉
    */
    cacheCurrentSQM() {

        var grades = [];
        var {currentPapers} = this.state;
        for (var paperId in currentPapers) {
            var currentPaper = currentPapers[paperId];
            var {examName, paperName} = currentPaper;

            var questions = [];
            _.forEach(currentPaper.oriSQM.x, questionInfo => {
                if (questionInfo.selected)
                    questions.push(questionInfo.name);
            })
            currentPaper.SQM = matrixBase.getByNames(currentPaper.oriSQM, 'col', 'name', questions);
            if (currentPaper.SQM) {
                _.forEach(currentPaper.SQM.x, questionInfo => {
                    questionInfo.exam = examName;
                    questionInfo.paper = paperName;
                })
            } else {
                delete currentPapers[paperId];
            }
        }
        this.setState({
            currentPapers: currentPapers
        })

    }
    /**
     * 根据题目勾选情况, 选择题目合并方式
     * @param grades
     */
    chooseMergeMethod() {

        var
            html, buttons, manfen, SQM,
            _this = this,
            hasZipAsOne = true,
            tmpManfen = -999999,
            legalSQMs = [];

        //判断是否可以合并成一题, 条件是所有勾选的试卷满分相同, 否则不能合并为一题
        var {currentPapers} = this.state;

        for (var paperId in currentPapers) {

            SQM = currentPapers[paperId].SQM;

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
        }
        // var bootboxHtml = "<div>" +
        //                     "<span class=\"am-content-tips\">说明：题目合并是因为，您选择了多个学科，学科下的题目可能不一样，现在提供以下3种方式供您选择</span> </div>"
        if (legalSQMs.length === 0) {
            alert('请先选择考试题目');
        } else if (legalSQMs.length === 1) {
            //this.ensureSelectQuestionHandler(MERGE_TYPE.same, legalSQMs);
            this.doMerge(MERGE_TYPE.same, legalSQMs);
        } else {

            // buttons = {
            //     method1: {
            //         label: "题目合并",
            //         className: "fx-btn fx-btn-primary",
            //         callback: function () {
            //             this.ensureSelectQuestionHandler(MERGE_TYPE.merge, legalSQMs);
            //         }
            //     },
            //     method2: {
            //         label: "题目累加",
            //         className: "fx-btn fx-btn-primary",
            //         callback: function () {
            //             this.ensureSelectQuestionHandler(MERGE_TYPE.accumulate, legalSQMs);
            //         }
            //     }
            // };

            // if (hasButton3) {
            //     buttons.method3 = {
            //         label: "将题目合并成一道题",
            //         className: "fx-btn fx-btn-primary",
            //         callback: function () {
            //             this.ensureSelectQuestionHandler(MERGE_TYPE.zipAsOne, legalSQMs);
            //         }
            //     }
            // }

            this.setState({
                showDialog: true,
                hasZipAsOne: hasZipAsOne,
                legalSQMs: legalSQMs
            }, () => {
                console.log('============== after set showDialog:' + this.state.showDialog);
            })
            // bootbox.dialog({
            //     title: "选择合并题目的方式",
            //     message: bootboxHtml,
            //     size: 'large',
            //     buttons: buttons
            // });
        }
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
                        score = profile(sqm).manfen,
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
        console.log('========== merge result: ' + JSON.stringify(finSQM));
        // 保存currentPapers、合并结果到上层的状态中
        this.props.saveExamInfos(this.state.currentPapers, finSQM);
        // 跳转到下一页
        this.props.onNextPage();
    }
    onHideDialog() {
        this.setState({ showDialog: false });
    }
    handleChangeStart(date) {
        var self = this;
        this.setState({
            startDate: date
        },()=>{
            self.getExamList();
        })
    }
    handleChangeEnd(date) {
        var self = this;
        this.setState({
            endDate: date
        },() => {
            self.getExamList();
        })
    }
    getExamList() {
        var {startDate, endDate} = this.state;
        var newList = _.filter(examList, exam => {
            return moment(exam.event_time) >= startDate && moment(exam.event_time)  <= endDate
        })
        this.setState({
            examList: newList
        })
    }
    render() {
        //var selectedExams = Object.keys(this.state.selectedExamInfos);
        var {currentPapers, examList} = this.state;
        var paperIds = Object.keys(currentPapers);

        return (
            <div>
                <div className={ownClassNames['container']}>
                    <div className={'col-md-5'}>
                        <div style={{marginBottom: 30}}>
                            <DatePicker
                                selected={this.state.startDate}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeStart.bind(this)} />
                            <DatePicker
                                selected={this.state.endDate}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeEnd.bind(this)} />
                        </div>

                        <div id='examList'>
                            {
                                examList.map((exam, index) => {
                                    var date = new Date(exam.event_time);
                                    var fromYuejuan = (exam['from'] === ExamOrigin.YUEJUAN ? true : false);
                                    return (
                                        <div className='exam-item' key={'exam-' + index}>
                                            <p id={exam.id} className='exam-name' style={{ marginBottom: 4 }}>{exam.name}</p>
                                            <ul className={ownClassNames['exam-summary']}>
                                                <li className={ownClassNames['exam-info-li']}>{date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + (date.getDate()) }</li>
                                                <li className={ownClassNames['exam-info-li']}>{exam.grade}</li>
                                                <li className={ownClassNames['exam-info-li'] + ' ' + 'paper-from'}>来自<span style={fromYuejuan ? {} : { color: '#f9d061' }}>{fromYuejuan ? '阅卷' : '自定义'}</span></li>
                                            </ul>
                                            <ul className={ownClassNames['subjects']}>
                                                {
                                                    exam['[papers]'].map((paper, index) => {
                                                        return (
                                                            <li key={'subject-' + index} className={ownClassNames['subject-li']}>
                                                                <div className={ownClassNames['checkbox']}>
                                                                    <input id={'checkbox-subject-' + index} type='checkbox' value={paper.id} data-subject={paper.subject}
                                                                        onChange={this.onSelectExam.bind(this) }checked={paperIds.indexOf(paper.id) !== -1 ? true : false}/>
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
                        <div style={{ marginBottom: 20 }}>
                            {
                                this.props.isLiankao ?
                                    <button className={ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2-primary']}>下载联考导入模板</button>
                                    : <button className={ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2-primary']}>下载校考导入模板</button>
                            }
                            <button className={ownClassNames['fileUpload'] + ' ' + ownClassNames['fx-btn'] + ' ' + ownClassNames['fx-btn-primary']} style={{ fontSize: 12 }}>
                                <span>导入线下考试数据</span>
                                <input type="file" name="detailScore" id="btn-upload-detail-score-excel" className={ownClassNames['upload-input']}/>
                            </button>
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
                </div>
                <PageFooter pageIndex={this.props.pageIndex} onPrevPage={this.props.onPrevPage} onNextPage={this.onNextPage.bind(this) }/>
                <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this) }
                    doMerge={this.doMerge.bind(this) } hasZipAsOne={this.state.hasZipAsOne} legalSQMs={this.state.legalSQMs}/>
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
    }
}
export default ExamSelect;