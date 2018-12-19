/// <amd-module name="NewQueryItem"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {Options} from "./Options";
import {RangeInput} from "./RangeInput";
import {RangeInputItem} from "./RangeInputItem";

export interface IResult {
    filedName?: string;
    intervalValue?: string[];
}


export interface IQueryItem extends IComponentPara {
    filedName?: string; // 字段名称
    caption?: string; // 字段标题
    interval?: number; // 0: 文本区间 1：日期区间 2：时间区间 3:单选(key,value) 4：多选(key,value)
    optionValue?: string[][]; // 值
}

export class NewQueryItem extends Component {

    private bodyWrapper: HTMLElement;

    protected wrapperInit(para: IQueryItem): HTMLElement {
        return <div className="new-query-item">
            {tools.isMb ? <div className="new-query-item-title"><span>{para.caption}</span><i
                className="iconfont icon-arrow-up"/></div> : <div className="new-query-item-title"><span>{para.caption}</span></div>}
            {this.bodyWrapper = <div className="new-query-item-body"/>}
        </div>;
    }

    constructor(private para: IQueryItem) {
        super(para);
        this.initContent(para);
        this.initEvents.on();
    }


    private queryOptions: Options;
    private rangeInput: RangeInput;
    private textInput: RangeInputItem;

    private initContent(para: IQueryItem) {
        switch (this.para.interval) {
            case 0:
            case 1:
            case 2: {
                let rangeInput = new RangeInput({
                        container: this.bodyWrapper,
                        interval: this.para.interval
                    }),
                    height = 20;
                height += rangeInput.getHeight();
                this.rangeInput = rangeInput;
                if (tools.isNotEmpty(para.optionValue)) {
                    let options = new Options({
                        container: this.bodyWrapper,
                        options: para.optionValue,
                        interval: para.interval,
                        itemClick: (data: string[]) => {
                            this.rangeInput.set(data);
                        }
                    });
                    this.queryOptions = options;
                    height += options.getHeight();
                }
                tools.isMb && (this.bodyWrapper.style.height = height + 'px');
            }
                break;
            case 3:
            case 4: {
                let height = 20;
                if (tools.isNotEmpty(para.optionValue)) {
                    let options = new Options({
                        container: this.bodyWrapper,
                        options: para.optionValue,
                        interval: para.interval
                    });
                    this.queryOptions = options;
                    height += options.getHeight();
                }
                tools.isMb && (this.bodyWrapper.style.height = height + 'px');
            }
                break;
            case 5: {
                this.textInput = new RangeInputItem({
                    interval: para.interval,
                    caption: para.caption,
                    container:this.bodyWrapper
                });
                tools.isMb && (this.bodyWrapper.style.height = '52px');
            }
                break;
        }
    }

    private initEvents = (() => {
        let toggleArrow = (e) => {
            let el = e.target;
            el.classList.toggle('flip');
            this.bodyWrapper.classList.toggle('flip');
        };
        let inputChange = () => {
            tools.isNotEmpty(this.queryOptions) && this.queryOptions.options.forEach(opt => {
                opt.active = false;
            });
        };
        return {
            on: () => {
                tools.isMb && d.on(this.wrapper, 'click', '.new-query-item-title i.iconfont.icon-arrow-up', toggleArrow);
                d.on(this.bodyWrapper, 'input', '.new-query-input-wrapper input', tools.pattern.debounce(inputChange, 300));
            },
            off: () => {
                tools.isMb && d.off(this.wrapper, 'click', '.new-query-item-title i.iconfont.icon-arrow-up', toggleArrow);
                d.on(this.bodyWrapper, 'input', '.new-query-input-wrapper input', tools.pattern.debounce(inputChange, 300));
            }
        }
    })();

    get() {
        let result: IResult = {};
        switch (this.para.interval) {
            case 0:
            case 1:
            case 2: {
                result = {
                    filedName: this.para.filedName,
                    intervalValue: this.rangeInput.get() || []
                };
            }
                break;
            case 3:
            case 4: {
                result = {
                    filedName: this.para.filedName,
                    intervalValue: this.queryOptions.get() || []
                };
            }
                break;
            case 5: {
                let val = this.textInput.get();
                result = {
                    filedName: this.para.filedName,
                    intervalValue: tools.isNotEmpty(val) ? [val] : []
                }
            }
                break;
        }
        return result;
    }

    set(data: string[]) {
        data = data || [];
        switch (this.para.interval) {
            case 0:
            case 1:
            case 2: {
                this.rangeInput && this.rangeInput.set(data);
                this.queryOptions.options.forEach(opt => {
                    opt.active = false;
                })
            }
                break;
            case 3: {
                this.queryOptions.options.forEach(opt => {
                    if (opt.get() === data) {
                        opt.active = true;
                    } else {
                        opt.active = false;
                    }
                })
            }
                break;
            case 4: {
                let dataArr = [];
                if (tools.isNotEmpty(data[0])) {
                    dataArr = data[0].split(',');
                }
                this.queryOptions.options.forEach(opt => {
                    if (~dataArr.indexOf(opt.get()[0])) {
                        opt.active = true;
                    } else {
                        opt.active = false;
                    }
                })
            }
                break;
            case 5: {
                this.textInput.set(data[0] || '');
            }
                break;
        }
    }

    destroy() {
        this.initEvents.off();
        this.queryOptions.destroy();
        this.para = null;
        super.destroy();
    }
}