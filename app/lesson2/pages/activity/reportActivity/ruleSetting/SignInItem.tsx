/// <amd-module name="SignInItem"/>

import {TimeModule} from "./TimeModule";
import {Button} from "../../../../../global/components/general/button/Button";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import {SignType} from "./SignType";
import tools = G.tools;
import {SignContentPara} from "../ReportActivityData";
import {ReportActivityPage} from "../ReportActivityPage";

interface ISignInItemPara extends IComponentPara {
    addBtnHandler?: () => void;
    removeBtnHandler?: () => void;
    isAdd?: boolean;
    defaultValue?: SignContentPara;
}

export class SignInItem extends Component {
    private isFirst:boolean;
    protected wrapperInit(para: ISignInItemPara): HTMLElement {
        let signContentWrapper = <div className="sign-in-item">
            <TimeModule c-var="time" title="签到时间" preAlert="签到"/>
            <div className="sign-type">
                <SignType c-var="signType" isSignIn={true}/>
            </div>
            <div className="btns">
                <Button c-var="add" content={para.isAdd === true ? '新增' : '删除'} onClick={() => {
                    para.isAdd === true ? para.addBtnHandler() : para.removeBtnHandler();
                }} className="addBtn"/>
            </div>
        </div>;
        return signContentWrapper;
    }

    constructor(para: ISignInItemPara) {
        super(para);
        let defaultValue = para.defaultValue;
        this.isFirst = para.isAdd;
        if (tools.isNotEmpty(defaultValue)) {
            (this.innerCom.time as TimeModule).set([defaultValue.signStartTime,defaultValue.signEndTime]);
            (this.innerCom.signType as SignType).set({
                signType: defaultValue.signType, // 签到方式
                signPosition: defaultValue.signPosition, //签到位置
                longitude: defaultValue.longitude, //经度
                latitude: defaultValue.latitude,//纬度
                distance: defaultValue.distance,// 签到限制距离
                duration: defaultValue.duration,
                signCaption:defaultValue.signCaption
            });
        }
    }

    set disabled(disabled: boolean) {
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        switch (ReportActivityPage.state) {
            case '待开展': {
                (this.innerCom.time as TimeModule).disabled = false;
                if (this.isFirst){
                    (this.innerCom.signType as SignType).disabled = true;
                    (this.innerCom.add as Button).disabled = true;
                }else{
                    (this.innerCom.signType as SignType).disabled = false;
                    (this.innerCom.add as Button).disabled = false;
                }
            }
                break;
            case '进行中': {
                let currentDisabled = true;
                if (this.isFirst){
                    currentDisabled = false;
                }
                (this.innerCom.time as TimeModule).disabled = currentDisabled;
                (this.innerCom.signType as SignType).disabled = currentDisabled;
                (this.innerCom.add as Button).disabled = currentDisabled;
            }
                break;
            case '报名中': {
                (this.innerCom.time as TimeModule).disabled = false;
                if (this.isFirst){
                    (this.innerCom.signType as SignType).disabled = true;
                    (this.innerCom.add as Button).disabled = true;
                }else{
                    (this.innerCom.signType as SignType).disabled = false;
                    (this.innerCom.add as Button).disabled = false;
                }
            }
                break;
            default: {
                (this.innerCom.time as TimeModule).disabled = disabled;
                (this.innerCom.signType as SignType).disabled = disabled;
                (this.innerCom.add as Button).disabled = disabled;
            }
                break;
        }
    }

    get disabled() {
        return this._disabled;
    }

    set(data: SignContentPara) {
        if (tools.isNotEmpty(data)) {
            (this.innerCom.time as TimeModule).set([data.signStartTime,data.signEndTime]);
            (this.innerCom.signType as SignType).set({
                signType: data.signType, // 签到方式
                signPosition: data.signPosition, //签到位置
                longitude: data.longitude, //经度
                latitude: data.latitude,//纬度
                distance: data.distance,// 签到限制距离
                duration: data.duration,
                signCaption:data.signCaption
            });
        }else{
            (this.innerCom.signType as SignType).set({});
        }
    }

    get() {
        let signType = (this.innerCom.signType as SignType).get();
        if (!!!signType) {
            return false;
        }
        let time = (this.innerCom.time as TimeModule).get();
        if (!!!time) {
            return false;
        }
        let signInItemObj: SignContentPara = Object.assign({
            signStartTime: time[0],
            signEndTime: time[1],
        }, signType);
        return signInItemObj;
    }

}