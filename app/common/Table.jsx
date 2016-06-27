import React from 'react';
import styles from './common.css';
import _ from 'lodash';
import {Table as BootTable} from 'react-bootstrap';
/**
 * 传入一个tableData 对象,包含表格头数据(ths)和单元格数据(tds)
 * 传入的参数为 tableData
 */

const Table = ({tableData}) => {
    var tableHeaderData = tableData[0];
    var tableBodyData = _.slice(tableData, 1);
    return (
        <BootTable bordered  hover responsive >
            <tbody>
                <tr style={{ backgroundColor: '#fafafa' }}>
                    {
                        _.map(tableData[0], (th,index) => {
                            return (
                                <th key={index} className={styles['table-unit']} dangerouslySetInnerHTML={{__html:th}}></th>
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
                                            <td key={'td' + index}className={styles['table-unit']}>
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
