/// <amd-module name="ChartTableModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "blue-whale/pages/basicPage";
import tools = G.tools;
import d = G.d;
import { IBwTableModulePara } from "../table/BwTableModule";
import { FastBtnTable } from "global/components/FastBtnTable/FastBtnTable";
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import sys = BW.sys;



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

    parentDom: HTMLElement;  // 当前表格的父元素
    ui: IBW_Table; // 当前UI元素
    maxChartDom: HTMLElement; // 移动端图表放大
    maxChart;
    chartDom: HTMLElement;  // 当前 图表dom元素
    chart;
    wrapper: HTMLElement;   // 当前表格 dom元素
    chartBtnsContainer: HTMLElement; // 图表自制按钮容器
    ftable: FastBtnTable  // 对表格基本操作的方法对象
    data: Data; // 接口请求的表格数据 
    color = ['#609ee9', '#f7ba2a', '39ca74', '#fc90a6', '#bbadf3', '#48bfe3', '#fca786', '#fe94ea', '#86e1fc', '#496169'];


    constructor(ui: IBW_Table, wrapper: HTMLElement, data: Data, ftable: FastBtnTable) {
        this.parentDom = wrapper.parentElement;
        this.ui = ui;
        this.wrapper = wrapper;
        this.ftable = ftable;
        this.data = data;
        // debugger;
        this.initData();
        this.initTableBtns();
    }

    initData() {
        this.maxChartDom = <div class="max-chart"></div>
        this.wrapper.style.display = 'none';
        if (this.ui.uiType === 'detail') {

            let chartTableEle = d.query('.chart-table', this.parentDom);
            chartTableEle && this.parentDom.removeChild(chartTableEle);
        }
        this.parentDom.insertBefore(this.render(), this.parentDom.childNodes[0]);
        // this.parentDom.appendChild(this.render());
        // let chart;
        switch (this.ui.uiType) {
            case 'select':
            case 'table':
            case 'web':
            case 'drill':
                this.chart = this.ui.showType === 'pie' ? this.initPieChartFn() : this.initCommonChartFn(this.chartDom);
                break;
            case 'detail':
                this.ui.cols = this.ui.fields;
                this.chart = this.ui.showType === 'pie' ? this.initPieChartFn() : this.initCommonChartFn(this.chartDom);
                break;
            // case 'drill':
            //     this.initDrillChart();
            //     break;
        }
        window.onresize = () => {
            this.chart && this.chart.resize();
        }
        window.addEventListener("orientationchange", () => {
            // Announce the new orientation number
            // alert(window.orientation);
            // chart && chart.resize();
            // this.maxChart && this.maxChart.resize();
            // this.maxChart && this.maxChart.resize();
            setTimeout(() => {
                this.chart && this.chart.resize();
                this.maxChart && this.maxChart.resize();
            }, 300);

        }, false);
        this.chartBtnsClk();
    }

    initTableBtns() {
        console.log(this.wrapper);
        let btnsContainer = d.query('.fast-table-btns', this.wrapper);
        if (!btnsContainer) return;

        let btn: HTMLElement = <button class="btn button-type-default button-small chart-btn">图表</button>
        d.query('.chart-btn', btnsContainer) && btnsContainer.removeChild(d.query('.chart-btn', btnsContainer));
        btnsContainer.appendChild(btn);
        btn.onclick = () => {

            this.wrapper.style.display = 'none';
            this.chartBtnsContainer.style.display = 'block';
            this.chart.resize();
        }
    }
    /**
     * 通用表格处理方法 
     */

    initCommonChartFn(chartEle: HTMLElement, max?: boolean) {
        chartEle.parentElement.style.height = '25rem';
        !max && (chartEle.style.height = '20rem');
        // this.chartBtnsContainer.style.width = '100%';
        // alert(chartEle.style.width);
        let chart = echarts.init(chartEle);
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
        // let type = 'bar';
        let xAxisName: string = this.ui.local.xCoordinate.split(',').length >= 2 ? this.ui.local.xCoordinate.split(',')[0] : this.ui.local.xCoordinate.toUpperCase();
        let xAxisData: Array<any> = this.data.bodyData.map(item => item[xAxisName]);
        let legendName: Array<string> = this.ui.local.yCoordinate.toUpperCase().split(',');
        let legendData: Array<string> = [];
        let series = [];
        legendName.forEach((legend, i) => {

            let seriesItem = {
                data: [],
                name: '',
                type: type,
                color: this.color[i],
                lineMaxWidth: '10',
                smooth: true,
                symbol: 'circle',
                symbolSize: 15,
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
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: tools.isMb ? [] : legendData,
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
        // tools.isMb && (chartData['dataZoom'] = [
        //     {
        //         type: 'slider',
        //         show: true,
        //         xAxisIndex: [0],
        //         start: 1,
        //         end: 99
        //     },
        //     {
        //         type: 'inside',
        //         yAxisIndex: [0],
        //         start: 1,
        //         end: 99
        //     }
        // ]);

        chart.setOption(chartData);
        chart.on('click', (params) => {
            // if (this.ui.uiType === 'web' || this.ui.uiType === 'drill') {
            //     this.drillPage(params);
            // }
            // 
            console.log(params);
            let dataCol = this.data.bodyData[params.dataIndex];
            this.drillPage(params, dataCol);
            // let tr = d.query('.pseudo-table', this.wrapper).getElementsByTagName('tr');
            // console.log(d.query('.pseudo-table', this.wrapper));
            // let tableEle = this.wrapper.querySelector('.fast-table-container>.tables>.new-table-wrapper>.table-body-wrapper');
            // let tr = tableEle.querySelector('.table-scroll-wrapper>.pseudo-table>table>body')
            // console.log(tr);


        });
        return chart;


    }

    /**
     * 饼状图
     */
    initPieChartFn() {
        // debugger;
        // let xCoordinate = this.ui.local.xCoordinate.toLocaleUpperCase();
        let yCoordinate = this.ui.local.yCoordinate.toUpperCase().split(',');
        this.chartDom.style.height = tools.isMb ? `${yCoordinate.length * 20}rem` : yCoordinate ? `${Math.ceil(yCoordinate.length / 3) * 20}rem` : '20rem';
        let chart = echarts.init(this.chartDom);
        this.data.bodyData = [];
        this.data.body.bodyList[0].dataList.forEach(list => {
            let obj = {};
            list.forEach((ele, index) => {
                obj[this.data.body.bodyList[0].meta[index]] = ele;
            });
            this.data.bodyData.push(obj);
        });
        // let caption = this.ui.caption;
        let xAxisName: string = this.ui.local.xCoordinate.split(',').length >= 2 ? this.ui.local.xCoordinate.split(',')[0].toUpperCase() : this.ui.local.xCoordinate.toUpperCase();
        let xAxisData: Array<any> = this.data.bodyData.map(item => item[xAxisName]);;
        let legendName: Array<string> = yCoordinate;
        let legendData: Array<string> = [];
        let series = [];
        // xAxisName.forEach(name => {
        //     xAxisData = this.data.bodyData.map(item => item[name]);
        // });
        legendName.forEach((legend, i) => {
            let yAxis: string;
            let xAxis = '50%';
            if (tools.isMb) {
                yAxis = ((i + 0.5) / legendName.length * 100) + '%';
            } else {
                let floor = Math.ceil(legendName.length / 3);
                let redidue = i % 3;
                yAxis = (50 / floor) + '%';
                xAxis = (25 + redidue * 25) + '%';
            }
            let seriesItem = {
                type: 'pie',
                radius: 70,
                center: [xAxis, yAxis],
                data: this.data.bodyData.map((item, j) => {
                    return {
                        name: item[xAxisName],
                        value: item[legend],
                        // itemStyle: {
                        //     color: this.color[j]
                        // }
                        item
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
            // title: {
            //     text: caption,
            //     textStyle: {
            //         fontFamily: 'monospace',
            //         fontSize: 18,
            //         color: '#333'
            //         // fontWeight: 'bold',

            //     },
            //     padding: 15,
            // },
            grid: {
                // top: 15,
                left: 15,
                right: 15,
                bottom: 15,
                containLabel: true
            },
            tooltip: {},
            legend: {
                data: xAxisData,
                top: 5,
                type: 'scroll',
            },
            series: series
        };
        chart.setOption(chartData);
        chart.on('click', (params) => {
            console.log(params);
            // if (this.ui.uiType === 'web' || this.ui.uiType === 'drill') {
            //     this.drillPage(params);
            // }
            this.drillPage(params, params.data.item);
        });
        tools.isMb && (this.chartDom.parentElement.style.height = `${yCoordinate.length * 20 + 3}rem`);
        return chart;
    }


    /**
     * 跳转到另一个页面
     * @param params 点击图表后返回数据
     */

    drillPage(params, dataCol) {
        let cols = [];
        switch (this.ui.uiType) {
            case 'web':
                cols = this.ui.cols.filter(col => !col.noShow && col.webDrillAddr);
                cols.forEach(col => {
                    col.drillAddr = col.webDrillAddr;
                });
                break;
            case 'drill':
                cols = this.ui.cols.filter(col => !col.noShow && col.drillAddr);
                break;
            case 'select':
                cols = this.ui.cols.filter(col => !col.noShow && col.link);
                cols.forEach(col => {
                    col.drillAddr = col.link;
                });
                break;
        }
        console.log(cols);
        if (cols.length === 0) return;
        console.log(cols);
        let ul: HTMLUListElement = <ul class="drill-confirm ani"></ul>;
        let div: HTMLDivElement = <div class="drill-baffle">{ul}</div>;
        !tools.isMb && (div.onclick = (e) => {
            if (e.target['className'] === 'drill-baffle') {
                debugger;
                ul.classList.remove('drill-confirm');
                ul.classList.add('drill-confirm2');
                setTimeout(() => {
                    // ul.classList.add('drill-confirm');
                    d.query('body').removeChild(div);
                }, 300);
            }
        });
        let liList: Array<HTMLLIElement> = [];
        cols.forEach(col => {
            let varNamesObj: object = {};
            let noDrill = false;
            col.drillAddr && col.drillAddr.varList.forEach(list => {
                if (list.varName) {
                    varNamesObj[list.varName] = dataCol[list.varName];
                    !dataCol[list.varName] && (noDrill = true);
                }
            });
            console.log(varNamesObj);

            if (!noDrill && Object.keys(dataCol).includes(col.name)) {
                let li: HTMLLIElement = <li>
                    <span>{col.caption} : {dataCol[col.name]}</span>
                </li>
                // ul.appendChild(li);
                liList.push(li);

                li.addEventListener('click', () => {
                    console.log(123);
                    ul.classList.remove('drill-confirm');
                    ul.classList.add('drill-confirm2');
                    // d.query('body').removeChild(div);
                    this.getAjax(col, dataCol, varNamesObj);
                    let timer = setTimeout(() => {
                        // ul.classList.add('drill-confirm');
                        d.query('body').removeChild(div);
                        clearTimeout(timer);
                    }, 300);
                })
            }

        });
        // if (this.ui.uiType === 'select' && this.ui.subTableList.length > 0) {
        //     let li: HTMLLIElement = <li>
        //         <span>明细</span>
        //     </li>
        //     // ul.appendChild(li);
        //     liList.push(li);

        //     li.addEventListener('click', () => {
        //         console.log(123);
        //         ul.classList.remove('drill-confirm');
        //         ul.classList.add('drill-confirm2');
        //         // d.query('body').removeChild(div);
        //         // this.getAjax(params, col);

        //         let timer = setTimeout(() => {
        //             // ul.classList.add('drill-confirm');
        //             d.query('body').removeChild(div);
        //             clearTimeout(timer);
        //         },200);
        //     })
        // }
        if (liList.length < 1) return;
        let li: HTMLLIElement = <li>
            <span>关闭</span>
        </li>
        // ul.appendChild(li);
        liList.push(li);

        li.addEventListener('click', () => {
            console.log(123);
            ul.classList.remove('drill-confirm');
            ul.classList.add('drill-confirm2');
            // d.query('body').removeChild(div);
            // this.getAjax(col, dataCol, varNamesObj);
            let timer = setTimeout(() => {
                // ul.classList.add('drill-confirm');
                d.query('body').removeChild(div);
                clearTimeout(timer);
            }, 300);
        })
    
    liList.forEach(li => {
        ul.appendChild(li);
        })
d.query('body').appendChild(div);
    }

/**
 * 跳转页面的ajax
 * @param params 点击后获取的数据
 * @param col 对应的UI栏
 */
getAjax(col, dataCol, varNamesObj) {
    if (this.ui.uiType === 'drill') {
        let url: string = CONF.siteUrl + col.drillAddr.dataAddr;
        Object.keys(dataCol).forEach(key => {
            if (url.indexOf(key) !== -1) {
                url = url.replace(`{${key}}`, dataCol[key]);
            }
        });
        url = `${url}&page=drill`;
        sys.window.open({ url, gps: col.drillAddr.needGps });
    } else {

        // let param = Object.assign({
        //     type: 'GET',
        //     needGps: col.drillAddr.needGps,
        // }, varNamesObj);
        let url = CONF.siteUrl + col.drillAddr.dataAddr;
        // BwRule.Ajax.fetch(url, param).then(({response}) => {
        //     console.log(response);
        // })
        sys.window.open({ url, data: varNamesObj, gps: col.drillAddr.needGps });
    }


}



/**
 * 图表渲染函数
 */
render() {
    this.chartDom = <section class="chart-container" >图形</section>
    this.chartBtnsContainer = <div class="chart-table" >
        <section class="chart-btns">
            <button class="switch-table btn button-type-default button-small" data-type="switchTable">表格</button>
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
    });

    var i = 0;
    let body: HTMLElement = d.query('body');
    tools.isMb && this.chartDom.addEventListener('click', () => {
        i++;
        setTimeout(function () {
            i = 0;
        }, 500);
        if (i > 1) {

            // this.maxChartDom = <div class="max-chart">11</div>;
            // div.appendChild(this.chartDom);
            // d.query('.max-chart', body) && body.removeChild(d.query('.max-chart', body))
            body.appendChild(this.maxChartDom);
            this.maxChart = this.initCommonChartFn(this.maxChartDom, true);


        }
    });

    tools.isMb && this.maxChartDom.addEventListener('click', () => {
        i++;
        setTimeout(function () {
            i = 0;
        }, 500);
        // i > 1 && body.removeChild(d.query('.max-chart', body));
        if (i > 1) {
            body.removeChild(d.query('.max-chart', body));
            // this.chart.resize();
            d.query('.table-module-has-sub', body).style.height = '100vh';
        }
    })

}

initDrillChart() {
    if (this.ui.showType === 'pie') {

    } else {

    }
}

}