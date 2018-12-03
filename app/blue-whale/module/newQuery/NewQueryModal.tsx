/// <amd-module name="NewQueryModal"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {IQueryItem, NewQueryItem} from "./NewQueryItem";
import tools = G.tools;

interface INewQueryPara {
    queryItems?: IQueryItem[];
}

export class NewQueryModal {

    private queryWrapper: HTMLElement = <div className="new-query-wrapper"/>;
    private modal: Modal;

    constructor(para: INewQueryPara) {
        this.initModal();
        this.initItems(para.queryItems);
    }

    private initModal() {
        this.modal = new Modal({
            header: '搜索',
            isMb: tools.isMb,
            className: 'new-query-modal',
            isModal: tools.isMb,
            isOnceDestroy: true,
            body: this.queryWrapper,
            footer: {
                rightPanel: [
                    {
                        content: '重置',
                        className: 'modal-btn eidt-confirm',
                        type: 'primary',
                        onClick: () => {

                        }
                    },
                    {
                        content: '确定',
                        className: 'modal-btn eidt-confirm',
                        type: 'primary',
                        onClick: () => {

                        }
                    }
                ]
            }
        });
    }

    private _items: NewQueryItem[] = [];
    get items(){
        return this._items.slice();
    }
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

    destroy() {
        this.modal.destroy();
        this.queryWrapper = null;
    }
}