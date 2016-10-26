
import React from 'react';
import commonClassName from './common.css';
import _ from 'lodash';
import {Table as BootTable, Popover, OverlayTrigger} from 'react-bootstrap';
import {COLORS_MAP as colorsMap} from '../lib/constants';

//有的表头是不需要id的，因为没有数据与之对应
var headerStyle = {backgroundColor: colorsMap.C02}
var defaultSortId= '';
var defaultSortOrder = 'desc';

// 表格排序时的箭头样式
const SortDirection = ({sortInfo, id}) => {
    debugger;
    return (
        <span style={localStyle.sortDirection}>
            <div className='dropup' style={_.assign({}, { width: 8, height: '40%', cursor: 'pointer' }, sortInfo.id !== id ? { visibility: 'visible', color: '#dcdcdc' } : sortInfo.order === 'asc' ? { visibility: 'visible', color: '#333' } : { visibility: 'hidden' }) }>
                <span className='caret' style={{ width: '100%' }} ></span>
            </div>
            <div className='dropdown' style={_.assign({}, { width: 8, height: '40%', cursor: 'pointer' }, sortInfo.id !== id ? { visibility: 'visible', color: '#dcdcdc' } : sortInfo.order === 'desc' ? { visibility: 'visible', color: '#333' } : { visibility: 'hidden' }) }>
                <span className='caret' style={{ width: '100%' }}></span>
            </div>
        </span>
    )
}

class Table extends React.Component {
    constructor(props){
        super(props);
        this.columnStyles = {}; // 记录具体某一列传入的样式Object || Function，渲染td的时候用到。格式： {id: columnStyle}
        this.dataFormats = {};  // 记录某一列的数据格式化函数， 格式： {id: dataFormatFunction}
    }

    handleSort(columnId) {
        this.props.handleSort(columnId);
    }

    emptyFn() {

    }

