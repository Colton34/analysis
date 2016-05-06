import React from 'react';
import styles from '../../common/common.css';


const Header = () => {
    return (
        <div>
            <div style={{ height: 50, padding: '40px 0 20px 0', backgroundColor: '#fcfcfc', position: 'relative' }}>
                <span style={{ float: 'left' }}>{String.fromCharCode(60) } 返回</span>
                <div style={{ margin: "0 auto", fontSize: 20, width: 600 }}>
                    <div style={{ textAlign: 'center' }}>遵义县2016年下高二期末考试</div>
                    <div style={{ textAlign: 'center' }}>学校总体分析诊断报告</div>
                </div>
                <a href='javascript: void(0)' className={styles.button}
                    style={{
                        width: 120, height: 30, borderRadius: '20px', backgroundColor: '#698fba', color: '#fff', lineHeight: '30px',
                        position: 'absolute', right: '30px', top: '50%', marginTop: '-15px'
                    }}>
                    下载模板
                </a>
            </div>
            <div className={styles['school-report-content']}>
                <p style={{ lineHeight: '2', marginTop: 40, textIndent: 28 }}>
                    本次考试（考试时间： 2016.06.12-2016.06.15）， 我校初一年级20个班级共2300名学生参加，进行了语文、数学、英语、物理、化学、生物，共6个学科的考试。
                    对全校整体考试结果的分析，可以得到如下诊断分析意见。
                </p>
            </div>
        </div>
    )
}
const Headers = () => {
  return (
      <div></div>
  )  
} 

export default Header;