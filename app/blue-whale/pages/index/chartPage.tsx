/// <amd-module name="ChartPage"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "basicPage";
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import chinaJson from '../../module/chartPageComponents/stacked-histogram-component/stacked-histogram.component';
declare const echarts;
import { EchartModule } from "blue-whale/module/echart-module/echartModule";



interface ICollectPara {
    dom?: HTMLElement,
    title?: string
}
export class ChartPage extends BasicPage {
    container: HTMLElement;
    constructor(para: ICollectPara) {
        super(para);
        this.container = para.dom;
        console.log(EchartModule.echartFn);
        G.d.append(para.dom, this.render());
        let stackedHistogram = this.stackedHistogramFn();
        stackedHistogram.on('click', function (params) {
            // 控制台打印数据的名称
            console.log(params);
        });
        let lineChart = this.lineChartFn();
        let areaChart = this.areaChartFn();
        let pieChart = this.pieAndStackChartFn();
        let chinaMap = this.chinaMapFn();
        let lineStackedChart = this.stackedChartFn();
        let oneLineChart = this.oneLineChartFn();
        window.onresize = function () {
            stackedHistogram.resize();
            lineChart.resize();
            areaChart.resize();
            pieChart.resize();
            chinaMap.resize();
            lineStackedChart.resize();
            oneLineChart.resize();
        };
    }
    render() {
        // BwRule.Ajax.fetch(CONF.siteUrl + "/app_sanfu_retail/null/modularUi/select").then(res => {
        //     let chartArr = [];
        //     if (res.response && res.response.elements) {
        //         let chart = {
        //             // title: 
        //         }
        //         console.log(res);
        //     }
        // });
        return (
            <main class="chart-page">
                <div class="main-first-part">
                    <section class="first-part-section this-week">
                        <div class="mg-right-10">FIRST</div>
                        <div>second</div>
                    </section>
                    {this.myBaseInfoFn()}
                    <section class="first-part-section common-chart">
                        <div id="stacked-histogram" style="width: 100%;height:100%"></div>
                    </section>
                    <section class="first-part-section common-chart">
                        <div id="line-chart" style="width: 100%;height:100%"></div>
                    </section>
                    <section class="first-part-section common-chart">
                        <div id="area-chart" style="width: 100%;height:100%"></div>
                    </section>
                    <section class="first-part-section common-chart combine-pie-stack">
                        <div id="combine-pie-chart" style="width: 50%;height:100%"></div>
                        <div id="combine-stack-chart" style="width: 50%;height:100%"></div>
                    </section>
                </div>
                <div class="main-china-map">
                    <div id="china-map" style="width: 100%;height:100%"></div>
                </div>
                <div class="main-first-part">
                    <section class="first-part-section common-chart">
                        {this.auditProcess()}
                    </section>
                    <section class="first-part-section common-chart">
                        <div id="stacked-chart" style="width: 100%;height:100%"></div>
                        <div id="one-line-chart" style="width: 100%;height:100%"></div>
                    </section>
                </div>
            </main>
        )
    }

    myBaseInfoFn() {
        return (
            <section class="first-part-section my-base-info">
                <p class="wait-rewiew">
                    <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                    </span>
                    <span>待审核</span>
                    <span>15</span>
                </p>
                <p class="info-notice">
                    <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                    </span>
                    <span>消息通知</span>
                    <span>15</span>
                </p>
                <p class="leave-review">
                    <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                    </span>
                    <span>请假审核</span>
                    <span>15</span>
                </p>
                <p class="my-application">
                    <span class="base-info-span-bg iconfont icon-buoumaotubiao12">
                    </span>
                    <span>我的申请</span>
                    <span>15</span>
                </p>
            </section>
        )
    }



    /**
     * 折线图（背景）
     */
    areaChartFn() {
        let areaChart = echarts.init(document.getElementById('area-chart'));
        const areaChartData = {
            title: {
                text: '本月经营分析',
                textStyle: {
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: '#333'
                    // fontWeight: 'bold',

                },
                padding: 15,
            },
            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: ['销量', '购买力'],
                top: 15,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                },
            },

