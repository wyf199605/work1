/// <amd-module name="ListDetailPage"/>

import BasicPage from "../basicPage";
import {ListItemDetail} from "../../module/listDetail/ListItemDetail";

export class ListDetailPage extends BasicPage {
    constructor(private para: EditPagePara) {
        super(para);
        new ListItemDetail(para);
    }
}
