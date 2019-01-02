/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";
import {BwRule} from "../../common/rule/BwRule";
import {EditDetailModule} from "../../module/listDetail/editDetailModule";

export class ListDetailPage extends BasicPage {
    constructor(para: EditPagePara) {
        super(para);
        let details = ['edit_detail', 'noedit_detail'];
        if (~details.indexOf(para.uiType)) {
            let editDetail = new EditDetailModule({
                container: para.dom,
                isEdit: para.uiType === 'edit_detail',
                fm: para.fm,
                uiType: para.uiType,
                url: this.url
            });
            this.on(BwRule.EVT_REFRESH, () => {
                editDetail.changePage();
            })
        } else {
            let detailItem = new ListItemDetail(para);
            // 刷新非detail页面，detail页面的刷新在页面内完成
            if (para.uiType !== 'detail') {
                this.on(BwRule.EVT_REFRESH, () => {
                    detailItem.changePage();
                })
            }
        }
    }
}
