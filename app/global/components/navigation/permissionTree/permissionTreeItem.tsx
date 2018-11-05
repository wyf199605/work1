/// <amd-module name="PermissionTreeItem"/>

import IComponentPara = G.IComponentPara;
import Component = G.Component;
import tools = G.tools;
import {CheckBox} from "../../form/checkbox/checkBox";

interface IPermissionTreeItem extends IComponentPara {
    ELEMENTID?: string;
    TEXT?: string;
    PARENTID?: string;
    CHECKED?: string;
    CHILDREN?: IPermissionTreeItem[];
}

export class PermissionTreeItem extends Component {
    private textWrapper:HTMLElement;
    private childrenWrapper:HTMLElement;
    protected wrapperInit(para: IPermissionTreeItem): HTMLElement {
        let className = para.PARENTID === 'root' ? 'root-item' : 'normal-item';
        return <div className={"permissionTreeItem " + className}>
            {this.textWrapper = <div className="permissionTreeItem-text-wrapper"/>}
            {this.childrenWrapper = <div className="permissionTreeItem-children-wrapper hide"/>}
        </div>;
    }

    constructor(para: IPermissionTreeItem) {
        super(para);
        this.createText(para);
        this.createChildren(para);
        if (tools.isNotEmptyArray(para.CHILDREN)){
            this.wrapper.style.height = this.setRootHeight(para.CHILDREN)*40 + 'px';
        }
    }
    private checkBox:CheckBox = null;
    createText(para:IPermissionTreeItem){
        this.checkBox = new CheckBox({
            text:para.TEXT || '',
            name:para.TEXT || '',
            value:para.ELEMENTID || '',
            container:this.textWrapper,
            status:parseInt(para.CHECKED),
            onClick:(isChecked)=>{

            }
        })
    }

    private children:PermissionTreeItem[] = [];
    createChildren(para:IPermissionTreeItem){
        let children = para.CHILDREN || [];
        if (tools.isNotEmptyArray(children)){
            this.childrenWrapper.classList.remove('hide');
            children.forEach(child => {
                this.children.push(new PermissionTreeItem(Object.assign({},child,{
                    container:this.childrenWrapper
                })));
            })
        }
    }

    setRootHeight(items:IPermissionTreeItem[]){
        let number = 0;
        items.forEach(item => {
            if(item.CHILDREN){
                number += this.setRootHeight(item.CHILDREN)
            }
        });
        return number || items.length;
    }
}