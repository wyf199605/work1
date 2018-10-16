<template>
    <div class="report-activity">
        <activity-category/>
        <cover-picture/>
        <activity-type v-if="activityCategory === 0"/>
        <course-type v-else/>
    </div>
</template>

<script>
    import Bus from '../../bus'
    import CoverPicture from './reportActivity/UploadCoverPicture'
    import ActivityCategory from './reportActivity/ActivityCategory'
    import ActivityType from './reportActivity/ActivityType'
    import CourseType from './reportActivity/CourseType'
    import {mapGetters, mapMutations} from 'vuex'
    import * as types from '../../store/mutations-types'
    import * as cTypes from '../../store/course-mutations-types'
    export default {
        data() {
            return {

            }
        },
        components: {
            CoverPicture,
            ActivityCategory,
            ActivityType,
            CourseType
        },
        computed: {
            ...mapGetters([
                'activityCategory'
            ])
        },
        methods: {
            ...mapMutations({
                setCoverPicture: types.SET_COVERPICTURE,
                setActivityCategory: types.SET_ACTIVITYCATETORY,
                setCourseCoverPicture:cTypes.COURSE_SET_COVERPICTURE,
                setCourseActivityCategory:cTypes.COURSE_SET_ACTIVITYCATETORY
            })
        },
        mounted() {
            this.imgSrc = this.coverPicture
            // 上传图片
            Bus.$on('coverimg', val => {
                this.setCoverPicture(val)
                this.setCourseCoverPicture(val)
            })
            Bus.$on('activitycategorychange', val => {
                this.setActivityCategory(val)
                this.setCourseActivityCategory(val)
            })
        },
        created() {
            // this.$store.dispatch('setReportDataById', '3780.0')
        }
    }
</script>

<style lang="scss">
    .report-activity {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100%;
        .report-input.report-textarea {
            height: 3.5333rem !important;
            .report-input-wrapper {
                align-items: flex-start;
                .report-input-right,
                .report-input-left {
                    padding-top: 0.4rem;
                }
                .report-input-right {
                    align-items: flex-start;
                }
            }
        }
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
