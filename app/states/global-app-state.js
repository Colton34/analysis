/*
* @Author: HellMagic
* @Date:   2016-04-11 19:12:00
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-04 16:47:22
*/

'use strict';

import Immutable, {Map, Record} from 'immutable';

const InitialState = Record({
    ifError: false,
    isLoading: true,
    haveInit: false,
    user: Map({}),//Note：前端需要知道user的基本信息，而且还需要匹配权限
    dialog: {//TODO：是否有用？？？
        show: false,
        title: '',
        content: '',
        onHide: '',
        shapeStyle:'',
        okButton: true,
        okLabel: '确认'
    }
});

export default InitialState;
