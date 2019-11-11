/// <amd-module name="AssignTextModule"/>
import tools = G.tools;
import {AssignModuleBasic} from "./assignModuleBasic";
import d = G.d;
import {TextInput, ITextInputBasicPara, ITextInputPara} from "../../../../global/components/form/text/text";

interface AssignTextModulePara extends ITextInputBasicPara{
    onSet?(assignData :{[key : string]: any[]}) : void;
    pickerUrl?: string;
    ajaxUrl: string;
    name: string;
    data: obj;
    onGetData(data: obj[], otherField: string): void
}

export class AssignTextModule extends TextInput{
    protected para: AssignTextModulePara;
    private assignBasic: AssignModuleBasic;

    constructor(p: AssignTextModulePara){
        p.readonly = false;

        super(<ITextInputPara>Object.assign({}, p, {
            icons : p.pickerUrl ? ['iconfont icon-arrow-down'] : null
        }));

        this.para = p;

        this.assignBasic = new AssignModuleBasic();

        if(p.pickerUrl){
            this.iconGroup.parentElement.dataset.name = p.name;
            this.assignBasic.initPicker(this.iconGroup, this.input, this.para.pickerUrl, p.data, (detail) => {
                let dataStr = detail.data.map(obj => obj[detail.fromField]).join(';');
                this.set(dataStr);
                this.para.onGetData(detail.data, detail.otherField);
            });
        }
    }

    set (str: string){

        if(this.input){
            this.input.value = str;
        }
        typeof this.onSet === 'function' && this.onSet(str);

    }
    destroy(){
        this.assignBasic && this.assignBasic.destroy();
        super.destroy();
    }
}
