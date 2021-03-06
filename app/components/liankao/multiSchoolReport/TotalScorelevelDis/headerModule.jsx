//TODO: 1.当input的className是invalid的，但是没有体现
//* 总是导致学科分档的验证过不去

//是否可提交的状态
//提交成功
//刷新页面

import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {RadioGroup, Radio} from 'react-radio-group';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import {makeSubjectLevels, getLevelInfo} from '../../../../sdk';
import {isNumber, initParams} from '../../../../lib/util';
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
        // validationStarted: false,
        this.state = {
            value: this.props.value
        }
    }

    // componentWillMount() {
    //     var startValidation = function() {
    //         this.setState({
    //             validationStarted: true
    //         })
    //     }.bind(this);
    //     if (this.props.value) {
    //         startValidation();
    //     } else {
    //         this.prepareToValidate = _.debounce(startValidation, 1000);
    //     }
    // }

    // prepareToValidate() {}
    handleChange(e) {
        // if (this.state.validationStarted) {
        //     this.prepareToValidate();
        // }
        var newShowFormLevelInfo = getNewShowFormLevelInfo(e.target.value, this.props.info, this.props.formLevelInfo, this.props.examStudentsInfo, this.props.examInfo.fullMark);
        this.props.setFormLevelState(newShowFormLevelInfo);
        // var newFormLevelInfo = getNewChangeFormLevelInfo(e.target.value, this.props.info, this.props.formLevelInfo, this.props.examStudentsInfo, this.props.examInfo.fullMark);
        // var errorMsg = this.props.validation(e.target.value, newFormLevelInfo, this.props.info.type);
        // this.props.setFormLevelState(newFormLevelInfo, {levelKey: this.props.info.id, isValid: !(!!errorMsg)});
        // this.props.setErrorMessage(errorMsg);
    }

    handleBlur(e) {
        var newFormLevelInfo = getNewChangeFormLevelInfo(e.target.value, this.props.info, this.props.formLevelInfo, this.props.examStudentsInfo, this.props.examInfo.fullMark);
        var errorMsg = this.props.validation(e.target.value, newFormLevelInfo, this.props.info.type);
        this.props.setFormLevelState(newFormLevelInfo, {levelKey: this.props.info.id, isValid: !(!!errorMsg)});
        this.props.setErrorMessage(errorMsg);//没有提到Form级别，通过form给errorMsg（就像通过inputGroup给每一个孩子input valid状态的思路），是因为需要判断是哪一个level出现了errorMsg（input不需要区分，两个都是同步valid的）
        // if (this.state.validationStarted) {

        // }
    }

    render() {
        var className = (this.props.isValid) ? 'valid' : 'invalid';
        return (
            <div className={className} style={{display:'inline-block'}}>
                <input
                  type='text'
                  placeholder={this.props.value}
                  info={this.props.info}
                  value={this.props.value}
                  onChange={this.handleChange.bind(this)}
                  onBlur={this.handleBlur.bind(this)}
                  style={{display:'inline-block',width: 166, height: 34,border: '1px solid #e7e7e7',paddingLeft: 12, margin: '0 10px 0 0'}}
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
        var currentLevel = formLevelInfo[this.props.id];

        var examInfo = this.props.reportDS.examInfo.toJS();
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        return (
            <div>
                <div style={{marginBottom:'30px'}}>
                    <label  style={{display:'inline-block',marginRight:'10px'}} htmlFor={this.props.id+'-'+'input'} >{numberMap[(levelLastIndex-this.props.id)+1] + '档'}</label>
                    <LevelInput  formLevelInfo={formLevelInfo} value={currentLevel.score} valid={!(!!this.state.errorMsg)} info={{id: this.props.id, type: 'score'}} examStudentsInfo={examStudentsInfo} examInfo={examInfo} validation={this.props.validation} setFormLevelState={this.props.setFormLevelState} setErrorMessage={this.setErrorMessage.bind(this)} />
                    <span>分</span>
                    <i className={'icon-link-1'} style={{ margin: '0 25px', color: colorsMap.C07 }}></i>
                    <LevelInput  formLevelInfo={formLevelInfo} value={currentLevel.percentage} valid={!(!!this.state.errorMsg)} info={{id: this.props.id, type: 'percentage'}} examStudentsInfo={examStudentsInfo} examInfo={examInfo} validation={this.props.validation} setFormLevelState={this.props.setFormLevelState} setErrorMessage={this.setErrorMessage.bind(this)} />
                    <span>%上线率</span>
                </div>
                 {(this.state.errorMsg) ? (<div className={commonClass['validation-error']} style={{marginBottom:'10px',marginLeft:'20px'}}>{this.state.errorMsg}</div>) : ''}
            </div>
        );
    }
}

class LevelRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedValue: defaultRadioRange[this.props.initLevelCount-3]
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
                <div style={{padding:'0 30px 30px 0'}}>
                    <span>本场最高分{_.last(this.props.examStudentsInfo).score}分。当前设置为</span>
                    {
                        _.map(defaultRadioRange, (levelCount) => {
                            return (
                                <label  key={'label'+levelCount} id={levelCount} style={{paddingLeft:'20px'}}>
                                    <Radio value={levelCount} />{numberMap[levelCount]+'档'}
                                </label>
                            )
                        })
                    }
                </div>
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
        var data = {formLevelInfo: newFormLevelInfo};
        if(levelValidSate) {
            var newChildValidState = _.cloneDeep(this.state.childValidState);
            newChildValidState[levelValidSate.levelKey] = levelValidSate.isValid;
            data['childValidState'] = newChildValidState;
        }

        this.setState(data);
    }

    validation(value, newFormLevelInfo, valueType) {
        var theValidationRules = (valueType == 'score') ? validateScoreRules : validatePercentageRules;
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS(), examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), examFullMark = this.props.reportDS.examInfo.toJS().fullMark;
        var errorMsg;
        var isValid = _.every(theValidationRules, (validateRuleFun) => {
            errorMsg = validateRuleFun({value: value, formLevelInfo: newFormLevelInfo, examStudentsInfo: examStudentsInfo, examPapersInfo: examPapersInfo, examFullMark: examFullMark});
            return !(!!errorMsg);
        });
        return errorMsg;
    }

    handleSubmit() {
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
            <div style={{padding:'30px'}}>
                <LevelRadioGroup initLevelCount={_.keys(formLevelInfo).length} changeLevelCount={this.changeLevelCount.bind(this)} examStudentsInfo={examStudentsInfo} />
                {
                    _.map(formLevelInfo, (formLevObj, levelKey) => {
                        return (
                            <LevelInputGroup  key={'levelInput'+levelKey}  id={levelLastIndex-levelKey} reportDS={this.props.reportDS} formLevelInfo={formLevelInfo} setFormLevelState={this.setFormLevelState.bind(this)} validation={this.validation.bind(this)} />
                        )
                    })
                }
                <div style={{textAlign:'center'}}>
                    <button onClick={this.handleSubmit.bind(this)} disabled={!formIsValid} style={{backgroundColor: '#59bde5', color: '#fff', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',padding:0,borderWidth:0,marginRight:'20px',borderRadius:'2px'}}>确认</button>
                    <button onClick={this.handleCancel.bind(this)} style={{backgroundColor: '#f2f2f2', color: 'rgb(106,106,106)', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',padding:0,borderWidth:0,borderRadius:'2px'}}>取消</button>
                </div>
            </div>
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
        var reportDS = this.props.reportDS.toJS();
        var examInfo = reportDS.examInfo;
        var examStudentsInfo = reportDS.examStudentsInfo;
        var levels = reportDS.levels;
        var examId = this.props.examId;
        var grade = this.props.grade;
        var levTotal = _.size(levels);

        return (
            <div>
                <div style={{position: 'relative', padding: 30, backgroundColor: colorsMap.B03, color: '#fff', marginBottom: 20,borderRadius:'2px'}}>
                    <p style={{marginRight: 20, fontSize: 18, marginBottom: 25}}>
                        <span style={{marginRight: 20}}>分档分数线</span>
                        <span style={{fontSize: 12}}>分档分数线默认分为三档，分别对应学生总数的 15%、 35%、 60%，如需修改请点击右侧按钮</span>
                        <span onClick={this.showModal.bind(this)} style={{ cursor: 'pointer', color: colorsMap.B03, textAlign: 'center', display: 'inline-block', width: 110, height: 30, lineHeight: '30px', backgroundColor: '#fff', fontSize: 12, position: 'absolute', top: 20, right: 30,borderRadius:'2px'}}>
                            <i className='icon-cog-2' style={{fontSize: 12}}></i>
                            设置分档参数
                        </span>

                    </p>
                    <p>本次考试满分{examInfo.fullMark}分，最高分{_.last(examStudentsInfo).score}分，
                    {
                            _.map(levels, (levObj, levelKey) => {
                                return (
                                    <span key={'basicInfo-level-' + levelKey}>
                                        {numberMap[(+levelKey + 1)]} 档线  {levels[(levTotal - 1 - levelKey) + ''].score} 分{levelKey == levTotal - 1 ? '' : '、'}
                                    </span>
                                )
                            })
                    }。
                    </p>
                </div>
                <Modal show={ this.state.isDisplay } ref="dialog"  onHide={this.hideModal.bind(this)}>
                    <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                        <button className={commonClass['dialog-close']} onClick={this.hideModal.bind(this)}>
                            <i className='icon-cancel-3'></i>
                        </button>
                        设置分档线
                    </Header>
                    <LevelForm reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} hideModal={this.hideModal.bind(this)}
                        changeLevels={this.props.changeLevels.bind(this)} saveBaseline={this.props.saveBaseline.bind(this)} />
                </Modal>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderModule);
function mapStateToProps(state, ownProps) {
    return {
        reportDS: ownProps.reportDS,
        examId: ownProps.examId,
        grade: ownProps.grade
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
    var otherInputType = (inputInfo.type == 'score') ? 'percentage' : 'score';
    var result = getOtherInputValue(otherInputType, inputValue, inputInfo.id, oldFormLevelInfo, examStudentsInfo, examFullMark);
    newChangeFormLevelInfo[inputInfo.id] = result;
    return newChangeFormLevelInfo;
}

function getNewShowFormLevelInfo(inputValue, inputInfo, oldFormLevelInfo) {
    var newChangeFormLevelInfo = _.cloneDeep(oldFormLevelInfo);
    // var inputType = inputInfo.type;
    newChangeFormLevelInfo[inputInfo.id][inputInfo.type] = inputValue;
    return newChangeFormLevelInfo;
}

//TODO:在levels里添加sumCount，修改percentage为sumPercentage
function getOtherInputValue(otherInputType, inputValue, levelKey, formLevelInfo, examStudentsInfo, examFullMark) {
    if(!isNumber(inputValue)) {
        return {
            count: 0,
            sumCount: 0,
            score: inputValue,
            percentage: inputValue
        }
    }
    inputValue = parseFloat(inputValue);
    var result;
    if(otherInputType == 'percentage') {
        formLevelInfo[levelKey].score = inputValue;
        result = getLevelInfo(formLevelInfo, examStudentsInfo, examFullMark);
    } else {
        formLevelInfo[levelKey].percentage = inputValue;
        result = getLevelInfo(formLevelInfo, examStudentsInfo, examFullMark, false);
    }
    return result[levelKey];
}

function getNewCountFormLevelInfo(oldFormLevelInfo, count) {
    var newCountFormLevelInfo = {};
    var preLength = _.size(oldFormLevelInfo);
    var theDiff = Math.abs(preLength - count);

    var newCountFormLevelInfo = {}, oldTargetLevelObj;
    if(count < preLength) {
        ////由少转向多，则添加最低档的数据，原来的档次向后顺延, 去掉低档次，保留高档次  5 3 [4, 3, 2] 丢掉[1, 0]
        _.each(_.range(count), (index) => {
            oldTargetLevelObj = oldFormLevelInfo[(index+theDiff) + ''];
            // debugger;
            newCountFormLevelInfo[index+''] = {score: oldTargetLevelObj.score, count: oldTargetLevelObj.count, percentage: oldTargetLevelObj.percentage};
            // debugger;
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
            // debugger;
            newCountFormLevelInfo[(index+theDiff)+''] = {score: oldTargetLevelObj.score, count: oldTargetLevelObj.count, percentage: oldTargetLevelObj.percentage};
            // debugger;
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
    var isValid = !!value &&isNumber(value);
    return (isValid) ? '' : '只能输入数字';
}

function validateValueRange({value, examFullMark}) {
    var isValid = (value > 0) && (value < examFullMark);
    return (isValid) ? '' : '分数不能大于总分或小于零分';
}

function validatePercentageRange({value}) {
    var isValid = (value > 0) && (value <= 100);
    return (isValid) ? '' : '百分比不能大于100或小于0';
}

function validateLevel({formLevelInfo}) {
    var levelScores = _.map(_.values(formLevelInfo), (levelObj) => levelObj.score);
    var isValid = _.every(_.range(_.size(formLevelInfo)-1), (i) => levelScores[i+1] > levelScores[i]);
    return (isValid) ? '' : '分档线分值不合理（高分档线分值必须大于低分档线分值）';
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
    // if(!isValid) return isValid;
    if(isValid) {
        isValid = _.every(_.range(_.size(levelBufferSegments)-1), (i) => levelBufferSegments[i+1] > levelBufferSegments[i]);
    }
    return (isValid) ? '' : '此分档线下的临界分档线不合理（默认临界区间是10）'
}

function validateSubjectLevel({formLevelInfo, examStudentsInfo, examPapersInfo, examFullMark}) {
    // return ''; //Mock
    var newSubjectLevels = makeSubjectLevels(formLevelInfo, examStudentsInfo, examPapersInfo, examFullMark);
    var isValid = _.every(newSubjectLevels, (levelSubjectsObj, levelKey) => _.size(levelSubjectsObj) === _.size(examPapersInfo));
    if(isValid) {
        var subjectLevelSegments = _.map(examPapersInfo, (obj, pid) => {
            return _.map(newSubjectLevels, (levelSubjectsObj, levelKey) => levelSubjectsObj[pid]);
        });
        isValid = _.every(subjectLevelSegments, (singleSubjectLevelSegments) => {
            var ifValid = _.every(singleSubjectLevelSegments, (v) => (validateIsNumber(v) && validateValueRange(v, examFullMark)));
            if(!ifValid) return ifValid;
            return _.every(_.range(_.size(singleSubjectLevelSegments)-1), (i) => singleSubjectLevelSegments[i+1].mean > singleSubjectLevelSegments[i].mean);
        });
    }
    return (isValid) ? '' : '此分档线下的学科分档线不合理'
}

// function getNewBaseline(newLevels, examStudentsInfo, examPapersInfo, examId, examInfo, levelBuffers) {
//     //通过新的levels计算subjectMeans，levelBuffer不变
//     var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
//     _.each(newLevels, (levObj, levelKey) => {
//         var subjectMean = makeLevelSubjectMean(levObj.score, examStudentsInfo, examPapersInfo, examInfo.fullMark);
//         // var subjectLevels = _.values(subjectMean);
//         result['[subjectLevels]'].push({levelKey: levelKey, values: subjectMean});
//         result['[levels]'].push({key: levelKey, score: levObj.score, percentage: levObj.percentage, count: levObj.count, sumCount: levObj.sumCount});
//         debugger;
//         //如果是update那么可以考虑只put上去需要更新的数据--但是需要能区分到底是post还是put。理论上这里如果是put那么不需要put上去levelBuffers，因为这里并没有改变levelBuffers。
//         result['[levelBuffers]'].push({key: levelKey, score: levelBuffers[levelKey-0]});
//         //拼装 [levels]，[subjectLevels]和[levelBuffers]所对应的每一个实体，放入到相对应的数组中，最后返回gradeExamLevels
//     });
//     return result;
// }

function getNewBaseline(newLevels, newSubjectLevels, examId, examInfo, defaultLevelBuffer) {
    var result = {examid: examId, grade: examInfo.gradeName, '[levels]': [], '[subjectLevels]': [], '[levelBuffers]': []};
    _.each(newLevels, (levelObj, levelKey) => {
        result['[subjectLevels]'].push({levelKey: levelKey, values: newSubjectLevels[levelKey]});
        result['[levels]'].push({key: levelKey, score: levelObj.score, percentage: levelObj.percentage, count: levelObj.count});
        result['[levelBuffers]'].push({key: levelKey, score: defaultLevelBuffer});
    });
    debugger;
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
