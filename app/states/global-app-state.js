/*
* @Author: HellMagic
* @Date:   2016-04-11 19:12:00
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 09:58:52
*/

'use strict';

import Immutable, {Record} from 'immutable';

const InitialState = Record({

    haveInit: false,
    user: {},//Note：前端需要知道user的基本信息，而且还需要匹配权限
    isLoading: false,
    dialog: {
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
