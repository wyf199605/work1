/// <amd-module name="BasicInfoInput"/>


import {TextInput} from "../../../../../global/components/form/text/text";
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {ReportActivityPage} from "../ReportActivityPage";

interface IBasicInfoInputPara extends IComponentPara {
    title?: string;
    isRequired?: boolean;
    isShowAdd?: boolean;
    isAdd?: boolean;
    inputDisabled?: boolean; // 是否可以编辑
    defaultValue?: string;//默认值
}

export class BasicInfoInput extends Component {
    private isRequire: boolean;
    private title: string;

    protected wrapperInit(para: IBasicInfoInputPara): HTMLElement {
        let input:TextInput = null;
        let basicInfoInputWrapper = <div className="lesson-form-group">
            <div className="lesson-label">
                <span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{(tools.isEmpty(para.title) ? '' : para.title + ' :')}
            </div>
            {input = <TextInput c-var="input"/>}
        </div>;
        tools.isNotEmpty(para.defaultValue) && input.set(para.defaultValue);
        if (para.isShowAdd === true) {
            let addIcon = para.isAdd === true ? <i
                className="sec seclesson-jiayihang"/> : <i
                className="sec seclesson-jianyihang"/>;
            basicInfoInputWrapper.appendChild(addIcon);
        }
        return basicInfoInputWrapper;
    }

    constructor(para: IBasicInfoInputPara) {
        super(para);
        this.isRequire = para.isRequired;
        this.title = para.title;
    }

    set disabled(dis: boolean) {
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        (this.innerCom.input as TextInput).disabled = dis;
    }

    get disabled() {
        return this._disabled;
    }

    get() {
        let value = (this.innerCom.input as TextInput).get();
        if (tools.isEmpty(value) && this.isRequire === true) {
            Modal.alert(this.title + '不能为空!');
            return false;
        }
        return value;
    }

    set(value) {
        (this.innerCom.input as TextInput).set(value);
    }
}