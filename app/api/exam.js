/*
* @Author: HellMagic
* @Date:   2016-04-10 14:33:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 18:33:14
*/

'use strict';


import axios from 'axios';

export function getMockUser() {
    return Promise.resolve({
        name: 'HellMagic'
    });
}

export function getMockExamGuide() {
    return Promise.resolve({
        subjectCount: 3,
        totoalProblemCount: 20,
        classCount: 6,
        totoalStudentCount: 30
    });
    // return axios.get('/api/v1/user/me');
}


