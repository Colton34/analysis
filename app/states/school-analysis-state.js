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
    totalScoreLevel: List([]),
    subjectLevel: Map({}),
    classExamReport: List([]),
    subjectExamReport: List([]),
    studentsLevel: List([]),
    studentsReport: List([])
});

export default InitialState;
