/// <amd-module name="SignBackItem"/>

import {TimeModule} from "./TimeModule";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import tools = G.tools;
import {SignType} from "./SignType";
import {ActivityRadioModule} from "./ActivityRadioModule";
import {ReportActivityPage} from "../ReportActivityPage";
import d = G.d;

export interface SignBackPara{
    signBack?:number;//是否签退
    signStartTime?: number; //签到开始时间
    signEndTime?: number; //签到结束时间
    signType?: number; // 签到方式
    signPosition?: number; //签到位置
    longitude?: string; //经度
    latitude?: string;//纬度
    distance?: number;// 签到限制距离
    duration?: number; // 二维码有效时间
    signCaption?:string;
}
export class SignBackItem extends Component {
    protected wrapperInit(para: IComponentPara): HTMLElement {
        let signContentWrapper = <div className="sign-back-item">
            <ActivityRadioModule c-var="signBack" title="选择签退" value={["否","是"]}/>
            <div c-var="showContent" className="hide">
                <TimeModule c-var="signBackTime" preAlert="签退" title="签退时间" />
                <div className="sign-type">
                    <SignType c-var="signType" isSignIn={false} />
                </div>
            </div>
        </div>;
        return signContentWrapper;
    }

    constructor(para: IComponentPara) {
        super(para);

        (this.innerCom.signBack as ActivityRadioModule).onChange((e)=>{
            let value = (e.target as HTMLFormElement).value;
            this.innerEl.showContent.classList.toggle('hide',value === '否')
        });
    }

    set disabled(disabled:boolean){
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        (this.innerCom.signBack as ActivityRadioModule).disabled = disabled;
        (this.innerCom.signBackTime as TimeModule).disabled = disabled;
        (this.innerCom.signType as SignType).disabled = disabled;
    }

    set(data:SignBackPara){
        if (tools.isNotEmpty(data)){
            let signBack = Number(data.signBack);
            (this.innerCom.signBack as ActivityRadioModule).set(signBack);
            if (signBack === 1){
                this.innerEl.showContent.classList.remove('hide');
                (this.innerCom.signBackTime as TimeModule).set([data.signStartTime,data.signEndTime]);
                (this.innerCom.signType as SignType).set({
                    signType: data.signType, // 签到方式
                    signPosition: data.signPosition, //签到位置
                    longitude: data.longitude, //经度
                    latitude: data.latitude,//纬度
                    distance: data.distance,// 签到限制距离
                    duration: data.duration,
                    signCaption:data.signCaption
                });
            }
        }else{
            (this.innerCom.signType as SignType).set({});
        }
    }

    get(){
        let signBack = (this.innerCom.signBack as ActivityRadioModule).get();
        if (signBack === 0){
            // 不签退
            ReportActivityPage.reportData.signBack = 0;
            ReportActivityPage.reportData.signBackStartTime = 0;
            ReportActivityPage.reportData.signBackEndTime = 0;
            ReportActivityPage.reportData.longitude = '';
            ReportActivityPage.reportData.latitude = '';
            ReportActivityPage.reportData.signType = 0;
            ReportActivityPage.reportData.distance = 0;
            ReportActivityPage.reportData.signPosition = 0;
            ReportActivityPage.reportData.signCaption = '';
        }else{
            //签退
            ReportActivityPage.reportData.signBack = 1;
            let signBackTime = (this.innerCom.signBackTime as TimeModule).get();
            if (!!!signBackTime){
                return false;
            }
            let signType = (this.innerCom.signType as SignType).get();
            if (!!!signType){
                return false;
            }
            ReportActivityPage.reportData.signBackStartTime = signBackTime[0];
            ReportActivityPage.reportData.signBackEndTime = signBackTime[1];
        }
        return true;
    }
}