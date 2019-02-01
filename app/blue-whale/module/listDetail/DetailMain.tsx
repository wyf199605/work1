/// <amd-module name="DetailMain"/>

import {IDetailBasePara} from "./DetailBase";
import {ListItemDetail} from "./ListItemDetail";
import {EditDetail} from "./EditDetail";

interface IDetailMain extends IDetailBasePara{
    dom?:HTMLElement;
}

export class DetailMain {
    static EditDetailTypes = ['edit_detail', 'noedit_detail','edit_view'];
    private detailModule:EditDetail | ListItemDetail;
    constructor(para: IDetailMain) {
        if (~DetailMain.EditDetailTypes.indexOf(para.uiType)) {
            this.detailModule = new EditDetail({
                container: para.dom,
                isEdit: para.uiType === 'edit_detail',
                fm: para.fm,
                uiType: para.uiType,
                url: para.url
            });
        } else {
            this.detailModule = new ListItemDetail(Object.assign({}, para, {url: para.url, container: para.dom}));
        }
    }

    refresh(){
        this.detailModule.refresh();
    }
}