import React from 'react';
import styles from '../../common/common.css';
import moment from 'moment';
import {Link} from 'react-router'
import {initParams} from '../../lib/util';
import Radium from 'radium';
import {saveAs} from '../../lib/util';
import {B03, C07, C12} from '../../lib/constants'; 

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
            <div style={{padding: '30px 0 30px 30px ', marginBottom: 20, borderRadius: 2, backgroundColor: '#fff'}}>
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
                <p style={{color: B03}}>
                    <i className='icon-download-1'></i> 
                    下载校级分析报告
                </p>
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
