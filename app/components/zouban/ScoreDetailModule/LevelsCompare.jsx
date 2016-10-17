import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../common/DropdownList';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';

class LevelsCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClass:classes[0]
        }
    }
    render(){

    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>各班学科等级对比</span>
            <span className={commonClass['title-desc']}></span>
            <div>
                <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                    <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                        <span style={{ marginRight: 10}}>学科：</span>
                            {classes.map((course, index) => {
                                return (
                                    <a key={'papers-' + index}    style={ localStyle.subject}>{course}</a>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div style={{marginTop:30}}>
                <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}></TableView>
            </div>
        </div>
    )
    }
}

export default LevelsCompare;
var localStyle = {
    subject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    },

}
//mork数据
var tableHeaders = [
    [
        {id:'class', name:'班级',rowSpan:2},
        {id:'studentNumber', name:'参考人数',rowSpan:2},
        {id:'averageScore', name:'平均分',rowSpan:2},
        {name:'A等，优秀 得分率0.85以上',colSpan:2} ,
        {name:'B等 良好 得分率0.7-0.85',colSpan:2} ,
        {name:'C等，及格 得分率0.6-0.7',colSpan:2} ,
        {name:'D等，优秀 得分率0.6以下',colSpan:2} ,
    ],
    [
        {id:'number0',name:'人数'},{id:'percentage0',name:'占比'},
        {id:'number1',name:'人数'},{id:'percentage1',name:'占比'},
        {id:'number2',name:'人数'},{id:'percentage2',name:'占比'},
        {id:'number3',name:'人数'},{id:'percentage3',name:'占比'},
    ]
];
var tableData = [
    {
        class:'10_魏旭',
        studentNumber:50,
        averageScore:60,
        number0:30,
        percentage0:'30%',
        number1:30,
        percentage1:'30%',
        number2:30,
        percentage2:'30%',
        number3:30,
        percentage3:'30%'

    },
    {
        class:'10_魏旭',
        studentNumber:50,
        averageScore:60,
        number0:30,
        percentage0:'30%',
        number1:30,
        percentage1:'30%',
        number2:30,
        percentage2:'30%',
        number3:30,
        percentage3:'30%'

    }
];
 var classes = ['语文','数学','英语'];
// var levels = [{
//     0:500
// },{
//     1:400
// },{
//     2:300
// },{
//     3:200
// }];
// function morktableHeaderData(levels,levelsName){
//     var headerData = [[],[]];
//     headerData[0].push({
//         id:'class',
//         name:'班级',
//         rowSpan:2
//     });
//     headerData[0].push({
//         id:'studentNumber',
//         name:'参考人数',
//         rowSpan:2
//     });
//     headerData[0].push({
//         id:'averageScore',
//         name:'平均分',
//         rowSpan:2
//     });
//     _.forEach(_.range(_.size(levels)),function(index){
//         headerData[0].push({
//             name:levelsName[index],
//             colSpan:2
//         });
//     });
//     _.forEach(_.range(_.size(levels)),function(index){
//         headerData[1].push({
//             id:'number'+index,
//             name:'人数'
//         });
//         headerData[1].push({
//             id:'percentage'+index,
//             name:'占比'
//         });
//     });
//     return headerData;
// }
// function morkTableBodyData(tableBodyData){
//  var tableBodyDatas = _.map(tableBodyData,function(rolData){
//      debugger
//     return {
//         'class':rolData[0],
//         'studentNumber':rolData[1],
//         'averageScore':rolData[2],
//         'number0':rolData[3],
//         'percentage0':rolData[4],
//         'number1':rolData[5],
//         'percentage1':rolData[6],
//         'number2':rolData[7],
//         'percentage2':rolData[8],
//         'number3':rolData[9],
//         'percentage3':rolData[10],
//     };
// });
// return tableBodyData;//此处返回暂时有问题
// }
// var levelsName = ['A等，优秀 得分率0.85以上','B等 良好 得分率0.7-0.85','C等，及格 得分率0.6-0.7','D等，优秀 得分率0.6以下','E等，不及格 得分率0.85以上'];
// var tableBodyData = [
//     //年级 参考人数 平均分 人数 占比 人数 占比
//     ['10_魏旭',50,100,40,'40%',50,'50%',60,'60%',70,'70%'],
//     ['10_魏旭',50,100,40,'40%',50,'50%',60,'60%',70,'70%'],
//     ['10_魏旭',50,100,40,'40%',50,'50%',60,'60%',70,'70%']
// ];
