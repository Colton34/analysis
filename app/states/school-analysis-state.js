/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 11:23:40
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    totalScoreTrend: List([]),
    totalScoreLevel: List([]),
    subjectLevel: Map({}),
    classExamReport: List([]),
    subjectExamReport: List([]),
    studentsLevel: List([]),
    studentsReport: List([])
});

export default InitialState;
