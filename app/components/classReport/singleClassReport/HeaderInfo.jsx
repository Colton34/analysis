//班级报告最上面有关考试信息的描述文案

import React, { PropTypes } from 'react';

export default function HeaderInfo({examInfo}) {
    examInfo = examInfo.toJS();
    return (
        <div><h4>HeaderInfo: {examInfo.name}</h4></div>
    )
}



//=================================================  分界线  =================================================
