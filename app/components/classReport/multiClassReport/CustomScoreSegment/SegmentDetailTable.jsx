import React from 'react';
import ReactHighcharts from 'react-highcharts';
import commonClass from '../../../../common/common.css';

import EnhanceTable from '../../../../common/EnhanceTable';
import TableView from '../../../../common/TableView';
/**
 * tableRenderData: 包含tableHeaders & 
 */
export default function SegmentDetailChart({tableHeaders, tableData}) {
    return (
        <div>
            <div className={commonClass['sub-title']} style={{margin: '27px 0 20px 0'}}>
                各分数段详细人数
            </div>
            <TableView id='segmentDetailChart' tableHeaders={tableHeaders} tableData={tableData} TableComponent = {EnhanceTable} options={{canDownload: true}}/>
        </div>
    )
}