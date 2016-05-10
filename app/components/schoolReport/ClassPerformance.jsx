import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import Table from '../../common/Table';
import DropdownList from '../../common/DropdownList';

let td_averageScoreRate = {
    ths: [
        '班级', '语文', '数学', '英语', '化学'
    ],
    tds: [
        ['全部', 0.8, 0.8, 0.8, 0.9],
        ['初一1班', 0.7, 0.7, 0.7, 0.7],
        ['初一2班', 0.6, 0.6, 0.6, 0.6],
        ['初一3班', 0.78, 0.78, 0.78, 0.78]
    ]
}

let td_subjectAveScoreRate = {
    ths : [
        '班级', '总分', '语文', '数学','英语', '化学'
    ],
    tds: [
        ['一班', 0.8, 0.7, 0.6, 0.5, 0.78],
        ['二班', 0.8, 0.6, 0.5, 0.9, 0.88],
        ['三班', 0.8, 0.6, 0.5, 0.9, 0.88],
        ['四班', 0.23, 0.43, 0.32, 0.68, 0.87],
        ['五班', 0.78, 0.62, 0.48, 0.7, 0.9]
    ]    
}

let td_scoreGroup = {
    ths: [
      '班级', '第一组[0, 106]', '第二组[106,305]', '第三组[305,420]', '第四组<br/>[420, 480]', '第五组[480,540]','第六组[540, 610]',
      '第七组[610,690]', '第八组[610,690]','第九组[690, 750]'
    ],
    tds: [
        ['全校', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['1班', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['2班', 203, 346, 465, 203, 334, 203, 346, 465, 203],
        ['3班', 203, 346, 465, 203, 334, 203, 346, 465, 203]
    ]
}
const ClassPerformance = () => {
    return (
        <div className={styles['school-report-layout']}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                班级的考试基本表现
            </div>
            <div className={styles['school-report-content']}>
                <p>（1）从班级学生总分分布看，第二点中“各班一、二、三上线学生人数分布表”，反映出各个班级总分较高学生的人数分布。</p>
                <p>
                    （2）考虑到各个班级有各自的具体情况，可以基于各班的自身水平来考察高端及低端学生的分布，反映出学生总分的分布趋势。通过大数据归类分析我们发现，以各班自身水平衡量，高分学生人数较多的
                    班级有：1班、3班，高分学生人数比低分学生人数较少的班级有6班、5班。
                </p>
                <p>（3）从平均水平看，全校和班级的各学科平均得分率见下表所示：</p>
                <span style={{position: 'absolute', right: 0, marginTop:40}}><DropdownList list={['平均得分率','平均分']}/></span>
                <Table tableData={td_averageScoreRate}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <p>表中各个班级的平均得分率高低一目了然，在此不再赘述。</p>
                <p>
                    (4) 各班的平均得分率看起来有高有低，也不能简单通过排队就评价教学质量的高低，需要结合各班具有自身的具体情况和原因基于客观分析（比如有尖子班、普通版之分）。
                    但相对于班级自身综合水平而言，各班各学科的平均得分率贡献指数（见下表）可以反映出各个班级教学对其自身综合水平影响的大小。（指数值为正，是促使提高；
                    为负， 是拖后腿。）
                </p>
                <Table tableData={td_subjectAveScoreRate}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div className={styles.tips}>
                    <p>说明：</p>
                    <p>平均贡献指数： 指每个学科凭据得分率 - 总体平均得分率，该数值可以更加直观的反映出班级对每个学科在教学上的综合水平影响程度。</p>
                    <p>从以上数据统计来看， 1班、2班、5班、8班在 数学、英语学科上贡献较高。</p>
                </div>
                <p>
                    （5）将学校分数从高到低，分为十足学生，每一组学生之间的水平相差不大，按这样方式，我们可以看见各班在这样的7组中所存在的人数如下：
                </p>
                <Table tableData={td_scoreGroup}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div className={styles.tips}>
                    <p>说明：</p>
                    <p>从以上数据表格中，安总人数平均分为十组，可以看见不同组（及不同分数段中）在不同班级的人数分布情况。</p>
                </div>
            </div>
        </div>
    )
}











export default ClassPerformance;