//分档分数线文案（总分分布趋势下面的那一小块）
import _ from 'lodash';
import React, { PropTypes } from 'react';

import commonClass from '../../../common/common.css';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';
import {initParams} from '../../../lib/util';

import {Modal} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

var localStyle = {
    dialogInput: {width: 100,height: 34, border: '1px solid #e7e7e7', borderRadius: 2, paddingLeft: 12, margin: '0 10px 0 0'},
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'},
}

export default class LevelGuide extends React.Component  {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false
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

    render() {
        var {reportDS, classStudents, changeLevels, saveBaseline, examid, grade} = this.props;
        var {showDialog} = this.state;
        var levels = reportDS.levels.toJS(), examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
        var fullMark = examInfo.fullMark;
        var maxScore = _.last(classStudents).score;
        var levTotal = _.size(levels);
        var levelBuffers = reportDS.levelBuffers.toJS();
        var examStudentsInfo = reportDS.examStudentsInfo.toJS();
        var examPapersInfo = reportDS.examPapersInfo.toJS();
        return (
            <div className={commonClass['section']}>
                <div style={{ marginBottom: 20 }}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>分档分数线划定</span>
                    {/*<span onClick={this.onShowDialog.bind(this)} style={{ cursor: 'pointer', backgroundColor: colorsMap.B03, color: '#fff', textAlign: 'center', display: 'inline-block', width: 110, height: 30, lineHeight: '30px', fontSize: 12, float: 'right',borderRadius:2 }}>
                        <i className='icon-cog-2' style={{ fontSize: 12 }}></i>
                        设置分档参数
                    </span>
                    todo: 根据角色显示不同的内容 */}
                    <div className={commonClass['title-desc']} style={{ marginTop: 10 }}>
                        将总分划线进行分档分析是常用的分析方法，特别适合高考、中考的模拟考试。即便是对日常其中期末考试，通过总分分档分析，也能考察高端学生综合水平的分布情况。
                        总分分数线应由学校统一设置，未设置前，由本分析系统默认设置。
                    </div>
                </div>

                <p style={{ marginBottom: 0 }}>本次考试满分{fullMark}分，最高分{maxScore}分，整体分为{numberMap[levTotal]}档，
                    {
                        _.map(levels, (levObj, levelKey) => {
                            return (
                                <span key={'basicInfo-level-' + levelKey}>
                                    {numberMap[(+levelKey + 1)]} 档线 {levels[(levTotal - 1 - levelKey) + ''].score}分{levelKey == levTotal - 1 ? '' : '，'}
                                </span>
                            )
                        })
                    }
                  {/*  // 。分别对应年级学生总数的前
                    // {
                    //     _.map(levels, (levObj, levelKey) => {
                    //         return levels[(levTotal - 1 - levelKey)].percentage + '%' + (levelKey == levTotal - 1 ? '' : '、')
                    //     })
                    // }
                    // 。如需修改，{/**todo： 根据角色判断要不要显示分档设置按钮  请点击右侧修改按钮修改。*/}

                </p>
                <Dialog examId={examid} grade={grade} levels={levels} levelBuffers={levelBuffers}
                        examInfo={examInfo} examStudentsInfo={examStudentsInfo} examPapersInfo={examPapersInfo}
                        changeLevels={changeLevels} saveBaseline={saveBaseline} show={this.state.showDialog} onHide={this.onHideDialog.bind(this) }  />
            </div>
        );
    }

}


