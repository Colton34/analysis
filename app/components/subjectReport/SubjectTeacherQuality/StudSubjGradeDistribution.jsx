import _ from 'lodash';
import React from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import TableView from '../../../common/TableView';

//学生学科成绩分布情况
class  StudSubjGradeDistribution  extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            currentScoreStep: 10,
        }
    }
    segmentInputBlur(event) {
        var value = parseInt(event.target.value);
        console.log('input value:' + value);
        if (isNaN(value) || value === this.state.segment || value <= 0) return;
        this.setState({
            currentScoreStep: value
        })
    }
    render(){
    var {reportDS, currentSubject} = this.props;
    var examInfo = reportDS.examInfo.toJS();
    var tableData =[['学科','年级','1班','2班'],['学科平均分',128,120,110],['学科得分率贡献指数',0,0.1,0.3]];
    return (
        <div>
            <div style={{marginBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>学生学科成绩分布情况</span>
                <span className={commonClass['title-desc']}>分析班级的学科表现，还需要从学生的成绩分布上考察学生水平的差异情况。</span>
            </div>
            <div>
                <div style={{margin: '0 10px 30px 0', display: 'inline-block'}}>本科满分为{examInfo.fullMark}分,最高分 120 ，您可以设置
                <input defaultValue={this.state.currentScoreStep} onBlur={this.segmentInputBlur.bind(this)}  style={{width: 70, height: 30, margin: '0 10px', paddingLeft: 10, border: '1px solid ' + colorsMap.C08}}/>为一个分数段，查看不同分数段的人数分布及详情</div>
            </div>
            <TableView tableData={tableData}/>
        </div>
    )
}
}

export default StudSubjGradeDistribution;
