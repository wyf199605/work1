/// <amd-module name="OptionItem"/>

import {FormCom, IFormComPara} from "../../../global/components/form/basic";

export interface IOptionItem extends IFormComPara {
    optionData?: string[];
    itemClick?: (data: string[]) => void;
    interval?: number;
    index?:number;
}

export class OptionItem extends FormCom {
    get() : string[]{
        let val;
        switch (this.para.interval) {
            case 0:
            case 1:
            case 2: {
                val = this._value; // 返回两个字符串
            }
                break;
            case 3:
            case 4: {
                val = [this._value[0]]; // 返回一个字符串
            }
                break;
        }
        return val;
    }

    set(val: string[]): void {
        this._value = val;
        switch (this.para.interval) {
            case 0:
            case 1:
            case 2: {
                this.wrapper.innerText = `${val[0]}~${val[1]}`;
            }
                break;
            case 3:
            case 4: {
                this.wrapper.innerText = val[1] || val[0];
            }
                break;
        }
    }

    set value(val: string[]) {
        this.set(val);
    }

    get value() {
        return this.get();
    }

    protected wrapperInit(para: IOptionItem): HTMLElement {
        return <div className="new-query-option-item"/>;
    }

    constructor(private para: IOptionItem) {
        super(para);
        this.value = para.optionData || [];
    }

    private _active:boolean;
    set active(active:boolean){
        this._active = active;
        this.wrapper.classList.toggle('active',this._active);
    }
    get active(){
        return this._active;
    }
    // 获取当前索引
    protected _index: number;
    get index() {
        return this._index;
    }

    set index(index: number) {
        this._index = index;
        this.wrapper && (this.wrapper.dataset['index'] = index + '');
    }

    destroy() {
        super.destroy();
        this.para = null;
    }
}