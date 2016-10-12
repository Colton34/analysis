//Third library
import _ from 'lodash';
import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

//Action
import {showDialog, hideDialog} from '../../reducers/global-app/actions';//TODO: 设计思路？？？

//Style
import style from '../../common/common.css';
import schoolReportStyles from './schoolReport.css';

//Components
import TableView from './TableView';
import DropdownList from '../../common/DropdownList';

//Util
import {makeSegmentsCount} from '../../api/exam';
import {getLevelInfo} from '../../sdk';
import {initParams} from '../../lib/util';

//Constant
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap, A11, A12, B03, B04, B08, C12, C05, C07, BACKGROUND_COLOR} from '../../lib/constants';

//Global variable
let localStyle = {
    dialogInput: {width: 100,height: 34, border: '1px solid #e7e7e7', borderRadius: 2, paddingLeft: 12, margin: '0 10px 0 0'},
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'},
    tableShowAllBtn: { color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }
}


const BasicInfo = ({examInfo, levels, examStudentsInfo, onShowDialog}) => {
    var levTotal = _.size(levels);
    return (
        <div style={{position: 'relative', padding: 30, backgroundColor: colorsMap.B03, color: '#fff', marginBottom: 20}}>
            <p style={{marginRight: 20, fontSize: 18, marginBottom: 25}}>
                <span style={{marginRight: 20}}>分档分数线划定</span>

            </p>
            <p>将总分划线进行分档分析是常用的分析方法，特别适合高考、中考的模拟考试。即便是对日常其中期末考试，通过总分分档分析，也能考察高端学生综合水平的分布情况。总分分数线应由学校统一设置，未设置前，由本分析系统默认设置。</p>
            <p>本次考试满分{examInfo.fullMark}分，最高分{_.last(examStudentsInfo).score}分，
            {
                    _.map(levels, (levObj, levelKey) => {
                        return (
                            <span key={'basicInfo-level-' + levelKey}>
                                {numberMap[(+levelKey + 1)]} 档线 {levels[(levTotal - 1 - levelKey) + ''].score}分{levelKey == levTotal - 1 ? '' : '，'}
                            </span>
                        )
                    })
            }。分别对应年级学生总数的前{_.join(_.map(levels, (levObj, levelKey) => levels[(levTotal - 1 - levelKey) + ''].percentage + '%'), '、')}。
            </p>
            <span onClick={onShowDialog} style={{ cursor: 'pointer', color: colorsMap.B03, textAlign: 'center', display: 'inline-block', width: 110, height: 30, lineHeight: '30px', backgroundColor: '#fff', fontSize: 12, position: 'absolute', top: 20, right: 30}}>
                    <i className='icon-cog-2' style={{fontSize: 12}}></i>
                    设置分档参数
            </span>
        </div>
    )
}
const Table = ({tableData, levels}) => {
    var levTotal = _.size(levels);
    var widthProp = {};
    if (levTotal > 3) {
        widthProp = {
            minWidth: 1000
        }
    }else {
        widthProp = {
            width: '100%'
        }
    }
    return (
        <BootTable bordered  hover responsive style={_.assign({}, {marginBottom: 0}, widthProp)}>
            <tbody>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    <th rowSpan="2" className={style['table-unit']} style={{borderColor: colorsMap.C04}}>班级</th>
                    {
                        _.map(_.range(levTotal), (index) =>{
                            return (
                                <th key={index} colSpan="3" className={style['table-unit']} style={{minWidth: 200, textAlign: 'center', paddingLeft: 0, borderColor: colorsMap.C04}}>
                                     {numberMap[(index + 1)]}档
                                </th>
                            )
                        })
                    }
                </tr>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    {
                        _.map(_.range(levTotal), () =>{
                            return  _.map(_.range(3), (index) =>  {
                                switch(index ) {
                                    case 0:
                                        return <th key={index} className={style['table-unit']} style={{borderColor: colorsMap.C04}}>人数</th>
                                    case 1:
                                        return  <th key={index} className={style['table-unit']} style={{borderColor: colorsMap.C04}}>累计人数</th>
                                    case 2:
                                        return <th key={index} className={style['table-unit']} style={{borderColor: colorsMap.C04}}>累计上线率</th>
                                }
                            })
                        })
                    }
                </tr>
                {
                    _.map(tableData, (rowData,index) => {
                        return (
                            <tr key={index}>
                            {
                                _.map(rowData, (data, index) =>{
                                    return (
                                        <td key={index} className={style['table-unit']} style={{borderColor: colorsMap.C04}}>{data}</td>
                                    )
                                })
                            }
                            </tr>
                        )
                    })
                }
            </tbody>
        </BootTable>
    )
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
//思路：当销毁dialog的时候把props.levels赋值给this.levels
/*
TODO: 如果没有点击确定，那么再次打开dialog的时候还是显示当前props.levels的数据
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.levels = props.levels;
        // this.isValid = true; //TODO: 修改成数组标记的形式？当修改分档个数的时候 isValid 的个数也要对应修改
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
        } else if (this.state.levelNumWrong) {
            this.setState({
                levelNumWrong: false,
                levelNumMsg: ''
            })
        }
        var preLength = _.size(this.levels);
        var theDiff = Math.abs(preLength - value);
        if(theDiff === 0) return;

        //更新levLastIndex
        // this.levLastIndex = value - 1;
        //更新levels
        var tempLevels = {};
        if(value < preLength) {
            // if(value == 1) {
            //     // 从this.levels中拿到score，然后重新计算 count和percetage
            //     tempLevels['0'] = {};
            //     var targetScore = this.levels[_.size(this.levels)-1].score;
            //     tempLevels['0'].score = targetScore;
            //     tempLevels['0'].count = _.size(_.filter(this.props.examStudentsInfo, (s) => s.score >= targetScore));
            //     tempLevels['0'].percentage = _.round(_.multiply(_.divide(tempLevels['0'].count, this.props.examStudentsInfo.length), 100), 2);
            // } else {
            //     _.each(_.range(value), (index) => {
            //         tempLevels[index+''] = this.levels[(index+theDiff)]
            //     });
            // }

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
        //         var levelNum = this.refs.levelInput.value;
        //         var levels = {};

        //         if(!(levelNum && _.isNumber(levelNum) && levelNum > 0)) {
        //             console.log('levelNum 分档个数必须是正数');
        //             return;
        //         } //显示Tips
        // //做校验--暂时先用Tips来给出Error信息；填充的时候是从后往前填充的
        // //this.refs[('score-' + i)].value
        // //this.refs[('rate-'+ i)].value
        //         var isValid = true;
        //         _.each(_.range(levelNum), (index) => {
        //             var temp = {}, score = this.refs[('score-' + i)].value, percentage = this.refs[('rate-'+ i)].value;
        //             if(!(_.isNumber(score) && _.isNumber(percentage))) {
        //                 isValid = false;
        //                 return;
        //             }
        //             temp.score = score;
        //             temp.percentage = percentage;
        //             temp.count = _.ceil(_.multiply(_.divide(levObj.percentage, 100), totalStudentCount));
        //             levels[(levelNum-index)+''] = temp;
        //         });

        //         if(!isValid) {
        //             console.log('分档线不符合规则，请修改');
        //             return;
        //         }


        //this.levels的个数和input的值 {]是一样的；所有的input都不为空
        // NOTE：下面的关于分档数是正数的判断多此一举，输入的时候就控制在 1~5之间。
        // var levTotal = parseInt(this.refs.levelInput.value);
        // if (!(levTotal && _.isNumber(levTotal) && levTotal > 0)) {
        //     this.setState({
        //         levelNumWrong: true,
        //         levelNumMsg: '分档数应是正数'
        //     })
        //     return;
        // }


        //保证层级是正确的 --- TODO: 将临界生分析那里的上下浮动5分的判断也验证也加入到这里！！！
        var {examInfo, examStudentsInfo, examPapersInfo} = this.props;
        var levLength = _.size(this.levels);
        debugger;
        var errorMsg = '';
        var isValid = _.every(_.range(_.size(this.levels) - 1), (index) => {
            return this.levels[index + ''].score < this.levels[(index + 1) + ''].score
        });
        if (!isValid) errorMsg = '档位靠前分数必须比靠后的高';
        //检查分档分数不能大于试卷总分
        if (isValid) {
            var levelOneScore = this.levels[levLength -1].score;
            isValid = levelOneScore < _.last(examStudentsInfo).score;
            if (!isValid) errorMsg = '数值不合法，分档线须小于最高分';
        }
        //note：不检查上线率，因为上线率不合法不会影响到this.levels;
        // 检查分档分数不能低于最低分
        if (isValid) {
            isValid = this.levels[0].score > _.first(examStudentsInfo).score;
            if (!isValid) errorMsg = '数值不合法，分档线须大于最低分';
        }

        //当有levels变动则修改baseline；当有levelBuffer变动则修改baseline？能进入到这里就是有效的设置了，但是levelBuffer那里是否有valid的校验，否则一旦存储，以后获取的都是错的就会麻烦
        //这里的grade走的是examInfo中的gradeName，而不是传递进来的url的query中的grade
        //TODO:要保证格式同Schema的格式：'[levels]'等
        var newBaseline = getNewBaseline(this.levels, this.props.examStudentsInfo, this.props.examPapersInfo, this.props.examId, this.props.examInfo, this.props.levelBuffers);
//对学科平均分进行校验：保证所有level下的value都是和科目数相同的
        var isValidSubjectMean = _.every(newBaseline['[subjectLevels]'], (subjectMeansObj) => _.size(subjectMeansObj.values) == _.size(examPapersInfo));
        if(!isValidSubjectMean) {
            isValid = false;
            errorMsg = '分档线设置不正确导致无效的学科平均分';
        }

        if (!isValid) {
            this.setState({
                hasError: true,
                errorMsg: errorMsg
            })
            return;
        }

        if (this.state.hasError) {
            this.setState({
                hasError: false,
                errorMsg: ''
            })
        }
        var params = initParams({ 'request': window.request, examId: this.props.examId, grade: this.props.grade, baseline: newBaseline });
        this.props.changeLevels({ levels: this.levels, subjectLevels: getSubjectLevelsFromBaseLine(newBaseline['[subjectLevels]']) });
        this.props.saveBaseline(params);

        this.props.onHide();

    }

/*
低档次的 score 一定要比高档次的 score 低，比档次的要高（相对的，低档次的percentage和count都会比高档次的高）
 */
    onInputBlur(id, event) {
        var value = parseFloat(event.target.value);
        if (!(!_.isNaN(value) && value >= 0)) return;
        var arr = id.split('-');
        var type = arr[0];
        var num = arr[1]; //是第一个（高档次） 还是 最后一个（低档次），但是赋值给levels的时候就应该颠倒过来了
        var result, cloneLevels = _.cloneDeep(this.levels);
        var {examInfo, examStudentsInfo} = this.props;

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

                cloneLevels[(_.size(cloneLevels) - 1 - num)+''].score = value;
                debugger;
                result = getLevelInfo(cloneLevels, examStudentsInfo, examInfo.fullMark);
                debugger;
                this.refs['rate-' + num].value = result[(_.size(cloneLevels) - 1 - num)+''].percentage;
    // return result[levelKey];






                // var targetIndex;//因为examStudentsInfo是有序的，所以可以用二分
                // if(num == (_.size(this.levels) - 1)) {
                //     targetIndex = _.findIndex(examStudentsInfo, (student) => student.score >= value);
                // } else {
                //     targetIndex = _.findIndex(examStudentsInfo, (student) => student.score > value);
                // }
                // if (targetIndex !== -1) {
                //     var count = examStudentsInfo.length - targetIndex;
                //     var percentage = _.round(_.multiply(_.divide(count, examInfo.realStudentsCount), 100), 2);
                // } else {
                //     var count = 0;
                //     var percentage = 0;
                // }

                // temp.score = value;
                // temp.percentage = percentage;
                // temp.count = count;

                // this.refs['rate-' + num].value = percentage;
                break;
            case 'rate':
            //根据给出的百分比，得到学生的位置，然后此学生的分数即为分数线
                // if(!((value < 100) && (!higherLevObj || (value > higherLevObj.percentage)) && (!lowerLevObj || (value < lowerLevObj.percentage)))){
                //     console.log('所给的percentage不符合规则');
                //     this.isValid = false;
                //     return;
                // }
                if(value > 100) {
                    console.log('数值不合法--不能超过100%');
                    return;
                }

                cloneLevels[(_.size(cloneLevels) - 1 - num)+''].percentage = value;
                debugger;
                result = getLevelInfo(cloneLevels, examStudentsInfo, examInfo.fullMark, false);
                debugger;
                this.refs['score-' + num].value = result[(_.size(cloneLevels) - 1 - num)+''].score;



                // var flagCount = _.ceil(_.multiply(_.divide(value, 100), examInfo.realStudentsCount));
                // var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];

                // //当修改百分比后也要换算成分数看一下是否满足相应的规则：前后要相差不少于10分（一旦修改levels，那么就自动重置levelBuffers为10）
                // //TODO:但是这里还是可能会有问题：因为一上来是按照默认百分比设置的，但是怎么保证默认的百分比设置对应的score就一定满足相差10分呢？
                // // if(!((!higherLevObj || (10 < higherLevObj.score - targetStudent.score)) && (!lowerLevObj || (targetStudent.score - lowerLevObj.score > 10)))) {
                // //     console.log('所给的score不符合规则');
                // //     this.isValid = false;
                // //     return;
                // // }

                // temp.score = targetStudent.score;
                // temp.percentage = value;

                // var targetIndex;//因为examStudentsInfo是有序的，所以可以用二分
                // if(num == (_.size(this.levels) - 1)) {
                //     targetIndex = _.findIndex(examStudentsInfo, (student) => student.score >= temp.score);
                // } else {
                //     targetIndex = _.findIndex(examStudentsInfo, (student) => student.score > temp.score);
                // }
                // var targetCount = examStudentsInfo.length - targetIndex;
                // temp.count = targetCount;

                // this.refs['score-' + num].value = targetStudent.score;
                break;
        }
        // this.isValid = true; //TODO: 这里有bug，还是要确保所有的input都是true才对。不然，先来个错的，然后跳过这个错的，再来个对的，那么isValid就是true了。。。
        this.levels[(_.size(this.levels) - 1 - num)+''] = result[(_.size(result) - 1 - num)+''];
        debugger;
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
        var {hasError, errorMsg} = this.state;

        // this.levels = this.props.levels;
        this.levLastIndex = _.size(this.levels) - 1;
//重绘要不要 来自 props
        return (
             <Modal show={ this.props.show } ref="dialog"  onHide={this.onHide.bind(this)}>
                <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                    <button className={style['dialog-close']} onClick={this.onHide.bind(this)}>
                        <i className='icon-cancel-3'></i>
                    </button>
                    设置分档线
                </Header>
                <Body style={{padding: '30px 30px 0 30px'}}>
                    <div style={{ minHeight: 230 }}>
                        <div style={{ marginBottom: 20 }}>
                            考试总分{examInfo.fullMark}分，最高分{_.last(examStudentsInfo).score}分，最低分{_.first(examStudentsInfo).score}分，将整体成绩分档为：
                            <input  ref='levelInput' onBlur={this.adjustGrades.bind(this) } style={localStyle.dialogInput} defaultValue={_this.state.levelNum} onChange={_this.onChange.bind(_this, 'levelInput') }/>档
                            <span style={_.assign({}, { color: A11 }, this.state.levelNumWrong ? { display: 'inline-block' } : { display: 'none' }) }>{this.state.levelNumMsg}</span>
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
                        <div style={{color: colorsMap.B08, margin: '20px 0 20px 40px'}}>{hasError && errorMsg ? errorMsg : ''}</div>
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0, padding: '0 0 30px 0' }}>
                    <a href="javascript:void(0)" style={_.assign({}, localStyle.btn, { backgroundColor: '#59bde5', color: '#fff' }) } onClick={_this.okClickHandler.bind(_this) }>
                        确定
                    </a>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={this.onHide.bind(this)}>
                        取消
                    </a>
                </Footer>


            </Modal>
        )
    }
}
/**
 * props:
 * totalScoreLevel: 对象数组, 包含默认的全校分档信息(分数线、上线率、人数)
 * classLevelInfo: 全校各班级的分档数据, 假数据用tableData替代
 */

