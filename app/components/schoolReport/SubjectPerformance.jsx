import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import Table from '../../common/Table';

let td_subjectTotal = {
    ths: [
        '学科','平均分','优秀率','及格率','满分','最高分','最低分','实考人数','缺考人数'
    ],
    tds: [
        ['语文', 70.5, '0%', '43%', 120, 110, 3, 300, 2],
        ['数学', 56.3, '10%', '43%', 120, 110, 3, 300, 2],
        ['英语', 43, '20%', '43%', 120, 110, 3, 300, 2],
        ['物理', 89, '30%', '43%', 120, 110, 3, 300, 2],
        ['化学', 85, '40%', '43%', 120, 110, 3, 300, 2]
        
    ]
}

let td_subjectClassDistribution = {
    ths: [
        '学科成绩分类','A','B','C','D'
    ],
    tds: [
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%']
    ]
}
const SubjectPerformance = () => {
    return (
        <div className={styles['school-report-layout']}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学科考试表现
            </div>
            <div className={styles['school-report-content']}>
                <p>（1）学科成绩整体情况如下：</p>
                <Table tableData={td_subjectTotal} />
                <p>
                   （2）从各学科的成绩表现看，每个学科的班级平均得分率最高的与最低之间的离差，从大到小的顺序是 数学、化学、英语。如果联系到学科的命题难度，其相对离差从大到小的顺序是 生物，物理，语文。
                   离差较大的学科，反映出班级水平差距较大。利差较小的学科，反映出该学科教学效果比较整齐。（注: 语文是母语，学生水平离差较小应是常态。）
                </p>
                <p>各个学科成绩分布的结构比例情况，如下表所示：</p>
                <Table tableData={td_subjectClassDistribution} />
                
                <p>（4）有关学科命题</p>
                <p>
                    作为学科考试，必须考虑给水平不同的全体学生都能提供展示其学业水平的机会。在这一点上，有数据分析表明，在个学科中，似乎有 语文数学 学科，表现更为突出；
                    <br/>
                    在学科试卷整体难度的把握上，似乎 化学生物有点过易。有的学科在试题难度分布结构方面，进一步完善。如英语物理学科，似乎存在有国难实体份量偏大问题。
                </p> 
                <p>有的学科，试卷中有个别实体可进一步斟酌，如学科英语、语文试卷的0.2一下主观题，可商榷</p>
                <p>注：各个学科更精细的分析报告，另行分学科列示。</p>
               
            </div>
        </div>
    )
}

export default SubjectPerformance;