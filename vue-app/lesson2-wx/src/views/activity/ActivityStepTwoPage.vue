<template>
    <div class="activity-step-two">
        <report-input :isRequired="true" title="活动开始时间" field="activityBeginTime"
                      @reportInputEdit="edit" :defaultValue="activityBeginTimeStr"/>
        <report-input :isRequired="true" title="活动结束时间" field="activityEndTime"
                      @reportInputEdit="edit" :defaultValue="activityEndTimeStr"/>
        <report-input :isRequired="true" title="报名开始时间" field="applicationBeginTime"
                      @reportInputEdit="edit" :defaultValue="applicationBeginTimeStr"/>
        <report-input :isRequired="true" title="报名结束时间" field="applicationEndTime" @reportInputEdit="edit"
                      :defaultValue="applicationEndTimeStr"/>
        <report-input :isRequired="true" title="签到类型" field="signType" @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="活动角色" field="roles" @reportInputEdit="edit"/>
        <report-input title="角色取消" field="roleCancel" @reportInputEdit="edit"/>
        <report-input title="活动补签" field="activityRetroactive" @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="活动评价" field="activityComment" @reportInputEdit="edit"/>
        <div class="btn-wrapper">
            <div class="btn" @click="publish">发布</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="prevStep">上一步</div>
        </div>
        <mt-datetime-picker
            ref="picker"
            type="datetime"
            v-model="pickerValue"
            @confirm="handleConfirm"
            :startDate="startDate">
        </mt-datetime-picker>
    </div>
</template>

