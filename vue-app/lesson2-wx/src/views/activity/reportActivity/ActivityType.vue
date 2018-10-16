<template>
    <div class="activity-type">
        <report-input :isRequired="true" title="活动名称" :defaultValue="activityName" field="activityName"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="活动分类" :defaultValue="activityType" field="activityType"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="活动级别" :defaultValue="activityLevelText" field="activityLevel"
                      @reportInputEdit="edit"/>
        <report-input title="活动地点" field="address" :defaultValue="address" @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="主办信息" field="sponsorInfo" @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向学生" field="student" @reportInputEdit="edit"/>
        <report-input class="report-textarea" :isTextArea="true" title="活动介绍" field="courseDescription"
                      :defaultValue="courseDescription" @reportInputEdit="edit"/>
        <div class="btn-wrapper">
            <div class="btn" @click="nextStep">下一步</div>
        </div>
        <transition name="modal">
            <activity-level v-if="isShowActivityLevel" field="activityLevel" v-on:selectBottom="selectBottom"
                            v-on:cancelEdit="cancelSelectBottom"/>
        </transition>
    </div>
</template>

<script>
    import ReportInput from './ReportInput'
    import {mapGetters, mapMutations} from 'vuex'
    import tools from '../../../utils/tool'
    import ActivityLevel from './BottomModal'
    import * as types from '../../../store/mutations-types'
    import {MessageBox} from 'mint-ui'

    export default {
        data() {
            return {
                activityType: '',
                isShowActivityLevel: false
            }
        },
        components: {
            ReportInput,
            ActivityLevel
        },
        computed: {
            ...mapGetters([
                'activityName',
                'activityLevel',
                'activityPlatform',
                'platformCategory',
                'activityPlatformText',
                'platformCategoryText',
                'activityLevelText',
                'courseDescription',
                'address',
                'limitCollege',
                'limitMajor',
                'limitGrade',
                'limitClass',
                'sponsor',
                'charge',
                'coverPicture'
            ])
        },
        created() {
            if (tools.isNotEmpty(this.activityPlatformText) && tools.isNotEmpty(this.platformCategoryText)) {
                this.activityType = this.activityPlatformText + '-' + this.platformCategoryText
            }
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
                setActivityLevelText: types.SET_ACTIVITYLEVELTEXT,
                setActivityLevel: types.SET_ACTIVITYLEVEL
            }),
            nextStep() {
                if(tools.isEmpty(this.coverPicture)){
                    MessageBox('提示', '封面图片不能为空!')
                    return
                }
                if(tools.isEmpty(this.activityName)){
                    MessageBox('提示', '活动名称不能为空!')
                    return
                }
                if(tools.isEmpty(this.activityPlatform) || tools.isEmpty(this.platformCategory)){
                    MessageBox('提示', '请选择活动类别!')
                    return
                }
                if(tools.isEmpty(this.activityLevel)){
                    MessageBox('提示', '请选择获取级别!')
                    return
                }
                if(tools.isEmpty(this.sponsor)){
                    MessageBox('提示', '主办方不能为空!')
                    return
                }
                if(tools.isEmpty(this.charge)){
                    MessageBox('提示', '咨询人不能为空!')
                    return
                }
                if (this.limitCollege === -1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                if (this.limitMajor === -1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                if (this.limitGrade === -1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                if (this.limitClass === -1) {
                    MessageBox('提示', '请选择班级!')
                    return
                }
                this.$router.push({
                    path: '/activityReport'
                })
            },
            edit(field) {
                switch (field) {
                    case 'activityName': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'address': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'courseDescription': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'activityType': {
                        this.$router.push({
                            path: '/selectActivityType',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'activityLevel': {
                        this.isShowActivityLevel = true
                    }
                        break;
                    case 'sponsorInfo': {
                        this.$router.push({
                            path: '/sponsorInfo'
                        })
                    }
                        break;
                    case 'student': {
                        this.$router.push({
                            path: '/faceStudent'
                        })
                    }
                        break;
                    default: {

                    }
                        break;
                }
            },
            selectBottom(val) {
                this.setActivityLevel(val[0])
                this.setActivityLevelText(val[1])
                this.isShowActivityLevel = false
            },
            cancelSelectBottom() {
                this.isShowActivityLevel = false
            }
        }
    }
</script>

<style lang="scss" scoped>
    .activity-type {
        .modal-enter-active {
            animation: modal-in 0.2s;
        }
        .modal-leave-active {
            animation: modal-in 0.2s reverse;
        }
        @keyframes modal-in {
            0% {
                transform: translate(0, 100%);
            }
            100% {
                transform: translate(0, 0);
            }
        }
    }
</style>
