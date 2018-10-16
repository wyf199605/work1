/// <amd-module name="ReportActivityData"/>

import tools = G.tools;

// 主办方承办方
export interface SponsorPara {
    name?: string //名称
}

// 联系人
export interface ChargePara {
    name?: string; //姓名
    phone?: string; //电话
}

// 签到
export interface SignContentPara {
    signStartTime?: number; //签到开始时间
    signEndTime?: number; //签到结束时间
    signType?: number; // 签到方式
    signPosition?: number; //签到位置
    longitude?: string; //经度
    latitude?: string;//纬度
    distance?: number;// 签到限制距离
    duration?: number; // 二维码有效时间
    signCaption?: string;// 签到位置名称
}

export interface StudentPara {
    userid?: string;
    username?: string;
    userschool?: string;
}

export interface ControllerTypePara {
    maxPlayers?: number; //限制人数
    integralMultiple?: number;//积分倍数
}

// 专业、年级、班级
export interface MajorPara {
    id?: string;
    name?: string;
}


export interface TeacherInfo {
    teacherId?: string;
    teacherName?: string;
    teacherPosition?: string;
}

export interface BackBasicInfoPara {
    activity?: {
        activityCategory?: number;
        activityLevel?: string;
        activityAttribution?: string;
        activityPlatform?: string;
        activityPlatformName?:string;
        platformCategory?: string;
        platformCategoryName?:string;
        activityName?: string;
        slogan?: string;
        address?: string;
        teacherId?: string;
        teacherName?: string;
        teacherPosition?: string;
        courseDescription?: string;
        coverPicture?: string;
        remind?: string;
        accessory?: string;
        // consult?: number;
        remark?: string;
        activityLevelName:string;
        activityAttributionName:string;
        activityCategoryName:string;
    },
    sponsor?: SponsorPara[];
    contractor?: SponsorPara[];
    assist?: SponsorPara[];
    charge?: ChargePara[];
}

export interface BasicInfoPara {
    activity?: {
        activityCategory?: number;
        activityLevel?: string;
        activityAttribution?: string;
        activityPlatform?: string;
        platformCategory?: string;
        activityName?: string;
        slogan?: string;
        address?: string;
        teacherId?: string;
        teacherName?: string;
        teacherPosition?: string;
        courseDescription?: string;
        coverPicture?: string;
        remind?: string;
        accessory?: string;
        // consult?: number;
        remark?: string;
    },
    sponsor?: SponsorPara[];
    contractor?: SponsorPara[];
    assist?: SponsorPara[];
    charge?: ChargePara[];
}

export interface RuleSettingPara {
    rule?: {
        activityBeginTime?: number;
        activityEndTime?: number;
        applicationBeginTime?: number;
        applicationEndTime?: number;
        activityRetroactive?: number;
        activityRetroBeginTime?: number;
        activityRetroEndTime?: number;
        activityCancel?: number;
        activityCancelBeginTime?: number;
        activityCancelEndTime?: number;
        activitiesList?: number;
        roleCancel?: number;
        roleCancelBeginTime?: number;
        roleCancelEndTime?: number;
        activityComment?: number;
        commentEndTime?: number;
        signBack?: number;
        signBackStartTime?: number;
        signBackEndTime?: number;
        longitude?: string;
        latitude?: string;
        signType?: number;
        distance?: number;
        signPosition?: number;
        duration?: number;
        signCaption?: string;
    };
    signContent?: SignContentPara[];
    controllerType?: ControllerTypePara;
    controller?: StudentPara[];
    organizerType?: ControllerTypePara;
    organizer?: StudentPara[];
    participantType?: ControllerTypePara;
    participant?: StudentPara[];
    activitieList?: StudentPara[];
}

export interface ObjectSettingPara {
    object?: {
        limitCollege?: number;
        limitMajor?: number;
        limitGrade?: number;
        limitClass?: number;
        otherCollege?: number;
        otherMajor?: number;
        otherGrade?: number;
        otherClass?: number;
    };
    college?: MajorPara[];
    major?: MajorPara[];
    grade?: MajorPara[];
    clbum?: MajorPara[];
}

