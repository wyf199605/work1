/// <amd-module name="PermissionTreeItem"/>

import IComponentPara = G.IComponentPara;
import Component = G.Component;
import tools = G.tools;
import {CheckBox} from "../../form/checkbox/checkBox";

export interface ITreeNode extends IComponentPara {
    ELEMENTID?: string;
    TEXT?: string;
    PARENTID?: string;
    CHECKED?: string;
    CHILDREN?: ITreeNode[];
}

interface IPermissionTreeItem extends ITreeNode {
    parentNode?: PermissionTreeItem;
    textHeight?: number;
    textWidth?: number;
}

export class PermissionTreeItem extends Component {
    private textWrapper: HTMLElement;
    private childrenWrapper: HTMLElement;

    protected wrapperInit(para: IPermissionTreeItem): HTMLElement {
        let className = para.PARENTID === 'root' ? 'root-item' : 'normal-item';
        return <div className={"permissionTreeItem " + className}>
            {this.textWrapper = <div className="permissionTreeItem-text-wrapper"/>}
            {this.childrenWrapper = <div className="permissionTreeItem-children-wrapper hide"/>}
        </div>;
    }

    constructor(private para: IPermissionTreeItem) {
        super(para);
        this.textHeight = tools.isNotEmpty(para.textHeight) ? para.textHeight : 40;
        this.parentNode = para.parentNode || null;
        this.textWidth = para.textWidth;
        if (para.PARENTID === 'root' && (tools.isEmpty(para.textWidth) || para.textWidth === 0)) {
            let styleWidth = window.getComputedStyle(this.container).width,
                width = parseFloat(styleWidth.slice(0, styleWidth.length - 2)) / this.getDeep();
            if (width > 300) {
                width = 300;
            }
            this.textWidth = width;
        }
        this.createText(para);
        this.createChildren(para);
        this.textWrapper.style.width = this.textWidth + 'px';
        if (tools.isNotEmptyArray(para.CHILDREN)) {
            this.wrapper.style.height = this.setHeight(para.CHILDREN) * this.textHeight + 'px';
        } else {
            this.textWrapper.style.height = this.textHeight + 'px';
            this.wrapper.style.borderRight = '1px solid #e2e2e2';
        }
    }

    private _textWidth: number;
    set textWidth(tw: number) {
        this._textWidth = tw;
    }

    get textWidth() {
        if (this._textWidth < 120) {
            this._textWidth = 120;
        }
        return this._textWidth;
    }

    // 文本高度
    private _textHeight: number;
    set textHeight(th: number) {
        this._textHeight = th;
    }

    get textHeight() {
        if (this._textHeight <= 0) {
            this._textHeight = 40;
        }
        return this._textHeight;
    }

    private _parentNode: PermissionTreeItem;
    set parentNode(pn: PermissionTreeItem) {
        this._parentNode = pn;
    }

    get parentNode() {
        return this._parentNode;
    }

    private checkBox: CheckBox = null;

    createText(para: IPermissionTreeItem) {
        this.checkBox = new CheckBox({
            text: para.TEXT || '',
            name: para.TEXT || '',
            value: para.ELEMENTID || '',
            container: this.textWrapper,
            status: parseInt(para.CHECKED),
            onClick: (isChecked) => {
                if (isChecked) {
                    let parentNode = this.parentNode;
                    while (parentNode) {
                        this.parentNode.checkBox.checked = true;
                        parentNode = parentNode.parentNode;
                    }
                } else {
                    this.setCheck(this.children);
                }
            }
        })
    }

    private setCheck(children: PermissionTreeItem[]) {
        children = children || [];
        children.forEach(child => {
            child.checkBox.checked = false;
            if (tools.isNotEmptyArray(child.children)) {
                this.setCheck(child.children);
            }
        })
    }

    isChanged() {
        return this.checkBox.status !== parseInt(this.para.CHECKED);
    }

    private children: PermissionTreeItem[] = [];

    createChildren(para: IPermissionTreeItem) {
        let children = para.CHILDREN || [];
        if (tools.isNotEmptyArray(children)) {
            this.childrenWrapper.classList.remove('hide');
            children.forEach(child => {
                this.children.push(new PermissionTreeItem(Object.assign({}, child, {
                    container: this.childrenWrapper,
                    parentNode: this,
                    textHeight: this.textHeight,
                    textWidth: this.textWidth
                })));
            })
        }
    }

    setHeight(items: IPermissionTreeItem[]) {
        let number = 0;
        items.forEach(item => {
            if (item.CHILDREN) {
                number += this.setHeight(item.CHILDREN)
            }
        });
        return number || items.length;
    }

    private getNode() {
        return {
            elementId: this.para.ELEMENTID,
            checked: this.checkBox.status
        }
    }

    private getDeep() {
        if (tools.isEmpty(this.para.CHILDREN)) {
            return 1;
        }
        let i = 1;
        lookDeep(this.para.CHILDREN || []);

        function lookDeep(children: ITreeNode[]) {
            i += 1;
            if (tools.isNotEmpty(children[0].CHILDREN)) {
                lookDeep(children[0].CHILDREN);
            }
        }

        return i;
    }

    get() {
        let changedNodes = [];
        if (this.isChanged()) {
            changedNodes.push(this.getNode());
        }
        getChangedNode(this.children || []);

        function getChangedNode(children: PermissionTreeItem[]) {
            children.forEach(child => {
                if (child.isChanged()) {
                    changedNodes.push(child.getNode());
                }
                if (tools.isNotEmptyArray(child.children)) {
                    getChangedNode(child.children);
                }
            })
        }

        return changedNodes;
    }

    destroy() {
        d.remove(this.textWrapper);
        this.textWrapper = null;
        d.remove(this.childrenWrapper);
        this.childrenWrapper = null;
        this.checkBox.destroy();
        this.checkBox = null;
        this.parentNode = null;
        super.destroy();
    }
}