<script>
    import ReportInput from './reportActivity/ReportInput'
    import {mapGetters, mapMutations} from 'vuex'
    import tools from '../../utils/tool'
    import * as types from '../../store/mutations-types'
    import {MessageBox, Toast} from 'mint-ui'
    import axios from 'axios'
    import {CONF} from '../../utils/URLConfig'
    import * as cType from '../../store/course-mutations-types'
    import ReportData from './reportActivity/ReportData'

    export default {
        data() {
            return {
                activityBeginTimeStr: '',
                activityEndTimeStr: '',
                applicationBeginTimeStr: '',
                applicationEndTimeStr: '',
                pickerValue: new Date(),
                startDate: new Date(),
                field: ''
            }
        },
        computed: {
            ...mapGetters([
                'activityBeginTime',
                'activityEndTime',
                'applicationBeginTime',
                'applicationEndTime',
                'signContent',
                'controllerType',
                'controller',
                'organizerType',
                'organizer',
                'participantType',
                'participant',
                'commentEndTime',
                'roleCancel',
                'roleCancelEndTime',
                'activityRetroactive',
                'activityRetroEndTime',
                'activityCategory',
                'baseInfo',
                'object',
                'rule',
                'courseObject',
                'courseBaseInfo'
            ])
        },
        components: {
            ReportInput
        },
        created() {
            if (tools.isNotEmpty(this.activityBeginTime) && this.activityBeginTime !== 0) {
                this.activityBeginTimeStr = tools.formatTime(this.activityBeginTime)
            }
            if (tools.isNotEmpty(this.activityEndTime) && this.activityEndTime !== 0) {
                this.activityEndTimeStr = tools.formatTime(this.activityEndTime)
            }
            if (tools.isNotEmpty(this.applicationBeginTime) && this.applicationBeginTime !== 0) {
                this.applicationBeginTimeStr = tools.formatTime(this.applicationBeginTime)
            }
            if (tools.isNotEmpty(this.applicationEndTime) && this.applicationEndTime !== 0) {
                this.applicationEndTimeStr = tools.formatTime(this.applicationEndTime)
            }
            let startDate = new Date((new Date().getTime()) - 24 * 60 * 60 * 365 * 1000)
            this.startDate = startDate
            this.pickerValue = startDate
        },
        methods: {
            ...mapMutations({
                setActivityBeginTime: types.SET_ACTIVITYBEGINTIME,
                setActivityEndTime: types.SET_ACTIVITYENDTIME,
                setApplicationBeginTime: types.SET_APPLICATIONBEGINTIME,
                setApplicationEndTime: types.SET_APPLICATIONENDTIME,
                setObject: types.SET_OBJECTSETTING,
                setBaseInfo: types.SET_BASEINFO,
                setRule: types.SET_RULESETTING,
                setCourseBaseInfo: cType.COURSE_SET_BASEINFO,
                setCourseObject: cType.COURSE_SET_OBJECTSETTING,
                setActivityPlatformText: types.SET_ACTIVITYPLATFORMTEXT,
                setPlatformCategoryText: types.SET_PLATFORMCATEGORYTEXT,
                setActivityLevelText: types.SET_ACTIVITYLEVELTEXT,
                setCourseActivityPlatformText: cType.COURSE_ACTIVITYPLATFORM_TEXT,
                setCoursePlatformCategoryText: cType.COURSE_PLATFORMCATEGORY_TEXT,
                setCourseActivityLevelText: cType.COURSE_ACTIVITYLEVEL_TEXT,
            }),
            prevStep() {
                this.$router.go(-1)
            },
            publish() {
                if (this.activityBeginTime === 0 || tools.isEmpty(this.activityBeginTime)) {
                    MessageBox('提示', '请选择活动开始时间!')
                    return
                }
                if (this.activityEndTime === 0 || tools.isEmpty(this.activityEndTime)) {
                    MessageBox('提示', '请选择活动结束时间!')
                    return
                }
                if (this.applicationBeginTime === 0 || tools.isEmpty(this.applicationBeginTime)) {
                    MessageBox('提示', '请选择报名开始时间!')
                    return
                }
                if (this.applicationEndTime === 0 || tools.isEmpty(this.applicationEndTime)) {
                    MessageBox('提示', '请选择报名结束时间!')
                    return
                }
                if (tools.isEmpty(this.signContent)) {
                    MessageBox('提示', '请设置签到信息!')
                    return
                }
                if (tools.isEmpty(this.controllerType) && tools.isEmpty(this.controller) && tools.isEmpty(this.organizerType) && tools.isEmpty(this.organizer) && tools.isEmpty(this.participantType) && tools.isEmpty(this.participant)) {
                    MessageBox('提示', '请至少选择一个角色!')
                    return
                }
                if (this.commentEndTime === 0 || tools.isEmpty(this.commentEndTime)) {
                    MessageBox('提示', '评论结束时间不能为空!')
                    return
                }

                if (this.applicationEndTime > this.activityBeginTime) {
                    MessageBox('提示', '报名时间应在开课时间前!')
                    return
                }

                // 签到时间应在报名时间之后
                for (let i = 0; i < this.signContent.length; i++) {
                    let sign = this.signContent;
                    if (sign.signStartTime < this.applicationEndTime) {
                        MessageBox('提示', '签到时间应在报名时间后!')
                        return
                    }
                }

                let len = this.signContent.length - 1;
                for (let i = len; i >= 0; i--) {
                    let signItem = this.signContent[i];
                    for (let j = i - 1; j >= 0; j--) {
                        let compareItem = this.signContent[j];
                        if (signItem.signStartTime < compareItem.signStartTime && signItem.signEndTime > compareItem.signStartTime) {
                            MessageBox('提示', '签到时间不能重叠!')
                            return
                        }
                        if (signItem.signStartTime < compareItem.signEndTime && signItem.signEndTime > compareItem.signEndTime) {
                            MessageBox('提示', '签到时间不能重叠!')
                            return
                        }
                    }
                }

                if (this.commentEndTime < this.activityEndTime) {
                    MessageBox('提示', '评论截止时间应在活动结束时间后!')
                    return
                }

                if (this.roleCancel === 1) {
                    if (this.roleCancelEndTime > this.activityBeginTime) {
                        MessageBox('提示', '角色取消时间应在活动开始前!')
                        return
                    }
                }

                if (this.activityRetroactive === 1) {
                    if (this.activityRetroBeginTime < this.activityEndTime) {
                        MessageBox('提示', '活动补签时间应在活动结束后!')
                        return
                    }
                }

                // 发布
                let para = {}
                if (this.activityCategory === 0) {
                    para = {
                        baseInfo: this.baseInfo,
                        ruleSetting: this.rule,
                        objectSetting: this.object
                    }
                } else {
                    para = {
                        baseInfo: this.courseBaseInfo,
                        ruleSetting: this.rule,
                        objectSetting: this.courseObject
                    }
                }
                tools.deleteEmptyProperty(para)
                axios.put(CONF.ajaxUrl.report, para).then((response) => {
                    if (response.data.code === 0) {
                        Toast(response.data.msg)
                        this.setObject(ReportData.objectSetting)
                        this.setBaseInfo(ReportData.baseInfo)
                        this.setRule(ReportData.ruleSetting)
                        this.setCourseBaseInfo(ReportData.baseInfo)
                        this.setCourseObject(ReportData.objectSetting)
                        this.setActivityPlatformText('')
                        this.setPlatformCategoryText('')
                        this.setActivityLevelText('')
                        this.setCourseActivityPlatformText('')
                        this.setCoursePlatformCategoryText('')
                        this.setCourseActivityLevelText('')
                        this.$router.push({
                            path: '/activity'
                        })
                    }
                })

            },
            edit(field) {
                switch (field) {
                    case 'activityBeginTime': {
                        if (tools.isNotEmpty(this.activityBeginTime) && this.activityBeginTime !== 0) {
                            this.pickerValue = new Date(this.activityBeginTime * 1000)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'activityEndTime': {
                        if (tools.isNotEmpty(this.activityEndTime) && this.activityEndTime !== 0) {
                            this.pickerValue = new Date(this.activityEndTime * 1000)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'applicationBeginTime': {
                        if (tools.isNotEmpty(this.applicationBeginTime) && this.applicationBeginTime !== 0) {
                            this.pickerValue = new Date(this.applicationBeginTime * 1000)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'applicationEndTime': {
                        if (tools.isNotEmpty(this.applicationEndTime) && this.applicationEndTime !== 0) {
                            this.pickerValue = new Date(this.applicationEndTime * 1000)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'signType': {
                        this.$router.push({
                            path: '/signType'
                        })
                    }
                        break;
                    case 'roles': {
                        this.$router.push({
                            path: '/roles',
                            query: {
                                path: 'activityReport'
                            }
                        })
                    }
                        break;
                    case 'roleCancel': {
                        this.$router.push({
                            path: '/roleCancel',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'activityRetroactive': {
                        this.$router.push({
                            path: '/roleCancel',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'activityComment': {
                        this.$router.push({
                            path: '/roleCancel',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    default: {

                    }
                        break;
                }
            },
            handleConfirm() {
                switch (this.field) {
                    case 'activityBeginTime': {
                        this.setActivityBeginTime(this.pickerValue.getTime() / 1000)
                        this.activityBeginTimeStr = tools.formatTime(this.activityBeginTime)
                        this.pickerValue = this.startDate
                    }
                        break;
                    case 'activityEndTime': {
                        this.setActivityEndTime(this.pickerValue.getTime() / 1000)
                        this.activityEndTimeStr = tools.formatTime(this.activityEndTime)
                        this.pickerValue = this.startDate
                    }
                        break;
                    case 'applicationBeginTime': {
                        this.setApplicationBeginTime(this.pickerValue.getTime() / 1000)
                        this.applicationBeginTimeStr = tools.formatTime(this.applicationBeginTime)
                        this.pickerValue = this.startDate
                    }
                        break;
                    case 'applicationEndTime': {
                        this.setApplicationEndTime(this.pickerValue.getTime() / 1000)
                        this.applicationEndTimeStr = tools.formatTime(this.applicationEndTime)
                        this.pickerValue = this.startDate
                    }
                        break;
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .activity-step-two {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
        z-index: 2;
        overflow: auto;
        .btn-wrapper {
            padding: 0 0.4267rem;
            margin-top: 0.5333rem;
            margin-bottom: 0.6667rem;
            .btn {
                height: 1.3333rem;
                background-color: #0099ff;
                border-radius: 0.2rem;
                font-size: 0.48rem;
                color: #ffffff;
                text-align: center;
                line-height: 1.3333rem;
            }
            .btn:active {
                background-color: #0089e5;
            }
            .btn.cancel {
                background-color: #ffffff;
                border: solid 0.0133rem #0099ff;
                color: #0099ff;
            }
            .btn.cancel:active {
                border: solid 0.0133rem #0089e5;
                color: #0089e5;
                background-color: #ffffff;
            }
        }
    }
</style>
