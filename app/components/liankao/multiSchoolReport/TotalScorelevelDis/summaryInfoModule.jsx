import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import commonClass from '../../../../styles/common.css';
import { NUMBER_MAP as numberMap} from '../../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../../common/DropdownList';
//这里给的reportDS的levels中并没有studentsInfo而只是一个数字，所以需要在这里重新计算一下，重构的时候对这个数据结构添加targetStudents信息
export default class SummaryInfoModule extends React.Component {
    constructor(props) {
        super(props);
        this.dropListData = getDropListData (this.props.levelStudentsInfoBySchool);
        this.state = {
            currentSchool: this.dropListData[0]
        }
    }
    onClickDropdownList(item) {
        this.setState({
            currentSchool: item
        })
    }
    render() {
        var _this = this;

        var levels= this.props.reportDS.levels.toJS();
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        var summaryCardInfo = getSummaryCard(this.props.levelStudentsInfo, examStudentsInfo, this.props.allStudentBySchool);
        var summayrChartInfo = this.props.levelStudentsInfoBySchool;
        var chartData = summayrChartInfo[this.state.currentSchool.key];
        var chartDataInfo = _.map(_.range(_.size(levels)),function(index){
            return {
                name:numberMap[index-0+1]+'档上线率',
                y:chartData[index]
            }
        });
        chartDataInfo.push({
            name:'其他',
            y:chartData.other
        });


        let config = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            colors:[
             '#0099ff',
             '#33cc33',
             '#33cccc',
             '#ff9900',
             '#ff6633',
             '#6666cc'
           ],
            title: {
              verticalAlign: 'middle',
              text: '各档上线率',
              align:'center',
              x:-60,
              y:3,
              style:{
                'color':'#767676',
                'font-size':'14px'
              }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                  size:'180',
                  innerSize:'130',//内径大小
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (ReactHighcharts.theme && ReactHighcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    showInLegend: true,

                }
            },
            legend:{
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'bottom',
              borderWidth: 0,  //写'0px'会报错；
              enabled: true,
              itemStyle:{
                'font-size':'14px',
                'color':'#333333'
              },
              itemMarginBottom:_.size(levels) <= 3 ? 15 : (_.size(levels) === 4 ? 10 : 5)
            },
            series: [{
                name: '档位',
                colorByPoint: true,
                data: chartDataInfo   //动态数据
            }],
            credits: {
                enabled: false
            }

        };

        return (

            <div  className={commonClass['section']} style={{marginTop:0}}>
                <div className={commonClass['analysis-conclusion']} style={{marginTop:0}}>
                    <p>分析诊断：</p>
                    <div>各校{(_.map(levels,(value,key) => {return numberMap[key-0+1];})).join(',')}
                        档上线人数分布所示，基本上反映出各个学校总分较高学生的人数分布情况。下面重点列出各档上线率最高和最低的学校：
                    </div>
                    <div style={{padding:'10px 0 0 0 ',margin:'20px 0 0 0'}}>
                        <OnlineInfo  levels={levels} summaryCardInfo={summaryCardInfo}></OnlineInfo>
                            <div style={{ display: 'inline-block', width: 380, height:240, position: 'relative', float: 'right'}}>
                                <ReactHighcharts config={config} style={{ display: 'inline-block', width: 380, height: 240, border: '1px solid ' + colorsMap.C04 }}></ReactHighcharts>
                        <span style={{ position: 'absolute', right: 30, top: 30 }}>
                            <DropdownList onClickDropdownList={_this.onClickDropdownList.bind(_this) } list={_this.dropListData}/>
                        </span>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class OnlineInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showScroll: '',
            needScroll: _.size(this.props.summaryCardInfo) > 3 ? true : false
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps && _.size(nextProps.summaryCardInfo) > 3) {
            this.setState({needScroll: true})
        }
    }
    onMouseEnter(e){
        if (!this.state.needScroll) return;
        var $target = $(e.target);
        var id = $target.attr('id');
        if (!id) {
            id = $target.parents('.online-block').attr('id');
        }
        this.setState({
            showScroll: id
        })
    }
    onMouseLeave(e){
        if (!this.state.needScroll) return;
        var $target = $(e.target);
        var id = $target.attr('id');
        if (!id) {
            id = $target.parents('.online-block').attr('id');
        }
        this.setState({
            showScroll: ''
        })
    }
    render() {
        var {levels, summaryCardInfo} = this.props;
        var levTotal = _.size(levels);

        var disTotal = _.size(summaryCardInfo);
        return (
            <div style={_.assign({}, { display: 'inline-block' }) }>
                <div id='high' className='online-block' style={_.assign({}, { width: 680, minHeight: 110, border: '1px solid ' + colorsMap.C04, padding: '30px 0 0 0', marginBottom: 20 ,backgroundColor:'#fff'}, disTotal > 3 && this.state.showScroll === 'high' ? { overflowX: 'scroll' } : { overflowX: 'hidden' }) }
                    onMouseEnter={this.onMouseEnter.bind(this) } onMouseLeave={this.onMouseLeave.bind(this) }>
                    <div style={_.assign({}, { width: disTotal !== 0 ? 215 * disTotal + 95 : '100%'}) }>
                        {
                            (_.size(summaryCardInfo) > 0) ? (
                                _.map(_.range(levTotal), (index) => {
                                    var levelStr = numberMap[(index + 1)], levObj = summaryCardInfo[(levTotal - 1 - index)];
                                    var classStr = _.join(_.map(levObj.high, (className) => className ),'') ;
                                    return (
                                        <div key={index} style={_.assign({}, { display: 'inline-block', width: 215, paddingLeft: 30 }, index === levTotal - 1 ? {} : { borderRight: '1px solid ' + colorsMap.C05 }) }>
                                            <p style={{ fontSize: 12 }}>{levelStr}档线上线率高的学校</p>
                                            <p style={{ width: '100%', color: colorsMap.B08, marginBottom: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}} title={classStr}>{classStr}</p>
                                        </div>
                                    )
                                })
                            ) : (<p style={{paddingLeft: 30}}>只有一个学校，没有可比性</p>)
                        }
                    </div>
                </div>
                <div id='low' className='online-block' style={_.assign({}, { width: 680, minHeight: 110, border: '1px solid ' + colorsMap.C04, padding: '30px 0 0 0', marginBottom: 20 ,backgroundColor:'#fff'}, disTotal > 3 && this.state.showScroll === 'low' ? { overflowX: 'scroll' } : { overflowX: 'hidden' }) }
                    onMouseEnter={this.onMouseEnter.bind(this) } onMouseLeave={this.onMouseLeave.bind(this) }>
                    <div style={_.assign({}, { width: disTotal !== 0 ? 215 * disTotal + 95 : '100%'}) }>
                        {
                            (_.size(summaryCardInfo) > 0) ? (
                                _.map(_.range(levTotal), (index) => {
                                    var levelStr = numberMap[(index + 1)], levObj = summaryCardInfo[(levTotal - 1 - index)];
                                    var classStr = _.join(_.map(levObj.low, (className) => className ), '') ;
                                    return (
                                        <div key={index} style={_.assign({}, { display: 'inline-block', width: 215, paddingLeft: 30 }, index === levTotal - 1 ? {} : { borderRight: '1px solid ' + colorsMap.C05 }) }>
                                            <p style={{ fontSize: 12 }}>{levelStr}档线上线率低的学校</p>
                                            <p style={{ width: '100%', color: colorsMap.B08, marginBottom: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}} title={classStr}>{classStr}</p>
                                        </div>
                                    )
                                })
                            ) : (<p style={{paddingLeft: 30}}>只有一个学校，没有可比性</p>)
                        }
                    </div>
                </div>
            </div>
        )
    }
}


