/// <amd-module name="SignType"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {SelectInput} from "../../../../../global/components/form/selectInput/selectInput";
import {SignPosition, SignPositionData} from "./SignPosition";
import d = G.d;
import {ReportActivityPage} from "../ReportActivityPage";
import tools = G.tools;
import {LeRule} from "../../../../common/rule/LeRule";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";
import {Utils} from "../../../../common/utils";

export interface SignTypeData {
    signType?: number; // 签到方式
    signPosition?: number; //签到位置
    longitude?: string; //经度
    latitude?: string;//纬度
    distance?: number;// 签到限制距离
    duration?: number;
    signCaption?: string;
}

interface ISignTypePara extends IComponentPara {
    isSignIn?: boolean;
}

export class SignType extends Component {
    private values: string[];
    private isSignIn: boolean;

    protected wrapperInit(para: ISignTypePara): HTMLElement {
        this.values = ["人脸识别", "动态二维码"];
        this.isSignIn = para.isSignIn;
        let date = new Date().getTime(),
            randomStr = this.getRandomStr(),
            r1 = date + randomStr + 'no', r2 = date + randomStr + 'yes',
            name = 'signtype' + randomStr;
        let signTypeWrapper = <div className="sign-type-wrapper lesson-form-group">
            <div className="lesson-label">{para.isSignIn === true ? "签到方式" : "签退方式"}&nbsp;:</div>
            <div className="radio-group sign-type-radio" c-var="group">
                <div className="face">
                    <div className="radio-wrapper">
                        <input type="radio" className="sign-type-radio radio-normal sign-type-radio-input" value="人脸识别"
                               checked name={name}
                               id={r1}/>
                        <label htmlFor={r1}>人脸识别</label>
                    </div>
                    <SignPosition c-var="position" isSignIn={para.isSignIn}/>
                </div>
                <div className="qrcode">
                    <div className="radio-wrapper">
                        <input type="radio" className="sign-type-radio radio-normal sign-type-radio-input" value="动态二维码"
                               name={name}
                               id={r2}/>
                        <label htmlFor={r2}>动态二维码</label>
                    </div>
                    <SelectInput className="hide" c-var='qrCodeTime' dropClassName="sign-type-drop"
                                 placeholder="请选择有效时间"/>
                </div>
            </div>
        </div>;
        return signTypeWrapper;
    }

    constructor(para: ISignTypePara) {
        super(para);
        this.initEvents.on();
    }

    set(data: SignTypeData) {

        if (tools.isNotEmpty(data)) {
            // signType
            let signTypeRadios = d.queryAll('input.sign-type-radio', this.wrapper).map(input => {
                return input as HTMLFormElement;
            });
            (this.innerCom.position as SignPosition).wrapper.classList.toggle('hide', data.signType !== 0);
            (this.innerCom.qrCodeTime as SelectInput).wrapper.classList.toggle('hide', data.signType !== 1);
           let signType = tools.isNotEmpty(data.signType) ? Number(data.signType) : 0;
            signTypeRadios[signType].checked = true;
            if (signType === 0) {
                (this.innerCom.position as SignPosition).set({
                    signPosition: data.signPosition,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    distance: data.distance,
                    signCaption:data.signCaption
                });
            }
        }

        let dropInput = this.innerCom.qrCodeTime as SelectInput;
        LeRule.Ajax.fetch(LE.CONF.ajaxUrl.qrCodeTime).then(({response}) => {
            let dropData = Utils.getDropDownList(response.data.body.dataList, 0);
            if (tools.isNotEmptyArray(dropData)) {
                let da = dropData.map((dropd) => {
                    return dropd + 's';
                });
                dropInput.setPara({data: da});
                dropInput.set(da[0]);
            }
            if (tools.isNotEmpty(data) && data.signType === 1) {
                dropInput.set(data.duration + 's');
            }
        }).catch(() => {
            Modal.alert('获取二维码有效时间失败!');
        })
    }

    get() {
        if (this.isSignIn === true) {
            let signType = this.values.indexOf((d.query('input.sign-type-radio:checked', this.wrapper) as HTMLFormElement).value),
                duration = '',
                latitude = '',
                longitude = '',
                distance = 0,
                signPosition = 0,
                signCaption = '';
            if (signType === 0) {
                // 人脸识别
                let position = (this.innerCom.position as SignPosition).get();
                if (!!!position) {
                    return false;
                }
                position = position as SignPositionData;
                latitude = position.latitude;
                longitude = position.longitude;
                distance = position.distance;
                signPosition = position.signPosition;
                signCaption = position.signCaption;
            } else {
                // 动态二维码
                let du = (this.innerCom.qrCodeTime as SelectInput).get();
                duration = du.slice(0,du.length - 1);
            }
            return {
                signType: signType,
                signPosition: signPosition,
                distance: distance,
                latitude: latitude,
                longitude: longitude,
                duration: duration,
                signCaption:signCaption
            };
        } else {
            let signType = this.values.indexOf((d.query('input.sign-type-radio:checked', this.wrapper) as HTMLFormElement).value);
            if (signType === 0) {
                // 人脸识别
                ReportActivityPage.reportData.duration = 0;// 二维码有效时间设置空值
                let position = (this.innerCom.position as SignPosition).get();
                if (!!!position) {
                    return false;
                }
                ReportActivityPage.reportData.duration = 0;
            } else {
                // 动态二维码
                ReportActivityPage.reportData.latitude = '';
                ReportActivityPage.reportData.longitude = '';
                ReportActivityPage.reportData.distance = 0;
                ReportActivityPage.reportData.signPosition = 0;
                ReportActivityPage.reportData.signCaption = '';
                let durationStr = (this.innerCom.qrCodeTime as SelectInput).get(),
                    duration = parseInt(durationStr.substr(0, durationStr.length - 1));
                ReportActivityPage.reportData.duration = duration;
            }
            ReportActivityPage.reportData.signType = signType;
            return true;
        }
    }

    private getRandomStr() {
        let str = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let pwd = '';
        for (let i = 0; i < 5; i++) {
            pwd += str.charAt(Math.floor(Math.random() * str.length));
        }
        return pwd;
    }

    private initEvents = (() => {
        let inputChangeEvent = (e) => {
            let value = (e.target as HTMLFormElement).value;
            (this.innerCom.position as SignPosition).wrapper.classList.toggle('hide', value !== '人脸识别');
            (this.innerCom.qrCodeTime as SelectInput).wrapper.classList.toggle('hide', value !== '动态二维码');
        };
        return {
            on: () => {
                d.on(this.wrapper, 'change', 'input.sign-type-radio-input', inputChangeEvent);
            },
            off: () => {
                d.off(this.wrapper, 'change', 'input.sign-type-radio-input', inputChangeEvent);
            }
        }
    })();

    set disabled(disabled:boolean){
        if (tools.isEmpty(disabled)){
            return;
        }
        this._disabled = disabled;
        this.innerEl.group.classList.toggle('disabled',disabled);
    }

    destroy() {
        super.destroy();
        this.initEvents.off();
    }
}