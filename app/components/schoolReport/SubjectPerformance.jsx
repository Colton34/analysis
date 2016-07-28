import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';

import Table from '../../common/Table';

import {makeSegmentsStudentsCount} from '../../api/exam';
import {makeSegmentsCount} from '../../api/exam';
import {NUMBER_MAP as numberMap, LETTER_MAP as letterMap, COLORS_MAP as colorsMap, A11, A12, B03, B04, B08, C12, C05, C07} from '../../lib/constants';
import styles from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';
import TableView from './TableView';

var {Header, Title, Body, Footer} = Modal;

var localStyle = {
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'}
}


/**
 * props:
 * show: 是否显示;
 * onHide： 隐藏对话框的回调函数;
 *
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.isValid = _.map(_.range(_.size(this.props.levelPcentages)), (index) => true);
        this.isUpdate = false;
        var percentageLen = this.props.levelPcentages.length;
        this.state = {
            grades: this.props.levelPcentages.slice(1, percentageLen-1), //传入的数组的第一个和最后一个在此没有作用
            hasError: false,
            errorMsg: '',
            invalidIndex: -1
        }
        var examFullMark = 0;
        _.forEach(this.props.examPapersInfo, paperInfo=>{examFullMark += paperInfo.fullMark})
        this.examFullMark = examFullMark;
    }

    okClickHandler() {
        if (this.state.hasError) {
            return;
        }
        var isValid = true;
        var {grades} = this.state;
        var invalidIndex = -1;
        for(let i = 0; i < grades.length; i++) {
            if (isNaN(grades[i])) {
                this.setState({
                    hasError: true,
                    errorMsg:  '等级百分比必须是数字',
                    invalidIndex: i
                })
                return;
            }
        }
        if (grades.length !== 1) {
            isValid = _.every(_.range(grades.length - 1), index => {
                var valid = grades[index] < grades[index + 1];
                invalidIndex = valid ? -1 : index + 1;
                return valid;
            })
        }
        if (!isValid) {
             this.setState({
                hasError: true,
                errorMsg: '等级靠前百分比必须比靠后的高',
                invalidIndex: invalidIndex
            })
            return;
        }
        // 前后补充0和100
        var tmp = _.clone(this.state.grades);
        tmp = [0].concat(tmp);
        tmp.push(100);
        this.props.updateGrades(tmp);
        this.props.onHide();
    }
    onHide() {
        var percentageLen = this.props.levelPcentages.length;
        this.setState({
            grades: this.props.levelPcentages.slice(1, percentageLen-1),
            hasError: false,
            errorMsg: '',
            invalidIndex: -1
        })
        this.isUpdate = false;
        this.isValid = _.map(_.range(_.size(this.props.levelPcentages)), (index) => true);
        this.props.onHide();
    }

    setGradeNum() {
        var gradeNum = parseInt(this.refs['gradeNum'].value);

        if (isNaN(gradeNum)) {
            this.setState({
                hasError: true,
                errorMsg: '输入等级数目错误'
            })
            $(this.refs.gradeNum).css({border: '2px solid ' + colorsMap.B08});
            return;
        } else if(gradeNum > 6){
            this.setState({
                hasError: true,
                errorMsg: '输入等级数目不能大于6' //letterMap支持到6
            })
            $(this.refs.gradeNum).css({border: '2px solid ' + colorsMap.B08});
            return;
        }
        var {grades} = this.state;
        var gradesLen = grades.length;
        if (gradeNum > gradesLen) {
            grades = _.fill(Array(gradeNum - gradesLen), 1).concat(grades);
            this.setState({
                grades: grades,
                hasError: false,
                errorMsg: '',
                invalidIndex: -1
            })
        } else if (gradeNum < gradesLen) {
            this.setState({
                grades: grades.slice(gradesLen-gradeNum, gradesLen), //grdes是倒序
                hasError: false,
                errorMsg: '',
                invalidIndex: -1
            })
        } else if (gradeNum === gradesLen && this.state.hasError) {
            this.setState({
                hasError: false,
                errorMsg: '',
                invalidIndex: -1
            })
        }
        $(this.refs.gradeNum).css({border: '1px solid ' + colorsMap.C05});
    }

    setGrade(ref) {
        var value = parseInt(this.refs[ref].value);
        var {grades} = this.state;
        var index = parseInt(ref.split('-')[1]);
        if (value === grades[index]) return;
        grades[index] = this.refs[ref].value; //先置用户输入的值，如果错误方便显示
        if (isNaN(value)) {
            this.setState({
                hasError: true,
                errorMsg: '等级百分比必须是数字',
                invalidIndex: index
            })
            return;
        }

        // todo: 验证输入的value正确， 首先不能大于100，其次不比前一个大，不比前一个小；
        if (value > 100 || value <= 0) {
            this.setState({
                hasError: true,
                errorMsg: '输入的百分比不正确',
                invalidIndex: index
            })
            return;
        }
        grades[index] = value;
        var isValid = true;
        var invalidIndex = -1;
        if (grades.length !== 1) {
            isValid = _.every(_.range(grades.length - 1), index => {
                var valid = grades[index] < grades[index + 1];
                invalidIndex = valid ? -1 : index + 1;
                return valid;
            })
        }
        if (!isValid) {
            this.setState({
                hasError: true,
                errorMsg: '等级靠前百分比必须比靠后的高',
                invalidIndex: invalidIndex
            })
            return;
        }
        var errorState = {};
        errorState =  _.assign({}, (this.state.hasError || (index === this.state.invalidIndex)) ? {hasError: false, errorMsg: '', invalidIndex: -1} : {});

        this.setState(_.assign({grades: grades}, errorState));
    }
    render() {
        var _this = this, gradeLastIndex = this.state.grades.length - 1;
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.onHide.bind(this)}>
                <Header closeButton={false} style={{textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                    <button className={styles['dialog-close']} onClick={this.onHide.bind(this)}>
                        <i className='icon-cancel-3'></i>
                    </button>
                    设置等级参数
                </Header>
                <Body style={{padding: 30}}>
                    <div style={{ minHeight: 230 }}>
                        <div style={{marginBottom: 30}}>考试总分为：{this.examFullMark}分, 将整体成绩分为 <input ref='gradeNum' defaultValue={this.state.grades.length} onBlur={this.setGradeNum.bind(this)} style={{width: 100, height: 34, border: '1px solid ' + colorsMap.C05, paddingLeft: 20}} /> 个等级 </div>
                        <div style={{ borderBottom: '1px solid #f2f2f2', textAlign: 'center'}}>
                        {
                            _.map(_.range(this.state.grades.length), (index)=> {
                                    return (
                                        <div key={'gradelevel-' + index + '-' + _.now()}  style={{ marginBottom: index === this.state.levelNum - 1 ? 0 : 30, textAlign: 'left' }}>
                                            <div style={{ display: 'inline-block' }}>{letterMap[(index)]}等：
                                                <span style={{ margin: '0 10px' }}>
                                                    <input ref={'grade-' + (gradeLastIndex - index) } defaultValue={this.state.grades[gradeLastIndex - index]} onBlur={this.setGrade.bind(this, 'grade-' + (gradeLastIndex - index)) } style={_.assign({}, { width: 148, height: 34, paddingLeft: 20 }, this.state.invalidIndex === (gradeLastIndex - index) ? { border: '2px solid ' + colorsMap.B08 } : { border: '1px solid ' + colorsMap.C05 }) }/>
                                                    %
                                                </span>
                                                <span>表示在总分×{this.state.grades[gradeLastIndex -index]}%的分数以上学生为{letterMap[index]}等</span>
                                            </div>
                                        </div>
                                    )
                                })
                        }
                        </div>
                        <div style={_.assign({},{color: A11, width: '100%', textAlign:'center', marginTop: 20}, this.state.hasError ? {display: 'inline-block'} : {display: 'none'})}>{this.state.errorMsg}</div>
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0, padding: '0 0 30px 0' }}>
                    <a href="javascript:void(0)"  style={_.assign({}, localStyle.btn, { backgroundColor: '#59bde5', color: '#fff' }) } onClick={_this.okClickHandler.bind(_this) }>
                        确定
                    </a>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={this.props.onHide}>
                        取消
                    </a>
                </Footer>
            </Modal>
        )
    }
}

class SubjectPerformance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            //1. Dialog中的levelFactors是百分制，但是表格中的显示是小数制（计算的时候走levelFactors，所以要除以100）
            //2. n个刻度值，代表了(n-1)个难度档次（区间），所以其实有(buffers.length - 1个难度档次，因此应该遍历buffers.length - 1)
            levelPcentages: [0, 60, 70, 85, 100]
        }
    }

    onShowDialog() {
        this.setState({
            showDialog: true
        })
    }
    onHideDialog() {
        this.setState({
            showDialog: false
        })
    }

    updateLevelPercentages(newLevelPercentages) {
        this.setState({
            levelPcentages: newLevelPercentages
        })
    }
    render() {
//Props数据结构：
        var {examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers} = this.props;
//算法数据结构：
        //TODO：很明显，levelPercentages不影响 subjectExamTable，只会影响subjectLevelExamTable，所以最后还是抽出去
        var subjectExamTableData = theSubjectExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers);
        var subjectLevelExamTableData = theSubjectLevelExamTable(examPapersInfo, allStudentsPaperMap, headers, this.state.levelPcentages);
        // var disData = theSubjectExamDiscription(examPapersInfo, allStudentsPaperMap);
        var {subjects, factors} = theSubjectExamFactorChartData(examPapersInfo, allStudentsPaperMap, headers);
        // var subjects=[];
        // for(let i=0;i<disData.length;i++){
        //   subjects.push(disData[i].subject);
        // }

//自定义Moudle数据结构：

var config={
chart: {
    type: 'column'
},
title: {
    text: '',
    enabled:false
},
subtitle: {
    text: '(离差)',
    floating:true,
    x:-512,
    y:5,
    style:{
      "color": "#767676",
       "fontSize": "14px"
    }
},
colors:['#1daef8','#16d2c7'],
xAxis: {
  tickWidth:'0px',//不显示刻度
  categories:subjects
},
yAxis: {
  title:{
    text:''
  },
  lineWidth:1,
gridLineDashStyle:'Dash',
  gridLineColor:'#f2f2f3',
},
credits:{
  enabled:false
},
tooltip:{
enabled:true,
backgroundColor:'#000',
borderColor:'#000',
style:{
  color:'#fff'
},
formatter: function(){
     return this.point.y.toFixed(2);
}
},
legend:{
  enabled:false
},
plotOptions: {
           column: {
               pointWidth:16
           }
       },
series: [{
    data: factors
}]
};
        // var factorSubjects = _.map(_.reverse(disData), (obj) => obj.subject);

        // 表格表头的鼠标悬停提示
        var tipConfig = {'标准差': {content: '反映了学生分数的分布离散程度，值越大表示个体之间的分数分布的离散程度越大，反之，值越小表示个体之间的分数分布的离散程度越小；', direction: 'bottom'}, '差异系数': {content: '标准差与平均分之比，表示不同样本的相对离散程度。值越大表示相对离散程度越大，反之，值越小表示相对离散程度越小；', direction: 'bottom'}};
        return (
            <div id='subjectPerformance' className={schoolReportStyles['section']}>
                <div style={{ marginBottom: 30 }}>
                    <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                    <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>学科考试表现</span>
                    <span style={{ fontSize: 12, color: C07 }}>学科考试表现，通过对不同学科之间基本指标数据的分析，发现学校各学科的教学信息</span>
                </div>
                <TableView tableData={subjectExamTableData} reserveRows={6} tipConfig={tipConfig}/>

                <p style={{margin: '40px 0 20px 0'}}>
                    <span className={schoolReportStyles['sub-title']}>学科离差分布</span>
                    <span className={schoolReportStyles['title-desc']}>班级平均得分率差异较大的学科，反映出各班该学科班级平均水平差距较大；班级平均得分率差异较小的学科，反映出各班该学科班级平均水平比较整齐（注：语文是母语，具有特殊性）</span>
                </p>
                <div style={{display: 'inline-block', width: '100%', height: 380, position: 'relative'}}>
                  <ReactHighcharts config={config} style={{width: '100%', height: '100%'}}></ReactHighcharts>
                </div>
                <p style={{marginBottom: 20}}>
                    <span className={schoolReportStyles['sub-title']}>各学科成绩分布的等级结构比例</span>
                    <a href="javascript:void(0)"  onClick={this.onShowDialog.bind(this)} className={styles.button} style={{ width: 120, height: 30, float: 'right', backgroundColor: colorsMap.B03, color: '#fff', lineHeight: '30px', borderRadius: 2}}>
                        <i className='icon-cog-2'></i>
                        设置等级参数
                    </a>
                </p>
                <TableView tableData={subjectLevelExamTableData} reserveRows={6}/>
                <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this)} levelPcentages={this.state.levelPcentages} updateGrades={this.updateLevelPercentages.bind(this)} examPapersInfo={examPapersInfo} />
            </div>
        )
    }

}

export default SubjectPerformance;

function theSubjectExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers) {
    var table = [];

    var titleHeader = ['学科', '满分', '最高分', '最低分', '平均分', '标准差', '差异系数', '难度', '实考人数', '缺考人数'];

    table.push(titleHeader);

    var subjectHeaders = headers.slice(1); //去掉排在第一位的id: totalSchool，这样剩下的就都是科目了

    _.each(subjectHeaders, (headerObj, index) => {
        //有多少个科目就有多少行
        var subjectRow = [];
        subjectRow.push(headerObj.subject); //学科
        subjectRow.push(examPapersInfo[headerObj.id].fullMark); //满分
        var paperScores = _.map(allStudentsPaperMap[headerObj.id], (paper) => paper.score);
        subjectRow.push(_.max(paperScores)); //最高分
        subjectRow.push(_.min(paperScores)); //最低分
        var mean = _.round(_.mean(paperScores), 2);
        subjectRow.push(mean); //平均分
        var sqrt = _.round(Math.sqrt(_.divide((_.sum(_.map(paperScores, (paperScoreItem) => Math.pow((paperScoreItem - mean), 2)))), paperScores.length)), 2);
        subjectRow.push(sqrt); //标准差
        subjectRow.push(_.round(_.divide(sqrt, mean), 2)); //差异系数: 标准差/平均分
        subjectRow.push(_.round(_.divide(mean, examPapersInfo[headerObj.id].fullMark), 2)); //难度
        subjectRow.push(examPapersInfo[headerObj.id].realStudentsCount); //实考人数
        subjectRow.push(examPapersInfo[headerObj.id].lostStudentsCount); //缺考人数

        table.push(subjectRow);
    });

    return table;
}

function theSubjectLevelExamTable(examPapersInfo, allStudentsPaperMap, headers, levelPcentages) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var matrix = [], total = levelPcentages.length -1;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('学科成绩分类');
    matrix.push(titleHeader);

    var subjectHeaders = headers.slice(1);//没有总分这一行

    _.each(subjectHeaders, (headerObj, index) => {
        //每一个科目|
        var paperObj = examPapersInfo[headerObj.id];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        //这应该是当前科目的区分段的count--而不是总分（且一定不包含总分）
        //获取此科目下所有学生的成绩
        var result = makeSegmentsCount(allStudentsPaperMap[paperObj.id], segments); //注意：低分档次的人数在前

        result = _.map(_.reverse(result), (count) => {
            var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
            return percentage + '%';
        });
        result.unshift(paperObj.subject);
        matrix.push(result);
    });

    return matrix;
}


function theSubjectExamFactorChartData(examPapersInfo, allStudentsPaperMap, headers) {
//TODO: PM--给出具体的规则。第三个文案可以写写其他简单的
//第二个算法：各个学科各个班级的平均得分率，然后max-min，然后从中选出哪几个学科的差值较大或较小
    //班级考试基本表现中有关于 各个班级各个学科平均得分率的数据结构，可以拿来用！！！

    //各个学科
        //各个班级的平均得分率
    var result = _.map(allStudentsPaperMap, (papers, pid) => {
        var classFactors = _.map(_.groupBy(papers, 'class_name'), (classPapers, className) => {
            var theMean = _.mean(_.map(classPapers, (paperObj) => paperObj.score));
            var theFactor = _.round(_.divide(theMean, examPapersInfo[pid].fullMark), 2);
            return theFactor;
        });
        return {pid: pid, subject: examPapersInfo[pid].subject, factor: (_.max(classFactors) - _.min(classFactors))};
    });

//Note：数据要和科目的顺序对应
    var subjects = [], factors = [];
    _.each(headers, (headerObj) => {
        var target = _.find(result, (obj) => obj.pid == headerObj.id);
        if(target) {
            subjects.push(target.subject);
            factors.push(target.factor);
        }
    });
    return { subjects: subjects, factors: factors };


//不再需要排序
    // var sortedResult = _.sortBy(result, 'factor');
    // return sortedResult;
}


function theSubjectExamDiscription(examPapersInfo, allStudentsPaperMap) {
//TODO: PM--给出具体的规则。第三个文案可以写写其他简单的
//第二个算法：各个学科各个班级的平均得分率，然后max-min，然后从中选出哪几个学科的差值较大或较小
    //班级考试基本表现中有关于 各个班级各个学科平均得分率的数据结构，可以拿来用！！！

    //各个学科
        //各个班级的平均得分率
    var result = _.map(allStudentsPaperMap, (papers, pid) => {
        var classFactors = _.map(_.groupBy(papers, 'class_name'), (classPapers, className) => {
            var theMean = _.mean(_.map(classPapers, (paperObj) => paperObj.score));
            var theFactor = _.round(_.divide(theMean, examPapersInfo[pid].fullMark), 2);
            return theFactor;
        });
        return {subject: examPapersInfo[pid].subject, factor: (_.max(classFactors) - _.min(classFactors))};
    });
    var sortedResult = _.sortBy(result, 'factor');
    return sortedResult;
}

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}


/*
Mock Data:
let td_subjectTotal = {
    ths: [
        '学科', '平均分', '优秀率', '及格率', '满分', '最高分', '最低分', '实考人数', '缺考人数'
    ],
    tds: [
        ['语文', 70.5, '0%', '43%', 120, 110, 3, 300, 2],
        ['数学', 56.3, '10%', '43%', 120, 110, 3, 300, 2],
        ['英语', 43, '20%', '43%', 120, 110, 3, 300, 2],
        ['物理', 89, '30%', '43%', 120, 110, 3, 300, 2],
        ['化学', 85, '40%', '43%', 120, 110, 3, 300, 2]

    ]
}

let td_subjectClassDistribution = {
    ths: [
        '学科成绩分类', 'A', 'B', 'C', 'D'
    ],
    tds: [
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%']
    ]
}

 */
