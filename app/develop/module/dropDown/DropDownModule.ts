/// <amd-module name="DropDownModule"/>
import {SelectInput} from "global/components/form/selectInput/selectInput";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

let d = G.d;
let tools = G.tools;

interface IDropDownModulePara extends IComponentPara {
    title?: string;
    data?: string[];
    changeValue?: (val) => void;
    dropClassName?: string;
    disabled?: boolean;
}

export class DropDownModule extends Component {
    protected wrapperInit(dropDownPara: IDropDownModulePara): HTMLElement {
        return d.create(`
       <div class="dropDownModule">
            <label class="dropDownLabel">${dropDownPara.title} :</label>
            <div class="dropDownContainer"></div>
            <div class="clear"></div>
       </div>
        `);
    }

    constructor(para: IDropDownModulePara) {
        super(para);
        if (tools.isEmpty(para))
            para = {};
        this.init(para);
    }

    private init(para: IDropDownModulePara) {
        this.dropClassName = para.dropClassName;
        this.changeValue = para.changeValue;
        // 设置选项内容
        if (para.data) {
            this.dpData = para.data;
        }
        this.disabled = para.disabled;
    }

    set disabled(disabled) {
        this._disabled = !!disabled || false;
        this.dropDown.disabled = disabled;
    }

    get disabled() {
        return this._disabled;
    }

    private _dropClassName: string;
    set dropClassName(className) {
        this._dropClassName = className || '';
    }

    get dropClassName() {
        return this._dropClassName;
    }

    public changeValue?: (val) => void;
    private _dropDown: SelectInput;
    get dropDown() {
        if (!this._dropDown) {
            let self = this;
            this._dropDown = new SelectInput({
                container: this.wrapper.querySelector('.dropDownContainer'),
                disabled: true,
                dropClassName: this.dropClassName,
                onSet(val) {
                    if (self.changeValue) {
                        self.changeValue(val);
                    }
                }
            })
        }
        return this._dropDown;
    }

    private _dpData: string[];
    set dpData(data) {
        this._dpData = data;
        this.dropDown.setPara({data: this._dpData});
        if (this._dpData.length > 0) {
            this.dropDown.set(this._dpData[0]);
        }
    }

    get dpData() {
        return this._dpData;
    }

    get() {
        return this.dropDown.get();
    }

    set(val) {
        if (val === '') {
            val = 0;
        }
        if (typeof val === 'number') {
            this.dropDown.set(this._dpData[val]);
        } else {
            this.dropDown.set(val);
        }

    }
}