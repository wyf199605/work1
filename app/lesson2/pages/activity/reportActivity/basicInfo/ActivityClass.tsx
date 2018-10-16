/// <amd-module name="ActivityClass"/>
import Component = G.Component;
import {BasicInfoDropDown} from "./BasicInfoDropDown";
import {BasicInfoInput} from "./BasicInfoInput";
import {Sponsor} from "./Sponsor";
import {BasicInfoTextarea} from "./BasicInfoTextarea";
import {Button} from "../../../../../global/components/general/button/Button";
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {ReportUploadModule} from "./ReportUploadModule";
import {Charge} from "./Charge";
import {ReportActivityPage} from "../ReportActivityPage";
import {ActivityType} from "./ActivityType";
import {BackBasicInfoPara, SponsorPara} from "../ReportActivityData";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";

interface IActivityClassPara extends IComponentPara {
    nextHandler?: () => void;
    isNotShow?: boolean;
}

export class ActivityClass extends Component {
    protected wrapperInit(para: IActivityClassPara): HTMLElement {
        let activityClassWrapper = <div className="activity-type">
            <div className="row many-sub not-focus">
                <BasicInfoDropDown field="activityLevel" linkUrl={LE.CONF.ajaxUrl.activityLevel} c-var="activityLevel"
                                   defaultValue="请选择活动级别"
                                   dropData={["请选择活动级别"]} title="活动级别"
                                   isRequired={true}
                                   dropClassName="many-sub-dropdown"/>
            </div>
            <div className="row many-sub not-focus">
                <BasicInfoDropDown field="activityAttribution" linkUrl={LE.CONF.ajaxUrl.activityAttribution}
                                   c-var="activityAttribution" defaultValue="请选择活动归属"
                                   dropData={["请选择活动归属"]} title="活动归属"
                                   isRequired={true}
                                   dropClassName="many-sub-dropdown"/>
            </div>
            <div className="row many-sub not-focus">
                <ActivityType c-var="activityType"/>
            </div>
            <div className="row">
                <BasicInfoInput c-var="activityName" title="活动名称" isRequired={true}/>
            </div>
            <Sponsor c-var="sponsor" isRequired={true} title="主办方"/>
            <Sponsor c-var="contractor" isRequired={false} title="承办方"/>
            <Sponsor c-var="assist" isRequired={false} title="协办方"/>
            <div className="row">
                <BasicInfoInput c-var="slogan" title="活动口号" isRequired={false}/>
            </div>
            <div className="row">
                <BasicInfoInput c-var="address" title="地址" isRequired={true}/>
            </div>
            <Charge c-var="charge"/>
            <div className="row">
                <BasicInfoTextarea c-var="courseDescription" title="课程介绍" isRequired={true}/>
            </div>
            <ReportUploadModule field="COVERPICTURE" nameField="coverPicture" isExcel={false} preTitle="封面图"
                                isShowImg={true} c-var="coverPicture" title="封面图片" isRequired={true} content="选择文件"
                                remark="备注：请配一张图片作为课程封面，长宽最佳比例为2：1" remarkClassName="remark"/>
            <div className="row">
                <BasicInfoInput c-var="remind" title="提醒内容" isRequired={false}/>
            </div>
            <ReportUploadModule field="ACCESSORY" nameField="accessory" isExcel={true} preTitle="附件" isShowImg={false}
                                c-var="accessory" title="附件上传" isRequired={false} content="选择文件" remark="支持格式为：DOC、PPT、PDF、JPG、PNG、ZIP、RAR"/>
            <div className="row">
                <BasicInfoInput c-var="remark" title="备注" isRequired={false}/>
            </div>
            <div className="row btns">
                <div className="lesson-form-group" data-name="nextBtn">
                    <Button className="nextBtn" content="保存并下一步" onClick={() => {
                        para.nextHandler();
                    }}/>
                </div>
            </div>
        </div>;
        return activityClassWrapper;
    }

    constructor(para: IActivityClassPara) {
        super(para);
        this.isNotShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
    }

    private _isNotShow: boolean;
    set isNotShow(show: boolean) {
        this._isNotShow = show;
        this.wrapper.classList.toggle('hide', show);
    }

    get isNotShow() {
        return this._isNotShow;
    }

    set disabled(dis: boolean) {
        if(tools.isNotEmpty(dis)){
            this._disabled = dis;
            (this.innerCom.activityLevel as BasicInfoDropDown).disabled = dis;
            (this.innerCom.activityAttribution as BasicInfoDropDown).disabled = dis;
            (this.innerCom.activityType as ActivityType).disabled = dis;
            (this.innerCom.activityName as BasicInfoInput).disabled = dis;
            (this.innerCom.sponsor as Sponsor).disabled = dis;
            (this.innerCom.contractor as Sponsor).disabled = dis;
            (this.innerCom.assist as Sponsor).disabled = dis;
            (this.innerCom.slogan as BasicInfoInput).disabled = dis;
            (this.innerCom.address as BasicInfoInput).disabled = dis;
            (this.innerCom.charge as Charge).disabled = dis;
            (this.innerCom.courseDescription as BasicInfoTextarea).disabled = dis;
            (this.innerCom.coverPicture as ReportUploadModule).disabled = dis;
            (this.innerCom.remind as BasicInfoInput).disabled = dis;
            (this.innerCom.accessory as ReportUploadModule).disabled = dis;
            (this.innerCom.remark as BasicInfoInput).disabled = dis;
        }
    }

