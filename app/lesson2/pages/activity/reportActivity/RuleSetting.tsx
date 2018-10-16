/// <amd-module name="RuleSetting"/>

import Component = G.Component;
import IComponentPara = G.IComponentPara;
import tools = G.tools;
import {TimeModule} from "./ruleSetting/TimeModule";
import {ActivityRadioModule} from "./ruleSetting/ActivityRadioModule";
import {ImportNameList} from "./ruleSetting/ImportNameList";
import {DeadlineModule} from "./ruleSetting/DeadlineModule";
import {Button} from "../../../../global/components/general/button/Button";
import {SignInModule} from "./ruleSetting/SignInModule";
import {SignBackModule} from "./ruleSetting/SignBackModule";
import {IsSignBack} from "./ruleSetting/IsSignBack";
import {ReportActivityPage} from "./ReportActivityPage";
import {ControllerTypePara, RuleSettingPara, SignContentPara, StudentPara} from "./ReportActivityData";
import {Roles} from "./ruleSetting/Roles";
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {CancelTimeModule} from "./ruleSetting/CancelTimeModule";
import {LeRule} from "../../../common/rule/LeRule";
import {buttonAction} from "../../../modules/LeButton/LeButtonGroup";

interface IRuleSettingPara extends IComponentPara {
    isNotShow?: boolean;
    preStepHandler?: () => void;
    nextStepHandler?: () => void;
}

export class RuleSetting extends Component {
    protected wrapperInit(para: IRuleSettingPara): HTMLElement {
        let ruleSettingWrapper = <div className="rule-setting step-content-item">
            <TimeModule c-var="activityTime" isRequired={true} preAlert="活动" title="活动时间"/>
            <TimeModule c-var="applicationTime" isRequired={true} preAlert="报名" title="报名时间"/>
            <IsSignBack c-var="signBack" isRequired={true} title="签到类型" itemArr={['签到', '签退']} changeItems={(index) => {
                (this.innerCom.signIn as SignInModule).wrapper.classList.toggle('hide', index !== 0);
                (this.innerCom.signBack as SignBackModule).wrapper.classList.toggle('hide', index === 0);
            }}/>
            <div className="sign-content">
                <SignInModule c-var="signIn"/>
                <SignBackModule c-var="signBack"/>
            </div>
            <CancelTimeModule title="活动补签" c-var="activityRetroactive" field="ActivityRetroactive" value={['否', '是']}
                              timeTile="活动补签时间"/>
            <CancelTimeModule title="活动取消" c-var="activityCancel" field="ActivityCancel" value={['否', '是']}
                              timeTile="活动取消时间"/>
            <Roles c-var="roles"/>
            <ImportNameList title="导入活动名单" c-var="activitiesList" field="activityList" value={['否', '是']}/>
            <CancelTimeModule title="角色取消" c-var="roleCancel" field="roleCancel" value={['否', '是']} timeTile="角色取消时间"/>
            <div className="row">
                <ActivityRadioModule c-var="activityComment" isRequired={true} title="活动评价" field="activityComment"
                                     value={['强制评价', '开放评价']}/>
            </div>
            <DeadlineModule c-var="commentEndTime"/>
            <div className="row btns">
                <div className="lesson-form-group">
                    <Button content="上一步" onClick={function () {
                        para.preStepHandler();
                    }} className="preBtn nextBtn"/>
                    <Button content="保存并下一步" className="nextBtn" onClick={() => {
                        let isValidate = this.get();
                        if (isValidate) {
                            if (ReportActivityPage.reportData.activitiesList === 1) {
                                let activityList = ReportActivityPage.reportData.activitieList;
                                if (tools.isEmpty(activityList)) {
                                    Modal.alert('请导入活动名单');
                                    return;
                                }
                                Modal.confirm({
                                    msg: '确认跳过第三步？',
                                    title: '提示',
                                    btns:['取消','发布'],
                                    callback: (flag => {
                                        if (flag === true) {
                                            // 直接提交，不需要进行第三步
                                            let para = ReportActivityPage.reportData.get(),
                                                type = 'PUT';
                                            delete para.objectSetting;
                                            if (ReportActivityPage.state === '不通过' || ReportActivityPage.state === '草稿') {
                                                para.baseInfo.activity['activityId'] = ReportActivityPage.activityId;
                                                type = 'POST';
                                            }
                                            LeRule.Ajax.fetch(LE.CONF.ajaxUrl.activityDetail + '?activity_status_id=1', {
                                                type: type,
                                                data: para
                                            }).then(({response}) => {
                                                Modal.toast(response.msg);
                                                buttonAction.btnRefresh(3);
                                            });
                                        }
                                    })
                                })
                            } else {
                                ReportActivityPage.reportData.activitiesList = 0;
                                ReportActivityPage.reportData.activitieList = [];
                                para.nextStepHandler();
                            }
                        }
                        // para.nextStepHandler();
                    }}/>
                </div>
            </div>
        </div>;
        return ruleSettingWrapper;
    }

