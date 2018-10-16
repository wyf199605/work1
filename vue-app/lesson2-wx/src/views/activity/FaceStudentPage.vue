<template>
    <div class="face-student">
        <report-input :isRequired="true" title="面向学院" :defaultValue="collegeStr" field="college"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向专业" :defaultValue="majorStr" field="major"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向年级" :defaultValue="gradeStr" field="grade"
                      @reportInputEdit="edit"/>
        <report-input :isRequired="true" title="面向班级" :defaultValue="clbumStr" field="clbum"
                      @reportInputEdit="edit"/>
        <report-input title="其他学院" :defaultValue="otherCollegeValue === -1 ? '' : selectArr[otherCollegeValue]"
                      field="otherCollege"
                      @reportInputEdit="edit"/>
        <report-input title="其他专业" :defaultValue="otherMajorValue === -1 ? '' : selectArr[otherMajorValue]"
                      field="otherMajor"
                      @reportInputEdit="edit"/>
        <report-input title="其他班级" :defaultValue="otherClbumValue === -1 ? '' : selectArr[otherClbumValue]"
                      field="otherClbum"
                      @reportInputEdit="edit"/>
        <report-input title="其他年级" :defaultValue="otherGradeValue === -1 ? '' : selectArr[otherGradeValue]"
                      field="otherGrade"
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
    import * as types from '../../store/mutations-types'
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
                'college',
                'major',
                'grade',
                'clbum',
                'otherCollege',
                'otherMajor',
                'otherGrade',
                'otherClass',
                'limitCollege',
                'limitMajor',
                'limitGrade',
                'limitClass',
                'tempCollege',
                'tempMajor',
                'tempGrade',
                'tempClbum',
                'tempOtherCollege',
                'tempOtherMajor',
                'tempOtherGrade',
                'tempOtherClbum',
                'tempLimitCollege',
                'tempLimitMajor',
                'tempLimitGrade',
                'tempLimitClass'
            ])
        },
        created() {

        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (from.path === '/reportActivity') {

                    vm.otherCollegeValue = vm.otherCollege
                    vm.otherMajorValue = vm.otherMajor
                    vm.otherGradeValue = vm.otherGrade
                    vm.otherClbumValue = vm.otherClass
                    vm.setTempLimitCollege(vm.limitCollege)
                    vm.setTempLimitMajor(vm.limitMajor)
                    vm.setTempLimitGrade(vm.limitGrade)
                    vm.setTempLimitClass(vm.limitClass)
                    vm.collegeStr = vm.arrayToStr(vm.college, vm.limitCollege)
                    vm.majorStr = vm.arrayToStr(vm.major, vm.limitMajor)
                    vm.gradeStr = vm.arrayToStr(vm.grade, vm.limitGrade)
                    vm.clbumStr = vm.arrayToStr(vm.clbum, vm.limitClass)
                    vm.setTempCollege(vm.college)
                    vm.setTempMajor(vm.major)
                    vm.setTempGrade(vm.grade)
                    vm.setTempClbum(vm.clbum)
                    vm.setTempOtherCollege(vm.otherCollege)
                    vm.setTempOtherMajor(vm.otherMajor)
                    vm.setTempOtherGrade(vm.otherGrade)
                    vm.setTempOtherClbum(vm.otherClass)
                } else {
                    vm.collegeStr = vm.arrayToStr(vm.tempCollege, vm.tempLimitCollege)
                    vm.majorStr = vm.arrayToStr(vm.tempMajor, vm.tempLimitMajor)
                    vm.gradeStr = vm.arrayToStr(vm.tempGrade, vm.tempLimitGrade)
                    vm.clbumStr = vm.arrayToStr(vm.tempClbum, vm.tempLimitClass)
                    vm.otherCollegeValue = vm.tempOtherCollege
                    vm.otherMajorValue = vm.tempOtherMajor
                    vm.otherGradeValue = vm.tempOtherGrade
                    vm.otherClbumValue = vm.tempOtherClbum
                }
            })
        },
        beforeRouteLeave(to, from, next) {
            if (to.path === '/selectCollege') {
                this.setTempOtherCollege(this.otherCollegeValue)
                this.setTempOtherMajor(this.otherMajorValue)
                this.setTempOtherGrade(this.otherGradeValue)
                this.setTempOtherClbum(this.otherClbumValue)
                next()
            } else {
                next()
            }
        },
        methods: {
            ...mapMutations({
                setTempCollege: types.SET_TEMP_COLLEGE,
                setTempMajor: types.SET_TEMP_MAJOR,
                setTempGrade: types.SET_TEMP_GRADE,
                setTempClbum: types.SET_TEMP_CLBUM,
                setTempOtherCollege: types.SET_TEMP_OTHERCOLLEGE,
                setTempOtherMajor: types.SET_TEMP_OTHERMAJOR,
                setTempOtherGrade: types.SET_TEMP_OTHERGRADE,
                setTempOtherClbum: types.SET_TEMP_OTHERCLBUM,
                setTempLimitCollege: types.SET_TEMP_LIMITCOLLEGE,
                setTempLimitMajor: types.SET_TEMP_LIMITMAJOR,
                setTempLimitGrade: types.SET_TEMP_LIMITGRADE,
                setTempLimitClass: types.SET_TEMP_LIMITCLASS,
                setCollege: types.SET_COLLEGE,
                setMajor: types.SET_MAJOR,
                setGrade: types.SET_GRADE,
                setClbum: types.SET_CLBUM,
                setLimitCollege: types.SET_LIMITCOLLEGE,
                setLimitMajor: types.SET_LIMITMAJOR,
                setLimitGrade: types.SET_LIMITGRADE,
                setLimitClass: types.SET_LIMITCLASS,
                setOtherCollege: types.SET_OTHERCOLLEGE,
                setOtherMajor: types.SET_OTHERMAJOR,
                setOtherGrade: types.SET_OTHERGRADE,
                setOtherClass: types.SET_OTHERCLASS
            }),
            edit(field) {
                let fields = ['college', 'major', 'grade', 'clbum']
                if (fields.indexOf(field) >= 0) {
                    this.$router.push({
                        path: '/selectCollege',
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
                    case 'otherCollege': {
                        this.otherCollegeValue = item[0]
                    }
                        break;
                    case 'otherMajor': {
                        this.otherMajorValue = item[0]
                    }
                        break;
                    case 'otherGrade': {
                        this.otherGradeValue = item[0]
                    }
                        break;
                    case 'otherClbum': {
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
                this.$router.go(-1)
            },
            save() {
                let limitCollege = this.tempLimitCollege
                let college = this.tempCollege
                if (tools.isEmpty(college) && limitCollege === 1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                if (limitCollege === -1) {
                    MessageBox('提示', '请选择学院!')
                    return
                }
                let limitMajor = this.tempLimitMajor
                let major = this.tempMajor
                if (tools.isEmpty(major) && limitMajor === 1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                if (limitMajor === -1) {
                    MessageBox('提示', '请选择专业!')
                    return
                }
                let limitGrade = this.tempLimitGrade
                let grade = this.tempGrade
                if (tools.isEmpty(grade) && limitGrade === 1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                if (limitGrade === -1) {
                    MessageBox('提示', '请选择年级!')
                    return
                }
                let limitClass = this.tempLimitClass
                let clbum = this.tempClbum
                if (tools.isEmpty(clbum) || limitClass === -1) {
                    MessageBox('提示', '请选择班级!')
                    return
                }
                this.setCollege(college)
                this.setLimitCollege(limitCollege)
                this.setMajor(major)
                this.setLimitMajor(limitMajor)
                this.setGrade(grade)
                this.setLimitGrade(limitGrade)
                this.setClbum(clbum)
                this.setLimitClass(limitClass)
                this.setOtherCollege(this.tempOtherCollege)
                this.setOtherMajor(this.tempOtherMajor)
                this.setOtherGrade(this.tempOtherGrade)
                this.setOtherClass(this.tempOtherClbum)
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
