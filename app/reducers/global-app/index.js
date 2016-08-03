/*
* @Author: HellMagic
* @Date:   2016-04-11 19:19:03
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 14:39:20
*/

'use strict';

import _ from 'lodash';
import {Record} from 'immutable';

import InitialState from '../../states/global-app-state';

import {
    LOADING_START,
    LOADING_DONE,

    THROW_ERROR,
    HIDE_ERROR,

    INIT_USER_ME_SUCCESS,
    ALTER_COMMENT_DIALOG_STATUS,
    SHOW_DIALOG,
    HIDE_DIALOG
} from '../../lib/constants';

var initialState = new InitialState;

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case THROW_ERROR:
            console.log('THROW_ERROR: ', action.error);
            return state.set('ifError', true);
        case HIDE_ERROR:
            return state.set('ifError', false);
        case LOADING_START:
            console.log('5 -- 关键，在这之前不能进入到content veiw里');
            return state.set('isLoading', true);
        case LOADING_DONE:
            console.log('yes, loading done');
            debugger;
            return state.set('isLoading', false);

        case INIT_USER_ME_SUCCESS:
            return state.set('user', action.res.data).set('haveInit', true);
        case ALTER_COMMENT_DIALOG_STATUS:
            var needShow = state.get('dialog').show;
            return state.set('dialog', Object.assign({},state.get('dialog'), {show: !needShow}, _.omit(action, 'type')));
        case SHOW_DIALOG:
            var needShow = state.get('dialog').show;
            return state.set('dialog', Object.assign({},state.get('dialog'), {show: !needShow}, _.omit(action, 'type')));

        case HIDE_DIALOG:
            return state.set('dialog', Object.assign({},state.get('dialog'), {show: false}));

    }
    return state;
}
