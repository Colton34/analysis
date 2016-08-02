import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {List, Map} from 'immutable';

import {initHomeAction} from '../../reducers/home/actions';
import {initParams, saveAs} from '../../lib/util';
import {FROM_FLAG as fromFlag, FROM_CUSTOM_TEXT, COLORS_MAP as colorsMap} from '../../lib/constants';

import styles from './Home.css';
import _ from 'lodash';
import Spinkit from '../../common/Spinkit';
import commonStyles from '../../common/common.css';

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
                            <li key={index} className={styles['question-item']} style={{position: 'relative'}}>
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
    '分析报告结果错误或不满意怎么办？',
    '自定义分析时，导入考试数据、学生信息数据错误怎么办？',
    '什么是题目合并、题目累加、将题目合并为一题？',
    '如何再次编辑已创建的自定义分析？',
    '想删除考试分析报告，怎么操作？'
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
                            <li key={index} style={{ fontSize: 12, display: 'table-row'}} className={styles['question-item']}>
                                <span className={styles['question-dot']} style={{display: 'table-cell', width: 15}}></span>
                                <Link to={{pathname: '/faq', query: {section: 'questions', sub: 'zidingyi', index: index}}} style={{ textDecoration: 'none', color: '#333', display: 'table-cell', verticalAlign: 'top'}}>{q}</Link>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

@Radium
class TeacherHelper extends React.Component {
    constructor() {
        super();
        this.state = {
            videoLinkHover: false
        }
    }
    downloadHomeGuidePdf(event) {
        event.preventDefault();
        var path = '/file/download/homeguide';
        saveAs(window.request.defaults.baseURL+path);
    }

    onHoverVideoLink() {
        this.setState({
            videoLinkHover: true
        })
    }

    onLeaveVideoLink() {
        this.setState({
            videoLinkHover: false
        })
    }
    render(){
        return (
            <div>
                <div className={styles.title}>老师助手</div>
                <a  href='/faq?section=intro&sub=introVideo'
                    onMouseEnter={this.onHoverVideoLink.bind(this)}
                    onMouseLeave={this.onLeaveVideoLink.bind(this)}
                    className={this.state.videoLinkHover ? styles['video-img-hover'] : styles['video-img']} ></a>
                <a style={localStyle.downloadBtn}
                    target='_blank'
                    onClick={this.downloadHomeGuidePdf.bind(this)}
                    href="#"
                >
                    <i className='icon-link-1'></i>
                    下载使用说明书
                    <span className='icon-download-1' style={localStyle.downloadIcon}></span>
                </a>
            </div>
        )
    }

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
class ExamItem extends React.Component {
    // ({timeKey, item}) =>
    constructor(props) {
        super(props);
        this.state = {
            hoverLink: false
        }
    }
    handleMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    handleMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        var {timeKey, item} = this.props;
        var examid = item.id.slice(_.findIndex(item.id, (c) => c !== '0'));

        var targetUrl = (item.from === 40) ? '/dashboard?examid=' + examid : '/dashboard?examid=' + examid + '&grade=' + item.grade;
        var queryOptions = (item.from === 40) ? { examid: examid } : {examid: examid, grade: item.grade};

