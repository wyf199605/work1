/// <amd-module name="PermissionTreePage"/>

import BasicPage from "../basicPage";
import {ITablePagePara} from "../table/newTablePage";
import {PermissionTree} from "../../../global/components/navigation/permissionTree/permissionTree";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";

export class PermissionTreePage extends BasicPage {
    private permissionTree: PermissionTree;
    private buttonsWrapper: HTMLElement;
    private treeWrapper: HTMLElement;

    constructor(private para: ITablePagePara) {
        super(para);
        this.buttonsWrapper = <div className="permission-page-buttons"/>;
        this.treeWrapper = <div className="permission-page-tree-wrapper"/>;
        para.dom.appendChild(this.buttonsWrapper);
        para.dom.appendChild(this.treeWrapper);
        this.initButtons();
        this.initPermissionTree();
    }

    private initPermissionTree() {
        let dataAddr = this.para.ui.body.elements[0].dataAddr;
        tools.isNotEmpty(dataAddr) && BwRule.Ajax.fetch(BW.CONF.siteUrl + BwRule.reqAddr(dataAddr)).then(({response}) => {
            this.permissionTree = new PermissionTree({
                treeData: response.data,
                container: this.treeWrapper
            })
        });
    }

    private initButtons() {
        let subButtons = this.para.ui.body.elements[0].subButtons || [];
        if (tools.isNotEmptyArray(subButtons)){
            let inputBox = new InputBox({
                container:this.buttonsWrapper
            });
            subButtons.forEach((button) => {
                let btn = new Button({
                    content:button.caption || button.title,
                    icon:button.icon,
                    onClick:()=>{
                        ButtonAction.get().clickHandle(button,this.getData());
                    }
                });
                inputBox.addItem(btn);
            })
        }
    }

    private getData() {
        return this.permissionTree ? this.permissionTree.get() : {};
    }
}