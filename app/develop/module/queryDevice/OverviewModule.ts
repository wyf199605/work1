/// <amd-module name="OverviewModule"/>

import {DropDownModule} from "../dropDown/DropDownModule";
import {TextInputModule} from "../textInput/TextInputModule";

import d = G.d;
import tools = G.tools;
import {DVAjax} from "../util/DVAjax";
import {QueryDevicePage} from "../../page/design/QueryDevicePage";
import {MenuDevelopPage} from "../../page/design/MenuDevelopPage";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

interface IOverviewModulePara extends IComponentPara {
    qdData?: obj;
    isQuery?:boolean;
}

export class OverviewModule extends Component {
    protected wrapperInit(): HTMLElement {
        return d.create(`
        <div class="overviewItems hide">
                <div class="overviewItem"></div>
                <div class="overviewItem"></div>
                <div class="overviewItem"></div>
                <div class="clear"></div>
                <div class="overviewItem"></div>
                <div class="overviewItem"></div>
                <div class="overviewItem"></div>
                <div class="clear"></div>
        </div>
        `);
    }
    private init(para: IOverviewModulePara) {
        this.initAllItems();
        let overviewData = {
            itemId: '',
            captionSql: '',
            dataSource: '',
            baseTable: '',
            keyField: '',
            captionField: ''
        };
        DVAjax.dataSourceQueryAjax((response) => {
            this.allItems['dataSource'].dpData = response;
            if (para.isQuery){
                if (tools.isNotEmpty(QueryDevicePage.itemId)) {
                    DVAjax.itemQueryAjax((res) => {
                        for (let key in res.data) {
                            if (overviewData.hasOwnProperty(key)) {
                                overviewData[key] = res.data[key];
                            }
                        }
                        this.qdData = overviewData;
                    }, QueryDevicePage.itemId);
                } else {
                    this.qdData = overviewData;
                }
            }else{
                if (tools.isNotEmpty(MenuDevelopPage.itemId)) {
                    DVAjax.itemQueryAjax((res) => {
                        for (let key in res.data) {
                            if (overviewData.hasOwnProperty(key)) {
                                overviewData[key] = res.data[key];
                            }
                        }
                        this.qdData = overviewData;
                    }, MenuDevelopPage.itemId);
                } else {
                    this.qdData = overviewData;
                }
            }
        });
        // 根据基表获取主键字段
        d.on(this.allItems['baseTable'].wrapper, 'change', 'input', (e) => {
            let tableName = (<HTMLFormElement>e.target).value + '?ds=' + this.allItems['dataSource'].get();
            if (tools.isNotEmpty(tableName)) {
                DVAjax.baseTableQueryAjax(tableName, (res) => {
                    if (res) {
                        this.allItems['keyField'].set(res.data);
                    }
                });
            }
        });
    }
    private initAllItems() {
        let contentContainers = d.queryAll('.overviewItem', this.wrapper),
            index = 0;
        let data = {
            itemId: {
                title: "页面编码",
                palceHolder:
                    "自动生成",
                isDropDown:
                    false,
                id:
                    'itemId',
                checkboxTitle:
                    '',
                isShowCheckBox:
                    false
            }
            ,
            captionSql: {
                title: "标题",
                isDropDown:
                    false,
                checkboxTitle:
                    'sql',
                id:
                    'captionSql',
                isShowCheckBox:
                    true
            }
            ,
            dataSource: {
                title: "数据源",
                isDropDown:
                    true,
                id:
                    'dataSource'
            }
            ,
            baseTable: {
                title: "基表",
                isDropDown:
                    false,
                id:
                    'baseTable',
                checkboxTitle:
                    '',
                isShowCheckBox:
                    false
            }
            ,
            keyField: {
                title: "主键字段",
                palceHolder:
                    "根据基表填充建议值",
                isDropDown:
                    false,
                id:
                    'keyField',
                checkboxTitle:
                    '',
                isShowCheckBox:
                    false
            }
            ,
            captionField: {
                title: "标题字段",
                palceHolder:
                    "",
                isDropDown:
                    false,
                id:
                    'captionField',
                checkboxTitle:
                    '',
                isShowCheckBox:
                    false
            }
        };

        for (let key in data) {
            let container = contentContainers[index];
            index++;
            let module = null;
            if (data[key].isDropDown == true) {
                module = new DropDownModule({
                    container: container,
                    title: data[key].title,
                    disabled: false
                });
            } else {
                module = new TextInputModule({
                    container: container,
                    title: data[key].title,
                    placeHolder: data[key].palceHolder,
                    isShowCheckBox: data[key].isShowCheckBox,
                    checkboxText: data[key].checkboxTitle,
                });
                if (index > 4) {
                    // module.disabled = true;
                }
            }
            this.allItems[data[key].id] = module;
        }
        // QueryDevicePage.itemId && (this.allItems['itemId'].disabled = true);
    }

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
                itemId: null,
                captionSql: null,
                dataSource: null,
                baseTable: null,
                keyField: null,
                captionField: null
            }
        }
        return this._allItems;
    }

    private _qdData: obj;
    set qdData(obj) {
        if (tools.isEmpty(obj)) {
            obj = {};
        }
        this._qdData = obj;
        for (let key in this.allItems) {
            if (this._qdData.hasOwnProperty(key)) {
                this.allItems[key].set(this._qdData[key]);
            }
        }
    }

    get qdData() {
        return this._qdData;
    }

    private _isShow: Boolean;
    set isShow(isShow) {
        this._isShow = isShow;
        if (this._isShow) {
            let itemId = QueryDevicePage.itemId,
                inputItemId = this.allItems['itemId'].get();
            tools.isNotEmpty(itemId) && this.allItems['itemId'].set(itemId);
            tools.isNotEmpty(itemId) || tools.isNotEmpty(inputItemId) && (this.allItems['itemId'].disabled = true);
            this.wrapper.classList.add('show');
            this.wrapper.classList.remove('hide');
        } else {
            this.wrapper.classList.remove('show');
            this.wrapper.classList.add('hide');
        }
    }

    constructor(para: IOverviewModulePara) {
        super(para);
        if (tools.isEmpty(para)) {
            para = {};
        }
        this.init(para);
    }

    get() {
        let itemData = {
            itemId: '',
            captionSql: '',
            dataSource: '',
            baseTable: '',
            keyField: '',
            captionField: ''
        };
        for (let key in itemData) {
            if (this.allItems.hasOwnProperty(key)) {
                let result = this.allItems[key].get();
                if (key === 'dataSource') {
                    itemData[key] = result === '请选择' ? '' : result;
                } else {
                    itemData[key] = result;
                }
            }
        }
        return itemData;
    }
}