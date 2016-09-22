//TODO: 这里的CriticalForm没必要那么绕--对于Input的操作直接在input组件内部就可以搞定。对于form只有button disable一个状态，但是对于formLevelBufferInfo需要更新到（这也是这里需要更多修改的地方，下次重构做设计的修改）
import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

import {isNumber, initParams} from '../../../../lib/util';
import {formatNewBaseline} from '../../../../sdk';
import {updateLevelBuffersAction, saveBaselineAction} from '../../../../reducers/reportDS/actions';
import commonClass from '../../../../styles/common.css';
import {DEFAULT_LEVELBUFFER as defaultLevelBuffer, NUMBER_MAP as numberMap, DEFAULT_LEVEL_RADIO_RANGE as defaultRadioRange} from '../../../../lib/constants';

var validateRules = [validateIsNumber, validateLevelBuffer];

class CriticalInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validationStarted: false,
            value: this.props.value,
            errorMsg: ''
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
        var newFormLevelBufferInfo = getNewChangeFormLevelBufferInfo(e.target.value, this.props.levelKey, this.props.formLevelBufferInfo);
        var errorMsg = this.props.validation(e.target.value, newFormLevelBufferInfo);
        this.props.setFormLevelBufferState(newFormLevelBufferInfo, {levelKey: this.props.levelKey, isValid: !(!!errorMsg)});
        this.setState({
            errorMsg: errorMsg
        });
    }

    handleBlur(e) {
        if (this.state.validationStarted) {
            var newFormLevelBufferInfo = getNewChangeFormLevelBufferInfo(e.target.value, this.props.levelKey, this.props.formLevelBufferInfo);
            var errorMsg = this.props.validation(e.target.value, newFormLevelBufferInfo);
            this.props.setFormLevelBufferState(newFormLevelBufferInfo, {levelKey: this.props.levelKey, isValid: !(!!errorMsg)});
            this.setState({
                errorMsg: errorMsg
            })
        }
    }

    render() {
        var className = !(!!this.state.errorMsg) ? 'valid' : 'invalid';
        var levelLastIndex = _.size(this.props.formLevelBufferInfo) - 1;
        return (
            <div>
                <div>
                    <label htmlFor={this.props.id+'-'+'input'}>{numberMap[(levelLastIndex-this.props.levelKey)+1] + '档线'}</label>
                    <input
                      type='text'
                      placeholder={this.props.value}
                      info={this.props.info}
                      value={this.props.value}
                      onChange={this.handleChange.bind(this)}
                      onBlur={this.handleBlur.bind(this)}
                    />
                </div>
                {(this.state.errorMsg) ? (<div className={commonClass['validation-error']}>{this.state.errorMsg}</div>) : ''}
            </div>
        );
    }
}

class CriticalForm extends React.Component {
    constructor(props) {
        super(props);
        var childValidState = {}, propsLevelBuffers = this.props.reportDS.levelBuffers.toJS();
        _.each(propsLevelBuffers, (levelObj, levelKey) => childValidState[levelKey] = true);
        this.state = {
            formLevelBufferInfo: _.cloneDeep(propsLevelBuffers),
            childValidState: childValidState
        }
    }

    setFormLevelBufferState(newFormLevelBufferInfo, levelValidSate) {
        var newChildValidState = _.cloneDeep(this.state.childValidState);
        newChildValidState[levelValidSate.levelKey] = levelValidSate.isValid;
        this.setState({
            formLevelBufferInfo: newFormLevelBufferInfo,
            childValidState: newChildValidState
        })
    }

//校验规则：数字；保证level高大于低；所有其他指标都是跟着levels和subjectLevels走--这是对比准则数据
    validation(value, newFormLevelBufferInfo) {
        var levels = this.props.reportDS.levels.toJS(), examFullMark = this.props.reportDS.examInfo.toJS().fullMark;
        var errorMsg;
        var isValid = _.every(validateRules, (validateRuleFun) => {
            errorMsg = validateRuleFun({value: value, levels: levels, levelBuffers: newFormLevelBufferInfo, examFullMark: examFullMark});
            return !(!!errorMsg);
        });
        return errorMsg;
    }

    handleSubmit() {
        var newBaseline = formatNewBaseline(this.props.examId, this.props.grade, this.props.reportDS.levels.toJS(), this.props.reportDS.subjectLevels.toJS(), this.state.formLevelBufferInfo);
        debugger;
        var params = initParams({ 'request': window.request, examId: this.props.examId, grade: this.props.grade, baseline: newBaseline });
        this.props.saveBaseline(params);
        this.props.updateLevelBuffers(this.state.formLevelBufferInfo);
        this.props.hideModal();

    }

