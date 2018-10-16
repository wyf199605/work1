/// <amd-module name="ActivityDetailModule"/>

import {DetailItem} from "./DetailItem";
import {IsSignBack} from "../reportActivity/ruleSetting/IsSignBack";
import {SignInDetail} from "./SignInDetail";
import {Button} from "../../../../global/components/general/button/Button";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {LeRule} from "../../../common/rule/LeRule";
import tools = G.tools;
import {
    BackBasicInfoPara, ControllerTypePara,
    SignContentPara
} from "../reportActivity/ReportActivityData";
import {ChargeDetail} from "./ChargeDetail";
import {BDMap} from "../../../../global/utils/BMap";
import {Modal} from "../../../../global/components/feedback/modal/Modal";
import {Utils} from "../../../common/utils";
import {LeBasicPage} from "../../LeBasicPage";

export class ActivityDetailModule extends Component {

    protected wrapperInit(para: G.IComponentPara): HTMLElement {
        let signIn: SignInDetail = null,
            signBack: SignInDetail = null;
        return <div className="activity-detail-page">
            <div className="detail-row">
                <div className="cover-img">
                    <img c-var="cover" src=""/>
                    <div className="status" c-var='state'/>
                </div>
            </div>
            <div className="detail-row">
                <DetailItem title="活动名称" c-var="activityName"/>
                <DetailItem title="活动口号" c-var="slogan"/>
            </div>
            <div className="detail-row">
                <DetailItem title="主办方" c-var="sponsor"/>
                <DetailItem title="承办方" c-var="contractor"/>
            </div>
            <div className="detail-row">
                <DetailItem title="协办方" c-var="assist"/>
                <DetailItem title="活动类别" c-var="activityCategory"/>
            </div>
            <div className="detail-row">
                <DetailItem title="活动级别" c-var="activityLevel"/>
                <DetailItem title="活动归属" c-var="activityAttribution"/>
            </div>
            <div className="detail-row">
                <DetailItem title="活动平台" c-var="activityPlatform"/>
                <DetailItem title="平台类别" c-var="platformCategory"/>
            </div>
            <div className="detail-row">
                <DetailItem title="地址" c-var="address"/>
                <ChargeDetail title="咨询人" c-var="charge"/>
            </div>
            <div className="detail-row">
                <DetailItem title="活动时间" isTime={true} c-var="activityTime"/>
                <DetailItem title="报名时间" isTime={true} c-var="applicationTime"/>
            </div>
            <div className="detail-row isBack">
                <IsSignBack title="签到类型" itemArr={['签到', '签退']} changeItems={(index) => {
                    if (index === 0) {
                        signIn.isShow = true;
                        signBack.isShow = false;
                    } else {
                        signIn.isShow = false;
                        signBack.isShow = true;
                    }
                }}/>
            </div>
            {signIn = <SignInDetail c-var="signContent" isSignIn={true}/>}
            {signBack = <SignInDetail c-var="signBack" className="hide" isSignIn={false}/>}
            <div className="detail-row">
                <DetailItem title="活动补签" c-var="activityRetroactive"/>
                <DetailItem title="活动取消" c-var="activityCancel"/>
            </div>
            <div className="detail-row">
                <DetailItem title="人员上限" c-var="role"/>
                <DetailItem title="角色取消" c-var="roleCancel"/>
            </div>
            <div className="detail-row isBack">
                <div className="detail-item" c-var="table">

                </div>
            </div>
            <div className="detail-row">
                <DetailItem title="活动评价" c-var="activityComment"/>
                <DetailItem title="截止时间" c-var="commentEndTime"/>
            </div>
            <div className="detail-row">
                <DetailItem title="面向院系" c-var="college"/>
                <DetailItem title="面向专业" c-var="major"/>
            </div>
            <div className="detail-row">
                <DetailItem title="面向班级" c-var="clbum"/>
                <DetailItem title="面向年级" c-var="grade"/>
            </div>
            <div className="detail-row">
                <DetailItem title="其他学院" c-var="otherCollege"/>
                <DetailItem title="其他专业" c-var="otherMajor"/>
            </div>
            <div className="detail-row">
                <DetailItem title="其他班级" c-var="otherClass"/>
                <DetailItem title="其他年级" c-var="otherGrade"/>
            </div>
            <div className="detail-row">
                <DetailItem title="课程介绍" c-var="courseDescription"/>
                <DetailItem title="提醒内容" c-var="remind"/>
            </div>
            <div className="detail-row">
                <div className="detail-item">
                    <div className="detail-item-wrapper" style={{
                        alignItems: 'center'
                    }}>
                        <div className="detail-label">附件&nbsp;:</div>
                        <Button content="点击下载附件" className="addBtn" c-var="btn"/>
                    </div>
                </div>
                <DetailItem title="备注" c-var="remark"/>
            </div>
        </div>;
    }