interface IReportDataPara {
    baseInfo?: BasicInfoPara;
    ruleSetting?: RuleSettingPara;
    objectSetting?: ObjectSettingPara;
}

export class ReportActivityData {

    constructor(para: IReportDataPara) {
        // BaseInfo
        this.activityCategory = tools.isEmpty(para) ? 0 : para.baseInfo.activity.activityCategory;
        this.activityLevel = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityLevel;
        this.activityAttribution = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityAttribution;
        this.activityPlatform = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityPlatform;
        this.platformCategory = tools.isEmpty(para) ? '' : para.baseInfo.activity.platformCategory;
        this.activityName = tools.isEmpty(para) ? '' : para.baseInfo.activity.activityName;
        this.slogan = tools.isEmpty(para) ? '' : para.baseInfo.activity.slogan;
        this.address = tools.isEmpty(para) ? '' : para.baseInfo.activity.address;
        this.teacherInfo = {
            teacherName: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherName,
            teacherPosition: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherPosition,
            teacherId: tools.isEmpty(para) ? '' : para.baseInfo.activity.teacherId
        };
        this.courseDescription = tools.isEmpty(para) ? '' : para.baseInfo.activity.courseDescription;
        this.coverPicture = tools.isEmpty(para) ? '' : para.baseInfo.activity.coverPicture;
        this.remind = tools.isEmpty(para) ? '' : para.baseInfo.activity.remind;
        this.accessory = tools.isEmpty(para) ? '' : para.baseInfo.activity.accessory;
        // this.consult = tools.isEmpty(para) ? 0 : para.baseInfo.activity.consult;
        this.sponsor = tools.isEmpty(para) ? [] : para.baseInfo.sponsor;
        this.contractor = tools.isEmpty(para) ? [] : para.baseInfo.contractor;
        this.assist = tools.isEmpty(para) ? [] : para.baseInfo.assist;
        this.charge = tools.isEmpty(para) ? [] : para.baseInfo.charge;

        // RuleSetting
        this.activityBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityBeginTime;
        this.activityEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityEndTime;
        this.applicationBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.applicationBeginTime;
        this.applicationEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.applicationEndTime;
        this.activityRetroactive = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroactive;
        this.activityRetroBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroBeginTime;
        this.activityRetroEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityRetroEndTime;
        this.activityCancel = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancel;
        this.activityCancelBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancelBeginTime;
        this.activityCancelEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityCancelEndTime;
        this.signBack = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBack;
        this.signBackStartTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBackStartTime;
        this.signBackEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signBackEndTime;
        this.longitude = tools.isEmpty(para) ? '' : para.ruleSetting.rule.longitude;
        this.latitude = tools.isEmpty(para) ? '' : para.ruleSetting.rule.latitude;
        this.signType = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signType;
        this.distance = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.distance;
        this.signPosition = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.signPosition;
        this.duration = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.duration;
        this.signCaption = tools.isEmpty(para) ? '' : para.ruleSetting.rule.signCaption;
        this.activitiesList = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activitiesList;
        this.activityComment = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.activityComment;
        this.commentEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.commentEndTime;
        this.roleCancel = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancel;
        this.roleCancelBeginTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancelBeginTime;
        this.roleCancelEndTime = tools.isEmpty(para) ? 0 : para.ruleSetting.rule.roleCancelEndTime;
        this.signContent = tools.isEmpty(para) ? [] : para.ruleSetting.signContent;
        this.controller = tools.isEmpty(para) ? [] : para.ruleSetting.controller;
        this.controllerType = tools.isEmpty(para) ? {} : para.ruleSetting.controllerType;
        this.organizer = tools.isEmpty(para) ? [] : para.ruleSetting.organizer;
        this.organizerType = tools.isEmpty(para) ? {} : para.ruleSetting.organizerType;
        this.participant = tools.isEmpty(para) ? [] : para.ruleSetting.participant;
        this.participantType = tools.isEmpty(para) ? {} : para.ruleSetting.participantType;
        this.activitieList = tools.isEmpty(para) ? [] : para.ruleSetting.activitieList;

        //objectSetting
        this.limitCollege = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitCollege;
        this.limitMajor = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitMajor;
        this.limitGrade = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitGrade;
        this.limitClass = tools.isEmpty(para) ? 0 : para.objectSetting.object.limitClass;
        this.otherCollege = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherCollege;
        this.otherMajor = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherMajor;
        this.otherGrade = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherGrade;
        this.otherClass = tools.isEmpty(para) ? 0 : para.objectSetting.object.otherClass;
        this.clbum = tools.isEmpty(para) ? [] : para.objectSetting.clbum;
        this.major = tools.isEmpty(para) ? [] : para.objectSetting.major;
        this.college = tools.isEmpty(para) ? [] : para.objectSetting.college;
        this.grade = tools.isEmpty(para) ? [] : para.objectSetting.grade;
    }

