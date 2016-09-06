import _ from 'lodash';
import React from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

const Card = ({num, desc, style, numStyle}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 366,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({fontSize: 32, marginTop: 15}, numStyle ? numStyle : {})}>{num}</p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}

export default function InfoCards ({currentPaperInfo, currentPaperStudentsInfo}) {

    debugger;
    return (
        <div style={{marginTop: 30}}>
            {
/*

           <Card style={{marginRight: 20}} num={headerData.maxScore} desc={'班级总分最高分'} numStyle={{color: colorsMap.B04}}/>
           <Card style={{marginRight: 20}} num={headerData.minScore} desc={'班级总分最低分'} numStyle={{color: colorsMap.B08}}/>
           <Card num={headerData.avgScore} desc={'班级总分平均分'} numStyle={{color: colorsMap.B03}}/>

 */

            }
        </div>
    )
}

var localStyle = {
    card: {
        display: 'inline-block', width: 366, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    }
}

function getHeaderData(classStudents) {
    var avgScore = _.round(_.mean(_.map(classStudents, (obj) => obj.score)), 2);
    var maxScore = _.last(classStudents).score;
    var minScore = _.first(classStudents).score;
    return {
        maxScore: maxScore,
        minScore: minScore,
        avgScore: avgScore
    }
}
