import React from 'react';
import Radium from 'radium';
import moment from 'moment';
import {Link} from 'react-router';

import {saveAs} from '../../lib/util';
import {initParams} from '../../lib/util';
import styles from '../../common/common.css';
import {COLORS_MAP as colorsMap, B03, C07, C12} from '../../lib/constants';//TODO:为什么写到这里？？？

var modules = [
    {
        name: '总分分布趋势',
        id: 'fullScoreTrend'
    }, {
        name: '总分分档上线学生人数分布',
        id: 'scoreDistribution'
    }, {
        name: '学科分档上线学生人数分布',
        id: 'subjectDistribution'
    }, {
        name: '班级考试基本表现',
        id: 'classPerformance'
    }, {
        name: '学科考试表现',
        id: 'subjectPerformance'
    }, {
        name: '临界生群体分析',
        id: 'groupAnalysis'
    }, {
        name: '分数排行榜',
        id: 'studentPerformance'
    }
];

//TODO:全部重写成标准的stateless function
class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            activeId: 'fullScoreTrend',
            position: 'normal'
        }
    }

    scrollHandler(navBarTop, scrollTopList) {
        var bodyTop = $('body').scrollTop();
        //判断何时吸顶
        if (navBarTop <= bodyTop) {
            if (this.state.position !== 'fixed') {
                this.setState({
                    position: 'fixed'
                })
            }
        } else {
            this.setState({
                position: 'normal'
            })
        }

        for (var i in scrollTopList) {
            if (scrollTopList[i] <= bodyTop + 100 && scrollTopList[i] >= bodyTop - 100) {
                this.setState({
                    activeId: modules[i].id
                })
                return;
            }
        }

    }

    componentDidMount() {
        var navBarTop = document.getElementById('navBar').offsetTop;
        debugger;
        var scrollTopList = [];
        _.forEach(modules, (module, index) => {
            scrollTopList.push(document.getElementById(module.id).offsetTop)
            debugger;
        })
        var $body = $('body');
        this.scrollHandlerRef = this.scrollHandler.bind(this, navBarTop, scrollTopList);
        window.addEventListener('scroll', this.scrollHandlerRef);

    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollHandlerRef);
    }

    onClickModule(event) {
        var $target = $(event.target);
        var id = $target.data('id');
        if (!id) {
            id = $target.parent('#nav-item').data('id');
        }
        $('body').scrollTop($('#' + id).offset().top - 100) // -100适当补回导航栏遮挡的部分
        this.setState({
            activeId: id
        })

    }

    render() {
        var moduleLen = modules.length;
        var {position} = this.state;
        return (
            <div id='navBar' style={_.assign({}, {zIndex: 100, right: 0, height: 50, display: 'table-row',borderTop: '1px solid ' + colorsMap.C04, backgroundColor: colorsMap.C02},
                                    position === 'normal' ? {position:'absolute', width: '100%', bottom: 0, left: 0} : {position: 'fixed', top: 0, width: '100%', borderBottom: '1px solid ' + colorsMap.C04})}>
                <div style={_.assign(position !== 'normal' ? {position: 'absolute', left: '50%', marginLeft: -600} : {})}>
            {
                modules.map((module, index) => {
                    return (
                        <div key={'navItem-' + index} id='nav-item' style={{display: 'table-cell', minWidth: 1200/moduleLen, height: 50, textAlign: 'center', verticalAlign: 'middle', fontSize: 12, cursor: 'pointer'}}
                             data-id={module.id} onClick={this.onClickModule.bind(this)}>
                            <span style={_.assign({}, {height: 12, float: 'left', marginTop: 2}, index === 0 && position !== 'normal'? {borderRight: '1px solid ' + colorsMap.C04, display: 'inline-block'} : {})}></span>
                            <span style={this.state.activeId === module.id ? {paddingBottom: 16, borderBottom: '2px solid ' + colorsMap.B03, color: colorsMap.B03} : {}}>{module.name} </span>
                            <span style={_.assign({}, {display: 'inline-block', height: 12, float: 'right', marginTop: 2}, index === modules.length -1 && position === 'normal'? {}: {borderRight: '1px solid ' + colorsMap.C04})}></span>
                        </div>
                    )
                })
            }
            </div>
            </div>
        )
    }
  }

@Radium
class Header extends React.Component {
    render() {
        var examInfo = this.props.examInfo.toJS();
        var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');

        return (
            <div id='header' style={{zIndex: 100, padding: '30px 0 30px 30px ', marginBottom: 20, borderRadius: 2, backgroundColor: '#fff', position: 'relative'}}>
                <p style={{fontSize: 18, color: C12, marginBottom: 15}}>校级分析报告-{examInfo.name}</p>
                <p style={{fontSize: 12, color: colorsMap.C10, marginBottom: 28}}>
                    <span style={{marginRight: 15}}>时间: {startTime}</span>
                    <span style={{marginRight: 15}}>人员: {examInfo.gradeName}年级，{examInfo.realClasses.length}个班级，{examInfo.realStudentsCount}位学生</span>
                    <span style={{marginRight: 15}}>
                        科目：
                        {
                            _.map(examInfo.subjects, (subject, index) => {
                                if (index === examInfo.subjects.length -1) {
                                    return subject
                                }
                                return subject + ','
                            })
                        }
                    </span>
                </p>
                {/*
                <div className={styles['button']} style={{width: 180, height: 40, lineHeight: '40px', borderRadius:2, backgroundColor: colorsMap.A12, color: '#fff', cursor: 'pointer'}}>
                    <i className='icon-download-1'></i>
                    下载校级分析报告
                </div>
                */}
                {/************************* 导航条 ******************************/}
                <NavBar/>
            </div>
        )
    }
}

var localStyle={
    goBackLink: {
        color: '#333',
        ':hover': {textDecoration: 'none', color: '#333'}
    }
}
export default Header;

/*

    downloadFile() {
        var _this = this;
        if(_this.state.isDownloading) {
            console.log('文件正在下载中，请稍后再试，或者刷新当前页面重试');
            return;
        }
        _this.setState({
            isDownloading: true
        })

        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        var path = this.props.location.pathname+this.props.location.search;

        params.request.post('/file/render/school/report', {url: path}).then(function(res) {
            var targetFileName = res.data;
            saveAs(window.request.defaults.baseURL+"/file/download/school/report?filename="+targetFileName);
            setTimeout(function() {
                params.request.delete('/file/rm/school/report?filename='+targetFileName);
                _this.setState({
                  isDownloading: false
                })
            }, 4000);
        }).catch(function(err) {
            _this.setState({
                isDownloading: false
            })
            console.log('err = ', err);
        })
    }


 */
