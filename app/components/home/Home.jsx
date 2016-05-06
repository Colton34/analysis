import React from 'react';
import _ from 'lodash';
import styles from './Home.css';

const Welcome = () => {
    return (
        <div style={{ backgroundColor: '#dbdbdb', width: '100%', height: '100%' }}>
            <div style={{ margin: '0 auto', width: 1100, paddingTop: 16 }}>
                <h3 style={{ fontSize: 20 }}>亲爱的 魏旭老师</h3>
                <p style={{ fontSize: 16, lineHeight: '32px' }}>欢迎使用云校考试分析系统，在互联网大数据时代，为了帮助您更好地提高教学水平，我们提供了每次考试的各种分析报告，希望您喜欢。欢迎使用云校考试分析系统，在互联网大数据时代，为了帮助您更好地提高教学水平，我们提供了每次考试的各种分析报告，希望您喜欢。</p>
            </div>
        </div>
    )
}

let examList = [
    {
        name: '遵义二十校联考',
        time: '2016-01-02',
        subjectNum: 3,
        fullScore: 300,
        from: '阅卷'
    }
];
const ExamItem = ({item}) => {
    return (
        <div style={{ height: 50, padding: '40px 0', borderBottom: '1px solid #bfbfbf' }}>
            <div>
                <div style={{ display: 'inline-block' }}>
                    <div style={{ fontSize: 16, marginBottom: 20 }}>{item.name}</div>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>创建时间: {item.time}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>考试科目： {item.subjectNum}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>试卷满分： {item.fullScore}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>来自：    {item['from']}</span>
                </div>
                <a href="javascript:void(0)" style={{ display: 'inline-block', width: 130, height: 40, lineHeight: '40px', textAlign: 'center', backgroundColor: '#5ab2f9', color: '#fff', float: 'right', textDecoration: 'none', borderRadius: '8px' }}>
                    查看分析
                </a>
            </div>
        </div>

    )
} 
const NoExamList = () => {
    return (
        <div>
            <div style={{color: '#ff0000', fontSize: 20, margin: '60px 0 30px 0'}}>还没有分析数据, 可能的原因有：</div>
            <div style={{marginBottom: 30}}>
                <p>1、学校还未使用阅卷进行考试;</p>
                <p>2、还未发布成绩</p>
                <p>3、学科信息与考试信息不一致，请联系管理老师修改学生信息</p>
            </div>
            <p>同时，你还可以创建自定义分析。</p>
        </div>
    )
} 

const List = () => {
    return (
        <div style={{ display: 'inline-block', width: 800, position: 'relative' }}>
            <div style={{ borderBottom: '1px solid #bfbfbf', width: '100%', height: 70, position: 'relative', right: 0, padding: '10px 0 0 0', lineHeight: '70px' }}>
                <a style={{ display: 'inline-block', width: 130, height: 40, backgroundColor: '#009966', color: '#fff', borderRadius: 5, lineHeight: '40px', textAlign: 'center' }}>
                    创建分析
                </a>
                <span style={{ color: '#aeaeae', position: 'absolute', bottom: -7, marginLeft: 10, fontSize: 14 }}>根据学校实际情况，自定义数据进行分析。比如：文理拆分、文理合并等</span>
            </div>
            
            {
                examList.length? _.range(5).map((num) => {return <ExamItem item={examList[0]}/>}) : <NoExamList />
            }
        </div>
    )
}

const TeacherHelper = () => {
    return (
        <div>
            <div className={styles.title}>老师小助手</div>
            <div className={styles['instruction-book']}></div>
            <div className={styles['instruction-video']}></div>
        </div>
    )
} 
let questionList = [
    '多校联考，怎么查看数据？',
    '什么场景下使用自定义分析？',
    '如何删除某次考试分析内容？',
    '群体分析和个体分析的区别是什么？',
    '考试分析提供的报告为什么专业？'
];
const CommonQuestions = () => {
    return (
        <div>
            <div className={styles.title}>常见问题</div>
            <ul className={styles.ul}>
                {
                    questionList.map(q => {
                        return (
                            <li style={{ fontSize: 12 }}>
                                <a href='javascript: void(0)' style={{ textDecoration: 'none', color: '#333' }}>{q}</a>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

let questionnaireItem = [
    '非常喜欢',
    '很不错',
    '继续提升'
]
const Questionnaire = () => {
    return (
        <div>
            <div className={styles.title}>小调查</div>
            <div style={{ color: '#a3a3a3', fontSize: 12, marginTop: 10 }}>对于我们的产品，您的态度是？</div>
            <ul className={styles.ul} style={{ listStyleType: 'decimal' }}>
                {
                    questionnaireItem.map(item => {
                        return (
                            <li style={{position: 'relative'}}>
                                <span>{item}</span>
                                <span className={styles.thumbup}></span>
                            </li>
                        )
                    })
                }
            </ul>
            <span style={{ fontSize: 12, color: '#bfbfbf' }}>注：投票后可以知道所有投票结果</span>
        </div>
    )
}

const Sidebar = () => {
    return (
        <div style={{ width: 240, backgroundColor: '#fafafa', display: 'inline-block', float: 'right', padding: '0 60px 0 80px' }}>
            <TeacherHelper/>
            <CommonQuestions/>
            <Questionnaire/>
        </div>
    )
}

const Content = () => {
    return (
        <div style={{ width: 1200, margin: '0 auto', backgroundColor: '#fff' }}>
            <List/>
            <Sidebar/>
        </div>
    )
}

const Home = () => {
    return (
        <div >
            <Welcome/>
            <Content/>
        </div>
    )
}

export default Home;