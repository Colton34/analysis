import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {RadioGroup, Radio} from 'react-radio-group';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

import {makeSubjectLevels} from '../../../../sdk';
import {isNumber} from '../../../../lib/util';
import {changeLevelAction, saveBaselineAction} from '../../../../reducers/reportDS/actions';
import commonClass from '../../../../styles/common.css';
import {DEFAULT_LEVELBUFFER as defaultLevelBuffer, NUMBER_MAP as numberMap, DEFAULT_LEVEL_RADIO_RANGE as defaultRadioRange} from '../../../../lib/constants';

var validateRules = [validateLevel, validateLevelBuffer, validateSubjectLevel];
var validateScoreRules = _.concat([validateIsNumber, validateValueRange], validateRules);
var validatePercentageRules = _.concat([validateIsNumber, validatePercentageRange], validateRules);

class LevelInput extends React.Component {
/*
a.controlled模式
b.onChange和onBlur都进行校验
c.自定义校验规则
d.校验的结果作为form valid的输入
 */
    constructor(props) {
        super(props);
        this.state = {
            validationStarted: false,
            value: this.props.value,
            isValid: true
        }
    }

    componentWillMount() {
        var startValidation = function() {
            this.setState({
                validationStarted: true
            })
        }.bind(this);
        if (this.props.value) {
            startValidation();
        } else {
            this.prepareToValidate = _.debounce(startValidation, 1000);
        }
    }

    prepareToValidate() {}
    handleChange(e) {
        if (this.state.validationStarted) {
            this.prepareToValidate();
        }
        //如果e.target.value==''？怎么处理？？？
        // var inputValue = parseFloat(e.target.value);
        var newFormLevelInfo = getNewChangeFormLevelInfo(e.target.value, this.props.info, this.props.formLevelInfo, this.props.examStudentsInfo, this.props.examInfo.fullMark);
        // debugger;
        var errorMsg = this.props.validation(e.target.value, newFormLevelInfo);
        this.props.setFormLevelState(newFormLevelInfo, {levelKey: this.props.info.id, isValid: !!errorMsg});
        this.props.setErrorMessage(errorMsg);//没有提到Form级别，通过form给errorMsg（就像通过inputGroup给每一个孩子input valid状态的思路），是因为需要判断是哪一个level出现了errorMsg（input不需要区分，两个都是同步valid的）
    }

//验证：正在输入，光标没有离开input，但是通过鼠标直接点击submit那么会跳过handleBlur么？
    handleBlur(e) {
        if (this.state.validationStarted) {
            // var inputValue = parseFloat(e.target.value);
            var newFormLevelInfo = getNewChangeFormLevelInfo(e.target.value, this.props.info, this.props.formLevelInfo, this.props.examStudentsInfo, this.props.examInfo.fullMark);
            var errorMsg = this.props.validation(e.target.value, newFormLevelInfo);
            this.props.setFormLevelState(newFormLevelInfo, {levelKey: this.props.info.id, isValid: !!errorMsg});
            this.props.setErrorMessage(errorMsg);//没有提到Form级别，通过form给errorMsg（就像通过inputGroup给每一个孩子input valid状态的思路），是因为需要判断是哪一个level出现了errorMsg（input不需要区分，两个都是同步valid的）
        }
    }

    render() {
        var className = (this.props.isValid) ? 'valid' : 'invalid';
        return (
            <div className={className}>
                <input
                  type='text'
                  placeholder={this.props.value}
                  info={this.props.info}
                  value={this.props.value}
                  onChange={this.handleChange.bind(this)}
                  onBlur={this.handleBlur.bind(this)}
                />
            </div>
        );
    }
}

class LevelInputGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: ''
        }
    }

    setErrorMessage(errorMsg) {
        this.setState({
            errorMsg: errorMsg
        })
    }

    render() {
        var formLevelInfo = this.props.formLevelInfo;
        var levelLastIndex = _.size(formLevelInfo) - 1;
        // var currentLevel = formLevelInfo[(levelLastIndex-this.props.id)+''];
        var currentLevel = formLevelInfo[this.props.id];

        var examInfo = this.props.reportDS.examInfo.toJS();
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        //设计：当formLevelInfo改变，走到这里（input持有setFormLevelInfo）那么，在这里调用validation--即可？否则input的valid不好设置（其实也可以，input的valid状态就是可以绑定到state.errorMsg）
        return (
            <div>
                <div>
                    <label htmlFor={this.props.id+'-'+'input'}>{numberMap[(levelLastIndex-this.props.id)+1] + '档线'}</label>
                    <LevelInput formLevelInfo={formLevelInfo} value={currentLevel.score} valid={!!this.state.errorMsg} info={{id: this.props.id, type: 'score'}} examStudentsInfo={examStudentsInfo} examInfo={examInfo} validation={this.props.validation} setFormLevelState={this.props.setFormLevelState} setErrorMessage={this.setErrorMessage.bind(this)} />
                    <LevelInput formLevelInfo={formLevelInfo} value={currentLevel.percentage} valid={!!this.state.errorMsg} info={{id: this.props.id, type: 'percentage'}} examStudentsInfo={examStudentsInfo} examInfo={examInfo} validation={this.props.validation} setFormLevelState={this.props.setFormLevelState} setErrorMessage={this.setErrorMessage.bind(this)} />
                </div>
                {(this.state.errorMsg) ? (<div className={commonClass['validation-error']}>{this.state.errorMsg}</div>) : ''}
            </div>
        );
    }
}

class LevelRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedValue: defaultRadioRange[0]
        }
    }

    handleChange(levelCount) {
        this.setState({selectedValue: levelCount});
        this.props.changeLevelCount(levelCount);
    }

    render() {
        return (
            <RadioGroup
                name="levels"
                selectedValue={this.state.selectedValue}
                onChange={this.handleChange.bind(this)}>
                <span>本场最高分{_.last(this.props.examStudentsInfo).score}分。当前设置为</span>
                {
                    _.map(defaultRadioRange, (levelCount) => {
                        return (
                            <label id={levelCount}>
                                <Radio value={levelCount} />{numberMap[levelCount]+'档'}
                            </label>
                        )
                    })
                }
            </RadioGroup>
        );
    }
}

class LevelForm extends React.Component {
    constructor(props) {
        super(props);
        var childValidState = {}, propsLevels = this.props.reportDS.levels.toJS();
        _.each(propsLevels, (levelObj, levelKey) => childValidState[levelKey] = true);
        this.state = {
            formLevelInfo: _.cloneDeep(propsLevels),
            childValidState: childValidState
        }
    }

    changeLevelCount(count) {
        var preLength = _.size(this.state.formLevelInfo);
        var theDiff = Math.abs(preLength - count);
        var newChildValidState = (count > preLength) ? (_.concat(_.map(_.range(theDiff), (i) => false), _.map(_.range(_.size(this.state.formLevelInfo)), (i) => true))) : (_.map(_.range(count), (i) => true));
        var newFormLevelInfo = getNewCountFormLevelInfo(this.state.formLevelInfo, count);
        this.setState({
            formLevelInfo: newFormLevelInfo,
            childValidState: newChildValidState
        })
    }

    setFormLevelState(newFormLevelInfo, levelValidSate) {
        var newChildValidState = _.cloneDeep(this.state.childValidState);
        newChildValidState[levelValidSate.levelKey] = levelValidSate.isValid;
        this.setState({
            formLevelInfo: newFormLevelInfo,
            childValidState: newChildValidState
        })
    }

