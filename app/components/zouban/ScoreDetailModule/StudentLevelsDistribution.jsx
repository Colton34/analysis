import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import Select from '../../../common/Selector/Select';
import {Button} from 'react-bootstrap';

import {makeSegments, makeSegmentsString, makeSegmentsDistribution} from '../../../sdk';
import {downloadData} from '../../../lib/util';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

class Selector extends React.Component {
    constructor(props) {
        super(props);
    }

    handleSelectChange (value) {
        if(value.length > 5) return;
        this.setState({ value });
        this.props.handleSelectClasses(value);
    }

    render() {
        return (
            <div>
                <Select multi value={this.props.initSelected} placeholder="选择班级" options={this.props.options} onChange={this.handleSelectChange.bind(this)} />
            </div>
        );
    }
}

class StudentLevelsDistribution extends React.Component {
    constructor(props) {
        super(props);
        var currentLesson = this.props.zoubanExamInfo.lessons[0];
        var currentLessonClasses = _.keys(this.props.zoubanLessonStudentsInfo[currentLesson.objectId]).slice(0, 3);
        this.state={
            currentLesson: currentLesson,
            currentStep: 10,
            currentLessonClasses: currentLessonClasses
        }
    }

    onSelectLesson(selectedLesson) {
        var currentLessonClasses = _.keys(this.props.zoubanLessonStudentsInfo[selectedLesson.objectId]).slice(0, 3);
        this.setState({
            currentLesson: selectedLesson,
            currentStep: 10,
            currentLessonClasses: currentLessonClasses
        });
    }

    onSelectClasses(selectedClasses) {
        //TODO:是否需要做转换
        this.setState({
            currentLessonClasses: _.map(selectedClasses, (obj) => obj.value)
        })
    }

    onSetStep(e) {
        var inputValue = e.target.value;
        var isStringInt = /^\d+$/.test(inputValue);
        if(!isStringInt) return;
        this.setState({
            currentStep: parseInt(inputValue)
        });
    }

    render(){
        var currentLessonStudentsInfo = this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId];
        var segments = makeSegments(this.state.currentLesson.fullMark, 0, this.state.currentStep);
        var segmentsString = makeSegmentsString(segments);
        var classSegmentDistribution = getClassSegmentDistribution(this.state.currentLessonClasses, segments, currentLessonStudentsInfo);
        var tableHeader = getTableHeader(segmentsString);
        var tableBody = getTableBody(classSegmentDistribution);
        var downloadTableData = _.cloneDeep(tableBody);
        var downloadAllData = getTableBody(getClassSegmentDistribution(_.keys(currentLessonStudentsInfo), segments, currentLessonStudentsInfo));
        var selectorOptions = getSelectorFormatValues(_.keys(this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId])), selectorInitSelected = getSelectorFormatValues(this.state.currentLessonClasses);
        // var selectorInitSelected = selectorOptions.slice(0, 3);
        tableBody.unshift(tableHeader);
        var chartWidth = (segmentsString.length)*(classSegmentDistribution.length)>=50?((segmentsString.length)*(classSegmentDistribution.length)*21)+60*(classSegmentDistribution.length):1140;
        var config={
            chart: {
                type: 'column',
                width:chartWidth
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
                categories: segmentsString//x轴数据
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
            series: classSegmentDistribution
        };
        return (
            <div className={commonClass['section']} style={{position:'relative'}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>教学班分数段人数分布</span>
                <span className={commonClass['title-desc']}></span>
                <div>
                    <div style={{ padding: '5px 30px 0 0px',marginBottom:0}} className={commonClass['section']}>
                        <div style={{heigth: 50, lineHeight: '50px'}}>
                            <span style={{ marginRight: 10}}>学科：</span>
                            {_.map(this.props.zoubanExamInfo.lessons, (lessonObj, index) => {
                                    return (
                                        <a key={'papers-' + index} onClick={this.onSelectLesson.bind(this, lessonObj)} style={(lessonObj.objectId == this.state.currentLesson.objectId) ?localStyle.activeSubject: localStyle.subject}>{lessonObj.name}</a>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div style={{display: 'table-cell', paddingLeft: 18,verticalAlign: 'middle', width: 1200, height: 70, lineHeigth: 70, border: '1px solid ' + colorsMap.C05, background: colorsMap.C02, borderRadius: 3,position:'relative'}}>
                    您可以设置
                    <input defaultValue={this.state.currentStep} onBlur={this.onSetStep.bind(this)} style={{width: 70, height: 30, margin: '0 10px', paddingLeft: 10, border: '1px solid ' + colorsMap.C08}}/>为一个分数段，查看不同分数段的人数分布及详情
                    {/*<div style={{ float: 'right' }}>
                        <span style={{ fontSize: 12 ,marginRight:130}}>对比对象（最多5个）</span>
                        <div style={{width:92,height:32,display:'inline-block',marginRight:30,position:'absolute',right:0, zIndex:10}}>
                        <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this) } list={classList} fixWidth />
                        </div>
                    </div>*/}
                    <div style={{minWidth:'200px',float:'right'}}>
                    <Selector options={selectorOptions} initSelected={selectorInitSelected} handleSelectClasses={this.onSelectClasses.bind(this)}  />
                    </div>
                </div>
                <div style={{marginTop:30,width:'1140px',height:'420px',overflow:'auto',paddingLeft:10}}>
                <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
                </div>
                <StudentLevelsTable tableData={tableBody} downloadKeys={tableHeader} downloadNames={tableHeader} downloadTableData={downloadTableData} downloadAllData={downloadAllData} />
            </div>
        )
    }
}

export default StudentLevelsDistribution;

class StudentLevelsTable extends React.Component {
    constructor(props) {
        super(props);
    }

    clickDownloadTable() {
        downloadData(this.props.downloadKeys, this.props.downloadNames, this.props.downloadTableData, '各分数段教学班详细人数');
    }

    render() {
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['sub-title']}>各分数段教学班详细人数</span>
                <Button onClick={this.clickDownloadTable.bind(this)} style={{ margin: '0 2px', backgroundColor: '#2eabeb', color: '#fff', border: 0,float:'right'}}>下载表格</Button>
                <div style={{marginTop:30}}>
                    <TableView hover  tableData={this.props.tableData}></TableView>
                </div>
            </div>
        );
    }
}

var localStyle = {
    subject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        cursor: 'pointer',display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px',padding:'0px 10px'
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

function getClassSegmentDistribution(classes, segments, currentLessonStudentsInfo) {
    var info;
    return _.map(classes, (className) => {
        info = makeSegmentsDistribution(segments, currentLessonStudentsInfo[className]);
        info = _.map(info, (obj) => obj.count);
        return {
            name: className,
            data: info
        }
    })
}

function getTableHeader(segmentsString) {
    return _.concat(['班级'], segmentsString)
}

function getTableBody(classSegmentDistribution) {
    return _.map(classSegmentDistribution, (obj) => {
        return _.concat([obj.name], obj.data);
    });
}

function getSelectorFormatValues(classes) {
    return _.map(classes, (className) => {
        return {
            value: className,
            label: className,
            key: className
        }
    });
}

//如果需要下载全部数据而不只是表格中的数据那么只需要传入全部的classes即可
function getValidMatrixData(classes, segments, currentLessonStudentsInfo) {
    var classSegmentDistribution = getClassSegmentDistribution(this.state.currentLessonClasses, segments, this.props.zoubanLessonStudentsInfo[this.state.currentLesson.objectId]);
    var tableBody = getTableBody(classSegmentDistribution);
    return tableBody;
}
