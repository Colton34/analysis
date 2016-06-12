import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link, browserHistory} from 'react-router';

import _ from 'lodash';
import {Map, List} from 'immutable';

import {initRankReportAction} from '../reducers/dashboard/actions';
import {initParams} from '../lib/util';

class RankReport extends React.Component {
    static need = [
        initDashboardAction
    ];

	constructor(props) {
		super(props);
//设计：关注View的数据结构。其实是表格，分别是表格的行内容，表格的行顺序，表格的列内容。
		this.currentPaper = ;
		this.currentClasses = ; 
		this.currentSearch = ;
		this.currentPageSize = ;
		this.currentPageNumer = ;
		this.currentRankFactors = ;//eg: [{level: 'school', order:'desc' }, {level: 'class', order: 'asc'}]

		this.state = {
			currentRows: ,
			currentColumns: ,
			currentPageInfo: 
		}

		// this.state = {
		// 	currentPaper: ,
		// 	currentClasses: ,
		// 	currentSearch: ,
		// 	currentColumns: ,
		// 	currentPageSize: ,
		// 	currentPageNumer: ,
		// 	currentRankFactors: 
		// };
	}

    componentDidMount() {
        if (this.props.dashboard.haveInit) return;

        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initRankReport(params);
    }

    changePaper(paper) {
    	//改变科目--除了列、班级、factors外，都重置
    }

    changeClasses(classes) {
    	//改变班级--除了列、科目、factors外，都重置
    }

    changeSearch(content) {
    	//改变搜索内容--除了列、科目、班级、factors外，都重置
    }

    changeColumns(columns) {
    	//改变列--只有列变，其他都不变
    }

    changePageSize(size) {
    	//只有对应的pageSize和currentRows内容改变
    }

    changePageNumber(number) {
    	//只有对应的pageNumber和currentRows内容改变
    }

    changeRankFactor(factor) {
    	//只有对应的currentRows顺序改变
    }

//设计：支持同步/异步分页的Table组件

/*
examInfo: {
    name: ,
    papers: ,
    classes: 
}

rankCache: {
    totalScore: {
        <className>: [ //已经是有序的（升序）
            {
                kaohao: ,
                name: ,
                class: ,
                score: 
            }
        ],
        ...
    },
    <pid>: {
        <className>: [
            {
                kaohao: ,
                name: ,
                class: ,
                score
            }
        ],
        ...
    },
    ...
}


 */
    render() {
    	//根据currentRows和currentColumns来渲染表格。页脚的内容也需要改变
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

function mapStateToProps(state) {
    return {
        examInfo: state.rankReport.examInfo,
        examPapersInfo: state.rankReport.examPapersInfo,
        examClassesInfo: state.rankReport.examClassesInfo,
        rankCache: state.rankReport.rankCache
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initRankReport: bindActionCreators(initRankReportAction, dispatch)
    }
}


//根据当前选中的班级，科目，搜索，隐藏列，显示多少条记录，currentPage的时候要重新渲染table

// search也是在所勾选的范围（currentPaper、currentClasses）内search，所以一上来先根据 currentPaper、currentClasses
// 确定总显示学生信息--下角的信息要用。搜索支持学号（当_.isNumber(parseInt(currentSearch))为true）也支持
// 姓名的搜索。

//header的信息从examInfo，examPapersInfo，examClassesInfo获取
//currentPaper来自examPapersInfo，所以id既是pid，paper是ObjectId
// 1阶段通过classes和subject筛选
	//var currentStudentsInfo = _.pick(this.props.rankCache[this.state.currentPaper.id], this.state.currentClasses);
// 2阶段通过 seach内容筛选
	// if(this.state.currentSearch && this.state.currentSearch.replace(/\s+/g,"")) {
	// 	//如果search中有真实内容
	// 	var isSeachNumber = _.isNumber(parseInt(this.state.currentSearch));
	// 	//如果是数字那么搜索学号，否则搜索姓名

	// 	//根据搜索结果，再次缩小 currentStudentsInfo	
	// }


// 3阶段 根据 rankFactor排序。前面是确定内容，这里确定顺序。


















