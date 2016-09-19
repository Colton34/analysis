import React from 'react';
import _ from 'lodash';
import styles from '../../../../common/common.css';
import Radium from 'radium';
import TableView from '../../../../common/TableView';
import {Table as BootTable} from 'react-bootstrap';
import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap, A11, A12, B03, B04, B06, B07, B08, C09, C12, C05, C07} from '../../../../lib/constants';

class StudentPerformanceTable extends React.Component {
    constructor(props) {
        super(props);
        this.selectItems = [{ key: 'ranking', value: '名次统计' }, { key: 'percentage', value: '比例统计' }];
        this.isValid = true;
        this.default = 10;
        this.state = {
            current: this.selectItems[0], //默认按照名词排列
            rankingNum: 10, //默认是 名词排列 的 前30名
            percentageNum: 10,
            inputNum: 10
        }
    }

    chooseItem(content) {
        if (this.state.current.key === content.key) return;
        var newState = {current: content };
        newState.inputNum = this.default;
        if (content.key === 'ranking') {
            newState.rankingNum = this.default;
        } else {
            newState.percentageNum = this.default;
        }
        this.setState(newState, ()=> {
            console.log('after set state: ' + this.state.inputNum);
        });
    }

    onConfirmChange() {
        var value = parseInt(this.state.inputNum);
        if (!(value && _.isNumber(value) && value > 0)) {
            console.log('输入不是有效数字');
            this.isValid = false;
            return;
        }
        //不同类型所要求的数值的规则不同
        var newConfig = {};
        if (this.state.current.key == 'ranking') {
            if (value > this.props.examStudentsInfo.length) {
                this.isValid = false;
                return;
            } else {
                newConfig.rankingNum = value;
                newConfig.inputNum = value;
            }
        } else if (this.state.current.key == 'percentage') {
            if (value > 100) {
                this.isValid = false;
                return;
            } else {
                newConfig.percentageNum = value;
                newConfig.inputNum = value;
            }
        }

        this.isValid = true;
        this.setState(newConfig);
    }
    onChangeInput(event) {
        this.setState({
            inputNum: event.target.value
        })
    }
    render() {
        //Props数据结构：
        var {examStudentsInfo, isGood, headers} = this.props;
        var countFlag = (this.state.current.key == 'ranking') ? this.state.rankingNum : _.ceil(_.multiply(_.divide(this.state.percentageNum, 100), _.size(examStudentsInfo)));
        var tableData = getTableData({examStudentsInfo,isGood,countFlag,headers});
        return (
            <div style={{position: 'relative'}}>
                {/*---------------------------------    switch按钮  ---------------------------------------------- */}
                <div style={{position: 'absolute', top: -55, left: '50%', marginLeft: -80, width: 160, height: 30, borderRadius: 2, border: '1px solid ' + colorsMap.B03 }}>
                {
                    this.selectItems.map((item, index) => {
                        return (
                            <div key={'statisticType-' + index} style={_.assign({}, {display: 'inline-block', width: '50%', height: '100%', textAlign: 'center', lineHeight: '30px', cursor: 'pointer'}, this.state.current.key === item.key ? {backgroundColor: colorsMap.B03, color: '#fff'} : {backgroundColor: '#fff', color: colorsMap.B03})}
                                 onClick={this.chooseItem.bind(this, item)}>
                                {item.value}
                            </div>
                        )
                    })
                }
                </div>
                {/* 名次/比例输入框  */}
                <div style={{position: 'absolute', right: 0, top: -65 }}>
                    <span style={{marginRight: 8}}>年级{(isGood) ? '前' : '后'}</span>
                    <input ref='numInput' value={this.state.inputNum} onChange={this.onChangeInput.bind(this)} style={{ fontSize:'14px',display: 'inline-block', width: 52, height: 30, lineHeight: '30px', textAlign:'center', marginRight: 5, border: '1px solid ' + colorsMap.C04}}/>
                    <span style={{marginRight: 10}}>{this.state.current.key === 'ranking' ? '名' : '%'}</span>
                    <span onClick={this.onConfirmChange.bind(this)} style={{display: 'inline-block', width: 42, height: 30, lineHeight: '30px', borderRadius: 2, backgroundColor: colorsMap.B03, color: '#fff', cursor: 'pointer', textAlign: 'center'}}>
                        确定
                    </span>
                </div>
                <TableView tableData={tableData}/>
            </div>
        )
    }
}

const StudentPerformanceModule = ({reportDS}) => {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var headers = reportDS.headers.toJS();
    return (
    <div>
     {/*--------------------------------  优秀学生人数表格 -------------------------------------*/}
    <p style={{ marginBottom: 30, marginTop: 50 }}>
        <span className={commonClass['sub-title']}>优秀学生人数</span>
    </p>
    <StudentPerformanceTable
        examStudentsInfo={examStudentsInfo}
        isGood={true}
        headers={headers}
        />
     {/*--------------------------------  待提高学生人数表格 -------------------------------------*/}
    <p style={{ marginBottom: 30, marginTop: 50 }}>
        <span className={commonClass['sub-title']}>待提高学生人数</span>
    </p>
    <StudentPerformanceTable
        examStudentsInfo={examStudentsInfo}
        isGood={false}
        headers={headers}
        />
</div>
    )
}
export default StudentPerformanceModule;

function getTableData({examStudentsInfo,isGood,countFlag,headers}){
    var tableHeader = _.map(headers,function(obj){
            return obj.subject;
         })
         tableHeader.unshift('学校') ;

    var allShowStudent = isGood?_.reverse(_.takeRight(examStudentsInfo,countFlag)):_.take(examStudentsInfo,countFlag);
    var tableData = [];
    _.forEach(allShowStudent,function(student){
        var low = [];
        low.push(student.school);
        low.push(student.score);
        for (let i=1;i<headers.length;i++){
        var result = _.find(student.papers,function(paper){
            return paper.paperid==headers[i].id;
        }) ;
        low.push(_.size(result)>0?result.score:0);
        }
        tableData.push(low);
    });

     tableData.unshift(tableHeader);
        return tableData;
}
