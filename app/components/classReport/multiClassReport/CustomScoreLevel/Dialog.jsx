import React from 'react';
import { Modal } from 'react-bootstrap';
import _ from 'lodash';
import commonClass from '../../../../common/common.css';
import {LETTER_MAP as letterMap, COLORS_MAP as colorsMap} from '../../../../lib/constants';
var {Header, Title, Body, Footer} = Modal;



/**
 * props:
 * show: 是否显示;
 * onHide： 隐藏对话框的回调函数;
 * levelPercentages: 各等级百分比数组,包括0 和 100，倒序；
 * examPapersInfo: ,
 * updateGrades: 更新等级的回调函数；
 *
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.isValid = _.map(_.range(_.size(this.props.levelPercentages)), (index) => true);
        this.isUpdate = false;
        var percentageLen = this.props.levelPercentages.length;
        this.state = {
            grades: this.props.levelPercentages.slice(1, percentageLen-1), //传入的数组的第一个和最后一个在此没有作用
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
        var percentageLen = this.props.levelPercentages.length;
        this.setState({
            grades: this.props.levelPercentages.slice(1, percentageLen-1),
            hasError: false,
            errorMsg: '',
            invalidIndex: -1
        })
        this.isUpdate = false;
        this.isValid = _.map(_.range(_.size(this.props.levelPercentages)), (index) => true);
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
                    <button className={commonClass['dialog-close']} onClick={this.onHide.bind(this)}>
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
                        <div style={_.assign({},{color: colorsMap.A11, width: '100%', textAlign:'center', marginTop: 20}, this.state.hasError ? {display: 'inline-block'} : {display: 'none'})}>{this.state.errorMsg}</div>
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

class DialogComponent extends React.Component {
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
        return (
            <div>
                <span className={commonClass['button']}
                      style={{width: 120, height: 30, lineHeight: '30px', background: colorsMap.B03, color: '#fff', position: 'absolute', top: 0, right: 82}}
                      onClick={this.onShowDialog.bind(this)}
                    >
                    <i className='icon-cog-2'></i>设置等级参数
                </span>
                <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this)} {...this.props} />
            </div>
        )
    }
}
var localStyle = {
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'}
}

export default DialogComponent;
