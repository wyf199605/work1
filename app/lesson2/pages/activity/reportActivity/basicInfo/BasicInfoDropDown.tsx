/// <amd-module name="BasicInfoDropDown"/>

import {SelectInput} from "../../../../../global/components/form/selectInput/selectInput";
import tools = G.tools;
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {LeRule} from "../../../../common/rule/LeRule";
import {Utils} from "../../../../common/utils";
import {ReportActivityPage} from "../ReportActivityPage";

interface IBasicInfoDropDownPara extends IComponentPara {
    title?: string;
    isRequired?: boolean;
    dropData?: string[];
    dropClassName?: string;
    defaultValue?: string; //默认值
    dropDisabled?: boolean;//是否可以编辑
    linkUrl?: string;
    field?: string;
}

export class BasicInfoDropDown extends Component {
    private isRequired: boolean;
    private title: string;
    private dropData: string[];
    private dropMetaData: string[];
    private linkUrl: string;
    private field: string;

    protected wrapperInit(para: IBasicInfoDropDownPara): HTMLElement {
        let drop: SelectInput = null;
        let basicInfoInputWrapper = <div className="lesson-form-group">
            <div className="lesson-label"><span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{para.title}&nbsp;:
            </div>
            {drop = <SelectInput readonly={true} c-var="drop" dropClassName={para.dropClassName}
                                 arrowIcon="seclesson-xiala" arrowIconPre="sec" data={para.dropData}/>}
        </div>;
        tools.isNotEmpty(para.defaultValue) && drop.set(para.defaultValue);
        return basicInfoInputWrapper;
    }

    constructor(para: IBasicInfoDropDownPara) {
        super(para);
        this.isRequired = para.isRequired;
        this.title = para.title;
        this.linkUrl = para.linkUrl;
        this.field = para.field;
    }

    // 设置是否可以编辑
    set disabled(disabled: boolean) {
        if(tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        this.innerCom.drop.disabled = disabled;
    }

    get disabled() {
        return this._disabled;
    }

    get() {
        let value = (this.innerCom.drop as SelectInput).get();
        if ((tools.isEmpty(value) || value.indexOf('请选择') >= 0) && this.isRequired === true) {
            Modal.alert('请选择' + this.title + '!');
            return false;
        }
        return this.dropMetaData[this.dropData.indexOf(value)].toString();
    }

    set(value:string) {
        // let sessionDropData = JSON.parse(sessionStorage.getItem(this.field)),
        //     sessionDropMetaData = JSON.parse(sessionStorage.getItem(this.field + 'meta'));
        // if (tools.isNotEmpty(sessionDropData)) {
        //     this.dropData = sessionDropData;
        //     this.dropMetaData = sessionDropMetaData;
        //     (this.innerCom.drop as SelectInput).setPara({data: ['请选择' + this.title].concat(sessionDropData)});
        //     if (tools.isNotEmpty(value)){
        //         (this.innerCom.drop as SelectInput).set(this.dropData[this.dropMetaData.indexOf(value)]);
        //     }
        // } else {
            tools.isNotEmpty(this.linkUrl) && LeRule.Ajax.fetch(this.linkUrl).then(({response}) => {
                this.dropData = Utils.getDropDownList(response.data.body.dataList, 1);
                (this.innerCom.drop as SelectInput).setPara({data: ['请选择' + this.title].concat(this.dropData)});
                this.dropMetaData = Utils.getDropDownList(response.data.body.dataList, 0);
                sessionStorage.setItem(this.field, JSON.stringify(this.dropData));
                sessionStorage.setItem(this.field + 'meta', JSON.stringify(this.dropMetaData));
                if (tools.isNotEmpty(value)){
                    (this.innerCom.drop as SelectInput).set(this.dropData[this.dropMetaData.indexOf(value)]);
                }
            })
        // }
    }
}