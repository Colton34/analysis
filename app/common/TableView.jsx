import React from 'react';
import Table from './Table.jsx';
import {COLORS_MAP as colorsMap} from '../lib/constants';
import classNames from 'classnames';

let localStyle = {
    tableShowAllBtn: { 
        color: colorsMap.C12, textDecoration: 'none', width: '100%', height: 40, display: 'inline-block', textAlign: 'center', backgroundColor: '#fff', lineHeight: '40px',
        border: '1px solid ' + colorsMap.C04, borderTop: 0
    }
}
/**
 * props:
 * tableData: 需要在table里渲染的全部数据,
 * TableComponent: 要使用的table组件；
 * reserveRows: 截取数据时保留的行数;(默认保留5行)
 * tipConfig: 表格表头可能存在的注释内容
 */
class TableView extends React.Component {
    //static reserveRows = this.props.reserveRows || this.props.reserveRows <= 0 ? this.props.reserveRows : 5;
     
    constructor(props) {
        super(props);
        var {tableData, reserveRows} = this.props;
        reserveRows = reserveRows || reserveRows <= 0 ? reserveRows : 5;
        this.state ={
            showAllEnable: tableData.length > reserveRows ? true : false,
            showAll: false,
            showData: tableData.length > reserveRows ? tableData.slice(0,reserveRows) : tableData 
        }
    }
    componentWillReceiveProps(nextProps){
        var  {tableData, reserveRows} = nextProps;
        reserveRows = reserveRows || reserveRows <= 0 ? reserveRows : 5;
        this.setState({
            showAllEnable: tableData.length > reserveRows? true :  false,
            showData: this.state.showAll ? tableData : tableData.slice(0,reserveRows)
        })        
    }
    onClickShowAllBtn(event) {
        var {reserveRows} = this.props;
        reserveRows = reserveRows || reserveRows <= 0 ? reserveRows : 5;
        this.setState({
            showAll: !this.state.showAll,
            showData: !this.state.showAll ? this.props.tableData : this.props.tableData.slice(0,reserveRows)
        })
    }
    // 这个方法将全部数据都展示，否则下载的时候只能下载到收缩时的数据；
    onDownloadTable() {
        var dtd = $.Deferred();
        this.setState({
            showAll: true,
            showData: this.props.tableData
        }, () => {
            dtd.resolve()
        })
        return dtd.promise();
    }
    render() {
        var TableComponent = this.props.TableComponent ? this.props.TableComponent : Table;
        var {style} = this.props;
        var {showAllEnable, showAll} = this.state;
        return (
            <div style={_.assign({}, style ? style : {})}>
                <TableComponent  {...this.props} tableData={this.state.showData}  onDownloadTable={this.onDownloadTable.bind(this)}/>
                {
                    showAllEnable ?
                        <a  onClick={this.onClickShowAllBtn.bind(this) } href="javascript: void(0)" style={localStyle.tableShowAllBtn}>
                            {showAll ? '点击收缩表格数据' : '点击查看更多数据'} 
                            <i style={{color: colorsMap.B03}} className={classNames('animated', 'icon-down-open-2', {'caret-list-down': showAll, 'caret-list-up': !showAll})} style={{display: 'inline-block', color: colorsMap.B03}}></i>
                        </a> : ''
                }
            </div>
        )
    }
}

export default TableView;