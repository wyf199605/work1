<template>
    <div class="face-student">
        <report-input :isRequired="true" title="面向学院" :defaultValue="collegeStr" field="course-college"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向专业" :defaultValue="majorStr" field="course-major"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向年级" :defaultValue="gradeStr" field="course-grade"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向班级" :defaultValue="clbumStr" field="course-clbum"
                      @reportInputEdit="edit"/>
        <report-input title="其他学院" :defaultValue="otherCollegeValue === -1 ? '' : selectArr[otherCollegeValue]"
                      field="course-otherCollege"
                      @reportInputEdit="edit"/>
        <report-input title="其他专业" :defaultValue="otherMajorValue === -1 ? '' : selectArr[otherMajorValue]"
                      field="course-otherMajor"
                      @reportInputEdit="edit"/>
        <report-input title="其他班级" :defaultValue="otherClbumValue === -1 ? '' : selectArr[otherClbumValue]"
                      field="course-otherClbum"
                      @reportInputEdit="edit"/>
        <report-input title="其他年级" :defaultValue="otherGradeValue === -1 ? '' : selectArr[otherGradeValue]"
                      field="course-otherGrade"
                      @reportInputEdit="edit"/>
        <div class="btn-wrapper">
            <div class="btn" @click="save">确认</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="cancel">取消</div>
        </div>
        <transition name="modal">
            <bottom-modal v-if="showModal" field="otherCollege" v-on:selectBottom="selectBottom"
                          v-on:cancelEdit="cancelSelectBottom"/>
        </transition>
    </div>
</template>