/**
 * props:
 * show: 是否打开的状态
 * onHide: 关闭时调用的父组件方法
 * fullScore: 考试总分
 * highscore: 考试最高分
 * changeLevels: 修改状态树的actionCreator
 *
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.levels = props.levels;
        this.state = {
            levelNum: _.size(props.levels),
            levelNumWrong: false,
            levelNumMsg: '',
            hasError: false,
            errorMsg: ''
        };
    }
    onChange(ref, event) {
        this.refs[ref].value = event.target.value;
    }
    adjustGrades() {
        var value = parseInt(this.refs.levelInput.value);

        //分档只能是这几个数字
        if (!(_.includes([1, 2, 3, 4, 5], value))) {
            this.setState({
                levelNumWrong: true,
                levelNumMsg: '分档值是1至5的整数'
            })
            return;
        }

        var preLength = _.size(this.levels);
        var theDiff = Math.abs(preLength - value);
        if(theDiff === 0) return;


        var tempLevels = {};
        if(value < preLength) {
            _.each(_.range(value), (index) => {
                var targetScore = this.levels[(index+theDiff)].score;
                var targetCount = (index == 0) ? _.size(_.filter(this.props.examStudentsInfo, (s) => s.score >= targetScore)) : _.size(_.filter(this.props.examStudentsInfo, (s) => s.score > targetScore));
                var targetPercentage = _.round(_.multiply(_.divide(targetCount, this.props.examStudentsInfo.length), 100), 2);
                tempLevels[index+''] = {score: targetScore, count: targetCount, percentage: targetPercentage};
            });
        } else {
            _.each(_.range(theDiff), (index) => {
                tempLevels[index+''] = {score: 0, count: 0, percentage: 0}
            });
            _.each(_.range(preLength), (index) => {
                var targetScore = this.levels[index+''].score;
                var targetCount = _.size(_.filter(this.props.examStudentsInfo, (s) => s.score > targetScore));
                var targetPercentage = _.round(_.multiply(_.divide(targetCount, this.props.examStudentsInfo.length), 100), 2);
                tempLevels[(index+theDiff)+''] = {score: targetScore, count: targetCount, percentage: targetPercentage};
            });
        }
        this.levels = tempLevels;
        this.setState({ levelNum: value, levelNumWrong: false});
    }

    okClickHandler() {
        //this.levels的个数和input的值是一样的；所有的input都不为空
        var levTotal = parseInt(this.refs.levelInput.value);
        if (!(levTotal && _.isNumber(levTotal) && levTotal > 0)) {
            this.setState({
                levelNumWrong: true,
                levelNumMsg: '分档数应是正数'
            })
            return;
        }

        //保证层级是正确的
        var isValid = _.every(_.range(_.size(this.levels) - 1), (index) => {
            return this.levels[index+''].score < this.levels[(index+1)+''].score
        });

        if(!isValid) {
            this.setState({
                hasError: true,
                errorMsg: '档位靠前分数必须比靠后的高'
            })
            return;
        }

        if (this.state.hasError) {
            this.setState({
                hasError: false,
                errorMsg: ''
            })
        }
        this.props.changeLevels(this.levels);
        //当有levels变动则修改baseline；当有levelBuffer变动则修改baseline？能进入到这里就是有效的设置了，但是levelBuffer那里是否有valid的校验，否则一旦存储，以后获取的都是错的就会麻烦
        //这里的grade走的是examInfo中的gradeName，而不是传递进来的url的query中的grade
        //TODO:要保证格式同Schema的格式：'[levels]'等
        var newBaseline = getNewBaseline(this.levels, this.props.examStudentsInfo, this.props.examPapersInfo, this.props.examId, this.props.examInfo, this.props.levelBuffers);
        var params = initParams({ 'request': window.request, examId: this.props.examId, grade:this.props.grade, baseline: newBaseline });
        debugger;
        this.props.saveBaseline(params);

        this.props.onHide();
    }

    /*
        低档次的 score 一定要比高档次的 score 低，比档次的要高（相对的，低档次的percentage和count都会比高档次的高）
    */
    onInputBlur(id, event) {
        var value = parseFloat(event.target.value);
        if (!(value && _.isNumber(value) && value >= 0)) return;
        var arr = id.split('-');
        var type = arr[0];
        var num = arr[1]; //是第一个（高档次） 还是 最后一个（低档次），但是赋值给levels的时候就应该颠倒过来了

        //num = 0, 1, 2(levlTotal)
        // var higherLevObj = this.levels[(this.levLastIndex-num+1)+''];
        // var lowerLevObj = this.levels[(this.levLastIndex-num-1)+''];
        var temp = {score: 0, percentage: 0, count: 0};
        var {examInfo, examStudentsInfo} = this.props;
        switch (type) {
            case 'score':
            //根据给出的分数，计算在此分数以上的人数，然后求出百分比
                //要么没有，如果有则一定符合规则

                //TODO:这里修改条件判断；前后挡最少相差10分；但是百分比也会相关联。。。修改百分比的时候要注意score的分差；但是10分又不科学，如果满分是
                // 30分（这个有点极端了。。。暂时可以不考虑）
                // if(!((value < examInfo.fullMark) && (!higherLevObj || (10 < higherLevObj.score - value)) && (!lowerLevObj || (value - lowerLevObj.score > 10))))

                // if(!((value < examInfo.fullMark) && (!higherLevObj || (higherLevObj.score > value)) && (!lowerLevObj || (value > lowerLevObj.score)))) {
                //     console.log('所给的score不符合规则');
                //     this.isValid = false;
                //     return;
                // }

                // [300, 400, 500, 700]   [10, 20, 20, 20, 30, 40, 50]   7-1 = 6
                if(value > examInfo.fullMark) {
                    console.log('数值不合法--不能超过总分');
                    return;
                }
                var targetIndex;//因为examStudentsInfo是有序的，所以可以用二分
                if(num == (_.size(this.levels) - 1)) {
                    targetIndex = _.findIndex(examStudentsInfo, (student) => student.score >= value);
                } else {
                    targetIndex = _.findIndex(examStudentsInfo, (student) => student.score > value);
                }
                var count = examStudentsInfo.length - targetIndex;
                var percentage = _.round(_.multiply(_.divide(count, examInfo.realStudentsCount), 100), 2);

                temp.score = value;
                temp.percentage = percentage;
                temp.count = count;

                this.refs['rate-' + num].value = percentage;
                break;
            case 'rate':
            //根据给出的百分比，得到学生的位置，然后此学生的分数即为分数线
                if(value > 100) {
                    console.log('数值不合法--不能超过100%');
                    return;
                }
                var flagCount = _.ceil(_.multiply(_.divide(value, 100), examInfo.realStudentsCount));
                var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];

                //当修改百分比后也要换算成分数看一下是否满足相应的规则：前后要相差不少于10分（一旦修改levels，那么就自动重置levelBuffers为10）
                //TODO:但是这里还是可能会有问题：因为一上来是按照默认百分比设置的，但是怎么保证默认的百分比设置对应的score就一定满足相差10分呢？

                temp.score = targetStudent.score;
                temp.percentage = value;

                var targetIndex;//因为examStudentsInfo是有序的，所以可以用二分
                if(num == (_.size(this.levels) - 1)) {
                    targetIndex = _.findIndex(examStudentsInfo, (student) => student.score >= temp.score);
                } else {
                    targetIndex = _.findIndex(examStudentsInfo, (student) => student.score > temp.score);
                }
                var targetCount = examStudentsInfo.length - targetIndex;
                temp.count = targetCount;

                this.refs['score-' + num].value = targetStudent.score;
                break;
        }
        // this.isValid = true; //TODO: 这里有bug，还是要确保所有的input都是true才对。不然，先来个错的，然后跳过这个错的，再来个对的，那么isValid就是true了。。。
        this.levels[(_.size(this.levels) - 1 - num)+''] = temp;
    }
    onHide() {
        this.setState({
            levelNumWrong: false,
            levelNumMsg: '',
            hasError: false,
            errorMsg: ''
        })
        this.levels = this.props.levels;
        this.props.onHide();
    }
    render() {
        var _this = this;
        var {examInfo, examStudentsInfo} = this.props;

        // this.levels = this.props.levels;
        this.levLastIndex = _.size(this.levels) - 1;
        //重绘要不要 来自 props
        return (
             <Modal show={ this.props.show } ref="dialog"  onHide={this.onHide.bind(this)}>
                <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                    <button className={commonClass['dialog-close']} onClick={this.onHide.bind(this)}>
                        <i className='icon-cancel-3'></i>
                    </button>
                    设置分档线
                </Header>
                <Body style={{padding: 30}}>
                    <div style={{ minHeight: 230 }}>
                        <div style={{ marginBottom: 20 }}>
                            考试总分{examInfo.fullMark}分，最高分{_.last(examStudentsInfo).score}分, 将整体成绩分档为：
                            <input  ref='levelInput' onBlur={this.adjustGrades.bind(this) } style={localStyle.dialogInput} defaultValue={_this.state.levelNum} onChange={_this.onChange.bind(_this, 'levelInput') }/>档
                            <span style={_.assign({}, { color: colorsMap.A11 }, this.state.levelNumWrong ? { display: 'inline-block' } : { display: 'none' }) }>{this.state.levelNumMsg}</span>
                        </div>
                        <div>
                            {
                                _.map(_.range(this.state.levelNum), (index) => {
                                    return (
                                        <div key={'level-' + index} style={{ marginBottom: index === this.state.levelNum - 1 ? 0 : 30, textAlign: 'left' }}>
                                            <div style={{ display: 'inline-block' }}>{numberMap[(index + 1)]}档：
                                                <input id={'score-' + index} ref={'score-' + index} defaultValue={this.levels[(this.levLastIndex - index) + ''].score} onBlur={_this.onInputBlur.bind(_this, 'score-' + index) } onChange={_this.onChange.bind(_this, 'score-' + index) } style={_.assign({}, localStyle.dialogInput, { width: 166, height: 34 }) }/>
                                                分
                                            </div>
                                            <i className={'icon-link-1'} style={{ margin: '0 25px', color: colorsMap.C07 }}></i>
                                            <div style={{ display: 'inline-block' }}>
                                                <input id={'rate-' + index} ref={'rate-' + index} defaultValue={this.levels[(this.levLastIndex - index) + ''].percentage} onBlur={_this.onInputBlur.bind(_this, 'rate-' + index) } onChange={_this.onChange.bind(_this, 'rate-' + index) } style={_.assign({}, localStyle.dialogInput, { width: 166, height: 34 }) }/>
                                                % 上线率
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0, padding: '0 0 30px 0' }}>
                    <a href="javascript:void(0)" style={_.assign({}, localStyle.btn, { backgroundColor: '#59bde5', color: '#fff' }) } onClick={_this.okClickHandler.bind(_this) }>
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

//=================================================  分界线  =================================================
//Note: 数据已Ready
function getNewBaseline(newLevels, examStudentsInfo, examPapersInfo, examId, examInfo, levelBuffers) {
    //通过新的levels计算subjectMeans，levelBuffer不变
    var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
    _.each(newLevels, (levObj, levelKey) => {
        var subjectMean = makeLevelSubjectMean(levObj.score, examStudentsInfo, examPapersInfo, examInfo.fullMark);
        // var subjectLevels = _.values(subjectMean);
        result['[subjectLevels]'].push({levelKey: levelKey, values: subjectMean});
        result['[levels]'].push({key: levelKey, score: levObj.score, percentage: levObj.percentage, count: levObj.count});
        //如果是update那么可以考虑只put上去需要更新的数据--但是需要能区分到底是post还是put。理论上这里如果是put那么不需要put上去levelBuffers，因为这里并没有改变levelBuffers。
        result['[levelBuffers]'].push({key: levelKey, score: levelBuffers[levelKey-0]});
        //拼装 [levels]，[subjectLevels]和[levelBuffers]所对应的每一个实体，放入到相对应的数组中，最后返回gradeExamLevels
    });
    return result;
}

function makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark) {
    var result = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(levelScore));
    var count = result.length;

    var currentLowScore, currentHighScore;
    currentLowScore = currentHighScore = _.round(levelScore);

    while ((count < 25) && (currentLowScore >= 0) && (currentHighScore <= examFullMark)) {
        currentLowScore = currentLowScore - 1;
        currentHighScore = currentHighScore + 1;
        var currentLowStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentLowScore));
        var currentHighStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentHighScore));

        var currentTargetCount = _.min([currentLowStudents.length, currentHighStudents.length]);
        var currentTagretLowStudents = _.take(currentLowStudents, currentTargetCount);
        var currentTargetHighStudents = _.take(currentHighStudents, currentTargetCount);
        count += _.multiply(2, currentTargetCount);
        result = _.concat(result, currentTagretLowStudents, currentTargetHighStudents);
    }

    //result即是最后获取到的满足分析条件的样本，根据此样本可以获取各个科目的平均分信息
    return makeSubjectMean(result, examPapersInfo);
}

/**
 * 返回所给学生各科成绩的平均分。注意这里没有没有包括总分(totalScore)的平均分信息
 * @param  {[type]} students       [description]
 * @param  {[type]} examPapersInfo [description]
 * @return {[type]}                [description]
 */
function makeSubjectMean(students, examPapersInfo) {
    var result = {};
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};
        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.name = examPapersInfo[pid].subject; //TODO: 这里还是统一称作 'subject' 比较好
        obj.id = pid;

        result[pid] = obj;
    });
    return result;
}
