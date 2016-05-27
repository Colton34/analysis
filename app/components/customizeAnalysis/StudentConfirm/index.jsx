import React from 'react';
import ownClassNames from './studentConfirm.css';
import _ from 'lodash';
import Header from '../Header'
import Footer from '../Footer';


var examInfos = {
    questionInfos: [{ "name": "第1题", "score": 3 }, { "name": "第2题", "score": 3 }, { "name": "第3题", "score": 3 }, { "name": "第4题", "score": 3 }, { "name": "第5题", "score": 3 }],
    studentInfos: [{ "name": "潘琳洁", "kaohao": "130615", "class": "6", "id": 3155561, "score": 118 }, { "name": "陈子彦", "kaohao": "132210", "class": "22", "id": 3156491, "score": 114 }, { "name": "徐伶依", "kaohao": "132252", "class": "22", "id": 3156520, "score": 113 }, { "name": "肖雨儿", "kaohao": "130813", "class": "8", "id": 3155678, "score": 113 }, { "name": "陈远", "kaohao": "132238", "class": "22", "id": 3156513, "score": 113 }, { "name": "祝睿", "kaohao": "130642", "class": "6", "id": 3155577, "score": 112 }, { "name": "徐凯鸿", "kaohao": "130643", "class": "6", "id": 3155578, "score": 112 }, { "name": "黄梦琦", "kaohao": "130644", "class": "6", "id": 3155579, "score": 112 }, { "name": "严博瀚", "kaohao": "132268", "class": "22", "id": 3156532, "score": 112 }]
}
//合并之后只有一个SQM， 其中的studentInfos即是这场考试整合
/**
 * props:
 * pageIndex:当前页码
 * onPrevPage: 跳到前一页的回调函数
 * onNextPage: 下一页回调函数;
 * currentSubject: 当前的考试科目；
 */
class StudentConfirm extends React.Component {
    constructor(props) {
        super(props);
        var {groupMap} = this.props.currentSubject;
        this.state = {
            groupMap: _.isEmpty(groupMap) ? this.getGroupMap() : groupMap 
        }
    }
    getGroupMap() {
        //var {examInfos} = this.props.currentSubject;
        //fixme: 获取examinfos的方法
        var studentInfos = this.props.currentSubject.SQM.y;
        var groupMap = {};
        var isLiankao = studentInfos[0].school ? true : false;
        _.forEach(studentInfos, (student) => {
            var className = isLiankao ? student.school : student.class;
            if (!groupMap[className]) {
                groupMap[className] = {
                    name: className,
                    count: 0,
                    array: [],
                    status: 'inUse'
                }
            }
            groupMap[className].count += 1;
            groupMap[className].array.push(student);
        })
        return groupMap;

    }
    onNextPage() {
        // 检查学生信息：
        if (this.getStudentNum() === 0) {
            alert('要分析的学生数量不能为0, 请再次确认学生.');
            return;
        }
        // 保存当前的groupMap信息
        this.props.onChangeGroupMap(this.state.groupMap);
        
        this.props.onNextPage();
    }
    onDelGroup(groupName) {
        var {groupMap} = this.state;
        groupMap[groupName].status = '';
        this.setState({
            groupMap : groupMap
        })
    }
    onRecoverGroup(groupName) {
        var {groupMap} = this.state;
        groupMap[groupName].status = 'inUse';
        this.setState({
            groupMap : groupMap
        })
    }
    getFullScore(){
        var questionInfos = this.props.currentSubject.SQM.x;
        return questionInfos ? questionInfos.reduce((sum, each) =>{return sum += each.score},0): 0;
    }
    getStudentNum() {
        return _.reduce(this.state.groupMap, function(sum, each){ return sum + (each.status === 'inUse' ? each.count : 0)}, 0);
    }
    render() {
        var {groupMap} = this.state;
        var _this = this;
        return (
            <div>
                <div className={ownClassNames['container']}>
                    <span className={ownClassNames['tip']}>说明：若要修改部分班级中的学生，则点击右侧导出考生数据，修改后再上传即可</span>
                    <div className={ownClassNames['content-header']}>
                        <span style={{ fontWeight: 600, marginRight: 5 }}>考生列表</span>
                        <span>您已选择
                            <span className={ownClassNames['stats']}>3</span>
                            个学科, 共
                            <span className={ownClassNames['stats']}>{_this.props.currentSubject.SQM.x.length}</span>
                            题, 满分
                            <span className={ownClassNames['stats']}>{this.getFullScore()}</span>
                            分, 当前人数
                            <span className={ownClassNames['stats']}>{this.getStudentNum()}</span>
                            人
                        </span>
                        <div className={ownClassNames['upload-btn']}>
                            <span>上传考生数据</span>
                            <input type="file" name="studentList" id="btn-upload-student-excel" className={ownClassNames['upload-input']}/>
                        </div>
                        <button className={ownClassNames['export-btn']}>导出考生数据</button>
                    </div>

                    <div class="clearfix">
                        <table className="table" style={{ border: '1px solid #ddd' }}>
                            <thead>
                                <tr>
                                    <td className={"col-md-4 " + ownClassNames['table-item']}>班级</td>
                                    <td className={"col-md-4 " + ownClassNames['table-item']}>人数</td>
                                    <td className={"col-md-4 " + ownClassNames['table-item']}>操作</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.keys(groupMap).map((groupName, index) => {
                                    if (groupMap[groupName].status === 'inUse') {
                                        return (
                                            <tr key={'class-'+ index} className={ownClassNames['table-row']}>
                                                <td className={ownClassNames['table-item']}>{groupMap[groupName].name}</td>
                                                <td className={ownClassNames['table-item']}>{groupMap[groupName].count}</td>
                                                <td className={ownClassNames['table-item']}>
                                                    <span onClick={this.onDelGroup.bind(this,groupName)} style={{color:'#6C737A', cursor:'pointer'}}data-name="<%=item.name%>"><i class="icon-delete"></i>删除</span>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return (
                                        <tr key={'class-'+ index} style={{color:'#b1b1b1'}} className={ownClassNames['table-row']}>
                                            <td className={ownClassNames['table-item']}>{groupMap[groupName].name}</td>
                                            <td className={ownClassNames['table-item']}>{groupMap[groupName].count}</td>
                                            <td className={ownClassNames['table-item']}>
                                                <span onClick={this.onRecoverGroup.bind(this,groupName)} style={{cursor:'pointer'}}data-name="<%=item.name%>"><i class="icon-ccw-1"></i>恢复</span>
                                            </td>
                                        </tr>
                                    )

                                })
                            }

                        </tbody>
                    </table>
                </div>
            </div>
            <Footer pageIndex={this.props.pageIndex} onPrevPage={this.props.onPrevPage} onNextPage={this.onNextPage.bind(this)}/>
        </div>
    )    
    }
    
}

export default StudentConfirm;