
/// <amd-module name="StackedHistogramComponnet"/>
/// <amd-dependency path="echarts" name="echarts"/>
declare const echarts;


export default class StackedHistogramComponnet  {
    constructor() {
        // this.render();
        this.initData();
    }
    initData() {
        // app.title = '堆叠柱状图';
        let stackedHistogram = echarts.init(document.getElementById('stacked-histogram'));
        const data = {
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
                data:['销量','购买力'],
                top: 15,
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"],
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
        // return option;
        stackedHistogram.setOption(data);
        // setTimeout(function (){
            
        // },200)
        window.onresize = function () {
            stackedHistogram.resize();
        }
      }
    render() {
        return <div id="stacked-histogram" style="width: 100%;height:100%"></div>
    }
}