/// <amd-module name="LookupModule"/>
import {FormCom, IFormComPara} from "../../../global/components/form/basic";
import sys = BW.sys;
import tools = G.tools;
import {SelectInput} from "../../../global/components/form/selectInput/selectInput";
import {SelectInputMb} from "../../../global/components/form/selectInput/selectInput.mb";
import {BwRule} from "../../common/rule/BwRule";

interface ILookupModulePara extends IFormComPara{
    field:R_Field;
    rowData?: obj
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
            onSet:(item, index) => {
                this.set(item.value);
                this.para.onExtra && this.para.onExtra(item);
            }
        });
    }

    private ajax(callback:Function){
        let {field, rowData} = this.para;
        BwRule.getLookUpOpts(field, rowData).then(options => {
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


    get value(){
        return this.selectInput.getText();
    }
    set value(value: any) {
        value = (typeof value === 'object' && value !== null) ? value.value : value;
        if(tools.isEmpty(this.options)){
            this.ajax((options:ListItem[])=>{
                this.selectInput.setPara({
                    data: options
                });
                for(let i = 0; i < options.length; i ++) {
                    let option = options[i];
                    if(option.value === value){
                        this.selectInput.set(option);
                        typeof this.onSet === 'function' && this.onSet(option);
                        break;
                    }
                }
            });
        } else{
            for(let i = 0; i < this.options.length; i ++) {
                let option = this.options[i];
                if(option.value === value){
                    this.selectInput.set(option);
                    typeof this.onSet === 'function' && this.onSet(option);
                    break;
                }
            }
            // this.selectInput.set(value);
            // typeof this.onSet === 'function' && this.onSet(value);
        }
    }

    protected wrapperInit(para): HTMLElement {
        return undefined;
    }

}