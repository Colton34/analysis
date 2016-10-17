import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../common/DropdownList';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
class StudentLevelsDistribution extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            currentClass:{key:'yuwen',value:'yuwen'}
        }
    }
    onClickDropdownList(item) {
        this.setState({
            currentClass: item
        })
    }

    render(){
        var config={
            chart: {
                type: 'column'
            },
            title: {
                text: '人数',
                floating:true,
                x:-510,
                y:43,
                style:{
                    "color": "#767676",
                    "fontSize": "12px"
                }
            },
            colors:['#0099ff','#33cc33','#ff9900','#ff6633','#33cccc'],
            xAxis: {
                tickWidth:'0px',//不显示刻度
                title:{
                    align:'high',
                    text:'分数段',
                    margin:0,
                    offset:7
                },
                categories:categories//x轴数据
            },
            yAxis: {
                allowDecimals:true,//刻度允许小数
                lineWidth:1,
                gridLineDashStyle:'Dash',
                gridLineColor:'#f2f2f3',
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#f2f2f3'
                }],
            },
            credits:{
                enabled:false
            },
            legend:{
                enabled:true,
                align:'center',
                verticalAlign:'top'
            },
            plotOptions: {
                column: {
                    pointWidth:16,//柱宽
                }
            },
            tooltip:{
                enabled:true,
                backgroundColor:'#000',
                borderColor:'#000',
                style:{
                    color:'#fff'
                },
                formatter: function(){
                    return this.point.y
                }
            },
            series:data
        };
    return (
        <div className={commonClass['section']} style={{position:'relative'}}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>教学班分数段人数分布</span>
            <span className={commonClass['title-desc']}></span>
            <div>
                <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                    <div style={{heigth: 50, lineHeight: '50px'}}>
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
            <div style={{display: 'table-cell', paddingLeft: 18,verticalAlign: 'middle', width: 1200, height: 70, lineHeigth: 70, border: '1px solid ' + colorsMap.C05, background: colorsMap.C02, borderRadius: 3,position:'relative'}}>
                您可以设置
                <input defaultValue={10}  style={{width: 70, height: 30, margin: '0 10px', paddingLeft: 10, border: '1px solid ' + colorsMap.C08}}/>为一个分数段，查看不同分数段的人数分布及详情
                    <div style={{ float: 'right' }}>
                        <span style={{ fontSize: 12 ,marginRight:130}}>对比对象（最多5个）</span>
                    <div style={{width:92,height:32,display:'inline-block',marginRight:30,position:'absolute',right:0, zIndex:10}}>
                    <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this) } list={classList} fixWidth />
                    </div>
                    </div>
            </div>
            <div style={{marginTop:30}}>
            <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
            </div>
            <StudentLevelsTable />
        </div>
    )
    }
}

export default StudentLevelsDistribution;
function StudentLevelsTable (){
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['sub-title']}>各分数段教学班详细人数</span>
            <div style={{marginTop:30}}>
            <TableView hover  tableData={tableData}></TableView>
            </div>
        </div>
    );
}
var localStyle = {
    subject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    },

}
var classes = ['语文','数学','英语'];
var categories = ['10-20','20-30','30-40','40-50','50-60','60-70'];
var data = [{
    name:'1班',
    data:[10,50,30,40,50,10]
},{
    name:'2班',
    data:[10,60,30,40,50,90]
},{
    name:'3班',
    data:[10,70,30,40,50,10]
}];
var classList = [{
    key:1,
    value:'1班'
},{
    key:2,
    value:'2班'
}
,{
    key:3,
    value:'3班'
}];
var tableData = [
    ['班级','[0-10]分','[10-20]分','[20-30]分','[30-40]分','[40-50]分','[50-60]分'],
    ['1班',10,10,10,10,10,10],
    ['1班',10,10,10,10,10,10],
    ['1班',10,10,10,10,10,10],
    ['1班',10,10,10,10,10,10],
    ['1班',10,10,10,10,10,10],
    ['1班',10,10,10,10,10,10]

];
