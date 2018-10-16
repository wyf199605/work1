/// <amd-module name="CourseClass"/>
import Component = G.Component;
import {BasicInfoDropDown} from "./BasicInfoDropDown";
import {BasicInfoInput} from "./BasicInfoInput";
import {BasicInfoTextarea} from "./BasicInfoTextarea";
import {Button} from "../../../../../global/components/general/button/Button";
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {ReportUploadModule} from "./ReportUploadModule";
import {ReportActivityPage} from "../ReportActivityPage";
import {SelectTeacher} from "./SelectTeacher";
import {ActivityType} from "./ActivityType";
import {Charge} from "./Charge";
import {BackBasicInfoPara} from "../ReportActivityData";
import {Modal} from "../../../../../global/components/feedback/modal/Modal";

interface ICourseClassPara extends IComponentPara {
    nextHandler?: () => void;
    isNotShow?: boolean;
}

export class CourseClass extends Component {
    protected wrapperInit(para: ICourseClassPara): HTMLElement {
        let activityClassWrapper = <div className="course-type">
            <div className="row many-sub not-focus">
                <BasicInfoDropDown field="activityLevel" linkUrl={LE.CONF.ajaxUrl.activityLevel} c-var="activityLevel"
                                   defaultValue="请选择活动级别"
                                   dropData={["请选择活动级别", '1', '2']} title="活动级别"
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
                <BasicInfoInput c-var="activityName" title="课程名称" isRequired={true}/>
            </div>
            <div className="row">
                <BasicInfoInput c-var="address" title="地址" isRequired={true}/>
            </div>
            <Charge c-var="charge"/>
            <div className="row">
                <SelectTeacher c-var="teacherInfo"/>
            </div>
            <div className="row">
                <BasicInfoTextarea c-var="courseDescription" title="课程介绍" isRequired={true}/>
            </div>
            <ReportUploadModule field="COVERPICTURE" nameField="coverPicture" isExcel={false} preTitle="封面图片"
                                isShowImg={true} c-var="coverPicture" title="封面图片" isRequired={true} content="选择文件"
                                remark="备注：请配一张图片作为课程封面，长宽最佳比例为2：1" remarkClassName="remark"/>
            <div className="row">
                <BasicInfoInput c-var="remind" title="提醒内容" isRequired={false}/>
            </div>
            <ReportUploadModule field="ACCESSORY" nameField="accessory" isExcel={true} preTitle="附件" c-var="accessory"
                                title="附件上传" isRequired={false} content="选择文件" remark="支持格式为：DOC、PPT、PDF、JPG、PNG、ZIP、RAR"/>
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

    constructor(para: ICourseClassPara) {
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

    set(data: BackBasicInfoPara) {
        if (tools.isNotEmpty(data)) {
            (this.innerCom.activityLevel as BasicInfoDropDown).set(data.activity.activityLevel);
            (this.innerCom.activityAttribution as BasicInfoDropDown).set(data.activity.activityAttribution);
            (this.innerCom.activityType as ActivityType).set([data.activity.activityPlatform, data.activity.platformCategory, data.activity.activityPlatformName, data.activity.platformCategoryName]);
            (this.innerCom.activityName as BasicInfoInput).set(data.activity.activityName);
            (this.innerCom.address as BasicInfoInput).set(data.activity.address);
            (this.innerCom.teacherInfo as SelectTeacher).set({
                teacherId: data.activity.teacherId,
                teacherName: data.activity.teacherName,
                teacherPosition: data.activity.teacherPosition
            });
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
            return false;
        }
        //课程名称
        let activityName = (this.innerCom.activityName as BasicInfoInput).get();
        if (activityName === false) {
            return false;
        }

        // 教师
        let teacherInfo = (this.innerCom.teacherInfo as SelectTeacher).get();
        if (teacherInfo === false) {
            return false;
        }

        // 地址
        let address = (this.innerCom.address as BasicInfoInput).get();
        if (address === false) {
            return false
        }
        // 联系人
        let charge = (this.innerCom.charge as Charge).get();

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
        ReportActivityPage.reportData.teacherInfo = teacherInfo;
        ReportActivityPage.reportData.activityName = activityName;
        ReportActivityPage.reportData.address = address;
        ReportActivityPage.reportData.charge = charge;
        ReportActivityPage.reportData.coverPicture = coverPicture;
        ReportActivityPage.reportData.accessory = accessory as string;
        ReportActivityPage.reportData.courseDescription = courseDescription;
        ReportActivityPage.reportData.remark = remark;
        ReportActivityPage.reportData.remind = remind;

        // 活动类独有属性设置为空值
        ReportActivityPage.reportData.sponsor = [];
        ReportActivityPage.reportData.contractor = [];
        ReportActivityPage.reportData.assist = [];
        return true;
    }

    set disabled(dis: boolean) {
        if(tools.isEmpty(dis)){
            return;
        }
        this._disabled = dis;
        (this.innerCom.activityLevel as BasicInfoDropDown).disabled = dis;
        (this.innerCom.activityAttribution as BasicInfoDropDown).disabled = dis;
        (this.innerCom.activityType as ActivityType).disabled = dis;
        (this.innerCom.activityName as BasicInfoInput).disabled = dis;
        (this.innerCom.address as BasicInfoInput).disabled = dis;
        (this.innerCom.teacherInfo as SelectTeacher).disabled = dis;
        (this.innerCom.charge as Charge).disabled = dis;
        (this.innerCom.courseDescription as BasicInfoTextarea).disabled = dis;
        (this.innerCom.coverPicture as ReportUploadModule).disabled = dis;
        (this.innerCom.remind as BasicInfoInput).disabled = dis;
        (this.innerCom.accessory as ReportUploadModule).disabled = dis;
        (this.innerCom.remark as BasicInfoInput).disabled = dis;
    }

    get disabled() {
        return this._disabled;
    }
}