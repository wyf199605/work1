/// <amd-module name="TimeModule"/>
import {Datetime} from "../../../../../global/components/form/datetime/datetime";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import tools = G.tools;
import {Utils} from "../../../../common/utils";

interface ITimeModulePara extends IComponentPara {
    title?: string;
    preAlert?:string;
    isRequired?:boolean;
}

export class TimeModule extends Component {

    protected wrapperInit(para: ITimeModulePara): HTMLElement {
        return <div className="row time">
            <div className="lesson-form-group">
                <div className="lesson-label"><span>{para.isRequired === true ? '*' : ''}</span>&nbsp;{para.title}&nbsp;:</div>
                <Datetime c-var="startTime" isClean={true} cleanIcon="sec seclesson-guanbi"
                          format="Y-M-d H:m"/>
                <span className="zhi">至</span>
                <Datetime c-var="endTime" isClean={true} cleanIcon="sec seclesson-guanbi" format="Y-M-d H:m"/>
            </div>
        </div>;
    }

    private preAlert:string;
    constructor(para: ITimeModulePara) {
        super(para);
        this.preAlert = para.preAlert;
    }

    set disabled(d:boolean){
        this._disabled = d;
        (this.innerCom.startTime as Datetime).disabled = d;
        (this.innerCom.endTime as Datetime).disabled = d;
    }
    get disabled(){
        return this._disabled;
    }

    get() {
        let st = (this.innerCom.startTime as Datetime).get(),
            et = (this.innerCom.endTime as Datetime).get();
        if (tools.isEmpty(st)){
            Modal.alert(this.preAlert + '开始时间不能为空!');
            return false;
        }
        if (tools.isEmpty(et)){
            Modal.alert(this.preAlert + '结束时间不能为空!');
            return false;
        }
        let stTime = new Date(st).getTime(),
            etTime = new Date(et).getTime();
        if (stTime > etTime){
            Modal.alert(this.preAlert+'开始时间不能大于'+this.preAlert+'结束时间!');
            return false;
        }
        return [stTime/1000,etTime/1000];
    }

    set(time: number[]) {
        (this.innerCom.startTime as Datetime).set(Utils.formatTime(time[0]));
        (this.innerCom.endTime as Datetime).set(Utils.formatTime(time[1]));
    }

}