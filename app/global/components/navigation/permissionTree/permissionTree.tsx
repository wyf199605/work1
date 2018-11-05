/// <amd-module name="PermissionTree"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {ITreeNode, PermissionTreeItem} from "./permissionTreeItem";

interface IPermissionTree extends IComponentPara {
    caption?: string;
    treeData?: ITreeNode[];
    textHeight?:number;
    textWidth?:number;
}

export class PermissionTree extends Component {
    private treeWrapper: HTMLElement;

    protected wrapperInit(para: IPermissionTree): HTMLElement {
        return <div className="permission-tree-wrapper">
            <div className="permission-tree-title">{para.caption}</div>
            {this.treeWrapper = <div className="trees"/>}
        </div>;
    }

    constructor(para: IPermissionTree) {
        super(para);
        this.createTrees(para);
    }

    private treeItems: PermissionTreeItem[] = [];

    createTrees(data: IPermissionTree) {
        if (tools.isNotEmptyArray(data.treeData)) {
            data.treeData.forEach(tree => {
                this.treeItems.push(new PermissionTreeItem(Object.assign({}, tree, {
                    container: this.treeWrapper,
                    parentNode: null,
                    textHeight:data.textHeight,
                    textWidth:data.textWidth
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