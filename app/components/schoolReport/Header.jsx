import React from 'react';
import styles from '../../common/common.css';
import moment from 'moment';
import {Link} from 'react-router'
import {initParams} from '../../lib/util';
import Radium from 'radium';
import {saveAs} from '../../lib/util';

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
            <div>
                <div style={{ height: 110, backgroundColor: '#fcfcfc', position: 'relative', display:'table-cell', width: 1000, verticalAlign: 'middle', textAlign: 'center'}}>
                    <a href={targetUrl} style={[localStyle.goBackLink,{ float: 'left', margin: '20px 0 0 20px'}]}><i className='icon-left-open-3'></i>返回</a>
                    <div style={{ margin: "0 auto", fontSize: 20, width: 700}}>
                        
                        <div style={{ textAlign: 'center' }}>{examInfo.name}</div>
                        <div style={{ textAlign: 'center' }}>学校总体分析诊断报告</div>
                        
                    </div>
                    <a href='javascript: void(0)' className={styles.button}
                        onClick={this.downloadFile.bind(this)}
                        style={_.assign({},{
                            width: 120, height: 30, borderRadius: '20px', backgroundColor: '#698fba', color: '#fff', lineHeight: '30px',
                            position: 'absolute', right: '30px', top: '50%', marginTop: '-20px'
                        }, this.state.isDownloading ? {backgroundColor: '#f2f2f2', color: '#bfbfbf'} : {})}>
                        <i className='icon-tikuai-1'></i>
                        下载报告
                    </a>
                </div>
                <div className={styles['school-report-content']}>
                    <p style={{ lineHeight: '22px', marginTop: 40, textIndent: 28, fontSize: 14}}>
                        本次考试（考试时间： <span className={styles['school-report-dynamic']}>{startTime}</span>），
                        我校<span className={styles['school-report-dynamic']}>{examInfo.gradeName}</span>年级<span className={styles['school-report-dynamic']}>{examInfo.realClasses.length}</span>个班级
                        共<span className={styles['school-report-dynamic']}>{examInfo.realStudentsCount}</span>名学生参加，进行了
                        <span className={styles['school-report-dynamic']}>
                        {
                            _.map(examInfo.subjects, (subject, index) => {
                                if (index === examInfo.subjects.length -1) {
                                    return subject
                                }
                                return subject + '、'
                            })
                        }
                        </span>
                        ，共<span className={styles['school-report-dynamic']}>{examInfo.subjects.length}</span>个学科的考试。
                        对全校整体考试结果的分析，可以得到如下诊断分析意见。
                    </p>
                </div>
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
