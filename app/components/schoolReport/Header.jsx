import React from 'react';
import styles from '../../common/common.css';
import moment from 'moment';
import {Link} from 'react-router'
import {initParams} from '../../lib/util';
import Radium from 'radium';
import {saveAs} from '../../lib/util';
import {COLORS_MAP as colorsMap, B03, C07, C12} from '../../lib/constants'; 

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
    }];

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        //this.position = 'normal';
        this.state= {
            activeId: 'fullScoreTrend',
            position: 'normal'
        }
    }
    componentDidMount() {
        var navBarTop = document.getElementById('navBar').offsetTop;
        var scrollTopList = [];
        _.forEach(modules, (module, index) => {
            scrollTopList.push(document.getElementById(module.id).offsetTop)
        })
        var $body = $('body');
        // $('#app').scroll(()=> {
        //     debugger
        //     if ($navBar.scrollTop() <= $body.scrollTop()) {
        //         console.log('need to transfrom!');
        //     }
        // })
        var _this = this;
        window.addEventListener('scroll', function () {
            var bodyTop = $body.scrollTop();
            //判断何时吸顶

            if (navBarTop <= bodyTop) {
                if(_this.state.position !== 'fixed') {
                    $('#header').css({ 'position': 'static' });
                    _this.setState({
                        position: 'fixed'
                    })
                }
            } else{
                $('#header').css({'position': 'relative'});
                _this.position = 'normal';
                _this.setState({
                    position: 'normal'
                })    
            }

            for (var i in scrollTopList) {
                if (scrollTopList[i] <= bodyTop + 100 && scrollTopList[i] >= bodyTop - 100) {
                    _this.setState({
                        activeId: modules[i].id
                    })
                    return;
                }
            }
            

        })

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
        
        return (
            <div id='navBar' style={_.assign({}, {zIndex: 100, right: 0, height: 50, display: 'table-row',borderTop: '1px solid ' + colorsMap.C05, backgroundColor: colorsMap.C02},
                                    this.state.position === 'normal' ? {position:'absolute', width: '100%', bottom: 0, left: 0} : {position: 'fixed', top: 0, width: 1200, left: '50%', marginLeft: -600})}>
            {
                modules.map((module, index) => {
                    return (
                        <div id='nav-item' style={{display: 'table-cell', minWidth: 1200/modules.length, height: 50, textAlign: 'center', verticalAlign: 'middle', fontSize: 12, cursor: 'pointer'}} 
                             data-id={module.id} onClick={this.onClickModule.bind(this)}>
                            <span style={this.state.activeId === module.id ? {paddingBottom: 16, borderBottom: '2px solid ' + colorsMap.A12} : {}}>{module.name} </span>
                            <span style={_.assign({}, {display: 'inline-block', height: 12, float: 'right', marginTop: 2}, index === modules.length -1 ? {}: {borderRight: '1px solid ' + colorsMap.C05})}></span>
                        </div>
                    )
                })
            }
            </div>
        )
    }
  }
  
@Radium
class Header extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          isDownloading: false
      }
    }

    downloadFile() {
        var _this = this;
        if(_this.state.isDownloading) {
            console.log('文件正在下载中，请稍后再试，或者刷新当前页面重试');
            return;
        }
        _this.setState({
            isDownloading: true
        })
        //_this.isDownloading = true;

        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        // var baseURL = (window.client.hostname == 'localhost') ? 'http://' + window.client.hostname + ':' + window.http_port : 'http://' + window.client.hostname
        var path = this.props.location.pathname+this.props.location.search;

        params.request.post('/file/render/school/report', {url: path}).then(function(res) {
            var targetFileName = res.data;
            saveAs(window.request.defaults.baseURL+"/file/download/school/report?filename="+targetFileName);
            //TODO: 删除文件
            setTimeout(function() {
                params.request.delete('/file/rm/school/report?filename='+targetFileName);
                //_this.isDownloading = false;
                _this.setState({
                  isDownloading: false
                })
            }, 4000);
        }).catch(function(err) {
            //_this.isDownloading = false;
            _this.setState({
                isDownloading: false
            })
            console.log('err = ', err);
        })
    }

    render() {
        var {examInfo} = this.props;
        var startTime = moment(examInfo.startTime).format('YYYY.MM.DD');

        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
        if (!examid) return;
        var targetUrl = grade ? '/dashboard?examid=' + examid + '&grade=' + encodeURI(grade) : '/dashboard?examid=' + examid;

        return (
            <div id='header' style={{zIndex: 100, padding: '30px 0 30px 30px ', marginBottom: 20, borderRadius: 2, backgroundColor: '#fff', position: 'relative', minHeight: 230}}>
                <p style={{fontSize: 18, color: C12, marginBottom: 15}}>校级分析报告-{examInfo.name}</p>
                <p style={{fontSize: 12, color: C07, marginBottom: 28}}>
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
                <div className={styles['button']} style={{width: 180, height: 40, lineHeight: '40px', borderRadius:2, backgroundColor: colorsMap.A12, color: '#fff', cursor: 'pointer'}}>
                    <i className='icon-download-1'></i> 
                    下载校级分析报告
                </div>
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
