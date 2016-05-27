import React from 'react';
import ownClassNames from './inputSubject.css';
import _ from 'lodash';
import Header from '../Header'
import Footer from '../Footer';

var subjects = [
    '语文',
    '数学',
    '英语',
    '政治',
    '历史',
    '地理',
    '物理',
    '化学',
    '生物',
    '文科综合',
    '理科综合',
    '数学(文)',
    '数学(理)',
    '语文(文)',
    '语文(理)',
    '英语(文)',
    '英语(理)',
]
// [
//     { name: '语文' },
//     { name: '数学' },
//     { name: '英语' },
//     { name: '政治' },
//     { name: '历史' },
//     { name: '地理' },
//     { name: '物理' },
//     { name: '化学' },
//     { name: '生物' },
//     { name: '文科综合' },
//     { name: '理科综合' },
//     { name: '数学(文)' },
//     { name: '数学(理)' },
//     { name: '语文(文)' },
//     { name: '语文(理)' },
//     { name: '英语(文)' },
//     { name: '英语(理)' }
// ];


/**
 * props:
 *  currentSubject: 当前学科分析信息；
 *  changeCurrentSubjectName: 设置当前学科分析名称信息
 *  subjectList: 已存在的学科名称列表;
 *  pageIndex: 当前的页码
 *  onNextPage: 点击下一步时的回调函数
 */
class SubjectInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedTagIndex: -1
        }
    }
    onClickSubject(index) {
        //设置相关学科状态
        this.setState({
            checkedTagIndex: index
        }, () => {
            this.refs.subjectName.value = subjects[index];
        })
    }
    onInputBlur(event) {
        // var value = event.target.value;
        // if (value === this.props.currentSubject.name) return ;
        // if (this.props.subjectList.indexOf(value) !== -1) {
        //     alert('学科名已存在');
        // }
        // this.props.changeCurrentSubjectName(value);
    }
    /**
     * 检查科目名称合法性
     * 1-不为空串, 2`-不与已有的科目名称重复
     */
    onNextPage() {
        var subjectName = this.refs.subjectName.value;
        if (subjectName === '') {
            alert('学科名不能为空');//todo: 使用dialog
            return;
        }
        if (subjectName !== this.props.currentSubject.name) {
            if (this.props.subjectList.indexOf(subjectName) !== -1) {
                alert('学科名已存在');//todo: 使用dialog组件;
                return;
            }
            this.props.changeCurrentSubjectName(subjectName);
        };
        this.props.onNextPage();

    }
    render() {
        return (
            <div>
                <div className={ownClassNames.content}>
                    <div style={{ marginBottom: 12 }}>
                        <label className={ownClassNames['label']}>学科名称</label>
                        <input ref='subjectName' defaultValue={this.props.currentSubject.name ? this.props.currentSubject.name : ''} onBlur={this.onInputBlur.bind(this) } className={ownClassNames['fx-input']} type="text" placeholder="填写你想分析的学科" />
                    </div>
                    <div style={{ paddingLeft: 75 }}>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>填写学科名称，方便你在创建完成本次分析后，进入详情查看学科分析的数据，您也可以直接从下方快捷的选择学科名称</span>
                        <div style={{ marginTop: 30 }}>
                            {
                                subjects.map((subject, index) => {
                                    return (
                                        <span key={'subject-' + index} onClick={this.onClickSubject.bind(this, index) } className={ownClassNames['fx-select-tag'] + ' ' + (this.state.checkedTagIndex === index ? ownClassNames['tag-checked'] : '') }>
                                            {subject}
                                        </span>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <Footer pageIndex={this.props.pageIndex} onNextPage={this.onNextPage.bind(this) }/>
            </div>
        )
    }
}

export default SubjectInput;
