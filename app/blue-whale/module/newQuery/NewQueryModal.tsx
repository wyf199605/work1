/// <amd-module name="NewQueryModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {IQueryItem, IResult, NewQueryItem} from "./NewQueryItem";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {QueryModule, QueryModulePara} from "../query/queryModule";

interface INewQueryPara {
    queryItems?: IQueryItem[];
    search?: (data: IResult[]) => void;
    advanceSearch?:QueryModulePara;
}

export class NewQueryModal {

    private queryWrapper: HTMLElement = <div className="new-query-wrapper"/>;
    private extraWrapper: HTMLElement = <div className="new-query-wxtra-wrapper"/>;
    private modal: Modal;

    constructor(private para: INewQueryPara) {
        this.initModal();
        this.initItems(para.queryItems);
        this.initExtraContent();
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 隐藏和显示查询Modal
     */
    private _isShow: boolean;
    set isShow(isShow: boolean) {
        this._isShow = isShow;
        this.modal.isShow = isShow
    }

    get isShow() {
        return this._isShow;
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 初始化查询Modal
     */
    private initModal() {
        this.modal = new Modal({
            header: '搜索',
            isMb: tools.isMb,
            className: 'new-query-modal',
            isModal: tools.isMb,
            isOnceDestroy: false,
            body: <div className="new-query-modal-body">{this.queryWrapper}{this.extraWrapper}</div>,
            footer: {
                rightPanel: [
                    {
                        content: '重置',
                        className: 'new-query-btn reset',
                        type: 'primary',
                        onClick: () => {
                            this.reset();
                        }
                    },
                    {
                        content: '确定',
                        className: 'new-query-btn confirm',
                        type: 'primary',
                        onClick: () => {
                            // 校验
                            if (this.validate()) {
                                this.isShow = false;
                                tools.isFunction(this.para.search) && this.para.search(this.json);
                            }
                        }
                    }
                ]
            }
        });
    }

    private _items: NewQueryItem[] = [];
    get items() {
        return this._items.slice();
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 初始化查询项
     */
    private initItems(items: IQueryItem[]) {
        if (tools.isEmpty(items)) {
            Modal.alert('暂无查询条件!');
            return;
        }
        items.forEach(item => {
            this._items.push(new NewQueryItem(Object.assign({}, item, {
                container: this.queryWrapper
            })));
        })
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 额外内容(高级搜索)
     */
    static QUERY_MODULE_NAME = 'QueryModuleMb';
    private initExtraContent() {
        new Button({
            content: '高级搜索',
            className: 'advance-search',
            onClick: () => {
                let advanceSearch = this.para.advanceSearch;
                if (tools.isNotEmpty(advanceSearch)){
                    require([NewQueryModal.QUERY_MODULE_NAME],(Query) => {
                        let query:QueryModule = new Query(advanceSearch);
                        query.show();
                    })
                }
            },
            container:this.extraWrapper
        })
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 重置
     */
    private reset() {
        this.items.forEach(item => {
            item.set([]);
        })
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 获取数据
     */
    get json(): IResult[] {
        let data: IResult[] = [];
        this.items.forEach(item => {
            tools.isNotEmpty(item.get().intervalValue) && data.push(item.get());
        });
        return data;
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 校验
     */
    private validate(): boolean {
        let data = this.json;
        for (let i = 0; i < data.length; i++) {
            let itemData = data[i].intervalValue,
                interval = this.para.queryItems.filter(item => item.filedName === data[i].filedName)[0].interval;
            switch (interval) {
                case 0: {
                    if (tools.isNotEmpty(itemData)) {
                        if (tools.isEmpty(itemData[0]) || tools.isEmpty(itemData[1])) {
                            Modal.alert('请输入完整的数字区间!');
                            return false;
                        } else if (parseFloat(itemData[0]) > parseFloat(itemData[1])) {
                            Modal.alert('请输入合法的数字区间!');
                            return false;
                        }
                    }
                }
                    break;
                case 1:
                case 2: {
                    if (tools.isNotEmpty(itemData)) {
                        if (tools.isEmpty(itemData[0]) || tools.isEmpty(itemData[1])) {
                            Modal.alert('请输入完整的时间区间!');
                            return false;
                        } else if (new Date(itemData[0]).getTime() > new Date(itemData[1]).getTime()) {
                            Modal.alert('请输入合法的时间区间!');
                            return false;
                        }
                    }
                }
                    break;
            }
        }
        return true;
    }

    destroy() {
        this.modal.destroy();
        this.para = null;
        this.queryWrapper = null;
    }
}