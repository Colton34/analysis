/*
* @Author: HellMagic
* @Date:   2016-08-02 16:36:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:16:18
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfo: Map({}),
    examStudentsInfo: List([]),
    examPapersInfo: Map({}),
    examClassesInfo: Map({}),
    studentsGroupByClass: Map({}),
    allStudentsPaperMap: Map({}),
    headers: List([])
});

export default InitialState;
