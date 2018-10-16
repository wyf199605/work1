/// <amd-module name="ChargeItem"/>

import Component = G.Component;
import {BasicInfoInput} from "./BasicInfoInput";
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {ChargePara} from "../ReportActivityData";
import {ReportActivityPage} from "../ReportActivityPage";
import d = G.d;
interface IChargeItemPara extends IComponentPara{
    isShowAdd?: boolean;
    isAdd?: boolean;
    title?:string;
    defaultValue?:ChargePara;
}

export class ChargeItem extends Component {
    protected wrapperInit(para: IChargeItemPara): HTMLElement {
        let name = '',
            phone = '';
        if (tools.isNotEmpty(para.defaultValue)){
            name = para.defaultValue.name;
            phone = para.defaultValue.phone;
        }
        let chargeItemWrapper = <div className="lesson-form-group charge-item">
            <div className="lesson-label">
                {(tools.isEmpty(para.title) ? '' : para.title + ' :')}
            </div>
            <div className="phoneAndName">
                <BasicInfoInput c-var="name" defaultValue={name} title="姓名" />
                <BasicInfoInput className="flex-right" defaultValue={phone} c-var="phone" title="联系方式"/>
            </div>
        </div>;
        if (para.isShowAdd === true) {
            let addIcon = para.isAdd === true ? <i
                className="sec seclesson-jiayihang"/> : <i
                className="sec seclesson-jianyihang"/>;
            chargeItemWrapper.appendChild(addIcon);
        }
        return chargeItemWrapper;
    }

    get(){
        return {
            name:(this.innerCom.name as BasicInfoInput).get(),
            phone:(this.innerCom.phone as BasicInfoInput).get()
        };
    }

    set(data){
        (this.innerCom.name as BasicInfoInput).set(data.name);
        (this.innerCom.phone as BasicInfoInput).set(data.phone);
    }

    set disabled(dis:boolean){
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        (this.innerCom.name as BasicInfoInput).disabled = dis;
        (this.innerCom.phone as BasicInfoInput).disabled = dis;
        d.query('i.sec',this.wrapper).classList.toggle('disabled',dis);
    }
    get disabled(){
        return this._disabled;
    }

    constructor(para: IChargeItemPara) {
        super(para);
    }
}