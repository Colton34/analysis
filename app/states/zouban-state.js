/*
* @Author: HellMagic
* @Date:   2016-10-15 11:34:01
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 15:52:28
*/

'use strict';

import Immutable, {Record, List, Map} from 'immutable';

const InitialState = Record({
    haveInit: false,

    zoubanExamInfo: Map({}),
    zoubanExamStudentsInfo: List([]),
    zoubanLessonStudentsInfo: Map({}),
    zuobanLessonQuestionInfo: Map({})
});

export default InitialState;
