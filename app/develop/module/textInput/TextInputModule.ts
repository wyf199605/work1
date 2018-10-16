/// <amd-module name="TextInputModule"/>

import {TextInput} from "../../../global/components/form/text/text";
import { CheckBox } from "global/components/form/checkbox/checkBox";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

let d = G.d;
let tools = G.tools;

interface ITextInputPara extends IComponentPara {
    title?: string;
    value?:string;
    placeHolder?: string;
    isShowCheckBox?: boolean;
    checkboxText?:string;
    disabled?:boolean; // 是否可以编辑
    // changeBoxValue?:(val)=>void;
}

export class TextInputModule extends Component{
    protected wrapperInit(): HTMLElement {
        return d.create(`
       <div class="textInputModule">
            <label class="textInputLabel"></label>
            <div class="textInputContent"></div>
            <div class="checkboxContent"></div>
            <div class="clear"></div>
       </div>
        `);
    }
    // private changeBoxValue?:(val)=>void;
    private init(para: ITextInputPara){
        if (para.placeHolder){
            this.tmPlaceHolder = para.placeHolder;
        }else{
            this.tmPlaceHolder = '';
        }
        this.title = para.title;
        this.disabled = para.disabled || false;
        this.isShowCheckBox = para.isShowCheckBox;
        this.checkboxText = para.checkboxText;
        if (this.isShowCheckBox){
            this.checkBox;
        }
        if (para.value !== ''){
            this.textInput.set(para.value);
        }
        // this.changeBoxValue = textInputPara.changeBoxValue;
    }
    private tmPlaceHolder:string;
    private isShowCheckBox:boolean;
    private checkboxText:string;
    constructor(para: ITextInputPara) {
        super(para);
        if (tools.isEmpty(para)){
            para = {};
        }
        this.init(para);
    }
    set disabled(disabled){
        this._disabled = disabled;
        this.textInput.disabled = disabled;
    }
    get disabled(){
        return this._disabled;
    }

    private _checkBox:CheckBox;
    get checkBox(){
        let self = this;
        if (!this._checkBox && this.isShowCheckBox){
            this._checkBox = new CheckBox({
                container:d.query('.checkboxContent',this.wrapper),
                text:this.checkboxText,
                onSet(check){
                    // self.changeBoxValue(check);
                }
            })
        }
        return this._checkBox;
    }
    private _textInput:TextInput;
    get textInput(){
        if(!this._textInput){
            this._textInput = new TextInput({
                container:d.query('.textInputContent',this.wrapper),
                placeholder:this.tmPlaceHolder
            })
        }
        return this._textInput;
    }
    private _title:string;
    set title(title:string){
        d.query('.textInputLabel',this.wrapper).innerText = `${title} :`;
    }
    get title(){
        return this._title;
    }
    get(){
        return this.textInput.get();
    }

    set(val){
        this.textInput.set(val);
    }
}