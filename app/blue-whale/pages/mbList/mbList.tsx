/// <amd-module name="BwMbList"/>
import IComponentPara = G.IComponentPara;
import BasicPage from "../basicPage";
import {MbListModule} from "../../module/mbListModule/mbListModule";
import tools = G.tools;
import d = G.d;

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table> | IBW_UI<R_SubTable_Field>;
    ajaxData?: obj;
    dom: HTMLElement;
}

export class BwMbList extends BasicPage {

    constructor(private para: IBwMbList) {
        super(para);
        switch (para.ui.uiType) {
            case 'layout': {
                let ui = para.ui as IBW_UI<IBW_Table>;
                if (tools.isNotEmpty(ui) && tools.isNotEmpty(ui.body.elements[0].layout)) {
                    let container = tools.isMb ? d.query('.mb-list-page', para.dom) : para.dom;
                    new MbListModule({
                        ui: ui,
                        ajaxData: para.ajaxData,
                        container: container
                    })
                }
            }
                break;
            case 'view': {

            }
                break;
        }

    }
}