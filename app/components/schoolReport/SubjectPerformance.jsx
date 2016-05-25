import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';

import Table from '../../common/Table';

import {makeSegmentsStudentsCount} from '../../api/exam';
import {NUMBER_MAP as numberMap, LETTER_MAP as letterMap} from '../../lib/constants';

import styles from '../../common/common.css';

var {Header, Title, Body, Footer} = Modal;

var localStyle = {
    btn: {lineHeight: '50px', width: 150, height: 50,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',margin: '0 30px'}
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
        this.state = {
            grades: this.props.levelPcentages                     //注意这里是从大到小的：  [85, 75, 60, 0]
        }
    }
    okClickHandler() {
        this.props.onHide();
    }
    handleMouseEnter(event) {
        $(event.target).find('#deleteIcon').removeClass('hide');
    }

    handleMouseLeave(event) {
        $(event.target).find('#deleteIcon').addClass('hide');
    }

    onAddGrade() {
        var newGrades = this.state.grades;
        newGrades.push(1); //这里没有push 0， 是因为不能等于0，要大于0
        this.setState({
            grades: newGrades
        })
    }

    onDeleteGrade(index) { //其实传递item是不是更好，直接without或者其他方法都比较方便
        var newGrades = this.state.grades;
        var gradeLastIndex = newGrades.length - 1;
        newGrades.splice(gradeLastIndex-index-1, 1);
        this.setState({
            grades: newGrades
        })
    }

    okClickHandler() {
        //this.props.updateLevelPercentages(newLevelPercentages);

        var formValid = _.every(this.isValid, (flag) => flag);
        if(!formValid) {
            console.log('表单验证不通过');
            return;
        }

        if(!this.isUpdate) {
            console.log('表单没有更新');
            return;
        }

        this.isUpdate = false;

        this.props.updateGrades(this.state.grades);
        this.props.onHide();
    }

    onInputBlur(index) {
        var gradeLastIndex = this.state.grades.length - 1;
        var value = parseInt(this.refs['grade-'+ index].value);
        if (!(value && _.isNumber(value) && value >= 0)) {
            console.log('所给百分比不是有效的数字');
            this.isValid[index] = false;
            return;
        };  //可以添加isValid = true，即如果isValid是false压根就进不来，也可以！但是这样就没有重置
        //的机会了。。。不可以~

        var higherLevPer = this.state.grades[gradeLastIndex-index];
        var lowerLevPer = this.state.grades[gradeLastIndex-index-2];

        if(!((value < 100) && (!higherLevPer || (value < higherLevPer)) && (!lowerLevPer || (value > lowerLevPer)))) {
            console.log('所给的百分比不符合规则');
            this.isValid[index] = false;
            return;
        }

        var formValid = _.every(this.isValid, (flag) => flag);
        if(!formValid) {
            console.log('表单验证不通过');
            return;
        }

        //如果value不变。。。那么也不更新
        if(this.state.grades[gradeLastIndex-index-1] == value) return;

        this.isUpdate = true;
        var newGrades = this.state.grades;
        newGrades[gradeLastIndex-index-1] = value;

        this.setState({
            grades: newGrades
        });
    }

    render() {
        var _this = this, gradeLastIndex = this.state.grades.length - 1;

        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide.bind(this, {}) }>
                <Header closeButton style={{ textAlign: 'center' }}>
                    设置等级分数
                </Header>
                <Body className="apply-content">
                    <div style={{ minHeight: 230 }}>
                        <div style={{ borderBottom: '1px solid #f2f2f2' }}>
                            {
                                _.map(_.range(gradeLastIndex), (index) => {

                                    // var charGrade = String.fromCharCode(charCode_A + index);
                                    var charStr = letterMap[index];

                                    if (index === gradeLastIndex-1 && index !== 0) {
                                        return (
                                            <div style={{ margin: '10px 0' }} onMouseEnter={this.handleMouseEnter}  onMouseLeave={this.handleMouseLeave}  key={index}>
                                                <span style={{ marginRight: 20 }}>{charStr}等：</span>

                                                <span style={{ marginRight: 20 }}>表示小于满分×{ this.state.grades[gradeLastIndex-index] }%的分数的学生为{charStr}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)} href='javascript:void(0)' style={{textDecoration:'none'}} id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    } else if (index === 0) {
                                        return (
                                            <div style={{ margin: '10px 0' }} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}  key={index}>
                                                <span style={{ marginRight: 20 }}>{charStr}等：<input ref={'grade-' + index} defaultValue={this.state.grades[gradeLastIndex-index-1]} onBlur={_this.onInputBlur.bind(_this, index)} />%</span>
                                                <span style={{ marginRight: 20 }}>表示满分×{ this.state.grades[gradeLastIndex-index-1] }%的分数以上的学生为{charStr}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)}  href='javascript:void(0)'style={{textDecoration:'none'}}id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div style={{ margin: '10px 0' }} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}  key={index}>
                                                <span style={{ marginRight: 20 }}>{charStr}等：<input ref={'grade-' + index} defaultValue={this.state.grades[gradeLastIndex-index-1]} onBlur={_this.onInputBlur.bind(_this, index)}/>%</span>
                                                <span style={{ marginRight: 20 }}>表示满分×{ this.state.grades[gradeLastIndex-index-1] }%到{letterMap[index-1]}等分数的学生为{charStr}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)}  href='javascript:void(0)' style={{textDecoration:'none'}} id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <a href='javascript:void(0)' onClick={this.onAddGrade.bind(this)} className={styles.button} style={{ textDecoration: 'none',width: 140, height: 30, border: '1px solid #bcbcbc', lineHeight: '30px', marginRight: 20 }}>
                                添加等级
                            </a>
                        </div>
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0 }}>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={_this.okClickHandler.bind(_this) }>
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

