/*
* @Author: HellMagic
* @Date:   2016-04-09 22:19:16
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-09 22:19:41
*/

'use strict';
//路由container view，用来组织state object tree, 并connect redux and react


//Dashboard的Mock版本：

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link} from 'react-router';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';

import ExamGuideComponent from '../components/dashboard/exam-guide';

import {initExamGuide} from '../reducers/dashboard/actions';

import {Map} from 'immutable';

// 　Bgcolor:″＃F1FAFA″——做正文的背景色好，淡雅
// 　　Bgcolor:″＃E8FFE8″——做标题的背景色较好，与上面的颜色搭配很协调
// 　　Bgcolor:″＃E8E8FF″——做正文的背景色较好，文字颜色配黑色
// 　　Bgcolor:″＃8080C0″——上配黄色白色文字较好
// 　　Bgcolor:″＃E8D098″——上配浅蓝色或蓝色文字较好
// 　　Bgcolor:″＃EFEFDA″——上配浅蓝色或红色文字较好
// 　　Bgcolor:″＃F2F1D7″——配黑色文字素雅，如果是红色则显得醒目
// 　　
// 　　
// 　　Bgcolor:″＃336699″——配白色文字好看些  -- 蓝色
// 　　
// 　　
// 　　Bgcolor:″＃6699CC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃66CCCC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃B45B3E″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃479AC7″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃00B271″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃FBFBEA″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃D5F3F4″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃D7FFF0″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃F0DAD2″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃DDF3FF″——配黑色文字比较好看，一般作为正文

//   #f5f5dc   #ffe4c4

@Radium
class Dashboard extends React.Component {
    static need = [
        initExamGuide
    ];

    constructor(props) {
      super(props);

    }

    render() {
        var containers = _.map(_.range(4), function(index) {
            return (null);
        });

        var data = JSON.stringify(this.props.dashboard.examGuide);
        var jsdata = JSON.parse(data);

console.log('examGuide = ', data);


        return (
            <div style={[styles.box, styles.common.radius]}>
                <div style={[styles.container, styles.common.radius]}>
                    <ExamGuideComponent data={jsdata}/>
                    <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>分数排行榜</div>
                    </div>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>学校成绩总报告</div>
                    </div>
                </div>
                <div style={[styles.container, styles.common.radius]}>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>分档分析报告</div>
                    </div>
                    <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>班级分析报告</div>
                    </div>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>学科分析报告</div>
                    </div>
                </div>
                <div style={[styles.container, styles.common.radius]}>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>学生个人报告</div>
                    </div>
                    <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>知识点分析情况</div>
                    </div>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>试卷质量分析</div>
                    </div>
                </div>
                <div style={[styles.container, styles.common.radius]}>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>试卷讲评</div>
                    </div>
                    <div style={[styles.item, styles.common.radius, {marginLeft: 20, marginRight: 20}]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>老师个人报告</div>
                    </div>
                    <div style={[styles.item, styles.common.radius]}>
                        <div style={{fontWeight: 'blod', marginTop: 10}}>考试总成绩</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(Dashboard);


function mapStateToProps(state) {
    return {
        dashboard: state.dashboard
    }
}

var styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    box: {height: 1500, backgroundColor: '#f5f5dc', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', margin: 30},
    container: {height: 300, marginLeft: 10, marginRight: 10, display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'nowrap'},
    item: {height: 260, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15}
}