<script>
    import ReportInput from './reportActivity/ReportInput'
    import {mapGetters, mapMutations} from 'vuex'
    import tools from '../../utils/tool'
    import BottomModal from './reportActivity/BottomModal'
    import * as types from '../../store/course-mutations-types'
    import {MessageBox} from 'mint-ui'

    export default {
        components: {
            ReportInput,
            BottomModal
        },
        data() {
            return {
                collegeStr: '',
                majorStr: '',
                gradeStr: '',
                clbumStr: '',
                otherCollegeValue: 0,
                otherMajorValue: 0,
                otherClbumValue: 0,
                otherGradeValue: 0,
                showModal: false,
                modalField: '',
                selectArr: ['不限', '允许报名但不给学分', '不允许报名']
            }
        },
        computed: {
            ...mapGetters([
                'courseCollege',
                'courseMajor',
                'courseGrade',
                'courseClbum',
                'courseOtherCollege',
                'courseOtherMajor',
                'courseOtherGrade',
                'courseOtherClass',
                'courseLimitCollege',
                'courseLimitMajor',
                'courseLimitGrade',
                'courseLimitClass',
                'tempCourseCollege',
                'tempCourseMajor',
                'tempCourseGrade',
                'tempCourseClbum',
                'tempCourseOtherCollege',
                'tempCourseOtherMajor',
                'tempCourseOtherGrade',
                'tempCourseOtherClbum',
                'tempCourseLimitCollege',
                'tempCourseLimitMajor',
                'tempCourseLimitGrade',
                'tempCourseLimitClass'
            ])
        },
        created() {

        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (from.path === '/reportActivity') {
                    vm.otherCollegeValue = vm.courseOtherCollege
                    vm.otherMajorValue = vm.courseOtherMajor
                    vm.otherGradeValue = vm.courseOtherGrade
                    vm.otherClbumValue = vm.courseOtherClass
                    vm.setCourseTempLimitCollege(vm.courseLimitCollege)
                    vm.setCourseTempLimitMajor(vm.courseLimitMajor)
                    vm.setCourseTempLimitGrade(vm.courseLimitGrade)
                    vm.setCourseTempLimitClass(vm.courseLimitClass)
                    vm.collegeStr = vm.arrayToStr(vm.courseCollege, vm.tempCourseLimitCollege)
                    vm.majorStr = vm.arrayToStr(vm.courseMajor, vm.tempCourseLimitMajor)
                    vm.gradeStr = vm.arrayToStr(vm.courseGrade, vm.tempCourseLimitGrade)
                    vm.clbumStr = vm.arrayToStr(vm.courseClbum, vm.tempCourseLimitClass)
                    vm.setCourseTempCollege(vm.courseCollege)
                    vm.setCourseTempMajor(vm.courseMajor)
                    vm.setCourseTempGrade(vm.courseGrade)
                    vm.setCourseTempClbum(vm.courseClbum)
                    vm.setCourseTempOtherCollege(vm.courseOtherCollege)
                    vm.setCourseTempOtherMajor(vm.courseOtherMajor)
                    vm.setCourseTempOtherGrade(vm.courseOtherGrade)
                    vm.setCourseTempOtherClbum(vm.courseOtherClass)
                } else {
                    vm.collegeStr = vm.arrayToStr(vm.tempCourseCollege, vm.tempCourseLimitCollege)
                    vm.majorStr = vm.arrayToStr(vm.tempCourseMajor, vm.tempCourseLimitMajor)
                    vm.gradeStr = vm.arrayToStr(vm.tempCourseGrade, vm.tempCourseLimitGrade)
                    vm.clbumStr = vm.arrayToStr(vm.tempCourseClbum, vm.tempCourseLimitClass)
                    vm.otherCollegeValue = vm.tempCourseOtherCollege
                    vm.otherMajorValue = vm.tempCourseOtherMajor
                    vm.otherGradeValue = vm.tempCourseOtherGrade
                    vm.otherClbumValue = vm.tempCourseOtherClbum
                }
            })
        },
        beforeRouteLeave(to, from, next) {
            if (to.path === '/selectCollege') {
                this.setCourseTempOtherCollege(this.otherCollegeValue)
                this.setCourseTempOtherMajor(this.otherMajorValue)
                this.setCourseTempOtherGrade(this.otherGradeValue)
                this.setCourseTempOtherClbum(this.otherClbumValue)
                next()
            } else {
                next()
            }
        },
        methods: {
            ...mapMutations({
                setCourseTempCollege: types.COURSE_SET_TEMP_COLLEGE,
                setCourseTempMajor: types.COURSE_SET_TEMP_MAJOR,
                setCourseTempGrade: types.COURSE_SET_TEMP_GRADE,
                setCourseTempClbum: types.COURSE_SET_TEMP_CLBUM,
                setCourseTempOtherCollege: types.COURSE_SET_TEMP_OTHERCOLLEGE,
                setCourseTempOtherMajor: types.COURSE_SET_TEMP_OTHERMAJOR,
                setCourseTempOtherGrade: types.COURSE_SET_TEMP_OTHERGRADE,
                setCourseTempOtherClbum: types.COURSE_SET_TEMP_OTHERCLBUM,
                setCourseTempLimitCollege: types.COURSE_SET_TEMP_LIMITCOLLEGE,
                setCourseTempLimitMajor: types.COURSE_SET_TEMP_LIMITMAJOR,
                setCourseTempLimitGrade: types.COURSE_SET_TEMP_LIMITGRADE,
                setCourseTempLimitClass: types.COURSE_SET_TEMP_LIMITCLASS,
                setCourseCollege: types.COURSE_SET_COLLEGE,
                setCourseMajor: types.COURSE_SET_MAJOR,
                setCourseGrade: types.COURSE_SET_GRADE,
                setCourseClbum: types.COURSE_SET_CLBUM,
                setCourseLimitCollege: types.COURSE_SET_LIMITCOLLEGE,
                setCourseLimitMajor: types.COURSE_SET_LIMITMAJOR,
                setCourseLimitGrade: types.COURSE_SET_LIMITGRADE,
                setCourseLimitClass: types.COURSE_SET_LIMITCLASS,
                setCourseOtherCollege: types.COURSE_SET_OTHERCOLLEGE,
                setCourseOtherMajor: types.COURSE_SET_OTHERMAJOR,
                setCourseOtherGrade: types.COURSE_SET_OTHERGRADE,
                setCourseOtherClass: types.COURSE_SET_OTHERCLASS,
                setIsShowCourse:types.IS_SHOW_COURSE
            }),
            edit(field) {
                let fields = ['course-college', 'course-major', 'course-grade', 'course-clbum']
                if (fields.indexOf(field) >= 0) {
                    this.$router.push({
                        path: '/courseSelectCollege',
                        query: {
                            field: field
                        }
                    })
                } else {
                    this.modalField = field
                    this.showModal = true
                }
            },
            arrayToStr(arr, limit) {
                if (limit === -1) {
                    return ''
                } else if (limit === 0) {
                    return '不限'
                } else {
                    if (tools.isNotEmpty(arr)) {
                        let str = ''
                        arr.forEach((item, index) => {
                            if (index === arr.length - 1) {
                                str += item.name
                            } else {
                                str += (item.name + ',')
                            }
                        })
                        return str
                    }
                    return ''
                }
            },
            selectBottom(item) {
                switch (this.modalField) {
                    case 'course-otherCollege': {
                        this.otherCollegeValue = item[0]
                    }
                        break;
                    case 'course-otherMajor': {
                        this.otherMajorValue = item[0]
                    }
                        break;
                    case 'course-otherGrade': {
                        this.otherGradeValue = item[0]
                    }
                        break;
                    case 'course-otherClbum': {
                        this.otherClbumValue = item[0]
                    }
                        break;
                }
                this.showModal = false
            },
            cancelSelectBottom() {
                this.showModal = false
            },
            cancel() {
                this.setIsShowCourse(true)
                this.$router.go(-1)
            },
            save() {
                let limitCollege = this.tempCourseLimitCollege
                let college = this.tempCourseCollege
                if (tools.isEmpty(college) && limitCollege === 1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                if (limitCollege === -1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                let limitMajor = this.tempCourseLimitMajor
                let major = this.tempCourseMajor
                if (tools.isEmpty(major) && limitMajor === 1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                if (limitMajor === -1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                let limitGrade = this.tempCourseLimitGrade
                let grade = this.tempCourseGrade
                if (tools.isEmpty(grade) && limitGrade === 1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                if (limitGrade === -1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                let limitClass = this.tempCourseLimitClass
                let clbum = this.tempCourseClbum
                if (tools.isEmpty(clbum) || limitClass === -1) {
                    MessageBox('提示', '请选择班级!')
                    return
                }
                this.setCourseCollege(college)
                this.setCourseLimitCollege(limitCollege)
                this.setCourseMajor(major)
                this.setCourseLimitMajor(limitMajor)
                this.setCourseGrade(grade)
                this.setCourseLimitGrade(limitGrade)
                this.setCourseClbum(clbum)
                this.setCourseLimitClass(limitClass)
                this.setCourseOtherCollege(this.tempCourseOtherCollege)
                this.setCourseOtherMajor(this.tempCourseOtherMajor)
                this.setCourseOtherGrade(this.tempCourseOtherGrade)
                this.setCourseOtherClass(this.tempCourseOtherClbum)
                this.setIsShowCourse(true)
                this.$router.go(-1)
            }
        }
    }
</script>

<style scoped lang="scss">
    .face-student {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
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