            yAxis: {
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'line',
                    color: '#609ee9',
                    lineMaxWidth: '10',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [5, 20, 36, 10, 10, 20],
                    areaStyle: {}
                },
                {
                    name: '购买力',
                    type: 'line',
                    color: '#f7ba2a',
                    smooth: true,
                    lineMaxWidth: '10',
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [7, 18, 46, 52, 60, 16],
                    areaStyle: {}
                },
                {
                    name: '进货量',
                    type: 'line',
                    smooth: true,
                    color: '#cfdce8',
                    lineMaxWidth: '10',
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [55, 24, 36, 33, 42, 28],
                    areaStyle: {}
                },
            ]
        };
        areaChart.setOption(areaChartData);
        return areaChart;
    }



    /**
     * 中国地图
     */
    chinaMapFn() {

        let myData = [

            {
                name: '海门',
                value: [121.15, 31.89, 90],
                itemStyle: {
                    color: '#609ee9'
                }

            },
            {
                name: '鄂尔多斯',
                value: [109.781327, 39.608266, 120],
                itemStyle: {
                    color: '#f7ba2a'
                }
            },
            {
                name: '招远',
                value: [120.38, 37.35, 142],
                itemStyle: {
                    color: '#609ee9'
                }
            },
            {
                name: '舟山',
                value: [122.207216, 29.985295, 123],
                itemStyle: {
                    color: '#39ca74'
                }
            }
        ];

        echarts.registerMap('china', chinaJson); // 注册地图

        var chinaMap = echarts.init(document.getElementById('china-map'));

        var chinaMapOption = {
            title: {
                text: '地图分布图',
                textStyle: {
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: '#333'
                    // fontWeight: 'bold',

                },
                padding: 15,
            },
            tooltip: {},
            geo: {
                map: 'china',
                roam: true,
            },
            series: [
                {
                    name: '销量', // series名称
                    type: 'scatter', // series图表类型
                    coordinateSystem: 'geo', // series坐标系类型
                    data: myData
                }
            ]
        }

        chinaMap.setOption(chinaMapOption);
        window.onresize = function () {
            chinaMap.resize();
        }
        return chinaMap;
    }

    /**
     * 审计流程进度
     */
    auditProcess() {
        let barBg = [
            { backgroundColor: '#609ee9' },
            { backgroundColor: '#f7ba2a' },
            { backgroundColor: '#fd5457' },
            { backgroundColor: '#39ca74' }];
        return (
            <div class="audit-process">
                <p class="audit-title">审计流程进度</p>
                <ul>
                    <li>
                        <p>出差申请</p>
                        <p class="my-progress-bar">
                            <span class="progress-bar-bg">
                                <span class="my-progress-color" style={barBg[0]}></span>
                            </span>
                            <span class="my-progress-bar-info">(65%, 剩余3项)</span>
                        </p>
                    </li>
                    <li>
                        <p>出差申请</p>
                        <p class="my-progress-bar">
                            <span class="progress-bar-bg">
                                <span class="my-progress-color" style={barBg[1]}></span>
                            </span>
                            <span class="my-progress-bar-info">(65%, 剩余3项)</span>
                        </p>
                    </li>
                    <li>
                        <p>出差申请</p>
                        <p class="my-progress-bar">
                            <span class="progress-bar-bg">
                                <span class="my-progress-color" style={barBg[2]}></span>
                            </span>
                            <span class="my-progress-bar-info">(65%, 剩余3项)</span>
                        </p>
                    </li>
                    <li>
                        <p>出差申请</p>
                        <p class="my-progress-bar">
                            <span class="progress-bar-bg">
                                <span class="my-progress-color" style={barBg[3]}></span>
                            </span>
                            <span class="my-progress-bar-info">(65%, 剩余3项)</span>
                        </p >
                    </li>
                </ul>
            </div>
        )
    }

    /**
     * 柱状图折线图组合(1 柱状图)
     */
    stackedChartFn() {
        // let stackedChart = echarts.init(document.getElementById('stacked-chart'));
        const stackedChartOption = {
            title: {
                text: '本月经营分析',
                textStyle: {
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: '#333'
                    // fontWeight: 'bold',

                },
                padding: 15,
            },
            grid: {
                show: false,
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: ['销量', '购买力'],
                top: 15,
            },
            yAxis: {
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },

            xAxis: {
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    color: '#609ee9',
                    barMaxWidth: '10',
                    data: [5, 20, 70, 10, 10, 20]
                },
                {
                    name: '购买力',
                    type: 'bar',
                    color: '#f7ba2a',
                    barMaxWidth: '10',
                    data: [7, 18, 46, 52, 60, 16]
                },
                {
                    name: '进货量',
                    type: 'bar',
                    color: '#39ca74',
                    barMaxWidth: '10',
                    data: [55, 24, 36, 33, 42, 28]
                },
            ]
        };
        // stackedChart.setOption(stackedChartOption);
        return EchartModule.echartFn(stackedChartOption, 'stacked-chart');
    }
    /**
     * 柱状图折线图组合(2 折线图)
     */
    oneLineChartFn() {
        // let oneLineChart = echarts.init(document.getElementById('one-line-chart'));
        const oneLineChartData = {

            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            // legend: {
            //     data: ['销量', '购买力'],
            //     top: 15,
            // },
            yAxis: {
                show: true,
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },

            xAxis: {
                show: true,
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'line',
                    // color: '#fd5457',
                    itemStyle: {
                        color: '#fd5457',
                        shadowColor: '#facfd0',
                        shadowBlur: 15
                    },
                    lineStyle: {
                        color: '#fd5457',
                    },

                    lineMaxWidth: '10',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [5, 20, 36, 10, 10, 100],
                }
            ]
        };
        // oneLineChart.setOption(oneLineChartData);
        // return oneLineChart;
        return EchartModule.echartFn(oneLineChartData, 'one-line-chart');

    }



    /**
     * 折线图
     */
    lineChartFn() {

        // let lineChart = echarts.init(document.getElementById('line-chart'));
        const lineChartData = {
            title: {
                text: '本月经营分析',
                textStyle: {
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: '#333'
                    // fontWeight: 'bold',

                },
                padding: 15,
            },
            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: ['销量', '购买力'],
                top: 15,
            },
            xAxis: {
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },

            yAxis: {
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'line',
                    color: '#609ee9',
                    lineMaxWidth: '10',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [5, 20, 36, 10, 10, 20]
                },
                {
                    name: '购买力',
                    type: 'line',
                    color: '#f7ba2a',
                    smooth: true,
                    lineMaxWidth: '10',
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [7, 18, 46, 52, 60, 16]
                },
                {
                    name: '进货量',
                    type: 'line',
                    smooth: true,
                    color: '#39ca74',
                    lineMaxWidth: '10',
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [55, 24, 36, 33, 42, 28]
                },
            ]
        };
        // lineChart.setOption(lineChartData);

        return EchartModule.echartFn(lineChartData, 'line-chart');

    }

    /**
     * 柱状图
     */
    stackedHistogramFn() {
        // let stackedHistogram = echarts.init(document.getElementById('stacked-histogram'));
        const stackedHistogramOption = {
            title: {
                text: '本月经营分析',
                // textStyle: {
                //     fontFamily: 'monospace',
                //     fontSize: 18,
                //     color: '#333'
                //     // fontWeight: 'bold',

                // },
                // padding: 15,
            },
            dataZoom: {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                //   xAxisIndex: [0],
                // left: '9%',
                // bottom: -5,
                // start: 10,
                // end: 1000 //初始化滚动条
            },
            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: ['销量', '购买力'],
                top: 15,
            },
            xAxis: {
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子", "衬", "羊毛", "雪纺", "袜子", "衬", "羊毛", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺", "雪纺", "袜子", "衬", "羊毛", "雪纺"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },

            yAxis: {
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    color: '#609ee9',
                    barMaxWidth: '10',
                    data: [5, 20, 36, 10, 10, 20, 100, 30, 33, 36, 10, 10, 20, 100, 30, 33]
                },
                {
                    name: '购买力',
                    type: 'bar',
                    color: '#f7ba2a',
                    barMaxWidth: '10',
                    data: [7, 18, 46, 52, 60, 16, 20, 36, 10, 36, 10, 10, 20, 100, 30, 33]
                },
                {
                    name: '进货量',
                    type: 'line',
                    color: '#39ca74',
                    barMaxWidth: '10',
                    data: [55, 24, 36, 33, 42, 28, 46, 52, 60, 36, 10, 10, 20, 100, 30, 33]
                },
            ]
        };
        // stackedHistogram.setOption(stackedHistogramOption);
        return EchartModule.echartFn(stackedHistogramOption, 'stacked-histogram');
    }

    /**
     * 饼状图&柱状图组合
     */
    pieAndStackChartFn() {
        let pieChart = echarts.init(document.getElementById('combine-pie-chart'));
        const pieChartData = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                right: '10%',
                y: 'center',
                data: ['直接访问', '邮件营销', '联盟广告', '视频广告']
            },
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['35%', '50%'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '15',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: 335,
                            name: '直接访问',
                            itemStyle: {
                                color: '#609ee9',
                            }
                        },
                        {
                            value: 310,
                            name: '邮件营销',
                            itemStyle: {
                                color: '#fd5457',
                            }
                        },
                        {
                            value: 234,
                            name: '联盟广告',
                            itemStyle: {
                                color: '#39ca74',
                            }
                        },
                        {
                            value: 135,
                            name: '视频广告',
                            itemStyle: {
                                color: '#f7ba2a',
                            }
                        }
                    ]
                }
            ]
        };
        pieChart.setOption(pieChartData);

        let combineStackChart = echarts.init(document.getElementById('combine-stack-chart'));
        const combineStackChartOption = {
            title: {
                text: '本月经营分析',
                textStyle: {
                    fontFamily: 'monospace',
                    fontSize: 18,
                    color: '#333'
                    // fontWeight: 'bold',

                },
                padding: 15,
            },
            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: ['销量', '购买力'],
                top: 15,
                right: '10%',
            },
            xAxis: {
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },

            yAxis: {
                splitLine: {
                    lineStyle: {
                        // 使用深浅的间隔色
                        color: '#f7f7f8'
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#d5d5d5'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    color: '#609ee9',
                    barMaxWidth: '10',
                    data: [5, 20, 36, 10, 10, 20]
                },
                {
                    name: '购买力',
                    type: 'bar',
                    color: '#f7ba2a',
                    barMaxWidth: '10',
                    data: [7, 18, 46, 52, 60, 16]
                },
                {
                    name: '进货量',
                    type: 'bar',
                    color: '#39ca74',
                    barMaxWidth: '10',
                    data: [55, 24, 36, 33, 42, 28]
                },
            ]
        };
        combineStackChart.setOption(combineStackChartOption);
        return combineStackChart;
    }







}