/*

                    examInfo = {examInfo}
                    examStudentsInfo = {examStudentsInfo}
                    examClassesInfo = {examClassesInfo}
                    studentsGroupByClass = {studentsGroupByClass}

                    levels = {levels}

                    changeLevels = {this.props.changeLevels}

 */

class ScoreDistribution extends React.Component {
    constructor(props) {
        super(props);
        // var {studentsGroupByClass, examInfo} = this.props;
        var studentsGroupByClass = this.props.reportDS.studentsGroupByClass.toJS(), examInfo = this.props.reportDS.examInfo.toJS();
        var classList = _.map(_.keys(studentsGroupByClass), (className) => {
            return {key: className, value: examInfo.gradeName+className+'班'};
        });
        classList.unshift({key: 'totalSchool', value: '全校'});
        this.classList = classList;
        this.state = {
            showDialog: false,
            currentClass: classList[0]
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
    onClickDropdownList(item) {
        this.setState({
            currentClass: item
        })
    }

    render() {
    //Props数据结构：
        var {reportDS, changeLevels} = this.props;
        var examInfo = reportDS.examInfo.toJS(),
            examStudentsInfo = reportDS.examStudentsInfo.toJS(),
            examPapersInfo = reportDS.examPapersInfo.toJS(),
            examClassesInfo = reportDS.examClassesInfo.toJS(),
            studentsGroupByClass = reportDS.studentsGroupByClass.toJS(),
            levels = reportDS.levels.toJS(),
            levelBuffers = reportDS.levelBuffers.toJS();

    //算法数据结构
        var totalScoreLevelInfo = makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels);
        var tableData = theTotalScoreLevelTable(totalScoreLevelInfo, levels,examInfo);
        var disData = theTotalScoreLevelDiscription(totalScoreLevelInfo, levels);
        //自定义Module数据结构
        var _this = this;
        var levTotal = _.size(levels);
//饼图的数据和select放在一起。是受当前组件的状态值而改变的。通过totalScroeLevelInfo来获取
// 通过 levelTotalScoreInfo[theKey] 即可获得此scope下所有学生的分档情况

//TODO:把和饼图相关的东西抽出去，自己host state，而不是放在ScoreDistribution中，避免没必要的计算（意味一旦改变当前component的state就会导致再次运行render方法）

        var levelInfo = totalScoreLevelInfo[this.state.currentClass.key];
        var pieChartData = _.map(levelInfo, (levelObj, levelKey)=> {
            var obj = {};
            obj.name = numberMap[(parseInt(levelKey)+1)] + '档上线率';
            obj.y = levelInfo[(levTotal-1-levelKey)+''].count;  //当前scope下当前档次的人数
            return obj;
        });
        var baseCount = (this.state.currentClass.key == 'totalSchool') ? examInfo.realStudentsCount : examClassesInfo[this.state.currentClass.key].realStudentsCount;
        pieChartData.push({name: '其他', y: (baseCount - totalScoreLevelInfo[this.state.currentClass.key]['0'].sumCount)});

        let config = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            colors:[
             '#0099ff',
             '#33cc33',
             '#33cccc',
             '#ff9900',
             '#ff6633',
             '#6666cc'
           ],
            title: {
              verticalAlign: 'middle',
              text: '各档上线率',
              align:'center',
              x:-60,
              y:3,
              style:{
                'color':'#767676',
                'font-size':'14px'
              }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                  size:'180',
                  innerSize:'130',//内径大小
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (ReactHighcharts.theme && ReactHighcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: true,

                }
            },
            legend:{
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'bottom',
              borderWidth: 0,  //写'0px'会报错；
              enabled: true,
              itemStyle:{
                'font-size':'14px',
                'color':'#333333'
              },
              itemMarginBottom:levTotal <= 3 ? 15 : (levTotal === 4 ? 10 : 5)
            },
            series: [{
                name: '档位',
                colorByPoint: true,
                data: pieChartData   //动态数据
            }],
            credits: {
                enabled: false
            }

        };
        return (
            <div id='scoreDistribution' style={{borderRadius: 2, backgroundColor: BACKGROUND_COLOR, position: 'relative', borderBottom: 20}}>
                <BasicInfo examInfo={examInfo} levels={levels} examStudentsInfo={examStudentsInfo} onShowDialog={this.onShowDialog.bind(this)}/>
                <div className={schoolReportStyles['section']}>
                    <div style={{ marginBottom: 30 }}>
                        <span style={{ border: '2px solid ' + B03, display: 'inline-block', height: 20, borderRadius: 20, margin: '2px 10px 0 0', float: 'left' }}></span>
                        <span style={{ fontSize: 18, color: C12, marginRight: 20 }}>总分分档上线学生人数分布</span>
                        <span className={schoolReportStyles['title-desc']}>总分分档上线学生人数分布，可得到全校及各班在学业综合水平上的分层表现</span>
                    </div>
                    <TableView tableData={tableData} levels={levels} TableComponent={Table} reserveRows={6}/>
                    {/* 上线率高低模块 */}
                    <div style={{margin: '50px 0 20px 0'}}>
                        <span style={{color: C12, marginRight: 20}}>按上线率比较</span>
                        <span className={schoolReportStyles['title-desc']}>上线率 = 班级某档上线人数 ÷ 全校某档上线人数，因各班级人数不同，通过比较累积上线率，能更准确的反映各班级上线情况</span>
                    </div>
                    <OnlineInfo levTotal={levTotal} disData={disData} examInfo={examInfo}/>
                    <div style={{ display: 'inline-block', width: 380, height:240, position: 'relative', float: 'right'}}>
                        {/*--------------------------------  总分分档上线学生饼图 -------------------------------------*/}
                        <ReactHighcharts config={config} style={{ display: 'inline-block', width: 380, height: 240, border: '1px solid ' + colorsMap.C04 }}></ReactHighcharts>
                        {/*--------------------------------  饼图的select -------------------------------------*/}
                        <span style={{ position: 'absolute', right: 30, top: 30 }}><DropdownList onClickDropdownList={_this.onClickDropdownList.bind(_this) } list={_this.classList}/></span>
                    </div>
                    {/*--------------------------------  总分分档上线Dialog -------------------------------------*/}
                    <Dialog examId={this.props.examId} grade={this.props.grade} levels={levels} levelBuffers={levelBuffers} examInfo={examInfo} examStudentsInfo={examStudentsInfo} examPapersInfo={examPapersInfo} changeLevels={changeLevels} saveBaseline={this.props.saveBaseline} show={_this.state.showDialog} onHide={_this.onHideDialog.bind(_this) }  />
            </div>
        </div>
        )
    }

}

