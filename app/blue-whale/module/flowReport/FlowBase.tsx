/// <amd-module name="FlowBase"/>
import d = G.d;
import {FlowReport} from "./FlowReport";

export class FlowBase {
    constructor(para) {
        let muiContent = d.query('.mui-content');
        switch (para.uiType) {
            case 'flow': {
                new FlowReport(para);
            }
        }
    }
}