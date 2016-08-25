import React from 'react';
import ReactHighcharts from 'react-highcharts';
import commonClass from '../../../../common/common.css';
import DropdownList from '../../../../common/DropdownList';



/**
 * chartData: 包含categories和series数据的对象;
 * classList: 班级名称列表
 *
 */
class SegmentDetailChart extends React.Component {
    constructor(props) {
        super(props);
        var {chartData} = this.props;
        this.state = {
            seriesShow: chartData.series.length >= 2 ? chartData.series.slice(0,2) : chartData.series.slice(0,1)
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.needRefresh) {
            var {chartData} = nextProps;
            var classList = [];
            _.forEach(chartData.series, item => {
                classList.push({ value: item.name })
            })
            this.setState({
                seriesShow: chartData.series.length >= 2 ? chartData.series.slice(0, 2) : chartData.series.slice(0, 1),
                classList: classList
            })
        } else if (nextProps.chartData.series[0].data.length !== this.state.seriesShow[0].data.length){
            var newSeriesShow = [];
            var {seriesShow} = this.state;
            _.forEach(seriesShow, seriesItem => {
                newSeriesShow.push(_.find(nextProps.chartData.series, {name: seriesItem.name}));
            })
            this.setState({
                seriesShow: newSeriesShow
            })
        }
    }
    onSelectClass(item) {
        var {chartData} = this.props;
        var hasShown = _.find(this.state.seriesShow, {name: item.value});
        var colorList = ['#0099ff','#33cccc','#33cc33','#ff9900','#ff6633'];
        //根据是否选中情况筛选
        if(hasShown) {
            this.setState({
                seriesShow: _.reject(this.state.seriesShow, {name: item.value})
            })
        } else {
            this.state.seriesShow.push(_.find(chartData.series, {name: item.value}))
            this.setState({
                seriesShow: this.state.seriesShow
            })
        }
        //遍历this.state.seriesShow 添加颜色属性
            _.range(_.size(this.state.seriesShow)).map((num)=>{return this.state.seriesShow[num].color=colorList[num]});
    }
    render() {
        var {chartData, classList, needRefresh, dropdownListRefreshHandler} = this.props;
        var {seriesShow} = this.state;
        var chartWidth=(this.state.seriesShow.length)*(chartData.categories.length)>=50?((this.state.seriesShow.length)*(chartData.categories.length)*21)+60*(chartData.categories.length):1140;
        var config = {
            chart: {
                type: 'column',
                width:chartWidth
            },
            colors:['#0099ff','#33cccc','#33cc33','#ff9900','#ff6633'],
            title: {
                text: '',
            },
            subtitle: {
                text: '',//'各分数段详细人数',
            },
            xAxis: {
                tickWidth: '0px',//不显示刻度
                categories: chartData.categories,
            },
            yAxis: {
                allowDecimals: true,//刻度允许小数
                lineWidth: 1,
                gridLineDashStyle: 'Dash',
                gridLineColor: '#f2f2f3',
                title:{
                  text:'（人）',
                  align:'high',
                  rotation:360,
                  offset:-20,
                  style: {
                      "color": "#767676",
                      "fontSize": "12px"
                 }
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

            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'top'
            },
            plotOptions: {
                column: {
                    pointWidth: 16,//柱宽
                }
            },
            series: seriesShow,
            tooltip: {
                enabled: false,
                backgroundColor: '#000',
                borderColor: '#000',
                style: {
                    color: '#fff'
                },
                formatter: function () {
                    return this.series.name + ':' + this.point.y + '人'
                }
            },
        };
        return (
            <div>
                <div className={commonClass['sub-title']} style={{ margin: '27px 0 20px 0',position:'relative' }}>
                    各分数段详细人数
                    <div style={{ float: 'right' }}>
                        <span style={{ fontSize: 12 ,marginRight:'100px'}}>对比对象（最多5个）</span>
                         <DropdownList list={classList} isMultiChoice multiChoiceNum={5}
                                      style={{ display: 'inline-block', marginLeft: 10,position:'absolute',right:0,top:-3, zIndex:1 }}
                                      onClickDropdownList={this.onSelectClass.bind(this)}
                                      needRefresh={needRefresh}
                                      dropdownListRefreshHandler={dropdownListRefreshHandler}/>
                    </div>
                </div>
                <div style={{width:'1140px',height:'420px',overflow:'auto',paddingLeft:10}}>
                <ReactHighcharts config={config} style={{ width: '100%', height: '400px'}}></ReactHighcharts>
                </div>
            </div>
        )
    }
}

export default SegmentDetailChart;
