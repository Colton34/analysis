/*
* @Author: HellMagic
* @Date:   2016-04-10 14:33:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-28 19:12:46
*/

'use strict';


import axios from 'axios';

export function getMockExamGuide() {
    return Promise.resolve({
        subjectCount: 3,
        totoalProblemCount: 20,
        classCount: 6,
        totoalStudentCount: 30
    });
    // return axios.get('/api/v1/user/me');
}

export function getMockScoreRank() {
    return Promise.resolve({
        top: {
            '魏旭': 688,
            '肖赫': 670,
            '朱倩': 666,
            '徐鹏': 660,
            '陈宇': 658,
            '董琛': 656
        },
        low: {
            '王然': 0,
            '刘涛': 6,
            '景甜': 8,
            '范冰冰': 10,
            '杨颖': 20,
            '王艳': 26
        }
    })
}
