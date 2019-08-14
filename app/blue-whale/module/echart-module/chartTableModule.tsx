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
import ProvinceMap from "./province-map";
// import { Modal } from "cashier/global/components/feedback/modal/Modal";
import { Modal } from "../../../global/components/feedback/modal/Modal";



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

        this.settingData.type = this.ui.showType;
        this.settingData.xAxis = this.ui.local.xCoordinate;
        this.settingData.yAxis = this.ui.local.yCoordinate.split(',');
        this.baffleDom = this.chartSettingRender();
        tools.isMb ? d.query('body').appendChild(this.baffleDom) : this.chartBtnsContainer.appendChild(this.baffleDom);
        this.baffleDom.addEventListener('click', this.baffleDomClkFn.bind(this));

        !this.ui.chartPage && (tools.isMb || (this.chartBtnsContainer.style.height = '25rem'));
        // this.parentDom.appendChild(this.render());
        // let chart;
        switch (this.ui.uiType) {
            case 'select':
            case 'table':
            case 'web':
            case 'drill':
            case 'detail':
            case 'panel':
                if (this.ui.showType === 'map') {
                    if (this.ui.location === 'china') {
                        this.chart =this.initMap(this.chartDom).then(res => this.chart = res);
                    } else if (/.*省$/.test(`${this.ui.location}`) || ProvinceMap[this.ui.location]) {
                        let name = /.*省$/.test(`${this.ui.location}`) ? this.ui.location.slice(0, (this.ui.location.length - 1)) : this.ui.location;
                        this.chart = this.initProvince(this.chartDom, name).then(res => this.chart = res);;
                    } else {
                        let name = /.*市$/.test(`${this.ui.location}`) ? this.ui.location : this.ui.location + '市';
                        this.chart = this.initCity(this.chartDom, name).then(res => this.chart = res);
                    }
                } else {
                    this.chart = this.ui.showType === 'pie' ? this.initPieChartFn() : this.initCommonChartFn(this.chartDom);
                }
                break;

            // case 'detail':
            //     this.ui.cols = this.ui.fields;
            //     this.chart = this.ui.showType === 'pie' ? this.initPieChartFn() : this.initCommonChartFn(this.chartDom);
            //     break; break;
        }
        window.onresize = () => {
            // if (this.ui.showType === 'map') return;
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

    /**
     * 图形统计弹出框设置图表方法
     */
    chartSettingRender() {
        let dataTypes = ['10', '11', '14', '15']; // y轴根据UItype展示
        let cols = this.ui.cols.filter(col => !col.noShow)
        let xAxisData = cols.map(col => ({ name: col.name, value: col.caption }));
        let yAxisData = cols.filter(col => dataTypes.includes(col.dataType)).map(col => ({ name: col.name, value: col.caption }));
        // console.log(yAxisData, xAxisData);
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
                    <input type="radio" value={type.name} name='type' checked={type.name === this.settingData.type ? 'checked' : ''} />
                    <span class={type.name === this.settingData.type ? "label-radio checked-radio" : "label-radio"} name='type'></span>
                    <span calss="radio-text" name='type'>{type.value}</span>
                </section>
            );
        });
        const xAxisDom: HTMLElement[] = xAxisData.map((item, index) => {
            return (
                <section class="radio-wrapper"  >
                    <input type="radio" value={item.name} name='xAxis' checked={item.name === this.settingData.xAxis ? 'checked' : ''} />
                    <span class={item.name === this.settingData.xAxis ? "label-radio checked-radio" : "label-radio"} name='xAxis'></span>
                    <span calss="radio-text" name='xAxis' title={item.value}>{item.value}</span>
                </section>
            );
        });
        const yAxisDom: HTMLElement[] = yAxisData.map((item, index) => {
            return (
                <section class="radio-wrapper"  >
                    <input type="checkbox" value={item.name} name='yAxis' checked={this.settingData.yAxis.includes(item.name) ? 'checked' : ''} />
                    <span class={this.settingData.yAxis.includes(item.name) ? 'checked-radio label-checkbox' : "label-checkbox"} name='yAxis'></span>
                    <span calss="radio-text" name='yAxis' title={item.value}>{item.value}</span>
                </section>
            );
        });
        const settingDom: HTMLDivElement = tools.isMb ?
            <div class="mb-chart-baffle">
                <div class="mb-baffle-main">
                    <h5>图形统计</h5>
                    <section class="mb-baffle-content">
                        <div class="row">
                            <fieldset class="col-xs-6">
                                <legend>类型</legend>
                                <section class="cols-comtainer">
                                    {fieldsetTypeDom}
                                </section>
                            </fieldset>

                            <fieldset class="col-xs-6">
                                <legend>横坐标</legend>
                                <section class="cols-comtainer">
                                    {xAxisDom}
                                </section>
                            </fieldset>
                            <fieldset class="col-xs-6">
                                <legend>纵坐标</legend>
                                <section class="cols-comtainer">
                                    {yAxisDom}
                                </section>
                            </fieldset>
                        </div>
                        <div class="mb-baffle-footer">
                            <button class="btn button-type-primary btn-confirm">确定</button>
                            <button class="btn button-type-primary btn-cancel">取消</button>
                        </div>
                    </section>
                </div>
            </div>
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
                        <button class="btn button-type-primary btn-confirm">确定</button>
                    </div>
                </div>

            </div>;
        return settingDom;

    }

    // 图形统计按钮
    baffleDomClkFn(e: Event) {
        let name = e.target['name'];
        if (e.target['className'] === 'pc-baffle-close' || e.target['classList'].contains('btn-cancel')) {

            // this.baffleDom.children[0].style.animation = 'doBaffleMain .3s ease-in-out reverse';
            // this.baffleDom.style.display = 'none';
            if (tools.isMb) {
                this.baffleDom.children[0].classList.remove('showMain');
                this.baffleDom.children[0].classList.add('hideMain');
                setTimeout(() => {
                    this.baffleDom.style.display = 'none';
                }, 300);
            } else {
                this.baffleDom.style.display = 'none';
            }
        } else if (e.target['classList'].contains('btn-confirm')) {
            if (!this.settingData.type) {
                return Modal.alert('类型不能为空');
            } else if (!this.settingData.xAxis) {
                return Modal.alert('横坐标不能为空');
            } else if (this.settingData.yAxis.length === 0) {
                return Modal.alert('纵坐标不能为空');
            }
            // this.baffleDom.style.display = 'none';
            if (tools.isMb) {
                this.baffleDom.children[0].classList.remove('showMain');
                this.baffleDom.children[0].classList.add('hideMain');
                setTimeout(() => {
                    this.baffleDom.style.display = 'none';
                }, 300);
            } else {
                this.baffleDom.style.display = 'none';
            }
            let chartTableEle = d.query('.chart-table', this.parentDom);
            chartTableEle && this.parentDom.removeChild(chartTableEle);
            console.log(this.settingData);
            this.ui.showType = this.settingData.type;
            this.ui.local.xCoordinate = this.settingData.xAxis;
            this.ui.local.yCoordinate = this.settingData.yAxis.join(',');
            new ChartTableModule(this.ui, this.wrapper, this.data, this.ftable);

        }
        if (!name) return;
        // this.chartDom.classList.contains
        if (name === 'yAxis') {
            e.target['previousElementSibling'].checked;
            // e.target['parentElement'].parentElement.querySelector('.checked-radio').classList.remove('checked-radio');
            // e.target['classList'].add('checked-radio');
            e.target['classList'].toggle('checked-radio');
        } else {
            e.target['previousElementSibling'].checked;
            let checkedDom = e.target['parentElement'].parentElement.querySelector('.checked-radio');
            checkedDom && checkedDom.classList.remove('checked-radio');
            e.target['classList'].add('checked-radio');
        }
        let prevEleValue = e.target['previousElementSibling'].value;
        switch (name) {
            case 'type':
                this.settingData.type = prevEleValue;
                break;
            case 'xAxis':
                this.settingData.xAxis = prevEleValue;
                break;
            case 'yAxis':
                if (e.target['classList'].contains('checked-radio')) {
                    !this.settingData.yAxis.includes(prevEleValue) && this.settingData.yAxis.push(prevEleValue);
                } else {
                    if (this.settingData.yAxis.includes(prevEleValue)) {
                        this.settingData.yAxis.splice(this.settingData.yAxis.indexOf(prevEleValue), 1);
                    }
                }
        }
        console.log(this.settingData);
    }


    /**
     * 初始化图表切表格按钮
     */
    initTableBtns() {
        let btnsContainer: HTMLElement = d.query('.fast-table-btns', this.wrapper);
        if (!btnsContainer) return;

        
        // d.query('.chart-btn', btnsContainer) && d.query('.chart-btn', btnsContainer).parentElement.removeChild(d.query('.chart-btn', btnsContainer));
        // let chartBtnEle: HTMLElement = d.query('.chart-btn', btnsContainer);
        // chartBtnEle && chartBtnEle.parentElement.removeChild(chartBtnEle);
        let chartBtn: HTMLElement = btnsContainer.querySelector('.chart-btn');
        if (!chartBtn) {
            chartBtn = tools.isMb ?
            <button class="btn button-type-default button-small chart-btn mb-chart-btn">
                <i class="appcommon app-tuxing" ></i>
            </button>
            : <button class="btn button-type-default button-small chart-btn ">图表</button>
            btnsContainer.children.length > 0 ? btnsContainer.children[0].appendChild(chartBtn) : btnsContainer.appendChild(chartBtn);
        }
        
        chartBtn.onclick = () => {

            this.wrapper.style.display = 'none';
            this.chartBtnsContainer.style.display = 'block';
            this.chart && this.chart.resize();
        }
    }

    /**
     * 通用表格处理方法 
     */
    initCommonChartFn(chartEle: HTMLElement, max?: boolean) {
        if(!this.ui.chartPage) {
            chartEle.parentElement.style.height = '25rem';
            !max && (chartEle.style.height = '20rem');
        }
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
        type = type === 'area' ? 'line' : type;
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
                barMaxWidth: 60,
            }
            this.settingData.type === 'area' && (seriesItem['areaStyle'] = {});
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
                top: 15,
            },
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
        let caption = this.ui.caption;
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
                if(legendName.length === 1) {
                    let floor = Math.ceil(legendName.length / 3);
                    let redidue = i % 3;
                    yAxis = 50 + '%';
                    xAxis = 50 + '%';
                } else if(legendName.length === 2) {
                    let floor = Math.ceil(legendName.length / 3);
                    let redidue = i % 3;
                    xAxis = 35*(i+1) + '%';
                    yAxis = 50 + '%';
                } else {
                    let floor = Math.ceil(legendName.length / 3);
                    let redidue = i % 3;
                    yAxis = (50 / floor) + 6 + '%';
                    xAxis = (25 + redidue * 25) + '%';
                }
                
            }
            // debugger;
            let name = this.ui.cols.find(col => col.name === legend).caption;
            let seriesItem = {
                name: name,
                type: 'pie',
                radius: this.ui.chartPage ? 60 : tools.isMb ? 70 : 90,
                center: [xAxis, yAxis],
                label:{
                    normal: {
                        formatter: '{a}\n {b}: {d}%'
                    }
                },
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
        // debugger;
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
                top: 30,
            },
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
        !tools.isMb && (chartData['tooltip'] = {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"});
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

        let varNamesObj: object = {};
        let ifBreak: boolean = false;
        defaultCol.drillAddr && defaultCol.drillAddr.varList.forEach(list => {
            if (list.varName) {
                varNamesObj[list.varName] = dataCol[list.varName];
                // !dataCol[list.varName] && (ifBreak = true);
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
                    {this.ui.showType === 'map'? '': <button class="mb-switch-table btn button-type-default" data-type="chartSetting">
                        <i class=" iconfont button-icon icon-bingzhuangtu" data-type="chartSetting"></i>
                    </button>}
                    
                </section>
                {this.chartDom}
            </div>
            : <div class="chart-table" >

                <section class="chart-btns">
                    
                    <button class="switch-table btn button-type-default button-small" data-type="switchTable">
                        <i class="appcommon app-biaoge" data-type="switchTable"></i>
                        表格
                    </button>
                    {this.ui.showType === 'map'? '' : <button class="switch-table btn button-type-default button-small" data-type="chartSetting">
                        <i class="iconfont button-icon icon-bingzhuangtu" data-type="chartSetting"></i>
                        设置
                    </button>}
                    
                </section>

                {this.chartDom}
            </div>
        this.chartBtnsContainer = this.ui.chartPage ? <div class="chart-table" >{this.chartDom}</div> : this.chartBtnsContainer;
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
                    if (tools.isMb) {
                        this.baffleDom.children[0].classList.remove('hideMain');
                        this.baffleDom.children[0].classList.add('showMain');
                    }
                    this.baffleDom.style.display = 'block';



                    // tools.isMb ? this.mbChartSetting() : this.pcChartSetting();
                    break;
            }
        });

        if (this.ui.showType === 'pie' || this.ui.showType === 'map') return;
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
                let subDom = d.query('.table-module-has-sub', body);
                subDom && (subDom.style.height = '100vh');
            }
        });
    }

    mbChartSetting() {

    }



    // 地图处理的三个函数
    async initMap(chartEle: HTMLElement) {
        const bodyData: Array<any> = this.data['data'] || [];
        if (bodyData.length === 0) {
            this.data.body.bodyList[0].dataList.forEach(list => {
                let obj = {};
                list.forEach((ele, index) => {
                    obj[this.data.body.bodyList[0].meta[index]] = ele;
                });
                bodyData.push(obj);
            });
        }
        let xAxisName: string = this.ui.local.xCoordinate.toUpperCase();
        let yAxisNames: Array<any> = this.ui.local.yCoordinate.toUpperCase().split(',');
        let yAxisNamesObj: object = {};
        yAxisNames.forEach(name => {
            // console.log(this.ui.cols.find(col=> col.name === name).caption)
            // yAxisNamesObj[]
            // Object.defineProperty(yAxisNamesObj, name, this.ui.cols.find(col=> col.name === name).caption);
            debugger;
            yAxisNamesObj[name] = this.ui.cols.find(col => col.name === name).caption
            console.log(this.ui.cols.find(col => col.name === name).caption)
        });
        //  yAxisNames.map(key => ({[key]: this.ui.cols.find(col=> col.name === key).caption}));
        console.log(yAxisNamesObj);
        let numArr: Array<number> = bodyData.map(item => item[yAxisNames[0]]);
        let max = numArr.length === 0? 1 : Math.max(...numArr) ;

        // let min = Math.min(...numArr);

        chartEle.parentElement.style.height = '100%';
        chartEle.style.height = '100%';
        let chinaMap = echarts.init(chartEle);
        // let chart = echarts.init(chartEle);
        let mapJson = await $.get(`${baseUrl}../map/china.json`);
        console.log(mapJson);
        // const signName = /.*省$/.test(`${this.ui.location}`) ? this.ui.location.slice(0, (this.ui.location.length - 1)) : this.ui.location;
        // const 

        const signValue = bodyData.map(col => {
            const signName = /.*(省|市)$/.test(`${col[xAxisName]}`) ? col[xAxisName].slice(0, (col[xAxisName].length - 1)) : col[xAxisName];
            console.log(col[xAxisName].slice(0, (col[xAxisName].length - 1)));
            let signValue = mapJson.features.find(feature => feature.properties.name === signName);
            return signValue;
        });
        debugger;

        let riseData = [ ];
        let declineData = [];
        if (this.ui.riseRule) {
            let riseRule = this.ui.riseRule.split(',');
            let riseValue: Array<any>;
            let valueArr = bodyData.map(col => col[riseRule[0]]);
            if (riseRule[1] === '1') {
                let conditionArr = bodyData.map(col => col[riseRule[2]]);
                valueArr.forEach((value, i) => {
                    // if(value >= conditionArr[i]) {
                    //     riseData.push({
                    //         name: obj. properties.name,
                    //         value: obj. properties.cp,
                    //         itemStyle: {
                    //             color: 'red'
                    //         }});
                    // }
                    signValue.forEach((obj, i) => {
                        if (valueArr[i] >= conditionArr[i]) {
                            riseData.push({
                                name: obj.properties.name,
                                value: obj.properties.cp,
                                itemStyle: {
                                    color: 'red'
                                }
                            });
                        }else {
                            declineData.push({
                                name: obj.properties.name,
                                value: obj.properties.cp,
                                itemStyle: {
                                    color: '#007AFF'
                                }
                            });
                        }

                    })
                })
            } else {
                signValue.forEach((obj, i) => {
                    if (valueArr[i] >= Number(riseRule[2])) {
                        riseData.push({
                            name: obj.properties.name,
                            value: obj.properties.cp,
                            itemStyle: {
                                color: 'red'
                            }
                        });
                    } else {
                        declineData.push({
                            name: obj.properties.name,
                            value: obj.properties.cp,
                            itemStyle: {
                                color: '#007AFF'
                            }
                        });
                    }

                })
            }

        }
        let chart = echarts.registerMap('china', mapJson);


        function provinceFn(province: string) {
            let item = bodyData.find(item => item[xAxisName].indexOf(province) !== -1);
            console.log(item);
            return item ? item[yAxisNames[0]] : 0;
        }


        let chinaMapOption = {


            visualMap: {
                min: 0,
                max,
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
                    data: riseData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M445.155 279.007v645.749c0 19.241 15.436 34.839 35.136 34.839h68.976c19.405 0 35.136-15.579 35.136-34.839v-656.499l206.75 203.214c6.875 6.859 18.191 6.685 25.279-0.399l48.781-48.782c7.086-7.086 7.278-18.402 0.4-25.262l-277.982-273.247c-0.976-2.13-2.348-4.137-4.111-5.902l-53.198-53.216c-4.188-4.188-9.724-6.164-15.116-5.902-4.957-0.251-10.070 1.559-13.931 5.41l-38.706 38.731-298.166 286.89c-7.517 7.499-7.308 19.838 0.423 27.567l53.198 53.216c7.751 7.732 20.085 7.924 27.567 0.422l199.555-191.993z',
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
                        // color: 'red'
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
                        return { name: province, value: provinceFn(province) }
                    })
                },{
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: declineData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M584.407 739.326v-645.749c0-19.241-15.436-34.839-35.141-34.839h-68.976c-19.405 0-35.136 15.579-35.136 34.839v656.499l-206.751-203.214c-6.877-6.859-18.191-6.685-25.279 0.399l-48.781 48.782c-7.086 7.086-7.278 18.402-0.4 25.262l277.984 273.247c0.976 2.13 2.348 4.137 4.111 5.902l53.198 53.216c4.188 4.188 9.724 6.164 15.116 5.902 4.964 0.251 10.070-1.559 13.931-5.41l38.706-38.731 298.166-286.89c7.517-7.499 7.308-19.838-0.423-27.567l-53.198-53.216c-7.751-7.732-20.085-7.924-27.567-0.422l-199.555 191.993z',
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

            ]
        }
        if (!tools.isMb) {
            chinaMapOption['tooltip'] = {
                trigger: 'item',
                // formatter: `{b}<br/>${yAxisNamesObj[yAxisNames[0]]} : {c}`
                formatter: (param) => {
                    let tipInfo = bodyData.find(item => item[xAxisName].indexOf(param.name) !== -1);
                    if (!tipInfo) return param.name;
                    let tip = `${param.name}<br/>`;
                    yAxisNames.forEach((name, i) => {
                        tip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${this.color[i]}"></span>${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
                    });

                    return tip;
                }
            }
        }

        chinaMap.setOption(chinaMapOption);
        chinaMap.on('click', (params) => {
            let col = bodyData.find(col => col[xAxisName].indexOf(params.name) !== -1);
            if (!col) return;
            let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, col);
            if (tools.isMb && !ifBreak) {
                // let tipDom: HTMLDivElement
                let tip = `${params.name}<br/>`;
                yAxisNames.forEach((name, i) => {
                    tip += `${yAxisNamesObj[name]} : ${col[name]} <br/>`;
                });


                let tipDom: HTMLDivElement = <div class="tip-link">
                    <p>{params.name}</p>
                </div>;
                yAxisNames.forEach((name, i) => {
                    tipDom.appendChild(<p>{yAxisNamesObj[name]} : {col[name]}</p>);
                });
                tipDom.appendChild(<p class="link-to">点击查看</p>);


                d.query('.tip-link', this.chartBtnsContainer) && this.chartBtnsContainer.removeChild(d.query('.tip-link', this.chartBtnsContainer));

                setTimeout(() => {
                    this.chartBtnsContainer.appendChild(tipDom);
                    tipDom.style.top = params.event.offsetY + 'px';
                    tipDom.style.left = (params.event.offsetX - 50) + 'px';
                }, 300);
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

        return chinaMap;
    }

    async initProvince(chartEle: HTMLElement, name: string) {
        const bodyData: Array<any> = this.data['data']? this.data['data'] : [];
        if (!bodyData) {
            
            this.data.body.bodyList[0].dataList.forEach(list => {
                let obj = {};
                list.forEach((ele, index) => {
                    obj[this.data.body.bodyList[0].meta[index]] = ele;
                });
                bodyData.push(obj);
            });
        }
        let xAxisName: string = this.ui.local.xCoordinate.toUpperCase();
        let yAxisNames: Array<any> = this.ui.local.yCoordinate.toUpperCase().split(',');
        let yAxisNamesObj: object = {};
        yAxisNames.forEach(name => {
            // console.log(this.ui.cols.find(col=> col.name === name).caption)
            // yAxisNamesObj[]
            // Object.defineProperty(yAxisNamesObj, name, this.ui.cols.find(col=> col.name === name).caption);
            yAxisNamesObj[name] = this.ui.cols.find(col => col.name === name).caption
            console.log(this.ui.cols.find(col => col.name === name).caption)
        });
        let numArr: Array<number> = bodyData.map(item => item[yAxisNames[0]]);
        let max = numArr.length === 0? 1 : Math.max(...numArr) ;
        
        chartEle.parentElement.style.height = '100%';
        chartEle.style.height = '100%';
        // let myData = [];
       
        // let chart = echarts.init(chartEle);
        let provinceName = ProvinceMap[name];
        let citysJson = await $.get(`${baseUrl}../map/province/${provinceName}.json`);

        // 处理上升下降标记
        const signValue = bodyData.map(col => {
            const signName = /.*市$/.test(`${col[xAxisName]}`) ?  col[xAxisName] : col[xAxisName] + '市' ;
            console.log(col[xAxisName].slice(0, (col[xAxisName].length - 1)));
            let signValue = citysJson.features.find(feature => feature.properties.name === signName);
            return signValue;
        });
        let riseData = [ ];
        let declineData = [];
        if (this.ui.riseRule) {
            let riseRule = this.ui.riseRule.split(',');
            let riseValue: Array<any>;
            let valueArr = bodyData.map(col => col[riseRule[0]]);
            if (riseRule[1] === '1') {
                let conditionArr = bodyData.map(col => col[riseRule[2]]);
                valueArr.forEach((value, i) => {
                    signValue.forEach((obj, i) => {
                        if (valueArr[i] >= conditionArr[i]) {
                            riseData.push({
                                name: obj.properties.name,
                                value: obj.properties.cp,
                                itemStyle: {
                                    color: 'red'
                                }
                            });
                        } else {
                            declineData.push({
                                name: obj.properties.name,
                                value: obj.properties.cp,
                                itemStyle: {
                                    color: '#007AFF'
                                }
                            });
                        }

                    })
                })
            } else {
                signValue.forEach((obj, i) => {
                    if (valueArr[i] >= Number(riseRule[2])) {
                        riseData.push({
                            name: obj.properties.name,
                            value: obj.properties.cp,
                            itemStyle: {
                                color: 'red'
                            }
                        });
                    } else {
                        declineData.push({
                            name: obj.properties.name,
                            value: obj.properties.cp,
                            itemStyle: {
                                color: '#007AFF'
                            }
                        });
                    }

                })
            }

        }

        echarts.registerMap(provinceName, citysJson);
        let provinceEchart = echarts.init(chartEle);
        let citys = citysJson.features.map(city => city.properties.name);
        const cityFn = (city: string) => {
            let item = bodyData.find(item => item[xAxisName].indexOf(city) !== -1);
            console.log(item);
            return item ? item[yAxisNames[0]] : 0;
        }
        let options = {
            // tooltip: {
            //     trigger: 'item',
            //     formatter: (param) => {
            //         let tipInfo = bodyData.find(item => item[xAxisName].indexOf(param.name) !== -1);
            //         if (!tipInfo) return param.name;
            //         let tip = `${param.name}<br/>`;
            //         yAxisNames.forEach((name, i) => {
            //             tip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${this.color[i]}"></span>${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
            //         });

            //         return tip;
            //     }
            // },
            visualMap: {
                min: 0,
                max,
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
                    data: riseData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M445.155 279.007v645.749c0 19.241 15.436 34.839 35.136 34.839h68.976c19.405 0 35.136-15.579 35.136-34.839v-656.499l206.75 203.214c6.875 6.859 18.191 6.685 25.279-0.399l48.781-48.782c7.086-7.086 7.278-18.402 0.4-25.262l-277.982-273.247c-0.976-2.13-2.348-4.137-4.111-5.902l-53.198-53.216c-4.188-4.188-9.724-6.164-15.116-5.902-4.957-0.251-10.070 1.559-13.931 5.41l-38.706 38.731-298.166 286.89c-7.517 7.499-7.308 19.838 0.423 27.567l53.198 53.216c7.751 7.732 20.085 7.924 27.567 0.422l199.555-191.993z',
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
                    name: provinceName,
                    type: 'map',
                    geoIndex: 0,
                    data: citys.map(city => {
                        return { name: city, value: cityFn(city) }
                    })
                },{
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: declineData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M584.407 739.326v-645.749c0-19.241-15.436-34.839-35.141-34.839h-68.976c-19.405 0-35.136 15.579-35.136 34.839v656.499l-206.751-203.214c-6.877-6.859-18.191-6.685-25.279 0.399l-48.781 48.782c-7.086 7.086-7.278 18.402-0.4 25.262l277.984 273.247c0.976 2.13 2.348 4.137 4.111 5.902l53.198 53.216c4.188 4.188 9.724 6.164 15.116 5.902 4.964 0.251 10.070-1.559 13.931-5.41l38.706-38.731 298.166-286.89c7.517-7.499 7.308-19.838-0.423-27.567l-53.198-53.216c-7.751-7.732-20.085-7.924-27.567-0.422l-199.555 191.993z',
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
            ]
        };
        if (!tools.isMb) {
            options['tooltip'] = {
                trigger: 'item',
                formatter: (param) => {
                    let tipInfo = bodyData.find(item => item[xAxisName].indexOf(param.name) !== -1);
                    if (!tipInfo) return param.name;
                    let tip = `${param.name}<br/>`;
                    yAxisNames.forEach((name, i) => {
                        tip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${this.color[i]}"></span>${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
                    });

                    return tip;
                }
            }
        }
        provinceEchart.setOption(options);
        provinceEchart.on('click', (params) => {
            let col = bodyData.find(col => col[xAxisName].indexOf(params.name) !== -1);
            if (!col) return;
            let { defaultCol, dataCol, varNamesObj, ifBreak } = this.drillPage(params, col);
            if (tools.isMb && !ifBreak) {
                let tipDom: HTMLDivElement = <div class="tip-link">
                    <p>{params.name}</p>
                </div>;
                yAxisNames.forEach((name, i) => {
                    tipDom.appendChild(<p>{yAxisNamesObj[name]} : {col[name]}</p>);
                });
                tipDom.appendChild(<p class="link-to">点击查看</p>);

                d.query('.tip-link', this.chartBtnsContainer) && this.chartBtnsContainer.removeChild(d.query('.tip-link', this.chartBtnsContainer));

                setTimeout(() => {
                    this.chartBtnsContainer.appendChild(tipDom);
                    tipDom.style.top = params.event.offsetY + 'px';
                    tipDom.style.left = (params.event.offsetX - 50) + 'px';
                }, 300);
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

        })
        return provinceEchart;
    }

    async initCity(chartEle: HTMLElement, name: string) {
        const bodyData: Array<any> = this.data['data']? this.data['data'] : [];
        if (!bodyData) {
            this.data.body.bodyList[0].dataList.forEach(list => {
                let obj = {};
                list.forEach((ele, index) => {
                    obj[this.data.body.bodyList[0].meta[index]] = ele;
                });
                bodyData.push(obj);
            });
        }
        let xAxisName: string = this.ui.local.xCoordinate.toUpperCase();
        let yAxisNames: Array<any> = this.ui.local.yCoordinate.toUpperCase().split(',');
        let yAxisNamesObj: object = {};
        yAxisNames.forEach(name => {
            // console.log(this.ui.cols.find(col=> col.name === name).caption)
            // yAxisNamesObj[]
            // Object.defineProperty(yAxisNamesObj, name, this.ui.cols.find(col=> col.name === name).caption);
            yAxisNamesObj[name] = this.ui.cols.find(col => col.name === name).caption
            console.log(this.ui.cols.find(col => col.name === name).caption)
        });
        let numArr: Array<number> = bodyData.map(item => item[yAxisNames[0]]);
        let max = numArr.length === 0? 1 : Math.max(...numArr) ;
        const countyFn = (county: string) => {
            let item = bodyData.find(item => item[xAxisName].indexOf(county) !== -1);
            console.log(item);
            return item ? item[yAxisNames[0]] : 0;
        }

        chartEle.parentElement.style.height = '100%';
        chartEle.style.height = '100%';
        let myData = [];

        // let chart = echarts.init(chartEle);
        let cityCode = CityMap[name];

        let cityJson = await $.get(`${baseUrl}../map/citys/${cityCode}.json`);

        // 处理上升下降标记
        const signValue = bodyData.map(col => {
            const signName =  col[xAxisName];
            console.log(col[xAxisName].slice(0, (col[xAxisName].length - 1)));
            let signValue = cityJson.features.find(feature => feature.properties.name === signName);
            return signValue;
        });
        let riseData = [ ];
        let declineData = [];
        if (this.ui.riseRule) {
            let riseRule = this.ui.riseRule.split(',');
            let riseValue: Array<any>;
            let valueArr = bodyData.map(col => col[riseRule[0]]);
            if (riseRule[1] === '1') {
                let conditionArr = bodyData.map(col => col[riseRule[2]]);
                valueArr.forEach((value, i) => {
                    
                    signValue.forEach((obj, i) => {
                        if(!obj) return ;
                        let sum = obj.geometry.coordinates[0][0].reduce((accumulator, currentValue) => {
                            return [accumulator[0]+ currentValue[0], accumulator[1]+ currentValue[1]]
                        });
                        // debugger;

                        if (valueArr[i] >= conditionArr[i]) {
                            
                            riseData.push({
                                name: obj.properties.name,
                                value: obj.geometry.coordinates[0][0][0],
                                itemStyle: {
                                    color: 'red'
                                }
                            });
                        } else {
                            declineData.push({
                                name: obj.properties.name,
                                value: obj.geometry.coordinates[0][0][0],
                                itemStyle: {
                                    color: '#007AFF'
                                }
                            });
                        }

                    })
                })
            } else {
                signValue.forEach((obj, i) => {
                    if(!obj) return ;
                    let coordinates = obj.geometry.coordinates[0][0].reduce((accumulator, currentValue) => {
                        return [accumulator[0]+ currentValue[0], accumulator[1]+ currentValue[1]]
                    });
                    coordinates = [coordinates[0] / obj.geometry.coordinates[0][0].length, coordinates[1] / obj.geometry.coordinates[0][0].length, ]
                    if (valueArr[i] >= Number(riseRule[2])) {
                        riseData.push({
                            name: obj.properties.name,
                            value: coordinates,
                            itemStyle: {
                                color: 'red'
                            }
                        });
                    } else {
                        declineData.push({
                            name: obj.properties.name,
                            value: coordinates,
                            itemStyle: {
                                color: '#007AFF'
                            }
                        });
                    }

                })
            }

        }
        echarts.registerMap(cityCode, cityJson);
        let cityEchart = echarts.init(chartEle);
        let districts = cityJson.features.map(district => district.properties.name);
        let options = {
            // tooltip: {
            //     trigger: 'item',
            //     formatter: (param) => {
            //         let tipInfo = bodyData.find(item => item[xAxisName].indexOf(param.name) !== -1);
            //         if (!tipInfo) return param.name;
            //         let tip = `${param.name}<br/>`;
            //         yAxisNames.forEach((name, i) => {
            //             if(tools.isMb) {
            //                 tip += `${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
            //             } else {
            //                 tip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${this.color[i]}"></span>${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
            //             }

            //         });

            //         return tip;
            //     }
            // },
            visualMap: {
                min: 0,
                max,
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
                    data: riseData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M445.155 279.007v645.749c0 19.241 15.436 34.839 35.136 34.839h68.976c19.405 0 35.136-15.579 35.136-34.839v-656.499l206.75 203.214c6.875 6.859 18.191 6.685 25.279-0.399l48.781-48.782c7.086-7.086 7.278-18.402 0.4-25.262l-277.982-273.247c-0.976-2.13-2.348-4.137-4.111-5.902l-53.198-53.216c-4.188-4.188-9.724-6.164-15.116-5.902-4.957-0.251-10.070 1.559-13.931 5.41l-38.706 38.731-298.166 286.89c-7.517 7.499-7.308 19.838 0.423 27.567l53.198 53.216c7.751 7.732 20.085 7.924 27.567 0.422l199.555-191.993z',
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
                        return { name: district, value: countyFn(district) }
                    })
                },{
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: declineData,
                    symbolSize: 10,
                    silent: true,
                    symbol: 'path://M584.407 739.326v-645.749c0-19.241-15.436-34.839-35.141-34.839h-68.976c-19.405 0-35.136 15.579-35.136 34.839v656.499l-206.751-203.214c-6.877-6.859-18.191-6.685-25.279 0.399l-48.781 48.782c-7.086 7.086-7.278 18.402-0.4 25.262l277.984 273.247c0.976 2.13 2.348 4.137 4.111 5.902l53.198 53.216c4.188 4.188 9.724 6.164 15.116 5.902 4.964 0.251 10.070-1.559 13.931-5.41l38.706-38.731 298.166-286.89c7.517-7.499 7.308-19.838-0.423-27.567l-53.198-53.216c-7.751-7.732-20.085-7.924-27.567-0.422l-199.555 191.993z',
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
            ]
        };
        if (!tools.isMb) {
            options['tooltip'] = {
                trigger: 'item',
                formatter: (param) => {
                    let tipInfo = bodyData.find(item => item[xAxisName].indexOf(param.name) !== -1);
                    if (!tipInfo) return param.name;
                    let tip = `${param.name}<br/>`;
                    yAxisNames.forEach((name, i) => {
                        if (tools.isMb) {
                            tip += `${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
                        } else {
                            tip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${this.color[i]}"></span>${yAxisNamesObj[name]} : ${tipInfo[name]} <br/>`;
                        }

                    });

                    return tip;
                }
            }
        }
        // debugger;
        cityEchart.setOption(options);

        return cityEchart;
    }



}