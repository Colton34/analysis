import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../../lib/constants';
// components
import ScoreLevelBySubject from './ScoreLevelBySubject';
import ScoreLevelBySchool from './ScoreLevelBySchool';

export default class ScoreLevel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //1. Dialog中的levelFactors是百分制，但是表格中的显示是小数制（计算的时候走levelFactors，所以要除以100）
            //2. n个刻度值，代表了(n-1)个难度档次（区间），所以其实有(buffers.length - 1个难度档次，因此应该遍历buffers.length - 1)
            levelPercentages: [0, 60, 70, 85, 100]
        }
    }

    updateLevelPercentages(newLevelPercentages) {
        this.setState({
            levelPercentages: newLevelPercentages
        })
    }

    render() {
        var {levelPercentages} = this.state;
        var {reportDS} = this.props;

        return (
            <div>
                <ScoreLevelBySubject levelPercentages={levelPercentages} reportDS={reportDS}/>
                <ScoreLevelBySchool levelPercentages={levelPercentages} reportDS={reportDS}/>
            </div>
        )
    }
}