<template>
    <div class="edit-contacts">
        <div v-if="field === 'courseDescription' || field === 'course-courseDescription'" class="item-outer-wrapper">
            <div class="textarea-inner-wrapper">
                <div class="title">活动介绍</div>
                <textarea placeholder='请填写活动介绍' v-model="courseDescriptionData"></textarea>
            </div>
        </div>
        <div v-if="field === 'remind' || field === 'course-remind'" class="item-outer-wrapper">
            <div class="item-inner-wrapper">
                <div class="title">提醒内容</div>
                <input type="text" v-model="remindData"
                       placeholder='请填写提醒内容'>
            </div>
        </div>
        <div v-if="field === 'activityName' || field === 'course-activityName'" class="item-outer-wrapper">
            <div class="item-inner-wrapper">
                <div class="title">{{field === 'activityName' ? '活动名称' : '课程名称'}}</div>
                <input type="text" v-model="activityNameData"
                       :placeholder="field === 'activityName' ? '请填写活动名称' : '请填写课程名称'">
            </div>
        </div>
        <div v-if="field === 'slogan'" class="item-outer-wrapper">
            <div class="item-inner-wrapper">
                <div class="title">活动口号</div>
                <input type="text" v-model="sloganData"
                       placeholder='请填写活动口号'>
            </div>
        </div>
        <div v-if="field === 'address' || field === 'course-address'" class="item-outer-wrapper">
            <div class="item-inner-wrapper">
                <div class="title">活动地点</div>
                <input type="text"
                       placeholder='请填写活动地点' v-model="addressData">
            </div>
        </div>
        <div v-if="field === 'charge'" class="item-outer-wrapper">
            <div class="item-inner-wrapper">
                <div class="title">联系人</div>
                <input type="text" ref="name" :value="chargeData.name === '' ? '' : chargeData.name"
                       placeholder='请输入联系人'>
            </div>
            <div class="item-inner-wrapper">
                <div class="title">联系电话</div>
                <input type="text" ref="phone" :value="chargeData.phone === '' ? '' : chargeData.phone"
                       placeholder='请输入联系电话'>
            </div>
        </div>
        <div class="btn-wrapper">
            <div class="btn" @click="save()">保存</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="cancel()">取消</div>
        </div>
    </div>
</template>

