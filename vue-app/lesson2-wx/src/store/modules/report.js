import * as types from '../mutations-types'
import reportApi from '../../api/report'
import {MessageBox, Indicator} from 'mint-ui'

const report = {
    state: {
        activityPlatformText: '',
        platformCategoryText: '',
        activityLevelText: '',
        tempControllerStudents: [],
        tempOrganizerStudents: [],
        tempParticipantStudents: [],
        tempSponsor: [],
        tempAssist: [],
        tempContractor: [],
        tempSignPosition: [],
        tempSignStartTime: 0,
        tempSignEndTime: 0,
        tempSignBack: 0,
        tempSignType: 0,
        tempDuration: 0,
        tempCollege:[],
        tempMajor:[],
        tempGrade:[],
        tempClbum:[],
        tempOtherCollege:0,
        tempOtherMajor:0,
        tempOtherGrade:0,
        tempOtherClbum:0,
        tempLimitCollege:-1,
        tempLimitMajor:-1,
        tempLimitGrade:-1,
        tempLimitClass:-1,
        tempControllerSelect:false,
        tempOrganizerSelect:false,
        tempParticipantSelect:false,
        baseInfo: {
            activity: {
                activityId: '',
                activityCategory: 0,
                activityLevel: '',
                activityAttribution: '',
                activityPlatform: '',
                platformCategory: '',
                activityName: '',
                slogan: '',
                address: '',
                teacherId: '',
                teacherName: '',
                teacherPosition: '',
                courseDescription: '',
                coverPicture: '',
                remind: '',
                accessory: '',
                remark: ''
            },
            sponsor: [],
            contractor: [],
            assist: [],
            charge: []
        },
        ruleSetting: {
            rule: {
                activityBeginTime: 0,
                activityEndTime: 0,
                applicationBeginTime: 0,
                applicationEndTime: 0,
                activityRetroactive: 0,
                activityRetroBeginTime: 0,
                activityRetroEndTime: 0,
                activityCancel: 0,
                activityCancelBeginTime: 0,
                activityCancelEndTime: 0,
                activitiesList: 0,
                roleCancel: 0,
                roleCancelBeginTime: 0,
                roleCancelEndTime: 0,
                activityComment: 0,
                commentEndTime: 0,
                signBack: 0,
                signBackStartTime: 0,
                signBackEndTime: 0,
                longitude: '',
                latitude: '',
                signType: 0,
                distance: 0,
                signPosition: 0,
                duration: 0,
                signCaption:''
            },
            signContent: [],
            controllerType: {},
            controller: [],
            organizerType: {},
            organizer: [],
            participantType: {},
            participant: [],
            activitieList: []
        },
        objectSetting: {
            object: {
                limitCollege: -1,
                limitMajor: -1,
                limitGrade: -1,
                limitClass: -1,
                otherCollege: 0,
                otherMajor: 0,
                otherGrade: 0,
                otherClass: 0
            },
            college: [],
            major: [],
            grade: [],
            clbum: []
        }
    },
    mutations: {
        [types.SET_ACTIVITYLEVELTEXT](state, value) {
            state.activityLevelText = value
        },
        [types.SET_ACTIVITYPLATFORMTEXT](state, value) {
            state.activityPlatformText = value
        },
        [types.SET_PLATFORMCATEGORYTEXT](state, value) {
            state.platformCategoryText = value
        },
        [types.SET_PARTICIPANT_TEMPSTUDENTS](state, value) {
            state.tempParticipantStudents = value
        },
        [types.SET_ORGANIZER_TEMPSTUDENTS](state, value) {
            state.tempOrganizerStudents = value
        },
        [types.SET_CONTROLLER_TEMPSTUDENTS](state, value) {
            state.tempControllerStudents = value
        },
        [types.SET_TEMP_SPONSOR](state, value) {
            state.tempSponsor = value
        },
        [types.SET_TEMP_ASSIST](state, value) {
            state.tempAssist = value
        },
        [types.SET_TEMP_CONTRACTOR](state, value) {
            state.tempContractor = value
        },
        [types.SET_TEMP_SIGNPOSITION](state, value) {
            state.tempSignPosition = value
        },
        [types.SET_TEMP_SIGN_START_TIME](state, value) {
            state.tempSignStartTime = value
        },
        [types.SET_TEMP_SIGN_END_TIME](state, value) {
            state.tempSignEndTime = value
        },
        [types.SET_TEMP_SIGNBACK](state, value) {
            state.tempSignBack = value
        },
        [types.SET_TEMP_SIGNTYPE](state, value) {
            state.tempSignType = value
        },
        [types.SET_TEMP_DURATION](state, value) {
            state.tempDuration = value
        },
        [types.SET_TEMP_COLLEGE](state, value) {
            state.tempCollege = value
        },
        [types.SET_TEMP_MAJOR](state, value) {
            state.tempMajor = value
        },
        [types.SET_TEMP_GRADE](state, value) {
            state.tempGrade = value
        },
        [types.SET_TEMP_CLBUM](state, value) {
            state.tempClbum = value
        },
        [types.SET_TEMP_OTHERCOLLEGE](state, value) {
            state.tempOtherCollege = value
        },
        [types.SET_TEMP_OTHERMAJOR](state, value) {
            state.tempOtherMajor = value
        },
        [types.SET_TEMP_OTHERGRADE](state, value) {
            state.tempOtherGrade = value
        },
        [types.SET_TEMP_OTHERCLBUM](state, value) {
            state.tempOtherClbum = value
        },
        [types.SET_TEMP_LIMITCOLLEGE](state, value) {
            state.tempLimitCollege = value
        },
        [types.SET_TEMP_LIMITMAJOR](state, value) {
            state.tempLimitMajor = value
        },
        [types.SET_TEMP_LIMITGRADE](state, value) {
            state.tempLimitGrade = value
        },
        [types.SET_TEMP_LIMITCLASS](state, value) {
            state.tempLimitClass = value
        },
        [types.SET_TEMP_CONTROLLER_SELECT](state, value) {
            state.tempControllerSelect = value
        },
        [types.SET_TEMP_ORGANIZER_SELECT](state, value) {
            state.tempOrganizerSelect = value
        },
        [types.SET_TEMP_PARTICIPANT_SELECT](state, value) {
            state.tempParticipantSelect = value
        },
        // BaseInfo
        [types.SET_ACTIVITYID](state, value) {
            state.baseInfo.activity.activityId = value
        },
        [types.SET_ACTIVITYCATETORY](state, value) {
            state.baseInfo.activity.activityCategory = value
        },
        [types.SET_ACTIVITYLEVEL](state, value) {
            state.baseInfo.activity.activityLevel = value
        },
        [types.SET_ACTIVITYATTRIBUTION](state, value) {
            state.baseInfo.activity.activityAttribution = value
        },
        [types.SET_ACTIVITYPLATFORM](state, value) {
            state.baseInfo.activity.activityPlatform = value[0]
            state.baseInfo.activity.platformCategory = value[1]
        },
        [types.SET_ACTIVITYNAME](state, value) {
            state.baseInfo.activity.activityName = value
        },
        [types.SET_SLOGAN](state, value) {
            state.baseInfo.activity.slogan = value
        },
        [types.SET_ADDRESS](state, value) {
            state.baseInfo.activity.address = value
        },
        [types.SET_TEACHER](state, value) {
            state.baseInfo.activity.teacherId = value.teacherId
            state.baseInfo.activity.teacherName = value.teacherName
            state.baseInfo.activity.teacherPosition = value.teacherPosition
        },
        [types.SET_COURSEDESCRIPTION](state, value) {
            state.baseInfo.activity.courseDescription = value
        },
        [types.SET_COVERPICTURE](state, value) {
            state.baseInfo.activity.coverPicture = value
        },
        [types.SET_REMIND](state, value) {
            state.baseInfo.activity.remind = value
        },
        [types.SET_REMARK](state, value) {
            state.baseInfo.activity.remark = value
        },
        [types.SET_ACCESSORY](state, value) {
            state.baseInfo.activity.accessory = value
        },
        [types.SET_SPONSOR](state, value) {
            state.baseInfo.sponsor = value
        },
        [types.SET_CONTRACTOR](state, value) {
            state.baseInfo.contractor = value
        },
        [types.SET_ASSIST](state, value) {
            state.baseInfo.assist = value
        },
        [types.SET_CHARGE](state, value) {
            state.baseInfo.charge = value
        },
        // RuleSetting
        [types.SET_ACTIVITYBEGINTIME](state, value) {
            state.ruleSetting.rule.activityBeginTime = value
        },
        [types.SET_ACTIVITYENDTIME](state, value) {
            state.ruleSetting.rule.activityEndTime = value
        },
        [types.SET_APPLICATIONBEGINTIME](state, value) {
            state.ruleSetting.rule.applicationBeginTime = value
        },
        [types.SET_APPLICATIONENDTIME](state, value) {
            state.ruleSetting.rule.applicationEndTime = value
        },
        [types.SET_ACTIVITYRETROACTIVE](state, value) {
            state.ruleSetting.rule.activityRetroactive = value
        },
        [types.SET_ACTIVITYRETROBEGINTIME](state, value) {
            state.ruleSetting.rule.activityRetroBeginTime = value
        },
        [types.SET_ACTIVITYRETROENDTIME](state, value) {
            state.ruleSetting.rule.activityRetroEndTime = value
        },
        [types.SET_ACTIVITYCANCEL](state, value) {
            state.ruleSetting.rule.activityCancel = value
        },
        [types.SET_ACTIVITYCANCELBEGINTIME](state, value) {
            state.ruleSetting.rule.activityCancelBeginTime = value
        },
        [types.SET_ACTIVITYCANCELENDTIME](state, value) {
            state.ruleSetting.rule.activityCancelEndTime = value
        },
        [types.SET_ACTIVITYCOMMENT](state, value) {
            state.ruleSetting.rule.activityComment = value
        },
        [types.SET_COMMENTENDTIME](state, value) {
            state.ruleSetting.rule.commentEndTime = value
        },
        [types.SET_ROLECANCEL](state, value) {
            state.ruleSetting.rule.roleCancel = value
        },
        [types.SET_ROLECANCELBEGINTIME](state, value) {
            state.ruleSetting.rule.roleCancelBeginTime = value
        },
        [types.SET_ROLECANCELENDTIME](state, value) {
            state.ruleSetting.rule.roleCancelEndTime = value
        },
        [types.SET_SIGNBACK](state, value) {
            state.ruleSetting.rule.signBack = value.signBack
            state.ruleSetting.rule.signBackStartTime = value.signBackStartTime
            state.ruleSetting.rule.signBackEndTime = value.signBackEndTime
            state.ruleSetting.rule.longitude = value.longitude
            state.ruleSetting.rule.latitude = value.latitude
            state.ruleSetting.rule.signType = value.signType
            state.ruleSetting.rule.distance = value.distance
            state.ruleSetting.rule.signPosition = value.signPosition
            state.ruleSetting.rule.duration = value.duration
            state.ruleSetting.rule.signCaption = value.signCaption
        },
        [types.SET_SIGNCONTENT](state, value) {
            state.ruleSetting.signContent = value
        },
        [types.SET_CONTROLLER](state, value) {
            state.ruleSetting.controller = value.controller
            state.ruleSetting.controllerType = value.controllerType
        },
        [types.SET_ORGANIZER](state, value) {
            state.ruleSetting.organizer = value.organizer
            state.ruleSetting.organizerType = value.organizerType
        },
        [types.SET_PARTICIPANT](state, value) {
            state.ruleSetting.participant = value.participant
            state.ruleSetting.participantType = value.participantType
        },
        [types.SET_ACTIVITIESLIST](state, value) {
            state.ruleSetting.rule.activitiesList = value
        },
        [types.SET_ACTIVITIELIST](state, value) {
            state.ruleSetting.activitieList = value
        },
        // ObjectSetting
        [types.SET_LIMITCOLLEGE](state, value) {
            state.objectSetting.object.limitCollege = value
        },
        [types.SET_LIMITMAJOR](state, value) {
            state.objectSetting.object.limitMajor = value
        },
        [types.SET_LIMITGRADE](state, value) {
            state.objectSetting.object.limitGrade = value
        },
        [types.SET_LIMITCLASS](state, value) {
            state.objectSetting.object.limitClass = value
        },
        [types.SET_OTHERCOLLEGE](state, value) {
            state.objectSetting.object.otherCollege = value
        },
        [types.SET_OTHERMAJOR](state, value) {
            state.objectSetting.object.otherMajor = value
        },
        [types.SET_OTHERGRADE](state, value) {
            state.objectSetting.object.otherGrade = value
        },
        [types.SET_OTHERCLASS](state, value) {
            state.objectSetting.object.otherClass = value
        },
        [types.SET_COLLEGE](state, value) {
            state.objectSetting.college = value
        },
        [types.SET_MAJOR](state, value) {
            state.objectSetting.major = value
        },
        [types.SET_GRADE](state, value) {
            state.objectSetting.grade = value
        },
        [types.SET_CLBUM](state, value) {
            state.objectSetting.clbum = value
        },
        [types.SET_BASEINFO](state, value) {
            state.baseInfo = value
        },
        [types.SET_RULESETTING](state, value) {
            state.ruleSetting = value
        },
        [types.SET_OBJECTSETTING](state, value) {
            state.objectSetting = value
        }
    },
    actions: {
        setReportDataById({commit}, activityId) {
            Indicator.open('获取数据中...')
            reportApi.queryReportDataById({activityid: activityId}).then((result) => {
                let baseInfoValue = result.data.baseInfo
                let ruleSettingValue = result.data.ruleSetting
                let objectSettingValue = result.data.objectSetting
                commit(types.SET_BASEINFO, baseInfoValue)
                commit(types.SET_RULESETTING, ruleSettingValue)
                commit(types.SET_OBJECTSETTING, objectSettingValue)
                Indicator.close()
            }).catch(() => {
                Indicator.close()
                MessageBox('提示', '获取活动数据失败,请重试!')
            })
        }
    }
}

export default report