export default ScoreDistribution;

/**
 * 上线率高低模块组件
 * props:
 * levTotal, disData
 */
class OnlineInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showScroll: '',
            needScroll: _.size(this.props.disData) > 3 ? true : false
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps && _.size(nextProps.disData) > 3) {
            this.setState({needScroll: true})
        }
    }
    onMouseEnter(e){
        if (!this.state.needScroll) return;
        var $target = $(e.target);
        var id = $target.attr('id');
        if (!id) {
            id = $target.parents('.online-block').attr('id');
        }
        this.setState({
            showScroll: id
        })
    }
    onMouseLeave(e){
        if (!this.state.needScroll) return;
        var $target = $(e.target);
        var id = $target.attr('id');
        if (!id) {
            id = $target.parents('.online-block').attr('id');
        }
        this.setState({
            showScroll: ''
        })
    }
    render() {
        var {levTotal, disData, examInfo} = this.props;
        var disTotal = _.size(disData);
        return (
            <div style={_.assign({}, { display: 'inline-block' }) }>
                <div id='high' className='online-block' style={_.assign({}, { width: 740, minHeight: 110, border: '1px solid ' + colorsMap.C04, padding: '30px 0 0 0', marginBottom: 20 }, disTotal > 3 && this.state.showScroll === 'high' ? { overflowX: 'scroll' } : { overflowX: 'hidden' }) }
                    onMouseEnter={this.onMouseEnter.bind(this) } onMouseLeave={this.onMouseLeave.bind(this) }>
                    <div style={_.assign({}, { width: disTotal !== 0 ? 215 * disTotal + 95 : '100%'}) }>
                        {
                            (_.size(disData) > 0) ? (
                                _.map(_.range(levTotal), (index) => {
                                    var levelStr = numberMap[(index + 1)], levObj = disData[(levTotal - 1 - index)];
                                    var classStr = _.join(_.map(levObj.high, (className) => className + '班'), '、') + '；';
                                    return (
                                        <div key={index} style={_.assign({}, { display: 'inline-block', width: 215, paddingLeft: 30 }, index === levTotal - 1 ? {} : { borderRight: '1px solid ' + C05 }) }>
                                            <p style={{ fontSize: 12 }}>{levelStr}档线上线率高的班级</p>
                                            <p style={{ width: '100%', color: B08, marginBottom: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}} title={classStr}>{classStr}</p>
                                        </div>
                                    )
                                })
                            ) : (<p style={{paddingLeft: 30}}>只有一个班级，没有可比性</p>)
                        }
                    </div>
                </div>
                <div id='low' className='online-block' style={_.assign({}, { width: 740, minHeight: 110, border: '1px solid ' + colorsMap.C04, padding: '30px 0 0 0', marginBottom: 20 }, disTotal > 3 && this.state.showScroll === 'low' ? { overflowX: 'scroll' } : { overflowX: 'hidden' }) }
                    onMouseEnter={this.onMouseEnter.bind(this) } onMouseLeave={this.onMouseLeave.bind(this) }>
                    <div style={_.assign({}, { width: disTotal !== 0 ? 215 * disTotal + 95 : '100%'}) }>
                        {
                            (_.size(disData) > 0) ? (
                                _.map(_.range(levTotal), (index) => {
                                    var levelStr = numberMap[(index + 1)], levObj = disData[(levTotal - 1 - index)];
                                    var classStr = _.join(_.map(levObj.low, (className) => className + '班'), '、') + '；';
                                    return (
                                        <div key={index} style={_.assign({}, { display: 'inline-block', width: 215, paddingLeft: 30 }, index === levTotal - 1 ? {} : { borderRight: '1px solid ' + C05 }) }>
                                            <p style={{ fontSize: 12 }}>{levelStr}档线上线率低的班级</p>
                                            <p style={{ width: '100%', color: B08, marginBottom: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}} title={classStr}>{classStr}</p>
                                        </div>
                                    )
                                })
                            ) : (<p style={{paddingLeft: 30}}>只有一个班级，没有可比性</p>)
                        }
                    </div>
                </div>
            </div>
        )
    }
}

