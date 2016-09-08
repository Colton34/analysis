//班级报告最上面有关考试信息的描述文案
import React, { PropTypes } from 'react';
import _ from 'lodash';
import moment from 'moment';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function HeaderInfo({reportDS, currentSubject}) {
    var examInfo = reportDS.examInfo.toJS();
    var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');
    return (
        <div>
{
            <div id='header' style={{borderRadius: 2, backgroundColor: '#fff', padding: 30,borderBottom: '1px solid rgb(238, 238, 238)'}}>
                <p>您好</p>
                <p>
                    本次考试（考试时间：{startTime}），全校{examInfo.gradeName}共<span style={{ color: colorsMap.B03 }}>{examInfo.realClasses.length}</span>个班，<span style={{ color: colorsMap.B03 }}>{examInfo.realStudentsCount}</span>名学生参加考试，缺考<span style={{ color: colorsMap.B03 }}>{examInfo.lostStudentsCount}</span>名。
                    考试学科：<span style={{ color: colorsMap.B03 }}> {_.join(examInfo.subjects, '、') }</span>，{examInfo.subjects.length}个学科。
                </p>
                <p style={{ marginBottom: 0 }}>
                    此次分析是从学科成绩，学科内在结构几个层面分析了全年级，各班级本学科的考试基本表现。在全年级的学科总分分布，学科分档上线分布，班级学科水平，学科内在表现，重点学生等方面揭示全年级本学科学业表现及特征状况。力图分析与发现学校学业优势与不足，帮助学校教学领导全面掌握全校的学生基本情况，便于有针对性地指导与改进学校教学，提高教学质量。
                </p>
            </div>
}
        </div>
    )
}



//=================================================  分界线  =================================================
