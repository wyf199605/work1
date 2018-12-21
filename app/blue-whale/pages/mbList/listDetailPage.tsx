/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";
import {BwRule} from "../../common/rule/BwRule";

export class ListDetailPage extends BasicPage {
    constructor(para: EditPagePara) {
        super(para);
        let detailItem = new ListItemDetail(para);

        // 刷新非detail页面，detail页面的刷新在页面内完成
        if (para.uiType !== 'detail') {
            this.on(BwRule.EVT_REFRESH, () => {
                detailItem.changePage();
            })
        }
    }
}
