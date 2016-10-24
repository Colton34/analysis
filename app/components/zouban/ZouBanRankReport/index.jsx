/*
分层走班的排行榜分为两部分：一个是【原值表格】一个是【转换表格】--转换表格当没有任何一个lesson被转的时候则不会显示
在原值表格中是lesson，而转换表格中是subject，转换表格中的zoubanSubjectStudentsInfo相当于zoubanLessonStudentsInfo


 */


import React, { PropTypes } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Radium from 'radium';
import ReactPaginate from 'react-paginate';
import {DropdownButton, Button, Table as BootTable, MenuItem} from 'react-bootstrap';

import TableView from '../../../common/TableView';

// import EnhanceTable from '../../../common/EnhanceTable';
import SortTablePlugin from '../../../common/SortTablePlugin';
import Select from '../../../common/Selector/Select';

import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import {insertRankInfo} from '../../../sdk';
import {downloadData} from '../../../lib/util';

//TODO:title里id为all而不是totalScore，totalScore是都会存在的;
//TODO: 需要一个ZoubanSubjectStudentsInfo

//负责渲染两个模块的表格：原值表格和转换表格；原值表格肯定是呈现的，这里的状态决定是否呈现转换表格--如果没有任何一个有转换的话
class ZouBanRankReport extends React.Component {
    constructor(props) {
        super(props);
        var zoubanExamInfo = this.props.zoubanExamInfo.toJS(), zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo.toJS();
        this.showEquivalentTable = _.some(zoubanExamInfo.lessons, (obj) => obj.percentage != 1);
        if(this.showEquivalentTable) this.zoubanSubjectStudentsInfo = getZoubanSubjectStudentsInfo(zoubanLessonStudentsInfo, zoubanExamInfo);
    }

    render() {
        var zoubanExamInfo = this.props.zoubanExamInfo.toJS(), zoubanExamStudentsInfo = this.props.zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo.toJS();
        return (
            <div>
                <RankReportContainer zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} />
                {this.showEquivalentTable ? (<RankReportContainer zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} zoubanLessonStudentsInfo={this.zoubanSubjectStudentsInfo} isEquivalent={true} />) : ('')}
            </div>
        );
    }
}

export default connect(mapStateToProps)(ZouBanRankReport);
function mapStateToProps(state) {
    return {
        zoubanExamInfo: state.zouban.zoubanExamInfo,
        zoubanExamStudentsInfo: state.zouban.zoubanExamStudentsInfo,
        zoubanLessonStudentsInfo: state.zouban.zoubanLessonStudentsInfo
    }
}

function getZoubanSubjectStudentsInfo(zoubanLessonStudentsInfo, zoubanExamInfo) {
    var cloneZoubanLessonStudentsInfo = _.cloneDeep(zoubanLessonStudentsInfo);
    var lessonsBySubject = _.groupBy(zoubanExamInfo.lessons, 'subject');
    var lessonMap = _.keyBy(zoubanExamInfo.lessons, 'objectId');
    var result = {}, currentLessonStudents;
    _.each(lessonsBySubject, (subjectLessons, subjectName) => {
        var currentSubjectLessonStudentsInfo = _.pick(cloneZoubanLessonStudentsInfo, _.map(subjectLessons, (obj) => obj.objectId));
        var currentSubjectStudents = [];
        _.each(currentSubjectLessonStudentsInfo, (lessonStudentInfoObj, lessonObjectId) => {
            currentLessonStudents = _.unionBy(..._.values(lessonStudentInfoObj), (obj) => obj.id);
            _.each(currentLessonStudents, (obj) => obj['class_name'] = lessonMap[lessonObjectId].name+obj['class_name']);
            currentSubjectStudents = _.unionBy(currentSubjectStudents, currentLessonStudents, (obj) => obj.id);
        });
        result[subjectName] = _.groupBy(currentSubjectStudents, 'class_name');
    });
    return result;
}


