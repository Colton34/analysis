import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
class QuestionCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClass:classes[0]
        }
    }
    render(){
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>教学班试题得分率对比</span>
            <span className={commonClass['title-desc']}></span>
            <div>
                <div style={{ padding: '5px 30px 0 30px',marginBottom:0}} className={commonClass['section']}>
                    <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                        <span style={{ marginRight: 10}}>学科：</span>
                            {classes.map((course, index) => {
                                return (
                                    <a key={'papers-' + index}    style={ localStyle.subject}>{course}</a>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div style={{marginTop:30}}>
            <TableView hover  tableData={tableData}></TableView>
            </div>
        </div>
    )
    }
}

export default QuestionCompare;
var localStyle = {
    subject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
    },
    activeSubject: {
        display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
    },

}

var classes = ['语文','数学','英语'];
var tableData = [
    ['题目','年级平均得分率','10班_魏旭','10班_魏旭','10班_魏旭','10班_魏旭'],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34],
    ['T1',1.92,0.34,0.34,0.34,0.34]
];
