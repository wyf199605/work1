/// <amd-module name="ChartTableModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "blue-whale/pages/basicPage";
import tools = G.tools;
import d = G.d;
import { IBwTableModulePara } from "../table/BwTableModule";
import { FastBtnTable } from "global/components/FastBtnTable/FastBtnTable";



declare const echarts;

export class ChartTableModule {

    parentDom: Node;  // 当前表格的父元素
    ui: IBW_Table; // 当前UI元素
    chartDom: HTMLElement;  // 当前 图表dom元素
    wrapper: HTMLElement;   // 当前表格 dom元素
    chartBtnsContainer: HTMLElement; // 图表自制按钮容器
    ftable: FastBtnTable  // 对表格基本操作的方法对象


    constructor(ui: IBW_Table, wrapper: HTMLElement, data, ftable: FastBtnTable) {
        this.parentDom = wrapper.parentNode;
        this.ui = ui;
        this.wrapper = wrapper;
        this.ftable = ftable;
        // debugger;
        this.initData();
    }

    initData() {
        this.wrapper.style.display = 'none';
        // this.parentDom.appendChild(this.render());
        this.parentDom.insertBefore(this.render(),this.parentDom.childNodes[0]);
        let line = this.lineChartFn();
        window.onresize = () => {
            line.resize();
        }
        this.chartBtnsClk();
    }

    /**
     * 图表渲染函数
     */
    render() {
        this.chartDom = <section class="chart-container" >图形</section>
        this.chartBtnsContainer = <div class="chart-table">
            <section class="chart-btns">
                <button class="switch-table btn-default" data-type="switchTable">表格</button>
            </section>
            {this.chartDom}
        </div>
        return this.chartBtnsContainer;
    }

    /**
     * 监控自制按钮事件
     */
    chartBtnsClk() {
        this.chartBtnsContainer.addEventListener('click', (e: Event) => {
            let type = e.target && e.target['dataset'] && e.target['dataset'].type;
            switch (type) {
                case 'switchTable':
                    debugger;
                    this.chartBtnsContainer.style.display = 'none';
                    this.wrapper.style.display = 'block';
                    this.ftable.recountWidth();
                    break;
            }
        })
    }
    /**
     * 测试表格
     */
    lineChartFn() {

        let lineChart = echarts.init(this.chartDom);
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
}