/// <amd-module name="CustomModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {IQueryItem, IResult, NewQueryItem} from "../newQuery/NewQueryItem";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {Button} from "../../../global/components/general/button/Button";

interface ICustom extends IComponentPara {
    settingValue: string;
}

export class CustomModule extends Component {
    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        return <div className="custom-queery-pc"/>;
    }

    static queryItems: IQueryItem[] = [];

    constructor(para: ICustom) {
        super(para);
        let dataStr = para.settingValue.replace(/\s*/g, '').replace(/\\*/g, ''),
            data: IQueryItem[] = JSON.parse(dataStr);
        CustomModule.queryItems = data;
        this.initTpl(data);
    }

    private _items: NewQueryItem[] = [];
    get items() {
        return this._items.slice();
    }

    private initTpl(data: IQueryItem[]) {
        data.forEach(item => {
            this._items.push(new NewQueryItem(Object.assign({}, item, {
                container: this.wrapper
            })));
        });
        new Button({
            content: '重置',
            className:'reset',
            container: this.wrapper,
            onClick: () => {
                this.items.forEach(item => {
                    item.set([]);
                })
            }
        });
    }

    get json(): IResult[] {
        let data: IResult[] = [];
        this.items.forEach(item => {
            tools.isNotEmpty(item.get().intervalValue) && data.push(item.get());
        });
        return data;
    }

    static validate(data): boolean {
        for (let i = 0; i < data.length; i++) {
            let itemData = data[i].intervalValue,
                interval = this.queryItems.filter(item => item.filedName === data[i].filedName)[0].interval;
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
        super.destroy();
        CustomModule.queryItems = null;
        this._items = null;
    }
}