    validation(value, newFormLevelInfo) {
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS(), examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), examFullMark = this.props.reportDS.examInfo.toJS().fullMark;
        return _.every(validateRules, (validateRuleFun) => validateRuleFun({value: value, formLevelInfo: newFormLevelInfo, examStudentsInfo: examStudentsInfo, examPapersInfo: examPapersInfo, examFullMark: examFullMark}));
    }

    handleSubmit() {//TODO:这里怎么获取；检查所有的bind函数是否传递了参数
        //更新reportDS -- reducer  更新server -- action
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS(), examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), examInfo = this.props.reportDS.examInfo.toJS();
        var examFullMark = examInfo.fullMark;
        var newSubjectLevels = makeSubjectLevels(this.state.formLevelInfo, examStudentsInfo, examPapersInfo, examFullMark);
        // var newLevelBuffers = _.map(_.range(_.size(this.state.formLevelInfo)), (i) => defaultLevelBuffer); TODO: 重构，在这里init new buffer，而不要到reducer那里
        var newBaseline = getNewBaseline(this.state.formLevelInfo, newSubjectLevels, this.props.examId, examInfo, defaultLevelBuffer);
        var params = initParams({ 'request': window.request, examId: this.props.examId, grade: this.props.grade, baseline: newBaseline });
        this.props.changeLevels({ levels: this.state.formLevelInfo, subjectLevels: newSubjectLevels });
        this.props.saveBaseline(params);
        this.props.hideModal();
    }

    handleCancel() {
        this.props.hideModal();
    }

    render() {
        var formLevelInfo = this.state.formLevelInfo;
        var formIsValid = _.every(this.state.childValidState, (v) => v);
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();

        var levelLastIndex = _.size(formLevelInfo) - 1;
        return (
            <form action={this.handleSubmit.bind(this)}>
                <LevelRadioGroup levelKeys={_.keys(formLevelInfo)} changeLevelCount={this.changeLevelCount.bind(this)} examStudentsInfo={examStudentsInfo} />
                {
                    _.map(formLevelInfo, (formLevObj, levelKey) => {
                        return (
                            <LevelInputGroup id={levelLastIndex-levelKey} reportDS={this.props.reportDS} formLevelInfo={formLevelInfo} setFormLevelState={this.setFormLevelState.bind(this)} validation={this.validation.bind(this)} />
                        )
                    })
                }
                <div>
                    <button type="submit" disabled={!formIsValid}>确认</button>
                    <button onClick={this.handleCancel.bind(this)}>取消</button>
                </div>
            </form>
        );
    }
}


class HeaderModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: false
        }
    }

    showModal() {
        this.setState({
            isDisplay: true
        })
    }

    hideModal() {
        this.setState({
            isDisplay: false
        })
    }

    render() {
        return (
            <div>
                <span>分档分数线</span>
                <button onClick={this.showModal.bind(this)}>设置分档</button>
                <Modal show={ this.state.isDisplay } ref="dialog"  onHide={this.hideModal.bind(this)}>
                    <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                        <button className={commonClass['dialog-close']} onClick={this.hideModal.bind(this)}>
                            <i className='icon-cancel-3'></i>
                        </button>
                        设置分档线
                    </Header>
                    <LevelForm reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} hideModal={this.hideModal.bind(this)} />
                </Modal>
            </div>
        );
    }
}

// function LevelFormHeader() {
//     return (
//         <div style={{ marginBottom: 20 }}>
//             考试总分{examInfo.fullMark}分，最高分{_.last(examStudentsInfo).score}分，最低分{_.first(examStudentsInfo).score}分，将整体成绩分档为：
//             <input  ref='levelInput' onBlur={this.adjustGrades.bind(this) } style={localStyle.dialogInput} defaultValue={_this.state.levelNum} onChange={_this.onChange.bind(_this, 'levelInput') }/>档
//             <span style={_.assign({}, { color: A11 }, this.state.levelNumWrong ? { display: 'inline-block' } : { display: 'none' }) }>{this.state.levelNumMsg}</span>
//         </div>
//     )
// }

export default connect()(HeaderModule);
function mapStateToProps(state, ownProps) {
    return {
        reportDS: ownProps.reportDS
    }
}
function mapDispatchToProps(dispatch) {
    return {
        changeLevels: bindActionCreators(changeLevelAction, dispatch),
        saveBaseline: bindActionCreators(saveBaselineAction, dispatch)
    }
}

