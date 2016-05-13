import React from 'react';
import dashboardStyle from './dashboard.css';

const ReactHighcharts = require('react-highcharts');


var mockData = {
    subject: '语文',
    reliability: 0.9,
    difficulty: 0.61,
    difference: 0.32,
    good: [1,3,5],
    lowDiff: [11,12,31],
    tooHard: [6,8,10]
  
}
const PaperQuality = () => {
    return (
        <div style={{padding:'10px 20px',lineHeight: 1.5, backgroundColor:'#efeefb', margin:15}}>
            <div>{mockData.subject}学科本次考试：</div>
            <div style={{width:'100%',textAlign:'center'}}>
                <span style={localStyle.percentBlock}>
                    <div style={localStyle.percentData}>{mockData.reliability}</div>
                    <div>试卷信度</div>
                </span>
                 <span style={localStyle.percentBlock}>
                    <div style={localStyle.percentData}>{mockData.difficulty}</div>
                    <div>试卷难度</div>
                </span>
                 <span style={localStyle.percentBlock}>
                    <div style={localStyle.percentData}>{mockData.difference}</div>
                    <div>试卷区分度</div>
                </span>
            </div>
            <div>
                命题精彩的题目是：
                {
                    mockData.good.map((num, index) =>{
                        var str = '第' + num + '题';
                        if (mockData.good.length -1 !== index) {
                            str += '，';
                        }
                        return <span style={localStyle.questionNum} key={'good' + index}>{str}</span>;
                    })
                }
            </div>
            <div>
                区分度太低的题目是：
                {
                    mockData.lowDiff.map((num, index) =>{
                        var str = '第' + num + '题';
                        if (mockData.lowDiff.length -1 !== index) {
                            str += '，';
                        }
                        return <span style={localStyle.questionNum} key={'lowDiff' + index}>{str}</span>;
                    })
                }
            </div>
            <div>
                命题太难的题目是：
                {
                    mockData.tooHard.map((num, index) =>{
                        var str = '第' + num + '题';
                        if (mockData.tooHard.length -1 !== index) {
                            str += '，';
                        }
                        return <span style={localStyle.questionNum} key={'tooHard' + index}>{str}</span>;
                    })
                }
            </div>
            <div className={dashboardStyle['detail-btn']}>查看详情</div>
        </div>
    )
}
var localStyle= {
    percentBlock: {
        display: 'inline-block',width:'30%', height: 50
    },
    percentData: {
        margin: '15px 0 10px 0',
        fontSize: 16,
        color: '#0059fc'
    },
    questionNum: {
        color: '#2aa450'
    }
}
export default PaperQuality;