    // 活动类别
    private _activityCategory: number;
    set activityCategory(ac: number) {
        this._activityCategory = ac;
    }

    get activityCategory() {
        return this._activityCategory;
    }

    // 活动级别
    private _activityLevel: string;
    set activityLevel(al: string) {
        this._activityLevel = al;
    }

    get activityLevel() {
        return this._activityLevel;
    }

    // 活动归属
    private _activityAttribution: string;
    set activityAttribution(a: string) {
        this._activityAttribution = a;
    }

    get activityAttribution() {
        return this._activityAttribution;
    }

    // 活动平台
    private _activityPlatform: string;
    set activityPlatform(ap: string) {
        this._activityPlatform = ap;
    }

    get activityPlatform() {
        return this._activityPlatform;
    }

    // 平台类别
    private _platformCategory: string;
    set platformCategory(pc: string) {
        this._platformCategory = pc;
    }

    get platformCategory() {
        return this._platformCategory;
    }

    // 活动名称
    private _activityName: string;
    set activityName(an: string) {
        this._activityName = an;
    }

    get activityName() {
        return this._activityName;
    }

    // 活动口号
    private _slogan: string;
    set slogan(s: string) {
        this._slogan = s;
    }

    get slogan() {
        return this._slogan;
    }

    // 地址
    private _address: string;
    set address(a: string) {
        this._address = a;
    }

    get address() {
        return this._address;
    }

    // 教师信息
    private _teacherInfo: TeacherInfo;
    set teacherInfo(tn: TeacherInfo) {
        this._teacherInfo = tn;
    }

    get teacherInfo() {
        return this._teacherInfo;
    }

    // 课程描述
    private _courseDescription: string;
    set courseDescription(cd: string) {
        this._courseDescription = cd;
    }

    get courseDescription() {
        return this._courseDescription;
    }

    // 封面图片
    private _coverPicture: string;
    set coverPicture(cp: string) {
        this._coverPicture = cp;
    }

    get coverPicture() {
        return this._coverPicture;
    }

    // 提醒内容
    private _remind: string;
    set remind(re: string) {
        this._remind = re;
    }

    get remind() {
        return this._remind;
    }

    // 附件
    private _accessory: string;
    set accessory(ac: string) {
        this._accessory = ac;
    }

    get accessory() {
        return this._accessory;
    }

    //咨询
    // private _consult: number;
    // set consult(con: number) {
    //     this._consult = con;
    // }
    //
    // get consult() {
    //     return this._consult;
    // }

    // 备注
    private _remark: string;
    set remark(rema: string) {
        this._remark = rema;
    }

    get remark() {
        return this._remark;
    }

    // 主办方
    private _sponsor: SponsorPara[];
    set sponsor(s: SponsorPara[]) {
        this._sponsor = s;
    }

    get sponsor() {
        return this._sponsor;
    }

    // 承办方
    private _contractor: SponsorPara[];
    set contractor(c: SponsorPara[]) {
        this._contractor = c;
    }

    get contractor() {
        return this._contractor;
    }

    // 协办方
    private _assist: SponsorPara[];
    set assist(a: SponsorPara[]) {
        this._assist = a;
    }

