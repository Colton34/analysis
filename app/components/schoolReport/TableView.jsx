import React from 'react';
import Table from '../../common/Table.jsx';


let localStyle = {
    tableShowAllBtn: { color: '#333', textDecoration: 'none', width: '100%', height: 30, display: 'inline-block', textAlign: 'center', backgroundColor: '#f2f2f2', lineHeight: '30px', marginTop: 10 }
}
/**
 * props:
 * tableData: 需要在table里渲染的全部数据,
 * TableComponent: 要使用的table组件；
 * reserveRows: 截取数据时保留的行数;(默认保留5行)
 * 
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
        }, ()=> {
            if (!this.state.showAll){
                var top = $(document).scrollTop();
                $(document).scrollTop(top - 400);    
            }
        })
    }
    render() {
        var TableComponent = this.props.TableComponent ? this.props.TableComponent : Table;
        return (
            <div>
                <div style={{ width: '100%', overflowX: 'scroll' }}>
                    <TableComponent  {...this.props} tableData={this.state.showData} />
                </div>
                {
                    this.state.showAllEnable ?
                        (this.state.showAll ?
                            <a  onClick={this.onClickShowAllBtn.bind(this) } href="javascript: void(0)" style={localStyle.tableShowAllBtn}>点击收缩表格数据 <i className='icon-up-open-2'></i></a> :
                            <a  onClick={this.onClickShowAllBtn.bind(this) } href="javascript: void(0)" style={localStyle.tableShowAllBtn}>点击查看更多数据 <i className='icon-down-open-2'></i> </a>
                        ) : ''
                }
            </div>
        )
    }
}

export default TableView;