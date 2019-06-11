/// <amd-module name="ChartTableModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "blue-whale/pages/basicPage";
import tools = G.tools;
import d = G.d;
import { IBwTableModulePara } from "../table/BwTableModule";
import { FastBtnTable } from "global/components/FastBtnTable/FastBtnTable";



declare const echarts;

interface Data {
    errorCode: number;
    head: any;
    body: {
        bodyList: Array<{
            dataType: number,
            dataList: Array<any>,
            meta: Array<any>,
        }>
    };

    bodyData?: Array<any>
}

export class ChartTableModule {

    parentDom: Node;  // 当前表格的父元素
    ui: IBW_Table; // 当前UI元素
    chartDom: HTMLElement;  // 当前 图表dom元素
    wrapper: HTMLElement;   // 当前表格 dom元素
    chartBtnsContainer: HTMLElement; // 图表自制按钮容器
    ftable: FastBtnTable  // 对表格基本操作的方法对象
    data: Data; // 接口请求的表格数据 
    color = ['#609ee9', '#f7ba2a', '39ca74', '#fc90a6', '#bbadf3', '#48bfe3', '#fca786', '#fe94ea', '#86e1fc', '#496169'];


    constructor(ui: IBW_Table, wrapper: HTMLElement, data: Data, ftable: FastBtnTable) {
        this.parentDom = wrapper.parentNode;
        this.ui = ui;
        this.wrapper = wrapper;
        this.ftable = ftable;
        this.data = data;
        this.initData();
        this.initTableBtns();
    }

    initData() {
        this.wrapper.style.display = 'none';
        this.parentDom.insertBefore(this.render(), this.parentDom.childNodes[0]);
        // this.parentDom.appendChild(this.render());
        let chart;
        debugger;
        switch (this.ui.uiType) {
            case 'select':
            case 'table':
            case 'web':
                chart = this.ui.showType === 'pie'? this.initPieChartFn(): this.initCommonChartFn();
                break;
            case 'detail':
                chart = this.ui.fields ? null : this.ui.showType === 'pie'? this.initPieChartFn(): this.initCommonChartFn();
                break;
        }
        window.onresize = () => {
            chart && chart.resize();
        }
        this.chartBtnsClk();
    }

    initTableBtns() {
        console.log(this.wrapper);
        let btnsContainer = d.query('.fast-table-btns', this.wrapper);
        if (!btnsContainer) return;
        
        let btn: HTMLElement = <button class="btn-default">图表</button>
        btnsContainer.appendChild(btn);
        btn.onclick = () => {
            this.wrapper.style.display = 'none';
            this.chartBtnsContainer.style.display = 'block';
        }
    }
    /**
     * 通用表格处理方法 
     */

    initCommonChartFn() {
        let chart = echarts.init(this.chartDom);
        this.data.bodyData = [];
        this.data.body.bodyList[0].dataList.forEach(list => {
            let obj = {};
            list.forEach((ele, index) => {
                obj[this.data.body.bodyList[0].meta[index]] = ele;
            });
            this.data.bodyData.push(obj);
        });
        let caption = this.ui.caption;
        let type = this.ui.showType || 'line';
        let xAxisName: Array<string> = this.ui.local.xCoordinate.split(',');
        let xAxisData: Array<any> = [];
        let legendName: Array<string> = this.ui.local.yCoordinate.split(',');
        let legendData: Array<string> = [];
        let series = [];
        xAxisName.forEach(name => {
            xAxisData = this.data.bodyData.map(item => item[name]);
        });
        legendName.forEach((legend, i) => {

            let seriesItem = {
                data: [],
                name: '',
                type: type,
                color: this.color[i],
                lineMaxWidth: '10',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
            }
            seriesItem.data = this.data.bodyData.map(item => item[legend]);
            // seriesItem.name = legendData[i];
            this.ui.cols.forEach(col => {
                if (col.name === legend) {
                    legendData.push(col.caption);
                    seriesItem.name = col.caption;
                }
            });
            series.push(seriesItem);
        });
         
        let chartData = {
            title: {
                text: caption,
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
                data: tools.isMb ?  [] : legendData,
                top: 15,
            },
            xAxis: {
                data: xAxisData,
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
            series: series
        };
        chart.setOption(chartData);
        return chart;


    }

    /**
     * 饼状图
     */
    initPieChartFn() {
        let yCoordinate = this.ui.local.yCoordinate.split(',');
        this.chartDom.style.height = yCoordinate? `${yCoordinate.length * 20}rem` : '20rem';
        let chart = echarts.init(this.chartDom);
        this.data.bodyData = [];
        this.data.body.bodyList[0].dataList.forEach(list => {
            let obj = {};
            list.forEach((ele, index) => {
                obj[this.data.body.bodyList[0].meta[index]] = ele;
            });
            this.data.bodyData.push(obj);
        });
        let caption = this.ui.caption;
        let xAxisName: Array<string> = this.ui.local.xCoordinate.split(',');
        let xAxisData: Array<any> = [];
        let legendName: Array<string> = yCoordinate;
        let legendData: Array<string> = [];
        let series = [];
        xAxisName.forEach(name => {
            xAxisData = this.data.bodyData.map(item => item[name]);
        });
        legendName.forEach((legend, i) => {
            let yAxis = ((i + 1) / legendName.length * 100 - 5 * (i + 1)) + '%';
            let seriesItem = {
                type: 'pie',
                radius: [0, '20%'],
                center: ['50%', yAxis],
                data:this.data.bodyData.map(item => {
                    return {
                        name: item[this.ui.local.xCoordinate],
                        value: item[legend],
                        itemStyle: {
                            color: this.color[i]
                        }
                    }
                })
            }
            // seriesItem.data = this.data.bodyData.map(item => item[legend]);
            // // seriesItem.name = legendData[i];
            // this.ui.cols.forEach(col => {
            //     if (col.name === legend) {
            //         legendData.push(col.caption);
            //         seriesItem.name = col.caption;
            //     }
            // });
            series.push(seriesItem);
        });
         
        let chartData = {
            title: {
                text: caption,
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
                data: tools.isMb ?  [] : xAxisData,
                top: 15,
            },
            series: series
        };
        chart.setOption(chartData);
        // debugger;
        return chart;
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
                    this.chartBtnsContainer.style.display = 'none';
                    this.wrapper.style.display = 'block';
                    this.ftable.recountWidth();
                    break;
            }
        })
    }
    
}