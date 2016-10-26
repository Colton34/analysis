import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link, browserHistory} from 'react-router';
import DropdownList from '../../common/DropdownList';
import {fetchEquivalentScoreInfoListAction} from '../../reducers/helper/actions';
import {startLoadingAction, stopLoadingAction, throwErrorAction} from '../../reducers/global-app/actions';
import {initParams, isNumber} from '../../lib/util';

import CommonErrorView from '../../common/ErrorView';
import Spinkit from '../../common/Spinkit';
import {SUBJECTS_WEIGHT as subjectWeight} from '../../lib/constants';
import {setEquivalentScoreInfo} from '../../api/exam';

/*
TODO: a.计算lessonName  b.使得重要的科目在前面

 */


function HelperBoxNav({title}) {
    return (
        <div style={{display:'tableCell',textAlign:'center', width: 1200,margin: '0 auto', marginTop: 20, backgroundColor: '#fff', zIndex: 0,padding:'20px 0px',borderBottom:'1px solid #eee'}} className='animated fadeIn'>
            {/*<Link to={{pathname: '/dashboard'}} style={{color:'#333'}}>返回</Link>*/}
            <span style={{color:'#000',fontSize:'18px'}}>分数转换</span>
        </div>
    )
}


//Main
class EquivalentScore extends React.Component {
    static need = [fetchEquivalentScoreInfoListAction];
    static childContextTypes ={
        startLoading: PropTypes.func.isRequired,
        stopLoading: PropTypes.func.isRequired,
        throwError: PropTypes.func.isRequired
    };

    getChildContext() {
        return {
            startLoading: this.props.startLoading,
            stopLoading: this.props.stopLoading,
            throwError: this.props.throwError
        }
    }

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        debugger;
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.fetchEquivalentScoreInfoList(params);
    }

    render() {
        return (
            <div style={{ width: 1200, margin: '0 auto', backgroundColor: '#fff', zIndex: 0}} className='animated fadeIn'>
                <HelperBoxNav />
                {this.props.ifError ? (<CommonErrorView />) : ((this.props.isLoading || this.props.equivalentScoreInfoList.size == 0) ? <Spinkit /> : <ContentModule equivalentScoreInfoList={this.props.equivalentScoreInfoList} />)}
            </div>
        );
    }
}

export default  connect(mapStateToProps, mapDispatchToProps)(EquivalentScore);

class ContentModule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEquivalentScoreInfo: this.props.equivalentScoreInfoList.toJS()[0]
        }
    }

    selectEquivalentScoreInfo(obj) {
        //obj => {value: <examObj>, key: <examObj.id>} examObj是examList中的一个exam对象
        var equivalentScoreInfoList = this.props.equivalentScoreInfoList.toJS();
        var target = _.find(equivalentScoreInfoList, (eobj) => eobj.examId == obj.key);
        debugger;
        this.setState({
            currentEquivalentScoreInfo: target
        });
    }

    render() {

        if(!this.state.currentEquivalentScoreInfo) return (<div>没有考试内容</div>)
        // debugger;
        return (
            <div style={{width:600,margin:'0 auto',padding:'50px 0'}}>

                <SelectEquivalentScoreInfo selectEquivalentScoreInfo={this.selectEquivalentScoreInfo.bind(this)} equivalentScoreInfoList={this.props.equivalentScoreInfoList} />
                <EquivalentLessonScore equivalentScoreInfo={this.state.currentEquivalentScoreInfo} />
            </div>
        );
    }
}

class SelectEquivalentScoreInfo extends React.Component {
    constructor(props) {
        super(props);

    }

    shouldComponentUpdate(nextProps, nextState) {
        var result = !nextProps.equivalentScoreInfoList.equals(this.props.equivalentScoreInfoList);
        debugger;
        return result;
    }

    render() {
        var equivalentScoreInfoList = this.props.equivalentScoreInfoList.toJS();
        var dropListData = getDropListData(equivalentScoreInfoList);
        debugger
        console.log('selectEquivalentScoreInfo');
        return (
            <div style={{position:'relative'}}>
                <span style={{paddingLeft:'50px'}}>选择考试：</span>
                <div style={{width:'400px',display:'inline-block',position:'absolute',top:-5,right:50,zIndex:10}}>
                <DropdownList onClickDropdownList={this.props.selectEquivalentScoreInfo} list={dropListData}  surfaceBtnStyle={_.assign({ width:'400px'})} />
                </div>
            </div>
        );
    }
}

class EquivalentLessonScore extends React.Component {
    static contextTypes = {
        startLoading: PropTypes.func.isRequired,
        stopLoading: PropTypes.func.isRequired,
        throwError: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        //TODO:
        this.papersMap = _.keyBy(this.props.equivalentScoreInfo['[lessons]'], 'objectId');
        debugger;
        this.childValidate = {};
        _.each(_.keys(this.papersMap), (paperObjectId) => this.childValidate[paperObjectId] = true);
        debugger;
        var orderPapers = getOrderPapers(this.papersMap);
        debugger;
        this.state = {
            disable: true,
            lessons: orderPapers,
            errorMsg: ''
        }
    }



