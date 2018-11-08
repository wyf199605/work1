/// <amd-module name="MbList"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IMbListItemPara, MbListItem, MbListItemData} from "./MbListItem";
import d = G.d;
import tools = G.tools;
import {DataManager, IDataManagerAjaxStatus} from "../DataManager/DataManager";
import {CheckBox} from "../form/checkbox/checkBox";

export interface IMbListPara extends IComponentPara {
    data?: MbListItemData[];
    isImg?: boolean; // 是否有图片
    isMulti?: boolean;  // 是否多选
    itemButtons?: string[];
    multiButtons?: string[];
    itemClick?: (index) => void;
    multiClick?: (index) => void;
    statusColor?:string;
    imgLabelColor?:string;
    dataManager?: {
        pageSize?: number;
        render: (start: number, length: number, data: obj[], isRefresh: boolean) => void;
        ajaxFun?: (status: IDataManagerAjaxStatus) => Promise<{ data: obj[]; total: number; }>,
        isPulldownRefresh?: boolean,
        ajaxData?: obj;
    };
}

export class MbList extends Component {
    protected wrapperInit() {
        return <div className="mb-list-wrapper"/>;
    }

    constructor(protected para: IMbListPara) {
        super(para);
        this._isImg = tools.isEmpty(para.isImg) ? true : para.isImg;
        // 批量选择按钮
        para.isMulti && this.createMultiIcon();
        // 创建底部批量按钮
        tools.isNotEmpty(para.multiButtons) && this.createMultiButtons(para.multiButtons);
        this.render(para.data || []);
        tools.isNotEmpty(para.dataManager) && this.initDataManager();
        this.initEvents.on();
    }

    private multiIcon: HTMLElement;

    protected createMultiIcon() {
        this.multiIcon = <div className="multi-icon"><span className="cancel-multi hide">取消</span><i
            className="appcommon app-piliang"/><span>批量</span></div>;
        this.wrapper.appendChild(this.multiIcon);
    }

    // 事件
    private initEvents = (() => {
        // 批量按钮点击
        let multiEvent = () => {
            this.multiple = !this.multiple;
            d.query('.cancel-multi', this.multiIcon).classList.toggle('hide', !this.multiple);
            d.query('i.app-piliang', this.multiIcon).classList.toggle('hide', this.multiple);
            this.checkBoxWrapper.classList.toggle('hide', !this.multiple);
            this.statisticWrapper.classList.toggle('hide', !this.multiple);
            this.wrapper.classList.toggle('select', this.multiple);
        };
        return {
            on: () => {
                d.on(this.multiIcon, 'click', multiEvent);
            },
            off: () => {
                d.off(this.multiIcon, 'click', multiEvent);
            }
        }
    })();

    // 底部按钮
    protected buttonsWrapper: HTMLElement;
    protected checkBoxWrapper: HTMLElement;
    protected statisticWrapper: HTMLElement;
    protected countWrapper: HTMLElement;
    private checkBox: CheckBox;

    setSelectStatus(status: boolean) {
        if (status) {
            let result = this.listItems.filter(item => !item.selected);
            tools.isEmpty(result) && (this.checkBox.checked = true);
        } else {
            this.checkBox && (this.checkBox.checked = false);
        }
        this.calcCount();
    }

    // 创建多选按钮
    protected createMultiButtons(multiButtons: string[]) {
        let btnWrapper = <div className="list-batch-wrapper">
            {this.statisticWrapper = <div className="statistic hide">共选择{this.countWrapper = <span>0</span>}条数据</div>}
            <div className="list-buttons">
                {this.checkBoxWrapper =
                    <div className="select-all hide">{this.checkBox = <CheckBox text="全选" onClick={(isChecked) => {
                        let count = isChecked ? this.listItems.length : 0;
                        this.countWrapper.innerText = count.toString();
                        this._listItems.forEach(item => {
                            item.selected = isChecked;
                        })
                    }
                    }/>}</div>}
                {this.buttonsWrapper = <div className="buttons-wrapper"/>}
            </div>
        </div>;
        this.wrapper.classList.add('button-wrapper');
        this.wrapper.appendChild(btnWrapper);
        let buttonHtml = [];
        multiButtons.forEach((item, index) => {
            buttonHtml.push(`<div class="item-button ${index === 1 ? 'first' : ''}" data-index="${index}">${item}</div>`);
        });
        this.buttonsWrapper.innerHTML = buttonHtml.join('');
    }

    private calcCount() {
        let count = this.listItems.filter(item => item.selected).length;
        this.countWrapper.innerText = count.toString();
    }

    protected initDataManager() {
        let page = this.para.dataManager,
            dataManager = new DataManager({
                page: {
                    size: page.pageSize || 10,
                    container: this.wrapper,
                    isPulldownRefresh: page.isPulldownRefresh || false,
                },
                render: (start, length, isRefresh) => {
                    typeof page.render === 'function' && page.render(start, length, dataManager.data, isRefresh);
                },
                ajax: {
                    fun: page.ajaxFun,
                    ajaxData: page.ajaxData,
                    auto: true
                }
            });
    }

    protected _isImg: boolean;
    get isImg() {
        return this._isImg;
    }

    render(data: MbListItemData[]) {
        d.diff(data, this.listItems, {
            create: (n) => {
                this._listItems.push(this.createListItem({data: n}));
            },
            replace: (n, o) => {
                o.data = n || {};
                o.render(o.data);
            },
            destroy: (o) => {
                o.destroy();
                let index = this._listItems.indexOf(o);
                if (index > -1)
                    delete this._listItems[index]
            }
        });
        this._listItems = this._listItems.filter((item) => item);
        this.refreshIndex();
    }

    delItem(index) {
        let item = this._listItems[index];
        if (item) {
            item.destroy();
            this._listItems.splice(index, 1);
        }
    }

    refreshIndex() {
        this._listItems.forEach((item, index) => {
            item.index = index;
        });
    }

    protected _listItems: MbListItem[] = [];
    get listItems() {
        return this._listItems.slice();
    }

    // 设置是否多选
    protected _multiple: boolean = false;
    set multiple(flag: boolean) {
        if (this._multiple !== flag) {
            this._multiple = flag;
            this._listItems.forEach((item, index) => {
                item.isShowCheckBox = flag;
            });
        }
    }

    get multiple() {
        return this._multiple
    }

    // 实例化MbListItem
    protected createListItem(para: IMbListItemPara) {
        para = Object.assign({}, para, {
            container: this.wrapper,
            list: this,
            isImg: this.isImg,
            isCheckBox: this.multiple,
            btns: this.para.itemButtons,
            buttonClick: (index) => {
                tools.isFunction(this.para.itemClick) && this.para.itemClick(index);
            },
            imgLabelColor:this.para.imgLabelColor,
            statusColor:this.para.statusColor
        });
        return new MbListItem(para);
    }

    destroy() {
        this.para = null;
        this.multiIcon = null;
        this.initEvents.off();
        d.remove(this.buttonsWrapper);
        d.remove(this.checkBoxWrapper);
        d.remove(this.statisticWrapper);
        d.remove(this.countWrapper);
        this.buttonsWrapper = null;
        this.checkBoxWrapper = null;
        this.statisticWrapper = null;
        this.countWrapper = null;
        this.checkBox.destroy();
        this.checkBox = null;
        super.destroy();
    }
}