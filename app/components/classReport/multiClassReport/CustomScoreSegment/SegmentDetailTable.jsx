import React from 'react';
import ReactHighcharts from 'react-highcharts';
import commonClass from '../../../../common/common.css';

import EnhanceTable from '../../../../common/EnhanceTable';
import TableView from '../../../../common/TableView';
/**
 * tableRenderData: 包含tableHeaders & 
 */
export default function SegmentDetailTable({tableHeaders, tableData}) {
    var tableHeaders = [tableHeaders];
    return (
        <div>
            <div className={commonClass['sub-title']} style={{margin: '27px 0 20px 0'}}>
                各分数段详细人数
            </div>
            <TableView id='segmentDetailTable' tableHeaders={tableHeaders} tableData={tableData} TableComponent = {EnhanceTable} options={{canDownload: true}}/>
        </div>
    )
}