function getNewChangeFormLevelInfo(inputValue, inputInfo, oldFormLevelInfo, examStudentsInfo, examFullMark) {
    var newChangeFormLevelInfo = _.cloneDeep(oldFormLevelInfo);
    // debugger;
    var otherInputType = (inputInfo.type == 'score') ? 'percentage' : 'score';
    var result = getOtherInputValue(otherInputType, inputValue, inputInfo.id, oldFormLevelInfo, examStudentsInfo, examFullMark);
    // debugger
    newChangeFormLevelInfo[inputInfo.id] = result;
    // debugger;
    return newChangeFormLevelInfo;
}

//TODO:在levels里添加sumCount，修改percentage为sumPercentage
function getOtherInputValue(otherInputType, inputValue, levelKey, formLevelInfo, examStudentsInfo, examFullMark) {
    //通过给的当前的值计算对应的input的值
    if(!isNumber(inputValue)) {
        return {
            count: 0,
            sumCount: 0,
            score: inputValue,
            percentage: inputValue
        }
    }
    inputValue = parseFloat(inputValue);
    var levelLastIndex = _.size(formLevelInfo) - 1;
    // debugger;
    if(otherInputType == 'percentage') {
        // debugger;
        //根据score计算percentage和count。但是percentage是累积的percentage
        if(levelKey == '0') { // 【应该用不到此边界判断】 && levelKey != levelLastIndex+''
            var highLevelScore = formLevelInfo[(parseInt(levelKey)+1)+''].score;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score >= inputValue) && (obj.score <= highLevelScore)).length;
            var sumCount = _.filter(examStudentsInfo, (obj) => obj.score >= inputValue).length;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            // debugger;
            return {
                count: count,
                sumCount: sumCount,
                score: inputValue,
                percentage: sumPercentage
            }
        } else if(levelKey == levelLastIndex+'') {
            var highLevelScore = examFullMark;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score > inputValue) && (obj.score <= highLevelScore)).length;
            var sumCount = count;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            return {
                count: count,
                sumCount: sumCount,
                score: inputValue,
                percentage: sumPercentage
            }
        } else {
            var highLevelScore = formLevelInfo[(parseInt(levelKey)+1)+''].score;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score > inputValue) && (obj.score <= highLevelScore)).length;
            var sumCount = _.filter(examStudentsInfo, (obj) => obj.score > inputValue).length;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            return {
                count: count,
                sumCount: sumCount,
                score: inputValue,
                percentage: sumPercentage
            }
        }
    } else {
        //根据percentage计算score和count
        //用例：设置了30%，计算出分数线是500，但是500的有好多人，容纳到30%的数量里不能包括全部分数线是500的学生，这里采取截断方式--即去掉这些学生，虽然他们上线了--即人数就不准了。--update: 不，要保证数据准确！！！所以对输入的percentage进行纠正~
        //TODO: 重构~太冗余了。
        if(levelKey == '0') {//低档次
            var flagCount = _.ceil(_.multiply(_.divide(inputValue, 100), examStudentsInfo.length));
            var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
            var currentLevelScore = targetStudent.score;

            var highLevelScore = formLevelInfo[(parseInt(levelKey)+1)+''].score;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score <= highLevelScore)).length;
            var sumCount = _.filter(examStudentsInfo, (obj) => obj.score >= currentLevelScore).length;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            return {
                count: count,
                sumCount: sumCount,
                score: currentLevelScore,
                percentage: sumPercentage
            }
        } else if(levelKey == levelLastIndex+'') {
            var flagCount = _.ceil(_.multiply(_.divide(inputValue, 100), examStudentsInfo.length));
            var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
            var currentLevelScore = targetStudent.score;

            var highLevelScore = examFullMark;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore)).length;
            var sumCount = count;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            return {
                count: count,
                sumCount: sumCount,
                score: currentLevelScore,
                percentage: sumPercentage
            }
        } else {
            var flagCount = _.ceil(_.multiply(_.divide(inputValue, 100), examStudentsInfo.length));
            var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
            var currentLevelScore = targetStudent.score;

            var highLevelScore = formLevelInfo[(parseInt(levelKey)+1)+''].score;
            var count = _.filter(examStudentsInfo, (obj) => (obj.score > currentLevelScore) && (obj.score <= highLevelScore)).length;
            var sumCount = _.filter(examStudentsInfo, (obj) => obj.score > currentLevelScore).length;
            var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
            return {
                count: count,
                sumCount: sumCount,
                score: currentLevelScore,
                percentage: sumPercentage
            }
        }
    }
}

