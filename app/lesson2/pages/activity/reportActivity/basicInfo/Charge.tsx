/// <amd-module name="Charge"/>

import Component = G.Component;
import {ChargeItem} from "./ChargeItem";
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import d = G.d;
import {ChargePara} from "../ReportActivityData";
import {ReportActivityPage} from "../ReportActivityPage";

interface IChargePara extends IComponentPara {

}

export class Charge extends Component {
    private _chargeItemArr: ChargeItem[];
    set chargeItemArr(arr) {
        this._chargeItemArr = arr;
    }

    get chargeItemArr() {
        return this._chargeItemArr;
    }

    protected wrapperInit(para: IChargePara): HTMLElement {
        let chargeWrapper = <div className="row addRow charge">
            <ChargeItem c-var="add" isShowAdd={true} title="咨询人" isAdd={true}/>
        </div>;
        return chargeWrapper;
    }

    constructor(para: IChargePara) {
        super(para);
        this.chargeItemArr = [this.innerCom.add as ChargeItem];
        this.initEvents.on();
    }

    private initEvents = (() => {
        let addSponsorEvent = () => {
            this.newChargeItem();
        };

        let removeSponsorOrOrganizer = (e) => {
            let lessonFormGroup = d.closest(e.target, '.lesson-form-group'),
                groups = d.queryAll('.lesson-form-group', this.wrapper),
                index = groups.indexOf(lessonFormGroup);
            d.remove(lessonFormGroup);
            let inputs = this.chargeItemArr;
            inputs.splice(index, 1);
            this.chargeItemArr = inputs;
        };
        return {
            on: () => {
                d.on(this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                d.on(this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
            },
            off: () => {
                d.off(this.wrapper, 'click', 'i.sec.seclesson-jiayihang', addSponsorEvent);
                d.off(this.wrapper, 'click', 'i.sec.seclesson-jianyihang', removeSponsorOrOrganizer);
            }
        }
    })();

    // 设置是否可以编辑
    set disabled(disabled: boolean) {
        if(tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        tools.isNotEmptyArray(this.chargeItemArr) && this.chargeItemArr.forEach((chargeItem) => {
            chargeItem.disabled = disabled;
        })
    }

    get disabled() {
        return this._disabled;
    }

    private newChargeItem(chargeObj?: ChargePara) {
        let chargeItem = new ChargeItem({
                container: this.wrapper,
                isShowAdd: true,
                className: 'add-group',
                defaultValue: chargeObj
            }),
            items = this.chargeItemArr;
        this.chargeItemArr = items.concat(chargeItem);
    }

    set(data:ChargePara[]) {
        if(tools.isNotEmpty(data)){
            let firstValue:ChargePara,
                otherValue = [];
            if (tools.isNotEmptyArray(data)){
                firstValue = data[0];
                otherValue = data.slice(1);
            }
            (this.innerCom.add as ChargeItem).set(firstValue);
            otherValue.forEach(val =>{
                this.newChargeItem(val);
            })
        }
    }

    get() {
        let chargeArr = [];
        this.chargeItemArr.forEach((item) => {
            if (tools.isNotEmpty(item.get().name) && tools.isNotEmpty(item.get().phone)) {
                chargeArr.push(item.get());
            } else {
                item.destroy();
            }
        });
        return chargeArr;
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}