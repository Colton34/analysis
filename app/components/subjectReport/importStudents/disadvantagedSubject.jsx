import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap,NUMBER_MAP as numberMap,} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import ReactHighcharts from 'react-highcharts';

export default function DisadvantagedSubjectModule({currentSubject, reportDS}) {
    var allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), currentPaperId = currentSubject.pid;
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentPaperId];
    var {categories, disadvantagedSubjectInfo} = getCurrentSubjectDisadvantagedInfo(allStudentsPaperMap, examStudentsInfo, currentPaperId, currentPaperInfo);
    var yaxisData = getYaxisData(disadvantagedSubjectInfo);
    debugger;
    var config={
        chart: {
            type: 'column'
        },
        title: {
            text: '(人数)',
            floating:true,
            x:-510,
            y:13,
            style:{
                "color": "#767676",
                "fontSize": "12px"
            }
        },
        subtitle: {
            text: '',
            floating:false,
            x:-520,
            y:20,
            style:{
                "color": "#000",
                "fontSize": "14px"
            }
        },
        xAxis: {
            tickWidth:'0px',//不显示刻度
            title:{
                align:'high',
                text:'班级',
                margin:0,
                offset:7
            },
            categories:categories.slice(1)
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
            enabled:false,
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
        series:[{
            data:yaxisData,
            color:'#0099ff'
        }]
    };

    return (
        <div>
            <div style={{margfinBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>本学科是短板的学生人数班级分布</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <div style={{marginTop:30}}>
                <ReactHighcharts config={config} style={{ width: '100%', height: '400px'}}></ReactHighcharts>
            </div>
            <div className={commonClass['analysis-conclusion']} >
                <div>
                    虽然本学科是他们的短板，但就其自身水平而言，他们完全有能力在本学科上表现的更好。需要对每个人作具体分析，有针对性的帮助他们。
                </div>
            </div>
        </div>
    )
}

//遍历每一个examStudentsInfo中的学生
    //遍历sutdentSubjectRankMaps获取到当前学生各个学科的排名信息，并进行排序。判断最后名次的学科是不是当前学科--如果是，则添加到CurrentDisadvantagedSubjectStudents数组里
//最终对CurrentDisadvantagedSubjectStudents数组针对class_name进行group
function getCurrentSubjectDisadvantagedInfo(allStudentsPaperMap, examStudentsInfo, currentPaperId, currentPaperInfo) {
    var currentPaperClasses = currentPaperInfo.realClasses;
    var gradeDisadvantagedSubjectStudents = [], result = {};
    var sutdentSubjectRankMaps = _.map(allStudentsPaperMap, (paperStudentsInfo, pid) => _.keyBy(paperStudentsInfo, 'id'));
    _.each(examStudentsInfo, (studentObj) => {
        var currentStudentSubjectRankInfo = _.compact(_.map(sutdentSubjectRankMaps, (oneSubjectRankMapInfo) => oneSubjectRankMapInfo[studentObj.id]));
        //rank低就是排名靠前，所以差学科是rank高的，即排名靠后的
        if(currentStudentSubjectRankInfo.length == 0) return;
        var currentStudentDisadvantagedSubjectObj = _.last(_.sortBy(currentStudentSubjectRankInfo, 'rank'));
        if(currentStudentDisadvantagedSubjectObj.paperid == currentPaperId) gradeDisadvantagedSubjectStudents.push(currentStudentDisadvantagedSubjectObj);
    });
    var classesDisadvantagedSubjectStudentsMap = _.groupBy(gradeDisadvantagedSubjectStudents, 'class_name');
    var classDisadvantagedStudents = _.map(currentPaperClasses, (classKey) => (classesDisadvantagedSubjectStudentsMap[classKey] || []));

    var categories = _.map(currentPaperClasses, (classKey) => classKey+'班');
    categories.unshift('全年级');

    classDisadvantagedStudents.unshift(gradeDisadvantagedSubjectStudents);

    return {
        categories: categories,
        disadvantagedSubjectInfo: classDisadvantagedStudents
    }
}


function getYaxisData(disadvantagedSubjectInfo){
    var yaxisData = _.map(disadvantagedSubjectInfo.slice(1),function(obj){
        return obj.length;
    });
    return yaxisData;
}
 
