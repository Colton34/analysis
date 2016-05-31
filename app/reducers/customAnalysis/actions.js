/*
* @Author: HellMagic
* @Date:   2016-05-30 18:32:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 13:58:14
*/

'use strict';

import {ADD_PAPER_INFO, ADD_PAPER_INFO_SUCCESS, SUBTRACT_PAPER_INFO} from '../../lib/constants';
import {fetchPaper} from '../../api/exam';
import {initParams} from '../../lib/util';

export function addPaperInfoAction(papersCache, targetPaperId) {
    var params = initParams({}, {}, { 'request': window.request, pid: targetPaperId });
    return papersCache[targetPaperId] ? { type: ADD_PAPER_INFO_SUCCESS, res: papersCache[targetPaperId], isCached: true } : { type: ADD_PAPER_INFO, promise: fetchPaper(params) };
}

export function subtractPaperInfoAction(pid) {
    return {
        type: SUBTRACT_PAPER_INFO,
        pid: pid
    }
}

