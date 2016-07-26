/*
* @Author: HellMagic
* @Date:   2016-05-30 18:32:05
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 16:26:27
*/

'use strict';


import {
    PAPER_ORIGIN,
    ADD_PAPER_INFO, ADD_PAPER_INFO_SUCCESS, SUBTRACT_PAPER_INFO,
    CHECK_ALL_QUESTION, CHECK_ONE_QUESTION, SET_PAPER_SQM,
    SET_MERGED_SQM, CHANGE_QUESTION_NAME, SET_GROUP_MAP,
    SET_PAGE_INDEX, SAVE_CURRENT_SUBJECT, SET_ANALYSIS_NAME,
    SET_CREATE_STATUS, EDIT_SUBJECT, DELE_SUBJECT,
    CHANGE_CURRENT_SUBJECT_NAME, DISCARD_CURRENT_SUBJECT,
    UPDATE_SUBJECT_SQM, SET_CURSUBJECT_SQM} from '../../lib/constants';
import {fetchPaper} from '../../api/exam';
import {initParams} from '../../lib/util';

//在选择的地方知道是不是custom的，告诉到这里。这里再告诉给请求API的地方，然后那个地方再带着query去告诉server api
export function addPaperInfoAction(papersCache, paperInfo) {
    if (paperInfo.origin === PAPER_ORIGIN.upload) {
        return { type: ADD_PAPER_INFO_SUCCESS, res: paperInfo.sqm, paperInfo: _.omit(paperInfo,'sqm')}
    } else {
        var targetPaperId = paperInfo.paperId;
        var params = initParams({}, {}, { 'request': window.request, pid: targetPaperId, examId: paperInfo.examId, isFromCustom: paperInfo.isFromCustom });
        return papersCache[targetPaperId] ?
            { type: ADD_PAPER_INFO_SUCCESS, res: papersCache[targetPaperId], isCached: true, paperInfo: paperInfo } :
            { type: ADD_PAPER_INFO, promise: fetchPaper(params), paperInfo: paperInfo };
    }
}

export function subtractPaperInfoAction(pid) {
    return {
        type: SUBTRACT_PAPER_INFO,
        pid: pid
    }
}

export function checkAllQuestionAction(paperId, selected)  {
    return {
        type: CHECK_ALL_QUESTION,
        pid: paperId,
        selected: selected
    }
}

export function checkOneQuestionAction(paperId, questionName, selected){
    return {
        type: CHECK_ONE_QUESTION,
        pid: paperId,
        qName: questionName,
        selected: selected
    }
}

export function setPaperSqmAction(sqmList) {
    return {
        type: SET_PAPER_SQM,
        sqmList: sqmList
    }
}

export function setMergedSqmAction(mergedSqm, sqmMap, mergeType){
    return {
        type: SET_MERGED_SQM,
        mergedSqm: mergedSqm,
        sqmMap: sqmMap,
        mergeType: mergeType
    }
}

export function changeQuesitonNameAction(oldName, newName){
    return {
        type: CHANGE_QUESTION_NAME,
        oldName: oldName,
        newName: newName
    }
}

export function setGroupMapAction(groupMap) {
    return {
        type: SET_GROUP_MAP,
        groupMap: groupMap
    }
}

export function setPageIndexAction(direction) {
    return {
        type: SET_PAGE_INDEX,
        direction: direction
    }
}

export function saveCurrentSubjectAction() {
    return {
        type: SAVE_CURRENT_SUBJECT
    }
}

export function setAnalysisNameAction(name) {
    return {
        type: SET_ANALYSIS_NAME,
        name: name
    }
}

export function setCreateStatusAction() {
    return {
        type: SET_CREATE_STATUS
    }
}

export function editSubjectAction(subjectName) {
    return {
        type: EDIT_SUBJECT,
        subjectName: subjectName
    }
}

export function delSubjectAction(subjectName) {
    return {
        type: DELE_SUBJECT,
        subjectName: subjectName
    }
}

export function changeCurrentSubjectNameAction (subjectName) {
    return {
        type: CHANGE_CURRENT_SUBJECT_NAME,
        subjectName: subjectName
    }
}

export function discardCurrentSubjectAction() {
    return {
        type: DISCARD_CURRENT_SUBJECT
    }
}

export function updateSubjectSqmAction(subjectName, newSqm) {
    return {
        type: UPDATE_SUBJECT_SQM,
        subjectName: subjectName,
        newSqm: newSqm
    }
}

export function setCurSubjectSqmAction(newSqm) {
    return {
        type: SET_CURSUBJECT_SQM,
        newSqm: newSqm
    }
}