function getDropListData (summayrChartInfo){
    var  dropListData = _.map(summayrChartInfo,function(value,index){
        return{
            key:index,
            value:index
        }
    });
    return dropListData;
}

function getSummaryCard(levelStudentsInfoBySchool, examStudentsInfo, allStudentBySchool) {
    //数组，排序，取值
    var result = {}, allSchools = _.keys(allStudentBySchool);
    _.each(levelStudentsInfoBySchool, (levelSchoolStudents, levelKey) => {
        //求取最低学校可能会有问题（在班级那边也是，而且更有可能出现）--如果某些学校压根在本档次没有人数，那么levelStudentsInfoBySchool数据结构中是没有此学校的key的，有多个这样的学校就更“麻烦”。总学校的个数可以通过直接对examStudentsInfo进行school group即可
        var existSchools = _.keys(levelSchoolStudents);
        var notExistSchools = _.difference(allSchools, existSchools);
        var temp = _.map(levelSchoolStudents, (students, schoolName) => {
            return {
                count: students.length,
                school: schoolName
            }
        });
        temp = _.sortBy(temp, 'count');
        result[levelKey] = {
            high: _.last(temp).school,
            low: _.first(temp).school
        }
    });
    return result;
}

function getSummaryChart(levelStudentsInfoBySchool, allStudentBySchool) {
    //需要调整一下key
    //以各个学校为key，里面是各个level
    //注意：有可能某个学校下面没有某一档次数据，则填充0。需要计算其他，那么就需要知道此学校一共有多少人--其实是一共有多少人参与了此考试--这个可以通过对examStudentsInfo进行groupBy得到
    var result = {};
    _.each(levelStudentsInfoBySchool, (levelSchoolStudents, levelKey) => {
        _.each(levelSchoolStudents, (students, schoolName) => {
            if(!result[schoolName]) result[schoolName] = {};
            result[schoolName][levelKey] = students.length;
        })
    });
    _.each(result, (schoolLevelCountInfo, schoolName) => {
        var schoolLevelCounts = _.values(schoolLevelCountInfo);
        var schoolAllExistStudentCount = allStudentBySchool[schoolName].length;
        var otherCount = schoolAllExistStudentCount - _.sum(schoolLevelCounts);
        schoolLevelCountInfo.other = otherCount;
        schoolLevelCountInfo.all = schoolAllExistStudentCount;
    });
    return result;
}
function getLevelStudentsInfoBySchool(reportDS) {
    //通过每一档的count和score得到每一档所拥有的学生信息
    var result = {}, levels = reportDS.levels.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examFullMark = reportDS.examInfo.toJS().fullMark;
    _.each(levels, (levelObj, levelKey) => {
        var currentLevelStudentsInfo = getLevelStudentsInfo(levelKey, levels, examStudentsInfo, examFullMark);
        result[levelKey] = _.groupBy(currentLevelStudentsInfo, 'school'); //注意这里的key是学校名称
    })
    return result;
}
