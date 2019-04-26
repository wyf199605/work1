
/// <amd-module name="ChartPageComponnet"/>
/// <amd-dependency path="echarts" name="echarts"/>

declare const echarts;


interface Chart {
    title?: {
        show?: boolean,
        text?: string,
        textStyle?: {
            fontFamily?: string,
            fontSize?: number,
            color?: string
        },
        padding?: number,
    },

}



export default class ChartComponent {
    /**
     * 折线图
     */
    lineChartFn() {
        
        let lineChart = echarts.init(document.getElementById('line-chart'));
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
        lineChart.setOption(lineChartData);
        return lineChart;

    }

    /**
     * 柱状图
     */
    stackedHistogramFn() {
        let stackedHistogram = echarts.init(document.getElementById('stacked-histogram'));
        const stackedHistogramOption = {
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
            dataZoom: {
                type: 'slider',
      show: true,
      xAxisIndex: [0],
    //   xAxisIndex: [0],
      left: '9%',
      bottom: -5,
      start: 10,
      end: 1000 //初始化滚动条
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
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子","衬", "羊毛", "雪纺","袜子","衬", "羊毛", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺", "雪纺","袜子","衬", "羊毛", "雪纺"],
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
                    data: [5, 20, 36, 10, 10, 20, 100,30,33, 36, 10, 10, 20, 100,30,33]
                },
                {
                    name: '购买力',
                    type: 'bar',
                    color: '#f7ba2a',
                    barMaxWidth: '10',
                    data: [7, 18, 46, 52, 60, 16, 20, 36, 10, 36, 10, 10, 20, 100,30,33]
                },
                {
                    name: '进货量',
                    type: 'bar',
                    color: '#39ca74',
                    barMaxWidth: '10',
                    data: [55, 24, 36, 33, 42, 28, 46, 52, 60, 36, 10, 10, 20, 100,30,33]
                },
            ]
        };
        stackedHistogram.setOption(stackedHistogramOption);
        return stackedHistogram;
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