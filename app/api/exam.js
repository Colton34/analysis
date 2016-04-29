/*
* @Author: HellMagic
* @Date:   2016-04-10 14:33:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-29 14:31:58
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

export function getMockClassReport() {
    return {
        title: '初一年级',
        sortedClass: ['3班', '4班', '5班', '1班', '2班'],
        sortedScore: [330, 320, 310, 223, 286]
    }
}


export function getMockLevelReport() {
    return {
        levels: [['15%', 600], ['20%', 520], ['25%', 480]],
        levelCountItem: [40, 260, 480]
    }
}

export function getMockSubjectReport() {
    return {
        subjects: ['语文', '数学', '英语', '政治', '历史', '地理'],
        weight: [43000, 19000, 60000, 35000, 17000, 10000]
    }
}




