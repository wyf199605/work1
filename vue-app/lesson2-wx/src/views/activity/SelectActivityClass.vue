<template>
    <div ref="modal" class="select-activity-class">
        <accordion :children="accordionData" v-on:activityClass="activityClass"/>
        <div class="btn-wrapper">
            <div class="btn" @click="confirm()">确认</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="cancel()">取消</div>
        </div>
    </div>
</template>

<script>
    import Accordion from '../../components/Accordion/Accordion'
    import report from '@/api/report'
    import tools from '@/utils/tool'
    import {MessageBox} from 'mint-ui'
    import {mapMutations} from 'vuex'
    import * as types from '../../store/mutations-types'
    import * as cTypes from '../../store/course-mutations-types'

    export default {
        data() {
            return {
                accordionData: [],
                titleArr: [],
                field:''
            }
        },
        created() {
            this.field = this.$route.query.field
            report.getActivityPlatform().then(result => {
                let data = result.data
                this.accordionData = data
            })
        },
        components: {
            Accordion
        },
        methods: {
            ...mapMutations({
                setActivityType:types.SET_ACTIVITYPLATFORM,
                setActivityPlatform:types.SET_ACTIVITYPLATFORMTEXT,
                setPlatformCategory:types.SET_PLATFORMCATEGORYTEXT,
                setCourseActivityType:cTypes.COURSE_SET_ACTIVITYPLATFORM,
                setCourseActivityPlatform:cTypes.COURSE_ACTIVITYPLATFORM_TEXT,
                setCoursePlatformCategory:cTypes.COURSE_PLATFORMCATEGORY_TEXT,
                setIsShowCourse:cTypes.IS_SHOW_COURSE
            }),
            activityClass(titleArr) {
                this.titleArr = titleArr
            },
            confirm() {
                if (tools.isNotEmpty(this.titleArr)) {
                    if (this.field === 'activityType'){
                        this.setActivityType([this.titleArr[0].ID,this.titleArr[1].ID])
                        this.setActivityPlatform(this.titleArr[0].TITLE)
                        this.setPlatformCategory(this.titleArr[1].TITLE)
                        this.setIsShowCourse(false)
                    }else{
                        this.setCourseActivityType([this.titleArr[0].ID,this.titleArr[1].ID])
                        this.setCourseActivityPlatform(this.titleArr[0].TITLE)
                        this.setCoursePlatformCategory(this.titleArr[1].TITLE)
                        this.setIsShowCourse(true)
                    }
                    this.$router.go(-1)
                } else {
                    MessageBox('提示', '活动分类不能为空!')
                }
            },
            cancel() {
                this.$router.go(-1)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .select-activity-class {
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
            .cancel {
                background-color: #ffffff;
                border: solid 0.0133rem #0099ff;
                color: #0099ff;
            }
            .cancel:active {
                border: solid 0.0133rem #0089e5;
                color: #0089e5;
                background-color: #ffffff;
            }
        }
    }
</style>
