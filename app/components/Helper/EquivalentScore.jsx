import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import {fetchExamListAction} from '../../reducers/helper/actions';
import {initParams, isNumber} from '../../lib/util';

import CommonErrorView from '../../common/ErrorView';
import Spinkit from '../../common/Spinkit';
import {SUBJECTS_WEIGHT as subjectWeight} from '../../lib/constants';
import {saveEquivalentScoreInfo} from '../../api/exam';

/*
TODO: a.计算lessonName  b.使得重要的科目在前面

 */


class ContentModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentExam: this.props.examList.toJS()[0]
        }
    }

    selectExam(obj) {
        //obj => {value: <examObj>, key: <examObj.id>} examObj是examList中的一个exam对象
        debugger;
        this.setState({
            currentExam: obj.value
        });
    }

    render() {
        if(!this.state.currentExam) return (<div>没有考试内容</div>)
        // debugger;
        return (
            <div>
                <SelectExam selectExam={this.selectExam.bind(this)} examList={this.props.examList} />
                <EquivalentLessonScore exam={this.state.currentExam} />
            </div>
        );
    }
}

class SelectExam extends React.Component {
    constructor(props) {
        super(props);

    }

    shouldComponentUpdate(nextProps, nextState) {
        var result = !nextProps.examList.equals(this.props.examList);
        debugger;
        return result;
    }

    render() {
        var examList = this.props.examList.toJS();
        console.log('selectExam');
        return (
            <div>使用DropList或者自己的下拉框，已经给了selectExam函数</div>
        );
    }
}

class EquivalentLessonScore extends React.Component {
    constructor(props) {
        super(props);
        //TODO:
        this.papersMap = _.keyBy(this.props.exam.papers, 'objectId');
        debugger;
        this.childValidate = {};
        _.each(_.keys(this.papersMap), (paperObjectId) => this.childValidate[paperObjectId] = true);
        debugger;
        var orderPapers = getOrderPapers(this.papersMap);
        debugger;
        this.state = {
            disable: true,
            papers: orderPapers,
            errorMsg: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        this.papersMap = _.keyBy(nextProps.exam.papers, 'objectId');
        this.childValidate = {};
        _.each(_.keys(this.papersMap), (paperObjectId) => this.childValidate[paperObjectId] = true);
        var orderPapers = getOrderPapers(this.papersMap);
        this.state = {
            disable: true,
            papers: orderPapers,
            errorMsg: ''
        }
    }

    setEquivalentItem(inputValue, paperObjectId) {
        //校验；不通过给出errorMsg，通过则给出计算数值
        debugger;
        var errorMsg = validation(inputValue);
        debugger;
        var targetPaper = this.papersMap[paperObjectId];
        targetPaper.percentage = inputValue;
        targetPaper.equivalentScore = (errorMsg) ? '' : _.round(_.multiply(targetPaper.fullMark, parseFloat(inputValue)), 2);
        debugger;
        this.childValidate[paperObjectId] = !(!!errorMsg);

        var disable = !_.every(this.childValidate, (v) => v);
        var orderPapers = getOrderPapers(this.papersMap);
        debugger;

        this.setState({
            disable: disable,
            papers: orderPapers,
            errorMsg: errorMsg
        });
    }

//{lessonName: paperItem.subject, objectId: paperItem.paper, id: paperItem.id, fullMark: paperItem.manfen};
    onSubmitListener() {
        var obj = {};
        obj.examId = this.props.exam.id;
        obj.exanName = this.props.exam.name;
        obj['[papers]'] = this.state.papers;
        debugger;
        // call api
        // var params = initParams({'request': window.request, equivalentScoreInfo: obj}, this.props.params, this.props.location);
        // saveEquivalentScoreInfo(params);
    }

    render() {
        return (
            <div>
                <h5>{this.state.errorMsg}</h5>
                <div><span>学科</span> <span>原始满分</span> <span>换算比例</span> <span>换算后满分</span></div>
                {/* 遍历每个lesson--[学科]列是subjectName???--做不到【数学I】，只有【数学（文科）】*/}
                {
                    _.map(this.state.papers, (paperItem) => <EquivalentLessonScoreItem key={paperItem.objectId} paperItem={paperItem} setEquivalentItem={this.setEquivalentItem.bind(this)} />)
                }
                <button disable={this.state.disable} onClick={this.onSubmitListener.bind(this)}>重新生成新考试报告</button>
            </div>
        );
    }
}

class EquivalentLessonScoreItem extends React.Component {
    constructor(props) {
        super(props);
        this.isProps = true;
        this.state = {
            value: this.props.paperItem.percentage
        }
    }

    onBlurListener(e) {
        //对input直接赋值；返回，到外满校验：通过则给出【换算后满分】，不通过则没有，显示[-]
        debugger;
        this.props.setEquivalentItem(e.target.value, this.props.paperItem.objectId);
    }

    render() {
        // var currentValue = (isProps) ? this.props.paperItem
        return (
            <div>
                <span>{this.props.paperItem.lessonName}</span>
                <span>{this.props.paperItem.fullMark}</span>
                <input placeholder='如：1.25' type='text' defaultValue={this.props.paperItem.percentage} onBlur={this.onBlurListener.bind(this)} />
                <span>{this.props.paperItem.equivalentScore || '- - -'}</span>
            </div>
        );
    }
}

class EquivalentScore extends React.Component {
    static need = [fetchExamListAction]

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.fetchExamList(params);
    }

    render() {
        return (
            <div>
                {this.props.ifError ? (<CommonErrorView />) : ((this.props.isLoading || this.props.examList.size == 0) ? <Spinkit /> : <ContentModule examList={this.props.examList} />)}
            </div>
        );
    }
}

export default  connect(mapStateToProps, mapDispatchToProps)(EquivalentScore);

function mapStateToProps(state) {
    return {
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,
        examList: state.helper.examList
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchExamList: bindActionCreators(fetchExamListAction, dispatch)
    }
}

function validation(inputValue) {
    //必须是数字
    var isValid = isNumber(inputValue);
    if(!isValid) return '必须是数字';
    isValid = (inputValue >= 0.1) && (inputValue <= 10);
    return (isValid) ? '' : '比例必须在【0.1~10】之间的有效数字';
}

//根据课程名称的权重进行排序
function getOrderPapers(papersMap) {
    var highWeight = [], lowWeight = [];
    _.each(papersMap, (paperItem, paperObjectId) => {
        var index = _.findIndex(subjectWeight, (s) => ((s == paperItem.lessonName) || (_.includes(paperItem.lessonName, s))));
        (index >= 0) ? highWeight.push({index: index, value: paperItem}) : lowWeight.push(paperItem);
    });
    highWeight = _.chain(highWeight).sortBy('index').map((obj) => obj.value).value();
    return _.concat(highWeight, lowWeight);
}
