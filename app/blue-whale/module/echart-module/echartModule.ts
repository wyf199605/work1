/// <amd-module name="EchartModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

declare const echarts;

interface DataType {
    // 标题
    title?: {
        text: string, // 名称
        textStyle?: {
            fontFamily?: string, // 字体
            fontSize?: number, // 字体大小
            color?: string   // 字体颜色
            // fontWeight: 'bold',

        },
        padding?: string|number,   // 边距
    },
    grid?: {
        top?: string|number,
        left?: string|number,
        right?: string|number,
        bottom?: string|number,
        containLabel?: boolean // 区域是否包含坐标轴的刻度标签
    },
    // 鼠标移动提示内容
    tooltip?: {
        show?: boolean,
    },
    legend?: {
        data: Array<string>,
        top?: string|number,
        left?: string|number,
        right?: string|number,
        bottom?: string|number,
        orient?: string, // 图例列表的布局朝向 'horizontal' || 'vertical'

    },
    xAxis: {
        data?: Array<string>,
        splitLine?: object,
        axisLine?: object,
        axisLabel?: object
    },
    yAxis: {
        data?: Array<string>,
        splitLine?: object,
        axisLine?: object,
        axisLabel?: object,
    },
    series:Array<SeriesType>,
    dataZoom?: object;   // 底部滚动条

}
interface SeriesType {
    name: string,   
    type: string,   
    lineMaxWidth?: number | string,
    smooth?: boolean,
    symbol?: string,
    symbolSize?: number | string,
    data: Array<any>,
    
}
export class EchartModule {
    
    /**
     * echart 普通图表
     * @param chartData echart数据
     * @param domId 获取的dom元素id进行渲染绘制
     */
    static echartFn(chartData: DataType, domId: string) {
        let lineChart = echarts.init(document.getElementById(domId));
        let defaultData = {
            title: {
                // text: '本月经营分析',
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
                // data: ['销量', '购买力'],
                top: 15,
            },
            xAxis: {
                // data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
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
                // {
                //     name: '销量',
                //     type: 'line',
                //     color: '#609ee9',
                //     lineMaxWidth: '10',
                //     smooth: true,
                //     symbol: 'circle',
                //     symbolSize: 8,
                //     data: [5, 20, 36, 10, 10, 20]
                // },
                // {
                //     name: '购买力',
                //     type: 'line',
                //     color: '#f7ba2a',
                //     smooth: true,
                //     lineMaxWidth: '10',
                //     symbol: 'circle',
                //     symbolSize: 8,
                //     data: [7, 18, 46, 52, 60, 16]
                // },
                // {
                //     name: '进货量',
                //     type: 'line',
                //     smooth: true,
                //     color: '#39ca74',
                //     lineMaxWidth: '10',
                //     symbol: 'circle',
                //     symbolSize: 8,
                //     data: [55, 24, 36, 33, 42, 28]
                // },
            ]
        };
        Object.assign(defaultData, chartData);
        lineChart.setOption(chartData);
        return lineChart;
    }
}