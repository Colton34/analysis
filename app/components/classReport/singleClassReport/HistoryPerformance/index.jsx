//历史表现比较。注意：这个还没有考虑好！！！

import React, { PropTypes } from 'react';
import commonClass from '../../../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../../common/DropdownList';
import StandardScoreContrast from './StandardScoreContrast';
import RankRateContrast from './RankRateContrast';

/**----------------------------mock data----------------------------------------------- */
var examList = [{value:'放假效果抽检'}, {value:'勇能考试'}, {value:'八十八所中学大联考'}]
/**----------------------------mock data end----------------------------------------------- */
export default function HistoryPerformance() {

    return (
        <div id='historyPerformance' className={commonClass['section']} style={{position: 'relative'}}>
            <div style={{marginBottom: 10}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>历史表现比较</span>
                <span className={commonClass['title-desc']}>通过相同性质的考试比较，可以发现各学科标准分与排名率的变化</span>
            </div>
            <DropdownList list={examList} style={{position: 'absolute', top: 30, right: 30, zIndex: 1,borderRadius:2}}/>
            <StandardScoreContrast/>
            <RankRateContrast/>
        </div>
    )
}