    handleCancel() {
        this.props.hideModal();
    }

    render() {
        var levelLastIndex = _.size(this.state.formLevelBufferInfo) - 1;
        var formIsValid = _.every(this.state.childValidState, (v) => v);
        return (
            <div>
                <div>设置临界分数线</div>
                <div>考试成绩分为4档，一档626.5分，二挡577.5分，三挡490.3分，四挡457.1分</div>
                {
                    _.map(this.state.formLevelBufferInfo, (levelBuffer, index) => {
                        return (
                            <CriticalInput key={index} levelKey={levelLastIndex-index} value={this.state.formLevelBufferInfo[levelLastIndex-index]} reportDS={this.props.reportDS} formLevelBufferInfo={this.state.formLevelBufferInfo} setFormLevelBufferState={this.setFormLevelBufferState.bind(this)} validation={this.validation.bind(this)} />
                        )
                    })
                }
                <div>
                    <button onClick={this.handleSubmit.bind(this)} disabled={!formIsValid}>确认</button>
                    <button onClick={this.handleCancel.bind(this)}>取消</button>
                </div>
            </div>
        );
    }
}

class CriticalStudentModule extends React.Component {
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
            <div id='criticalStudent' className={commonClass['section']}>
                <div>
                    <span>临界生群体分析</span><button onClick={this.showModal.bind(this)}>设置临界分数线</button>
                    <Modal show={ this.state.isDisplay } ref="dialog"  onHide={this.hideModal.bind(this)}>
                        <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                            <button className={commonClass['dialog-close']} onClick={this.hideModal.bind(this)}>
                                <i className='icon-cancel-3'></i>
                            </button>
                            设置分档线
                        </Header>
                        <CriticalForm reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} hideModal={this.hideModal.bind(this)} saveBaseline={this.props.saveBaseline}
                            updateLevelBuffers={this.props.updateLevelBuffers.bind(this)} />
                        }
                    </Modal>
                </div>
                <p>巴拉巴拉。。。</p>
            {/*TODO: TableView*/}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CriticalStudentModule);
function mapStateToProps(state, ownProps) {
    return {
        reportDS: ownProps.reportDS,
        examId: ownProps.examId,
        grade: ownProps.grade
    }
}
function mapDispatchToProps(dispatch) {
    return {
        updateLevelBuffers: bindActionCreators(updateLevelBuffersAction, dispatch),
        saveBaseline: bindActionCreators(saveBaselineAction, dispatch)
    }
}

function validateIsNumber({value}) {
    var isValid = !!value &&isNumber(value);
    return (isValid) ? '' : '只能填入数字';
}

function validateValueRange({value, examFullMark}) {
    var isValid = (value > 0) && (value < examFullMark);
    return (isValid) ? '' : '分数不能大于总分或小于零分';
}

function validateLevelBuffer({levels, levelBuffers, examFullMark}) {
    //由所给的levels创建对应的segments
    //注意这里不要加错了  levels和levelBuffers都是小档次在前，所以在监听input change的时候那里要把位置填对--高换低
    var levelBufferSegments = [];
    _.each(levels, (levelObj, levelKey) => {
        var low = levelObj.score - levelBuffers[levelKey];
        var high = levelObj.score + levelBuffers[levelKey];
        levelBufferSegments = _.concat(levelBufferSegments, [low, high]);
    });
    var isValid = _.every(levelBufferSegments, (v) => (validateIsNumber(v) && validateValueRange(v, examFullMark)));
    if(isValid) {
        isValid = _.every(_.range(_.size(levelBufferSegments)-1), (i) => levelBufferSegments[i+1] > levelBufferSegments[i]);
    }
    return (isValid) ? '' : '此分档线下的临界分档线不合理'
}

function getNewChangeFormLevelBufferInfo(inputValue, levelKey, oldFormLevelBufferInfo) {
    var newChangeFormLevelBufferInfo = _.cloneDeep(oldFormLevelBufferInfo);
    var result = (isNumber(inputValue)) ? parseFloat(inputValue) : inputValue;
    newChangeFormLevelBufferInfo[parseInt(levelKey)] = result;
    return newChangeFormLevelBufferInfo;
}
