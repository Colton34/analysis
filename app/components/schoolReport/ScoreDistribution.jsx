import React from 'react';
import style from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';

let tableData_example = {
    tds: [
        ['全部',100, 120, '15%',360, 460, '15%', 360, 120, '15%'],
        ['一班',100, 120, '15%',360, 460, '15%', 360, 120, '15%'],
        ['二班',100, 120, '15%',360, 460, '15%', 360, 120, '15%'],
        ['三班',100, 120, '15%',360, 460, '15%', 360, 120, '15%']
    ]
}
const Table = ({tableData}) => {
    
    return (
        <table  style={{border: '1px solid #d7d7d7', borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
                <tr style={{backgroundColor:'#f4faee'}}>
                    <th rowSpan="2" className={style['table-unit']}>班级</th>
                    <th colSpan="3" className={style['table-unit']}>一档</th>
                    <th colSpan="3" className={style['table-unit']}>二档</th>
                    <th colSpan="3" className={style['table-unit']}>三档</th>
                </tr>
                <tr style={{backgroundColor: '#f4faee'}}>
                    <th className={style['table-unit']}>人数</th>
                    <th className={style['table-unit']}>累计人数</th>
                    <th className={style['table-unit']}>占比</th>
                    <th className={style['table-unit']}>人数</th>
                    <th className={style['table-unit']}>累计人数</th>
                    <th className={style['table-unit']}>占比</th>
                    <th className={style['table-unit']}>人数</th>
                    <th className={style['table-unit']}>累计人数</th>
                    <th className={style['table-unit']}>占比</th>
                </tr>
                {   
                    tableData['tds'].map(tdList => {
                        return (
                            <tr>
                                {
                                    tdList.map( td => {
                                        return (
                                            <td className={style['table-unit']}>
                                                {td}
                                            </td>
                                        )
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}
const ScoreDistribution = () => {
    let config = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (ReactHighcharts.theme && ReactHighcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: '档位',
            colorByPoint: true,
            data: [{
                name: '一档',
                y: 70
            }, {
                    name: '二挡',
                    y: 24
                }, {
                    name: '三档',
                    y: 5
                }, {
                    name: '其他',
                    y: 1
                }]
        }],
        credits: {
            enabled: false
        }

    };
    return (
        <div style={{ position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                总分分档上线学生人数分布
            </div>
            <span style={{ color: '#b686c9', float: 'right', margin: '30px 5px 30px 0' }}>?设置分档参数</span>
            <div style={{ width: 720, margin: '0 auto', clear: 'both' }}>
                <p style={{ marginBottom: 20 }}>
                    将总分划为3条分数线（一档分数线为520分， 二档分数线为480分，三档分数线为360分）， 全校一、二、三档上线人数分别为： 100人、360人、890人， 上线率分别为： 15%、35%、 60……%</p>
                <p style={{ marginBottom: 40 }}>各班的上线情况见下表：</p>
                <Table tableData={tableData_example}/>             
                <a  href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div style={{ marginTop: 30 }}>
                    <div style={{ display: 'inline-block', width: 330, height: 250, backgroundColor: '#e9f7f0', paddingRight: 30 }}>
                        <p>说明: </p>
                        <p>一档线上线率高的班级有：；二档线以上累计上线率高的班级有： ；三档线以上累计上线率高的班级有： ；</p>
                        <p>一档线上线率低的班级有： ；二档线以上累计上线率低的班级有： ；三档线以上。。。。</p>
                    </div>
                    <ReactHighcharts config={config} style={{ display: 'inline-block', width: 360, height: 250, float: 'right' }}></ReactHighcharts>
                </div>
            </div>
        </div>
    )
}

export default ScoreDistribution;