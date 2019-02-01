/// <amd-module name="ListDetailPage"/>
import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import {DetailMain} from "../../module/listDetail/DetailMain";

export class ListDetailPage extends BasicPage {
    constructor(para: EditPagePara) {
        super(para);
        let detailModule = new DetailMain(Object.assign({}, para, {
            dom: para.dom,
            url: this.url
        }));
        if (para.uiType !== 'detail') {
            this.on(BwRule.EVT_REFRESH, () => {
                detailModule.refresh();
            })
        }
    }
}
