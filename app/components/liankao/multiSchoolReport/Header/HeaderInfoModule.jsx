//有关考试的信息头。这个和班级报告的一模一样，直接copy过来就可以。先保持冗余，但清晰！后面会重构
import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default  function MultiHeaderInfo({examInfo, user}) {
    var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');
    return (
        <div>
            <div id='header' style={{borderRadius: 2, backgroundColor: '#fff', padding: 30,borderBottom: '1px solid rgb(238, 238, 238)'}}>
                <p>您好</p>
                <p>
                    本次考试（考试时间： {startTime}），全区{examInfo.gradeName}共<span style={{ color: colorsMap.B03 }}>{examInfo.realClasses.length}</span>所学校，<span style={{ color: colorsMap.B03 }}>{examInfo.realStudentsCount}</span>名学生参加考试。
                    考试学科：<span style={{ color: colorsMap.B03 }}> {_.join(examInfo.subjects, '、') }</span>，{examInfo.subjects.length}门学科。
                </p>
                <p style={{ marginBottom: 0 }}>
                    此次分析是从总分、学科成绩、学科考试表现等多层面分析本次联考多考试表现。其中，在总分分布、学科分档分布、临界生、学科考试基本表现、重点学生信息。
                </p>
            </div>
        </div>
    )
}

// 【暂时】，缺考<span style={{ color: colorsMap.B03 }}>{examInfo.lostStudentsCount}</span>名
//=================================================  分界线  =================================================
