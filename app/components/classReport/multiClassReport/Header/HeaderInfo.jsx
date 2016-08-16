//有关考试的信息头。这个和班级报告的一模一样，直接copy过来就可以。先保持冗余，但清晰！后面会重构
import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default  function MultiHeaderInfo({examInfo}) {
    examInfo = examInfo.toJS();
    var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');
    return (
        <div>
            <div id='header' style={{marginBottom: 20, borderRadius: 2, backgroundColor: '#fff'}}>
                <p style={{fontSize: 18, color: colorsMap.C12, marginBottom: 15}}>校级分析报告-{examInfo.name}</p>
                <p style={{fontSize: 12, color: colorsMap.C10, marginBottom: 28}}>
                    <span style={{marginRight: 15}}>时间: {startTime}</span>
                    <span style={{marginRight: 15}}>人员: {examInfo.gradeName}年级，{examInfo.realClasses.length}个班级，{examInfo.realStudentsCount}位学生</span>
                    <span style={{marginRight: 15}}>
                        科目：
                        {
                            _.map(examInfo.subjects, (subject, index) => {
                                if (index === examInfo.subjects.length -1) {
                                    return subject
                                }
                                return subject + ','
                            })
                        }
                    </span>
                </p>
            </div>
        </div>
    )
}

//=================================================  分界线  =================================================