    get disabled() {
        return this._disabled;
    }

    set(data: BackBasicInfoPara) {
        if (tools.isNotEmpty(data)) {
            (this.innerCom.activityLevel as BasicInfoDropDown).set(data.activity.activityLevel);
            (this.innerCom.activityAttribution as BasicInfoDropDown).set(data.activity.activityAttribution);
            (this.innerCom.activityType as ActivityType).set([data.activity.activityPlatform, data.activity.platformCategory, data.activity.activityPlatformName, data.activity.platformCategoryName]);
            (this.innerCom.activityName as BasicInfoInput).set(data.activity.activityName);
            (this.innerCom.sponsor as Sponsor).set(data.sponsor);
            (this.innerCom.contractor as Sponsor).set(data.contractor);
            (this.innerCom.assist as Sponsor).set(data.assist);
            (this.innerCom.slogan as BasicInfoInput).set(data.activity.slogan);
            (this.innerCom.address as BasicInfoInput).set(data.activity.address);
            (this.innerCom.charge as Charge).set(data.charge);
            (this.innerCom.courseDescription as BasicInfoTextarea).set(data.activity.courseDescription);
            (this.innerCom.coverPicture as ReportUploadModule).set(data.activity.coverPicture);
            (this.innerCom.remind as BasicInfoInput).set(data.activity.remind);
            (this.innerCom.accessory as ReportUploadModule).set(data.activity.accessory);
            (this.innerCom.remark as BasicInfoInput).set(data.activity.remark);
        } else {
            (this.innerCom.activityLevel as BasicInfoDropDown).set('');
            (this.innerCom.activityAttribution as BasicInfoDropDown).set('');
        }
    }

    get() {
        // 活动级别
        let activityLevel = (this.innerCom.activityLevel as BasicInfoDropDown).get();
        if (activityLevel === false) {
            return false
        }

        // 活动归属
        let activityAttribution = (this.innerCom.activityAttribution as BasicInfoDropDown).get();
        if (activityAttribution === false) {
            return false;
        }
        // 活动分类
        let activityType = (this.innerCom.activityType as ActivityType).get();
        if (activityType === false) {
            return;
        }

        //活动名称
        let activityName = (this.innerCom.activityName as BasicInfoInput).get();
        if (activityName === false) {
            return false
        }
        //主办方
        let sponsor = (this.innerCom.sponsor as Sponsor).get();
        if (sponsor === false) {
            return false
        }
        //承办方
        let contractor = (this.innerCom.contractor as Sponsor).get();
        let assist = (this.innerCom.assist as Sponsor).get();
        //活动口号
        let slogan = (this.innerCom.slogan as BasicInfoInput).get();

        // 联系人
        let charge = (this.innerCom.charge as Charge).get();

        // 地址
        let address = (this.innerCom.address as BasicInfoInput).get();
        if (address === false) {
            return false
        }

        // 课程介绍
        let courseDescription = (this.innerCom.courseDescription as BasicInfoTextarea).get();
        if (courseDescription === false) {
            return false
        }

        // 封面图片
        let coverPicture = (this.innerCom.coverPicture as ReportUploadModule).get();
        if (coverPicture === false) {
            Modal.alert('封面图片不能为空!');
            return false;
        }

        // 提醒内容
        let remind = (this.innerCom.remind as BasicInfoInput).get();
        // 附件
        let accessory = (this.innerCom.accessory as ReportUploadModule).get();
        //备注
        let remark = (this.innerCom.remark as BasicInfoInput).get();

        ReportActivityPage.reportData.activityLevel = activityLevel;
        ReportActivityPage.reportData.activityAttribution = activityAttribution;
        ReportActivityPage.reportData.activityPlatform = activityType.activityPlatform;
        ReportActivityPage.reportData.platformCategory = activityType.platformCategory;
        ReportActivityPage.reportData.activityName = activityName;
        ReportActivityPage.reportData.address = address;
        ReportActivityPage.reportData.courseDescription = courseDescription;
        ReportActivityPage.reportData.remark = remark;
        ReportActivityPage.reportData.slogan = slogan;
        ReportActivityPage.reportData.remind = remind;
        ReportActivityPage.reportData.coverPicture = coverPicture;
        ReportActivityPage.reportData.accessory = accessory as string;
        ReportActivityPage.reportData.sponsor = sponsor;
        ReportActivityPage.reportData.assist = assist as SponsorPara[];
        ReportActivityPage.reportData.contractor = contractor as SponsorPara[];
        ReportActivityPage.reportData.charge = charge;

        // 课程类独有字段设置为空值
        ReportActivityPage.reportData.teacherInfo = {
            teacherPosition: '',
            teacherName: '',
            teacherId: ''
        };
        return true;
    }
}