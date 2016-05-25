import React from 'react';
import styles from '../../common/common.css';

//{examlName, examTime, grade, classNum, studentNum, subjectList}

const Header = ({headerInfo}) => {
    
    return (
        <div>
            <div style={{ height: 110, padding: '40px 0 20px 0', backgroundColor: '#fcfcfc', position: 'relative' }}>
                <span style={{ float: 'left' }}>{String.fromCharCode(60) } 返回</span>
                <div style={{ margin: "0 auto", fontSize: 20, width: 600 }}>
                    <div style={{ textAlign: 'center' }}>{headerInfo.examName}</div>
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
                    本次考试（考试时间： <span className={styles['school-report-dynamic']}>{headerInfo.examTime}</span>），
                    我校<span className={styles['school-report-dynamic']}>{headerInfo.grade}</span>年级<span className={styles['school-report-dynamic']}>{headerInfo.classNum}</span>个班级
                    共<span className={styles['school-report-dynamic']}>{headerInfo.studentNum}</span>名学生参加，进行了
                    <span className={styles['school-report-dynamic']}>
                    {
                        headerInfo.subjectList.map((subject, index) => {
                            if (index === headerInfo.subjectList.length -1) {
                                return subject
                            } 
                            return subject + '、'
                        })
                    }
                    </span>
                    ，共<span className={styles['school-report-dynamic']}>{headerInfo.subjectList.length}</span>个学科的考试。
                    对全校整体考试结果的分析，可以得到如下诊断分析意见。
                </p>
            </div>
        </div>
    )
}
export default Header;