//算法：按照分档标准创建对应的segments。segments最小值是最低档线，最大值是满分（即，一档线区间是(一档线score, fullMark]）
/**
 * 用来画Table的info数据结构
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     table的matrix。这里是夹心header，所以不提供header，从levels中获取行排列（夹心栏就按照图表给的顺序：['人数',
 *   '累计人数', '累计占比']）
 */
function theTotalScoreLevelTable(totalScoreLevelInfo, levels,examInfo) {
    var table = [];
    var totalSchoolObj = totalScoreLevelInfo.totalSchool;

    //全校信息总是table的第一行
    var totalSchoolRow = makeLevelTableRow(totalSchoolObj);
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    _.each(totalScoreLevelInfo, (levInfoItem, theKey) => {
        if(theKey == 'totalSchool') return;
        var totalClassRow = makeLevelTableRow(levInfoItem);
        totalClassRow.unshift(examInfo.gradeName + theKey+'班');
        table.push(totalClassRow);
    });
    return table;
}

function makeLevelTableRow(rowInfo) {
    //rowInfo每一个levelKey都有对应的对象，而且顺序是对应levels的（即和segments是一样的，都是从低到高，而显示的时候是从高到底，所以这里需要反转）
    var tempMap = _.map(rowInfo, (rowObj, levelKey) => [rowObj.count, rowObj.sumCount, rowObj.sumPercentage+'%']);
    // vat tempMap = _.map(rowInfo, (rowObj, levelKey) => [rowObj.count, rowObj.sumCount, rowObj.sumPercentage + '%']);
    return _.concat(..._.reverse(tempMap));
}


