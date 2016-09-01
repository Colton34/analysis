//学科平均分排名
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import DropdownList from '../../../common/DropdownList';

import commonClass from '../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

var config = {
    chart: {
        type: 'column'
    },
    title: {
        text: '(分)',
        floating: true,
        x: -510,
        y: 43,
        style: {
            "color": "#767676",
            "fontSize": "12px"
        }
    },
    subtitle: {
        text: '----',
        floating: true,
        x: -65,
        y: 18,
        style: {
            "color": colorsMap.B03,
            "fontSize": "12px"
        }
    },
    yAxis: {
        allowDecimals: true,//刻度允许小数
        lineWidth: 1,
        gridLineDashStyle: 'Dash',
        gridLineColor: colorsMap.C03,
        title: {
            text: ''
        },
        plotLines: [{//y轴轴线
            value: 0,
            width: 1,
            color: colorsMap.C03
        }, {
                value: 0,//mork数据
                color: colorsMap.B03,
                dashStyle: 'Dash',
                width: 1,
                label: {
                    text: '',
                    align: 'right',
                    x: 0,
                    y: 5

                }
            }],
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        symbolHeight: 1,
        symbolWidth: 0
    },
    plotOptions: {
        column: {
            pointWidth: 16,//柱宽
        }
    },
    tooltip: {
        enabled: true,
        backgroundColor: '#000',
        borderColor: '#000',
        style: {
            color: '#fff'
        },
        formatter: function () {
            return  this.point.y
        }
    },
};

class SubjectMeanRank extends React.Component {
    constructor(props) {
        super(props);
        var allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), examClassesInfo = this.props.reportDS.examClassesInfo.toJS(), examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), gradeName = this.props.reportDS.examInfo.toJS().gradeName;
        var {classMeanInfo, gradeMeanInfo} = getDS(allStudentsPaperMap, examClassesInfo, examPapersInfo, gradeName);
        this.classMeanInfo = classMeanInfo;
        this.gradeMeanInfo = gradeMeanInfo;
        this.examPapersInfo = examPapersInfo;
        this.state = {
            currentSubject: examPapersInfo[_.keys(examPapersInfo)[0]]
        }
    }

    onClickDropdownList(subject) {
        this.setState({currentSubject: subject});
    }

    render() {
        var currentClassMeanInfo = this.classMeanInfo[this.state.currentSubject.id], currentGradeMeanValue = this.gradeMeanInfo[this.state.currentSubject.id];
        if(!currentClassMeanInfo) return (<div></div>) //Blank Page -- 自定义Error信息
        var xAxis = {'tickWidth': '0px', 'categories': currentClassMeanInfo.theClasses,
            title:{
            align:'high',
            text:'班级',
            margin:0,
            offset:7
        }};
        var series = [{ 'name': '年级平均分: '+currentGradeMeanValue, 'color': colorsMap.B03, data: currentClassMeanInfo.theMeans}];
        config.xAxis = xAxis, config.series = series;
        config.yAxis.plotLines[1].value = currentGradeMeanValue;

        var subjects = _.map(this.examPapersInfo, (obj) => {
            return {id: obj.id, value: obj.subject}
        });
        return (
            <div id='subjectMeanRank' className={commonClass['section']}>
                <div style={{position: 'relative'}}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>总分平均分排名</span>
                    <span className={commonClass['title-desc']}></span>
                    <DropdownList onClickDropdownList={this.onClickDropdownList.bind(this)} list={subjects} style={{position: 'absolute', right: 0, top: 0, zIndex: 1}}/>
                    <ReactHighcharts config={config} style={{ width: '100%', height: '400px', marginTop: 5}}></ReactHighcharts>
                </div>
            </div>
        )
    }
}

export default SubjectMeanRank;

//=================================================  分界线  =================================================
//以各个学科为一级key，班级为二级key组织数据。计算每个学科下面每个班级当前学科的平均分
function getDS(allStudentsPaperMap, examClassesInfo, examPapersInfo, gradeName) {
    var classMeanInfo = {}, gradeMeanInfo = {};
    var theClasses, theMeans;
    _.each(allStudentsPaperMap, (paperStudents, pid) => {
        gradeMeanInfo[pid] = _.round(_.mean(_.map(paperStudents, (studentPaperObj) => studentPaperObj.score)), 2);
        classMeanInfo[pid] = {}, theClasses = [], theMeans = [];
        var classPaperStudentMap = _.groupBy(paperStudents, 'class_name');
        _.each(examClassesInfo, (classObj, className) => {
            var classPaperStudents = classPaperStudentMap[className];
            if(classPaperStudents && classPaperStudents.length > 0) {
                theClasses.push(gradeName + className + '班');
                theMeans.push(_.round(_.mean(_.map(classPaperStudents, (studentPaperObj) => studentPaperObj.score)), 2));
            }
        });
        classMeanInfo[pid].theClasses = theClasses;
        classMeanInfo[pid].theMeans = theMeans;
    });
    return {classMeanInfo: classMeanInfo, gradeMeanInfo: gradeMeanInfo}
}

//=================================  Mock Data ==========================================|

    // xAxis: {
    //     tickWidth: '0px',//不显示刻度
    //     categories: ['初一1班', '初一1班', '初一1班', '初一1班', '初一1班', '初一1班', '初一1班', '初一1班', '初一1班', '初一1班'],
    // },

    // series: [
    //     {
    //         name: '校级平均分:' + average,
    //         color: colorsMap.B03,
    //         data: [100, 150, 300, 200, 400, 500, 100, 200, 187, 222],
    //     }
    // ],
