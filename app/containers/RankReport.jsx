import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link, browserHistory} from 'react-router';

import _ from 'lodash';
import {Map, List} from 'immutable';

import {initRankReportAction} from '../reducers/rankReport/actions';
import {initParams} from '../lib/util';
import {DropdownButton, Button, Table as BootTable, Pagination, MenuItem} from 'react-bootstrap';
import commonStyle from '../common/common.css';
import Spinkit from '../common/Spinkit';

import {tableExport} from '../lib/tableExporter';

var headerMapper = {
    kaohao: '考号', name: '姓名', class: '班级', totalScore: '总分', groupRank: '排名', classRank: '班级排名', score: '分数'
}

/***
 * props：
 * firstLineHead: ['kaohao', 'ts', '123456'...]
 * seciondLineHead: ['totalScore_ts', 'gradeRank_ts', 'classRank_ts' ...]
 * renderRows:
 * onSort: 排序的函数
 */
const Table = ({renderRows, firstLineHead, secondLineHead, headSeq, headSelect, onSort, sortInfo, downloadTable}) => {
    //todo: 处理一遍renderHead, 找出各个两行表头的列数，方便遍历；
    var counter = {};
    var secondLineHeadMap = {};
    _.forEach(secondLineHead, head => {
        var headType = head.split('_')[1];
        if (!counter[headType]) {
            counter[headType] = 1;
        } else {
            counter[headType] += 1;
        }
        secondLineHeadMap[head] = true;
    })
    // <table style={{ border: '1px solid #d7d7d7', borderCollapse: 'collapse', overflow: 'scroll', width: '100%'}}>
    return (
        <div>
         <BootTable id="rankTable" striped bordered condensed hover responsive style={{overflowX: 'scroll'}}>
            <thead>
                <tr style={{ backgroundColor: '#f4faee' }}>
                    {
                        firstLineHead.map((headType, index) => {
                            if (_.indexOf(['kaohao', 'name', 'class'], headType) !== -1) {
                                return (<th key={headType} rowSpan='2' className={commonStyle['table-unit']} style={{verticalAlign:'middle', minWidth: 50, position: 'relative'}}>
                                    <span>{headerMapper[headType]}</span>
                                    <span style={{ width: 10, height: 20,position: 'absolute', top: '50%', marginTop: -14 }}>
                                        <div className='dropup' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === headType && sortInfo.order === 'asc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='asc' data-headtype={headType} onClick={onSort}>
                                            <span className='caret' style={{width: '100%'}} data-order='asc' data-headtype={headType}></span>
                                        </div>
                                        <div className='dropdown' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === headType && sortInfo.order === 'desc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='desc' data-headtype={headType} onClick={onSort}>
                                            <span className='caret' style={{width: '100%'}} data-order='desc' data-headtype={headType}></span>
                                        </div>
                                    </span>
                                </th>)
                            }
                            return <th key={headType} colSpan={counter[headType]} className={commonStyle['table-unit']} style={{verticalAlign:'middle', minWidth: 310}}>{headerMapper[headType]}</th>
                        })
                    }
                </tr>
                <tr style={{ backgroundColor: '#f4faee' }}>
                    {
                        _.without(firstLineHead, 'kaohao', 'name', 'class').map((headType, index) => {
                            return _.range(3).map(index => {
                                if (index === 0 && secondLineHeadMap['score_' + headType]) {
                                    return (<th key={'headType-' + index} className={commonStyle['table-unit']} style={{minWidth: 100, position:'relative'}}>
                                        {headType === 'totalScore' ? '总分' : (headerMapper[headType] + '总分') }
                                        <span style={{ width: 10, height: 20, position: 'absolute', top: '50%', marginTop: -14 }}>
                                            <div className='dropup' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('score_' + headType) && sortInfo.order === 'asc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='asc' data-headtype={'score_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='asc' data-headtype={'score_' + headType}></span>
                                            </div>
                                            <div className='dropdown' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('score_' + headType) && sortInfo.order === 'desc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='desc' data-headtype={'score_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='desc' data-headtype={'score_' + headType}></span>
                                            </div>
                                        </span>
                                    </th>)
                                }
                                if (index === 1 && secondLineHeadMap['groupRank_' + headType]) {
                                    return (<th key={'headType-' + index} className={commonStyle['table-unit']} style={{minWidth: 50, position: 'relative'}}>
                                        {headerMapper[headType] + '排名'}
                                        <span style={{ width: 10, height: 20, position: 'absolute', top: '50%', marginTop: -14 }}>
                                            <div className='dropup' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('groupRank_' + headType) && sortInfo.order === 'asc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='asc' data-headtype={'groupRank_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='asc' data-headtype={'groupRank_' + headType}></span>
                                            </div>
                                            <div className='dropdown' style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('groupRank_' + headType) && sortInfo.order === 'desc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='desc' data-headtype={'groupRank_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='desc' data-headtype={'groupRank_' + headType}></span>
                                            </div>
                                        </span>
                                    </th>)
                                }
                                if (index === 2 && secondLineHeadMap['classRank_' + headType]) {
                                    return (<th key={'headType-' + index} className={commonStyle['table-unit']} style={{minWidth: 50, position: 'relative'}}>
                                        {headerMapper[headType] + '班级排名'}
                                        <span style={{ width: 10, height: 20, position: 'absolute', top: '50%', marginTop: -14 }}>
                                            <div className='dropup'  style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('classRank_' + headType) && sortInfo.order === 'asc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='asc' data-headtype={'classRank_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='asc' data-headtype={'classRank_' + headType}></span>
                                            </div>
                                            <div className='dropdown'  style={_.assign({},{ width: 8, height: '40%', cursor: 'pointer' }, sortInfo.head === ('classRank_' + headType) && sortInfo.order === 'desc' ? {visibility: 'hidden'} : {visibility: 'visible'})} data-order='desc' data-headtype={'classRank_' + headType} onClick={onSort}>
                                                <span className='caret' style={{ width: '100%' }} data-order='desc' data-headtype={'classRank_' + headType}></span>
                                            </div>
                                        </span>
                                    </th>)
                                }
                            })
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    renderRows.map((rowData, index) => {
                        return (
                            <tr key={'rowData-' + index}>
                                {
                                    headSeq.map((seqHead, dIndex) => {
                                        if (headSelect[seqHead] === true) {
                                            return <td key={'tableData-' + index + dIndex} className={commonStyle['table-unit']}>{rowData[seqHead] !== undefined ? rowData[seqHead] : '无数据'}</td>
                                        }
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </BootTable>
        </div>
    )
}

/***
 * props:
 * onSearch: 搜索方法
 */
class SearchWidget extends React.Component {
    constructor(props) {
        super(props);
        this.start = 0;
        this.elapsed = 0;
        this.MAX_DURATION = 1000;
        this.hasSearch = false;
    }
    getElapsed() {
        this.elapsed = _.now() - this.start;
        if (this.elapsed > this.MAX_DURATION && !this.hasSearch) {
            // 获取当前input的value，调用搜索的方法
            this.hasSearch = true;
            this.props.onSearch(this.refs.searchWidget.value);
        }
    }
    handleChange() {
        if (this.timer){
            clearInterval(this.timer);
            this.elapsed = 0;
        }
        this.hasSearch = false;
        this.start = _.now();
        this.timer = setInterval(this.getElapsed.bind(this), 200);
    }
    handleBlur() {
        // 失焦时，如果没有搜索过，则搜索
        if (!this.hasSearch) {
            this.props.onSearch(this.refs.searchWidget.value);
            this.hasSearch = true;
            clearInterval(this.timer);
        }
    }
    render() {
        return (
            <input
                id='searchWidget'
                ref='searchWidget'
                onChange={this.handleChange.bind(this)}
                placeholder='搜索'
                style={{ margin: '0 2px', height: 34, padding: '6px 12px', fontSize: 14, lineHeight: 1.42857143, color: '#555', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4 }}/>
        )
    }
}
/**
 * props:
 * examInfo: 考试信息数据;
 * studentInfos: 学生相关的所有考试数据；
 * headSeq: 包含全部paper的表头渲染时的顺序
 */
class RankReportTableView extends React.Component {
    constructor(props) {
        super(props);
        //先把paper的基本信息加入到headerMapper中；
        _.forEach(this.props.examInfo.papers, paperObj => {
            headerMapper[paperObj.paper] = paperObj.name;
        })
        var headSelect = {};
        _.forEach(this.props.headSeq, key => {
            headSelect[key] = true;
        })
        this.state = {
            currentPaper: { name: '全科' },
            currentClasses: this.props.examInfo.classes,
            pageIndex: 0,
            pageSize: 25,
            showData: _.values(this.props.studentInfos),        // 计算后的待显示数据
            headSelect: headSelect,
            headSeq: this.props.headSeq,                        // 默认显示全部表头
            sortInfo: {}                                        //{head: , order: }
        }
    }
    getTableHead() {
        var firstLineHead = [];
        var secondLineHead = [];
        _.forEach(this.state.headSeq, (head) => {
            if (this.state.headSelect[head] === true) {
                if (head.indexOf('_') !== -1) {
                    var headType = head.split('_')[1];
                    if (_.indexOf(firstLineHead, headType) === -1)
                        firstLineHead.push(headType);
                    secondLineHead.push(head);
                } else {
                    firstLineHead.push(head) //kaohao、name、 class
                }

            }
        })
        return {firstLineHead: firstLineHead, secondLineHead: secondLineHead}
    }
    handlePagination(nextPage) {
        this.setState({
            pageIndex: nextPage - 1
        })
    }
    onHeadSelect(event) {
        var newHeadSelect = this.state.headSelect;
        var checkedState = event.target.checked;
        newHeadSelect[event.target.value] = checkedState;
        this.setState({
            headSelect: newHeadSelect
        })
    }
    //选择一个paper，重置headReq,currentClass,pageIndex,pageSize
    onSelectPaper(event) {
        var paperId = $(event.target).data('paperid');
        var paperName = $(event.target).text();
        // 如果paperId不是'all'，则通过rankCache来筛选学生
        if (paperId !== 'all') {
            //配合curerentClass来获得学生ID
            var {rankCache} = this.props;
            var studentGroups = _.pick(rankCache, [paperId]);
            // 获取学生kaohao,组成一个新的数组
            var kaohaoList = [];

            _.forEach(studentGroups, (classes, paperId) => {
                _.forEach(classes, students => {
                    _.forEach(students, student => {
                        kaohaoList.push(student.kaohao);
                    })
                })
            })
            // 筛选studentInfos里的学生数据
            this.setState({
                currentPaper: {name: paperName, pid: paperId},
                currentClasses: this.props.examInfo.classes,
                pageIndex: 0,
                pageSize: 25,
                showData: _.values(_.pick(this.props.studentInfos, kaohaoList)),
                headSeq: ['kaohao','name','class'].concat(['score_'+paperId, 'groupRank_'+ paperId, 'classRank_' + paperId]),
                sortInfo: {}
            })
        } else {
            this.setState({
                currentPaper: {name: paperName},
                currentClasses: this.props.examInfo.classes,
                pageIndex: 0,
                pageSize: 25,
                showData: _.values(this.props.studentInfos),
                headSeq: this.props.headSeq,
                sortInfo: {}
            })
        }
        //清空搜索框：
        $('#searchWidget').val('');
    }
    onSelectClass(event) {
        var className = event.target.value;
        var checked = event.target.checked;
        var newCurrentClasses = this.state.currentClasses;
        if(className === '全部') {
            if (checked) {
                newCurrentClasses = this.props.examInfo.classes;
            } else {
                newCurrentClasses = [];
                this.setState({
                    currentClasses: newCurrentClasses,
                    pageIndex: 0,
                    pageSize: 25,
                    showData: [],
                    sortInfo: {}
                })
                return;
            }
        } else {
            if (checked) {
                newCurrentClasses.push(className);
            } else {
                newCurrentClasses = _.without(newCurrentClasses, className);
            }
        }
        if (this.state.currentPaper.name === '全科') {
            var kaohaoMap = {};
            _.forEach(this.props.rankCache, (classes, scoreType) => {
                var classGroup = _.pick(this.props.rankCache[scoreType], newCurrentClasses);
                _.forEach(classGroup, (students, className) => {
                    _.forEach(students, student => {
                        kaohaoMap[student.kaohao] = true;
                    })
                })
            })

            this.setState({
                currentClasses: newCurrentClasses,
                pageIndex: 0,
                pageSize: 25,
                showData: _.values(_.pick(this.props.studentInfos, _.keys(kaohaoMap))),
                sortInfo: {}
            })
        } else {
            var kaohaoList = [];
            var classGroup = _.pick(this.props.rankCache[this.state.currentPaper.pid], newCurrentClasses);
            _.forEach(classGroup, (students, className) => {
                _.forEach(students, student => {
                    kaohaoList.push(student.kaohao);
                })
            })
            this.setState({
                currentClasses: newCurrentClasses,
                pageIndex: 0,
                pageSize: 25,
                showData: _.values(_.pick(this.props.studentInfos, kaohaoList)),
                sortInfo: {}
            })
        }
        //清空搜索框：
        $('#searchWidget').val('');
    }
    onSelectPageSize(event) {
        var nextPageSize= $(event.target).text();
        this.setState({
            pageSize: parseInt(nextPageSize)
        })
    }
    onSearch(searchStr) {
        var showData = [];
        searchStr = searchStr.replace(/\s+/g,'');
        if (searchStr === '') {
            if (this.state.currentPaper.name === '全科') {
                // 遍历所有科目班级的学生信息。
                var kaohaoMap = {};
                _.forEach(this.props.rankCache, (classGroup, scoreType) => {
                    var classGroupFilter = _.pick(this.props.rankCache[scoreType], this.state.currentClasses)
                    _.forEach(classGroupFilter, (students, className) => {
                        _.forEach(students, student => {
                            kaohaoMap[student.kaohao] = true;
                        })
                    })
                })
                showData = _.values(_.pick(this.props.studentInfos, _.keys(kaohaoMap)));
            } else {
                var kaohaoList = [];
                var classMapFilter = _.pick(this.props.rankCache[this.state.currentPaper.pid], this.state.currentClasses);

                _.forEach(classMapFilter, (students, className) => {
                    _.forEach(students, student => {
                        kaohaoList.push(student.kaohao)
                    })
                })
                showData = _.values(_.pick(this.props.studentInfos, kaohaoList));
            }
        } else {
            var filteringData = [];
            // 则根据当前学科 与 班级 筛选数据；
            if (this.state.currentPaper.name === '全科'){
                //如果是全部班级则直接返回studentInfos
                if (this.state.currentClasses.length === this.props.examInfo.classes.length) {
                    filteringData = _.values(this.props.studentInfos);
                } else {
                    //否则需要根据当前班级筛选一遍学生；
                    var kaohaoMap = {};
                    _.forEach(this.props.rankCache, (classMap, scoreType) => {
                        var classMapFilter = _.pick(classMap, this.state.currentClasses);
                        _.forEach(classMapFilter, (students, className) => {
                            _.forEach(students, student => {
                                kaohaoMap[student.kaohao] = true;
                            })
                        })
                    })
                    filteringData = _.values(_.pick(this.props.studentInfos, _.keys(kaohaoMap)))
                }
            } else {
                // 根据Pid和class来筛选出一部分学生
                var kaohaoList = [];
                var classGroups = _.pick(this.props.rankCache[this.state.currentPaper.pid], this.state.currentClasses);
                _.forEach(classGroups, (students, className) => {
                    _.forEach(students, student => {
                        kaohaoList.push(student.kaohao);
                    })
                })
                filteringData = _.values(_.pick(this.props.studentInfos, kaohaoList));
            }
            _.forEach(filteringData, (studentInfo) => {
                for (var key in studentInfo) {
                    if(studentInfo[key].toString().indexOf(searchStr) !== -1) {
                        showData.push(studentInfo);
                        break;
                    }
                }
            })
        }
        this.setState({
            pageIndex: 0,
            pageSize: 25,
            showData: showData
        })
    }
    onSort(event) {
        var order = $(event.target).data('order');
        var headType = $(event.target).data('headtype');
        this.setState({
            pageIndex: 0,
            pageSize: 25,
            sortInfo: {head: headType, order: order},
            showData: _.orderBy(this.state.showData, [headType], [order])
        })
    }
    downloadTable() {
        // console.log('downloadTable');
        // console.log($("#rankTable"));
        // debugger;
        // var newJquery = tableExport($);

        $.fn.extend({tableExport: tableExport});
        // console.log($.fn);
        // console.log($("#rankTable"));
        $('#rankTable').tableExport({type:'excel', escape:'false'});
        // debugger;
    }
    render() {
        var {examInfo} = this.props;
        var {firstLineHead, secondLineHead} = this.getTableHead();
        var {pageIndex, pageSize, showData} = this.state;
        var dataBegin = pageIndex * pageSize + 1;
        var dataEnd = (pageIndex + 1) * pageSize < showData.length ? (pageIndex + 1) * pageSize : showData.length;
        return (
            <div style={{ margin: '10px 30px 40px 35px' }}>
                <div>
                    学科： <a onClick={this.onSelectPaper.bind(this)} data-paperid='all' style={{ textDecoration: 'none', color: this.state.currentPaper.name === '全科' ? '#4489fc' : '#333', margin: '0 10px' }} href='javascript:;'>全科</a>
                    {
                        examInfo.papers.map((subjectObj, index) => {
                            return (
                                <a key={'papers-' + index} onClick={this.onSelectPaper.bind(this)} data-paperid={subjectObj.paper} href='javascript:;' key={'subjects-' + index} style={{ textDecoration: 'none', color: this.state.currentPaper.name === subjectObj.name ? '#4489fc' : '#333', margin: '0 10px' }}>{subjectObj.name}</a>
                            )
                        })
                    }
                </div>
                <div style={{ marginTop: 30 }}>
                    班级：
                    <span>
                        <input value='全部' onChange={this.onSelectClass.bind(this)} type='checkbox' style={{ margin: '0 10px' }} checked={this.state.currentClasses.length === this.props.examInfo.classes.length}/>
                        <span>全部</span>
                    </span>
                    {
                        examInfo.classes.map((className, index) => {
                            return (
                                <span key={'classNames-' + index} style={{ margin: '0 10px' }} >
                                    <input value={className} onChange={this.onSelectClass.bind(this)} type='checkbox' checked={_.indexOf(this.state.currentClasses, className) !== -1}/>
                                    <span>{className}</span>
                                </span>
                            )
                        })
                    }
                </div>
                <div style={{ margin: '10px 0 20px 0', height: 50, borderBottom: '1px solid #f2f2f2' }}>
                    <div style={{ display: 'inline-block', fontSize: 18, fontWeight: 'bold', borderBottom: '2px solid #1e9bfc', float: 'left', height: '100%', lineHeight: '50px' }}>分数排行榜详情</div>
                    <div style={{ display: 'inline-block', float: 'right' }}>
                        <SearchWidget onSearch={this.onSearch.bind(this)} />
                        <DropdownButton id="head-select" title={'隐藏列'} style={{ margin: '0 2px'}}>
                        {
                            this.state.headSeq.map((head, index) => {
                                var headName = '';
                                if(head.indexOf('_') !== -1){
                                    var arr = head.split('_');
                                    headName = headerMapper[arr[1]] + headerMapper[arr[0]];
                                } else {
                                    headName = headerMapper[head];
                                }
                                return (
                                    <li key={'headSelect-' + index}>
                                        <input onChange={this.onHeadSelect.bind(this)} type='checkbox' style={{ margin: '0 10px' }} checked={this.state.headSelect[head]} value={head}/>
                                        <span>{headName}</span>
                                    </li>
                                )
                            })
                        }
                        </DropdownButton>
                        <Button onClick={this.downloadTable.bind(this)} style={{ margin: '0 2px' }}>下载</Button>
                    </div>
                </div>
                <Table
                    downloadTable = {this.downloadTable.bind(this)}
                    firstLineHead = {firstLineHead}
                    secondLineHead = {secondLineHead}
                    renderRows ={this.state.showData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)}
                    headSeq = {this.state.headSeq}
                    headSelect = {this.state.headSelect}
                    onSort= {this.onSort.bind(this)}
                    sortInfo={this.state.sortInfo}/>

                <span style={{margin: '20px 0', display: 'inline-block'}}>
                    显示第{dataBegin}到第{dataEnd}条记录，总共{this.state.showData.length}条记录
                    <span style={dataEnd < 25 ? {display: 'none'} : {display: 'inline-block'}}>
                        ，每页显示
                        <DropdownButton id='pageSize-select' title={pageSize} dropup style={{ margin: '0 2px' }}>
                            <MenuItem onClick={this.onSelectPageSize.bind(this) } active={pageSize === 25}>25</MenuItem>
                            <MenuItem style={ this.state.showData.length > 25 ? { display: 'block' } : { display: 'none' }} onClick={this.onSelectPageSize.bind(this) } active={pageSize === 50}>50</MenuItem>
                            <MenuItem style={ this.state.showData.length > 50 ? { display: 'block' } : { display: 'none' }}  onClick={this.onSelectPageSize.bind(this) } active={pageSize === 100}>100</MenuItem>
                            <MenuItem style={ this.state.showData.length > 100 ? { display: 'block' } : { display: 'none' }} onClick={this.onSelectPageSize.bind(this) } active={pageSize === 1000}>1000</MenuItem>
                        </DropdownButton>
                        条记录
                    </span>
                </span>
                <span style={_.assign({}, {float:'right'}, this.state.showData.length < pageSize ? {display: 'none'} : {display:'inline-block'})}>
                    <Pagination
                        prev
                        next
                        first
                        last
                        ellipsis={false}
                        boundaryLinks
                        items={showData.length % pageSize === 0 ? showData.length / pageSize : (parseInt(showData.length / pageSize) + 1)}
                        maxButtons={5}
                        activePage={pageIndex + 1}
                        onSelect={this.handlePagination.bind(this)}/>
                </span>
                <div style={{clear: 'both'}}></div>
            </div>
        )
    }
}
class RankReport extends React.Component {
    static need = [
        initRankReportAction
    ];

    constructor(props) {
        super(props);
        this.studentInfos = {}; // {kaohao: {kaohao: , name:, className: , score_ts, groupRank_ts: ,....}}
        this.headSeq = ['kaohao', 'name', 'class', 'score_totalScore', 'groupRank_totalScore', 'classRank_totalScore'];
    }

    componentDidMount() {
        if (this.props.haveInit) return;

        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initRankReport(params);

    }

    //设计：支持同步/异步分页的Table组件

    /*
    examInfo: {
        name: ,
        papers: [{name:, pid: }]
        classes:
    }

    rankCache: {
        totalScore: {
            <className>: [ //已经是有序的（升序）
                {
                    kaohao: ,
                    name: ,
                    class: ,
                    score:
                }
            ],
            ...
        },
        <pid>: {
            <className>: [
                {
                    kaohao: ,
                    name: ,
                    class: ,
                    score
                }
            ],
            ...
        },
        ...
    }
     */
    // 根据examinfo里的paper来获取表头的显示顺序
    getHeadSeq() {
        _.forEach(this.props.examInfo.papers, paperObj=> {
            _.forEach(['score', 'groupRank', 'classRank'], item => {
                this.headSeq.push(item + '_' + paperObj.paper)
            })
        })
    }
    // 生成所有学生的待显示数据
    generateStudentInfos() {
         _.forEach(this.props.rankCache, (classGroup, scoreType) => {
            var scoreMap = {};
            var allStudents = [];
            _.forEach(classGroup, (studentsArr, className) => {
                var classScoreMap = {};
                var classStudents = [];
                _.forEach(studentsArr, (studentObj, index) => {
                    // 记录班级中各个学生的成绩
                    classScoreMap[studentObj.score] = -1;
                    scoreMap[studentObj.score] = -1;
                    // 添加学生信息
                    allStudents.push({kaohao: studentObj.kaohao, score: studentObj.score});
                    classStudents.push({kaohao: studentObj.kaohao, score: studentObj.score});

                    if (!this.studentInfos[studentObj.kaohao]) {
                        this.studentInfos[studentObj.kaohao] = _.pick(studentObj, ['kaohao','name','class']);
                    }
                    // 学生分数赋值
                    this.studentInfos[studentObj.kaohao]['score_' + scoreType] = studentObj.score;
                })
                //计算班级成绩排名
                var classScoreRank = _.orderBy(_.keys(classScoreMap).map(scoreStr => {return parseFloat(scoreStr)}), [], 'desc');
                // 给班级scoreMap赋值
                _.forEach(classScoreRank, (score, index) => {
                    classScoreMap[score] = index;
                })
                // 遍历班级学生，赋予班级排名
                _.forEach(classStudents, studentObj => {
                    //把studentinfos对应考号的学生排名附上
                    this.studentInfos[studentObj.kaohao]['classRank_' + scoreType] = classScoreMap[studentObj.score] + 1;
                })

            })
            //对所有成绩排序
            var scoreRank = _.orderBy(_.keys(scoreMap).map(scoreStr => {return parseFloat(scoreStr)}), [], 'desc');
            // 遍历scoreRank, 给scoreMap赋值
            _.forEach(scoreRank, (score, index ) => {
                scoreMap[score] = index;
            })
            // 遍历所有的学生信息,给学生赋群体排名
            _.forEach(allStudents, studentObj=> {
                this.studentInfos[studentObj.kaohao]['groupRank_' + scoreType] = scoreMap[studentObj.score] + 1;
            })
        })
    }
    render() {
        var {examInfo, rankCache} = this.props;
        examInfo = Map.isMap(examInfo) ? examInfo.toJS() : examInfo;
        rankCache = Map.isMap(rankCache) ? rankCache.toJS() : rankCache;
        if ((!examInfo || _.size(examInfo) === 0) || (!rankCache || _.size(rankCache) === 0)) {
            return (
                <div style={{width: '100%', minHeight: 900, position: 'relative'}}>
                    <Spinkit/>
                 </div>
            )
        }
        this.getHeadSeq();
        this.generateStudentInfos();

        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
        if (!examid) return;
        var targetUrl = grade ? '/dashboard?examid=' + examid + '&grade=' + encodeURI(grade) : '/dashboard?examid=' + examid;

        return (
            <div style={{ width: 1000, minHeight: 830, backgroundColor: '#fff', margin: '0 auto', marginTop: 30 }}>
                <div style={{ paddingLeft: 20, backgroundColor: '#fcfcfc', height: 75, lineHeight: '75px', textAlign: 'center' }}>
                    <a href={targetUrl} style={{ fontSize: 12, textDecoration: 'none', color: '#333', float: 'left' }}> {'<'} 返回</a>
                    <span style={{ fontSize: 16 }}>{examInfo.name}-分数排行榜</span>
                </div>
                <RankReportTableView
                    examInfo={this.props.examInfo}
                    rankCache={this.props.rankCache}
                    studentInfos={this.studentInfos}
                    headSeq={this.headSeq}
                    />
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RankReport);

function mapStateToProps(state) {
    return {
        haveInit: state.rankReport.haveInit,
        examInfo: state.rankReport.examInfo,
        rankCache: state.rankReport.rankCache
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initRankReport: bindActionCreators(initRankReportAction, dispatch)
    }
}


//根据当前选中的班级，科目，搜索，隐藏列，显示多少条记录，currentPage的时候要重新渲染table

// search也是在所勾选的范围（currentPaper、currentClasses）内search，所以一上来先根据 currentPaper、currentClasses
// 确定总显示学生信息--下角的信息要用。搜索支持学号（当_.isNumber(parseInt(currentSearch))为true）也支持
// 姓名的搜索。

//header的信息从examInfo，examPapersInfo，examClassesInfo获取
//currentPaper来自examPapersInfo，所以id既是pid，paper是ObjectId
// 1阶段通过classes和subject筛选
	//var currentStudentsInfo = _.pick(this.props.rankCache[this.state.currentPaper.id], this.state.currentClasses);
// 2阶段通过 seach内容筛选
	// if(this.state.currentSearch && this.state.currentSearch.replace(/\s+/g,"")) {
	// 	//如果search中有真实内容
	// 	var isSeachNumber = _.isNumber(parseInt(this.state.currentSearch));
	// 	//如果是数字那么搜索学号，否则搜索姓名

	// 	//根据搜索结果，再次缩小 currentStudentsInfo
	// }


// 3阶段 根据 rankFactor排序。前面是确定内容，这里确定顺序。


