/**
 * 由档次的维度来找出此档次上线率高和低的班级，取多少位的排名取决于总共有多少个班级
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     [description]
 */
/*
首先要去掉totalSchool
{
    <className>: {
        <levelKey>: {
            count:
            sumCount:
            sumPercentage:
        }
    }
}

==>
[
    {levelKey: , class: , sumPercentage: }
]
==>
对上面的数组按照levelKey进行groupBy
{
    <levelKey>: [<obj>]
}

按照规则得到结果
 */
/**
 * 总分分档上线学生模块的分析描述文案
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     [description]
 * {
 *     <levelKey>: {
 *         low: [<className>]
 *         high: [<className>]
 *     }
 * }
 */
function theTotalScoreLevelDiscription(totalScoreLevelInfo, levels) {
//找出各个档次各个班级的累积上线率，并按照levelKey进行分组
    var result = {}, low, high;

    var totalScoreLevelInfoGroupByLevel = _.groupBy(_.concat(..._.map(totalScoreLevelInfo, (theObj, theKey) => {
        if(theKey == 'totalSchool') return [];
        return _.map(theObj, (levObj, levelKey) => {
            return {levelKey: levelKey, sumPercentage: levObj.sumPercentage, 'class': theKey}
        })
    })), 'levelKey');

    var levelClassCount = _.size(totalScoreLevelInfo) - 1;
//TODO: 实现文案
    if(levelClassCount == 1) return result;
    //根据规则得到每个档次高低的班级名称：这里是和levels中的顺序是一一对应的，即'0'是一档。。。
    _.each(levels, (levObj, levelKey) => {
        var orderLevelTotalScore = _.sortBy(totalScoreLevelInfoGroupByLevel[levelKey], 'sumPercentage');//从低到高
        if(orderLevelTotalScore.length == 0) return;

        if(levelClassCount == 2 || levelClassCount == 3) {
            low = _.map(_.take(orderLevelTotalScore, 1), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 1), (item) => item.class);
        } else if(levelClassCount >= 4 && levelClassCount < 7) {
            low = _.map(_.take(orderLevelTotalScore, 2), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 2), (item) => item.class);
        } else if(levelClassCount >= 7) {
            low = _.map(_.take(orderLevelTotalScore, 3), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 3), (item) => item.class);
        }

        result[levelKey] = {
            low: _.reverse(low),
            high: _.reverse(high)
        }
    });
    return result;
}