    constructor(para: IRuleSettingPara) {
        super(para);
        this.isShow = tools.isNotEmpty(para.isNotShow) ? para.isNotShow : false;
    }

    private _isShow: boolean;
    set isShow(show: boolean) {
        this._isShow = show;
        this.wrapper.classList.toggle('hide', show);
    }

    get isShow() {
        return this._isShow;
    }

    set(data: RuleSettingPara) {
        if (tools.isNotEmpty(data)) {
            (this.innerCom.activityTime as TimeModule).set([data.rule.activityBeginTime, data.rule.activityEndTime]);
            (this.innerCom.applicationTime as TimeModule).set([data.rule.applicationBeginTime, data.rule.applicationEndTime]);
            (this.innerCom.signIn as SignInModule).set(data.signContent);
            (this.innerCom.signBack as SignBackModule).set({
                signBack: data.rule.signBack,
                signStartTime: data.rule.signBackStartTime,
                signEndTime: data.rule.signBackEndTime,
                latitude: data.rule.latitude,
                longitude: data.rule.longitude,
                signPosition: data.rule.signPosition,
                signType: data.rule.signType,
                distance: data.rule.distance,
                duration: data.rule.duration
            });
            (this.innerCom.activityRetroactive as CancelTimeModule).set({
                index: Number(data.rule.activityRetroactive),
                startTime: data.rule.activityRetroBeginTime,
                endTime: data.rule.activityRetroEndTime
            });
            (this.innerCom.activityCancel as CancelTimeModule).set({
                index: Number(data.rule.activityCancel),
                startTime: data.rule.activityCancelBeginTime,
                endTime: data.rule.activityCancelEndTime
            });
            (this.innerCom.roles as Roles).set({
                controllerType: data.controllerType,
                controller: data.controller,
                organizerType: data.organizerType,
                organizer: data.organizer,
                participant: data.participant,
                participantType: data.participantType
            });
            (this.innerCom.activitiesList as ImportNameList).set(data.rule.activitiesList, data.activitieList);
            (this.innerCom.roleCancel as CancelTimeModule).set({
                index: Number(data.rule.roleCancel),
                startTime: data.rule.roleCancelBeginTime,
                endTime: data.rule.roleCancelEndTime
            });
            (this.innerCom.activityComment as ActivityRadioModule).set(data.rule.activityComment);
            (this.innerCom.commentEndTime as DeadlineModule).set(data.rule.commentEndTime);
        } else {
            (this.innerCom.signIn as SignInModule).set([]);
            (this.innerCom.signBack as SignBackModule).set({});
        }

        let states = ['草稿', '新增', '不通过'];
        if (states.indexOf(ReportActivityPage.state) >= 0) {
            this.disabled = false;
        } else {
            this.disabled = true;
        }
    }

