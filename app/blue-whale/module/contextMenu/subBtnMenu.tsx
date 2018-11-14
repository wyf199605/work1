/// <amd-module name="SubBtnMenu"/>

import Component = G.Component;
import {IMenuPara, Menu} from "../../../global/components/navigation/menu/Menu";

export interface ISubBtnMenuPara{
    container?: HTMLElement;
    buttons: R_Button[];
    onClick?: (btn: R_Button) => void;
}

export class SubBtnMenu {
    private contextMenu: Menu;

    constructor(para: ISubBtnMenuPara){
        this.onClick = para.onClick;
        this.contextMenu = new Menu({
            container: para.container || document.body,
            expand: true,
            isOutline: true,
            isHoverExpand: true,
            children: this.handlerMenuData(para.buttons)
        });
        this.contextMenu.wrapper.classList.add('ftable-context-menu');

        this.contextMenu.onOpen = (node) => {
            this.onClick && this.onClick(node.content.button);
        }
    }

    protected _onClick: (btn: R_Button) => void;
    set onClick(handler: (btn: R_Button) => void){
        this._onClick = handler;
    }
    get onClick(){
        return this._onClick;
    }

    private _show: boolean;
    set show(isShow: boolean) {
        this._show = isShow;
        if (isShow) {
            this.contextMenu.wrapper.style.display = 'block';
        } else {
            this.contextMenu.wrapper.style.display = 'none';
        }
    }
    get show(){
        return this._show;
    }

    setPosition(x: number, y: number){
        this.contextMenu.setPosition(x, y);
    }

    // 处理选项转换为menuData
    private handlerMenuData(btns: R_Button[]): IMenuPara[] {
        let menuData: IMenuPara[] = [];
        btns.forEach((btn) => {
            let menuObj = {};
            menuObj['text'] = btn.caption;
            menuObj['icon'] = btn.icon;

            menuObj['content'] = {
                button: btn
            };

            menuData.push(menuObj);
        });
        return menuData;
    }

    destory() {
        this.contextMenu.destroy();
        this.contextMenu = null;
        this._onClick = null;
    }
}