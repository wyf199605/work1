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
    uiCharts: Element[];    // 获取的UI绘制


    constructor(para: ICollectPara) {

        super(para);
        this.container = para.dom;
        // this.uiCharts = para.ui.body.elements;
        G.d.append(para.dom, this.render());
        
        // debugger;
        // this.chinaMapFn();
        this.test();
        
    }
    render() {

        return (
            <main class="chart-page" id="chart-page">
                <section class="ele-drag" draggable="true">1</section>
            </main>
        )

    }
    test() {
       

    }

}
