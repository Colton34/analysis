/*
* @Author: HellMagic
* @Date:   2016-04-11 19:19:03
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-14 11:08:08
*/

'use strict';

import _ from 'lodash';
import {Record, Map} from 'immutable';

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
            return state.set('isLoading', true);
        case LOADING_DONE:
            return state.set('isLoading', false);

        case INIT_USER_ME_SUCCESS:
            return state.set('user', Map(action.res.data)).set('haveInit', true);
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
