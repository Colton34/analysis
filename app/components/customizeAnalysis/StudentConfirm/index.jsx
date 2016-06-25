import React from 'react';
import ownClassNames from './studentConfirm.css';
import _ from 'lodash';
import Header from '../Header'
import Footer from '../Footer';
import matrixBase from '../../../lib/matrixBase';
import InfoDialog from '../../../common/InfoDialog';

var FileUpload = require('../../../common/FileUpload');

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
            groupMap: _.isEmpty(groupMap) ? this.getGroupMap(this.props.currentSubject) : groupMap,
            showDialog: false
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            groupMap: this.getGroupMap(nextProps.currentSubject)
        })
    }
    getGroupMap(currentSubject) {
        //var {examInfos} = this.props.currentSubject;
        //fixme: 获取examinfos的方法
        var studentInfos = currentSubject.SQM.y;
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
            this.setState({
                showDialog: true,
                dialogMsg: '要分析的学生数量不能为0, 请再次确认学生.'
            })
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
    exportExamStudent() {
        var students = _.concat(..._.map(_.filter(this.state.groupMap, (item, className) => item.status === 'inUse'), (obj) => obj.array));

        var url = '/api/v1/file/export/exam/student';
        // for(var key in data){
        //     var value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
        //     inputs += "<input type='hidden' name='" + key + "' value='" + value + "' />";
        // }
        // request发送请求
        var input = "<input type='hidden' name='" + 'students' + "' value='" + JSON.stringify(students) + "' />";
        $('<form action="' + url + '" method="' + ('post') + '">' + input + '</form>')
            .appendTo('body').submit().remove();

        // window.request.post('/file/export/exam/student', {students: students}).then(function(res) {

        // }).catch(function(err) {
        //     console.log('导出学生错误：', err);
        // })
    }

    onHideDialog() {
        this.setState({
            showDialog: false,
            dialogMsg: ''
        })
    }

    render() {
        var {groupMap} = this.state;
        var _this = this;
        var options = {
            baseUrl : '/api/v1/file/import/exam/student',
            chooseAndUpload : true,
            fileFieldName : 'importStudent', //指定上传文件的名字，而不是使用默认的呃file.name，这个名字和multer的single对应。
            chooseFile : function(files){
                console.log('filename',typeof files == 'string' ? files : files[0].name);
            },
            uploading : function(progress){
                console.log('loading...',progress.loaded/progress.total+'%');
            },
            uploadSuccess : function(resp){
                /*通过mill找到对应的文件，删除对应tmpFile*/
                var result = resp;
                var xuehaoArray = _.map(result, function (item) {
                    return item['kaohao'];
                });
                var currentSQM = _this.props.currentSubject.SQM;
                currentSQM = matrixBase.getByNames(currentSQM, 'row', 'kaohao', xuehaoArray);

                //不允许上传学生之后, 与平台上的交集为0
                if (currentSQM && currentSQM.y && currentSQM.y.length > 0) {
                    //todo： 设置currentSubject SQM
                    _this.props.setCurSubjectSqm(currentSQM);
                } else {
                    _this.setState({
                        showDialog: true,
                        dialogMsg: '上传的学生与系统中的学生交集为空, 请重新上传'
                    })
                }
                console.log('upload success',resp);
            },
            uploadError : function(err){
                 _this.setState({
                        showDialog: true,
                        dialogMsg: err
                 })
                console.log('Error: ', err);
            },
            uploadFail : function(resp){
                _this.setState({
                        showDialog: true,
                        dialogMsg: resp
                 })
                console.log('Fail: ', resp);
            }
        };
        return (
            <div>
                <div className={ownClassNames['container']}>
                    <span className={ownClassNames['tip']}>说明：若要修改部分班级中的学生，则点击右侧导出考生数据，修改后再上传即可</span>
                    <div className={ownClassNames['content-header']}>
                        <span style={{ fontWeight: 600, marginRight: 5 }}>考生列表</span>
                        <span>您已选择
                            <span className={ownClassNames['stats']}>{_.keys(this.props.currentSubject.src).length}</span>
                            个学科, 共
                            <span className={ownClassNames['stats']}>{_this.props.currentSubject.SQM.x.length}</span>
                            题, 满分
                            <span className={ownClassNames['stats']}>{this.getFullScore()}</span>
                            分, 当前人数
                            <span className={ownClassNames['stats']}>{this.getStudentNum()}</span>
                            人
                        </span>
                        <FileUpload options={options} style={{display: 'inline-block', float: 'right'}}>
                            <button ref="chooseAndUpload" className={ownClassNames['upload-btn']}>上传考生数据</button>
                        </FileUpload>
                        <button style={{display: 'inline-block'}}onClick={this.exportExamStudent.bind(this, this.props.currentSubject)} className={ownClassNames['export-btn']}>导出考生数据</button>
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
                                _.orderBy(_.keys(groupMap)).map((groupName, index) => {
                                    if (groupMap[groupName].status === 'inUse') {
                                        return (
                                            <tr key={'class-'+ index} className={ownClassNames['table-row']}>
                                                <td className={ownClassNames['table-item']}>{groupMap[groupName].name}</td>
                                                <td className={ownClassNames['table-item']}>{groupMap[groupName].count}</td>
                                                <td className={ownClassNames['table-item']}>
                                                    <span onClick={this.onDelGroup.bind(this,groupName)} style={{color:'#6C737A', cursor:'pointer'}}data-name="<%=item.name%>"><i className="icon-delete"></i>删除</span>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return (
                                        <tr key={'class-'+ index} style={{color:'#b1b1b1'}} className={ownClassNames['table-row']}>
                                            <td className={ownClassNames['table-item']}>{groupMap[groupName].name}</td>
                                            <td className={ownClassNames['table-item']}>{groupMap[groupName].count}</td>
                                            <td className={ownClassNames['table-item']}>
                                                <span onClick={this.onRecoverGroup.bind(this,groupName)} style={{cursor:'pointer'}}data-name="<%=item.name%>"><i className="icon-ccw-1"></i>恢复</span>
                                            </td>
                                        </tr>
                                    )

                                })
                            }

                        </tbody>
                    </table>
                </div>
                <InfoDialog content={this.state.dialogMsg} show={this.state.showDialog} onHide={this.onHideDialog.bind(this)}/>
            </div>
            <Footer pageIndex={this.props.pageIndex} onPrevPage={this.props.onPrevPage} onNextPage={this.onNextPage.bind(this)}/>
        </div>
    )
    }

}

export default StudentConfirm;