function theTotalScoreLevelChart(levelTotalScoreInfo, theKey) {
// 通过 levelTotalScoreInfo[theKey] 即可获得此scope下所有学生的分档情况
}

function chageStudentsScope(theKey) {
//改变观察的学生范围
}

/**
 * 获取总分分档的info数据结构（info数据结构是一种具有典型格式的数据结构： {totalSchool: {...}, <className>: {...} } ）每一个key中的value对象中的key就是横向扫描
 * 的属性，个数和顺序都一样！！！这里totalSchool和<className>其实就是列的key，所以info是一个二重的Map，按照需要的matrixTable创建，横向扫描，一重key是列的key，二
 * 重key是行的key。列key没有顺序，行key有顺序。（比如如果是分档，则高档在前，依次排列，如果是科目，则语数外在前，按照subjectWeight排列）
 * @param  {[type]} examInfo             [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} examClassesInfo      [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} levels               [description]
 * @return 这里横向轴是分档所以对象就是分档信息
 *     {
 *         totalSchool: {
 *
 *         },
 *         <className>: {
 *
 *         }
 * }
 */
function makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels) {
    //因为levels中是高档次（即score值大的）在前面，所以需要反转顺序
    debugger;
    // var levelSegments = _.map(levels, (levObj) => levObj.score);
    // //用来获取全校各档次的人数  -- segments的最后一个肯定是fullMark，而第一个是最低档的分数
    // levelSegments.push(examInfo.fullMark);

    var result = {};

    //获取到分档Map并且过滤到-1的情况（因为最小值是最低分档线，而又学生的成绩会低于最低分档线）
    //{<levelKey>: <students>} 其中levelKey是String类型的，并且值小代表的是低分段（但是levels中）
    //从makeSegmentsCount得到的 countsMap中的 levelKey的个数一定是 segments.length-1 个，所以省去了后面判断没有某一个levelKey对应的数据则要补充。

//makeSegmentsCount 获取的是：1.和segments顺序对应的key的count，也就是说低的levelKey对应的是低分段的count  2.包含[0, segments.length-2]共
//segments.length-1个有效值

    // var countsGroupByLevel = makeSegmentsCount(examStudentsInfo, levelSegments);
    //开始创建标准的resultInfo数据结构：
    result.totalSchool = {};
    _.each(levels, (levelObj, levelKey) => {
        result.totalSchool[levelKey] = {
            count: levelObj.count,
            sumCount: levelObj.sumCount,
            sumPercentage: levelObj.percentage
        }
    });

    // _.each(countsGroupByLevel, (count, levelKey) => {
    //     result.totalSchool[levelKey] = makeLevelInfoItem(levelKey, countsGroupByLevel, examInfo.realStudentsCount); //TODO:levels中的percentage就是累占比呀！
    // });

    _.each(studentsGroupByClass, (studentsFromClass, className) => {
        var classCountsGroupByLevel = getLevelInfo(levels, studentsFromClass, examInfo.fullMark);
        var temp = {};
        _.each(classCountsGroupByLevel, (levelObj, levelKey) => {
            temp[levelKey] = {
                count: levelObj.count,
                sumCount: levelObj.sumCount,
                sumPercentage: levelObj.percentage
            }
        });


        // var classCountsGroupByLevel = makeSegmentsCount(studentsFromClass, levelSegments);
        // var temp = {};
        // _.each(classCountsGroupByLevel, (count, levelKey) => {
        //     temp[levelKey] = makeLevelInfoItem(levelKey, classCountsGroupByLevel, examClassesInfo[className].realStudentsCount);
        // });
        result[className] = temp;
    });

    return result;
}

