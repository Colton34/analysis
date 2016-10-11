//TODO: 这里的CriticalForm没必要那么绕--对于Input的操作直接在input组件内部就可以搞定。对于form只有button disable一个状态，但是对于formLevelBufferInfo需要更新到（这也是这里需要更多修改的地方，下次重构做设计的修改）
import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

import {isNumber, initParams} from '../../../../lib/util';
import {formatNewBaseline} from '../../../../sdk';
import {makeSegmentsCount} from '../../../../api/exam';
import {updateLevelBuffersAction, saveBaselineAction} from '../../../../reducers/reportDS/actions';
import commonClass from '../../../../styles/common.css';
import {DEFAULT_LEVELBUFFER as defaultLevelBuffer, NUMBER_MAP as numberMap, DEFAULT_LEVEL_RADIO_RANGE as defaultRadioRange, COLORS_MAP as colorsMap} from '../../../../lib/constants';

import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

var validateRules = [validateIsNumber, validateLevelBuffer];

var localStyle = {
    btn: {backgroundColor: 'rgb(242, 242, 242)', color: 'rgb(106, 106, 106)',width: 84, height: 32,  display: 'inline-block',textAlign: 'center',padding:0,borderWidth:0,marginRight:'20px',borderRadius:'2px'}
}

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
        var {levelKey} = this.props;
        return (
            <div style={{marginBottom: levelKey == 0 ? 0 : 30}}>
                <div>
                    <label htmlFor={this.props.id+'-'+'input'}>{numberMap[(levelLastIndex - levelKey)+1] + '档线上下浮动分数'}</label>
                    <input
                      type='text'
                      placeholder={this.props.value}
                      info={this.props.info}
                      value={this.props.value}
                      onChange={this.handleChange.bind(this)}
                      onBlur={this.handleBlur.bind(this)}
                      style={{ width: 280, height: 34, display: 'inline-block', textAlign: 'left', paddingLeft: 20, margin: '0 20px'}}
                    />分
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
        this.levels = props.reportDS.levels.toJS();
    }

    setFormLevelBufferState(newFormLevelBufferInfo, levelValidSate) {
        debugger;
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
        debugger;
        var levelSize = _.size(this.levels);
        return (
            <div>
                <Body style={{ padding: 30 }}>
                    <div style={{ minHeight: 150 }}>
                        <div style={{ marginBottom: 20 }}>
                            考试成绩分为{levelSize}档，
                            {
                                _.join(_.range(levelSize).map(num => {
                                    var index = levelSize - num - 1;
                                    return numberMap[num + 1] + '档' + this.levels[index].score + '分'
                                }), ',')
                            }
                        </div>
                        {
                            _.map(this.state.formLevelBufferInfo, (levelBuffer, index) => {
                                return (
                                    <CriticalInput key={index} levelKey={levelLastIndex - index} value={this.state.formLevelBufferInfo[levelLastIndex - index]} reportDS={this.props.reportDS} formLevelBufferInfo={this.state.formLevelBufferInfo} setFormLevelBufferState={this.setFormLevelBufferState.bind(this) } validation={this.validation.bind(this) } />
                                )
                            })
                        }
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0, padding: '0 0 30px 0' }}>
                    <button style={_.assign({}, localStyle.btn, { backgroundColor: '#59bde5', color: '#fff' }) } onClick={this.handleSubmit.bind(this) } disabled={!formIsValid}>
                        确定
                    </button>
                    <button style={localStyle.btn} onClick={this.handleCancel.bind(this) }>
                        取消
                    </button>
                </Footer>
            </div>
        );
    }
}

const CriticalDialog = (props) => {
    return (
        <Modal show={ props.isDisplay } onHide={props.hideModal}>
            <Header closeButton={false} style={{ position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee' }}>
                <button className={commonClass['dialog-close']} onClick={props.hideModal}>
                    <i className='icon-cancel-3'></i>
                </button>
                设置临界分数
            </Header>
            <CriticalForm {...props}/>
        </Modal>
    )
}

class CriticalStudentModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: false
        }

        var {tableHeaders, tableData} = getTableRenderData(props.reportDS);
        this.tableHeaders = tableHeaders;
        this.tableData = tableData;
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
            <div id='criticalStudent' className={commonClass['section']} style={{position: 'relative'}}>
                <div>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>临界生群体分析</span>
                    <span className={commonClass['title-desc']}>临界生群体分析，通过设置临界分数线来计算全校及各班的总分在不同分档分数线左右徘徊的人数分布。</span>
                </div>
                <div style={{marginTop: 10}}>
                    <p>将临近总分各分数线上下的群体视为“临界生”，联考可以给他们多一点关注，找到他们的薄弱点、有针对性促进一下，他们就可能稳定、甚至提升总分档次。这无论是对学生个人，还是对联考整体的教学成就，都有显著的积极作用。</p>
                    <p>系统默认临界分值为 10分，可点击右侧设置按钮进行修改。联考全体临界生群体规模，见下表：</p>
                </div>
                <a href="javascript:void(0)" onClick={this.showModal.bind(this)} className={commonClass.button} style={{ width: 120, height: 30, backgroundColor: colorsMap.B03, color: '#fff', position: 'absolute', right: 30, top: 30, borderRadius: 2, lineHeight: '30px' }}>
                    <i className='icon-cog-2'></i>
                    设置临界分数
                </a>
                <CriticalDialog isDisplay={this.state.isDisplay} hideModal={this.hideModal.bind(this)} reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} hideModal={this.hideModal.bind(this)} saveBaseline={this.props.saveBaseline}
                            updateLevelBuffers={this.props.updateLevelBuffers.bind(this)} />
                <TableView hover tableHeaders={this.tableHeaders} tableData={this.tableData} TableComponent={EnhanceTable}/>
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
    // debugger;
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

function getTableRenderData(reportDS) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS(), levels = reportDS.levels.toJS(), levelBuffers = reportDS.levelBuffers.toJS();
    var studentsInfoBySchool = _.groupBy(examStudentsInfo, 'school');
    var schoolNames = ['联考全体'].concat(_.keys(studentsInfoBySchool));
    studentsInfoBySchool['联考全体'] = examStudentsInfo;

    var tableHeaders = getTableHeaders(levels);
    var tableData = getTableData(studentsInfoBySchool, levels, levelBuffers, schoolNames);

    return {tableHeaders, tableData};
}

function getTableHeaders(levels) {
    var levelSize = _.size(levels);
    var tableHeaders = [[{id: 'school', name: '学校'}]];
    for(let i=0; i<levelSize; i++) {
        let header = {};
        header.id = i;
        header.name = numberMap[i + 1] + '档临界生人数';
        tableHeaders[0].push(header);
    }
    return tableHeaders;

}

function getTableData(studentsInfoBySchool, levels, levelBuffers, schoolNames) {
    var tableData = [];
    var levelSize = _.size(levels);
    var segments = makeCriticalSegments(levelBuffers, levels);
    _.forEach(schoolNames, schoolName => {
        var rowData = {school: schoolName};
        var segmentsCount = makeSegmentsCount(studentsInfoBySchool[schoolName], segments); //从低到高
        segmentsCount = _.filter(segmentsCount, (countInfo, index) => (index % 2 == 0)); //过滤出区间段内的学生人数,从低到高；
        _.forEach(levels, (levelInfo, levelNum) => {
            rowData[levelNum] = segmentsCount[levelSize - levelNum -1];
        })
        tableData.push(rowData);
    })
    return tableData;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}
