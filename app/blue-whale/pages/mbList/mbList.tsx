/// <amd-module name="BwMbList"/>
import IComponentPara = G.IComponentPara;
import BasicPage from "../basicPage";
import {MbListModule} from "../../module/mbListModule/mbListModule";
import tools = G.tools;
import {MbListView} from "../../module/mbListModule/mbListView";

export interface IBwMbList extends IComponentPara {
    ui: IBW_UI<IBW_Table> | IBW_UI<R_SubTable_Field>;
    dom: HTMLElement;
    title?: string;
}

export class BwMbList extends BasicPage {

    constructor(private para: IBwMbList) {
        super(para);
        switch (para.ui.uiType) {
            case 'layout': {
                let ui = para.ui as IBW_UI<IBW_Table>;
                if (tools.isNotEmpty(ui) && tools.isNotEmpty(ui.body.elements[0].layout)) {
                    new MbListModule({
                        ui: ui,
                        container: para.dom
                    })
                }
            }
                break;
            case 'view': {
                let ui = para.ui as IBW_UI<R_SubTable_Field>;
                new MbListView({
                    ui: ui,
                    container: para.dom
                })
            }
                break;
        }

    }
}