// function makeLevelInfoItem(levelKey, countsGroupByLevel, baseCount) {
//     var levItem = {};

//     levItem.count = countsGroupByLevel[levelKey];
//     //各档的累计人数等于=上一个高档次的累计人数+当前档次的人数（最高档的累计人数和人数是相等的）
//     levItem.sumCount = _.sum(_.map(_.pickBy(countsGroupByLevel, (v, k) => k >= levelKey), (count) => count));
//     levItem.sumPercentage = _.round(_.multiply(_.divide(levItem.sumCount, baseCount), 100), 2);//TODO:其实这里没必要再次计算百分比--因为levels里percetage
//                                                                                 //就是sumPercentage！！！

//     return levItem;
// }

/**
 *
 * @param  {[type]} newLevels        [description]
 * @param  {[type]} examStudentsInfo [description]
 * @param  {[type]} examPapersInfo   [description]
 * @param  {[type]} examFullMark     [description]
 * @return {[type]}                  [description]
{
        grade: String,
        [levels]: Object,
        [subjectLevels]: Object,
        [levelBuffers]: Object
}
 */

/*

    {
        grade: xxx,
        levels: [
            {
                key: xxx,
                score: xxx,
                percentage: xxx,
                count: xxx
            },
            ...
        ],
        subjectLevels: [
            {
                levelKey:xxx,
                values: [
                    {
                        id: xxx,
                        mean: xxx,
                        name: xxx
                    },
                    ...
                ]
            },
            ...
        ],
        levelBuffers: [
            {
                key: xxx,
                score: xxx
            },
            ...
        ]
    },

 */

