import React from 'react';
import _ from 'lodash';
import styles from '../../../../common/common.css';
import Radium from 'radium';
import TableView from '../../../../common/TableView';
import {Table as BootTable} from 'react-bootstrap';
import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

class StudentPerformanceTable extends React.Component {
    constructor(props) {
        super(props);
        this.selectItems = [{ key: 'ranking', value: '名次统计' }, { key: 'percentage', value: '比例统计' }];
        this.isValid = true;
        this.default = 30;
        this.state = {
            current: this.selectItems[0], //默认按照名词排列
            rankingNum: 30, //默认是 名词排列 的 前30名
            percentageNum: 30,
            inputNum: 30
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
        var {current} = this.state;
        //Props数据结构：
        var {allStudentsPaperMap,examStudentsInfo, isGood, headers} = this.props;
        var countFlag = (this.state.current.key == 'ranking') ? this.state.rankingNum : _.ceil(_.multiply(_.divide(this.state.percentageNum, 100), _.size(examStudentsInfo)));
        var tableData = getTableDataInfo({allStudentsPaperMap,examStudentsInfo,isGood,countFlag,headers});
        return (
            <div style={{position: 'relative'}}>
                {/*---------------------------------    switch按钮  ---------------------------------------------- */}
                <div style={{position: 'absolute', top: -55, left: '50%', marginLeft: -80, width: 160, height: 30, borderRadius: 2, border: '1px solid ' + colorsMap.B03 }}>
                    <div style={_.assign({},{position: 'absolute', top: -1, width: 80, height: 30, zIndex: 0, borderRadius: 2, backgroundColor: colorsMap.B03, transition: 'left .2s linear'}, current.key === 'ranking' ? {left: 0} : {left: 80})}></div>
                    {
                        this.selectItems.map((item, index) => {
                            return (
                                <div key={'statisticType-' + index} style={_.assign({}, {position: 'relative', background: 'transparent', display: 'inline-block', width: '50%', height: '100%', textAlign: 'center', lineHeight: '30px', cursor: 'pointer', zIndex: 1, transition: 'color .2s linear'}, current.key === item.key ? {color: '#fff'} : {color: colorsMap.B03})}
                                     onClick={this.chooseItem.bind(this, item)}>
                                    {item.value}
                                </div>
                            )
                        })
                    }
                </div>
                {/* 名次/比例输入框  */}
                <div style={{position: 'absolute', right: 0, top: -65 }}>
                    <span style={{marginRight: 8}}>联考{(isGood) ? '前' : '后'}</span>
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
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
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
        allStudentsPaperMap={allStudentsPaperMap}
        />
     {/*--------------------------------  待提高学生人数表格 -------------------------------------*/}
    <p style={{ marginBottom: 30, marginTop: 50 }}>
        <span className={commonClass['sub-title']}>待提高学生人数</span>
    </p>
    <StudentPerformanceTable
        examStudentsInfo={examStudentsInfo}
        isGood={false}
        headers={headers}
        allStudentsPaperMap={allStudentsPaperMap}
        />
</div>
    )
}
export default StudentPerformanceModule;

// function getTableData({examStudentsInfo,isGood,countFlag,headers}){
//     var tableHeader = _.map(headers,function(obj){
//             return obj.subject;
//          })
//          tableHeader.unshift('学校') ;
//
//     var allShowStudent = isGood?_.reverse(_.takeRight(examStudentsInfo,countFlag)):_.take(examStudentsInfo,countFlag);
//     var tableData = [];
//     _.forEach(allShowStudent,function(student){
//         var low = [];
//         low.push(student.school);
//         low.push(student.score);
//         for (let i=1;i<headers.length;i++){
//         var result = _.find(student.papers,function(paper){
//             return paper.paperid==headers[i].id;
//         }) ;
//         low.push(_.size(result)>0?result.score:0);
//         }
//         tableData.push(low);
//     });
//
//      tableData.unshift(tableHeader);
//         return tableData;
// }
function getTableDataInfo({allStudentsPaperMap,examStudentsInfo,isGood,countFlag,headers}){
    var schools = _.map(_.groupBy(examStudentsInfo,'school'),function(value,key){
        return key;
    });
    var tableData = [];
    _.forEach(schools,function(school){
        var low = [];
        low.push(school);
        var studentsInfo = isGood?_.takeRight(examStudentsInfo,countFlag):_.take(examStudentsInfo,countFlag);
        low.push(_.size(_.groupBy(studentsInfo,'school')[school]));
    _.forEach(headers.slice(1),function(paper){
        var studentsGroup = isGood?_.takeRight(allStudentsPaperMap[paper.id],countFlag):_.take(allStudentsPaperMap[paper.id],countFlag);
            low.push(_.size(_.groupBy(studentsGroup,'school')[school]));
    } )
        tableData.push(low);
    });
    var tableHeader = _.map(headers,function(obj){
            return obj.subject;
         })
         tableHeader.unshift('学校') ;
         tableData.unshift(tableHeader);
            return tableData;
}