    render() {
        var headSeq = [];
        var {tableHeaders, tableData, sortInfo, hover, headerStyle, style, bordered, options} = this.props;
        bordered = (_.isUndefined(bordered)) ? true : bordered;
        debugger;
        return (
            <div style={_.assign({}, {position: 'relative'}, style ? style : {})}>
                <BootTable responsive bordered={bordered} hover={hover} style={_.assign({}, {marginBottom: 0, borderCollapse:'collapse'}, bordered ? {}:{border:'none'})}>
                    <thead>
                    {
                        _.map(tableHeaders, (headerList, trindex) => {
                            return (
                                <tr key={'thead-tr-' + trindex} style={_.assign({},headerStyle ? headerStyle : { backgroundColor: colorsMap.C02}, bordered ? {} : {border: 'none'})}>
                                    {
                                        _.map(headerList, (header, thindex) => {
                                            if (header.id !== undefined) {
                                                headSeq.push(header.id);
                                            }
                                            if (header.columnStyle !== undefined && this.columnStyles[header.id] === undefined) {
                                                this.columnStyles[header.id] = header.columnStyle;
                                            }
                                            if (header.dataFormat !== undefined && this.dataFormats[header.id] === undefined) {
                                                this.dataFormats[header.id] = header.dataFormat;
                                            }
                                            var headerCss = {};
                                            if (header.headerStyle !== undefined) {
                                                if (_.isFunction(header.headerStyle)) {
                                                    headerCss = header.headerStyle(header.id, header);
                                                } else {
                                                    headerCss = header.headerStyle;
                                                }
                                                headerCss = headerCss === undefined ? {} : headerCss;
                                            }

                                            return (
                                                <th key={'thead-th-' + thindex}
                                                    className={commonClassName['table-unit']}
                                                    rowSpan={header.rowSpan ? header.rowSpan : 1}
                                                    colSpan={header.colSpan ? header.colSpan : 1}
                                                    style={_.assign({}, { padding:'0px 30px', borderColor: colorsMap.C04, position: 'relative', whiteSpace: 'nowrap', fontWeight: 'normal'}, headerCss, {cursor: 'pointer'}, bordered ? {}:{border: 'none'})}
                                                    onClick={(header.id) ? this.handleSort.bind(this, header.id) : this.emptyFn.bind(this)}
                                                    >
                                                    <span style={header.tipContent !== undefined ? {marginRight: 5} : {}}>{header.name}</span>
                                                    {header.tipContent !== undefined ? (
                                                        <OverlayTrigger
                                                            placement={'bottom'}
                                                            trigger={['hover', 'focus']}
                                                            overlay={popoverFactory({title: '', content: header.tipContent})}
                                                            >
                                                            <div style={{display: 'inline-block', width: 16, height: 16, lineHeight: '16px', borderRadius: '50%', textAlign: 'center', color: '#fff', backgroundColor: colorsMap.C08}}>
                                                                <i className='icon-help-1'></i>
                                                            </div>
                                                        </OverlayTrigger> ): ''}
                                                    {(header.id) ? (<SortDirection sortInfo={sortInfo} id={header.id}/>) : ''}
                                                </th>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                    </thead>
                    <tbody>
                    {
                        _.map(tableData, (rowData, trindex) => {
                            return (
                                <tr key={'tbody-tr-' + trindex} style={_.assign({}, bordered ? {} : {border: 'none'})}>
                                    {
                                        _.map(headSeq, (id, tdindex) => {
                                            var tdStyle = {};
                                            if (this.columnStyles[id]) {
                                                if (_.isFunction(this.columnStyles[id])) {
                                                    tdStyle = this.columnStyles[id](rowData[id], rowData, trindex, tdindex, id, tableData);
                                                } else {
                                                    tdStyle = this.columnStyles[id];
                                                }
                                                tdStyle = tdStyle === undefined ? {} : tdStyle;
                                            }

                                            var dataFormat = rowData[id]; //dataFormat有可能是一个对象，若是，则数值应该从value属性获取；
                                            if (dataFormat === undefined)return(<td style={{textAlign:'center',minWidth: 100, borderColor: colorsMap.C04, whiteSpace: 'nowrap'}}>---</td>);
                                            if (this.dataFormats[id] !== undefined) {
                                                dataFormat = this.dataFormats[id](dataFormat, rowData);
                                            } else {
                                                dataFormat = _.isObject(dataFormat) ? dataFormat.value : dataFormat;
                                            }

                                            var hasOverlayProps = options && options.overlayProps;

                                            return (
                                                <td key={'tbody-td-' + tdindex}
                                                    className={commonClassName['table-unit']}
                                                    colSpan={rowData[id].colSpan ? rowData[id].colSpan : 1}
                                                    rowSpan={rowData[id].rowSpan ? rowData[id].rowSpan : 1}
                                                    style={_.assign({}, {padding:'0px 30px', textAlign:'center', borderColor: colorsMap.C04, whiteSpace: 'nowrap'}, tdStyle, bordered ? {}:{border: 'none'}) }
                                                    >
                                                    {
                                                        rowData[id]['overlayData'] !== undefined ? (
                                                            <OverlayTrigger
                                                                placement={hasOverlayProps && options.overlayProps.placement ? options.overlayProps.placement : 'right'}
                                                                trigger={hasOverlayProps &&  options.overlayProps.trigger? options.overlayProps.trigger : ['hover', 'focus']}
                                                                overlay={popoverFactory({title: rowData[id]['overlayData'].title ? rowData[id]['overlayData'].title : '', content: rowData[id]['overlayData'].content ? rowData[id]['overlayData'].content : ''})}
                                                                >
                                                                <span style={{cursor: 'pointer'}}>{dataFormat}</span>
                                                            </OverlayTrigger>
                                                        ) : dataFormat
                                                    }
                                                </td>
                                            )
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
}

export default Table;


let localStyle = {
    sortDirection: { width: 10, height: 20, position: 'absolute', top: '50%', right: '5px', marginTop: -14}
}