class RankReportContainer extends React.Component {
    constructor(props) {
        super(props);
        this.theDS = getRanReportDS(this.props.zoubanExamStudentsInfo, this.props.zoubanLessonStudentsInfo, this.props.isEquivalent);
        var lessons = this.props.zoubanExamInfo.lessons;
        var titleOptions = this.props.isEquivalent ? getSubjectTtitles(lessons) : getLessonTitles(lessons);//[{id: , title: }]
        var titles = titleOptions.slice(1);
        titles.unshift({id: 'totalScore', title: '总分'});
        var currentTitle = titleOptions[0];
        var lessonClassesOptions = [];
        var lessonClasses = [];
        var currentClass = lessonClassesOptions[0];
        // var columns = getColumns(titles, !!currentClass);
            //[暂时没有隐藏列]
            // currentColumns: columns,
            // selectedColumns: columns,
        this.state = {
            titleOptions: titleOptions,
            titles: titles,
            titles: titles,
            currentTitle: currentTitle,
            lessonClassesOptions: lessonClassesOptions,
            lessonClasses: lessonClasses,
            currentClass: currentClass,
            searchStr: '',
            currentPageSize: 25,
            currentPageValue: 0,
            currentSortKey: 'totalScore_score',
            currentSortDir: 'desc'
        }
    }

    handleSelectTitle(selectedTitle) {
        var titles = (selectedTitle.id == 'all') ? getLessonTitles(this.props.zoubanExamInfo.lessons).slice(1) : [selectedTitle];
        titles.unshift({id: 'totalScore', title: '总分'});
        var lessonClassesOptions = (selectedTitle.id == 'all') ? [] : _.keys(this.props.zoubanLessonStudentsInfo[selectedTitle.id]);
        var lessonClasses = _.cloneDeep(lessonClassesOptions);
        if(selectedTitle.id != 'all') lessonClassesOptions.unshift('全部');
        var currentClass = lessonClassesOptions[0];
        var currentSortKey = (selectedTitle.id == 'all') ? 'totalScore_score' : selectedTitle.id+'_score';
        this.setState({
            titles: titles,
            currentTitle: selectedTitle,
            lessonClassesOptions: lessonClassesOptions,
            lessonClasses: lessonClasses,
            currentClass: currentClass,
            currentSortKey: currentSortKey,
            currentSortDir: 'desc'
        });
    }

    handleSelectClass(selectedClass) {
        this.setState({
            currentClass: selectedClass
        })
    }

    handleSearch(searchStr) {
        this.setState({
            searchStr: searchStr
        })
    }

    handleSelectPageSize(selectedPageSize) {
        this.setState({
            currentPageSize: selectedPageSize
        })
    }

    handleSelectPageValue(selectedPageObj) {
        this.setState({
            currentPageValue: selectedPageObj.selected
        })
    }

    clickDownloadTable() {
        downloadData(this.downloadKeys, this.downloadNames, this.downloadTableData, '排行榜');
    }

    handleSort(currentSortKey) {

        var currentSortDir;// =  (this.state.currentSortDir == 'desc' ? 'asc' : 'desc');
        if(currentSortKey != this.state.currentSortKey) {
            currentSortDir = 'desc';
        } else {
            currentSortDir = (this.state.currentSortDir == 'desc' ? 'asc' : 'desc');
        }
        this.setState({
            currentSortKey: currentSortKey,
            currentSortDir: currentSortDir
        });
    }

