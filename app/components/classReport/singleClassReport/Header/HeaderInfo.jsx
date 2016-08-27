//班级报告最上面有关考试信息的描述文案
import React, { PropTypes } from 'react';
import _ from 'lodash';
import moment from 'moment';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default function HeaderInfo({examInfo, subjects}) {
    var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');
    debugger;
    return (
        <div>
            <div id='header' style={{borderRadius: 2, backgroundColor: '#fff', padding: 30}}>
                <p>亲爱的班主任，您好</p>
                <p>
                    本次考试，全校{examInfo.gradeName}共<span style={{ color: colorsMap.B03 }}>{examInfo.realClasses.length}</span>个班级，<span style={{ color: colorsMap.B03 }}>{examInfo.realStudentsCount}</span>名学生参加考试，缺考<span style={{ color: colorsMap.B03 }}>{examInfo.lostStudentsCount}</span>名。
                    考试学科：<span style={{ color: colorsMap.B03 }}> {_.join(subjects, '、') }</span>，{subjects.length}个学科。
                </p>
                <p style={{ marginBottom: 0 }}>
                    此次分析是从总分、学科成绩、学科内在结构等多层面分析本班级的考试表现。其中，在总分分布、学科分档分布、班级学科水平、学科内在表现、重点学生等方面揭示本班学科偏向及学生特征。
                    结合班级历史表现追踪，分析发现本班的学业优势与不足。帮助您全面掌握本班级的学业基本状况，便于与任课老师、学生家长沟通教学情况。
                </p>
            </div>
        </div>
    )
}



//=================================================  分界线  =================================================
