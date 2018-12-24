/// <amd-module name="NewQueryModalMb"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {IQueryItem, IResult, NewQueryItem} from "./NewQueryItem";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";
import {QueryModule, QueryModulePara} from "../query/queryModule";

interface INewQueryPara {
    queryItems?: IQueryItem[];
    search?: (data: obj) => void;
    advanceSearch?: QueryModulePara;
    cols?: R_Field[];
    url?: string;
    refresher?: (ajaxData?: obj, noQuery?: boolean) => Promise<any>;
}

export class NewQueryModalMb {

    private queryWrapper: HTMLElement = <div className="new-query-wrapper"/>;
    private modal: Modal;
    query: QueryModule;

    constructor(private para: INewQueryPara) {
        if (tools.isNotEmpty(para.queryItems)) {
            this.initModal();
            this.initItems(para.queryItems);
        } else {
            this.initQuery();
        }
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 隐藏和显示查询Modal
     */
    private _isShow: boolean;
    set isShow(isShow: boolean) {
        this._isShow = isShow;
        if (tools.isNotEmpty(this.modal)) {
            this.modal.isShow = isShow;
        } else {
            isShow ? this.query.show() : this.query.hide();
        }
    }

    get isShow() {
        return this._isShow;
    }

    /**
     * @author WUML
     * @date 2018/12/5
     * @Description: 初始化查询Modal
     */
    static QUERY_MODULE_NAME = 'QueryModuleMb';

    private initModal() {
        let advanceSearch = this.para.advanceSearch, isShow: boolean = false;
        if (tools.isNotEmpty(advanceSearch) && tools.isNotEmpty(advanceSearch.qm)) {
            if (tools.isNotEmpty(advanceSearch.qm.autTag) && advanceSearch.qm.autTag !== 0) {
                isShow = true;
            }
        }
        this.modal = new Modal({
            header: {
                title: '搜索',
                rightPanel: new Button({
                    content: '高级搜索',
                    className: 'advance-search',
                    onClick: () => {
                        let advanceSearch = this.para.advanceSearch;
                        if (tools.isNotEmpty(advanceSearch)) {
                            this.isShow = false;
                            require([NewQueryModalMb.QUERY_MODULE_NAME], (Query) => {
                                let query: QueryModule = new Query({
                                    qm: advanceSearch,
                                    container: document.body,
                                    refresher: this.para.refresher,
                                    cols: this.para.cols,
                                    url: this.para.url
                                });
                                query.show();
                            })
                        } else {
                            Modal.alert('暂不支持高级搜索!');
                        }
                    },
                }).wrapper
            },
            isMb: tools.isMb,
            className: 'new-query-modal',
            isModal: tools.isMb,
            isOnceDestroy: false,
            body: this.queryWrapper,
            isShow: isShow,
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
                                let data = tools.isNotEmpty(this.json) ? JSON.stringify(this.json) : '';
                                tools.isFunction(this.para.search) && this.para.search({
                                    mqueryparams: data
                                });
                            }
                        }
                    }
                ]
            },
            isQuery:true
        });
    }

    private initQuery() {
        let advanceSearch = this.para.advanceSearch;
        if (tools.isNotEmpty(advanceSearch)) {
            require([NewQueryModalMb.QUERY_MODULE_NAME], (Query) => {
                this.query = new Query({
                    qm: advanceSearch,
                    container: document.body,
                    refresher: this.para.refresher,
                    cols: this.para.cols,
                    url: this.para.url
                });
                this.query.show();
            })
        }
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
        this._items = null;
    }
}