//有关考试的信息头。这个和班级报告的一模一样，直接copy过来就可以。先保持冗余，但清晰！后面会重构
import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default  function MultiHeaderInfo({examInfo}) {
    var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');
    return (
        <div>
            <div id='header' style={{borderRadius: 2, backgroundColor: '#fff', padding: 30,borderBottom: '1px solid rgb(238, 238, 238)'}}>
                <p>您好</p>
                <p>
                    本次考试（考试时间： {startTime}），全校{examInfo.gradeName}共<span style={{ color: colorsMap.B03 }}>{examInfo.realClasses.length}</span>个班级，<span style={{ color: colorsMap.B03 }}>{examInfo.realStudentsCount}</span>名学生参加考试。
                    考试学科：<span style={{ color: colorsMap.B03 }}> {_.join(examInfo.subjects, '、') }</span>，{examInfo.subjects.length}个学科。
                </p>
                <p style={{ marginBottom: 0 }}>
                    此次分析是从各班级平均分、分数段人数、分组人数及试题得分率来对比分析各班级本次考试的表现情况，请结合各班级自身情况，与相关学科老师、班主任一起分析总结，提高整体教学质量。
                </p>
            </div>
        </div>
    )
}

// 【暂时】，缺考<span style={{ color: colorsMap.B03 }}>{examInfo.lostStudentsCount}</span>名
//=================================================  分界线  =================================================