    get assist() {
        return this._assist;
    }

    // 联系人
    private _charge: ChargePara[];
    set charge(c: ChargePara[]) {
        this._charge = c;
    }

    get charge() {
        return this._charge;
    }

    // 活动开始时间
    private _activityBeginTime: number;
    set activityBeginTime(ab: number) {
        this._activityBeginTime = ab;
    }

    get activityBeginTime() {
        return this._activityBeginTime;
    }

    // 活动结束时间
    private _activityEndTime: number;
    set activityEndTime(ae: number) {
        this._activityEndTime = ae;
    }

    get activityEndTime() {
        return this._activityEndTime;
    }

    // 报名开始时间
    private _applicationBeginTime: number;
    set applicationBeginTime(ab: number) {
        this._applicationBeginTime = ab;
    }

    get applicationBeginTime() {
        return this._applicationBeginTime;
    }

    // 报名结束时间
    private _applicationEndTime: number;
    set applicationEndTime(ae: number) {
        this._applicationEndTime = ae;
    }

    get applicationEndTime() {
        return this._applicationEndTime;
    }

    // 活动补签
    private _activityRetroactive: number;
    set activityRetroactive(ar: number) {
        this._activityRetroactive = ar;
    }

    get activityRetroactive() {
        return this._activityRetroactive;
    }

    // 活动补签开始时间
    private _activityRetroBeginTime: number;
    set activityRetroBeginTime(ar: number) {
        this._activityRetroBeginTime = ar;
    }

    get activityRetroBeginTime() {
        return this._activityRetroBeginTime;
    }

    // 活动补签结束时间
    private _activityRetroEndTime: number;
    set activityRetroEndTime(ar: number) {
        this._activityRetroEndTime = ar;
    }

    get activityRetroEndTime() {
        return this._activityRetroEndTime;
    }

    // 活动取消
    private _activityCancel: number;
    set activityCancel(ac: number) {
        this._activityCancel = ac;
    }

    get activityCancel() {
        return this._activityCancel;
    }

    // 活动取消开始时间
    private _activityCancelBeginTime: number;
    set activityCancelBeginTime(ac: number) {
        this._activityCancelBeginTime = ac;
    }

    get activityCancelBeginTime() {
        return this._activityCancelBeginTime;
    }

    // 活动取消结束时间
    private _activityCancelEndTime: number;
    set activityCancelEndTime(ac: number) {
        this._activityCancelEndTime = ac;
    }

    get activityCancelEndTime() {
        return this._activityCancelEndTime;
    }

    // 是否签退
    private _signBack: number;
    set signBack(sb: number) {
        this._signBack = sb;
    }

    get signBack() {
        return this._signBack;
    }

    // 签退开始时间
    private _signBackStartTime: number;
    set signBackStartTime(sb: number) {
        this._signBackStartTime = sb;
    }

    get signBackStartTime() {
        return this._signBackStartTime;
    }

    // 签退结束时间
    private _signBackEndTime: number;
    set signBackEndTime(se: number) {
        this._signBackEndTime = se;
    }

    get signBackEndTime() {
        return this._signBackEndTime;
    }

    // 经度
    private _longitude: string;
    set longitude(lon: string) {
        this._longitude = lon;
    }

    get longitude() {
        return this._longitude;
    }

    // 纬度
    private _latitude: string;
    set latitude(lat: string) {
        this._latitude = lat;
    }

    get latitude() {
        return this._latitude;
    }

    // 签退方式
    private _signType: number;
    set signType(st: number) {
        this._signType = st;
    }

    get signType() {
        return this._signType;
    }

    // 签退位置距离
    private _distance: number;
    set distance(dis: number) {
        this._distance = dis;
    }

    get distance() {
        return this._distance;
    }

    // 签退位置名称
    private _signCaption: string;
    set signCaption(s: string) {
        this._signCaption = s;
    }

    get signCaption() {
        return this._signCaption;
    }

    // 签退位置
    private _signPosition: number;
    set signPosition(sp: number) {
        this._signPosition = sp;
    }

