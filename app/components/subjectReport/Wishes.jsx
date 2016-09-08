import React, { PropTypes } from 'react';
import commonClass from '../../common/common.css';
export default function Wishes() {
    return (
        <div  className={commonClass['section']} style={{position: 'relative'}}>
            <div>小贴士：</div>
            <div>学科组长可与各班级任课教师一起，对本班每个学生的本学科成绩表现，分数分布的结构状况，以及班级学科水平在全校学科成绩中的表现，进行认真的分析。特别是发现学生的优势与不足，促进每个学生的学业进步，这是大家的心愿。</div>
        </div>
    )
}
