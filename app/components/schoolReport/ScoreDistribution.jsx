import React from 'react';
import style from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
//import Dialog from '../../common/Dialog';//todo: deletable
import { Modal } from 'react-bootstrap';
import {showDialog, hideDialog} from '../../reducers/global-app/actions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import DropdownList from '../../common/DropdownList';

var {Header, Title, Body, Footer} = Modal;

let localStyle = {
    dialogInput: {width: 150,height: 50},
    btn: {lineHeight: '50px', width: 150, height: 50,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',margin: '0 30px'}
}
let tableData_example = {
    tds: [
        ['全部', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['一班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['二班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%'],
        ['三班', 100, 120, '15%', 360, 460, '15%', 360, 120, '15%']
    ]
}
var tableData = {
    '全校': [
        {
            score: 520,
            rate: 15,
            num: 100
        },
        {
            score: 480,
            rate: 35,
            num: 360
        },
        {
            score: 360,
            rate: 50,
            num: 890
        }
    ],
    '1班': [
        {
            score: 520,
            rate: 5,
            num: 100
        },
        {
            score: 480,
            rate: 55,
            num: 360
        },
        {
            score: 360,
            rate: 40,
            num: 890
        }
    ],
    '2班': [
        {
            score: 520,
            rate: 11,
            num: 100
        },
        {
            score: 480,
            rate: 22,
            num: 360
        },
        {
            score: 360,
            rate: 67,
            num: 890
        }
    ],
    '3班': [
         {
            score: 520,
            rate: 89,
            num: 100
        },
        {
            score: 480,
            rate: 1,
            num: 360
        },
        {
            score: 360,
            rate: 10,
            num: 890
        }
    ]
    
}

const Table = ({tableData}) => {
    var levelNum = tableData[Object.keys(tableData)[0]].length;
    var widthProp = {};
    if (levelNum > 3) {
        widthProp = {
            minWidth: 1000
        }
    }else {
        widthProp = {
            width: '100%'
        }
    }
   
    //转换格式成tableData_example的模样
    var tableRows = [];
    _.forEach(tableData, (levelInfos, className) => {
        var row = [];
        row.push(className);
        var accumulateNum = 0;
        var accumulateRate = 0;
        _.forEach(levelInfos, levelInfo => {
            row.push(levelInfo.num);
            accumulateNum += levelInfo.num;
            accumulateRate += levelInfo.rate;
            row = row.concat([accumulateNum, accumulateRate]);
        })
        tableRows.push(row);
    })
    return (
        <table  style={Object.assign({},{ border: '1px solid #d7d7d7', borderCollapse: 'collapse', overflow: 'scroll'}, widthProp)}>
            <tbody>
                <tr style={{ backgroundColor: '#f4faee' }}>
                    <th rowSpan="2" className={style['table-unit']}>班级</th>
                    {
                        _.range(levelNum).map((num,index) =>{
                            return (
                                <th key={index} colSpan="3" className={style['table-unit']} style={{minWidth: 180}}>
                                     {numberMapper[(index + 1).toString()]}档
                                </th>
                            )
                        })
                    }
                </tr>
                <tr style={{ backgroundColor: '#f4faee' }}>
                    {
                        _.range(levelNum).map(() =>{
                            return  _.range(3).map(num =>  {
                                switch(num ) {
                                    case 0:
                                        return <th key={num} className={style['table-unit']}>人数</th>
                                    case 1: 
                                        return  <th key={num} className={style['table-unit']}>累计人数</th>
                                    case 2:
                                        return <th key={num} className={style['table-unit']}>累计占比</th>    
                                }
                            })
                        })
                    }
                </tr>
                {
                    tableRows.map((row,index) => {
                        return (
                            <tr key={index}>
                            {
                                row.map((td, index) =>{
                                    return (
                                        <td key={index} className={style['table-unit']}>{td}</td>
                                    )
                                })
                            }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

let basicInfos = {
    fullScore: 750,
    maxScore: 680
}

let numberMapper = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十'

}
/**
 * props: 
 * show: 是否打开的状态
 * onHide: 关闭时调用的父组件方法
 * fullScore: 考试总分
 * highscore: 考试最高分
 * changeLevels: 修改状态树的actionCreator
 * 
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            levelNum: this.props.totalScoreLevel.length
        }
    }
    onChange(ref, event) {
        this.refs[ref].value = event.target.value;
    }
    adjustGrades() {
        var value = this.refs.levelInput.value;
        if (!value) {
            return;
        }
        this.setState({ levelNum: value });
    } 
    okClickHandler() {
        var levelNum = this.refs.levelInput.value;
        var levelScores = [];
        for (var i = 0; i < levelNum; i++) {
            var level = {};
            level.score = parseFloat(this.refs[('score-' + i)].value);
            level.rate = parseFloat(this.refs[('rate-'+ i)].value);
            level.num = parseInt(Math.random() * 110);
            levelScores.push(level);
        }
        this.props.changeLevels(levelScores);
        this.props.onHide();
    }
    onInputBlur(id, event) {
        var value = event.target.value;
        if (!value || value < 0) return;
        var arr = id.split('-');
        var type = arr[0];
        var num = arr[1];
        switch (type) {
            case 'score':
                //$('#rate-' + num).val(parseInt(Math.random() * 100));
                this.refs['rate-' + num].value = parseInt(Math.random() * 100);
                break;
            case 'rate':
                //$('#score-' + num).val( parseInt(Math.random() * 1000));
                this.refs['score' + num].value = parseInt(Math.random() * 1000); 
                break;
        }
    }
    render() {
        var {totalScoreLevel} = this.props; 
        var _this = this;
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide.bind(this,{})}>
                <Header closeButton style={{textAlign: 'center'}}>
                    分档参数设置
                </Header>
                <Body className="apply-content">
                <div style={{ minHeight: 230 }}>
                <span style={{ float: 'right' }}>总分： {_this.props.fullScore}  最高分: {_this.props.highScore}</span>
                <div style={{ clear: 'both' }}>
                    <div>
                        整体分档为：<input  ref='levelInput' onBlur={this.adjustGrades.bind(this) } style={{ width: 150, height: 30 }} defaultValue={_this.state.levelNum}onChange={_this.onChange.bind(_this, 'levelInput') }/>
                    </div>
                    <div>
                        {
                            _.range(this.state.levelNum).map(num => {
                                return (
                                    <div key={num}>
                                        <div style={{ display: 'inline-block' }}>{numberMapper[(num + 1).toString()]}档：
                                            <input id={'score-' + num} ref={'score-' + num} defaultValue={totalScoreLevel[num] && totalScoreLevel[num].score ? totalScoreLevel[num].score: ''} onBlur={_this.onInputBlur.bind(_this, 'score-' + num) } onChange={_this.onChange.bind(_this, 'score-' + num) } style={localStyle.dialogInput}/>
                                        </div>
                                        <div style={{ display: 'inline-block' }}>上线率：
                                            <input id={'rate-' + num} ref={'rate-' + num} defaultValue={totalScoreLevel[num] && totalScoreLevel[num].rate ? totalScoreLevel[num].rate : ''} onBlur={_this.onInputBlur.bind(_this, 'rate-' + num) } onChange={_this.onChange.bind(_this, 'rate-' + num) } style={localStyle.dialogInput}/>
                                            %
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
                </Body>
                    <Footer className="text-center" style={{textAlign: 'center',borderTop: 0}}>
                        <a href="javascript:void(0)" style={localStyle.btn} onClick={_this.okClickHandler.bind(_this)}>
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
 * totalScoreLevel: 对象数组, 包含默认的全校分档信息(分数线、上线率、人数)
 * classLevelInfo: 全校各班级的分档数据, 假数据用tableData替代
 */
class ScoreDistribution extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            currentClass: Object.keys(tableData)[0]
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
    onClickDropdownList(className) {
        this.setState({
            currentClass: className
        })
    }
    render() {
        var {changeLevels, totalScoreLevel} = this.props;
        console.log('================== totalScoreLevel:'+ JSON.stringify(totalScoreLevel)); 
        var pieChartData = tableData[this.state.currentClass].map((levelInfo, index)=> {
            var obj = {};
            obj.name = numberMapper[(index+1).toString()] + '档';
            obj.y = levelInfo.rate;
            return obj;
        })      
        let config = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (ReactHighcharts.theme && ReactHighcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: '档位',
                colorByPoint: true,
                data: pieChartData   //动态数据
            }],
            credits: {
                enabled: false
            }

        };
        var _this = this;
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    总分分档上线学生人数分布
                </div>
                <span onClick={_this.onShowDialog.bind(_this)} style={{ cursor: 'pointer', color: '#b686c9', float: 'right', margin: '30px 5px 30px 0', display: 'inline-block', width: 130, height: 30 }}>?设置分档参数</span>
                <div style={{ width: 720, margin: '0 auto', clear: 'both' }}>
                    <p style={{ marginBottom: 20 }}>
                        将总分划为<span className={style['school-report-dynamic']}>{totalScoreLevel.length}</span>条分数线（
                        {
                            totalScoreLevel.map((levelInfo, index) => {
                                return (
                                    <span key={index}>
                                        {numberMapper[(index + 1).toString()]} 档分数线为 
                                        <span className={style['school-report-dynamic']}>{levelInfo.score}</span>
                                        分{index === totalScoreLevel.length -1 ? '' : '，'}
                                    </span>
                                )
                                
                            })
                        }），
                        全校
                        {
                            totalScoreLevel.map((levelInfo, index) => {
                                return (
                                    numberMapper[(index+1).toString()] + (index !== totalScoreLevel.size -1 ? '、': '')
                                )
                            })   
                        }档上线人数分别为： 
                        <span className={style['school-report-dynamic']}>
                        {
                            totalScoreLevel.map((levelInfo, index) => {
                                return (
                                    levelInfo.num + '人' + (index !== totalScoreLevel.length -1 ? '、': '')
                                )
                            })
                        }
                        </span>
                        ，上线率分别为：
                        <span className={style['school-report-dynamic']}>
                        {
                             totalScoreLevel.map((levelInfo, index) => {
                                return (
                                    levelInfo.rate + '%' + (index !== totalScoreLevel.length -1 ? '、': '')
                                )
                            })
                        }
                        </span>。
                    </p>
                    <p style={{ marginBottom: 20 }}>各班的上线情况见下表：</p>
                    <div style={{width: '100%', overflow: 'scroll'}}>
                        <Table tableData={tableData}/>
                    </div>
                    <a  href="javascript: void(0)" style={{ color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }}>
                        点击查看更多班级数据 V
                    </a>
                    <span style={{ position: 'absolute', right: 0, marginTop: 40 }}><DropdownList onClickDropdownList={_this.onClickDropdownList.bind(_this)} list={Object.keys(tableData)}/></span>
                    <div style={{ marginTop: 30 }}>
                        <div style={{ display: 'inline-block', width: 330, backgroundColor: '#e9f7f0', paddingRight: 30,fontSize: 14 }}>
                            <p>表中显示了全校及各班各档上线人数。上线人数的多少一目了然。考虑到各班级学生总人数会存在有差异，要用上线率来比较：</p>
                            {
                                _.range(totalScoreLevel.length).map(num => {
                                    var level = numberMapper[(num+1).toString()];
                                    return(
                                        <p key={num}>
                                            {level}档线
                                            <span style={{color:'#a384ce'}}>上线率高</span>的班级有
                                            <span className={style['school-report-dynamic']}>初一1班、初一2班；</span>
                                            {level}档线
                                            <span style={{color:'#a48382'}}>上线率低</span>的班级有
                                            <span className={style['school-report-dynamic']}>初一5班、初一7班；</span>
                                        </p>    
                                    )
                                    
                                })
                            }
                        </div>
                        <ReactHighcharts config={config} style={{ display: 'inline-block', width: 360, height: 250, float: 'right' }}></ReactHighcharts>
                    </div>
                </div>
                <Dialog changeLevels={changeLevels} totalScoreLevel={totalScoreLevel} show={_this.state.showDialog} onHide={_this.onHideDialog.bind(_this)} fullScore={750} highScore={680}/>
            </div>
        )
    }

}

export default ScoreDistribution;