console.log('updateLevelPercentages : ', newLevelPercentages);

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
        var subjectLevelExamTableData = theSubjectLevelExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, this.state.levelPcentages);
        var disData = theSubjectExamDiscription(examPapersInfo, allStudentsPaperMap);
//自定义Moudle数据结构：
        var factorSubjects = _.map(_.reverse(disData), (obj) => obj.subject);
        return (
            <div className={styles['school-report-layout']}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    学科考试表现
                </div>
                <div className={styles['school-report-content']}>
                    <p>对于任何考试都需要了解，学科考试后所表现出的基本情况。一般都要有些基本指标来表达，如下面学科考试基本指标一览表所示：</p>

                {/*--------------------------------  学科考试表现基本指标表格 -------------------------------------*/}

                    <Table tableData={subjectExamTableData} />
                    <p className={styles.tips}>
                        学科基本指标的数据虽一目了然，但其中也包含了许多考试信息，值得学校的关注，具体分析和理解各个指标：
                        <br />
                        <br />
                        最高分：反映出学科的最高分，各学科就有差异了；<br />
                        最低分：反映出学科的最低分，可以看出最低水平；<br />
                        平均分：表达各科的代表性水平，也反映了学生得分的集中趋势；<br />
                        标准差：反映了学生分数的分布离散程度，值越大表示个体之间的分数分布的离散程度越大，反之，值越小表示个体之间的分数分布的离散程度越小；<br />
                        差异系数：标准差与平均分之比，表示不同样本的相对离散程度，值越大表示相对相对离散程度越大，反之，值越小表示相对离散程度越小；<br />
                        难度：表达学科考试难易程度，难度系数值越大，表明考试越容易，难度系数值越小，考试越难；上表中的难度值明确表达了这次考试最难得学科和考试最容易的学科具体是哪个学科。
                        <br />
                        <br />
                        有关学科分析还有如下几点：
                    </p>

                    {/*--------------------------------  学科考试表现分析说明 -------------------------------------*/}
                    {/* TODO: 如果联系到学科的命题难度，其相对离差从大到小的顺序是<span style={{color: 'blue'}}>生物、物理、语文</span>。 缺少*/}
                    <p>
                        （1）结合前面的分析内容，从各学科的成绩表现来看，每个学科的班级平均分得分率最高的与最低之间的离差，从大到小的顺序是，<span style={{color: 'blue'}}>{_.join(factorSubjects, '、')}</span>。离差较大的学科，反映出班级水平差距较大。离差较小的学科，反映出该学科教学效果比较整齐。（注：语文是母语，学生水平离差来的较小应该是常态）
                    </p>

                    <p>各个学科成绩分布的等级结构比例情况，如下表所示：</p>
                    <a href="javascript:void(0)"  onClick={this.onShowDialog.bind(this)} className={styles.button} style={{ width: 130, height: 30, position: 'absolute', right: 0, color: '#b686c9' }}>
                        设置等级参数
                    </a>
                    <Table tableData={subjectLevelExamTableData} />

                    {/*--------------------------------  TODO: 暂时空缺的和学科难易程度相关的数据 -------------------------------------*/}
                    <p>（3）有关学科命题</p>
                    <p>
                        作为学科考试，必须考虑给水平不同的全体学生都能提供展示其学业水平的机会。有的学科在试题难度分布结构方面，可以进一步完善，防止出现过难或者过易的情况。
                    </p>
                    <p>注：各个学科更精细的分析报告，请查阅各个学科详细分析模块。</p>
                </div>
               <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this)} levelPcentages={this.state.levelPcentages} updateGrades={this.updateLevelPercentages.bind(this)} />
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

function theSubjectLevelExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, levelPcentages) {
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
        var result = makeSegmentsStudentsCount(examStudentsInfo, segments); //注意：低分档次的人数在前
        result = _.map(_.reverse(result), (count) => {
            var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
            return percentage + '%';
        });
        result.unshift(paperObj.subject);
        matrix.push(result);
    });

    return matrix;
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
