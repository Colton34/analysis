import React from 'react';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';

var mockData = {
    name: '魏旭',
    score: 560,
    schoolRank: 31,
    classRank: 12,
    goodAt: '语文',
    others: ['朱倩', '陈宇', '肖赫', '姜波', '袁全']
}
const StudentReport = () => {
    return (
        <div>
            <div style={{ margin: '20px 15px 0 15px', backgroundColor: '#f7f6fc', padding: '0 8px 8px 8px', lineHeight: 0, position: 'relative', fontSize: 10 }}>
                <div style={{ height: 30, lineHeight: '30px' }}>本次分数: {mockData.score}</div>
                <div style={{ width: 90, height: 30, lineHeight: '30px', position: 'absolute', right: 0, top: 0 }}>校级排名：{mockData.schoolRank}</div>
                <div >
                    <span  style={{ display: 'inline-block', borderTop: '1px solid #fa1619', borderRight: '1px solid #fa1619', borderTopRightRadius: 10, width: '33.33%', height: 50 }}></span>
                    <span  style={{ display: 'inline-block', borderBottom: '1px solid #fa1619', width: '33.33%', height: 50 }}></span>
                    <span  style={{ display: 'inline-block', borderTop: '1px solid #fa1619', borderLeft: '1px solid #fa1619', borderTopLeftRadius: 10, width: '33.33%', height: 50 }}></span>
                    <br/>
                    <span  style={{ display: 'inline-block', borderBottom: '1px solid #fa1619', borderRight: '1px solid #fa1619', borderBottomRightRadius: 10, width: '33.33%', height: 50 }}>

                    </span>
                    <span  style={{ display: 'inline-block', borderBottom: 0, width: '33.33%', height: 50 }}></span>
                    <span  style={{ display: 'inline-block', borderBottom: '1px solid #fa1619', borderLeft: '1px solid #fa1619', borderBottomLeftRadius: 10, width: '33.33%', height: 50 }}></span>
                </div>
                <div style={{ lineHeight: '40px', textAlign: 'center', fontSize: 14, color: '#fff', width: 40, height: 40, borderRadius: '50%', backgroundColor: '#7e3cfb', position: 'absolute', left: '50%', marginLeft: -20, top: '56%', marginTop: -20 }}>
                    {mockData.name}
                </div>
                <div style={{ height: 30, lineHeight: '30px', position: 'absolute', bottom: '5%' }}>优势学科：{mockData.goodAt}</div>
                <div style={{ width: 90, height: 30, lineHeight: '30px', position: 'absolute', right: 0, bottom: '5%' }}>班级排名: {mockData.classRank}</div>
            </div>
            <div style={{ padding: '15px' }}>
                {
                    mockData.others.map((name, index) => {
                        return (
                            <span key={'sr' + index} style={localStyle.nameCircle}>{name}</span>
                        )
                    })
                }
                <span style={localStyle.nameCircle}>...</span>
            </div>
            <div className={dashboardStyle['detail-btn']}>查看详情</div>
        </div>
    )
}

var localStyle = {
    nameCircle: {
        width: 50, height: 50, borderRadius: '50%', backgroundColor: '#bcbcbc', color: '#fff', display: 'inline-block', lineHeight: '50px', textAlign: 'center'
    }
}
export default StudentReport;