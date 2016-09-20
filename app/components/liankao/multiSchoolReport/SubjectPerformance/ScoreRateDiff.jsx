// 联考报告-学科的平均得分率差异；
import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap, LETTER_MAP as letterMap} from '../../../../lib/constants';
// components
import DropdownList from '../../../../common/DropdownList';
import ReactHighcharts from 'react-highcharts';


/**
 * props:
 * subjectInfoBySchool: 父组件数据预处理后的数据结构，详见父组件说明；
 * headers: 来自reportDS;
 */
export default class ScoreRateDiff extends React.Component{
    constructor(props) {
        super(props);
        this.list = [{type: 0, value: '学科离差顺序'}, {type: 1, value: '相对离差顺序'}]
        this.state = {
            currentType: this.list[0]
        }
        this.subjects = _.map(props.headers.slice(1), header => {return header.subject});

        var {headers, subjectInfoBySchool} = props;
        var {diffBySubject, relaDiffBySubject} = getDiffBySubject(subjectInfoBySchool, headers);
        this.diffBySubject = diffBySubject;
        this.relaDiffBySubject = relaDiffBySubject;
        
        var {diffSubjectOrder, relaDiffSubjectOrder} = getSubjectOrder(diffBySubject, relaDiffBySubject, headers);
        this.diffSubjectOrder = diffSubjectOrder;
        this.relaDiffSubjectOrder = relaDiffSubjectOrder;
    }
    onChangeType (item) {
        this.setState({
            currentType: item
        })
    }
    render(){
        var {currentType} = this.state;
        var {headers} = this.props;
        var config = {
            chart: {
                type: 'column'
            },
            title: {
                text: '(离差)',
                floating: true,
                x: -485,
                y: 3,
                style: {
                    "color": "#767676",
                    "fontSize": "12px"
                }
            },
            xAxis: {
                tickWidth: '0px', categories: this.subjects,
                title: {
                    align: 'high',
                    text: '科目',
                    margin: 0,
                    offset: 7
                }
            },
            yAxis: {
                allowDecimals: true,//刻度允许小数
                lineWidth: 1,
                gridLineDashStyle: 'Dash',
                gridLineColor: '#f2f2f3',
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#f2f2f3'
                }],
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                column: {
                    pointWidth: 16,//柱宽
                }
            },
            legend: {
                enabled: false,
                align: 'center',
                verticalAlign: 'top'
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#000',
                borderColor: '#000',
                style: {
                    color: '#fff'
                },
                formatter: function () {
                    return this.point.y
                }
            }
        };
        var seriesData = (currentType.type === 0 ? _.map(headers.slice(1), header => {return this.diffBySubject[header.id]}) : _.map(headers.slice(1), header => {return this.relaDiffBySubject[header.id]}));
        config['series'] = [{name: '离差', data: seriesData, color: colorsMap.B03}];
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ margin: '30px 0 20px 0' }}>
                    <span className={commonClass['sub-title']}>学科的平均得分率差异</span>
                    <div className={commonClass['title-desc']} style={{marginTop: 20}}>
                        从各学科的成绩表现看，每个学科的学校平均得分率最高的与最低之间的离差，从大到小的顺序是<span style={{color: colorsMap.B03}}>{_.join(this.diffSubjectOrder, '、')}。</span>。
                        如果联系到学科的命题难度，其相对离差从大到小的的顺序是<span style={{color: colorsMap.B03}}>{_.join(this.relaDiffSubjectOrder, '、')}</span>。
                        离差较大的学科，反映出学校水平差距较大。离差较小的学科，反映出该学科教学效果比较整齐。（注：语文是母语，学生水平离差来得较小应是常态）
                    </div>
                </div>
                <DropdownList list={this.list} onClickDropdownList={this.onChangeType.bind(this)} style={{position: 'absolute', right: 0, top: 0, zIndex: 1}}/>
                <ReactHighcharts config={config} style={{width: '100%', height: '100%'}} />

            </div>
        )
    }    
}


function getDiffBySubject(subjectInfoBySchool, headers) {
    var diffBySubject = {};
    var relaDiffBySubject = {};
    _.forEach(headers.slice(1), header => {
        var totalScoreRate = getTotalScoreRate(subjectInfoBySchool, header); 
        var rateArr = [];
        _.forEach(_.omit(subjectInfoBySchool, 'total'), (subjectsInfo , schoolName) => {
            var subjectInfo = subjectsInfo[header.id];
            var diffRate = subjectInfo ? _.round(subjectInfo.sum / (subjectInfo.count * subjectInfo.fullMark), 2) : null;
            if (diffRate !== null) {
                rateArr.push(diffRate)                
            }
        })
        rateArr = _.sortBy(rateArr);
        var diff = _.round(_.last(rateArr) - _.first(rateArr), 2);
        diffBySubject[header.id] = diff;
        relaDiffBySubject[header.id] = _.round(diff / totalScoreRate, 2);
    })
    return {diffBySubject, relaDiffBySubject};
}

function getTotalScoreRate(subjectInfoBySchool, header) {
    var totalObj = subjectInfoBySchool.total[header.id];
    return _.round(totalObj.sum / (totalObj.count * totalObj.fullMark), 2);
}

function getSubjectOrder(diffBySubject, relaDiffBySubject, headers){
    var paperIdMap = {};
    _.forEach(headers.slice(1), header => {paperIdMap[header.id] = header});

    var diffList = _.map(diffBySubject, (diff, paperid) => {return {id: paperid, diff: diff}});
    diffList = _.orderBy(diffList, ['diff'], ['desc']);
    var diffSubjectOrder = _.map(diffList, item => {return paperIdMap[item.id].subject});

    var relaDiffList = _.map(relaDiffBySubject, (relaDiff, paperid) => {return {id: paperid, relaDiff: relaDiff}});
    relaDiffList = _.orderBy(relaDiffList, ['relaDiff'], ['desc']);
    var relaDiffSubjectOrder = _.map(relaDiffList, item=> {return paperIdMap[item.id].subject});

    return {diffSubjectOrder, relaDiffSubjectOrder};    
}