    get signPosition() {
        return this._signPosition;
    }

    // 二维码有效时间
    private _duration: number;
    set duration(du: number) {
        this._duration = du;
    }

    get duration() {
        return this._duration;
    }

    // 导入活动名单
    private _activitiesList: number;
    set activitiesList(al: number) {
        this._activitiesList = al;
    }

    get activitiesList() {
        return this._activitiesList;
    }

    // 活动名单
    private _activitieList: StudentPara[];
    set activitieList(al: StudentPara[]) {
        this._activitieList = al;
    }

    get activitieList() {
        return this._activitieList;
    }

    // 角色取消
    private _roleCancel: number;
    set roleCancel(rc: number) {
        this._roleCancel = rc;
    }

    get roleCancel() {
        return this._roleCancel;
    }

    // 角色取消开始时间
    private _roleCancelBeginTime: number;
    set roleCancelBeginTime(rc: number) {
        this._roleCancelBeginTime = rc;
    }

    get roleCancelBeginTime() {
        return this._roleCancelBeginTime;
    }

    // 角色取消结束时间
    private _roleCancelEndTime: number;
    set roleCancelEndTime(rc: number) {
        this._roleCancelEndTime = rc;
    }

    get roleCancelEndTime() {
        return this._roleCancelEndTime;
    }

    // 活动评论
    private _activityComment: number;
    set activityComment(ac: number) {
        this._activityComment = ac;
    }

    get activityComment() {
        return this._activityComment;
    }

    // 评论结束时间
    private _commentEndTime: number;
    set commentEndTime(ce: number) {
        this._commentEndTime = ce;
    }

    get commentEndTime() {
        return this._commentEndTime;
    }

    // 签到内容
    private _signContent: SignContentPara[];
    set signContent(sc: SignContentPara[]) {
        this._signContent = sc;
    }

    get signContent() {
        return this._signContent;
    }

    // 管理者
    private _controller: StudentPara[];
    set controller(c: StudentPara[]) {
        this._controller = c;
    }

    get controller() {
        return this._controller;
    }

    private _controllerType: ControllerTypePara;
    set controllerType(c: ControllerTypePara) {
        this._controllerType = c;
    }

    get controllerType() {
        return this._controllerType;
    }

    // 组织者
    private _organizer: StudentPara[];
    set organizer(o: StudentPara[]) {
        this._organizer = o;
    }

    get organizer() {
        return this._organizer;
    }

    private _organizerType: ControllerTypePara;
    set organizerType(ot: ControllerTypePara) {
        this._organizerType = ot;
    }

    get organizerType() {
        return this._organizerType;
    }

    // 参与者
    private _participant: StudentPara[];
    set participant(p: StudentPara[]) {
        this._participant = p;
    }

    get participant() {
        return this._participant;
    }

    private _participantType: ControllerTypePara;
    set participantType(pt: ControllerTypePara) {
        this._participantType = pt;
    }

    get participantType() {
        return this._participantType;
    }

    // 是否不限学院
    private _limitCollege: number;
    set limitCollege(limit: number) {
        this._limitCollege = limit;
    }

    get limitCollege() {
        return this._limitCollege;
    }

    // 是否不限专业
    private _limitMajor: number;
    set limitMajor(lm: number) {
        this._limitMajor = lm;
    }

    get limitMajor() {
        return this._limitMajor;
    }

    // 是否不限年级
    private _limitGrade: number;
    set limitGrade(lg: number) {
        this._limitGrade = lg;
    }

    get limitGrade() {
        return this._limitGrade;
    }

    // 是否不限班级
    private _limitClass: number;
    set limitClass(lc: number) {
        this._limitClass = lc;
    }

    get limitClass() {
        return this._limitClass;
    }

    // 其他学院
    private _otherCollege: number;
    set otherCollege(oc: number) {
        this._otherCollege = oc;
    }

    get otherCollege() {
        return this._otherCollege;
    }

    // 其他专业
    private _otherMajor: number;
    set otherMajor(om: number) {
        this._otherMajor = om;
    }

