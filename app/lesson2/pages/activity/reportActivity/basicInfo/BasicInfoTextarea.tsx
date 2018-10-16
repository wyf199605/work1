/// <amd-module name="BasicInfoTextarea"/>


import tools = G.tools;
import {TextAreaInput} from "../../../../../global/components/form/text/TextInput";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {ReportActivityPage} from "../ReportActivityPage";

interface IBasicInfoTextareaPara extends IComponentPara {
    title?: string;
    isRequired?: boolean;
}

export class BasicInfoTextarea extends Component {
    private isRequired:boolean;
    private title:String;
    protected wrapperInit(para: IBasicInfoTextareaPara): HTMLElement {
        let basicInfoInputWrapper = <div className="lesson-form-group textarea-group">
            <div className="lesson-label"><span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{(tools.isEmpty(para.title) ? '' : para.title+ ' :')}
            </div>
            <TextAreaInput c-var="textarea"/>
        </div>;
        return basicInfoInputWrapper;
    }

    constructor(para: IBasicInfoTextareaPara) {
        super(para);
        this.isRequired = para.isRequired;
        this.title = para.title;
    }

    set disabled(disabled:boolean){
        if(tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        this.innerCom.textarea.disabled = disabled;
    }
    get disabled(){
        return this._disabled;
    }

    set(value) {
        (this.innerCom.textarea as TextAreaInput).value = value;
    }

    get() {
        let value = (this.innerCom.textarea as TextAreaInput).value;
        if (tools.isEmpty(value) && this.isRequired === true) {
            Modal.alert(this.title + '不能为空!');
            return false;
        }
        return value;
    }
}