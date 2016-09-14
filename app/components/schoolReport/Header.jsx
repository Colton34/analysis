import _ from 'lodash';
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
        name: '总分分布图',
        id: 'fullScoreTrend'
    }, {
        name: '总分分档上线学生人数分布',
        id: 'scoreDistribution'
    }, {
        name: '学科分档上线学生人数分布',
        id: 'subjectDistribution'
    }, {
        name: '临界生群体分析',
        id: 'groupAnalysis'
    },{
        name: '班级考试基本表现',
        id: 'classPerformance'
    }, {
        name: '学科考试表现',
        id: 'subjectPerformance'
    },  {
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
        var scrollTopList = [];
        _.forEach(modules, (module, index) => {
            scrollTopList.push(document.getElementById(module.id).offsetTop)
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
            <div id='header' style={{zIndex: 100, padding: '0px 0 30px 0px ', marginBottom: 20, borderRadius: 2, backgroundColor: '#fff', position: 'relative'}}>
                <div>
                    <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                        <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                        <p style={{ fontSize: 18 }}>校级分析诊断报告</p>
                    </div>
                </div>
                <div style={{ position: 'relative', marginBottom: 20 }}>
                    <div id='header' style={{borderRadius: 2, backgroundColor: '#fff', padding: 30}}>
                        <p>尊敬的校领导，您好:</p>
                        <p>
                            本次考试（考试时间：{startTime}），全校{examInfo.gradeName}共<span style={{ color: colorsMap.B03 }}>{examInfo.realClasses.length}</span>个班，<span style={{ color: colorsMap.B03 }}>{examInfo.realStudentsCount}</span>名学生参加考试。
                            考试学科：<span style={{ color: colorsMap.B03 }}> {_.join(examInfo.subjects, '、') }</span>，{examInfo.subjects.length}个学科。
                        </p>
                        <p style={{ marginBottom: 0 }}>
                            此次分析是从科目总分，学科成绩、学科内在结构几个层面分析了全年级、各班级各学科的考试基本表现。在全校的总分分布，总分分档线，学科分档上线分布，班级学科水平，各学科内在表现，重点学生等方面揭示全校的学业表现及特征状况。力图分析与发现学校学业优势与不足，帮助学校教学领导全面掌握全校的学生基本情况，便于有针对性地指导与改进学校教学，提高教学质量。
                        </p>
                    </div>
                </div>
                <NavBar/>
            </div>
        )
    }
}

//【暂时】 ，缺考<span style={{ color: colorsMap.B03 }}>{examInfo.lostStudentsCount}</span>名

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
