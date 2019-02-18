/// <amd-module name="GroupTabsPage"/>

import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import {DetailBtnModule} from "../../module/detailModule/detailBtnModule";

export interface IGroupTabItem{
    refresh(data: obj): Promise<any>;
    linkedData: obj;
    btnWrapper: HTMLElement;
}

interface IGroupTabsPagePara extends BasicPagePara{
    ui: IBW_UI<IBW_Detail>
}

export class GroupTabsPage extends BasicPage{
    protected ui: IBW_Detail;
    protected subUi;

    protected main: IGroupTabItem;
    protected sub: IGroupTabItem[];

    constructor(para: IGroupTabsPagePara){
        super(para);
        this.ui = para.ui.body.elements[0];
        window['d'] = new DetailBtnModule({
            ui: this.ui,
            container: para.dom
        })
    }

    getUi(): Promise<any>{
        return new Promise(() => {
            BwRule.Ajax.fetch()
        });
    }
}