    get() {
        // 活动时间
        let activityTime = (this.innerCom.activityTime as TimeModule).get();
        if (!!!activityTime) {
            return false;
        }

        // 报名时间
        let applicationTime = (this.innerCom.applicationTime as TimeModule).get();
        if (!!!applicationTime) {
            return false;
        }

        // 签退
        let signBack = (this.innerCom.signBack as SignBackModule).get();
        if (!!!signBack) {
            return false;
        }

        // 签到
        let signIn = (this.innerCom.signIn as SignInModule).get();
        if (!!!signIn) {
            return false;
        }

        // 角色
        let roles = (this.innerCom.roles as Roles).get();
        if (!!!roles) {
            return false;
        }

        // 活动补签
        let activityRetroactive = (this.innerCom.activityRetroactive as CancelTimeModule).get();
        if (!!!activityRetroactive) {
            return false;
        }
        if (activityRetroactive.radio === 1) {
            if (activityRetroactive.startTime < activityTime[1]) {
                Modal.alert('活动补签时间应在活动结束后！');
                return false;
            }
        }

        // 活动取消
        let activityCancel = (this.innerCom.activityCancel as CancelTimeModule).get();
        if (!!!activityCancel) {
            return false;
        }
        if (activityCancel.radio === 1) {
            if (activityCancel.endTime > activityTime[0]) {
                Modal.alert('活动取消时间应在活动开始前！');
                return false;
            }
        }

        // 活动名单
        let nameList = (this.innerCom.activitiesList as ImportNameList).get();

        // 角色取消
        let roleCancel = (this.innerCom.roleCancel as CancelTimeModule).get();
        if (!!!roleCancel) {
            return false;
        }
        if (roleCancel.radio === 1) {
            if (roleCancel.endTime > activityTime[0]) {
                Modal.alert('角色取消时间应在活动开始前！');
                return false;
            }
        }

        let len = signIn.length - 1;
        for (let i = len; i >= 0; i--) {
            let signItem:SignContentPara = signIn[i];
            for (let j = i - 1; j >= 0; j--) {
                let compareItem:SignContentPara = signIn[j];
                if (signItem.signStartTime < compareItem.signStartTime && signItem.signEndTime > compareItem.signStartTime){
                    Modal.alert('签到时间不能重叠!');
                    return false;
                }
                if (signItem.signStartTime < compareItem.signEndTime && signItem.signEndTime > compareItem.signEndTime){
                    Modal.alert('签到时间不能重叠!');
                    return false;
                }
            }
        }
        // 活动评论
        let activityComment = (this.innerCom.activityComment as ActivityRadioModule).get();

        // 活动评论截止时间
        let commentEndTime = (this.innerCom.commentEndTime as DeadlineModule).get();
        if (commentEndTime === false) {
            return false;
        }
        // 报名时间应该在开课时间之前
        if (applicationTime[1] > activityTime[0]) {
            Modal.alert('报名时间应在开课时间前!');
            return false;
        }

        // 签到时间应在报名时间之后
        for (let i = 0; i < signIn.length; i++) {
            let sign = signIn[i] as SignContentPara;
            if (sign.signStartTime < applicationTime[1]) {
                Modal.alert('签到时间应在报名时间后!');
                return false;
            }
        }

        if (commentEndTime < activityTime[1]) {
            Modal.alert('评论截止时间应在活动结束时间后!');
            return false;
        }

        ReportActivityPage.reportData.activityBeginTime = activityTime[0];
        ReportActivityPage.reportData.activityEndTime = activityTime[1];
        ReportActivityPage.reportData.applicationBeginTime = applicationTime[0];
        ReportActivityPage.reportData.applicationEndTime = applicationTime[1];
        ReportActivityPage.reportData.activityRetroactive = activityRetroactive.radio;
        ReportActivityPage.reportData.activityRetroBeginTime = activityRetroactive.startTime;
        ReportActivityPage.reportData.activityRetroEndTime = activityRetroactive.endTime;
        ReportActivityPage.reportData.activityCancel = activityCancel.radio;
        ReportActivityPage.reportData.activityCancelBeginTime = activityCancel.startTime;
        ReportActivityPage.reportData.activityCancelEndTime = activityCancel.endTime;
        ReportActivityPage.reportData.activitiesList = nameList.activitiesList;
        ReportActivityPage.reportData.activitieList = nameList.activitieList;
        ReportActivityPage.reportData.roleCancel = roleCancel.radio;
        ReportActivityPage.reportData.roleCancelBeginTime = roleCancel.startTime;
        ReportActivityPage.reportData.roleCancelEndTime = roleCancel.endTime;
        ReportActivityPage.reportData.activityComment = activityComment;
        ReportActivityPage.reportData.commentEndTime = commentEndTime;
        ReportActivityPage.reportData.signContent = signIn;
        ReportActivityPage.reportData.controller = roles.contorller.students as StudentPara[];
        ReportActivityPage.reportData.controllerType = roles.contorller.type as ControllerTypePara;
        ReportActivityPage.reportData.organizer = roles.organizer.students as StudentPara[];
        ReportActivityPage.reportData.organizerType = roles.organizer.type as ControllerTypePara;
        ReportActivityPage.reportData.participant = roles.participant.students as StudentPara[];
        ReportActivityPage.reportData.participantType = roles.participant.type as ControllerTypePara;
        return true;
    }