    render() {
        var showClassInfo = (this.state.currentTitle.id != 'all');
        var {tableHeader, headerKeys, subjectSubTitles} = getTableHeader(this.state.titles, showClassInfo);

        // var currentColumns = getColumns(this.state.titles, showClassInfo);
        var theRowDS = getRowDS({theDS: this.theDS, currentTitle:this.state.currentTitle,  currentClass: this.state.currentClass, searchStr: this.state.searchStr, zoubanLessonStudentsInfo: this.props.zoubanLessonStudentsInfo});
        var tableBody = getTableBody({rowDS: theRowDS, currentPageSize: this.state.currentPageSize, currentPageValue: this.state.currentPageValue, currentSortKey: this.state.currentSortKey, currentSortDir: this.state.currentSortDir}); //columns: currentColumns,

        var totalCount = _.size(theRowDS);
        var options = getPageSelecOptions(totalCount);

        var {downloadKeys, downloadNames} = getDownloadFields(headerKeys, subjectSubTitles);
        this.downloadKeys = downloadKeys;
        this.downloadNames = downloadNames;
        this.downloadTableData = getDownTableData(theRowDS, downloadKeys);//下载全部页数的表格内容

        var sortInfo = {id: this.state.currentSortKey, order: this.state.currentSortDir};


        return (
            <div style={{ width: 1200, minHeight: 700, backgroundColor: '#fff', margin: '0 auto', marginTop: 5 ,padding:50}}>
                <TitleSelector isEquivalent={this.props.isEquivalent} titleOptions={this.state.titleOptions} currentTitle={this.state.currentTitle} handleSelectTitle={this.handleSelectTitle.bind(this)} />
                {(this.state.currentTitle.id != 'all') ? (<ClassSelector lessonClassesOptions={this.state.lessonClassesOptions} currentClass={this.state.currentClass} handleSelectClass={this.handleSelectClass.bind(this)} />) : ''}
                <SearchSortDropSelector searchStr={this.state.searchStr} handleSearch={this.handleSearch.bind(this)} clickDownloadTable={this.clickDownloadTable.bind(this)} />
                <TableView tableHeaders={tableHeader} tableData={tableBody} TableComponent={SortTablePlugin} handleSort={this.handleSort.bind(this)} sortInfo={sortInfo}></TableView>
                <Paginate currentPageSize={this.state.currentPageSize} currentPageValue={this.state.currentPageValue} totalCount={totalCount} options={options} handleSelectPageSize={this.handleSelectPageSize.bind(this)} handleSelectPageValue={this.handleSelectPageValue.bind(this)} />
            </div>
        );
    }
}

function getDownloadFields(headerKeys, subjectSubTitles) {
    var downloadKeys = [], downloadNames = [];
    _.each(headerKeys, (obj) => {
        downloadKeys.push(obj.id);
        downloadNames.push(obj.name);
    });
    _.each(subjectSubTitles, (obj) => {
        downloadKeys.push(obj.id);
        downloadNames.push(obj.name);
    });
    return {
        downloadKeys: downloadKeys,
        downloadNames: downloadNames
    }
}

function getPageSelecOptions(totalCount) {
    var options = [];
    if(totalCount > 25) options.push({value: 25, label: 25});
    if(totalCount > 50) options.push({value: 50, label: 50});
    if(totalCount > 100) options.push({value: 100, label: 100});
    if(totalCount > 1000) options.push({value: 1000, label: 1000});
    return options;
}