//让isSubmit变为false
function getNewCountFormLevelInfo(oldFormLevelInfo, count) {
    var newCountFormLevelInfo = {};
    var preLength = _.size(oldFormLevelInfo);
    var theDiff = Math.abs(preLength - count);

    var newCountFormLevelInfo = {}, oldTargetLevelObj;
    if(count < preLength) {
        ////由少转向多，则添加最低档的数据，原来的档次向后顺延, 去掉低档次，保留高档次  5 3 [4, 3, 2] 丢掉[1, 0]
        _.each(_.range(count), (index) => {
            oldTargetLevelObj = oldFormLevelInfo[(index+theDiff) + ''];
            newCountFormLevelInfo[index+''] = {score: oldTargetLevelObj.score, count: oldTargetLevelObj.count, percentage: oldTargetLevelObj.percentage};

            // var targetScore = oldFormLevelInfo[(index+theDiff) + ''].score;
            // var targetCount = (index == 0) ? _.size(_.filter(this.props.examStudentsInfo, (s) => s.score >= targetScore)) : _.size(_.filter(this.props.examStudentsInfo, (s) => s.score > targetScore));
            // var targetPercentage = _.round(_.multiply(_.divide(targetCount, this.props.examStudentsInfo.length), 100), 2);
        });
    } else {
        _.each(_.range(theDiff), (index) => {
            newCountFormLevelInfo[index+''] = {score: 0, count: 0, percentage: 0}
        });
        _.each(_.range(preLength), (index) => {
            oldTargetLevelObj = oldFormLevelInfo[index+''];
            newCountFormLevelInfo[(index+theDiff)+''] = {score: oldTargetLevelObj.score, count: oldTargetLevelObj.count, percentage: oldTargetLevelObj.percentage};
            //为什么重新算一遍，直接copy过来不可以么？-- 是为了统一计算方式：最低的【双合】，其他高档次（左开右合】
            // var targetScore = oldFormLevelInfo[index+''].score;
            // var targetCount = _.size(_.filter(this.props.examStudentsInfo, (s) => s.score > targetScore));
            // var targetPercentage = _.round(_.multiply(_.divide(targetCount, this.props.examStudentsInfo.length), 100), 2);
        });
    }
    return newCountFormLevelInfo;
}

/*
校验规则：必须要有；必须是数值； a.分数不能高于满分，不能低于0分  b.高档次的分数必须高于低档次的分数  c.修改levels会间接修改levelBuffers，默认为10（这样拉开20分档，保证有一定的空间从而有数据有意义），则保证levelBuffers作用到levels后依然保证高档次大于低档次
        d.通过levels计算得到的subjectLevels要符合规则--1.首先各个档次的各个学科平均分都要有 2.其次高档次的某学科平均分要大于相应的低档次学科平均分
*/
function validateIsNumber({value}) {
    return !!value &&isNumber(value);}

function validateValueRange({value, examFullMark}) {
    return (value > 0) && (value < examFullMark)
}

function validatePercentageRange(value) {
    return (value > 0) && (value <= 100);
}

function validateLevel({formLevelInfo}) {
    var levelScores = _.map(_.values(formLevelInfo), (levelObj) => levelObj.score);
    return _.every(_.range(_.size(formLevelInfo)-1), (i) => levelScores[i+1] > levelScores[i]);
}

