/*
* @Author: HellMagic
* @Date:   2016-04-11 19:19:03
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 19:42:48
*/

'use strict';

import _ from 'lodash';
import {Record} from 'immutable';

import InitialState from '../../states/global-app-state';

//引入和自己的state数据相关的常量
import {
    INIT_USER_ME_SUCCESS
} from '../../lib/constants';

var initialState = new InitialState;

export default function reducer(state, action) {
//服务端拿到的数据也不是InitialState类型的，所以当拿到js raw data后被冲掉了
//注意这里对Record进行merge操作的时候，merge的对象一定也要是Record实例，而不能是js对象，所以这里要将从服务端获取的js数据封装一下
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case INIT_USER_ME_SUCCESS:

// console.log('======================= action.res.data = ', action.res.data);

            return state.set('user', action.res.data).set('haveInit', true);
// console.log('===================== user = ', nextState.user.name);
            // return nextState;
    }
    return state;
}
