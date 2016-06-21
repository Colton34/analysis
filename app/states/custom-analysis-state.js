/*
* @Author: HellMagic
* @Date:   2016-05-30 19:01:29
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 11:42:30
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    papersInfo: Map({}),
    papersCache: Map({}),
    
    currentSubject: Map({ src: Map({}), groupMap: {}, name: '', SQM: Map({}), grade: ''}),
    pageIndex: 0,        //当前页面索引0,1,2,3,4
    status: '',          //页面状态'create' or ''
    resultSet: Map({}),       //已经编辑完成的科目,内部是 subjectName : subjectTrace
    analysisName: ''
});

export default InitialState;
