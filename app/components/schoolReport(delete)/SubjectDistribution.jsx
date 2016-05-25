import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import Table from '../../common/Table.jsx';
import DropdownList from '../../common/DropdownList';
import {getNumberCharacter} from '../../lib/util';

//todo: 各档上线信息展示区域可以专门提出来做一个组件。

let tableData = {
    ths: [
        '班级', '语文', '数学', '英语', '化学'
    ],
    tds: [
        ['全部', 132, 112, 134, 124],
        ['初一1班', 12, 23, 23, 34],
        ['初一2班', 34, 34, 54, 54],
        ['初一3班', 34, 46, 65, 23],
        ['初一4班', 23, 23, 11, 23],
        ['初一5班', 45, 12, 45, 53]
    ]
}


const SubjectDistribution = ({totalScoreLevel}) => {
    var config = {
        chart: {
            type: 'column'
        },
        title: {
        	text: ''
        },
        legend: {
        	enabled: false
        },
        xAxis: {
            categories: ['初一1班', '初一2班', '初一3班', '初一4班', '初一5班']
        },
        yAxis: {
        	title: ''
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        tooltip: {
            pointFormat: '<b>{point.name}:{point.y:.1f}</b>'
        },
        series: [
            {
                data: [{name: '语文',y:29.9},{name:'英语',y:71.5},{name:'英语',y:106.4},{name:'化学',y:129.2},{name:'语文',y: 144}],
                color: '#74c13b',
                stack: 0
            }, {
                data:  [{name: '物理',y:-29.9},{name:'生物',y:-71.5},{name:'生物',y:-106.4},{name:'数学',y:-129.2},{name:'数学',y: -144}],
                color: '#f2cd45',
                stack: 0
            }
        ],
        credits: {
        	enabled: false
        }
    };
    var levelCommonInfo = _.range(totalScoreLevel.length).map(num => {
        return getNumberCharacter(num + 1) + (num !== totalScoreLevel.length - 1 ? '、' : '');
    })
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学科分档上线学生人数的分布
            </div>
            <div style={{ width: 720, margin: '0 auto', marginTop: 50 }}>
                <p style={{ marginBottom: 15 }}>
                    根据总分分档上线学生人数的分布情况，我们用大数据分析技术能科学地将总分分数线分解到各个学科，形成各个学科的
                    <span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档分数线。
                    有了学科分数线，就能明确得到全校及班级各个学科<span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档上线的学生人数。
                    下面几个表分别表示<span className={styles['school-report-dynamic']}>{levelCommonInfo}</span>档各个学科的上线人数。
                </p>
                <p style={{ color: '#a883fc', marginBottom: 20 }}>
                    对每个档次而言，学科提供的上线人数越多，该学科就为全校总分达到该分数线要求的学生人数， 提供了更大的可能性。这可以视为该学科的教学贡献。
                    反之，学科上线人数越少，学科对高层次学生的培养处于短板，需要引起高度重视。
                </p>
                {
                    _.range(totalScoreLevel.length).map(num => {
                        var level = getNumberCharacter(num + 1);
                        return (
                            <div key={num}>
                                <p>学校各学科{level}档上线学生人数表：</p>
                                <div style={{width: '100%', overflow: 'scroll'}}>
                                    <Table tableData={tableData}/>
                                </div>
                                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                                    点击查看更多班级数据 V
                                </a>
                                <div style={{ backgroundColor: '#e7f9f0', padding: '5px 10px', marginTop: 15 }}>
                                    <p>{level}档上线数据分析表明： </p>
                                    <p>对于全校，<span style={{ color: '#c96925' }}>语文、英语学科</span>在本次考试中一档上线率贡献较大，
                                    <span style={{ color: '#c96925' }}>数学学科</span>对高层次的学生培养处于弱势，需要引起高度重视。</p>
                                    <p style={{margin:'10px 0'}}>对于各班级而言，各个学科的表现是不一样的，经分析，可得到如下结论：</p>
                                    <p>
                                        对于各班，<span style={{ color: '#c96925' }}>2班、1班、6班</span>对语文学科贡献较大，
                                        <span style={{ color: '#c96925' }}>2班、1班、6班</span>对语文学科贡献较小
                                    </p>
                                    <p>
                                        对于各班，<span style={{ color: '#00955e' }}>5班、3班、4班</span>对数学学科贡献较大，
                                        <span style={{ color: '#00955e' }}>2班、1班、6班</span>对数学学科贡献较小
                                    </p>
                                </div>
                                <p>
                                    各班级的具体情况不一样，综合全校各班级各学科提供的学生总分上线贡献的因素，
                                    各班级{level}档上线贡献率最大和最小学科如下图所示：
                                </p>
                                <p>学科上线率离差：</p>
                                <ReactHighcharts config={config}></ReactHighcharts>
                                <div style={{ backgroundColor: '#e7f9f0', padding: '15px 0', marginTop: 15,fontSize: 12}}>
                                    班级学科上线率离差： 指班级的学科上线率与全校各班级该学科的平均上线率之间的差值，反映了班级该学科对上线贡献的大小。
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}

export default SubjectDistribution;