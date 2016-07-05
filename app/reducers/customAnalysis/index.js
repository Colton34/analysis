/*
* @Author: HellMagic
* @Date:   2016-05-30 18:32:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 13:42:13
*/

'use strict';

import _ from 'lodash';

import InitialState from '../../states/custom-analysis-state';
import {Map} from 'immutable';

var initialState = new InitialState;

import {
    PAPER_ORIGIN,
    ADD_PAPER_INFO_SUCCESS,
    SUBTRACT_PAPER_INFO,
    CHECK_ALL_QUESTION,
    CHECK_ONE_QUESTION,
    SET_PAPER_SQM,
    SET_MERGED_SQM,
    CHANGE_QUESTION_NAME,
    SET_GROUP_MAP,
    NEXT_PAGE,
    PREV_PAGE,
    SAVE_CURRENT_SUBJECT,
    SET_ANALYSIS_NAME,
    SET_CREATE_STATUS,
    EDIT_SUBJECT,
    DELE_SUBJECT,
    SET_PAGE_INDEX,
    CHANGE_CURRENT_SUBJECT_NAME,
    DISCARD_CURRENT_SUBJECT,
    UPDATE_SUBJECT_SQM,
    SET_CURSUBJECT_SQM
} from '../../lib/constants';

export default function reducer(state, action) {
    if(_.isUndefined(state)) return initialState;
    if(!(state instanceof InitialState)) return initialState.merge(state);

    switch(action.type) {
        case ADD_PAPER_INFO_SUCCESS:
            //如果是cached的，那么只更新paperInfo，如果不是cached的那么更新paperCache和paperInfo。注意：pid是ObjectId，id是paperId
            // var nextState = state.setIn(['papersInfo', action.res.pid], action.res);
            // if(!action.isCached) nextState = nextState.setIn(['papersCache', action.res.pid], action.res);
            
            var nextState = state;
            if(!state.getIn(['currentSubject','src', action.res.id])){
                if (state.getIn(['currentSubject', 'grade']) === '') {
                    nextState = state.setIn(['currentSubject', 'grade'], action.paperInfo.grade);
                }
                nextState = nextState.setIn(['currentSubject','src', action.res.id + ''], Map(_.assign({}, {oriSQM: Map(action.res)}, action.paperInfo, {SQM: {}})));
            }
            if(!action.isCached && action.paperInfo.origin === PAPER_ORIGIN.system) nextState = nextState.setIn(['papersCache', action.res.id], action.res);
            return nextState;
        case SUBTRACT_PAPER_INFO:
            var subjectName = state.getIn(['currentSubject', 'name']);
            var nextState = state.setIn(['currentSubject','src'], state.getIn(['currentSubject','src']).delete(action.pid));
            if (nextState.getIn(['currentSubject','src']).size === 0) {
                nextState = nextState.setIn(['currentSubject', 'grade'], '');
                nextState = nextState.set('resultSet', nextState.get('resultSet').delete(subjectName)); //如果是再编辑的装填，则resultSet里会有个副本，删除掉该副本
            }
            return nextState;
        case CHECK_ALL_QUESTION: 
            var questions = state.getIn(['currentSubject', 'src', action.pid, 'oriSQM', 'x']);
            var newQuestions = [];
            _.each(questions, question=> {
                newQuestions.push(_.assign({}, question, {selected: action.selected}))
            })
            var nextState= state.setIn(['currentSubject', 'src', action.pid, 'oriSQM', 'x'], newQuestions);
            return nextState;
        case CHECK_ONE_QUESTION:
            var questions = state.getIn(['currentSubject', 'src', action.pid, 'oriSQM', 'x']);
            var newQuestions = [];
            for(var index in questions) {
                if (questions[index].name !== action.qName) {
                    newQuestions.push(questions[index]);
                } else {
                    newQuestions.push(_.assign({}, questions[index], {selected: action.selected}))
                }
            }
            var nextState= state.setIn(['currentSubject', 'src', action.pid, 'oriSQM', 'x'], newQuestions);
            return nextState;
        case SET_PAPER_SQM: 
            var nextState = state;
            _.each(action.sqmList, sqmObj => {
                nextState = state.setIn(['currentSubject', 'src', sqmObj.pid, 'SQM'], sqmObj.sqm);      
            })
            return nextState;
        case SET_MERGED_SQM:
            var nextState = state.setIn(['currentSubject', 'SQM'], Map(action.mergedSqm));
            nextState = nextState.setIn(['currentSubject', 'mergeType'], action.mergeType);
            _.each(action.sqmMap, (sqm, pid) => {
                nextState = nextState.setIn(['currentSubject', 'src', pid, 'SQM'], sqm);      
            })
            return nextState;   
        case CHANGE_QUESTION_NAME: 
            var questions = state.getIn(['currentSubject', 'SQM','x']);
            var newQuestions = [];
            _.each(questions, question => {
                if (question.default === action.oldName) {
                    newQuestions.push(_.assign({}, question, {default: action.newName}))
                } else {
                    newQuestions.push(question);
                }
            })
            var nextState = state.setIn(['currentSubject', 'SQM', 'x'], newQuestions);
            return nextState;
        case SET_GROUP_MAP: 
            var nextState = state.setIn(['currentSubject', 'groupMap'], action.groupMap);
            return nextState;
        case SET_PAGE_INDEX: 
            var pageIndex = state.pageIndex;
            if (action.direction === NEXT_PAGE) {
                pageIndex += 1;
            } else if (action.direction === PREV_PAGE) {
                pageIndex -= 1;
            }
            if (pageIndex === state.pageIndex) 
                return state;
            var nextState = state.set('pageIndex', pageIndex);
            return nextState;
        case SAVE_CURRENT_SUBJECT: 
            var name = state.getIn(['currentSubject', 'name']);
            var nextState = state.setIn(['resultSet', name], state.get('currentSubject'));
            nextState = nextState.set('currentSubject',Map({ src: Map({}), groupMap: {}, name: '', grade: '', SQM: Map({}), mergeType: ''}));
            nextState = nextState.set('status','');
            nextState = nextState.set('pageIndex', 0);
            return nextState;
        case SET_ANALYSIS_NAME: 
            return state.set('analysisName', action.name);
        case SET_CREATE_STATUS: 
            return state.set('status', 'create');
        case EDIT_SUBJECT: 
             var nextState =  state.set('currentSubject', state.getIn(['resultSet', action.subjectName]));
             nextState = nextState.set('status', 'create');
             nextState = nextState.set('pageIndex', 0);
             return nextState;
        case DELE_SUBJECT: 
            return state.set('resultSet', state.get('resultSet').delete(action.subjectName));
        case CHANGE_CURRENT_SUBJECT_NAME:
            var nextState =  state.setIn(['currentSubject', 'name'], action.subjectName);
            var oldName = state.getIn(['currentSubject', 'name']);
            // 如果resulstSet有同名学科，说明此时为再编辑状态,需要把resultSet里的名字一同改变;
            if (state.getIn(['resultSet', oldName]) !== undefined) {
                nextState = nextState.setIn(['resultSet', oldName, 'name'], action.subjectName)
                nextState = nextState.setIn(['resultSet', action.subjectName], nextState.getIn(['resultSet', oldName]));
                nextState = nextState.set('resultSet', nextState.get('resultSet').delete(oldName))
            }
            return nextState;
        case DISCARD_CURRENT_SUBJECT:
            var nextState = state.set('currentSubject',Map({ src: Map({}), groupMap: {}, name: '', grade: '', SQM: Map({}), mergeType: ''}));
            nextState = nextState.set('status', '');
            nextState = nextState.set('pageIndex', 0);
            return nextState;
        case UPDATE_SUBJECT_SQM:
            var nextState = state.setIn(['resultSet', action.subjectName, 'SQM'], action.newSqm);
            return nextState;
        case SET_CURSUBJECT_SQM: 
            return state.setIn(['currentSubject', 'SQM'], Map(action.newSqm));
    }
    return state;
}
