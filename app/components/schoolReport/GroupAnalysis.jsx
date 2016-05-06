import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import Table from '../../common/Table';

let tableData = {
    ths: [
        '分档临界生','一档临界生人数','二档临界生人数','三档临界生人数'
    ],
    tds:[
        ['全部', 30, 43, 64],
        ['1班', 30, 43, 64],
        ['2班', 30, 43, 64],
        ['3班', 30, 43, 64]
    ]
}
const GroupAnalysis = () => {
    return (
        <div className={styles['school-report-layout']}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学科考试表现
            </div>
            <div className={styles['school-report-content']}>
                <p>
                    将临近总分各分数线上下的群体视为“临界生”，学校可以给他们多一点关注，找到他们的薄弱点、有针对性促进一下，他们就坑稳定、甚至提升总分档次。
                    这个无论是对学生个人，还是对学校整体的教学成就，都有显著的积极作用。全校临界生群体规模，见下表：
                </p>
                <Table tableData={tableData}/>
                <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                    点击查看更多班级数据 V
                </a>
                <div className={styles.tips}>
                    <p>说明：</p>
                    <p>此处文字待添加。</p>
                </div>
            </div>
        </div>
    )

}

export default GroupAnalysis;