function validateLevelBuffer({formLevelInfo, examFullMark}) {
    //由所给的levels创建对应的segments
    var levelBufferSegments = [];
    _.each(formLevelInfo, (levelObj, levelKey) => {
        var low = levelObj.score - defaultLevelBuffer;
        var high = levelObj.score + defaultLevelBuffer;
        levelBufferSegments = _.concat(levelBufferSegments, [low, high]);
    });
    //对levelBufferSegments进行校验
    var isValid = _.every(levelBufferSegments, (v) => (validateIsNumber(v) && validateValueRange(v, examFullMark)));
    if(!isValid) return isValid;
    return _.every(_.range(_.size(levelBufferSegments)-1), (i) => levelBufferSegments[i+1] > levelBufferSegments[i]);
}

function validateSubjectLevel({formLevelInfo, examStudentsInfo, examPapersInfo, examFullMark}) {
    var newSubjectLevels = makeSubjectLevels(formLevelInfo, examStudentsInfo, examPapersInfo, examFullMark);
    var isValid = _.every(newSubjectLevels, (levelSubjectsObj, levelKey) => _.size(levelSubjectsObj) === _.size(examPapersInfo));
    if(!isValid) return isValid;
    //找到每个学科的有序序列
    var subjectLevelSegments = _.map(examPapersInfo, (obj, pid) => {
        return _.map(newSubjectLevels, (levelSubjectsObj, levelKey) => levelSubjectsObj[pid]);
    });
    return _.every(subjectLevelSegments, (singleSubjectLevelSegments) => {
        var ifValid = _.every(singleSubjectLevelSegments, (v) => (validateIsNumber(v) && validateValueRange(v, examFullMark)));
        if(!ifValid) return ifValid;
        return _.every(_.range(_.size(singleSubjectLevelSegments)-1), (i) => singleSubjectLevelSegments[i+1] > singleSubjectLevelSegments[i]);
    })
}

function getNewBaseline(newLevels, newSubjectLevels, examId, examInfo, defaultLevelBuffer) {
    var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
    _.each(newLevels, (levelObj, levelKey) => {
        result['[subjectLevels]'].push({levelKey: levelKey, values: newSubjectLevels});
        result['[levels]'].push({key: levelKey, score: levelObj.score, percentage: levelObj.percentage, count: levelObj.count});
        result['[levelBuffers]'].push({key: levelKey, score: defaultLevelBuffer});
    });
    return result;
}


// var App = React.createClass({
//   getInitialState: function(){
//     return {value: "", price: ""};
//   },
//   handleChange: function(e){
//     this.setState({
//       value: e.target.value
//     })
//   },
//   handlePriceChange: function(e){
//     this.setState({
//       price: e.target.value
//     })
//   },
//   validate: function(state){
//     return {
//       value: state.value.indexOf('react') !== -1,
//       price: /^\$\d+\.\d+$/.test(state.price)
//     }
//   },
//   render: function(){
//     var valid = this.validate(this.state);
//     return (
//       <div>
//         <Input valid={valid.value}
//                className='foobar'
//                value={this.state.value}
//                onChange={this.handleChange}
//                placeholder="something with 'react'"/>
//         <Input valid={valid.price}
//               value={this.state.price}
//               onChange={this.handlePriceChange}
//               placeholder="$0.00" />
//       </div>
//     );
//   }
// });

// React.render(<App />, document.body);



/*
      <Formsy.Form onSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton} className="login">
        <MyInput name="email" title="Email" validations="isEmail" validationError="This is not a valid email" required />
        <MyInput name="password" title="Password" type="password" required />
        <div className="buttons">
          <button type="submit" disabled={!this.state.canSubmit}>Submit</button>
        </div>
      </Formsy.Form>


      <RadioGroup
        name="fruit"
        selectedValue={this.state.selectedValue}
        onChange={this.handleChange}>
        <label>
          <Radio value="apple" />Apple
        </label>
        <label>
          <Radio value="orange" />Orange
        </label>
        <label>
          <Radio value="watermelon" />Watermelon
        </label>
      </RadioGroup>
*/

