/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-09 14:22:05
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,
    examHeader: Map({}),
    totalScoreTrend: List([]),
    totalScoreLevel: List([
        {
            score: 520,
            rate: 15,
            num: 100
        },
        {
            score: 480,
            rate: 35,
            num: 360
        },
        {
            score: 360,
            rate: 50,
            num: 890
        }
    ]),
    subjectLevel: Map({}),
    classExamReport: List([]),
    subjectExamReport: List([]),
    studentsLevel: List([]),
    studentsReport: List([])
});

export default InitialState;
