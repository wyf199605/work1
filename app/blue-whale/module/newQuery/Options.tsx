/// <amd-module name="Options"/>

import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import {IOptionItem, OptionItem} from "./OptionItem";
import d = G.d;
import tools = G.tools;
interface IOptions extends IFormComPara {
    options?: string[][];
    interval?: number;
    itemClick?: (data: string[]) => void;
}

export class Options extends FormCom {
    get() {
        let data = [],
            result = [];
        this.options.forEach(opt => {
            if (opt.active) {
                data.push(opt.get());
            }
        });
        switch (this.para.interval){
            case 0:
            case 1:
            case 2:
            case 3:{
                result = tools.isEmpty(data) ? [] : data[0];
            }
            break;
            case 4:{
                let intervalValue = [];
                data.forEach(d => {
                   intervalValue.push(d[0]);
                });
                result = tools.isEmpty(intervalValue) ? [] : [intervalValue.join(',')];
            }
        }
        return result;
    }

    set(val: string[][]): void {
        this._value = val;
        this.render(val);
    }

    set value(val: string[][]) {
        this.set(val);
    }

    get value() {
        return this._value;
    }

    protected wrapperInit(para: IOptions): HTMLElement {
        return <div className="new-query-options"/>;
    }

    private interval: number = 0;

    constructor(private para: IOptions) {
        super(para);
        this.interval = para.interval || 0;
        this.value = para.options || [];
        this.initEvents.on();
    }

    private _options: OptionItem[] = [];
    get options() {
        return [...this._options.slice()];
    }

    render(data: string[][]) {
        data = data || [];
        d.diff(data, this.options, {
            create: (n) => {
                this._options.push(this.createOptionItem({optionData: n}));
            },
            replace: (n, o) => {
                o.data = n || [];
                o.set(o.data);
            },
            destroy: (o) => {
                o.destroy();
                let index = this._options.indexOf(o);
                if (index > -1)
                    delete this._options[index]
            }
        });
        this._options = this._options.filter((item) => item);
        this.refreshIndex();
    }

    refreshIndex() {
        this._options.forEach((item, index) => {
            item.index = index;
        });
    }

    private createOptionItem(para: IOptionItem) {
        return new OptionItem(Object.assign({}, para, {
            container: this.wrapper,
            itemClick: this.para.itemClick,
            interval: this.para.interval
        }));
    }

    getHeight() {
        let height = window.getComputedStyle(this.wrapper).height;
        return parseInt(height.slice(0, height.length - 2));
    }

    private initEvents = (() => {
        let toggleSelect = (e) => {
            let index = parseInt(e.target.dataset.index);
            switch (this.para.interval) {
                case 0:
                case 1:
                case 2:
                case 3: {
                    this.options.forEach((opt, i) => {
                        i === index ? (opt.active = !opt.active) : (opt.active = false);
                    })
                }
                    break;
                case 4: {
                    this.options[index].active = !this.options[index].active;
                }
                    break;
            }
            tools.isFunction(this.para.itemClick) && this.para.itemClick(this.get());
        };
        return {
            on: () => d.on(this.wrapper, 'click', '.new-query-option-item', toggleSelect),
            off: () => d.off(this.wrapper, 'click', '.new-query-option-item', toggleSelect)
        }
    })();

    destroy() {
        this.options.forEach(item => {
            item.destroy();
        });
        this._options = null;
        this.para = null;
        this.initEvents.off();
        super.destroy();
    }
}