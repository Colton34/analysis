import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';
import {Link} from 'react-router';
/*

    return {
        top: _.reverse(_.takeRight(examScoreArr, 6)),
        low: _.reverse(_.take(examScoreArr, 6))
    }

 */

const ScoreRank = ({data, examid, grade}) => {
    var flagFirstColor =  {color: '#FF0033'};
    var flagSecondColor = {color: '#54ba54'};
    var flagThirdColor =  {color: '#ce9dff'};
    var tops = _.map(data.top, function(obj, index) {
        var flagColor = {};
        if(index === 0) {flagColor.first = true};
        if(index === 1) {flagColor.second = true};
        if(index === 2) {flagColor.third = true};

        var result = ((flagColor.first && flagFirstColor) || (flagColor.second && flagSecondColor) || (flagColor.third && flagThirdColor));

        return (
            <div key={index} style={[styles.container, result, styles.common.radius, {marginBottom: 8}]}>
                <div>{obj.name}</div>
                <div>{obj.class}班</div>
                <div>{obj.score}分</div>
            </div>
        )
    });

    var lows = _.map(data.low, function(obj, index) {
        return (
            <div key={index} style={[styles.container, styles.common.radius, {marginBottom: 2}]}>
                <div>{obj.name}</div>
                <div>{obj.score}分</div>
            </div>
        )
    });
    return (
        <div className={dashboardStyle.card}>
            <div className={dashboardStyle['card-title']}>分数排行榜</div>
            <div style={{flexGrow: 1, display: 'flex', marginTop: 20}}>
                <div style={[styles.box,{marginLeft: 5}]}>
                    <p style={{textAlign: 'center', marginBottom: 20}}>最高分排行榜top6</p>
                    {tops}
                </div>
            </div>
            <Link to={{ pathname: '/rank/report', query: { examid: examid, grade: grade } }} className={dashboardStyle['detail-btn']}>
                查看详情
            </Link>
        </div>
    )

}

export default Radium(ScoreRank);


const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, display: 'flex', flexDirection: 'column'},
    box: {
        flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around'
    },
    container: {
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-around'
    }
};
