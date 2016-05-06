/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 17:52:14
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,
    totalScoreTrend: List([]),
    totalScoreLevel: List([]),
    subjectLevel: Map({}),
    classExamReport: List([]),
    subjectExamReport: List([]),
    studentsLevel: List([]),
    studentsReport: List([])
});

export default InitialState;
