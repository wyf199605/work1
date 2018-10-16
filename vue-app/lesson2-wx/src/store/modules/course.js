import * as types from '../course-mutations-types'
import {MessageBox, Indicator} from 'mint-ui'

const report = {
    state: {
        isShowCourse:false,
        courseActivityPlatformText: '',
        coursePlatformCategoryText: '',
        courseActivityLevelText: '',
        // tempSponsor: [],
        // tempAssist: [],
        // tempContractor: [],
        // tempSignPosition: [],
        // tempSignStartTime: 0,
        // tempSignEndTime: 0,
        // tempSignBack: 0,
        // tempSignType: 0,
        // tempDuration: 0,
        tempCourseCollege:[],
        tempCourseMajor:[],
        tempCourseGrade:[],
        tempCourseClbum:[],
        tempCourseOtherCollege:0,
        tempCourseOtherMajor:0,
        tempCourseOtherGrade:0,
        tempCourseOtherClbum:0,
        tempCourseLimitCollege:-1,
        tempCourseLimitMajor:-1,
        tempCourseLimitGrade:-1,
        tempCourseLimitClass:-1,
       course:{
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
       }
    },
    mutations: {
        [types.IS_SHOW_COURSE](state,value){
          state.isShowCourse = value
        },
        [types.COURSE_ACTIVITYPLATFORM_TEXT](state,value){
            state.courseActivityPlatformText = value
        },
        [types.COURSE_PLATFORMCATEGORY_TEXT](state,value){
            state.coursePlatformCategoryText = value
        },
        [types.COURSE_ACTIVITYLEVEL_TEXT](state, value) {
            state.courseActivityLevelText = value
        },
        // [types.SET_ACTIVITYPLATFORMTEXT](state, value) {
        //     state.activityPlatformText = value
        // },
        // [types.SET_PLATFORMCATEGORYTEXT](state, value) {
        //     state.platformCategoryText = value
        // },
        // [types.SET_TEMP_SPONSOR](state, value) {
        //     state.tempSponsor = value
        // },
        // [types.SET_TEMP_ASSIST](state, value) {
        //     state.tempAssist = value
        // },
        // [types.SET_TEMP_CONTRACTOR](state, value) {
        //     state.tempContractor = value
        // },
        // [types.SET_TEMP_SIGNPOSITION](state, value) {
        //     state.tempSignPosition = value
        // },
        // [types.SET_TEMP_SIGN_START_TIME](state, value) {
        //     state.tempSignStartTime = value
        // },
        // [types.SET_TEMP_SIGN_END_TIME](state, value) {
        //     state.tempSignEndTime = value
        // },
        // [types.SET_TEMP_SIGNBACK](state, value) {
        //     state.tempSignBack = value
        // },
        // [types.SET_TEMP_SIGNTYPE](state, value) {
        //     state.tempSignType = value
        // },
        // [types.SET_TEMP_DURATION](state, value) {
        //     state.tempDuration = value
        // },
        [types.COURSE_SET_TEMP_COLLEGE](state, value) {
            state.tempCourseCollege = value
        },
        [types.COURSE_SET_TEMP_MAJOR](state, value) {
            state.tempCourseMajor = value
        },
        [types.COURSE_SET_TEMP_GRADE](state, value) {
            state.tempCourseGrade = value
        },
        [types.COURSE_SET_TEMP_CLBUM](state, value) {
            state.tempCourseClbum = value
        },
        [types.COURSE_SET_TEMP_OTHERCOLLEGE](state, value) {
            state.tempCourseOtherCollege = value
        },
        [types.COURSE_SET_TEMP_OTHERMAJOR](state, value) {
            state.tempCourseOtherMajor = value
        },
        [types.COURSE_SET_TEMP_OTHERGRADE](state, value) {
            state.tempCourseOtherGrade = value
        },
        [types.COURSE_SET_TEMP_OTHERCLBUM](state, value) {
            state.tempCourseOtherClbum = value
        },
        [types.COURSE_SET_TEMP_LIMITCOLLEGE](state, value) {
            state.tempCourseLimitCollege = value
        },
        [types.COURSE_SET_TEMP_LIMITMAJOR](state, value) {
            state.tempCourseLimitMajor = value
        },
        [types.COURSE_SET_TEMP_LIMITGRADE](state, value) {
            state.tempCourseLimitGrade = value
        },
        [types.COURSE_SET_TEMP_LIMITCLASS](state, value) {
            state.tempCourseLimitClass = value
        },
        // BaseInfo
        [types.COURSE_SET_ACTIVITYID](state, value) {
            state.course.baseInfo.activity.activityId = value
        },
        [types.COURSE_SET_ACTIVITYCATETORY](state, value) {
            state.course.baseInfo.activity.activityCategory = value
        },
        [types.COURSE_SET_ACTIVITYLEVEL](state, value) {
            state.course.baseInfo.activity.activityLevel = value
        },
        [types.COURSE_SET_ACTIVITYATTRIBUTION](state, value) {
            state.course.baseInfo.activity.activityAttribution = value
        },
        [types.COURSE_SET_ACTIVITYPLATFORM](state, value) {
            state.course.baseInfo.activity.activityPlatform = value[0]
            state.course.baseInfo.activity.platformCategory = value[1]
        },
        [types.COURSE_SET_ACTIVITYNAME](state, value) {
            state.course.baseInfo.activity.activityName = value
        },
        [types.COURSE_SET_SLOGAN](state, value) {
            state.course.baseInfo.activity.slogan = value
        },
        [types.COURSE_SET_ADDRESS](state, value) {
            state.course.baseInfo.activity.address = value
        },
        [types.COURSE_SET_TEACHER](state, value) {
            state.course.baseInfo.activity.teacherId = value.teacherId
            state.course.baseInfo.activity.teacherName = value.teacherName
            state.course.baseInfo.activity.teacherPosition = value.teacherPosition
        },
        [types.COURSE_SET_COURSEDESCRIPTION](state, value) {
            state.course.baseInfo.activity.courseDescription = value
        },
        [types.COURSE_SET_COVERPICTURE](state, value) {
            state.course.baseInfo.activity.coverPicture = value
        },
        [types.COURSE_SET_REMIND](state, value) {
            state.course.baseInfo.activity.remind = value
        },
        [types.COURSE_SET_REMARK](state, value) {
            state.course.baseInfo.activity.remark = value
        },
        [types.COURSE_SET_ACCESSORY](state, value) {
            state.course.baseInfo.activity.accessory = value
        },
        [types.COURSE_SET_SPONSOR](state, value) {
            state.course.baseInfo.sponsor = value
        },
        [types.COURSE_SET_CONTRACTOR](state, value) {
            state.course.baseInfo.contractor = value
        },
        [types.COURSE_SET_ASSIST](state, value) {
            state.course.baseInfo.assist = value
        },
        [types.COURSE_SET_CHARGE](state, value) {
            state.course.baseInfo.charge = value
        },
        // ObjectSetting
        [types.COURSE_SET_LIMITCOLLEGE](state, value) {
            state.course.objectSetting.object.limitCollege = value
        },
        [types.COURSE_SET_LIMITMAJOR](state, value) {
            state.course.objectSetting.object.limitMajor = value
        },
        [types.COURSE_SET_LIMITGRADE](state, value) {
            state.course.objectSetting.object.limitGrade = value
        },
        [types.COURSE_SET_LIMITCLASS](state, value) {
            state.course.objectSetting.object.limitClass = value
        },
        [types.COURSE_SET_OTHERCOLLEGE](state, value) {
            state.course.objectSetting.object.otherCollege = value
        },
        [types.COURSE_SET_OTHERMAJOR](state, value) {
            state.course.objectSetting.object.otherMajor = value
        },
        [types.COURSE_SET_OTHERGRADE](state, value) {
            state.course.objectSetting.object.otherGrade = value
        },
        [types.COURSE_SET_OTHERCLASS](state, value) {
            state.course.objectSetting.object.otherClass = value
        },
        [types.COURSE_SET_COLLEGE](state, value) {
            state.course.objectSetting.college = value
        },
        [types.COURSE_SET_MAJOR](state, value) {
            state.course.objectSetting.major = value
        },
        [types.COURSE_SET_GRADE](state, value) {
            state.course.objectSetting.grade = value
        },
        [types.COURSE_SET_CLBUM](state, value) {
            state.course.objectSetting.clbum = value
        },
        [types.COURSE_SET_BASEINFO](state, value) {
            state.course.baseInfo = value
        },
        [types.COURSE_SET_RULESETTING](state, value) {
            state.course.ruleSetting = value
        },
        [types.COURSE_SET_OBJECTSETTING](state, value) {
            state.course.objectSetting = value
        }
    }
}

export default report
