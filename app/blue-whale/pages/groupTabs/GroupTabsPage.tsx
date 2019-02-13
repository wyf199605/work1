/// <amd-module name="GroupTabsPage"/>

import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import {BwTableModule} from "../../module/table/BwTableModule";
import {DetailModule} from "../../module/detailModule/detailModule";

interface IGroupTabsPagePara extends BasicPagePara{
    ui: IBW_UI<IBW_Detail>
}

export class GroupTabsPage extends BasicPage{
    protected ui: IBW_Detail;
    protected subUi;

    protected main: BwTableModule;

    constructor(para: IGroupTabsPagePara){
        super(para);
        this.ui = para.ui.body.elements[0];
        window['d'] = new DetailModule({
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