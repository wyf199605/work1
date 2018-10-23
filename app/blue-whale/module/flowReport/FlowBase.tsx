/// <amd-module name="FlowBase"/>
import d = G.d;
import {FlowReport} from "./FlowReport";
import {ListItemDetail} from "../listDetail/ListItemDetail";

export class FlowBase {
    constructor(para) {
        switch (para.uiType) {
            case 'flow': {
                // new FlowReport(para);
                new ListItemDetail(para);
            }
            break;
        }
    }
}