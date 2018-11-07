/// <amd-module name="PermissionTreePage"/>

import BasicPage from "../basicPage";
import {ITablePagePara} from "../table/newTablePage";
import {PermissionTree} from "../../../global/components/navigation/permissionTree/permissionTree";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
export class PermissionTreePage extends BasicPage {
    private permissionTree: PermissionTree;
    private buttonsWrapper:HTMLElement;
    private treeWrapper:HTMLElement;
    constructor(private para: ITablePagePara) {
        super(para);
        this.buttonsWrapper = <div className="permission-page-buttons"/>;
        this.treeWrapper = <div className="permission-page-tree-wrapper"/>;
        para.dom.appendChild(this.buttonsWrapper);
        para.dom.appendChild(this.treeWrapper);
        this.initButtons();
        this.initPermissionTree();
    }

    private initPermissionTree(){
        let dataAddr = this.para.ui.body.elements[0].dataAddr;
        tools.isNotEmpty(dataAddr) && BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(dataAddr)).then(({response})=>{
            this.permissionTree = new PermissionTree({
                treeData:response.data,
                container:this.treeWrapper
            })
        });
    }

    private initButtons() {

    }

    private getData() {
        return this.permissionTree ? this.permissionTree.get() : {};
    }
}