<script>
    import tools from '../../utils/tool'
    import {MessageBox} from 'mint-ui'
    import {mapGetters, mapMutations} from 'vuex'
    import * as types from '../../store/mutations-types'
    import * as cTypes from '../../store/course-mutations-types'

    export default {
        data() {
            return {
                field: '',
                addressData: '',
                courseDescriptionData: '',
                remindData: '',
                sloganData: '',
                activityNameData: '',
                chargeData: {},
                chargeIndex: 0
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.field = to.query.field
                if (to.query.field === 'charge') {
                    let index = to.query.index
                    if (index === -1) {
                        vm.chargeData = {
                            name: '',
                            phone: ''
                        }
                    } else {
                        vm.chargeData = vm.charge[index]
                    }
                    vm.chargeIndex = index

                }
            })
        },
        created() {

        },
        computed: {
            ...mapGetters([
                'activityName', 'courseDescription', 'address', 'remind', 'slogan', 'charge'
            ])
        },
        mounted() {
            this.courseDescriptionData = this.courseDescription
            this.addressData = this.address
            this.remindData = this.remind
            this.sloganData = this.slogan
            this.activityNameData = this.activityName
        },
        methods: {
            ...mapMutations({
                setActivityName: types.SET_ACTIVITYNAME,
                setCourseDescription: types.SET_COURSEDESCRIPTION,
                setSlogan: types.SET_SLOGAN,
                setRemind: types.SET_REMIND,
                setAddress: types.SET_ADDRESS,
                setCharge: types.SET_CHARGE,
                setCourseActivityName:cTypes.COURSE_SET_ACTIVITYNAME,
                setIsShowCourse:cTypes.IS_SHOW_COURSE,
                setCourseAddress:cTypes.COURSE_SET_ADDRESS,
                setCourseRemind:cTypes.COURSE_SET_REMIND,
                setCourseCourseDescription:cTypes.COURSE_SET_COURSEDESCRIPTION
            }),
            save() {
                switch (this.field) {
                    case 'activityName': {
                        if (tools.isNotEmpty(this.activityNameData)) {
                            this.setActivityName(this.activityNameData)
                            this.setIsShowCourse(false)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '活动名称不能为空!')
                        }
                    }
                        break;
                    case 'course-activityName': {
                        if (tools.isNotEmpty(this.activityNameData)) {
                            this.setCourseActivityName(this.activityNameData)
                            this.setIsShowCourse(true)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '活动名称不能为空!')
                        }
                    }
                        break;
                    case 'address': {
                        if (tools.isNotEmpty(this.addressData)) {
                            this.setAddress(this.addressData)
                            this.setIsShowCourse(false)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '地址不能为空!')
                        }
                    }
                        break;
                    case 'course-address': {
                        if (tools.isNotEmpty(this.addressData)) {
                            this.setCourseAddress(this.addressData)
                            this.setIsShowCourse(true)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '地址不能为空!')
                        }
                    }
                        break;
                    case 'courseDescription': {
                        if (tools.isNotEmpty(this.courseDescriptionData)) {
                            this.setCourseDescription(this.courseDescriptionData)
                            this.setIsShowCourse(false)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '活动介绍不能为空!')
                        }
                    }
                        break;
                    case 'course-courseDescription': {
                        if (tools.isNotEmpty(this.courseDescriptionData)) {
                            this.setCourseCourseDescription(this.courseDescriptionData)
                            this.setIsShowCourse(true)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '活动介绍不能为空!')
                        }
                    }
                        break;
                    case 'slogan': {
                        if (tools.isNotEmpty(this.sloganData)) {
                            this.setSlogan(this.sloganData)
                            this.setIsShowCourse(false)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '活动口号不能为空!')
                        }
                    }
                        break;
                    case 'remind': {
                        if (tools.isNotEmpty(this.remindData)) {
                            this.setRemind(this.remindData)
                            this.setIsShowCourse(false)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '提醒内容不能为空!')
                        }
                    }
                        break;
                    case 'course-remind': {
                        if (tools.isNotEmpty(this.remindData)) {
                            this.setCourseRemind(this.remindData)
                            this.setIsShowCourse(true)
                            this.$router.go(-1)
                        } else {
                            MessageBox('提示', '提醒内容不能为空!')
                        }
                    }
                        break;
                    case 'charge': {
                        let name = this.$refs.name.value
                        let phone = this.$refs.phone.value
                        if (tools.isEmpty(name)) {
                            MessageBox('提示', '咨询人姓名不能为空！')
                            return
                        }
                        if (tools.isEmpty(phone)) {
                            MessageBox('提示', '咨询人电话不能为空！')
                            return
                        }
                        let arr = tools.isNotEmpty(this.charge) ? this.charge : []
                        if (this.chargeIndex === -1) {
                            arr.push({
                                name: name,
                                phone: phone
                            })
                        } else {
                            arr[this.chargeIndex].name = name
                            arr[this.chargeIndex].phone = phone
                        }
                        this.setCharge(arr)
                        this.setIsShowCourse(false)
                        this.$router.go(-1)
                    }
                        break;
                    default:
                        break;
                }
            },
            cancel() {
                let fields = ['course-activityName']
                if (fields.indexOf(this.field) >= 0){
                    this.setIsShowCourse(true)
                }else{
                    this.setIsShowCourse(false)
                }
                this.$router.go(-1)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .edit-contacts {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100%;
        z-index: 2;
        overflow: auto;
        textarea {
            -webkit-appearance: none;
            border: none;
            height: 5.3333rem;
            width: 100%;
            font-family: 'PingFang-SC-Medium';
            margin-top: -0.04rem;
        }
        .item-outer-wrapper {
            width: 100%;
            padding-left: 0.4533rem;
            background-color: #ffffff;
            .textarea-inner-wrapper {
                display: flex;
                align-items: flex-start;
                padding-top: 0.4rem;
                width: 100%;
                padding-right: 0.4267rem;
                border-bottom: 0.0133rem solid #e9e9e9;
                font-size: 0.4rem;
                color: #33484f;
            }
            .item-inner-wrapper {
                display: flex;
                align-items: center;
                height: 1.3333rem;
                width: 100%;
                padding-right: 0.4267rem;
                border-bottom: 0.0133rem solid #e9e9e9;
                font-size: 0.4rem;
                color: #33484f;
            }
        }
        .title {
            width: 2.1333rem;
            margin-right: 0.2667rem;
        }
        input {
            font-size: 0.4rem;
        }
        input::-webkit-input-placeholder {
            color: #b0b0b0;
            font-size: 0.4rem;
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
