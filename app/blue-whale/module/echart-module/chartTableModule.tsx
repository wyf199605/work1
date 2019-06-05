/// <amd-module name="ChartTableModule"/>
/// <amd-dependency path="echarts" name="echarts"/>

import BasicPage from "blue-whale/pages/basicPage";
import tools = G.tools;
import d = G.d;



declare const echarts;

export class ChartTableModule extends BasicPage {
    constructor(para, wrapper) {
        super(para);
        const parent = wrapper.parentNode;
        debugger
    }
    render() {
        return  <div class="chart-table">

        </div>
    }
}