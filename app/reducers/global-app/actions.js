/*
* @Author: HellMagic
* @Date:   2016-04-11 19:41:24
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 11:22:39
*/

'use strict';

import {
    INIT_USER_ME,
    LOADING_START,
    LOADING_DONE,
    THROW_ERROR,
    ALTER_COMMENT_DIALOG_STATUS,
    SHOW_DIALOG,
    HIDE_DIALOG
} from '../../lib/constants';

import {fetchMe} from '../../api/user';

export function initUser(params) {
    return {
        type: INIT_USER_ME,
        promise: fetchMe(params)
    }
}

export function startLoadingAction() {
    return {
        type: LOADING_START
    }
}

export function stopLoadingAction() {
    return {
        type: LOADING_DONE
    }
}

export function throwErrorAction() {
    return {
        type: THROW_ERROR
    }
}


//=================  确认，清理 =======================
export function alterCommentDialogStatus(dialogProps) {
    return Object.assign({type: ALTER_COMMENT_DIALOG_STATUS}, dialogProps);
}

export function showDialog(dialogProps) {
    return Object.assign({type: SHOW_DIALOG}, dialogProps);
}

export function hideDialog() {
    return {
        type: HIDE_DIALOG
    }
}
