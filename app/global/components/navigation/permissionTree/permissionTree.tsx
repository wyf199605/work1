/// <amd-module name="PermissionTree"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {ITreeNode, PermissionTreeItem} from "./permissionTreeItem";

export interface IPermissionTree extends IComponentPara {
    treeData?: ITreeNode[];
    textHeight?: number;
}

export class PermissionTree extends Component {
    private treeWrapper: HTMLElement;
    private treeCaptionWrapper: HTMLElement;

    protected wrapperInit(para: IPermissionTree): HTMLElement {
        return <div className="permission-tree-wrapper">
            {this.treeCaptionWrapper = <div className="permission-tree-title"/>}
            {this.treeWrapper = <div className="trees"/>}
        </div>;
    }

    constructor(private para: IPermissionTree) {
        super(para);
        let deepArr: number[] = [],
            data = para.treeData || [];
        data.forEach(tree => {
            deepArr.push(this.getDeep(tree.CHILDREN));
        });
        let maxDeep = Math.max.apply({}, deepArr),
            styleWidth = window.getComputedStyle(this.treeWrapper).width,
            width = parseFloat(styleWidth.slice(0, styleWidth.length - 2)) / maxDeep;
        let levelArr = ['一级', '二级', '三级', '四级', '五级', '六级', '七级', '八级', '九级', '十级'];
        let titleHtml = [];
        for (let i = 0; i < maxDeep; i++) {
            titleHtml.push(`<div class='level-title' style='width:${100/maxDeep + "%"}'>${levelArr[i]}</div>`);
        }
        this.treeCaptionWrapper.innerHTML = titleHtml.join('');
        this.createTrees(para, width);
    }

    private getDeep(children: ITreeNode[]) {
        if (tools.isEmpty(children)) {
            return 1;
        }
        let i = 1;
        lookDeep(children || []);

        function lookDeep(children: ITreeNode[]) {
            i += 1;
            if (tools.isNotEmpty(children[0].CHILDREN)) {
                lookDeep(children[0].CHILDREN);
            }
        }

        return i;
    }

    private treeItems: PermissionTreeItem[] = [];

    createTrees(data: IPermissionTree, width: number) {
        if (tools.isNotEmptyArray(data.treeData)) {
            data.treeData.forEach(tree => {
                this.treeItems.push(new PermissionTreeItem(Object.assign({}, tree, {
                    container: this.treeWrapper,
                    parentNode: null,
                    textHeight: data.textHeight,
                    textWidth: width
                })))
            })
        }
    }

    get() {
        let treeItems = this.treeItems || [],
            changedNodes = [];
        treeItems.forEach(tree => {
            changedNodes = changedNodes.concat(tree.get());
        });
        return changedNodes;
    }

    destroy() {
        this.treeItems && this.treeItems.forEach(tree => {
            tree.destroy();
        });
        this.treeItems = null;
        super.destroy();
    }
}