//isEquivalent; titles; currentTitle; handleSelectTitle
class TitleSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    onSelectTitle(selectedTitle) {
        this.props.handleSelectTitle(selectedTitle);
    }

    render() {
        return (
            <div style={{ padding: '5px 30px 0 0px',marginBottom:0}} className={commonClass['section']}>
                <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                    <span style={{ marginRight: 10}}>{this.props.isEquivalent ? '学科' : '课程'}：</span>
                        {_.map(this.props.titleOptions, (titleObj, index) => {
                            return (
                                <a key={'title-' + index} onClick={this.onSelectTitle.bind(this, titleObj)} style={ (titleObj.id == this.props.currentTitle.id)?localStyle.activeSubject:localStyle.subject}>{titleObj.title}</a>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

//lessonClasses; currentClass; handleSelectClass
class ClassSelector extends React.Component {
    constructor(props) {
        super(props);
    }

    onSelectClass(selectedClass) {
        this.props.handleSelectClass(selectedClass);
    }

    render() {
        return(
            <div style={{heigth: 50, lineHeight: '50px',marginTop:0,padding:0,marginBottom:0}} className={commonClass['section']}>
                <span style={{ float: 'left', marginRight: 10}}>教学班:</span>
                <span style={{float: 'left', width: 1000}}>
                    {
                        (this.props.lessonClassesOptions.length > 0) ? (
                                _.map(this.props.lessonClassesOptions, (className, index) => {
                                    return (
                                        <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                            <input value={className} checked={this.props.currentClass == className} onChange={this.onSelectClass.bind(this, className)} style={{ marginRight: 5, cursor: 'pointer' }} type='checkbox' />
                                            <span>{className}</span>
                                        </span>
                                    )
                                })
                            ) : (
                                <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                    <input value={'none'} checked={true} style={{ marginRight: 5, cursor: 'pointer' }} type='checkbox' />
                                    <span>无</span>
                                </span>
                            )
                    }
                </span>
                <div style={{clear: 'both'}}></div>
            </div>
        )
    }
}

//searchStr; handleSearch;
class SearchInput extends React.Component {
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
            this.props.handleSearch(this.refs.searchInput.value);
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
            this.props.handleSearch(this.refs.searchInput.value);
            this.hasSearch = true;
            clearInterval(this.timer);
        }
    }
    render() {
        return (
            <span style={{display: 'inline-block', position: 'relative'}}>
                <input
                    id='searchInput'
                    ref='searchInput'
                    onChange={this.handleChange.bind(this) }
                    placeholder='输入搜索内容'
                    style={{ margin: '0 2px', height: 34, padding: '6px 12px', fontSize: 14, lineHeight: 1.42857143, color: '#555', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4 }}
                    />
                    <i className='icon-search-2' style={{ position: 'absolute', right: 10, top: '50%', marginTop: -10, color: '#bfbfbf' }}></i>
            </span>
        )
    }
}

//收缩后响应。替换掉好了。
//columns; selectedColumns; searchStr; handleSearch
class SearchSortDropSelector extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return(
            <div style={{marginBottom:30,marginTop:30}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']} >分数排行榜详情</span>
                <div style={{float:'right'}}>
                    <SearchInput searchStr={this.props.searchStr} handleSearch={this.props.handleSearch} />
                    <Button onClick={this.props.clickDownloadTable} style={{ margin: '0 2px', backgroundColor: '#2eabeb', color: '#fff', border: 0}}>下载表格</Button>
                </div>
            </div>
        )
    }
}

//currentPageSize currentPageValue totalCount
class Paginate extends React.Component {
    constructor(props) {
        super(props);
    }

    onSelectPageSize(selectedPageSize) {
        this.props.handleSelectPageSize(selectedPageSize);
    }

    render() {
        var beginCount = this.props.currentPageSize * this.props.currentPageValue + 1;
        var endCount = beginCount + this.props.currentPageSize - 1;

        return(
            <div>
                <span style={{margin: '18px 0px 0px 0px', display: 'inline-block'}}>
                    显示第{beginCount}到第{endCount}条记录，总共{this.props.totalCount}条记录
                    <span style={this.props.totalCount < 25 ? {display: 'none'} : {display: 'inline-block'}}>
                        ，每页显示
                        <div style={{display:'inline-block'}}>
                        <Select
                            simpleValue
                            options={this.props.options}
                            value={this.props.currentPageSize}
                            onChange={this.onSelectPageSize.bind(this)}
                        />
                        </div>
                        条记录
                    </span>
                </span>
                <div style={{float:'right',marginBottom:'3px'}}>
                    <ReactPaginate previousLabel={"<"}
                       nextLabel={">"}
                       breakLabel={<span>...</span>}
                       breakClassName={"break-me"}
                       pageNum={_.ceil(_.divide(this.props.totalCount, this.props.currentPageSize))}
                       marginPagesDisplayed={2}
                       pageRangeDisplayed={5}
                       forceSelected={this.props.currentPageValue}
                       pageLinkClassName={"pageLinkClassName"}
                       clickCallback={this.props.handleSelectPageValue}
                       containerClassName={"pagination"}
                       subContainerClassName={"pages pagination"}
                       activeClassName={"active"} />
                </div>
            </div>
        )
    }
}


/*

负责渲染一个ReportContainer里的所有组件：给出每个孩子组件的当前状态和所有状态，即瀑布。因为这里需要汇总所有孩子状态。
持有数据结构，作为props数据传递给组件init
持有计算Table数据的函数，提供给会影响table数据的组件回调使用

 */

function getLessonTitles(lessons) {
    var lessonTitles = _.map(lessons, (obj) => {
        return {
            id: obj.objectId,
            title: obj.name
        }
    });
    lessonTitles.unshift({ id: 'all', title: '全科'});
    return lessonTitles;
}

function getSubjectTtitles(lessons) {
    //这里id就和title一样就行了。因为就是区分subject的
    var subjectTitles = _.chain(lessons).groupBy('subject').map((values, subjectName) => {
        return {
            id: subjectName,
            title: subjectName
        }
    }).value();
    subjectTitles.unshift({id: 'all', title: '全科'});
    return subjectTitles;
}

function getTableHeader(titles, showClassInfo) {
    var headerKeys = getTableHeaderKeys(showClassInfo);
    var header = [
        headerKeys
    ];
    var {subjectHeaderTitles, subjectSubTitles} = getTitleHeader(titles, showClassInfo);
    header[0] = _.concat(header[0], subjectHeaderTitles);
    header[1] = subjectSubTitles;
    debugger
    return {
        tableHeader: header,
        headerKeys: headerKeys,
        subjectSubTitles: subjectSubTitles
    }

}

//【暂时不支持隐藏列】所以tableHeader可以使用老方法来获取
function getTableHeaderKeys(showClassInfo) {
    var headerKeys = [
        {id: 'kaohao', name: '考号',rowSpan: 2},
        {id:'name', name: '姓名', rowSpan: 2}
    ]
    if(showClassInfo) headerKeys.push({id: 'class', name: '班级', rowSpan: 2});
    return headerKeys;
}

//showClassInfo: 只有当选择【单科】，并且【选择某个班级】的时候才为true。有没有必要选定一二班级呢？取决于一个学生有没有可能在一个lesson下参加多个班级？当选择一个科目的时候--即在转换表格那里--能否显示【班级排行】：应该是可以的，还是在一个班级内，大家走相同的转换
//所以【班级排名】应该同原值表格中的班级排名。
//subjects是有序的--从lessons进行map得到的
function getTitleHeader(titles, showClassInfo) {
    var subjectHeaderTitles = [], subjectSubTitles = [];
    _.each(titles, (obj, index) => {
        subjectHeaderTitles.push({name: obj.title, colSpan: (showClassInfo ? 3 : 2), objectId: obj.id});
        subjectSubTitles.push({id: obj.id+'_score', name: obj.title+(obj.id=='totalScore'? '':'分数'), objectId: obj.id}, {id: obj.id+'_rank', name: obj.title+'排名', objectId: obj.id});
        if(showClassInfo) subjectSubTitles.push({id: obj.id+'_classRank', name: obj.title+'班级排名', objectId: obj.id});
    });
    return {
        subjectHeaderTitles: subjectHeaderTitles,
        subjectSubTitles: subjectSubTitles
    }
}

/*
有顺序。columns作为DropList的输入。
subjectId: totalScore, <paperObjectId>...
fieldKeys: score, rank, classRank
columns: [
    {
        key: <fieldKey>/<subjectId>_<fieldKey>,
        value:
    }
]
 */
//当有需要注入关于【班级】的信息的时候，就会注入更改columns，进而改变TableHeader。【假设】学生不会跨层考试。showClass和showClassRank还是不一样，当选择某一个班级的时候不用显示class列但是需要显示classRank列
// function getColumns(titles, showClassInfo) {
//     var columns = [
//         {key: 'kaohao', value: '考号'},
//         {key:'name', value: '姓名'}
//     ];
//     if(showClassInfo) columns.push({key: 'class', value: '班级'});

//     _.each(titles, (obj) => {
//         columns.push({key: obj.id+'_score', value: obj.title+(obj.id=='totalScore'? '':'分数'), objectId: obj.id, title: obj.title});
//         columns.push({key: obj.id+'_rank', value: obj.title+'排名', objectId: obj.id, title: obj.title});
//         if(showClassInfo) columns.push({key: obj.id+'_classRank', value: obj.title+'班级排名', objectId: obj.id, title: obj.title})
//     });
//     return columns;
// }

function getRanReportDS(zoubanExamStudentsInfo, zoubanLessonStudentsInfo, isEquivalent) {
    var zoubanExamStudentsInfoMap = _.keyBy(zoubanExamStudentsInfo, 'id');
    var result = {}, tempObj, totalStudentInfoObj;
    _.each(zoubanLessonStudentsInfo, (currentLessonStudentsInfo, lessonObjectId) => {
        _.each(currentLessonStudentsInfo, (currentLessonClassStudentsInfo, className) => {
            _.each(currentLessonClassStudentsInfo, (lessonStudentInfoObj) => {
                tempObj = result[lessonStudentInfoObj.id];
                if(!tempObj) {
                    totalStudentInfoObj = zoubanExamStudentsInfoMap[lessonStudentInfoObj.id];
                    tempObj = _.pick(totalStudentInfoObj, ['id', 'kaohao', 'name', 'classes']);
                    tempObj['totalScore_score'] = (isEquivalent) ? totalStudentInfoObj.equivalentScore : totalStudentInfoObj.score;
                    tempObj['totalScore_rank'] = (isEquivalent) ? totalStudentInfoObj.equivalentRank : totalStudentInfoObj.rank;
                    //班级信息都是补录的--当获取到选择的currentClass
                    result[lessonStudentInfoObj.id] = tempObj;
                }
                tempObj[lessonObjectId+'_score'] = (isEquivalent) ? lessonStudentInfoObj.equivalentScore : lessonStudentInfoObj.score;
                tempObj[lessonObjectId+'_rank'] = (isEquivalent) ? lessonStudentInfoObj.equivalentLessonRank : lessonStudentInfoObj.lessonRank;
                tempObj[lessonObjectId+'_classRank'] = (isEquivalent) ? lessonStudentInfoObj.equivalentClassRank : lessonStudentInfoObj.classRank;
            })
        });
    });
    return result;
}


function getRowDS({theDS, currentTitle, currentClass, searchStr, zoubanLessonStudentsInfo}) {
    var rowDS;
    if(currentTitle.id == 'all') {
        if(searchStr == '') {
            rowDS = getAllSubjectData(theDS);
        } else {
            rowDS = getAllSubjectDataBySearch(theDS, searchStr);
        }
    } else {
        if(currentClass == '全部') {
            if(searchStr == '') {
                rowDS = getSpecificLessonData(theDS, currentTitle, zoubanLessonStudentsInfo);
            } else {
                rowDS = getSpecificLessonDataBySearch(theDS, currentTitle, zoubanLessonStudentsInfo, searchStr);
            }
        } else {
            if(searchStr == '') {
                rowDS = getSpecificLessonClassData(theDS, currentTitle, zoubanLessonStudentsInfo, currentClass);
            } else {
                rowDS = getSpecificLessonClassDataBySearch(theDS, currentTitle, zoubanLessonStudentsInfo, currentClass, searchStr);
            }
        }
    }
    return rowDS;
}

function getAllSubjectData(theDS) {
    return theDS;
}

function getAllSubjectDataBySearch(theDS, searchStr) {
    return _.chain(theDS).values().filter((obj) => _.includes(obj.name, searchStr)).keyBy('id').value();
}

//注意：currentTitle.id【目前】只试用于lesson，从zoubanLessonStudentsInfo中获取数据，如果是针对subject还需要建立从subjectName中获取到相应的数据

function getSpecificLessonData(theDS, currentTitle, zoubanLessonStudentsInfo) {
    var currentLessonAllStudentIds = _.union(..._.map(zoubanLessonStudentsInfo[currentTitle.id], (currentLessonClassStudents, className) => _.map(currentLessonClassStudents, (obj) => obj.id)));
    var currentLessonAllStudentInfo = _.pick(theDS, currentLessonAllStudentIds);
    insertTotalClassRankInfo(currentLessonAllStudentInfo, currentTitle)
    return currentLessonAllStudentInfo;
}


function getSpecificLessonDataBySearch(theDS, currentTitle, zoubanLessonStudentsInfo, searchStr) {
    var currentLessonAllStudentIds = _.union(..._.map(zoubanLessonStudentsInfo[currentTitle.id], (currentLessonClassStudents, className) => _.map(currentLessonClassStudents, (obj) => obj.id)));
    var currentLessonStudentDS = _.pick(theDS, currentLessonAllStudentIds);
    var filterCurrentLessonStudentDS = _.chain(currentLessonStudentDS).values().filter((obj) => _.includes(obj.name, searchStr)).keyBy('id').value();
    insertTotalClassRankInfo(filterCurrentLessonStudentDS, currentTitle);
    return filterCurrentLessonStudentDS;
}

function getSpecificLessonClassData(theDS, currentTitle, zoubanLessonStudentsInfo, currentClass) {
    var currentLessonClassStudentIds = _.map(zoubanLessonStudentsInfo[currentTitle.id][currentClass], (obj) => obj.id);
    var currentLessonClassStudentsInfo = _.pick(theDS, currentLessonClassStudentIds);
    insertTotalClassRankInfo(currentLessonClassStudentsInfo, currentTitle);
    return currentLessonClassStudentsInfo;
}

function getSpecificLessonClassDataBySearch(theDS, currentTitle, zoubanLessonStudentsInfo, currentClass, searchStr) {
    var currentLessonClassStudentIds = _.map(zoubanLessonStudentsInfo[currentTitle.id][currentClass], (obj) => obj.id);
    var currentLessonClassStudentDS =  _.pick(theDS, currentLessonClassStudentIds);
    var filterCurrentLessonClassStudentDS = _.chain(currentLessonClassStudentDS).values().filter((obj) => _.includes(obj.name, searchStr)).keyBy('id').value();
    insertTotalClassRankInfo(filterCurrentLessonClassStudentDS, currentTitle);
    return filterCurrentLessonClassStudentDS;
}

function insertTotalClassRankInfo(studentsInfo, currentTitle) {
    var targetClassObj;
    _.each(studentsInfo, (obj) => {
        targetClassObj = _.find(obj.classes, (cobj) => (cobj.paperObjectId == currentTitle.id) || (cobj.subject == currentTitle.id));
        obj['totalScore_classRank'] = targetClassObj.rank;
        obj['class'] = targetClassObj.name;
    });
}

function getTableBody({rowDS, currentPageSize, currentPageValue, currentSortKey='totalScore_score', currentSortDir='desc'}) { // columns,

    var existLessonStudents = _.filter(rowDS, (obj) => obj[currentSortKey]);
    var notExistLessonStudents = _.filter(rowDS, (obj) => !obj[currentSortKey]);

    rowDS = _.concat(_.orderBy(existLessonStudents, [currentSortKey], currentSortDir), notExistLessonStudents);
    debugger;
    var beginCount = currentPageSize * (currentPageValue);
    var endCount = beginCount + currentPageSize;
    var currentPageRowDS = rowDS.slice(beginCount, endCount);
    return currentPageRowDS;

    // return _.map(currentPageRowDS, (rowItem) => {
    //     return _.map(columns, (columnObj) => {
    //         return rowItem[columnObj.key];
    //     });
    // });
}

function getDownTableData(rowDS, downloadKeys) {
    return _.map(rowDS, (rowItem) => {
        return _.map(downloadKeys, (key) => {
            return rowItem[key];
        });
    });
}



//=================================  Mock ==========================================


//当给出交互，得到当前选项后，基于不同给的选项组合，在DS的基础上，过滤，补充数据，组成TableBody

 //姓名，学号，总分，语文，数学，英语
 var subjects = [' 语文','数学','英语'];//需提供
 var classes = ['10_魏旭','10_魏旭','10_魏旭','10_魏旭'];
 var data = [{
     id:'name',
     name:'姓名',
     rowSpan:2
 },{
     id:'number',
     name:'学号',
     rowSpan:2,
     columnSortable:true
 },{
     id:'fullScore',
     name:'总分',
     rowSpan:2,
     columnSortable:true
 }
 ];
 function getMorkHeaderData (subjects,data){
 var headerData = [[],[]];
 headerData[0] = data;
 _.forEach(subjects,function(subject){
     headerData[0].push({
         name:subject,
         colSpan:2
     });
 });
 _.forEach(subjects,function(subject,index){
     headerData[1].push({
         id:'排名_rank',
         name:'排名',
         columnSortable:true
     });
     headerData[1].push({
         id:'分数_score',
         name:'分数',
         columnSortable:true
     });
 });
 return headerData;
 }
 function getMorkData (number,subjects){
     var  studentInfo = [];
     _.forEach(_.range(number),function(index){
     var student = [];
     student.push('丁'+index);
     student.push(index);
     student.push(300);
     student.push(index);
     student.push(100-index);
     student.push(index);
     student.push(100-index);
     student.push(index);
     student.push(100-index);
     studentInfo.push(student);

     })
     return studentInfo;
 }
 function matchTableData (studentInfo){//转化body数据以符合渲染
     var idList = ['name','number','fullScore','排名_rank','分数_score'];

     var morkTableData = _.map(studentInfo,function(student){
         return {
             ['name']:student[0],
             ['number']:student[1],
             ['fullScore']:student[2],
             ['排名_rank']:student[3],
             ['分数_score']:student[4],
             ['排名1_rank']:student[5],
             ['分数1_score']:student[6],
             ['排名2_rank']:student[7],
             ['分数2_score']:student[8],
         }
     });
 return morkTableData;
 }

 var localStyle = {
     subject: {
         display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#fff', color: '#333', marginRight: 10, textDecoration: 'none',textAlign: 'center', lineHeight: '22px'
     },
     activeSubject: {
         display: 'inline-block', minWidth: 50, height: 22, backgroundColor: '#2ea8eb', color: '#fff',  marginRight: 10,  textDecoration: 'none', textAlign: 'center', lineHeight: '22px'
     },
     pageBtn: {
         display: 'inline-block', width: 96, height: 30, lineHeight: '30px', padding: '0 8px 0 12px', border: '1px solid #e7e7e7', color: '#333', position:'relative', cursor: 'pointer'
     },
     pageIndexItem: {
         height: 22, padding: '0 12px', color: '#333', cursor: 'pointer',
         ':hover': {backgroundColor: '#f2f2f2'}
     },
     pageShortcut: {display: 'inline-block', width: 30, heigth: 30, border:'1px solid #eee', color: '#bfbfbf', marginRight:6, lineHeight:'30px', textAlign: 'center', cursor: 'pointer'},
     sortDirection: { width: 10, height: 20, position: 'absolute', top: '50%', right: '10%', marginTop: -14},
     examName: {
         color: '#b4b4b4', cursor: 'pointer',
         ':hover': {color: colorsMap.B03}
     }
 }

//【暂时没有隐藏列】
// function getTableHeader(columns, showClassInfo, showClassInfo) {
// //从columns中反推出关于subject的东西
//     //从clolumns中拿出不带有paperObjectId的--就是headerKeys
//     var headerKeys = _.chain(columns).filter(obj => !obj.paperObjectId).map(obj => {
//         return {
//             id: obj.key,
//             name: obj.value,
//             rowSpan: 2
//         }
//     }).value();

//     var header = [
//         headerKeys
//     ];

//     var validTitlesByColumns = _.filter(columns, obj => obj.paperObjectId);
//     var validTitlesByColumnsMap = _.groupBy(validTitlesByColumns, 'paperObjectId');
//     var subjectHeaderTitles = [], subjectSubTitles = [];
//     //不对，这样遍历就没有了顺序了！！！--先确认这样是不是有顺序！！！
//     _.each(validTitlesByColumnsMap, (validTitles, paperObjectId) => {
//         subjectHeaderTitles.push({name: validTitles[0].title, colSpan: (showClassInfo ? 2 : 3), objectId: paperObjectId});
//         //然后就是本身已经有的内容
//         _.each(validTitles, (obj) => {
//             subjectSubTitles.push({id: obj.key, name: obj.value, objectId: obj.objectId});
//             if(showClassInfo) subjectSubTitles.push({id: obj.objectId+'_classRank', name: obj.title+'班级排名', objectId: obj.objectId});
//         });
//     });
//     header[0] = _.concat(header[0], subjectHeaderTitles);
//     header[1] = subjectSubTitles;
//     return header;
// }
