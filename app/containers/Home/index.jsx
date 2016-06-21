import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {List} from 'immutable';

import {initHomeAction} from '../../reducers/home/actions';
import {initParams} from '../../lib/util';
import {FROM_FLAG as fromFlag, FROM_CUSTOM_TEXT} from '../../lib/constants';

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
            <div className={styles.title}>
                常见问题
                <a href='/faq' style={{float: 'right', fontSize: 12, color: '#302f2f'}}>更多</a>
            </div>
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
            <div className={styles.title}>老师助手</div>
            <a href='/faq?section=intro&sub=introVideo' className={styles['video-img']} ></a>
            <a target='_blank' href="http://kaoshi2.kss.ksyun.com/yunxiao/kaoshi2.0/pdf/%E5%A5%BD%E5%88%86%E6%95%B0%E9%98%85%E5%8D%B7%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf"
                style={{display: 'block',marginTop: 10, height: 40, color: '#757575', lineHeight: '40px', borderBottom: '1px solid #dcdcdc'}}>下载使用说明书</a>
        </div>
    )
}

const Sidebar = () => {
    return (
        <div style={{ width: 230, backgroundColor: '#eff1f4', display: 'inline-block', float: 'right' }}>
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

/**
 * props:
 * timeKey:
 * item
 */
@Radium
class ExamItem extends React.Component {
    // ({timeKey, item}) =>
    constructor(props) {
        super(props);

    }
    render() {
        var {timeKey, item} = this.props;
        var examid = item.id.slice(_.findIndex(item.id, (c) => c !== '0'));
        return (
            <div >
                <div style={_.assign({}, { color: '#656565', borderBottom: '1px solid #f2f2f2', width: '100%', height: 50, lineHeight: '50px'}, timeKey === undefined ? { display: 'none' } : { display: 'block' }) }>
                    {timeKey}分析列表
                </div>
                <div style={{ width: '100%', height: 100 }}>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'inline-block', width: 50, height: 50, backgroundColor: '#e1e5eb', borderRadius: '50%' }}></div>
                        <div style={{ display: 'inline-block', marginLeft: 20 }}>
                            <div style={{ fontSize: 16, marginBottom: 10, color: '#3f3f3f' }}>{item.examName}</div>
                            <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 15 }}>创建时间: {item.eventTime}</span>
                            <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 15 }}>考试科目： {item.subjectCount}</span>
                            <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 15 }}>试卷满分： {item.fullMark}</span>
                            <span style={{ fontSize: 12, color: '#c5c5c5', marginRight: 15 }}>
                                来自：<span style={fromFlag[item['from']] === FROM_CUSTOM_TEXT ? {color: '#77bfef'}: {}}>{fromFlag[item['from']]}</span>
                            </span>
                        </div>
                        <a href={'/dashboard?examid=' + examid + '&grade=' + encodeURI(item.grade)} style={localStyle.linkAnalysisBtn}>
                            查看分析
                        </a>
                    </div>
                </div>
            </div>
        )
    }
    
}

@Radium
class ExamList extends React.Component {
    // ({examList})
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 0,
            pageSize: 3,
            pageRange: 5
        }
    }
    getPage() {
        var len = this.props.examList.length;
        var {pageIndex, pageSize, pageRange} = this.state;
        var maxPage   = len % pageSize == 0 ? len / pageSize : parseInt(len / pageSize) + 1;
        var startPage = 0;
        var endPage   = maxPage;
        if(pageIndex - 2 < 0){
            startPage = 0;
            endPage = pageRange > maxPage ? maxPage : pageRange;
        }else if(pageIndex + 2 >= maxPage){
            startPage = maxPage - pageRange >= 0? maxPage - pageRange : 0;
            endPage   = maxPage;
        }else{
            startPage = pageIndex - 2;
            endPage   = pageIndex + 2 + 1;
        }
        return _.range(startPage, endPage)
    }
    onClickPage(event) {
        var {pageIndex} = this.state;
        var page = $(event.target).data('page'); 
        switch(page) {
            case 'prev':
                if (pageIndex === 0) return ;
                this.setState({
                    pageIndex : pageIndex - 1
                })
                break;
            case 'next':
                var {pageSize} = this.state;
                var len = this.props.examList.length;
                var maxPage = len % pageSize === 0 ? len / pageSize : parseInt(len / pageSize) + 1;
                if (pageIndex + 1 === maxPage) return;
                this.setState({
                    pageIndex : pageIndex + 1
                })
                break;
            default:
                var pageNum = _.isNaN(parseInt(page)) ? undefined : parseInt(page);
                if (pageNum !== undefined) {
                    this.setState({
                        pageIndex: pageNum
                    })
                }
        }
    }
    render() {
        var {examList} = this.props;
        var {pageIndex, pageSize} = this.state;
        return (
            <div style={{ display: 'inline-block', width: 940, float: 'left', padding: 30, marginTop: 15, backgroundColor: '#fff' }}>
                <div className={styles['banner-img']}></div>
                {
                    examList.length ? _.map(examList.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), (obj) => {
                        return _.map(obj.values, (exam, index) => {
                            if (index === 0) {
                                return <ExamItem key={index} timeKey={obj.timeKey} item={exam}/>
                            } else {
                                return <ExamItem key={index} item={exam}/>
                            }
                        })
                    }) : <NoExamList />
                }
                {/*-------------------------------------------分页----------------------------------------------------------*/}
                {
                    examList.length ? 
                        <div style={{marginTop: 15, color: '#9a9a9a'}}>
                            <ul style={{margin: '0 auto', width: '50%', listStyleType: 'none', textAlign: 'center'}}>
                                <li key='pagePrev' style={localStyle.pageDirection} data-page='prev' onClick={this.onClickPage.bind(this)}>
                                    {'<'}
                                </li>
                                {
                                    this.getPage().map((num, index) => {
                                        return (
                                            <li key={'pageIndex-' + index} 
                                                data-page={num} 
                                                onClick={this.onClickPage.bind(this)} 
                                                style={_.assign({},{display: 'inline-block', marginRight: 20, cursor: 'pointer'}, num === this.state.pageIndex? {color: '#24aef8'}: {})}> 
                                                {num + 1}
                                            </li>
                                        ) 
                                        
                                    })
                                }
                                <li key='pageNext' style={localStyle.pageDirection} data-page='next' onClick={this.onClickPage.bind(this)}>
                                    {'>'}
                                </li>
                            </ul>
                        </div> : '' 
                }
            </div>
                
        )
    }
    
}

const Content = ({examList}) => {

    return (
        <div style={{ width: 1200, margin: '0 auto', minHeight: 900, backgroundColor: '#eff1f4', position:'relative', paddingBottom: 80}}>
            <ExamList examList={examList} />
            <Sidebar/>
            <div style={{clear:'both'}}></div>
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
                <Content examList={examList}/>
            </div>
        );
    }
}
var localStyle= {
    linkAnalysisBtn: { 
        display: 'inline-block', width: 130, height: 40, lineHeight: '40px', textAlign: 'center', backgroundColor: '#fff', border:'1px solid #24aef8', color: '#24aef8', float: 'right', textDecoration: 'none', borderRadius: '2px', marginTop: 5,
        ':hover': {textDecoration: 'none', backgroundColor:'#24aef8', color:'#fff'}
    },
    pageDirection: {
        width: 20, height: 20, borderRadius: '50%', backgroundColor: '#DADADA', color: '#fff', display: 'inline-block', marginRight: 20, cursor: 'pointer', textAlign: 'center', lineHeight: '20px',
        ':hover': {color: '#fff', backgroundColor: '#24aef8'}
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