    constructor(para: IComponentPara) {
        super(para);
    }

    set(activityid: string) {
        LeRule.Ajax.fetch(tools.url.addObj(LE.CONF.ajaxUrl.activityDetail, {
            activityid: activityid
        })).then(({response}) => {
            let baseInfo: BackBasicInfoPara = response.data.baseInfo,
                activity = response.data.baseInfo.activity;
            if (tools.isNotEmpty(activity)) {
                (this.innerEl.state as HTMLElement).innerText = activity.state;
                (this.innerEl.cover as HTMLMediaElement).src = LeRule.fileUrlGet(activity.coverPicture, 'COVERPICTURE');
                (this.innerCom.activityName as DetailItem).set(activity.activityName);
                (this.innerCom.slogan as DetailItem).set(activity.slogan);
                (this.innerCom.activityCategory as DetailItem).set(activity.activityCategoryName);
                (this.innerCom.activityLevel as DetailItem).set(activity.activityLevelName);
                (this.innerCom.activityAttribution as DetailItem).set(activity.activityAttributionName);
                (this.innerCom.activityPlatform as DetailItem).set(activity.activityPlatformName);
                (this.innerCom.platformCategory as DetailItem).set(activity.platformCategoryName);
                (this.innerCom.address as DetailItem).set(activity.address);
                (this.innerCom.courseDescription as DetailItem).set(activity.courseDescription);
                (this.innerCom.remind as DetailItem).set(activity.remind);
                (this.innerCom.remark as DetailItem).set(activity.remark);
            } else {
                (this.innerEl.state as HTMLElement).innerText = '无';
            }
            (this.innerCom.sponsor as DetailItem).set(this.getSponsor(baseInfo.sponsor));
            (this.innerCom.contractor as DetailItem).set(this.getSponsor(baseInfo.contractor));
            (this.innerCom.assist as DetailItem).set(this.getSponsor(baseInfo.assist));
            (this.innerCom.charge as ChargeDetail).set(baseInfo.charge);
            let rule = response.data.ruleSetting.rule,
                ruleSetting = response.data.ruleSetting;
            (this.innerCom.activityRetroactive as DetailItem).set(this.getCancelData(rule.activityRetroactive,rule.activityRetroBeginTime,rule.activityRetroEndTime));
            (this.innerCom.activityCancel as DetailItem).set(this.getCancelData(rule.activityCancel,rule.activityCancelBeginTime,rule.activityCancelEndTime));
            (this.innerCom.roleCancel as DetailItem).set(this.getCancelData(rule.roleCancel,rule.roleCancelBeginTime,rule.roleCancelEndTime));
            (this.innerCom.activityComment as DetailItem).set(this.getCommontData(rule.activityComment));
            (this.innerCom.commentEndTime as DetailItem).set(Utils.formatTime(rule.commentEndTime));
            (this.innerCom.activityTime as DetailItem).set([rule.activityBeginTime, rule.activityEndTime]);
            (this.innerCom.applicationTime as DetailItem).set([rule.applicationBeginTime, rule.applicationEndTime]);
            (this.innerCom.role as DetailItem).set(this.getControllerData(ruleSetting.controllerType, ruleSetting.organizerType, ruleSetting.participantType));
            if (tools.isEmpty(ruleSetting.signContent)) {
                (this.innerCom.signContent as SignInDetail).set([]);
            } else {
                (this.innerCom.signContent as SignInDetail).set(this.getSignInContent(ruleSetting.signContent));
            }
            this.createTable(ruleSetting.tables);
            (this.innerCom.signBack as SignInDetail).set(this.getSignBackContent(rule.signBack,rule.signBackStartTime, rule.signBackEndTime, rule.signType,rule.signCaption,rule.duration));
            // this.getSignBackContent(rule.signBack, rule.signBackStartTime, rule.signBackEndTime, rule.signType, rule.latitude, rule.longitude).then((result) => {
            //     (this.innerCom.signBack as SignInDetail).set(result);
            // });
            let objectSetting = response.data.objectSetting,
                object = response.data.objectSetting.object;
            (this.innerCom.college as DetailItem).set(this.getCollegeData(objectSetting.college));
            (this.innerCom.major as DetailItem).set(this.getCollegeData(objectSetting.major));
            (this.innerCom.clbum as DetailItem).set(this.getCollegeData(objectSetting.clbum));
            (this.innerCom.grade as DetailItem).set(this.getCollegeData(objectSetting.grade));
            (this.innerCom.otherCollege as DetailItem).set(this.getOtherCollegeData(object.otherCollege));
            (this.innerCom.otherMajor as DetailItem).set(this.getOtherCollegeData(object.otherMajor));
            (this.innerCom.otherClass as DetailItem).set(this.getOtherCollegeData(object.otherClass));
            (this.innerCom.otherGrade as DetailItem).set(this.getOtherCollegeData(object.otherGrade));
            (this.innerCom.btn as Button).onClick = () => {
                if (tools.isEmpty(activity.accessory)) {
                    Modal.alert('无可下载附件!');
                } else {
                    window.open(LeRule.fileUrlGet(activity.accessory));
                }
            }
        })
    }