    set disabled(disabled: boolean) {
        if (tools.isEmpty(disabled)) {
            return;
        }
        this._disabled = disabled;
        (this.innerCom.activitiesList as ImportNameList).disabled = disabled;
        (this.innerCom.roles as Roles).disabled = disabled;
        switch (ReportActivityPage.state) {
            case '已结束': {
                // 可编辑
                (this.innerCom.activityRetroactive as CancelTimeModule).disabled = false;
                (this.innerCom.signBack as SignBackModule).disabled = false;
                (this.innerCom.activityComment as ActivityRadioModule).disabled = false;
                (this.innerCom.commentEndTime as DeadlineModule).disabled = false;

                // 不可编辑
                (this.innerCom.activityTime as TimeModule).disabled = true;
                (this.innerCom.applicationTime as TimeModule).disabled = true;
                (this.innerCom.signIn as SignInModule).disabled = true;
                (this.innerCom.activityCancel as CancelTimeModule).disabled = true;
                (this.innerCom.roleCancel as CancelTimeModule).disabled = true;
            }
                break;
            case '待开展': {
                (this.innerCom.applicationTime as TimeModule).disabled = true;
                (this.innerCom.activityTime as TimeModule).disabled = false;
                (this.innerCom.activityRetroactive as CancelTimeModule).disabled = false;
                (this.innerCom.signBack as SignBackModule).disabled = false;
                (this.innerCom.activityCancel as CancelTimeModule).disabled = false;
                (this.innerCom.roleCancel as CancelTimeModule).disabled = false;
                (this.innerCom.activityComment as ActivityRadioModule).disabled = false;
                (this.innerCom.commentEndTime as DeadlineModule).disabled = false;
                // 需内部判断
                (this.innerCom.signIn as SignInModule).disabled = true;
            }
                break;
            case '进行中': {
                (this.innerCom.applicationTime as TimeModule).disabled = true;
                (this.innerCom.activityTime as TimeModule).disabled = false;
                (this.innerCom.activityRetroactive as CancelTimeModule).disabled = false;
                (this.innerCom.signBack as SignBackModule).disabled = false;
                (this.innerCom.activityCancel as CancelTimeModule).disabled = true;
                (this.innerCom.roleCancel as CancelTimeModule).disabled = true;
                (this.innerCom.activityComment as ActivityRadioModule).disabled = false;
                (this.innerCom.commentEndTime as DeadlineModule).disabled = false;
                // 需内部判断
                (this.innerCom.signIn as SignInModule).disabled = true;
            }
                break;
            case '报名中': {
                (this.innerCom.applicationTime as TimeModule).disabled = false;
                (this.innerCom.activityTime as TimeModule).disabled = false;
                (this.innerCom.activityRetroactive as CancelTimeModule).disabled = false;
                (this.innerCom.signBack as SignBackModule).disabled = false;
                (this.innerCom.activityCancel as CancelTimeModule).disabled = false;
                (this.innerCom.roleCancel as CancelTimeModule).disabled = false;
                (this.innerCom.activityComment as ActivityRadioModule).disabled = false;
                (this.innerCom.commentEndTime as DeadlineModule).disabled = false;
                // 需内部判断
                (this.innerCom.signIn as SignInModule).disabled = true;
            }
                break;
            default: {
                (this.innerCom.activityTime as TimeModule).disabled = disabled;
                (this.innerCom.applicationTime as TimeModule).disabled = disabled;
                (this.innerCom.signIn as SignInModule).disabled = disabled;
                (this.innerCom.signBack as SignBackModule).disabled = disabled;
                (this.innerCom.activityRetroactive as CancelTimeModule).disabled = disabled;
                (this.innerCom.activityCancel as CancelTimeModule).disabled = disabled;
                (this.innerCom.roleCancel as CancelTimeModule).disabled = disabled;
                (this.innerCom.activityComment as ActivityRadioModule).disabled = disabled;
                (this.innerCom.commentEndTime as DeadlineModule).disabled = disabled;
            }
                break;
        }
    }

    get disabled() {
        return this._disabled;
    }
}