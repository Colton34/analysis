import React from 'react';
import ownClassNames from './questionConfirm.css';
import _ from 'lodash';
import Header from '../Header'
import Footer from '../Footer';

var questions = [
    {
        exam: '2016年永丰中学第六次月考',
        paper: '数学',
        name: '第1题'
    }, {
        exam: '2016年永丰中学第六次月考',
        paper: '数学',
        name: '第2题'
    }, {
        exam: '2016年永丰中学第六次月考',
        paper: '数学',
        name: '第3题'
    }, {
        exam: '2016年永丰中学第六次月考',
        paper: '数学',
        name: '第4题'
    }, {
        exam: '2016年永丰中学第六次月考',
        paper: '数学',
        name: '第5题'
    },
]
/**
 * props:
 * pageIndex: 当前页码
 * onPrevPage: 
 * onNextPage: 
 * mergedSQM: 上一步的合成结果;
 * onChangeQuestionName: 修改题目名称的回调函数
 */
class QuestionConfirm extends React.Component {
    constructor(props) {
        super(props);
    }
    onInputBlur(event) {
        var newName = event.target.value;
        var $target = $(event.target); 
        var oldName = $target.data('name');
        if(newName === oldName) return;
        this.props.onChangeQuestionName(oldName, newName);
    }
    render() {
        return (
            <div>
                <div className={ownClassNames['container']}>

                    <table class="table" style={{ paddingLeft: 0, border: '1px solid #ddd' }}>
                        <thead>
                            <tr className={ownClassNames['table-row']}>
                                <td className={"col-md-4 " + ownClassNames['table-item']}>来源考试</td>
                                <td className={"col-md-4 " + ownClassNames['table-item']}>来源科目</td>
                                <td className={"col-md-2 " + ownClassNames['table-item']}>来源题号</td>
                                <td className={"col-md-2 " + ownClassNames['table-item']}>生成题号</td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.props.mergedSQM.x.map((question, index) => {
                                    return (
                                        <tr key={'question-' + index} className={ownClassNames['table-row']}>
                                            <td className={ownClassNames['table-item']}>{question.exam}</td>
                                            <td className={ownClassNames['table-item']}>{question.paper}</td>
                                            <td className={ownClassNames['table-item']}>{question.name}</td>
                                            <td className={ownClassNames['table-item']}>
                                                <input type="text" className={"form-control " + ownClassNames['table-input']} onBlur={this.onInputBlur.bind(this)} data-name={question.default} defaultValue={question.default}/>
                                            </td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>
                    </table>

                </div>
                <Footer pageIndex={this.props.pageIndex} onPrevPage={this.props.onPrevPage} onNextPage={this.props.onNextPage}/>
            </div>
        )
    }

}

export default QuestionConfirm;