    private createTable(data) {
        let tableWrapper = this.innerEl.table,
            tbody = null,
            table = <table>
                <thead>
                <tr>
                    <th>年份</th>
                    <th>角色</th>
                    <th>获得积分</th>
                    <th>未签到扣分</th>
                </tr>
                </thead>
                {tbody = <tbody/>}
            </table>;
        data.forEach(ye => {
            let tr = <tr/>;
            ye.forEach(con => {
                tr.appendChild(<td>{con}</td>);
            });
            tbody.appendChild(tr);
        });
        tableWrapper.appendChild(table);
    }

    private getControllerData(controllerType: ControllerTypePara, organizerType: ControllerTypePara, participantType: ControllerTypePara): string {
        let result = '';
        if (tools.isNotEmpty(controllerType)) {
            if (Number(controllerType.maxPlayers) === 0) {
                result += `<span>管理者:不限&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            } else {
                result += `<span>管理者:${controllerType.maxPlayers}人&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            }
        }
        if (tools.isNotEmpty(organizerType)) {
            if (Number(organizerType.maxPlayers) === 0) {
                result += `<span>组织者:不限&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            } else {
                result += `<span>组织者:${organizerType.maxPlayers}人&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            }
        }
        if (tools.isNotEmpty(participantType)) {
            if (Number(participantType.maxPlayers) === 0) {
                result += `<span>参与者:不限&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            } else {
                result += `<span>参与者:${participantType.maxPlayers}人&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
            }
        }
        return result;
    }

    private getSignBackContent(signBack:number,startTime: number, endTime: number, type: number,signCaption:string,duration:number): obj[] {
        let results = [],
            types = ['人脸识别', '动态二维码'];
         if (signBack === 1){
             results.push({
                 time: [startTime, endTime],
                 type: types[type],
                 position: signCaption || '未知',
                 duration:duration
             });
         }
        return results;
    }

    // private getSignBackContent(signBack: number, startTime: number, endTime: number, type: number, lat: string, lng: string): Promise<obj[]> {
    //     return new Promise((resolve, reject) => {
    //         if (signBack === 1) {
    //             let result = [],
    //                 types = ['人脸识别', '动态二维码'];
    //             if(tools.isNotEmpty(lat) && tools.isNotEmpty(lng)){
    //                 BDMap.getSurroundingPois({
    //                     lat: Number(lat),
    //                     lng: Number(lng)
    //                 }).then((res) => {
    //                     let position = '';
    //                     if (tools.isNotEmptyArray(res.surroundingPois)) {
    //                         position = res.surroundingPois[0].title
    //                     } else {
    //                         if (tools.isNotEmpty(res.business)) {
    //                             position = res.business;
    //                         } else {
    //                             position = res.address + res.addressComponents.street + res.addressComponents.streetNumber
    //                         }
    //                     }
    //                     result.push({
    //                         time: [startTime, endTime],
    //                         type: types[type],
    //                         position: position
    //                     });
    //                     resolve(result);
    //                 });
    //             }else{
    //                 result.push({
    //                     time: [startTime, endTime],
    //                     type: types[type],
    //                     position: '未知'
    //                 });
    //                 resolve(result);
    //             }
    //         } else {
    //             resolve([]);
    //         }
    //     })
    // }

