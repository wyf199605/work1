/// <amd-module name="DeadlineModule"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {Datetime} from "../../../../../global/components/form/datetime/datetime";
import tools = G.tools;
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {Utils} from "../../../../common/utils";

export class DeadlineModule extends Component{
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let deadlineWrapper = <div className="row time">
            <div className="lesson-form-group">
                <div className="lesson-label"></div>
                <div style="margin-right:25px;">评价截止时间</div>
                <Datetime format="Y-M-d H:m" c-var="time" isClean={true} cleanIcon="sec seclesson-guanbi"></Datetime>
            </div>
        </div>;
        return deadlineWrapper;
    }

    constructor(para: IComponentPara){
        super(para);
    }

    set disabled(d:boolean){
        this._disabled = d;
        (this.innerCom.time as Datetime).disabled = d;
    }
    get disabled(){
        return this._disabled;
    }

    set(time:number){
        (this.innerCom.time as Datetime).set(Utils.formatTime(time));
    }

    get (){
        let st = (this.innerCom.time as Datetime).get(),
            stTime = 0;
        if (tools.isNotEmpty(st)){
            stTime = new Date(st).getTime();
        }else{
            Modal.alert('评论截止时间不能为空!');
            return false;
        }
        return stTime/1000;
    }
}