import React, { PropTypes } from 'react';
import _ from 'lodash';
import {DropdownButton, Button, Table as BootTable, MenuItem} from 'react-bootstrap';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import Radium from 'radium';
import ReactPaginate from 'react-paginate';
class ZouBanRankReport extends React.Component {
constructor(props) {
    super(props);
    var studentInfo = getMorkData (1000);
    var tableData  =matchTableData (studentInfo);
    var tableHeaders = getMorkHeaderData (subjects,data);
    this.state = {
        pageIndex:0,
        tableData:tableData,
        dataSize:25,
        tableHeaders:tableHeaders
    }
}
onSelectPageSize(event) {
    var nextPageSize= $(event.target).text();
    this.setState({
        dataBegin:0,
        dataSize: parseInt(nextPageSize)
    })
}
handlePageClick = (data) => {
    let selected = data.selected;
    this.setState( {
    pageIndex:selected,
    })
}
onSeach(searchStr){
    console.log(searchStr);//补充查询处理
    this.setState({
        pageIndex:0,

    })
 }
 render(){
     var pageIndex = this.state.pageIndex;
     var dataBegin=this.state.pageIndex*this.state.dataSize+1;
     var dataSize= this.state.dataSize;
     var tableData = this.state.tableData;
     var tableHeaders = this.state.tableHeaders;
     var dataEnd = (pageIndex + 1) * dataSize < tableData.length ? (pageIndex + 1) * dataSize : tableData.length;
     var showData = tableData.slice(pageIndex * dataSize, (pageIndex + 1) * dataSize);
     return (
         <div style={{ width: 1200, minHeight: 830, backgroundColor: '#fff', margin: '0 auto', marginTop: 5 ,padding:50}}>
             <SubjectSelect />
             <ClassSelect />
             <SeachSortDown  onSeach={this.onSeach.bind(this)} onSelectPageSize={this.onSelectPageSize.bind(this)}/>
             <TableView hover tableData={showData} reserveRows={26}  tableHeaders={tableHeaders} TableComponent={EnhanceTable}></TableView>
             <Paginate  tableData={tableData} dataSize={dataSize} pageIndex={pageIndex} handlePageClick={this.handlePageClick.bind(this)} dataBegin={dataBegin} dataEnd={dataEnd}/>
         </div>
     )
 }
}
export default ZouBanRankReport;
class SubjectSelect extends React.Component{
    constructor(props) {
        super(props);
        this.setState({

        });

    }
    render(){
        return(
            <div style={{ padding: '5px 30px 0 0px',marginBottom:0}} className={commonClass['section']}>
                <div style={{heigth: 50, lineHeight: '50px', borderBottom: '1px dashed #eeeeee'}}>
                    <span style={{ marginRight: 10}}>学科：</span>
                        {subjects.map((course, index) => {
                            return (
                                <a key={'papers-' + index}    style={ localStyle.subject}>{course}</a>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
class ClassSelect extends React.Component{
    constructor(props) {
        super(props);
        this.setState({

        });

    }
    render(){
        return(
            <div style={{heigth: 50, lineHeight: '50px',marginTop:0,padding:0}} className={commonClass['section']}>
                <span style={{ float: 'left', marginRight: 10}}>教学班:</span>
                <span style={{float: 'left', width: 800}}>
                    <span style={{display: 'inline-block', marginRight: 30, minWidth: 50}}>
                        <input value='全部' style={{ marginRight: 5, cursor: 'pointer'}} type='checkbox' />
                        <span>全部</span>
                    </span>
                    {
                        classes.map((className, index) => {
                            return (
                                <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                    <input value={className} style={{ marginRight: 5, cursor: 'pointer' }} type='checkbox' />
                                    <span>{className}</span>
                                </span>
                            )
                        })
                    }
                </span>
                <div style={{clear: 'both'}}></div>
            </div>
        )
    }
}
class SeachSortDown extends React.Component{
    constructor(props) {
        super(props);
        this.setState({

        });

    }
    render(){
        return(
            <div style={{marginBottom:30}}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']} >分数排行榜详情</span>
            <div style={{float:'right'}}>
            <InputWidget  placeholder='输入搜索内容' searchIcon triggerFunction={this.props.onSeach.bind(this)}/>
                <DropdownButton id="head-select" title={'隐藏列'} style={{ margin: '0 2px'}}>
                <ul style={{maxHeight: 300, maxWidth: 180, listStyleType: 'none', overflowY: 'scroll',padding: 0}}>
                {
                    subjects.map((head, index) => {

                        return (
                            <li key={'headSelect-' + index}>
                                <input  type='checkbox' style={{ margin: '0 10px', cursor: 'pointer'}}  value={head}/>
                                <span>{head}</span>
                            </li>
                        )
                    })
                }
                </ul>
                </DropdownButton>
                <Button  style={{ margin: '0 2px', backgroundColor: '#2eabeb', color: '#fff', border: 0}}>下载表格</Button>
                </div>
            </div>

        )
    }
}
class Paginate extends React.Component{
    constructor(props) {
        super(props);
        this.setState({

        });

    }
    render(){
        var tableData = this.props.tableData;
        var dataSize = this.props.dataSize;
        return(
            <div>
            <span style={{margin: '18px 0px 0px 0px', display: 'inline-block'}}>
                显示第{this.props.dataBegin}到第{this.props.dataEnd}条记录，总共{tableData.length}条记录
                <span style={this.props.dataEnd < 25 ? {display: 'none'} : {display: 'inline-block'}}>
                    ，每页显示
                    <DropdownButton id='pageSize-select' title={this.props.dataSize} dropup style={{ margin: '0 2px' }}>
                        <MenuItem onClick={this.props.onSelectPageSize } active={dataSize === 25}>25</MenuItem>
                        <MenuItem style={ tableData.length > 25 ? { display: 'block' } : { display: 'none' }} onClick={this.props.onSelectPageSize } active={dataSize === 50}>50</MenuItem>
                        <MenuItem style={ tableData.length > 50 ? { display: 'block' } : { display: 'none' }}  onClick={this.props.onSelectPageSize} active={dataSize === 100}>100</MenuItem>
                        <MenuItem style={tableData.length > 100 ? { display: 'block' } : { display: 'none' }} onClick={this.props.onSelectPageSize} active={dataSize === 1000}>1000</MenuItem>
                    </DropdownButton>
                    条记录
                </span>
            </span>
            <div style={{float:'right',marginBottom:'3px'}}>
            <ReactPaginate previousLabel={"<"}
                       nextLabel={">"}
                       breakLabel={<span>...</span>}
                       breakClassName={"break-me"}
                       pageNum={_.ceil(_.divide(_.size(tableData),dataSize))}
                       marginPagesDisplayed={2}
                       pageRangeDisplayed={5}
                       forceSelected={this.props.pageIndex}
                       pageLinkClassName={"pageLinkClassName"}
                       clickCallback={this.props.handlePageClick}
                       containerClassName={"pagination"}
                       subContainerClassName={"pages pagination"}
                       activeClassName={"active"} />
            </div>
        </div>
        )
    }
}
class InputWidget extends React.Component {
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
            this.props.triggerFunction(this.refs.inputWidget.value);
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
            this.props.triggerFunction(this.refs.inputWidget.value);
            this.hasSearch = true;
            clearInterval(this.timer);
        }
    }
    render() {
        return (
            <span style={{display: 'inline-block', position: 'relative'}}>
                <input
                    id='inputWidget'
                    ref='inputWidget'
                    onChange={this.handleChange.bind(this) }
                    placeholder={this.props.placeholder}
                    style={this.props.style ? this.props.style : { margin: '0 2px', height: 34, padding: '6px 12px', fontSize: 14, lineHeight: 1.42857143, color: '#555', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4 }}
                    />
                {
                    this.props.searchIcon ? <i className='icon-search-2' style={{ position: 'absolute', right: 10, top: '50%', marginTop: -10, color: '#bfbfbf' }}></i> : ''
                }

            </span>
        )
    }
}

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
     debugger
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
     debugger
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
