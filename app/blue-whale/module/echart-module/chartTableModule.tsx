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
        let xAxisData: Array<any> = this.data.bodyData.map((item, i) => {
            return {
                value: item[xAxisName],
                test: 1

            }
        });
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
            
            legend: {
                data: legendData,
                top: 15,
            },
            xAxis: {
                data: xAxisData,
                triggerEvent: true,
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
                    color: '#333333',
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

        if (!tools.isMb) {
            chartData['tooltip']= {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            }
        }
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
            let col;
            if (tools.isMb ) {
                let tipDom: HTMLDivElement
                if ( params.componentType === "xAxis" ) {
                    params.seriesName = params.value;
                    col = this.data.bodyData.find(item => item[xAxisName] === params.value);
                    tipDom =this.tipLinkFn(params.seriesName);
                } else {
                    col = this.data.bodyData[params.dataIndex];
                    tipDom =this.tipLinkFn(`${params.seriesName}: ${params.value}`);
                }
                let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, col);
                if (ifBreak) return;
                
                d.query('.tip-link',this.chartBtnsContainer) && this.chartBtnsContainer.removeChild(d.query('.tip-link',this.chartBtnsContainer));
                 
                this.chartBtnsContainer.appendChild(tipDom);
                tipDom.style.top = params.event.offsetY + 'px';
                tipDom.style.left = (params.event.offsetX - 50) + 'px';
                setTimeout(() =>{
                    this.chartBtnsContainer.removeChild(tipDom);
                }, 3000);
                tipDom.onclick = () =>{
                    this.chartBtnsContainer.removeChild(tipDom);
                    debugger;
                    this.getAjax(defaultCol, dataCol, varNamesObj);  
                }
            }
            
            else {
                if ( params.componentType === "xAxis" ) {
                    params.seriesName = params.value;
                    col = this.data.bodyData.find(item => item[xAxisName] === params.value);  
                } else {
                    col = this.data.bodyData[params.dataIndex];
                }
                let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, col);
                // this.drillPage(params, col);
                !ifBreak && this.getAjax(defaultCol, dataCol, varNamesObj);
            }


            // this.drillPage(params, dataCol);
            // let tr = d.query('.pseudo-table', this.wrapper).getElementsByTagName('tr');
            // console.log(d.query('.pseudo-table', this.wrapper));
            // let tableEle = this.wrapper.querySelector('.fast-table-container>.tables>.new-table-wrapper>.table-body-wrapper');
            // let tr = tableEle.querySelector('.table-scroll-wrapper>.pseudo-table>table>body')
            // console.log(tr);


        });
        return chart;


    }

    // 
    tipLinkFn(value: string) {
        let tipDom: HTMLDivElement = <div class="tip-link">
            <p>{value}</p>
            <p class="link-to">点击查看</p>
        </div>;
        return tipDom;
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
            legend: {
                data: xAxisData,
                top: 5,
                type: 'scroll',
            },
            series: series
        }; 
        !tools.isMb && (chartData['tooltip'] = {})
        chart.setOption(chartData);
        chart.on('click', (params) => {
            console.log(params);
            let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, params.data.item);
            if (tools.isMb && !ifBreak) {
                let tipDom: HTMLDivElement
                tipDom =this.tipLinkFn(`${params.name}: ${params.value}`);
                
                d.query('.tip-link',this.chartBtnsContainer) && this.chartBtnsContainer.removeChild(d.query('.tip-link',this.chartBtnsContainer));
                 
                this.chartBtnsContainer.appendChild(tipDom);
                tipDom.style.top = params.event.offsetY + 'px';
                tipDom.style.left = (params.event.offsetX - 50) + 'px';
                setTimeout(() =>{
                    this.chartBtnsContainer.removeChild(tipDom);
                }, 3000);
                tipDom.onclick = () =>{
                    this.chartBtnsContainer.removeChild(tipDom);
                    // this.drillPage(params, params.data.item); 
                    this.getAjax(defaultCol, dataCol, varNamesObj);
                }
                return ;
            }
           
            !ifBreak && this.getAjax(defaultCol, dataCol, varNamesObj);

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
                cols = this.ui.cols.filter(col => col.webDrillAddr);
                cols.forEach(col => {
                    col.drillAddr = col.webDrillAddr;
                });
                break;
            case 'drill':
                cols = this.ui.cols.filter(col => col.drillAddr);
                break;
            case 'select':
                cols = this.ui.cols.filter(col => col.link);
                cols.forEach(col => {
                    col.drillAddr = col.link;
                });
                break;
        }
        console.log(cols);
        console.log(params);
        console.log(dataCol);
        if (cols.length === 0) return {
            defaultCol : null,
            varNamesObj : null,
            dataCol : null,
            ifBreak :true,
        };

        // 根据rowLinkField 设置默认跳转
        let defaultCols;
        if (this.ui.rowLinkField) {
            defaultCols = cols.find(col => col.name === this.ui.rowLinkField);
        }


        // Object.keys(dataCol).forEach(key => {
        //     if (params.seriesName === dataCol[key]) {

        //     }
        // }
        let col;
        if(this.ui.showType === 'pie') {
            // col = cols.filter(col => col.caption === params.seriesName);
            Object.keys(params.data.item).forEach((key)=> {
                if(params.data.item[key] === params.name) {
                    col = cols.find(col => col.name === key);
                }
            })
        } else {
            col = cols.find(col => col.caption === params.seriesName);
        }
        // let caption = this.ui.showType === 'pie' ? params.name : params.seriesName;
         
        let defaultCol = col ? col : defaultCols ? defaultCols : null;

        if (!defaultCol) return {
            defaultCol : null,
            varNamesObj : null,
            dataCol : null,
            ifBreak :true,
        };

        console.log(defaultCol);
        // debugger;
        let varNamesObj: object = {};
        let ifBreak: boolean = false;
        defaultCol.drillAddr && defaultCol.drillAddr.varList.forEach(list => {
            if (list.varName) {
                varNamesObj[list.varName] = dataCol[list.varName];
                !dataCol[list.varName] && (ifBreak = true);
            }
        });
        if (ifBreak) return {
            defaultCol : null,
            varNamesObj : null,
            dataCol : null,
            ifBreak :true,
        };
        // this.getAjax(defaultCol, dataCol, varNamesObj);
        return {
            defaultCol,
            varNamesObj,
            dataCol,
            ifBreak
        }
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

        if (this.ui.showType === 'pie') return;
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