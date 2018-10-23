/// <amd-module name="FlowBase"/>
import {FlowReport} from "./FlowReport";

export class FlowBase {
    constructor(para) {
        switch (para.uiType) {
            case 'flow': {
                new FlowReport(para);
            }
            break;
        }
    }
}