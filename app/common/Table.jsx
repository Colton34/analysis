import React from 'react';
import styles from './common.css';
import _ from 'lodash';

/**
 * 传入一个tableData 对象,包含表格头数据(ths)和单元格数据(tds)
 * 传入的参数为 tableData
 */
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
const Table = ({tableData}) => {
    
    return (
        <table  style={{border: '1px solid #d7d7d7', borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
                <tr style={{ backgroundColor: '#f4faee' }}>
                    {
                        tableData['ths'].map((th,index) => {
                            return (
                                <th key={index} className={styles['table-unit']}>{th}</th>
                            )
                        })
                    }
                </tr>
                {   
                    tableData['tds'].map((tdList,index) => {
                        return (
                            <tr key={'tr' + index}>
                                {
                                    tdList.map((td,index) => {
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
        </table>
    )
}

export default Table;