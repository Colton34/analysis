import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {List} from 'immutable';

import {initHomeAction} from '../../reducers/home/actions';
import {initParams} from '../../lib/util';
import {FROM_FLAG as fromFlag} from '../../lib/constants';

import styles from './Home.css';
import _ from 'lodash';
import Spinkit from '../../common/Spinkit';

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
                    questionnaireItem.map((item, index) => {
                        return (
                            <li key={index} style={{position: 'relative'}}>
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
                    questionList.map((q, index) => {
                        return (
                            <li key={index} style={{ fontSize: 12 }}>
                                <Link to={{pathname: '/faq'}} style={{ textDecoration: 'none', color: '#333' }}>{q}</Link>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

const TeacherHelper = () => {
    return (
        <div>
            <div className={styles.title}>老师小助手</div>
            <div className={styles['instruction-book']}></div>
            <a href='/faq?section=intro&sub=introVideo' className={styles['instruction-video']} ></a>
        </div>
    )
}

const Sidebar = () => {
    return (
        <div style={{ width: 380, backgroundColor: '#fafafa', display: 'inline-block', float: 'right', padding: '0 60px 0 80px' }}>
            <TeacherHelper/>
            <CommonQuestions/>
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

const ExamItem = ({timeKey, item}) => {
    // var examid = item.id.slice(item.id.lastIndexOf('0')+1);
    var examid = item.id.slice(_.findIndex(item.id, (c) => c !== '0'));
    return (
        <div>
        <div style={{ width: 100, height: 130, padding: '40px 0', fontSize: 16, display: 'inline-block', position: 'absolute', left: -100 }}>{timeKey === undefined ? '' : timeKey}</div>
        <div style={{ height: 130, padding: '40px 0', borderBottom: '1px solid #bfbfbf' }}>
            <div>
                <div style={{ display: 'inline-block' }}>
                    <div style={{ fontSize: 16, marginBottom: 20 }}>{item.examName}</div>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>创建时间: {item.eventTime}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>考试科目： {item.subjectCount}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>试卷满分： {item.fullMark}</span>
                    <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 30}}>来自：    {fromFlag[item['from']]}</span>
                </div>
                <Link to={{ pathname: '/dashboard', query: { examid: examid, grade: encodeURI(item.grade) } }} style={{ display: 'inline-block', width: 130, height: 40, lineHeight: '40px', textAlign: 'center', backgroundColor: '#5ab2f9', color: '#fff', float: 'right', textDecoration: 'none', borderRadius: '8px' }}>
                    查看分析
                </Link>
            </div>
        </div>
        </div>
    )
}


const ExamList = ({examList}) => {
    return (
        <div style={{ display: 'inline-block', width: 800, position: 'absolute', right: 380 }}>
            <div style={{ borderBottom: '1px solid #bfbfbf', width: '100%', height: 70, position: 'relative', right: 0, padding: '10px 0 0 0', lineHeight: '70px' }}>
                <Link to={{pathname: '/add/analysis'}}style={{ display: 'inline-block', width: 130, height: 40, backgroundColor: '#009966', color: '#fff', borderRadius: 5, lineHeight: '40px', textAlign: 'center' }}>
                    创建分析
                </Link>
                <span style={{ color: '#aeaeae', position: 'absolute', bottom: -7, marginLeft: 10, fontSize: 14 }}>根据学校实际情况，自定义数据进行分析。比如：文理拆分、文理合并等</span>
            </div>

            {
                examList.length ? _.map(examList, (obj) => {
                    return _.map(obj.values, (exam, index) => {
                        if (index === 0) {
                            return <ExamItem key={index} timeKey={obj.timeKey} item={exam}/>
                        } else {
                            return <ExamItem key={index} item={exam}/>
                        }
                    })
                }) : <NoExamList />
            }
        </div>
    )
}

const Content = ({examList}) => {

    return (
        <div style={{ width: 1200, margin: '0 auto', backgroundColor: '#fff', position:'relative'}}>
            <ExamList examList={examList} />
            <Sidebar/>
        </div>
    )
}

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

class Home extends React.Component {
    static need = [
        initHomeAction
    ];

    componentDidMount() {
        if(this.props.home.haveInit) return;
        var params = initParams(this.props.params, this.props.location, {'request': window.request});
        this.props.initHome(params);
    }

    render() {
        var examList = (List.isList(this.props.home.examList)) ? this.props.home.examList.toJS() : this.props.home.examList;
        if(!examList || examList.length == 0)
            return (
                <div style={{width: '100%', minHeight: 900, position: 'relative'}}>
                    <Spinkit/>
                </div>
            );


        return (
            <div >
                <Welcome/>
                <Content examList={examList}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        home: state.home
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initHome: bindActionCreators(initHomeAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