    componentWillReceiveProps(nextProps) {
        this.papersMap = _.keyBy(nextProps.equivalentScoreInfo['[lessons]'], 'objectId');
        this.childValidate = {};
        _.each(_.keys(this.papersMap), (paperObjectId) => this.childValidate[paperObjectId] = true);
        var orderPapers = getOrderPapers(this.papersMap);
        this.state = {
            disable: true,
            lessons: orderPapers,
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
            lessons: orderPapers,
            errorMsg: errorMsg
        });
    }

//{lessonName: paperItem.subject, objectId: paperItem.paper, id: paperItem.id, fullMark: paperItem.manfen};
    onSubmitListener() {
        var obj = _.pick(this.props.equivalentScoreInfo, ['_id', 'examId', 'examName']);
        // obj.examId = this.props.equivalentScoreInfo.examId;
        // obj.exanName = this.props.equivalentScoreInfo.examName;
        obj['[lessons]'] = formatLessons(this.state.lessons);
        debugger;
        // call api
        var params = initParams({'request': window.request, equivalentScoreInfo: obj}, this.props.params, this.props.location);
        //TODO：出现loading
        this.context.startLoading();
        var _this = this;
        setEquivalentScoreInfo(params).then(function(res) {
            console.log(res.data);
            debugger;
            _this.context.stopLoading();
            //【Mock】TODO: 跳转到dashboard
            browserHistory.push('/zouban/dashboard?examid='+res.data.examid);
            // browserHistory.push('/dashboard?examid=' + res.data.examId+'&grade='+res.data.grade);
        }).catch(function(err) {
            debugger;
            //show error
            _this.context.throwError();
        })
    }

    render() {
        return (
            <div>

                <div style={{display:'block' ,color:'#ee6b52',margin:'30px auto 0px',paddingLeft:'100px'}}>{this.state.errorMsg}</div>

                <div style={{padding:'20px 0 ',borderBottom:'1px solid #eee'}}><span style={{display:'inline-block',textAlign:'center',width:'150px'}}>学科</span> <span style={{display:'inline-block',textAlign:'center',width:'150px'}}>原始满分</span> <span style={{display:'inline-block',textAlign:'center',width:'150px'}}>换算比例</span> <span style={{display:'inline-block',padding:'0 30px'}}>换算后满分</span></div>
                {/* 遍历每个lesson--[学科]列是subjectName???--做不到【数学I】，只有【数学（文科）】*/}
                {
                    _.map(this.state.lessons, (paperItem) => <EquivalentLessonScoreItem key={paperItem.objectId} paperItem={paperItem} setEquivalentItem={this.setEquivalentItem.bind(this)} />)
                }
                <div style={{padding:'30px 0',color:'#ee6b52',display:'tableCell',textAlign:'center'}}>说明：重新生成新的考试报告，供老师进行查看。</div>
                <button disabled={this.state.disable} onClick={this.onSubmitListener.bind(this)} style={{display:'block', border:'none',backgroundColor:'#1daef8',color:'#fff',padding:'15px 100px',margin:'0 auto'}}>重新生成新考试报告</button>
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
            <div style={{width:'600px',borderBottom:'1px solid #eee'}}>
                <span style={{display:'inline-block',width:'150px',textAlign:'center',margin:'20px 0px'}}>{this.props.paperItem.name}</span>
                <span style={{display:'inline-block',width:'150px',textAlign:'center',margin:'20px 0px'}}>{this.props.paperItem.fullMark}</span>
                <span style={{display:'inline-block',width:'150px',textAlign:'center',margin:'20px 0px'}}>
                <input placeholder='如：1.25' type='text' defaultValue={this.props.paperItem.percentage} onBlur={this.onBlurListener.bind(this)} style={{width:120}}/>
                </span>
                <span style={{display:'inline-block',width:'150px',textAlign:'center',margin:'20px 0px'}}>{this.props.paperItem.equivalentScore || '- - -'}</span>
            </div>
        );
    }
}



function mapStateToProps(state) {
    return {
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,
        equivalentScoreInfoList: state.helper.equivalentScoreInfoList
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchEquivalentScoreInfoList: bindActionCreators(fetchEquivalentScoreInfoListAction, dispatch),
        startLoading: bindActionCreators(startLoadingAction, dispatch),
        stopLoading: bindActionCreators(stopLoadingAction, dispatch),
        throwError: bindActionCreators(throwErrorAction, dispatch)
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
        var index = _.findIndex(subjectWeight, (s) => ((s == paperItem.name) || (_.includes(paperItem.name, s))));
        (index >= 0) ? highWeight.push({index: index, value: paperItem}) : lowWeight.push(paperItem);
    });
    highWeight = _.chain(highWeight).sortBy('index').map((obj) => obj.value).value();
    return _.concat(highWeight, lowWeight);
}

function getDropListData(equivalentScoreInfoList){
    var dropListData = _.map(equivalentScoreInfoList,function(equivalentScoreInfoObj){
        return {
            key:equivalentScoreInfoObj.examId,
            value:equivalentScoreInfoObj.examName
        }
    });
    return dropListData;
}

function formatLessons(inputLessons) {
    var obj;
    return _.map(inputLessons, (lessonObj) => {
        obj = _.pick(lessonObj, ['id', 'objectId', 'name', 'fullMark', 'equivalentScore']);
        obj.percentage = parseFloat(lessonObj.percentage);
        return obj;
    });
}