function getNewBaseline(newLevels, examStudentsInfo, examPapersInfo, examId, examInfo, levelBuffers) {
    //通过新的levels计算subjectMeans，levelBuffer不变
    var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
    _.each(newLevels, (levObj, levelKey) => {
        var subjectMean = makeLevelSubjectMean(levObj.score, examStudentsInfo, examPapersInfo, examInfo.fullMark);
        // var subjectLevels = _.values(subjectMean);
        result['[subjectLevels]'].push({levelKey: levelKey, values: subjectMean});
        result['[levels]'].push({key: levelKey, score: levObj.score, percentage: levObj.percentage, count: levObj.count, sumCount: levObj.sumCount});
        debugger;
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

function getSubjectLevelsFromBaseLine(originalSubjectLevels) {
    var result = {};
    _.each(originalSubjectLevels, (obj) => {
        result[obj.levelKey] = obj.values;
    });
    return result;
}


/*


let basicInfos = {
    fullScore: 750,
    maxScore: 680
}

let numberMapper = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十'

}


let tableData_example = {
    tds: [
        ['全部', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['一班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['二班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['三班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%']
    ]
}
var tableData = {
    '全校': [
        {
            score: 520,
            rate: 15,
            num: 100
        },
        {
            score: 480,
            rate: 35,
            num: 360
        },
        {
            score: 360,
            rate: 50,
            num: 890
        }
    ],
    '1班': [
        {
            score: 520,
            rate: 5,
            num: 100
        },
        {
            score: 480,
            rate: 55,
            num: 360
        },
        {
            score: 360,
            rate: 40,
            num: 890
        }
    ],
    '2班': [
        {
            score: 520,
            rate: 11,
            num: 100
        },
        {
            score: 480,
            rate: 22,
            num: 360
        },
        {
            score: 360,
            rate: 67,
            num: 890
        }
    ],
    '3班': [
         {
            score: 520,
            rate: 89,
            num: 100
        },
        {
            score: 480,
            rate: 1,
            num: 360
        },
        {
            score: 360,
            rate: 10,
            num: 890
        }
    ]

}


 */
