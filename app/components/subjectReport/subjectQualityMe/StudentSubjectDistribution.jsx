import _ from 'lodash';
import React, { PropTypes } from 'react';
import {makeSegmentsDistribution, makeSegments} from '../../../sdk';
import commonClass from '../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';


class StudentSubjectDis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStep: 10
        }
    }

    segmentInputBlur(event) {
        var value = parseInt(event.target.value);
        console.log('input value:' + value);
        if (isNaN(value) || value === this.state.segment || value <= 0) return;
        this.setState({
            currentStep: value
        })
    }
    
    render() {
        var paperFullMark = this.props.reportDS.examPapersInfo.toJS()[this.props.currentSubject.pid].fullMark;
        var currentPaperStudents = this.props.reportDS.allStudentsPaperMap.toJS()[this.props.currentSubject.pid];
        var subjectMaxScore = _.last(currentPaperStudents).score;
        var segments = makeSegments(paperFullMark, 0, this.state.currentStep);
        var {classHeaders, classDis} = getSegmentsClassDis(segments, currentPaperStudents);
        var tableRenderData = getTableRenderData(classHeaders, classDis, segments, this.state.currentStep);

        return (
            <div>
                <div style={{margin: '30px 0'}}>
                    <span className={commonClass['sub-title']}>学生学科成绩分布情况</span>
                    <span className={commonClass['title-desc']}>分析班级的学科表现，还需要从学生的成绩分布上考察学生水平的差异情况。</span>
                </div>
                <div>
                    <div style={{ margin: '0 10px 30px 0', display: 'inline-block' }}>本科满分为{paperFullMark}分, 最高分{subjectMaxScore}分，您可以设置
                        <input defaultValue={this.state.currentStep} onBlur={this.segmentInputBlur.bind(this) }  style={{ width: 70, height: 30, margin: '0 10px', paddingLeft: 10, border: '1px solid ' + colorsMap.C08 }}/>为一个分数段，查看不同分数段的人数分布及详情</div>
                    </div>
                <TableView tableData={tableRenderData}/>
            </div>
        );
    }
}

export default StudentSubjectDis;

function getSegmentsClassDis(segments, currentPaperStudents) {
//先得到按照班级的扫描，得到一个班级，各个分数段的分布，然后再转换成需要的matrix
    var classDis = [];
    //索引，班级，数目
    var currentPaperClassStudentGroup = _.groupBy(currentPaperStudents, 'class_name');
    var classHeaders = _.map(_.keys(currentPaperClassStudentGroup), (classKey) => classKey+'班');
    _.each(currentPaperClassStudentGroup, (paperClassStudents, classKey) => {
        var currentSegmentsDis = makeSegmentsDistribution(segments, paperClassStudents, 'score');
        var formatSegmentsDis = _.map(currentSegmentsDis, (obj) => {
            return {
                key: '[' + obj.low + '-' + obj.high + ']',
                index: obj.index,
                count: obj.count,
                className: classKey
            }
        });
        classDis = _.concat(classDis, formatSegmentsDis);
    });
    classDis = _.groupBy(classDis, 'key');
    return {
        classHeaders: classHeaders,
        classDis: classDis
    }
}

function getTableRenderData (classHeaders, classDis, segments, currentStep) {
    var  tableRenderData = [];
    var tableHeaders = ['分段'];
    tableHeaders = tableHeaders.concat(classHeaders);
    tableRenderData.push(tableHeaders);


    _.forEachRight(segments.slice(0, segments.length -1), segment => {
        var rowData = [(segment + currentStep) + '-' + (segment)];
        _.forEach(classDis['[' + segment + '-' + (segment + currentStep) + ']'], data => {
            rowData.push(data.count);
        })
        tableRenderData.push(rowData);
    })
    debugger
    return tableRenderData;
}    

