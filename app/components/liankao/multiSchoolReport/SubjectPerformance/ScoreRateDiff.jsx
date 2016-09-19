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
 * headers,
 */
export default class ScoreRateDiff extends React.Component{
    constructor(props) {
        super(props);
        this.list = [{type: 0, value: '学科离差顺序'}, {type: 1, value: '相对离差顺序'}]
        this.state = {
            currentType: this.list[0] 
        }
        this.subjects = _.map(props.headers.slice(1), header => {return header.subject});
    }
    onChangeType (item) {
        this.setState({
            currentType: item
        })
    }
    render(){
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
        config['series'] = [{name: '离差', data: _.range(config.xAxis.categories.length).map(num => {return Math.random()}), color: colorsMap.B03}]; //假数据
        return (
            <div style={{ position: 'relative' }}>
                <div style={{ margin: '30px 0 20px 0' }}>
                    <span className={commonClass['sub-title']}>学科的平均得分率差异</span>
                    <div className={commonClass['title-desc']} style={{marginTop: 20}}>
                        从各学科的成绩表现看，每个学科的学校平均得分率最高的与最低之间的离差，从大到小的顺序是 语文、数学 、化学 、 英语、 生物 。
                        如果联系到学科的命题难度，其相对离差从大到小的的顺序是 化学 、 英语、 生物、语文、数学 。
                        离差较大的学科，反映出学校水平差距较大。离差较小的学科，反映出该学科教学效果比较整齐。（注：语文是母语，学生水平离差来得较小应是常态）
                    </div>
                </div>
                <DropdownList list={this.list} onClickDropdownList={this.onChangeType.bind(this)} style={{position: 'absolute', right: 0, top: 0, zIndex: 1}}/>
                <ReactHighcharts config={config} style={{width: '100%', height: '100%'}} />

            </div>
        )
    }
    
}

