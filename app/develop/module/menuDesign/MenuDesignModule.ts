/// <amd-module name="MenuDesignModule"/>

import {DropDownModule} from "../dropDown/DropDownModule";
import {TextInputModule} from "../textInput/TextInputModule";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

let d = G.d;
let tools = G.tools;

interface IMenuDesignModulePara extends IComponentPara {
    menuDesignData?: any[];
    isShow?: boolean;
}

export class MenuDesignModule extends Component {
    protected wrapperInit(): HTMLElement {
        return d.create(`
        <div class="designContentItems">
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem"></div>
                <div class="designContentItem" style="padding-left: 60px"></div>
                <div class="clear"></div>
        </div>
        `);
    }

    private init(para: IMenuDesignModulePara) {
        let data = [
            {
                title: "菜单编码",
                id: 'nodeId'
            },
            {
                title: "页面编码",
                id: 'itemId'
            },
            {
                title: "页面标题",
                id: 'caption'
            },
            {
                title: "菜单名称",
                id: 'captionExplain'
            },
            {
                title: "父页面编码",
                id: 'parentId'
            },
            {
                title: "图标",
                id: 'iconName'
            },
            {
                title: '变量',
                id: 'varId',
            }
        ];
        this.menuDesignData = tools.isNotEmpty(para.menuDesignData) ? para.menuDesignData : data;
        this.isShow = para.isShow || false;
    }

    private _isShow: boolean;
    set isShow(isShow) {
        this._isShow = isShow;
        if (this._isShow === true) {
            this.wrapper.classList.remove('menuDesignHide');
        } else {
            this.wrapper.classList.add('menuDesignHide');
        }
    }

    get isShow() {
        return this._isShow;
    }

    //保存所有的标签输入项
    private _allItems: obj;
    set allItems(obj) {
        if (tools.isEmpty(obj)) {
            obj = {};
        }
        this._allItems = obj;
    }

    get allItems() {
        if (!this._allItems) {
            this._allItems = {
                nodeId: null,
                caption: null,
                captionExplain: null,
                itemId: null,
                parentId: null,
                iconName: null,
                varId: null,
                isLeaf: null
            }
        }
        return this._allItems;
    }

    private _menuDesignData: any[];
    set menuDesignData(arr) {
        if (tools.isEmpty(arr)) {
            arr = [];
        }
        this._menuDesignData = arr;
        let contentContainers = d.queryAll('.designContentItem', this.wrapper);
        let length = contentContainers.length;
        for (let i = 0; i < length - 1; i++) {
            let container = contentContainers[i];

            let module = new TextInputModule({
                container: container,
                title: this._menuDesignData[i].title,
                value: this._menuDesignData[i].value,
                disabled: true
            });
            this.allItems[this._menuDesignData[i].id] = module;
        }
        let isLeaf = new CheckBox({
            text: '叶子节点',
            container: contentContainers[length - 1],
            disabled: true
        });
        this.allItems['isLeaf'] = isLeaf;
    }

    get menuDesignData() {
        return this._menuDesignData;
    }

    constructor(para: IMenuDesignModulePara) {
        super(para);
        if (tools.isEmpty(para))
            para = {};
        this.init(para);
    }
}