    private getOtherCollegeData(c: number): string {
        let arr = ['不限制', '允许报名但不给成绩', '不允许报名'];
        return arr[c];
    }

    private getCollegeData(data: obj[]): string[] {
        let result = [];
        if (tools.isNotEmptyArray(data)) {
            data.forEach((col) => {
                result.push(col.name);
            });
        } else {
            result.push('不限');
        }
        return result;
    }

    private getBooleanData(t: number) {
        return t === 1 ? '是' : '否';
    }
    private getCommontData(t:number){
        return t === 1 ? '开放评价' : '强制评价';
    }
    private getCancelData(cancel:number,startTime,endTime){
        if (cancel === 0){
            return {
                cancel:true,
                title:'否',
                startTime:0,
                endTime:0
            }
        }else{
            return {
                cancel:true,
                title:'是',
                startTime:startTime,
                endTime:endTime
            }
        }
    }

    private getSponsor(sponsor: obj[]): string[] {
        let result = [];
        tools.isNotEmptyArray(sponsor) && sponsor.forEach((s) => {
            result.push(s.name);
        });
        return result;
    }

    // private getSignInContent(content: SignContentPara[]): Promise<obj[]>
    private getSignInContent(content: SignContentPara[]): obj[] {
        // let permiseArr = [];
        let resultArr = []
        let types = ['人脸识别', '动态二维码'];
        content.forEach((c, index) => {
            let obj = {
                indexTitle: this.getChineseNum(index + 1) + '次签到',
                time: [c.signStartTime, c.signEndTime],
                type: types[c.signType],
                position: c.signCaption || '未知',
                duration:c.duration
            };
            resultArr.push(obj)
            // permiseArr.push(new Promise((resolve, reject) => {
            //     if (tools.isNotEmpty(c.latitude) && tools.isNotEmpty(c.longitude)){
            //         BDMap.getSurroundingPois({
            //             lat: Number(c.latitude),
            //             lng: Number(c.longitude)
            //         }).then((res) => {
            //             let position = '';
            //             if (tools.isNotEmptyArray(res.surroundingPois)) {
            //                 position = res.surroundingPois[0].title
            //             } else {
            //                 if (tools.isNotEmpty(res.business)) {
            //                     position = res.business;
            //                 } else {
            //                     position = res.address + res.addressComponents.street + res.addressComponents.streetNumber
            //                 }
            //             }
            //             let obj = {
            //                 indexTitle: this.getChineseNum(index + 1) + '次签到',
            //                 time: [c.signStartTime, c.signEndTime],
            //                 type: types[c.signType],
            //                 position: position
            //             };
            //             resolve(obj);
            //         });
            //     }else{
            //         let obj = {
            //             indexTitle: this.getChineseNum(index + 1) + '次签到',
            //             time: [c.signStartTime, c.signEndTime],
            //             type: types[c.signType],
            //             position: '不限'
            //         };
            //         resolve(obj);
            //     }
            // }));
        });
        // return Promise.all(permiseArr);
        return resultArr;
    }

    private getChineseNum(num: number) {
        // 默认是最大是两位数
        let numberArr = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        if (num.toString().length > 1) {
            let n = parseInt(num.toString().substr(1, 1));
            if (n === 0) {
                return '十';
            } else {
                return '十' + numberArr[n - 1];
            }
        } else {
            return numberArr[num - 1];
        }
    }
}

export class ActivityDetailPage extends LeBasicPage {
    protected init(para: obj, data?) {
        if (para && para.ajaxData) {
            let ajaxData: obj = {};
            try {
                ajaxData = JSON.parse(para.ajaxData);
            } catch (e) {

            }
            if (ajaxData.activity_id) {
                this.activeModule.set(ajaxData.activity_id);
            }
        }
    }

    protected activeModule: ActivityDetailModule;

    protected bodyInit() {
        return this.activeModule = <ActivityDetailModule/>
    }
}