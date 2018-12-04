/// <amd-module name="RangeInput"/>

import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import {RangeInputItem} from "./RangeInputItem";
import tools = G.tools;
interface IRangeInput extends IFormComPara {
    rangeData?: string[];
    interval?:number;
}

export class RangeInput extends FormCom {
    get(): any {
        if (tools.isEmpty(this.min.get()) && tools.isEmpty(this.max.get())){
            return [];
        }
        return [this.min.get(),this.max.get()];
    }

    set(val:string[]) {
        this.min.set(val[0] || '');
        this.max.set(val[1] || '');
        this._value = val;
    }

    set value(val:string[]) {
        this.set(val);
    }

    get value() {
        return this.get();
    }

    private min: RangeInputItem;
    private max: RangeInputItem;

    protected wrapperInit(para: IRangeInput): HTMLElement {
        return <div className="new-query-range-input">
            {this.min = <RangeInputItem interval={para.interval} isFirst={true}/>}
            <div className="new-query-line"/>
            {this.max = <RangeInputItem interval={para.interval}/>}
        </div>;
    }

    constructor(para:IRangeInput){
        super(para);
    }

    getHeight() {
        let height = window.getComputedStyle(this.wrapper).height;
        return parseInt(height.slice(0, height.length - 2));
    }

    destroy() {
        super.destroy();
    }
}