        return (
            <div style={this.props.isLast ? {marginBottom: 15} : {}}>
                <div style={_.assign({}, { color: '#656565', borderBottom: '1px solid #f2f2f2', width: '100%', height: 44, lineHeight: '44px', marginTop: 15}, timeKey === undefined ? { display: 'none' } : { display: 'block' }) }>
                    <i className='icon-clock-2' style={{color: '#d0d0d0'}}></i>{timeKey}分析列表
                </div>
                <div style={{ width: '100%'}}>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'inline-block', width: 54, height: 54, lineHeight: '54px', textAlign: 'center', backgroundColor: '#e1e5eb', borderRadius: '50%', float: 'left'}}>
                            <i className={fromFlag[item['from']] === FROM_CUSTOM_TEXT ? 'icon-fromzdy' : 'icon-fromks'} style={{color: '#fff', fontSize: 26}}></i>
                        </div>
                        <div style={{ display: 'inline-block', marginLeft: 20 }}>
                            <div style={{ fontSize: 16, marginBottom: 8, color: '#3f3f3f' }}>{item.examName}</div>
                            <span style={{ fontSize: 12, color: '#4d4d4d', marginRight: 15 }}>创建时间: {item.eventTime}</span>
                            <span style={{ fontSize: 12, color: '#4d4d4d', marginRight: 15 }}>考试科目： {item.subjectCount}</span>
                            <span style={{ fontSize: 12, color: '#4d4d4d', marginRight: 15 }}>试卷满分： {item.fullMark}</span>
                            <span style={{ fontSize: 12, color: '#4d4d4d', marginRight: 15 }}>
                                来自：<span style={fromFlag[item['from']] === FROM_CUSTOM_TEXT ? {color: '#77bfef'}: {}}>{fromFlag[item['from']]}</span>
                            </span>
                        </div>
                        <Link to={{ pathname: '/dashboard', query: queryOptions }}
                              style={this.state.hoverLink ? localStyle.linkAnalysisBtnHover : localStyle.linkAnalysisBtn}
                              onMouseEnter={this.handleMouseEnter.bind(this)}
                              onMouseLeave={this.handleMouseLeave.bind(this)}>
                            查看分析
                        </Link>
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
        var {examList, errorInfo} = this.props;
        var {pageIndex, pageSize} = this.state;
        return (
            <div style={{ display: 'inline-block', width: 940, float: 'left', padding: 30, marginTop: 25, backgroundColor: '#fff' }}>
                <div className={styles['banner-img']}></div>
                {
                    errorInfo && errorInfo.msg ? (
                        <div style={{width: 940, height: 505, display: 'table-cell', textAlign: 'center', verticalAlign: 'middle'}}>
                            <div className={commonStyles['blank-list']} style={{margin: '0 auto', marginBottom: 30}}></div>
                            <p style={{color: colorsMap.C10, fontSize: 18, marginBottom: 30}}>抱歉，暂时没有和您相关的考试分析数据</p>
                            <p style={{color: colorsMap.C09}}>{errorInfo.msg}</p>
                        </div>
                    ) : ''
                }
                {
                    examList.length && _.isEmpty(errorInfo) ? _.map(examList.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), (obj) => {
                        return _.map(obj.values, (exam, index) => {
                            if (index === 0) {
                                return <ExamItem key={index} timeKey={obj.timeKey} item={exam}/>
                            } else if (index === obj.values.length - 1){
                                return <ExamItem key={index} item={exam} isLast/>
                            } else {
                                return <ExamItem key={index} item={exam}/>
                            }
                        })
                    }) : ''
                }
                {/*-------------------------------------------分页----------------------------------------------------------*/}
                {
                    examList.length  && _.isEmpty(errorInfo) ?
                        <div style={{marginTop: 15, color: '#9a9a9a'}}>
                            <ul style={{margin: '0 auto', width: '50%', listStyleType: 'none', textAlign: 'center'}}>
                                <li key='pagePrev' style={localStyle.pageDirection} data-page='prev' onClick={this.onClickPage.bind(this)}>
                                    <i data-page='prev' className='icon-left-open-2'></i>
                                </li>
                                {
                                    this.getPage().map((num, index, arr) => {

                                        return (
                                            <li key={'pageIndex-' + num}
                                                data-page={num}
                                                onClick={this.onClickPage.bind(this)}
                                                style={_.assign({},{display: 'inline-block', cursor: 'pointer', fontSize: 16, color: '#999'}, num === this.state.pageIndex? {color: '#59bde5'}: {}, index === arr.length -1 ? {marginRight: 22} : {marginRight: 18})}>
                                                {num + 1}
                                            </li>
                                        )

                                    })
                                }
                                <li key='pageNext' style={localStyle.pageDirection} data-page='next' onClick={this.onClickPage.bind(this)}>
                                    <i data-page='next' className='icon-right-open-2'></i>
                                </li>
                            </ul>
                        </div> : ''
                }
            </div>

        )
    }

}

const Content = ({examList, errorInfo}) => {

    return (
        <div style={{ width: 1200, margin: '0 auto', minHeight: 900, backgroundColor: '#eff1f4', position:'relative', paddingBottom: 80}}>
            <ExamList examList={examList} errorInfo={errorInfo}/>
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
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.initHome(params);
    }

    render() {
        var examList = (List.isList(this.props.home.examList)) ? this.props.home.examList.toJS() : this.props.home.examList;
        var errorInfo = (Map.isMap(this.props.home.errorInfo)) ? this.props.home.errorInfo.toJS() : this.props.home.errorInfo;
        // if(!examList || examList.length == 0)
        //     return (
        //         <div style={{width: '100%', minHeight: 900, position: 'relative'}}>
        //             <HomeBlank message="exam.length == 0" />
        //         </div>
        //     );


        return (
            <div >
                <Content examList={examList} errorInfo={errorInfo}/>
            </div>
        );
    }
}
var localStyle= {
    linkAnalysisBtn: {
        display: 'inline-block', width: 100, height: 34, lineHeight: '34px', textAlign: 'center', backgroundColor: '#fff', border:'1px solid #24aef8', color: '#24aef8', float: 'right', textDecoration: 'none', borderRadius: '2px', marginTop: 5,

    },
    linkAnalysisBtnHover: {
        display: 'inline-block', width: 100, height: 34, lineHeight: '34px', textAlign: 'center', border:'1px solid #24aef8', float: 'right', textDecoration: 'none', borderRadius: '2px', marginTop: 5, backgroundColor:'#24aef8', color:'#fff'
    },
    pageDirection: {
        width: 22, height: 22, borderRadius: '50%', backgroundColor: '#e7e7e7', color: '#fff', display: 'inline-block', marginRight: 22, cursor: 'pointer', textAlign: 'center', lineHeight: '22px', fontSize: 12,
        ':hover': {color: '#fff', backgroundColor: '#bfbfbf'}
    },
    downloadBtn: {
        display: 'block', marginTop: 10, height: 40, width: '100%', color: '#333', lineHeight: '40px', borderBottom: '1px solid #dcdcdc',
        ':hover': {color: '#59bde5', textDecoration: 'none'}
    },
    downloadIcon: {
        float: 'right', display: 'inline-block', width: 10, height: 10, color: '#59bde5'
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
