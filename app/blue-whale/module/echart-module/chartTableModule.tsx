/// <amd-module name="ChartTableModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

import tools = G.tools;
import d = G.d;
import baseUrl = G.requireBaseUrl;
import { FastBtnTable } from "global/components/FastBtnTable/FastBtnTable";
import CONF = BW.CONF;
import sys = BW.sys;
import CityMap from './city-map';
import Province from './province-map';
import provinceMap from "./province-map";



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
    baffleDom: HTMLDivElement; // 设置图表展示的类型
    settingData = {
        type: null,
        xAxis: null,
        yAxis: [],
        types: ['line', 'bar', 'pie', 'area'],
        yAxisLists: [],
        xAxisLists: []


    }
    color = ['#609ee9', '#f7ba2a', '#39ca74', '#fc90a6', '#bbadf3', '#48bfe3', '#fca786', '#fe94ea', '#86e1fc', '#496169', '#fa4166', '#39ca74', '#fc90a6', '#bbadf3', '#48bfe3', '#fca786', '#fe94ea', '#86e1fc'];


    constructor(ui: IBW_Table, wrapper: HTMLElement, data: Data, ftable: FastBtnTable) {
        this.parentDom = wrapper.parentElement;
        this.ui = ui;
        this.wrapper = wrapper;
        this.ftable = ftable;
        this.data = data;
        // debugger;
        this.initData();
        this.initTableBtns();
        // console.log(CityMap);
        let img = CONF.siteUrl + '/map/china.json';
        // console.log(baseUrl);
        // $('body').append(img);

    }

    initData() {
        this.maxChartDom = <div class="max-chart"></div>
        this.wrapper.style.display = 'none';
        if (this.ui.uiType === 'detail') {

            let chartTableEle = d.query('.chart-table', this.parentDom);
            chartTableEle && this.parentDom.removeChild(chartTableEle);
        }
        this.parentDom.insertBefore(this.render(), this.parentDom.childNodes[0]);
        
        
        console.log(this.ui);
        this.baffleDom = this.chartSettingRender();
        this.chartBtnsContainer.appendChild(this.baffleDom);
        this.baffleDom.addEventListener('click', this.baffleDomClkFn.bind(this));

        tools.isMb || (this.chartBtnsContainer.style.height = '25rem');
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
                break; break;
        }
        // this.chart = this.initMap(this.chartDom);
        // this.chart = this.initMap(this.chartDom)
        window.onresize = () => {
            this.chart && this.chart.resize();
        }
        window.addEventListener("orientationchange", () => {

            setTimeout(() => {
                this.chart && this.chart.resize();
                this.maxChart && this.maxChart.resize();
            }, 300);

        }, false);
        this.chartBtnsClk();
    }
    chartSettingRender() {
        let dataTypes = ['10','11','14','15'];
        let cols = this.ui.cols.filter(col => !col.noShow)
        let xAxisData = cols.map(col => ({name: col.name,value:col.caption}));
        let yAxisData = cols.filter(col => dataTypes.includes(col.dataType)).map(col => ({name: col.name,value:col.caption}));
        console.log(yAxisData, xAxisData);
        let chartTypeData = {
            types: [
                { name: 'line', value: '折线图' },
                { name: 'bar', value: '柱状图' },
                { name: 'pie', value: '饼状图' },
                { name: 'area', value: '面积图' }
            ]
        };
        
        const fieldsetTypeDom: HTMLElement[] = chartTypeData.types.map((type, index) => {
            return (
                <section class="radio-wrapper"  >
                    <input type="radio" value={type.name} name='type' />
                    <span class={index === 0 ? "label-radio checked-radio" : "label-radio"} name='type'></span>
                    <span calss="radio-text" name='type'>{type.value}</span>
                </section>
            );
        });
        const xAxisDom: HTMLElement[] = xAxisData.map((item, index) => {
            return (
                <section class="radio-wrapper"  >
                    <input type="radio" value={item.name} name='xAxis' />
                    <span class={index === 0 ? "label-radio checked-radio" : "label-radio"} name='xAxis'></span>
                    <span calss="radio-text" name='xAxis' title={item.value}>{item.value}</span>
                </section>
            );
        });
        const yAxisDom: HTMLElement[] = yAxisData.map((item, index) => {
            return (
                <section class="radio-wrapper"  >
                    <input type="checkbox" value={item.name} name='yAxis' />
                    <span class= "label-checkbox" name='yAxis'></span>
                    <span calss="radio-text" name='yAxis' title={item.value}>{item.value}</span>
                </section>
            );
        });
        const settingDom: HTMLDivElement = tools.isMb ?
        <div class="mb-chart-baffle"> </div>
        : <div class="pc-chart-baffle">
            <div class="pc-baffle-main">
                <h1 class="pc-baffle-header">
                    <span>图表统计</span>
                    <span class="pc-baffle-close">x</span>
                </h1>
                <div class="row">
                    <fieldset class="col-xs-4">
                        <legend>类型</legend>
                        <section class="cols-comtainer"><div>
                            {fieldsetTypeDom}
                        </div></section>
                    </fieldset>
                    
                    <fieldset class="col-xs-4">
                        <legend>横坐标</legend>
                        <section class="cols-comtainer"><div>
                            {xAxisDom}
                        </div></section>
                    </fieldset>
                    <fieldset class="col-xs-4">
                        <legend>纵坐标</legend>
                        <section class="cols-comtainer"><div>
                            {yAxisDom}
                        </div></section>
                    </fieldset>
                    {/* {fieldsetTypeDom} */}
                </div>
                <div class="pc-baffle-footer">
                    <button class="btn button-type-primary">确定</button>
                </div>
            </div>
            
        </div>;
        return settingDom;

    }

    // 图形统计按钮
    baffleDomClkFn(e: Event) {
        let name = e.target['name'];
        if(e.target['className'] === 'pc-baffle-close') {
            this.baffleDom.style.display = 'none';
        }
        if (!name) return;
        // this.chartDom.querySelector
        if (name === 'yAxis') {
            e.target['previousElementSibling'].checked;
            // e.target['parentElement'].parentElement.querySelector('.checked-radio').classList.remove('checked-radio');
            // e.target['classList'].add('checked-radio');
            e.target['classList'].toggle('checked-radio');
        } else {
            e.target['previousElementSibling'].checked;
            e.target['parentElement'].parentElement.querySelector('.checked-radio').classList.remove('checked-radio');
            e.target['classList'].add('checked-radio');
        }
        switch (name) {
            case 'type':
                this.settingData.type = e.target['previousElementSibling'].value;
                break;
        }
        console.log(this.settingData);
    }


    /**
     * 初始化图表切表格按钮
     */
    initTableBtns() {
        let btnsContainer: HTMLElement = d.query('.fast-table-btns', this.wrapper);
        if (!btnsContainer) return;

        let btn: HTMLElement = tools.isMb ?
            <button class="btn button-type-default button-small chart-btn mb-chart-btn">
                <i class="appcommon app-tuxing" ></i>
            </button>
            : <button class="btn button-type-default button-small chart-btn ">图表</button>
        d.query('.chart-btn', btnsContainer) && btnsContainer.removeChild(d.query('.chart-btn', btnsContainer));

        btnsContainer.children.length > 0 ? btnsContainer.children[0].appendChild(btn) : btnsContainer.appendChild(btn);
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
                top: 10,
                right: tools.isMb ? '60px' : '1px',
                type: 'scroll',
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
            chartData['tooltip'] = {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            }
        }


        chart.setOption(chartData);
        chart.on('click', (params) => {
            // if (this.ui.uiType === 'web' || this.ui.uiType === 'drill') {
            //     this.drillPage(params);
            // }
            //
            // debugger;
            let col;
            if (tools.isMb) {
                let tipDom: HTMLDivElement
                if (params.componentType === "xAxis") {
                    params.seriesName = params.value;
                    col = this.data.bodyData.find(item => item[xAxisName] === params.value);
                    tipDom = this.tipLinkFn(params.seriesName);
                } else {
                    col = this.data.bodyData[params.dataIndex];
                    tipDom = this.tipLinkFn(`${params.seriesName}: ${params.value}`);
                }
                let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, col);
                if (ifBreak) return;

                d.query('.tip-link', chartEle) && chartEle.removeChild(d.query('.tip-link', chartEle));

                chartEle.appendChild(tipDom);
                let offsetY = max ? params.event.offsetY - 80 : params.event.offsetY;
                tipDom.style.top = offsetY + 'px';
                tipDom.style.left = (params.event.offsetX - 50) + 'px';
                setTimeout(() => {
                    d.query('.tip-link', chartEle) && chartEle.removeChild(tipDom);
                }, 2500);
                tipDom.onclick = (e) => {
                    // debugger;
                    chartEle.removeChild(tipDom);
                    this.getAjax(defaultCol, dataCol, varNamesObj);
                }
            }

            else {
                if (params.componentType === "xAxis") {
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

    /**
     * 创建弹出连接框
     * @param value 
     */
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
        let xAxisData: Array<any> = this.data.bodyData.map(item => (item[xAxisName] ? item[xAxisName] : ''));
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
                yAxis = (50 / floor) + 6 + '%';
                xAxis = (25 + redidue * 25) + '%';
            }
            let seriesItem = {
                type: 'pie',
                radius: tools.isMb ? 70 : 90,
                center: [xAxis, yAxis],
                data: this.data.bodyData.map((item, j) => {
                    return {
                        name: item[xAxisName],
                        value: item[legend],
                        itemStyle: {
                            color: this.color[j]
                        },
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
                top: 8,
                type: 'scroll',
                right: tools.isMb ? '60px' : '1px',
            },
            series: series
        };
        !tools.isMb && (chartData['tooltip'] = {});
        chart.setOption(chartData);
        chart.on('click', (params) => {
            let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, params.data.item);
            if (tools.isMb && !ifBreak) {
                let tipDom: HTMLDivElement
                tipDom = this.tipLinkFn(`${params.name}: ${params.value}`);

                d.query('.tip-link', this.chartBtnsContainer) && this.chartBtnsContainer.removeChild(d.query('.tip-link', this.chartBtnsContainer));

                this.chartBtnsContainer.appendChild(tipDom);
                tipDom.style.top = params.event.offsetY + 'px';
                tipDom.style.left = (params.event.offsetX - 50) + 'px';
                setTimeout(() => {
                    this.chartBtnsContainer.removeChild(tipDom);
                }, 3000);
                tipDom.onclick = () => {
                    this.chartBtnsContainer.removeChild(tipDom);
                    // this.drillPage(params, params.data.item); 
                    this.getAjax(defaultCol, dataCol, varNamesObj);
                }
                return;
            }

            !ifBreak && this.getAjax(defaultCol, dataCol, varNamesObj);

        });
        tools.isMb && (this.chartDom.parentElement.style.height = `${yCoordinate.length * 20 + 3}rem`);
        return chart;
    }


    /**
     * 跳转到另一个页面的数据处理
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
        if (cols.length === 0) return {
            defaultCol: null,
            varNamesObj: null,
            dataCol: null,
            ifBreak: true,
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
        if (this.ui.showType === 'pie') {
            // col = cols.filter(col => col.caption === params.seriesName);
            Object.keys(params.data.item).forEach((key) => {
                if (params.data.item[key] === params.name) {
                    col = cols.find(col => col.name === key);
                }
            })
        } else {
            col = cols.find(col => col.caption === params.seriesName);
        }
        // let caption = this.ui.showType === 'pie' ? params.name : params.seriesName;

        let defaultCol = col ? col : defaultCols ? defaultCols : null;

        if (!defaultCol) return {
            defaultCol: null,
            varNamesObj: null,
            dataCol: null,
            ifBreak: true,
        };

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
            defaultCol: null,
            varNamesObj: null,
            dataCol: null,
            ifBreak: true,
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
        this.chartDom = <section class="chart-container" >图形</section>;
        this.chartBtnsContainer = tools.isMb ?
            <div class="chart-table" >
                <section class="mb-chart-btns">
                    <button class="mb-switch-table btn button-type-default " data-type="switchTable">
                        <i class=" appcommon app-biaoge" data-type="switchTable"></i>
                    </button>
                    <button class="mb-switch-table btn button-type-default " data-type="chartSetting">
                        <i class=" iconfont button-icon icon-bingzhuangtu" data-type="chartSetting"></i>
                    </button>
                </section>
                {this.chartDom}
            </div>
            : <div class="chart-table" >

                <section class="chart-btns">
                    <button class="switch-table btn button-type-default button-small" data-type="switchTable">
                        <i class="appcommon app-biaoge" data-type="switchTable"></i>
                        表格
                </button>
                    <button class="switch-table btn button-type-default button-small" data-type="chartSetting">
                        <i class="iconfont button-icon icon-bingzhuangtu" data-type="chartSetting"></i>
                        设置
                </button>
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
                case 'chartSetting':
                    this.baffleDom.style.display = 'block';
                    // tools.isMb ? this.mbChartSetting() : this.pcChartSetting();
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
                // 双击自定义提示框未消失；
                d.query('.tip-link', this.chartDom) && this.chartDom.removeChild(d.query('.tip-link', this.chartDom));
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
        });




    }

    mbChartSetting() {

    }

    


    async initMap(chartEle: HTMLElement) {
        chartEle.parentElement.style.height = '25rem';
        let chinaMap = echarts.init(chartEle);
        // let chart = echarts.init(chartEle);
        let mapJson = await $.get(`${baseUrl}../map/china.json`);
        let chart = echarts.registerMap('china', mapJson);
        let myData = [

            {
                name: '海门',
                value: [121.15, 31.89, 90],
                itemStyle: {
                    color: '#609ee9'
                }

            },
            {
                name: '南平',
                value: [1090.781327, 39.608266, 120],
                itemStyle: {
                    color: '#f7ba2a'
                }
            },
            {
                name: '招远',
                value: [120.38, 370.35, 142],
                itemStyle: {
                    color: '#609ee9'
                }
            },
            {
                name: '舟山',
                value: [121.509062, 25.044332, 123],
                itemStyle: {
                    color: 'red'
                }
            }
        ];

        function randomValue() {
            return Math.round(Math.random() * 1500);
        }
        let chinaMapOption = {

            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{c} (p / km2)'
            },
            visualMap: {
                min: 0,
                max: 1500,
                left: 'left',
                top: 'bottom',
                text: ['High', 'Low'],
                seriesIndex: [1],
                inRange: {
                    color: ['lightskyblue', 'yellow', 'orangered']
                },
                calculable: true
            },
            geo: {
                map: 'china',
                roam: true,
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: 'rgba(0,0,0,0.4)'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    emphasis: {
                        areaColor: null,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 20,
                        borderWidth: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },

            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: myData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M694.021847 492.679245a208.460775 208.460775 0 0 1 112.873883 74.740815 197.275074 197.275074 0 0 1 37.624627 118.975173 234.899702 234.899702 0 0 1-34.065541 123.551142A203.376365 203.376365 0 0 1 711.817279 892.313803a440.309831 440.309831 0 0 1-168.802383 26.438928h-254.220457a50.844091 50.844091 0 0 1-50.844091-50.844091V168.802383a50.844091 50.844091 0 0 1 50.844091-50.844091h249.644489q145.922542 0 203.376365 63.555114a203.376365 203.376365 0 0 1 59.996028 140.838133 180.496524 180.496524 0 0 1-27.45581 97.112215 206.935452 206.935452 0 0 1-80.333664 73.215491z m-323.368421-39.14995h147.956306A563.860973 563.860973 0 0 0 610.129096 447.428004a122.53426 122.53426 0 0 0 64.063555-31.523337 101.688183 101.688183 0 0 0 27.964251-79.825223A111.34856 111.34856 0 0 0 672.667329 254.220457a121.008937 121.008937 0 0 0-67.114201-33.04866 681.310824 681.310824 0 0 0-101.688183-6.101291H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v187.614697a25.422046 25.422046 0 0 0 25.422046 25.422046z m0 370.144985h173.886792a227.781529 227.781529 0 0 0 148.464747-36.607746 127.618669 127.618669 0 0 0 41.692155-101.688182 124.059583 124.059583 0 0 0-44.234359-101.688183 259.304866 259.304866 0 0 0-159.650447-36.099305H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v225.239324a25.422046 25.422046 0 0 0 25.422046 25.422046z',
                    // symbolRotate: 35,
                    // symbolColor: 'red',
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        },
                        color: 'red'
                    },
                    itemStyle: {
                        normal: {
                            color: 'red'
                        }
                    }
                },
                {
                    name: 'categoryA',
                    type: 'map',
                    geoIndex: 0,
                    // tooltip: {show: false},
                    data: mapJson.features.map(city => city.properties.name).map(province => {
                        return { name: province, value: Math.round(Math.random() * 1500) }
                    })
                }

            ]
        }

        chinaMap.setOption(chinaMapOption);

        return chinaMap;
    }

    async initProvince(chartEle: HTMLElement, name: string) {
        chartEle.parentElement.style.height = '25rem';
        let myData = [];

        // let chart = echarts.init(chartEle);
        let provinceName = provinceMap[name];
        let citysJson = await $.get(`${baseUrl}../map/province/${provinceName}.json`);
        echarts.registerMap(provinceName, citysJson);
        let provinceEchart = echarts.init(chartEle);
        let citys = citysJson.features.map(city => city.properties.name);
        let options = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{c} (p / km2)'
            },
            visualMap: {
                min: 0,
                max: 1500,
                left: 'left',
                top: 'bottom',
                text: ['High', 'Low'],
                seriesIndex: [1],
                inRange: {
                    color: ['lightskyblue', 'yellow', 'orangered']
                },
                calculable: true
            },
            geo: {
                map: provinceName,
                roam: true,
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: 'rgba(0,0,0,0.4)'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    emphasis: {
                        areaColor: null,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 20,
                        borderWidth: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    // data: myData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M694.021847 492.679245a208.460775 208.460775 0 0 1 112.873883 74.740815 197.275074 197.275074 0 0 1 37.624627 118.975173 234.899702 234.899702 0 0 1-34.065541 123.551142A203.376365 203.376365 0 0 1 711.817279 892.313803a440.309831 440.309831 0 0 1-168.802383 26.438928h-254.220457a50.844091 50.844091 0 0 1-50.844091-50.844091V168.802383a50.844091 50.844091 0 0 1 50.844091-50.844091h249.644489q145.922542 0 203.376365 63.555114a203.376365 203.376365 0 0 1 59.996028 140.838133 180.496524 180.496524 0 0 1-27.45581 97.112215 206.935452 206.935452 0 0 1-80.333664 73.215491z m-323.368421-39.14995h147.956306A563.860973 563.860973 0 0 0 610.129096 447.428004a122.53426 122.53426 0 0 0 64.063555-31.523337 101.688183 101.688183 0 0 0 27.964251-79.825223A111.34856 111.34856 0 0 0 672.667329 254.220457a121.008937 121.008937 0 0 0-67.114201-33.04866 681.310824 681.310824 0 0 0-101.688183-6.101291H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v187.614697a25.422046 25.422046 0 0 0 25.422046 25.422046z m0 370.144985h173.886792a227.781529 227.781529 0 0 0 148.464747-36.607746 127.618669 127.618669 0 0 0 41.692155-101.688182 124.059583 124.059583 0 0 0-44.234359-101.688183 259.304866 259.304866 0 0 0-159.650447-36.099305H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v225.239324a25.422046 25.422046 0 0 0 25.422046 25.422046z',
                    // symbolRotate: 35,
                    // symbolColor: 'red',
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        },
                        color: 'red'
                    },
                    itemStyle: {
                        normal: {
                            color: 'red'
                        }
                    }
                },
                {
                    name: 'categoryA',
                    type: 'map',
                    geoIndex: 0,
                    data: citys.map(city => {
                        return { name: city, value: Math.round(Math.random() * 1500) }
                    })
                }
            ]
        };
        provinceEchart.setOption(options);

        return provinceEchart;
    }

    async initCity(chartEle: HTMLElement, name: string) {
        chartEle.parentElement.style.height = '25rem';
        let myData = [];

        // let chart = echarts.init(chartEle);
        let cityCode = CityMap[name];

        let cityJson = await $.get(`${baseUrl}../map/citys/${cityCode}.json`);
        echarts.registerMap(cityCode, cityJson);
        let cityEchart = echarts.init(chartEle);
        let districts = cityJson.features.map(district => district.properties.name);
        let options = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{c} (p / km2)'
            },
            visualMap: {
                min: 0,
                max: 1500,
                left: 'left',
                top: 'bottom',
                text: ['High', 'Low'],
                seriesIndex: [1],
                inRange: {
                    color: ['lightskyblue', 'yellow', 'orangered']
                },
                calculable: true
            },
            geo: {
                map: cityCode,
                roam: true,
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: 'rgba(0,0,0,0.4)'
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(0, 0, 0, 0.2)'
                    },
                    emphasis: {
                        areaColor: null,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        shadowBlur: 20,
                        borderWidth: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    // data: myData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M694.021847 492.679245a208.460775 208.460775 0 0 1 112.873883 74.740815 197.275074 197.275074 0 0 1 37.624627 118.975173 234.899702 234.899702 0 0 1-34.065541 123.551142A203.376365 203.376365 0 0 1 711.817279 892.313803a440.309831 440.309831 0 0 1-168.802383 26.438928h-254.220457a50.844091 50.844091 0 0 1-50.844091-50.844091V168.802383a50.844091 50.844091 0 0 1 50.844091-50.844091h249.644489q145.922542 0 203.376365 63.555114a203.376365 203.376365 0 0 1 59.996028 140.838133 180.496524 180.496524 0 0 1-27.45581 97.112215 206.935452 206.935452 0 0 1-80.333664 73.215491z m-323.368421-39.14995h147.956306A563.860973 563.860973 0 0 0 610.129096 447.428004a122.53426 122.53426 0 0 0 64.063555-31.523337 101.688183 101.688183 0 0 0 27.964251-79.825223A111.34856 111.34856 0 0 0 672.667329 254.220457a121.008937 121.008937 0 0 0-67.114201-33.04866 681.310824 681.310824 0 0 0-101.688183-6.101291H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v187.614697a25.422046 25.422046 0 0 0 25.422046 25.422046z m0 370.144985h173.886792a227.781529 227.781529 0 0 0 148.464747-36.607746 127.618669 127.618669 0 0 0 41.692155-101.688182 124.059583 124.059583 0 0 0-44.234359-101.688183 259.304866 259.304866 0 0 0-159.650447-36.099305H370.653426a25.422046 25.422046 0 0 0-25.422046 25.422046v225.239324a25.422046 25.422046 0 0 0 25.422046 25.422046z',
                    // symbolRotate: 35,
                    // symbolColor: 'red',
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true
                        },
                        color: 'red'
                    },
                    itemStyle: {
                        normal: {
                            color: 'red'
                        }
                    }
                },
                {
                    name: 'categoryA',
                    type: 'map',
                    geoIndex: 0,
                    data: districts.map(district => {
                        return { name: district, value: Math.round(Math.random() * 1500) }
                    })
                }
            ]
        };
        // debugger;
        cityEchart.setOption(options);

        return cityEchart;
    }



}