// 联考报告-各学科成绩的等级结构比例
import React from 'react';
import _ from 'lodash';
import {RadioGroup, Radio} from 'react-radio-group';
import { Modal, Table as BootTable} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;
// style
import commonClass from '../../../../../styles/common.css';
import {COLORS_MAP as colorsMap,
    LETTER_MAP as letterMap,
    DEFAULT_LEVEL_RADIO_RANGE as defaultRadioRange,
    NUMBER_MAP as numberMap
} from '../../../../../lib/constants';
// import {DEFAULT_LEVELBUFFER as defaultLevelBuffer, NUMBER_MAP as numberMap, DEFAULT_LEVEL_RADIO_RANGE as defaultRadioRange} from '../../../../lib/constants';
// components
import TableView from '../../../../../common/TableView';
import EnhanceTable from '../../../../../common/EnhanceTable';
//utils
import {makeSegmentsCount} from '../../../../../api/exam';
import {isNumber} from '../../../../../lib/util';

/**
 * props:
 * reportDS:
 */
class ScoreLevelInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validationStarted: false,
            errorMsg: '',
            value: this.props.levelPercentages[this.props.levelIndex]
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
        //改变：levelPercentages数组； setState-> value, 调用validation，setErrorMsg 并 setFormIsValid
        var inputValue = e.target.value;
        this.props.levelPercentages[this.props.levelIndex] = inputValue;
        var errorMsg = this.validation(inputValue, this.props.levelPercentages);
        this.setState({
            value: inputValue,
            errorMsg: errorMsg
        });
        this.props.setFormIsValid(!(!!errorMsg));
    }

    handleBlur(e) {
        // if (this.state.validationStarted) {
        //     var inputValue = e.target.value;
        //     this.props.levelPercentages[this.props.levelIndex] = inputValue;
        //     var errorMsg = this.validation(inputValue, this.props.levelPercentages);
        //     this.setState({
        //         value: inputValue,
        //         errorMsg: errorMsg
        //     });
        //     this.props.setFormIsValid(!(!!errorMsg));
        // }
    }

    validation(inputValue, levelPercentages) {
        //是数字；大于0小于100；依次递增；
        var isValid = !!inputValue && isNumber(inputValue);
        if(!isValid) return '只能填入数字';
        isValid = inputValue > 0 && inputValue < 100;
        if(!isValid) return '必须是大于0且小于100的数字';
        isValid = _.every(_.range(levelPercentages.length - 1), (i) => levelPercentages[i] < levelPercentages[i+1]);
        return (isValid) ? '' : '不合理的数值';
    }

    render() {
        var levelLastIndex = this.props.levelPercentages.length - 1;
        console.log(this.props.value);
        console.log(this.state.value);
        debugger;
        return (
            <div style={{marginBottom: 30}}>
                <div >
                    <label htmlFor={this.props.levelIndex+'-'+'input'} style={{fontWeight:400}}>{letterMap[levelLastIndex - this.props.levelIndex] + '等：'}</label>
                    <input
                      type='text'
                      placeholder={this.props.value}
                      value={this.state.value}
                      onChange={this.handleChange.bind(this)}
                      onBlur={this.handleBlur.bind(this)}
                      style={{ width: 148, height: 34, display: 'inline-block', textAlign: 'left', paddingLeft: 20, margin: '0 0 0 10px'}}
                    />%
                    <span style={{paddingLeft:10}}>表示在总分×{this.state.value}%的分数以上学生为{letterMap[levelLastIndex - this.props.levelIndex]}等</span>
                </div>
                {(this.state.errorMsg) ? (<div className={commonClass['validation-error']}>{this.state.errorMsg}</div>) : ''}
            </div>
        );
    }
}

class ScoreLevelRadioGroup extends React.Component {
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
                <div style={{padding:'0 30px 30px 0',paddingLeft:150}}>
                    {/*<span>本场最高分{_.last(this.props.examStudentsInfo).score}分。当前设置为</span>*/}
                    {
                        _.map(defaultRadioRange, (levelCount) => {
                            return (
                                <label  key={'label'+levelCount} id={levelCount} style={{paddingLeft:'20px'}}>
                                    <Radio value={levelCount} />{numberMap[levelCount]+'等'}
                                </label>
                            )
                        })
                    }
                </div>
            </RadioGroup>
        );
    }
}


class ScoreLevelForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formIsValid: false,
            levelPercentages: this.props.levelPercentages
        }
    }

    changeLevelCount(count) {
        var newLevelPercentages = getNewCountLevelPercentages(this.state.levelPercentages, count);
        if(count > this.state.levelPercentages) {
            this.setState({
                levelPercentages: newLevelPercentages,
                formIsValid: false
            })
        } else {
            this.setState({
                levelPercentages: newLevelPercentages
            })
        }
    }

    setFormIsValid(isValid) {
        this.setState({
            formIsValid: isValid
        })
    }

    handleSubmit() {
        this.props.changeLevelPercentages(this.state.levelPercentages);
        this.props.hideModal();
    }


    render() {
        var levelLastIndex = this.state.levelPercentages.length - 1;
        return (
            <div style={{padding:'30px'}}>
                <ScoreLevelRadioGroup initLevelCount={this.state.levelPercentages.length} changeLevelCount={this.changeLevelCount.bind(this)} />
                {
                    _.map(this.state.levelPercentages, (percentageValue, index) => {
                        return (
                            <ScoreLevelInput  key={index} levelIndex={levelLastIndex-index} value={percentageValue} levelPercentages={this.state.levelPercentages} setFormIsValid={this.setFormIsValid.bind(this)} />
                        )
                    })
                }
                <div style={{textAlign:'center'}}>
                    <button onClick={this.handleSubmit.bind(this)} disabled={!this.state.formIsValid} style={{backgroundColor: '#59bde5', color: '#fff', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',padding:0,borderWidth:0,marginRight:'20px',borderRadius:'2px'}}>确认</button>
                    <button onClick={this.props.hideModal} style={{backgroundColor: '#f2f2f2', color: 'rgb(106,106,106)', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',padding:0,borderWidth:0,borderRadius:'2px'}}>取消</button>
                </div>
            </div>
        );
    }
}

const ScoreLevelDialog = (props) => {
    return (
        <Modal show={ props.isDisplay } onHide={props.hideModal}>
            <Header closeButton={false} style={{ position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee' }}>
                <button className={commonClass['dialog-close']} onClick={props.hideModal}>
                    <i className='icon-cancel-3'></i>
                </button>
                设置等级参数
            </Header>
            <ScoreLevelForm {...props}/>
        </Modal>
    )
}

export default class ScoreLevelBySubject extends React.Component {
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
        var reportDS = this.props.reportDS, coreLevelPercentages = _.slice(_.cloneDeep(this.props.levelPercentages), 1, this.props.levelPercentages.length - 1);
        var headers = reportDS.headers.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
        var mockPercentage = [0, 60, 70, 85, 100];
        var {tableHeaders, tableData} = getTableRenderData(this.props.levelPercentages, headers, allStudentsPaperMap);
        return (
            <div>
                <div style={{margin: '30px 0 20px 0'}}>
                    <span className={commonClass['sub-title']}>各学科成绩的等级结构比例</span>

                    <span onClick={this.showModal.bind(this)} style={{color:'#fff',backgroundColor:'rgb(29,174,248)',width:120,height:30,float:'right',borderRadius:'2px',lineHeight:'30px',cursor:'pointer'}}>
                        <i className='icon-cog-2' style={{fontSize: 12,paddingLeft:10}}></i>
                        设置等级参数
                    </span>
                </div>
                <ScoreLevelDialog
                    levelPercentages={coreLevelPercentages}
                    isDisplay={this.state.isDisplay}
                    hideModal={this.hideModal.bind(this)}
                    changeLevelPercentages={this.props.changeLevelPercentages} />
                <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            </div>
        )
    }
}


function getTableRenderData(levelPercentages, headers, allStudentsPaperMap) {
    var tableHeaders = getTableHeaders(levelPercentages);
    var tableData = getTableData(headers, allStudentsPaperMap, levelPercentages);
    return {tableHeaders, tableData};
}

function getTableHeaders(levelPercentages) {
    var tableHeaders = [[{id: 'subject', name: '学科'}]];
    var total = levelPercentages.length -1;
     _.forEach(_.range(total), index => {
        var header = {};
        if (index === 0) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'以上）';
        } else if (index === total-1) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index], 100), 2) +'以下）';
        } else {
            header.name = header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'-' + _.round(_.divide(levelPercentages[total-index], 100), 2) + '）';
        }
        header.id = letterMap[index];
        header.dataFormat = getTableDataFormat;
        tableHeaders[0].push(header);
    })
    return tableHeaders;
}

function getTableData(headers, allStudentsPaperMap, levelPercentages) {
    var tableData = [];
    _.forEach(headers.slice(1), headerInfo => {
        var rowData = {};
        rowData.subject = headerInfo.subject;
        var segments = makeSubjectLevelSegments(headerInfo.fullMark, levelPercentages);
        var result = makeSegmentsCount(allStudentsPaperMap[headerInfo.id], segments);
        _.reverse(result);//使高档次在前
        _.forEach(result, (count, index) => {
            rowData[letterMap[index]] = _.round(count / allStudentsPaperMap[headerInfo.id].length, 5);
        })
        tableData.push(rowData);
    })
    return tableData;
}
// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPercentages) {
    return _.map(levelPercentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}

function getTableDataFormat(cell) {
    return _.round(cell * 100, 2) + '%';
}

function getNewCountLevelPercentages(oldLevelPercentages, newCount) {
    if(oldLevelPercentages.length > newCount) return _.takeRight(oldLevelPercentages, newCount);
    var theDiff = Math.abs(oldLevelPercentages.length - newCount);
    return _.concat(_.map(_.range(theDiff), (i) => 0), oldLevelPercentages);
}
