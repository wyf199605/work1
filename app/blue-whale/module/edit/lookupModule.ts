/// <amd-module name="LookupModule"/>
import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import sys = BW.sys;
import tools = G.tools;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {BwRule} from "../../common/rule/BwRule";

interface ILookupModulePara extends IFormComPara{
    field:R_Field;
    rowDataGet?: () => obj
    onExtra?: Function;
}
export class LookupModule extends FormCom{
    onSet: (val) => void;
    private selectInput: SelectInput|SelectInputMb;
    private options:obj[] = [];

    constructor(private para: ILookupModulePara){
        super(para);

        this.selectInput = new (sys.isMb ? SelectInputMb : SelectInput)({
            container: this.para.container,
            ajax: {
                fun: (url, val, cb) => {
                    this.ajax(cb)
                }
            },
            readonly: !!para.field.noEdit,
            onSet:(item) => {
                this.setValue(item, false);
                this.para.onExtra && this.para.onExtra(item);
            }
        });
        this._wrapper = this.selectInput.wrapper;
    }

    get disabled(){
        return this._disabled;
    }
    set disabled(flag: boolean){
        this._disabled = flag;
        this.selectInput && (this.selectInput.disabled = flag);
    }

    private ajax(callback:Function){
        let {field, rowDataGet} = this.para;
        BwRule.getLookUpOpts(field, rowDataGet ? rowDataGet() : {}).then(options => {
            this.options = options;
            callback(options ? options.map((o) => Object.assign({}, o)) : []);
        });
    }

    get() {
        return this.value;
    }

    set(value){
        this.value = value;
    }

    protected setValue(value, isSetSelect = true){
        value = (typeof value === 'object' && value !== null) ? value.value : value;
        if(tools.isEmpty(this.options)){
            this.ajax((options:ListItem[])=>{
                this.selectInput.setPara({
                    data: options
                });
                for(let i = 0; i < options.length; i ++) {
                    let option = options[i];
                    if(option.value === value){
                        isSetSelect && this.selectInput.set(option);
                        typeof this.onSet === 'function' && this.onSet(option);
                        return;
                    }
                }
                this.clear(isSetSelect);
            });
        } else{
            for(let i = 0; i < this.options.length; i ++) {
                let option = this.options[i];
                if(option.value === value){
                    isSetSelect && this.selectInput.set(option);
                    typeof this.onSet === 'function' && this.onSet(option);
                    return;
                }
            }
            this.clear(isSetSelect);
            // this.selectInput.set(value);
            // typeof this.onSet === 'function' && this.onSet(value);
        }
    }

    clear(isSetSelect = true){
        let option = {
            value: '',
            text: ''
        };
        isSetSelect && this.selectInput.set(option);
        typeof this.onSet === 'function' && this.onSet(option);
    }


    get value(){
        return this.selectInput.getText();
    }
    set value(value: any) {
        this.setValue(value);
    }

    protected wrapperInit(para): HTMLElement {
        return undefined;
    }

}
