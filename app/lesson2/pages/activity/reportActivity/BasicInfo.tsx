/// <amd-module name="BasicInfo"/>

import d = G.d;

import tools = G.tools;

import {ActivityRadioModule} from "./ruleSetting/ActivityRadioModule";

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {ActivityClass} from "./basicInfo/ActivityClass";
import {CourseClass} from "./basicInfo/CourseClass";
import {ReportActivityPage} from "./ReportActivityPage";
import {BackBasicInfoPara} from "./ReportActivityData";


interface IBasicInfoPara extends IComponentPara {
    isNotShow?: boolean;
    clickHandler?: () => void;
}

export class BasicInfo extends Component {
    protected wrapperInit(para: IBasicInfoPara): HTMLElement {
        let basicInfoWrapper = <div className="basicInfo step-content-item">
            <div className="row">
                <ActivityRadioModule c-var="activityCategory" title="活动类别" isRequired={true} value={['活动类', '课程类']}
                                     field="activityCatorygory"/>
            </div>
            <ActivityClass isNotShow={false} c-var="activityClass" nextHandler={() => {
                let isValidate = this.get();
                if (isValidate) {
                    para.clickHandler();
                }
                // para.clickHandler();
            }}/>
            <CourseClass isNotShow={true} c-var="courseClass" nextHandler={() => {
                let isValidate = this.get();
                if (isValidate) {
                    para.clickHandler();
                }
            }}/>
        </div>;
        return basicInfoWrapper;
    }

    constructor(para: IBasicInfoPara) {
        super(para);
        this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
        (this.innerCom.activityCategory as ActivityRadioModule).onChange((e) => {
            let input = e.target as HTMLFormElement,
                value = input.value;
            if (value === '活动类') {
                (this.innerCom.activityClass as ActivityClass).isNotShow = false;
                (this.innerCom.courseClass as CourseClass).isNotShow = true;
            } else {
                (this.innerCom.activityClass as ActivityClass).isNotShow = true;
                (this.innerCom.courseClass as CourseClass).isNotShow = false;
            }
        });
    }

    private _isShow: boolean;
    set isShow(show: boolean) {
        this._isShow = show;
        this.wrapper.classList.toggle('hide', show);
    }

    get isShow() {
        return this._isShow;
    }

    get() {
        // 活动类别
        let activityCategory = (this.innerCom.activityCategory as ActivityRadioModule).get();
        ReportActivityPage.reportData.activityCategory = activityCategory;
        if (activityCategory === 0) {
            return (this.innerCom.activityClass as ActivityClass).get();
        } else {
            return (this.innerCom.courseClass as CourseClass).get();
        }
    }

    set(basicInfo: BackBasicInfoPara) {
        if (tools.isNotEmpty(basicInfo)) {
            (this.innerCom.activityCategory as ActivityRadioModule).set(Number(basicInfo.activity.activityCategory));
            if (Number(basicInfo.activity.activityCategory) === 0) {
                (this.innerCom.activityClass as ActivityClass).set(basicInfo);
                (this.innerCom.courseClass as CourseClass).set({});
                (this.innerCom.courseClass as CourseClass).isNotShow = true;
                (this.innerCom.activityClass as ActivityClass).isNotShow = false;
            } else {
                (this.innerCom.activityClass as ActivityClass).set({});
                (this.innerCom.courseClass as CourseClass).set(basicInfo);
                (this.innerCom.courseClass as CourseClass).isNotShow = false;
                (this.innerCom.activityClass as ActivityClass).isNotShow = true;
            }
        } else {
            (this.innerCom.courseClass as CourseClass).set({});
            (this.innerCom.activityClass as ActivityClass).set({});
        }
        let states = ['草稿','新增','不通过'];
        if (states.indexOf(ReportActivityPage.state) >= 0) {
            this.disabled = false;
        } else {
            this.disabled = true;
        }
    }

    set disabled(dis: boolean) {
        if (tools.isNotEmpty(dis)){
            this._disabled = dis;
            (this.innerCom.activityCategory as ActivityRadioModule).disabled = dis;
            (this.innerCom.activityClass as ActivityClass).disabled = dis;
            (this.innerCom.courseClass as CourseClass).disabled = dis;
        }
    }

    get disabled() {
        return this._disabled;
    }

    destroy() {
        super.destroy();
    }
}