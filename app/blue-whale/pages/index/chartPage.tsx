/// <amd-module name="ChartPage"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "blue-whale/pages/basicPage";
import d = G.d;
import { BwRule } from "../../common/rule/BwRule";
import CONF = BW.CONF;
import chinaJson from '../../module/chartPageComponents/stacked-histogram-component/stacked-histogram.component';
declare const echarts;
import { EchartModule } from "blue-whale/module/echart-module/echartModule";
import sys = BW.sys;
import { ChartTableModule } from "blue-whale/module/echart-module/chartTableModule";
import { NewTablePage, ITablePagePara } from "../table/newTablePage";



interface ICollectPara {
    dom?: HTMLElement,
    title?: string,
    ui?: IBW_UI<Element>
}
interface Element {
    caption: string,
    cols: Array<{
        caption: string,
        name: string,
        noShow: boolean,
        supportLink: boolean,
    }>,
    dataAddr: DataAddr,
    data: Array<any>,
    itemId: string,
    local: {
        xCoordinate: string,
        yCoordinate: string
    },
    panelId: string,
    // querier: object,
    showType: string,
    userLocal: string,
}
interface DataAddr {
    addrType?: boolean
    commitType?: number
    dataAddr?: string
    needGps?: number
    type?: string
    varType?: boolean
}
export class ChartPage extends BasicPage {
    
    container: HTMLElement;   // btl 获取的dom元素即当前页面的容器
    uiCharts ;   // 获取的UI绘制


    constructor(para: ICollectPara) {

        super(para);
        this.container = this.render();
        G.d.append(para.dom, this.container);
        this.uiCharts = para.ui;
        $('#app').toggleClass('app-sidebar-closed');
        this.initData();
        
        
    }
    async initData() {
        console.log(CONF.siteUrl);
        // let url: string = CONF.siteUrl + '/app_sanfu_retail/null/home_page/workbench?modulesId=1';
        // await $.get(url, (res) => {
        //     this.uiCharts = res;
        // });
        console.log(this.uiCharts);
        this.uiCharts.body.elements.forEach(data => {
            switch (data.blockInfo.uiType) {
                case 'menu':
                    this.menuFn(data);
                    break;
                case 'panel':
                    this.panelFn(data);
                    break;
                case 'table':
                    this.tableFn(data);
            }
        })

        
    }
    menuFn(data: any) {
        let divDom: HTMLDivElement = <div class="workbeanch-menu"></div>
        this.container.appendChild(divDom);
        let width = data.positionInfo.width * 10 + '%';
        let height = data.positionInfo.heigh * 10 + '%';
        divDom.style.width = `calc(${width} - 10px)`;
        divDom.style.height = `calc(${height} - 10px)`;
        divDom.style.left = Number(data.positionInfo.coordinatePairs.split(',')[0]) * 10 + '%';
        divDom.style.top = Number(data.positionInfo.coordinatePairs.split(',')[1]) * 10 + '%';
        data.blockInfo.element.forEach(ele => {
            let btnDom: HTMLElement = <button></button>;
            btnDom.textContent = ele.menuName;
            divDom.appendChild(btnDom);
            btnDom.onclick = () => {
                // debugger;
                const url = CONF.siteUrl + ele.menuPath.dataAddr;
                sys.window.open({ url, gps: ele.menuPath.needGps });
            }
            
            
        });
    }
    async panelFn(data: any) {
        let divDom: HTMLDivElement = <div class="workbeanch-chart"></div>
        this.container.appendChild(divDom);
        divDom.style.width = data.positionInfo.width * 10 + '%';
        divDom.style.height = data.positionInfo.heigh * 10 + '%';
        divDom.style.left = Number(data.positionInfo.coordinatePairs.split(',')[0]) * 10 + '%';
        divDom.style.top = Number(data.positionInfo.coordinatePairs.split(',')[1]) * 10 + '%';
        let { uiType , caption, element } = data.blockInfo;
        Object.assign(element, {
            local: {
              xCoordinate: data.showInfo.xFieldName,
              yCoordinate: data.showInfo.yFieldNames  
            },
            showType: data.showInfo.showType,
            riseRule: data.showInfo.riseRule,
            location: data.showInfo.location || null,
            uiType,
            caption,
            chartPage: true
        });
        const chartData = await $.get(CONF.siteUrl + data.blockInfo.element.dataAddr.dataAddr,{nopage: true});
        
        console.log(element);
        let chartDom = <div></div>;
        divDom.appendChild(chartDom);
        new ChartTableModule(element, chartDom,chartData, null);
        
    }
    tableFn(data: any) {
        let divDom: HTMLDivElement = <div class="table-chart"></div>
        this.container.appendChild(divDom);
        divDom.style.width = data.positionInfo.width * 10 + '%';
        divDom.style.height = data.positionInfo.heigh * 10 + '%';
        divDom.style.left = Number(data.positionInfo.coordinatePairs.split(',')[0]) * 10 + '%';
        divDom.style.top = Number(data.positionInfo.coordinatePairs.split(',')[1]) * 10 + '%';
        
        const ui = {
            body: {},
            chartPage: true,
            dom: divDom
        }
        Object.assign(ui.body, {ui: data.blockInfo});
        let para: ITablePagePara = {
            ui: {
                body: {
                    elements: [data.blockInfo.element],
                    subButtons: []
                }
            },
            chartPage: true,
            dom: divDom
        }
        
         new NewTablePage(para);
    }
    
    render() {

        return (
            <main class="chart-page" id="chart-page">
            </main>
        )

    }

}
