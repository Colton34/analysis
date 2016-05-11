import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import Table from '../../common/Table.jsx';
import DropdownList from '../../common/DropdownList';
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


const SubjectDistribution = () => {
    let config = {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: [
                '初一1班',
                '初一2班',
                '初一3班',
                '初一4班',
                '初一5班',
                '初一6班'
            ]
        },
        yAxis: {
            min: 0,
            title: {
                text: '人数'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} 人</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: '人数',
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0]

        }],
        credits: {
            enabled: false
        }
    };
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学科分档上线学生人数的分布
            </div>
            <div style={{ width: 720, margin: '0 auto', marginTop: 50 }}>
                <p style={{ marginBottom: 15 }}>
                    根据总分分档上线学生人数的分布情况，我们用大数据分析技术能科学地将总分分数线分解到各个学科，形成各个学科的一、二、三档分数线。
                    有了学科分数线，就能明确得到全校及班级各个学科一、二、三档上线的学生人数。下面几个表分别表示一、二、三档各个学科的上线人数。
                </p>
                <p style={{ color: '#a883fc', marginBottom: 20 }}>
                    对每个档次而言，学科提供的上线人数越多，该学科就为全校总分达到该分数线要求的学生人数， 提供了更大的可能性。这可以视为该学科的教学贡献。
                    反之，学科上线人数越少，学科对高层次学生的培养处于短板，需要引起高度重视。
                </p>
                <p>学校各学科一档上线学生人数表：</p>
                <Table tableData={tableData}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div style={{ backgroundColor: '#e7f9f0', padding: '5px 10px', marginTop: 15 }}>
                    <p>说明: </p>
                    <p>语文、英语学科在本次考试中一档上线率贡献较大， 数学学科对高层次的学生培养处于弱势，需要引起高度重视。</p>
                    <p>2班、1班、6班对语文学科贡献较大， 2班、1班、6班对语文学科贡献较小</p>
                    <p>5班、3班、4班对数学学科贡献较大， 2班、1班、6班对数学学科贡献较小</p>
                </div>
                <p>具体各班级学科一档分布图表如下：</p>
                <span style={{position: 'absolute', right: 0, marginTop:40}}><DropdownList list={['语文','数学','英语','物理','化学']}/></span>
                <ReactHighcharts config={config}></ReactHighcharts>

                <p>学校各学科二档上线学生人数表：</p>
                <Table tableData={tableData}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div style={{ backgroundColor: '#e7f9f0', padding: '5px 10px', marginTop: 15 }}>
                    <p>说明: </p>
                    <p>语文、英语学科在本次考试中一档上线率贡献较大， 数学学科对高层次的学生培养处于弱势，需要引起高度重视。</p>
                    <p>2班、1班、6班对语文学科贡献较大， 2班、1班、6班对语文学科贡献较小</p>
                    <p>5班、3班、4班对数学学科贡献较大， 2班、1班、6班对数学学科贡献较小</p>
                </div>
                <p>具体各班级学科一档分布图表如下：</p>
                <span style={{position: 'absolute', right: 0, marginTop:40}}><DropdownList list={['语文','数学','英语','物理','化学']}/></span>
                <ReactHighcharts config={config}></ReactHighcharts>

                <p>学校各学科三档上线学生人数表：</p>
                <Table tableData={tableData}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div style={{ backgroundColor: '#e7f9f0', padding: '5px 10px', marginTop: 15 }}>
                    <p>说明: </p>
                    <p>语文、英语学科在本次考试中一档上线率贡献较大， 数学学科对高层次的学生培养处于弱势，需要引起高度重视。</p>
                    <p>2班、1班、6班对语文学科贡献较大， 2班、1班、6班对语文学科贡献较小</p>
                    <p>5班、3班、4班对数学学科贡献较大， 2班、1班、6班对数学学科贡献较小</p>
                </div>
                <p>具体各班级学科一档分布图表如下：</p>
                <span style={{position: 'absolute', right: 0, marginTop:40}}><DropdownList list={['语文','数学','英语','物理','化学']}/></span>
                <ReactHighcharts config={config}></ReactHighcharts>

                <div className={styles.tips}>
                    <p>总结: </p>
                    <p>
                        从以上数据可以明显看到，语文、数学学科一档上线人数更多，他们对促进更多学生总分达到一定一档水平带来的可能性更大，可以说他们对一档上线的贡献来得较大；
                        二档上线，英语、化学学科的贡献来的较大；
                        三档上线，物理、生物学科的教学贡献来得较大。相应的政治学科上线人数较少，对对学生总分上线的促进作用来得小。
                    </p>
                    <p>各学科个档次上线在各个班级中的表现，数据以显示的很清楚，在此不再赘述。</p>
                </div>
            </div>
        </div>
    )
}

export default SubjectDistribution;