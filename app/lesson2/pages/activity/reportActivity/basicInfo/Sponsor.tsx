/// <amd-module name="Sponsor"/>
import Component = G.Component;
import {BasicInfoInput} from "./BasicInfoInput";
import IComponentPara = G.IComponentPara;
import d = G.d;
import tools = G.tools;
import {TextInput} from "../../../../../global/components/form/text/text";
import {SponsorPara} from "../ReportActivityData";
import {ReportActivityPage} from "../ReportActivityPage";

interface ISponsorPara extends IComponentPara {
    title?: string;
    isRequired?: boolean;
}

export class Sponsor extends Component {
    private isRequired: boolean;
    private _inputArr: BasicInfoInput[];
    set inputArr(arr) {
        this._inputArr = arr;
    }

    get inputArr() {
        return this._inputArr;
    }

    protected wrapperInit(para: ISponsorPara): HTMLElement {
        let sponsorWrapper = <div className="row addRow">
            <BasicInfoInput c-var="add" title={para.title} isRequired={para.isRequired}
                            isShowAdd={true} isAdd={true}/>
        </div>;
        return sponsorWrapper;
    }

    constructor(para: ISponsorPara) {
        super(para);
        this.initEvents.on();
        this.inputArr = [this.innerCom.add as BasicInfoInput];
        this.isRequired = para.isRequired;
    }

    private initEvents = (() => {
        let addSponsorEvent = () => {
            this.newSponsor();
        };

        let removeSponsorOrOrganizer = (e) => {
            let lessonFormGroup = d.closest(e.target, '.lesson-form-group'),
                groups = d.queryAll('.lesson-form-group', this.wrapper),
                index = groups.indexOf(lessonFormGroup);
            d.remove(lessonFormGroup);
            let inputs = this.inputArr;
            inputs.splice(index, 1);
            this.inputArr = inputs;
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
        tools.isNotEmptyArray(this.inputArr) && this.inputArr.forEach((input) => {
            input.disabled = disabled;
        })
        d.queryAll('i.sec',this.wrapper).forEach((i)=>{
          i.classList.toggle('disabled',disabled);
        })
    }

    get disabled() {
        return this._disabled;
    }

    set(data: SponsorPara[]) {
        if (tools.isNotEmpty(data)){
            let dataArr = data.map((sp)=>{
                return sp.name;
            });
            let firstValue = '',
                otherValue = [];
            if (tools.isNotEmptyArray(dataArr)){
                firstValue = dataArr[0];
                otherValue = dataArr.slice(1);
            }
            (this.innerCom.add as TextInput).set(firstValue);
            otherValue.forEach(val =>{
                this.newSponsor(val);
            })
        }
    }

    get() {
        if (this.isRequired === true) {
            let value = this.inputArr[0].get();
            if (value === false) {
                return false;
            }
        }
        let values = [];
        this.inputArr.forEach((input) => {
            if (tools.isNotEmpty(input.get())) {
                values.push({name: input.get()});
            } else {
                input.destroy();
            }
        });
        return values;
    }

    private newSponsor(str = '') {
        let input = new BasicInfoInput({
                container: this.wrapper,
                isShowAdd: true,
                className: 'add-group',
                defaultValue: str
            }),
            inputs = this.inputArr;
        this.inputArr = inputs.concat(input);
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}