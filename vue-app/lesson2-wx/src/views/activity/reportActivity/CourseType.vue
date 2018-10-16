<template>
    <div class="course-type">
        <report-input :isRequired="true" title="课程名称" field="course-activityName"
                      @reportInputEdit="edit" :defaultValue="courseActivityName"/>
        <report-input :isRequired="true" title="活动分类" :defaultValue="courseActivityType" field="course-activityType"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="活动级别" :defaultValue="courseActivityLevelText"
                      field="course-activityLevel"
                      @reportInputEdit="edit"/>
        <report-input title="活动地点" :defaultValue="courseAddress"
                      field="course-address"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="开课老师" defaultValue=""
                      field="teacher"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向学生" field="course-student" @reportInputEdit="edit"/>
        <report-input class="report-textarea" :isTextArea="true" title="课程介绍" :defaultValue="courseCourseDescription"
                      field="course-courseDescription"
                      @reportInputEdit="edit"/>
        <report-input class="report-textarea" :isTextArea="true" title="提醒内容" :defaultValue="courseRemind"
                      field="course-remind"
                      @reportInputEdit="edit"/>
        <div class="btn-wrapper">
            <div class="btn" @click="nextPage">下一步</div>
        </div>
        <transition name="modal">
            <activity-level v-if="isShowActivityLevel" field="activityLevel" v-on:selectBottom="selectBottom"
                            v-on:cancelEdit="cancelSelectBottom"/>
        </transition>
    </div>
</template>

<script>
    import ReportInput from './ReportInput'
    import UploadStudents from './UploadStudents'
    import CurriculumTime from './CurriculumTime'
    import {mapMutations, mapGetters} from 'vuex'
    import tools from '../../../utils/tool'
    import {MessageBox} from 'mint-ui'
    import * as types from '../../../store/course-mutations-types'
    import ActivityLevel from './BottomModal'

    export default {
        data() {
            return {
                courseActivityType: '',
                isShowActivityLevel: false
            }
        },
        components: {
            ReportInput,
            UploadStudents,
            CurriculumTime,
            ActivityLevel
        },
        computed: {
            ...mapGetters([
                'courseActivityName',
                'courseActivityPlatformText',
                'coursePlatformCategoryText',
                'courseActivityLevelText',
                'courseAddress',
                'courseCourseDescription',
                'courseRemind',
                'courseCoverPicture',
                'courseActivityPlatform',
                'coursePlatformCategory',
                'courseActivityLevel',
                'teacherId',
                'teacherName',
                'courseLimitCollege',
                'courseLimitMajor',
                'courseLimitGrade',
                'courseLimitClass',
            ])
        },
        methods: {
            ...mapMutations({
                setCourseActivityLevel: types.COURSE_SET_ACTIVITYLEVEL,
                setCourseActivityLevelText: types.COURSE_ACTIVITYLEVEL_TEXT
            }),
            nextPage() {
                if(tools.isEmpty(this.courseCoverPicture)){
                    MessageBox('提示', '封面图片不能为空!')
                    return
                }
                if(tools.isEmpty(this.courseActivityName)){
                    MessageBox('提示','课程名称不能为空!');
                    return
                }
                if(tools.isEmpty(this.courseActivityPlatform) || tools.isEmpty(this.coursePlatformCategory)){
                    MessageBox('提示', '请选择活动类别!')
                    return
                }
                if(tools.isEmpty(this.courseActivityLevel)){
                    MessageBox('提示', '请选择获取级别!')
                    return
                }
                if(tools.isEmpty(this.teacherId) || tools.isEmpty(this.teacherName)){
                    MessageBox('提示', '请选择开课教师!')
                    return
                }
                if (this.courseLimitCollege === -1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                if (this.courseLimitMajor === -1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                if (this.courseLimitGrade === -1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                if (this.courseLimitClass === -1) {
                    MessageBox('提示', '请选择班级!')
                    return
                }
                this.$router.push({
                    path: '/activityReport'
                })
            },
            edit(field) {
                switch (field) {
                    case 'course-activityName': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'course-activityType': {
                        this.$router.push({
                            path: '/selectActivityType',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case 'course-activityLevel': {
                        this.isShowActivityLevel = true
                    }
                        break;
                    case  'course-address': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case  'course-courseDescription': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case  'course-remind': {
                        this.$router.push({
                            path: '/reportEdit',
                            query: {
                                field: field
                            }
                        })
                    }
                        break;
                    case  'teacher': {
                        this.$router.push({
                            path: '/selectTeacher'
                        })
                    }
                        break;
                    case 'course-student': {
                        this.$router.push({
                            path: '/courseFaceStudent'
                        })
                    }
                        break;
                }
            },
            selectBottom(val) {
                this.setCourseActivityLevel(val[0])
                this.setCourseActivityLevelText(val[1])
                this.isShowActivityLevel = false
            },
            cancelSelectBottom() {
                this.isShowActivityLevel = false
            }
        },
        created() {
            if (tools.isNotEmpty(this.courseActivityPlatformText) && tools.isNotEmpty(this.coursePlatformCategoryText)) {
                this.courseActivityType = this.courseActivityPlatformText + '-' + this.coursePlatformCategoryText
            }
        }
    }
</script>

<style scoped lang="scss">
    .course-type {
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
