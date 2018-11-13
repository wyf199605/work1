/// <amd-module name="MbList"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IMbListItemPara, MbListItem, MbListItemData} from "./MbListItem";
import d = G.d;
import tools = G.tools;
import {DataManager, IDataManagerAjaxStatus} from "../DataManager/DataManager";
import {CheckBox} from "../form/checkbox/checkBox";
import {ActionSheet} from "../ui/actionSheet/actionSheet";

export interface IMbListPara extends IComponentPara {
    data?: MbListItemData[];
    isImg?: boolean; // 是否有图片
    isMulti?: boolean;  // 是否多选
    itemButtons?: string[];
    multiButtons?: string[];
    buttonsClick?: (btnIndex: number, itemIndex: number) => void;
    multiClick?: (btnIndex:number,itemsIndexes:number[]) => void;
    itemClick?: (index: number) => void;
    // statusColor?: string;
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
        this.createItemActionSheet(this.para.itemButtons);
        this.initEvents.on();
    }

    itemActionSheet: ActionSheet = null;
    private _currentSelectItemIndex: number;
    set currentSelectItemIndex(index: number) {
        this._currentSelectItemIndex = index;
    }

    get currentSelectItemIndex() {
        return this._currentSelectItemIndex;
    }

    private createItemActionSheet(btns: string[]) {
        if (tools.isNotEmptyArray(btns) && btns.length > 2) {
            let moreButtons = btns.slice(2),
                buttons = [];
            moreButtons.forEach((btn, index) => {
                buttons.push({
                    content: btn,
                    onClick: () => {
                        tools.isFunction(this.para.buttonsClick) && this.para.buttonsClick(index + 2, this.currentSelectItemIndex);
                    }
                })
            });
            this.itemActionSheet = new ActionSheet({
                buttons: buttons
            })
        }
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
            this.multiButtonsWrapper.classList.toggle('hide', !this.multiple);
            d.query('.cancel-multi', this.multiIcon).classList.toggle('hide', !this.multiple);
            d.query('i.app-piliang', this.multiIcon).classList.toggle('hide', this.multiple);
            this.wrapper.classList.toggle('button-wrapper', this.multiple);
            !this.multiple && (this.checkBox.checked = false);
        };
        let moreBtnClick = (e) => {
            this.multiActionSheet.isShow = true;
        };
        return {
            on: () => {
                d.on(this.multiButtonsWrapper,'click','.list-buttons .more-btn',moreBtnClick);
                d.on(this.multiIcon, 'click', multiEvent);
            },
            off: () => {
                d.off(this.multiButtonsWrapper,'click','.list-buttons .more-btn',moreBtnClick);
                d.off(this.multiIcon, 'click', multiEvent);
            }
        }
    })();

    // 底部按钮
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

    private multiButtonsWrapper: HTMLElement;
    private multiActionSheet: ActionSheet = null;

    // 创建多选按钮
    protected createMultiButtons(multiButtons: string[]) {
        let buttonsWrapper: HTMLElement;
        this.multiButtonsWrapper = <div className="list-batch-wrapper hide">
            {this.statisticWrapper = <div className="statistic">
                <div className="select-all">{this.checkBox = <CheckBox text="全选" onClick={(isChecked) => {
                    let count = isChecked ? this.listItems.length : 0;
                    this.countWrapper.innerText = count.toString();
                    this._listItems.forEach(item => {
                        item.selected = isChecked;
                    })
                }
                }/>}</div>
                <span className="count-wrapper">共选择{this.countWrapper = <span>0</span>}条数据</span></div>}
            {buttonsWrapper = <div className="list-buttons"></div>}
        </div>;
        this.wrapper.appendChild(this.multiButtonsWrapper);
        let buttonHtml = [];
        if (tools.isNotEmptyArray(multiButtons)) {
            if (multiButtons.length <= 2) {
                multiButtons.forEach((item, index) => {
                    buttonHtml.push(`<div class="item-button ${index === 1 ? 'first' : ''}" data-index="${index}">${item}</div>`);
                });
            } else {
                let moreButtons = multiButtons.slice(2),
                    showButtons = multiButtons.slice(0, 2);
                buttonHtml.push(`<div class="more-btn">更多</div>`);
                showButtons.forEach((item, index) => {
                    buttonHtml.push(`<div class="item-button ${index === 1 ? 'first' : ''}" data-index="${index}">${item}</div>`);
                });
                let buttons = [];
                moreButtons.forEach((btn, index) => {
                    buttons.push({
                        content: btn,
                        icon: '',
                        onClick: () => {
                            tools.isFunction(this.para.multiClick) && this.para.multiClick(index + 2,this.getSelectIndexes());
                        }
                    })
                });
                this.multiActionSheet = new ActionSheet({
                    buttons: buttons
                })
            }
            buttonsWrapper.innerHTML = buttonHtml.join('');
        } else {
            buttonsWrapper.classList.add('hide');
        }
    }

    private getSelectIndexes(){
        let items = this.listItems || [],
            indexes = [];
        items.forEach(item => {
            item.selected && indexes.push(item.index);
        });
        return indexes;
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
                    container: this.wrapper.parentElement,
                    isPulldownRefresh: page.isPulldownRefresh || false
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
                item.isShowBtns = flag;
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
            buttonClick: (btnIndex, itemIndex) => {
                tools.isFunction(this.para.buttonsClick) && this.para.buttonsClick(btnIndex, itemIndex);
            },
            itemClick:(index) => {
                tools.isFunction(this.para.itemClick) && this.para.itemClick(index);
            }
            // statusColor: this.para.statusColor
        });
        return new MbListItem(para);
    }

    destroy() {
        this.para = null;
        this.multiIcon = null;
        this.initEvents.off();
        d.remove(this.multiButtonsWrapper);
        d.remove(this.statisticWrapper);
        d.remove(this.countWrapper);
        this.multiButtonsWrapper = null;
        this.statisticWrapper = null;
        this.countWrapper = null;
        this.multiActionSheet && this.multiActionSheet.destroy();
        this.checkBox.destroy();
        this.checkBox = null;
        super.destroy();
    }
}