/// <amd-module name="BwMbList"/>
import IComponentPara = G.IComponentPara;
import BasicPage from "../basicPage";
import {MbListModule} from "../../module/mbListModule/mbListModule";
import tools = G.tools;
import d = G.d;
export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table>;
    ajaxData?: obj;
    dom: HTMLElement;
}

export class BwMbList extends BasicPage {

    constructor(private para: IBwMbList) {
        super(para);

        if (tools.isNotEmpty(para.ui) && tools.isNotEmpty(para.ui.body.elements[0].layout)){
            let container = tools.isMb ? d.query('.mb-list-page',para.dom) : para.dom;
            new MbListModule({
                ui:para.ui,
                ajaxData:para.ajaxData,
                container:container
            })
        }
    }
}