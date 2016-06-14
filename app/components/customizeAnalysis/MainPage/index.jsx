/***
 * todos:
 * 点击删除某个学科时，弹框让用户确认；
 */


import React from 'react';
import ownClassNames from './mainPage.css';
import _ from 'lodash';

/**
 * props:
 * analysisName: 自定义分析名称
 * resultSet: 已录入的学科信息；
 * onEditSubject: 点击学科列表中的“编辑”时调用的回调函数
 * onDelSubject: 点击“删除”时调用的回调函数；
 * onGenerateAnalysis
 */
class MainPage extends React.Component {

    constructor(props) {
        super(props);
    }
    onFenxiNameInputBlur(event) {
        var value = event.target.value;
        if (value === this.props.analysisName) return ;
        this.props.setAnalysisName(event.target.value);
    }
    onEditSubject(subjectName) {

        this.props.onEditSubject(subjectName);
    }
    onDelSubject(subjectName) {

        this.props.onDelSubject(subjectName);
    }
    render() {
        var { resultSet, analysisName} = this.props;

        var subjectList = Object.keys(resultSet);
        return (
            <div>
                <div style={{ padding: '20px 30px' }}>
                    <span className={ownClassNames["content-tips"]}>
                        创建自定义分析，可以满足学校个性化数据的分析， 根据学校自己的情况，选择相关的考试科目、题、以及学校，自由组合进行相关分析。完成以下的步骤，就可以查看分析结果啦，快去试试吧！同时你可以
                        <a href='javascript:void(0)'style={{ color: '#54bde7' }}>查看示例</a>
                    </span>
                    <div style={{ margin: '20px 0' }}>
                        <label className={ownClassNames.label}>分析名称</label>
                        <input ref='fenxiName' className={ownClassNames['fx-input']} style={{ width: 360, height: 40 }} type="text" placeholder="填写你想创建本次分析的名称，如：xxx考试分析" defaultValue={analysisName} onBlur={this.onFenxiNameInputBlur.bind(this)}/>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <label className={ownClassNames.label}>学科列表</label>
                        <span onClick={this.props.changeToCreateStatus} className={ownClassNames['fx-btn2'] + ' ' + ownClassNames['fx-btn2-primary']}>+添加期望分析学科</span>
                    </div>
                    {
                        subjectList.length === 0 ?
                            (
                                <div className={ownClassNames['ca-tips']}></div>
                            ) :
                            (
                                <div style={{ marginLeft: 70 }}>
                                    <table style={{ border: '1px solid #ddd', width: '100%', maxWidth: '100%', marginBottom: 20 }} className={'table table-bordered'}>
                                        <thead>
                                            <tr>
                                                <td class="text-left col-md-3">学科名称</td>
                                                <td class="text-left col-md-6">学科详情</td>
                                                <td class="text-left col-md-3">操作</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                subjectList.map((subject, index) => {

                                                    return (
                                                        <tr key={'subject-' + index}>
                                                            <td>{subject}</td>
                                                            <td>
                                                                您已选择{resultSet[subject].SQM.x.length}道题,
                                                                满分{resultSet[subject].SQM.x ? resultSet[subject].SQM.x.reduce((sum, each) =>{return sum += each.score},0): 0},
                                                                学生{resultSet[subject].SQM.y ? _.reduce(resultSet[subject].groupMap, (sum, each) => {return sum + (each.status === 'inUse' ? each.count : 0)}, 0) : 0}人
                                                            </td>
                                                            <td>
                                                                <a onClick={this.onEditSubject.bind(this, subject)} href='javascript:void(0)'className={ownClassNames['edit-btn']}><i class="icon-edit-2"></i>编辑</a>
                                                                <a onClick={this.onDelSubject.bind(this, subject)} href='javascript:void(0)'className={ownClassNames['edit-btn']}><i class="icon-delete"></i>删除</a>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                    <button onClick={this.props.onGenerateAnalysis} href='javascript:void(0)' className={ownClassNames['fx-btn'] + ' ' + ownClassNames['fx-btn-primary']}>生成报表</button>
                                    <button onClick={this.props.onDeleteAnalysis} href='javascript:void(0)' className={ownClassNames['fx-btn'] + ' ' + ownClassNames['fx-btn-primary']}>删除报表</button>
                                </div>
                            )
                    }
                </div>
            </div>
        )
    }

}
/*<div className={ownClassNames.header}>
                    <span className={ownClassNames['header-back']} >返回</span>
                    <span className={ownClassNames['header-title']}>自定义分析</span>
                </div>*/
export default MainPage;
