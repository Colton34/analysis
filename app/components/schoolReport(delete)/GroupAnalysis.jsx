import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import Table from '../../common/Table';
import {getNumberCharacter} from '../../lib/util';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

let localStyle = {
    btn: {lineHeight: '50px', width: 150, height: 50,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',margin: '0 30px'}
}

let tableData = {
    ths: [
        '分档临界生', '一档临界生人数', '二档临界生人数', '三档临界生人数'
    ],
    tds: [
        ['全部', 30, 43, 64],
        ['1班', 30, 43, 64],
        ['2班', 30, 43, 64],
        ['3班', 30, 43, 64]
    ]
}

class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(ref, event) {
        this.refs[ref].value = event.target.value;
    }
    okClickHandler() {
        var levels = this.props.totalScoreLevel.length;
        var floatScores = [];
        for(var i=0; i < levels; i++) {
            floatScores.push(parseFloat(this.refs['float-' + i].value)); 
        }
        console.log('================== set float scores: ' + JSON.stringify(floatScores));
        this.props.onHide();
    }
    render() {
        var {totalScoreLevel} = this.props;
        var _this = this;
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide.bind(this) }>
                <Header closeButton style={{ textAlign: 'center' }}>
                    设置临界生分数
                </Header>
                <Body className="apply-content">
                    <div style={{ minHeight: 150, display: 'table', margin:'0 auto'}}>
                        <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                        {
                            _.range(totalScoreLevel.length).map(num => {
                                return (
                                    <div key={num} style={{textAlign: 'center', marginBottom:20}}>
                                        {getNumberCharacter(num + 1) }档线上下浮分数：
                                        <input ref={'float-' + num} defaultValue={10} style={{ width: 140, heigth: 28, display: 'inline-block', textAlign: 'center' }}/>分
                                    </div>
                                )
                            })
                        }
                        </div>
                    </div>
                </Body>
                <Footer className="text-center" style={{ textAlign: 'center', borderTop: 0 }}>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={_this.okClickHandler.bind(_this) }>
                        确定
                    </a>
                    <a href="javascript:void(0)" style={localStyle.btn} onClick={this.props.onHide}>
                        取消
                    </a>
                </Footer>


            </Modal>
        )
    }
}
/**
 * props:
 * totalScoreLevel: 分档数据;
 * 
 *
 */
class GroupAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false
        }
    }
    onShowDialog() {
        this.setState({
            showDialog: true
        })
    }
    onHideDialog() {
        this.setState({
            showDialog: false
        })
    }
    render() {
        var {totalScoreLevel} = this.props;
        return (
            <div className={styles['school-report-layout']}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    临界生群体分析
                </div>
                <div className={styles['school-report-content']}>
                    <p>
                        将临近总分各分数线上下的群体视为“临界生”，学校可以给他们多一点关注，找到他们的薄弱点、有针对性促进一下，他们就坑稳定、甚至提升总分档次。
                        这个无论是对学生个人，还是对学校整体的教学成就，都有显著的积极作用。全校临界生群体规模，见下表：
                    </p>
                    <a href="javascript:void(0)" onClick={this.onShowDialog.bind(this) }className={styles.button} style={{ width: 130, height: 30, position: 'absolute', right: 0, color: '#b686c9' }}>
                        设置临界分数
                    </a>

                    <Table tableData={tableData}/>
                    <a href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>
                    <div className={styles.tips}>
                        <p>说明：</p>
                        <p>此处文字待添加。</p>
                    </div>
                </div>
                <Dialog totalScoreLevel={totalScoreLevel} show={this.state.showDialog} onHide={this.onHideDialog.bind(this)}/>
            </div>
        )
    }


}

export default GroupAnalysis;