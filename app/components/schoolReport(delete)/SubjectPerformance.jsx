import React from 'react';
import styles from '../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import Table from '../../common/Table';
import { Modal } from 'react-bootstrap';

var {Header, Title, Body, Footer} = Modal;

var localStyle = {
    btn: {lineHeight: '50px', width: 150, height: 50,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',margin: '0 30px'}
}

let td_subjectTotal = {
    ths: [
        '学科', '平均分', '优秀率', '及格率', '满分', '最高分', '最低分', '实考人数', '缺考人数'
    ],
    tds: [
        ['语文', 70.5, '0%', '43%', 120, 110, 3, 300, 2],
        ['数学', 56.3, '10%', '43%', 120, 110, 3, 300, 2],
        ['英语', 43, '20%', '43%', 120, 110, 3, 300, 2],
        ['物理', 89, '30%', '43%', 120, 110, 3, 300, 2],
        ['化学', 85, '40%', '43%', 120, 110, 3, 300, 2]

    ]
}

let td_subjectClassDistribution = {
    ths: [
        '学科成绩分类', 'A', 'B', 'C', 'D'
    ],
    tds: [
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%'],
        ['语文', '10%', '17%', '60%', '5%']
    ]
}


/**
 * props:
 * show: 是否显示;
 * onHide： 隐藏对话框的回调函数;
 * 
 */
class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grades: [85, 75, 60, 0]
        }
    }
    okClickHandler() {
        this.props.onHide();
    }
    handleMouseEnter(event) {
        $(event.target).find('#deleteIcon').removeClass('hide');
    }

    handleMouseLeave(event) {
        $(event.target).find('#deleteIcon').addClass('hide');
    }
    onAddGrade() {
        var newGrades = this.state.grades;
        newGrades.push(0);
        this.setState({
            grades: newGrades
        })
    }
    onDeleteGrade(index) {
        var newGrades = this.state.grades;
        newGrades.splice(index, 1);
        this.setState({
            grades: newGrades
        }) 
    }
    okClickHandler() {
        console.log('============ grades list:' + JSON.stringify(this.state.grades));
        this.props.onHide();
    }
    onInputBlur(index) {
        var value = this.refs['grade-'+ index].value;
        if (!parseFloat(value)) return;
        if (this.state.grades[index] !== value){
            var newGrades = this.state.grades;
            newGrades[index] = value;
            this.setState({
                grades: newGrades
            })
        }
    }
    render() {
        var charCode_A = 65;
        var _this = this;
        console.log('===== state:' + JSON.stringify(this.state));
        return (
            <Modal show={ this.props.show } ref="dialog"  onHide={this.props.onHide.bind(this, {}) }>
                <Header closeButton style={{ textAlign: 'center' }}>
                    设置等级分数
                </Header>
                <Body className="apply-content">
                    <div style={{ minHeight: 230 }}>
                        <div style={{ borderBottom: '1px solid #f2f2f2' }}>
                            {
                                this.state.grades.map((grade, index) => {
                                    var charGrade = String.fromCharCode(charCode_A + index);
                                    if (index === this.state.grades.length - 1 && index !== 0) {
                                        return (
                                            <div style={{ margin: '10px 0' }}onMouseEnter={this.handleMouseEnter}  onMouseLeave={this.handleMouseLeave}  key={index.toString() + grade}>
                                                <span style={{ marginRight: 20 }}>{charGrade}等：</span>
                                                <span style={{ marginRight: 20 }}>表示小于总分×{ this.state.grades[index-1] }%的分数的学生为{charGrade}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)} href='javascript:void(0)'style={{textDecoration:'none'}}id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    } else if (index === 0) {
                                        return (
                                            <div style={{ margin: '10px 0' }}onMouseEnter={this.handleMouseEnter}  onMouseLeave={this.handleMouseLeave}  key={index.toString() + grade}>
                                                <span style={{ marginRight: 20 }}>{charGrade}等：<input ref={'grade-' + index}defaultValue={grade} onBlur={_this.onInputBlur.bind(_this, index)}/>%</span>
                                                <span style={{ marginRight: 20 }}>表示总分×{ grade }%的分数以上的学生为{charGrade}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)}  href='javascript:void(0)'style={{textDecoration:'none'}}id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    } else {
                                        return (
                                            <div style={{ margin: '10px 0' }}onMouseEnter={this.handleMouseEnter}  onMouseLeave={this.handleMouseLeave}  key={index.toString() + grade}>
                                                <span style={{ marginRight: 20 }}>{charGrade}等：<input ref={'grade-' + index}defaultValue={grade} onBlur={_this.onInputBlur.bind(_this, index)}/>%</span>
                                                <span style={{ marginRight: 20 }}>表示总分×{ grade }%到{String.fromCharCode(charCode_A + index -1)}等分数的学生为{charGrade}等</span>
                                                <a onClick={_this.onDeleteGrade.bind(_this, index)}  href='javascript:void(0)'style={{textDecoration:'none'}}id='deleteIcon' className='hide'>x</a>
                                            </div>
                                        )
                                    }

                                })
                            }
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <a href='javascript:void(0)' onClick={this.onAddGrade.bind(this)}className={styles.button} style={{ textDecoration: 'none',width: 140, height: 30, border: '1px solid #bcbcbc', lineHeight: '30px', marginRight: 20 }}>
                                添加等级
                            </a>
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

            </Modal >
        )
    }
}

class SubjectPerformance extends React.Component {
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
        return (
            <div className={styles['school-report-layout']}>
                <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
                <div style={{ position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                    学科考试表现
                </div>
                <div className={styles['school-report-content']}>
                    <p>（1）学科成绩整体情况如下：</p>
                    <Table tableData={td_subjectTotal} />
                    <p>
                        （2）从各学科的成绩表现看，每个学科的班级平均得分率最高的与最低之间的离差，从大到小的顺序是 数学、化学、英语。如果联系到学科的命题难度，其相对离差从大到小的顺序是 生物，物理，语文。
                        离差较大的学科，反映出班级水平差距较大。利差较小的学科，反映出该学科教学效果比较整齐。（注: 语文是母语，学生水平离差较小应是常态。）
                    </p>
                    <p>各个学科成绩分布的结构比例情况，如下表所示：</p>
                    <a href="javascript:void(0)"  onClick={this.onShowDialog.bind(this)} className={styles.button} style={{ width: 130, height: 30, position: 'absolute', right: 0, color: '#b686c9' }}>
                        设置等级参数
                    </a>
                    <Table tableData={td_subjectClassDistribution} />

                    <p>（4）有关学科命题</p>
                    <p>
                        作为学科考试，必须考虑给水平不同的全体学生都能提供展示其学业水平的机会。在这一点上，有数据分析表明，在个学科中，似乎有 语文数学 学科，表现更为突出；
                        <br/>
                        在学科试卷整体难度的把握上，似乎 化学生物有点过易。有的学科在试题难度分布结构方面，进一步完善。如英语物理学科，似乎存在有国难实体份量偏大问题。
                    </p>
                    <p>有的学科，试卷中有个别实体可进一步斟酌，如学科英语、语文试卷的0.2一下主观题，可商榷</p>
                    <p>注：各个学科更精细的分析报告，另行分学科列示。</p>
                </div>
               <Dialog show={this.state.showDialog} onHide={this.onHideDialog.bind(this)}/>
            </div>
        )
    }

}

export default SubjectPerformance;