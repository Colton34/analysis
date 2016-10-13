//因为这里只有一个select的位置，所以一个父亲多个孩子
/*
设计：
原则：
1、颗粒度保持较小--没有交互的统统封装成stateless function


SubjectSelector
PaperClassSelector

QuestionPerformance
QuestionDistribution
QuestionDetail


 */

import _ from 'lodash';
import React, { PropTypes } from 'react';

import QuestionPerformance from './QuestionPerformance';
import QuestionDistribution from './QuestionDistribution';
import QuestionDetail from './QuestionDetail';

export default class QuestionModule extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <SubjectSelector />
                <PaperClassSelector />
                <QuestionPerformance />
                <QuestionDistribution />
                <QuestionDetail />
            </div>
        );
    }
}


function SubjectSelector({}) {
    return (
        <div>
            待填充(SubjectSelector)
        </div>
    )
}

function PaperClassSelector({}) {
    return (
        <div>
            待填充(PaperClassSelector)
        </div>
    )
}