    get otherMajor() {
        return this._otherMajor;
    }

    // 其他年级
    private _otherGrade: number;
    set otherGrade(og: number) {
        this._otherGrade = og;
    }

    get otherGrade() {
        return this._otherGrade;
    }

    // 其他班级
    private _otherClass: number;
    set otherClass(oc: number) {
        this._otherClass = oc;
    }

    get otherClass() {
        return this._otherClass;
    }

    // 学院
    private _college: MajorPara[];
    set college(c: MajorPara[]) {
        this._college = c;
    }

    get college() {
        return this._college;
    }

    // 专业
    private _major: MajorPara[];
    set major(m: MajorPara[]) {
        this._major = m;
    }

    get major() {
        return this._major;
    }

    // 年级
    private _grade: MajorPara[];
    set grade(g: MajorPara[]) {
        this._grade = g;
    }

    get grade() {
        return this._grade;
    }

    // 班级
    private _clbum: MajorPara[];
    set clbum(c: MajorPara[]) {
        this._clbum = c;
    }

    get clbum() {
        return this._clbum;
    }

    get() {
        let activityData = {
            baseInfo: {
                activity: {
                    activityCategory: this.activityCategory,
                    activityLevel: this.activityLevel,
                    activityAttribution: this.activityAttribution,
                    activityPlatform: this.activityPlatform,
                    platformCategory: this.platformCategory,
                    activityName: this.activityName,
                    slogan: this.slogan,
                    address: this.address,
                    teacherId: this.teacherInfo.teacherId,
                    teacherName: this.teacherInfo.teacherName,
                    teacherPosition: this.teacherInfo.teacherPosition,
                    courseDescription: this.courseDescription,
                    coverPicture: this.coverPicture,
                    remind: this.remind,
                    accessory: this.accessory,
                    // consult: this.consult,
                    remark: this.remark
                },
                sponsor: this.sponsor,
                contractor: this.contractor,
                assist: this.assist,
                charge: this.charge
            },
            ruleSetting: {
                rule: {
                    activityBeginTime: this.activityBeginTime,
                    activityEndTime: this.activityEndTime,
                    applicationBeginTime: this.applicationBeginTime,
                    applicationEndTime: this.applicationEndTime,
                    activityRetroactive: this.activityRetroactive,
                    activityRetroBeginTime: this.activityRetroBeginTime,
                    activityRetroEndTime: this.activityRetroEndTime,
                    activityCancel: this.activityCancel,
                    activityCancelBeginTime: this.activityCancelBeginTime,
                    activityCancelEndTime: this.activityCancelEndTime,
                    activitiesList: this.activitiesList,
                    roleCancel: this.roleCancel,
                    roleCancelBeginTime: this.roleCancelBeginTime,
                    roleCancelEndTime: this.roleCancelEndTime,
                    activityComment: this.activityComment,
                    commentEndTime: this.commentEndTime,
                    signBack: this.signBack,
                    signBackStartTime: this.signBackStartTime,
                    signBackEndTime: this.signBackEndTime,
                    longitude: this.longitude,
                    latitude: this.latitude,
                    signType: this.signType,
                    distance: this.distance,
                    signPosition: this.signPosition,
                    duration: this.duration,
                    signCaption:this.signCaption
                },
                signContent: this.signContent,
                controllerType: this.controllerType,
                controller: this.controller,
                organizerType: this.organizerType,
                organizer: this.organizer,
                participantType: this.participantType,
                participant: this.participant,
                activitieList: this.activitieList
            },
            objectSetting: {
                object: {
                    limitCollege: this.limitCollege,
                    limitMajor: this.limitMajor,
                    limitGrade: this.limitGrade,
                    limitClass: this.limitClass,
                    otherCollege: this.otherCollege,
                    otherMajor: this.otherMajor,
                    otherGrade: this.otherGrade,
                    otherClass: this.otherClass
                },
                college: this.college,
                major: this.major,
                grade: this.grade,
                clbum: this.clbum
            }
        };
        return activityData;
    }
}