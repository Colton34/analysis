import React from 'react';
import styles from './common.css';
import _ from 'lodash';
import {Table as BootTable, Popover, OverlayTrigger} from 'react-bootstrap';
import {COLORS_MAP as colorsMap} from '../lib/constants';
import Tip from './Tip';
/**
 * 传入一个tableData 对象,包含表格头数据(ths)和单元格数据(tds)
 * 传入的参数为 tableData
 */


const popoverFactory = ({title, content}) => {
    return (
        <Popover id='tipPopover' title={title}>
            {content}
        </Popover>
    )
}
/**
 * props:
 * tableData: 渲染表格的数据
 * tipConfig: 有些表头需要添加一个问号，鼠标悬停时弹出提示。结构是{表头名:{content: '提示内容'}}
 * colorCallback: 颜色回调函数，有时候需要根据数值调整显示的颜色
 */
const Table = ({tableData, tipConfig, colorCallback}) => {
    var tableHeaderData = tableData[0];
    var tableBodyData = _.slice(tableData, 1);
    var tipNames = tipConfig ? _.keys(tipConfig) : [];
    return (
        
        <BootTable bordered  hover responsive style={{marginBottom: 0}}>
            <tbody>
                <tr style={{ backgroundColor: '#fafafa'}}>
                    {
                        _.map(tableData[0], (th,index) => {
                            return (
                                <th key={index} className={styles['table-unit']} style={{minWidth: 100, borderColor: colorsMap.C04, fontWeight: 'normal', whiteSpace: 'nowrap'}}>
                                {
                                    tipConfig && tipNames.indexOf(th) !== -1 ? (
                                        <div>
                                            <span style={{marginRight: 5}}>{th}</span>
                                            <OverlayTrigger
                                                placement={'bottom'}
                                                trigger={['hover', 'focus']}
                                                overlay={popoverFactory({title: '', content: tipConfig[th].content})}
                                                >
                                                <div style={{ display: 'inline-block', width: 16, height: 16, lineHeight: '16px', borderRadius: '50%', textAlign: 'center', color: '#fff', backgroundColor: colorsMap.C08 }}>
                                                    <i className='icon-help-1'></i>
                                                </div>
                                            </OverlayTrigger>
                                        </div>
                                    ) : th
                                 }
                                </th>
                            )
                        })
                    }
                </tr>
                {
                    _.map(tableBodyData, (tdList,index) => {
                        return (
                            <tr key={'tr' + index}>
                                {
                                    _.map(tdList, (td,index) => {
                                        return (
                                            <td key={'td' + index} className={styles['table-unit']} style={_.assign({}, {minWidth: 100, borderColor: colorsMap.C04, whiteSpace:'nowrap'}, colorCallback ? {color: colorCallback(td)} : {})}>
                                                {td}
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
    )
}

export default Table;

/*
Mock Data:
let tableData_example = {
    ths: [
        '班级','语文','数学','英语'
    ],
    tds: [
        ['全部',100, 120, 130],
        ['一班',100, 120, 130],
        ['二班',100, 120, 130],
        ['三班',100, 120, 130]
    ]
}
*/
