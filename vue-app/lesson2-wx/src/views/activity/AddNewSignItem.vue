<template>
    <div class="add-new-sign-item">
        <div class="index-title item borderBottom" v-if="isSignIn">{{indexTitle}}</div>
        <div class="item borderBottom isSignBack" v-else>
            <span class="title">是否签退</span>
            <span @click="selectTime('signBack')" :class="'time ' + (signBackStr === '请选择' ? 'noneContent' : '')">{{signBackStr}}<i
                class="sec seclesson-youjiantou"></i></span>
        </div>
        <div class="sign-content borderBottom">
            <div class="item borderBottom">
                <span class="title">{{isSignIn ? '签到' : '签退'}}开始时间</span>
                <span @click="selectTime('startTime')" :class="'time ' + (startTime === '请选择' ? 'noneContent' : '')">{{startTime}} <i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
            <div class="item borderBottom">
                <span class="title">{{isSignIn ? '签到' : '签退'}}结束时间</span>
                <span @click="selectTime('endTime')" :class="'time ' + (endTime === '请选择' ? 'noneContent' : '')">{{endTime}} <i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
            <div class="item">
                <span class="title">{{isSignIn ? '签到' : '签退'}}方式</span>
            </div>
        </div>
        <div class="sign-content">
            <div class="item borderBottom">
                <span class="title"><input type="radio" name="signType" v-model="signType" value="0" id="face"><label
                    for="face">人脸识别</label></span>
                <span @click="selectTime('face')" :class="'time ' + (faceStr === '请选择' ? 'noneContent' : '')">{{faceStr}}<i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
            <div class="item borderBottom">
                <span class="title"><input type="radio" name="signType" v-model="signType" value="1" id="qrCode"><label
                    for="qrCode">二维码</label></span>
                <span @click="selectTime('qrCode')" :class="'time ' + (qrCodeStr === '请选择' ? 'noneContent' : '')">{{qrCodeStr}}<i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
        </div>
        <div class="buttons">
            <div class="btn-wrapper">
                <div class="btn" @click="save()">保存</div>
            </div>
            <div class="btn-wrapper">
                <div class="btn cancel" @click="cancel()">取消</div>
            </div>
        </div>
        <mt-datetime-picker
            ref="picker"
            type="datetime"
            v-model="pickerValue"
            @confirm="handleConfirm"
            :startDate="startDate">
        </mt-datetime-picker>
        <bottom-modal v-if="showModal" :field="modalField" v-on:cancelEdit="cancelModal"
                      v-on:selectBottom="selectQrCode"/>
    </div>

</template>

<script>
    import tools from '../../utils/tool'
    import * as types from '../../store/mutations-types'
    import {mapGetters, mapMutations} from 'vuex'
    import BottomModal from './reportActivity/BottomModal'
    import {MessageBox} from 'mint-ui';

    export default {
        data() {
            return {
                index: -1,
                indexTitle: '',
                isSignIn: true,
                startTime: '请选择',
                endTime: '请选择',
                qrCodeStr: '请选择',
                faceStr: '请选择',
                signType: 0,
                pickerValue: new Date(),
                startDate: new Date(),
                field: '',
                showModal: false,
                signBackStr: '请选择',
                modalField: '',
                isAdd: true
            }
        },
        computed: {
            ...mapGetters([
                'signContent',
                'tempSignPosition',
                'longitude',
                'latitude',
                'signCaption',
                'tempSignStartTime',
                'tempSignEndTime',
                'signBackStartTime',
                'signBackEndTime',
                'signBack',
                'tempSignBack',
                'distance',
                'duration',
                'signBackType',
                'tempSignType',
                'tempDuration'
            ])
        },
        created() {
            this.isSignIn = (this.$route.query.isSignIn === 'true' || this.$route.query.isSignIn === true) ? true : false
            this.index = Number(this.$route.query.index)
            if (this.isSignIn === true) {
                if (this.index === -1) {
                    // 新增
                    let length = tools.isNotEmpty(this.signContent) ? this.signContent.length : 0
                    this.index = length
                    this.getIndexTitle()
                    this.isAdd = true
                } else {
                    // 修改
                    this.getIndexTitle()
                    this.isAdd = false
                }
            } else {
                if (this.index === -1) {
                    this.isAdd = true
                } else {
                    this.isAdd = false
                }
            }
            let startDate = new Date((new Date().getTime()) - 24 * 60 * 60 * 365 * 1000)
            this.startDate = startDate
            this.pickerValue = startDate
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                let isSignIn = (to.query.isSignIn === true || to.query.isSignIn === 'true') ? true : false
                if (from.path === '/signType') {
                    let index = Number(to.query.index)
                    // vm.isSignIn = isSignIn
                    // vm.index = index
                    if (isSignIn === true) {
                        if (index === -1) {
                            // 新增
                            vm.$store.commit('SET_TEMP_SIGNPOSITION', [])
                            vm.$store.commit('SET_TEMP_SIGN_START_TIME', 0)
                            vm.$store.commit('SET_TEMP_SIGN_END_TIME', 0)
                            vm.setTempSignType(0)
                            vm.setTempDuration(0)
                        } else {
                            // 修改
                            let signPara = vm.signContent[index]
                            vm.$store.commit('SET_TEMP_SIGNPOSITION', [signPara.signCaption, signPara.latitude, signPara.longitude, signPara.distance])
                            vm.$store.commit('SET_TEMP_SIGN_START_TIME', signPara.signStartTime)
                            vm.$store.commit('SET_TEMP_SIGN_END_TIME', signPara.signEndTime)
                            vm.startTime = tools.formatTime(signPara.signStartTime)
                            vm.endTime = tools.formatTime(signPara.signEndTime)
                            vm.signType = signPara.signType
                            vm.setTempSignType(signPara.signType)
                            if (signPara.signType === 0) {
                                vm.faceStr = signPara.signCaption
                                vm.setTempDuration(0)
                            } else {
                                vm.setTempDuration(signPara.duration)
                                vm.qrCodeStr = signPara.duration + 's'
                            }
                        }
                    } else {
                        //签退
                        vm.$store.commit('SET_TEMP_SIGNBACK', vm.signBack)
                        if (vm.signBack === 0) {
                            vm.signBackStr = '否'
                            vm.$store.commit('SET_TEMP_SIGNPOSITION', [])
                            vm.$store.commit('SET_TEMP_SIGN_START_TIME', 0)
                            vm.$store.commit('SET_TEMP_SIGN_END_TIME', 0)
                            vm.setTempSignType(0)
                            vm.setTempDuration(0)
                        } else {
                            vm.signBackStr = '是'
                            vm.$store.commit('SET_TEMP_SIGNPOSITION', [vm.signCaption, vm.latitude, vm.longitude, vm.distance])
                            vm.$store.commit('SET_TEMP_SIGN_START_TIME', vm.signBackStartTime)
                            vm.$store.commit('SET_TEMP_SIGN_END_TIME', vm.signBackEndTime)
                            vm.startTime = tools.formatTime(vm.signBackStartTime)
                            vm.endTime = tools.formatTime(vm.signBackEndTime)
                            vm.faceStr = vm.signCaption
                            vm.signType = vm.signBackType
                            vm.setTempSignType(vm.signBackType)
                            if (vm.signBackType === 0) {
                                vm.faceStr = vm.signCaption
                                vm.setTempDuration(0)
                            } else {
                                vm.qrCodeStr = vm.duration + 's'
                                vm.setTempDuration(vm.duration)
                            }
                        }
                    }
                } else if (from.path === '/selectAddress') {
                    vm.tempSignStartTime !== 0 && (vm.startTime = tools.formatTime(vm.tempSignStartTime))
                    vm.tempSignEndTime !== 0 && (vm.endTime = tools.formatTime(vm.tempSignEndTime))
                    vm.signType = vm.tempSignType
                    if (isSignIn === false) {
                        vm.signBackStr = vm.tempSignBack === 0 ? '否' : '是'
                    }
                    vm.faceStr = vm.tempSignPosition[0]
                    vm.tempDuration !== 0 && (vm.qrCodeStr =  vm.tempDuration + 's')
                }
            })
        },
        beforeRouteLeave(to, from, next) {
            if (to.path === '/selectAddress') {
                this.startTime !== '请选择' && this.setTempSignStartTime(new Date(this.startTime).getTime() / 1000)
                this.endTime !== '请选择' && this.setTempSignEndTime(new Date(this.endTime).getTime() / 1000)
                if (from.query.isSignIn === false) {
                    this.setTempSignBack(this.signBackStr === '是' ? 1 : 0)
                }
                if (this.qrCodeStr !== '请选择') {
                    this.setTempDuration(this.qrCodeStr.slice(0, this.qrCodeStr.length - 1))
                }
                this.setTempSignType(this.signType)
                next()
            } else {
                next()
            }
        },
        methods: {
            ...mapMutations({
                setSignContent: types.SET_SIGNCONTENT,
                setSignBack: types.SET_SIGNBACK,
                setTempSignStartTime: types.SET_TEMP_SIGN_START_TIME,
                setTempSignEndTime: types.SET_TEMP_SIGN_END_TIME,
                setTempSignBack: types.SET_TEMP_SIGNBACK,
                setTempSignType: types.SET_TEMP_SIGNTYPE,
                setTempDuration: types.SET_TEMP_DURATION
            }),
            save() {
                if (this.isSignIn === true) {
                    if (tools.isEmpty(this.startTime) || this.startTime === '请选择') {
                        MessageBox('提示', `签到开始时间不能为空!`)
                        return
                    }
                    let startTime = new Date(this.startTime).getTime() / 1000
                    if (tools.isEmpty(this.endTime) || this.endTime === '请选择') {
                        MessageBox('提示', `签到结束时间不能为空!`)
                        return
                    }
                    let endTime = new Date(this.endTime).getTime() / 1000
                    if(startTime >= endTime){
                        MessageBox('提示', `签到开始时间不能大于签到结束时间!`)
                        return
                    }
                    let signType = Number(this.signType)
                    let distance = 0
                    let signPosition = 0
                    let latitude = ''
                    let longitude = ''
                    let duration = 0
                    let signCaption = ''
                    if (signType === 0) {
                        if (tools.isEmpty(this.tempSignPosition)) {
                            MessageBox('提示', '请选择签到位置!')
                            return
                        }
                        if (this.tempSignPosition[0] === '不限') {
                            signPosition = 0
                        } else {
                            signPosition = 1
                        }
                        distance = this.tempSignPosition[3]
                        signCaption = this.tempSignPosition[0]
                        latitude = this.tempSignPosition[1]
                        longitude = this.tempSignPosition[2]
                        duration = 0
                    } else {
                        signPosition = 0
                        distance = 0
                        signCaption = ''
                        latitude = ''
                        longitude = ''
                        if (this.qrCodeStr === '请选择') {
                            MessageBox('提示', '请选择二维码有效时间!')
                            return
                        }
                        duration = Number(this.qrCodeStr.slice(0, this.qrCodeStr.length - 1))
                    }
                    // 签到
                    let para = {
                        signStartTime: startTime, //签到开始时间
                        signEndTime: endTime, //签到结束时间
                        signType: signType, // 签到方式
                        signPosition: signPosition, //签到位置
                        longitude: longitude, //经度
                        latitude: latitude,//纬度
                        distance: distance,// 签到限制距离
                        duration: duration, // 二维码有效时间
                        signCaption: signCaption// 签到位置名称
                    }
                    if (this.isAdd === true) {
                        //签到新增
                        let arr = tools.isNotEmpty(this.signContent) ? this.signContent : []
                        arr.push(para)
                        this.setSignContent(arr)
                    } else {
                        //签到修改
                        let arr = this.signContent
                        arr[this.index] = para
                        this.setSignContent(arr)
                    }
                } else {
                    // 签退
                    if (this.signBackStr === '请选择'){
                        MessageBox('提示', `请选择是否签退!`)
                        return
                    }
                    let signBack = this.signBackStr === '否' ? 0 : 1
                    let para = {}
                    if(signBack === 0){
                        para = {
                            signBack:signBack
                        }
                    }else{
                        if (tools.isEmpty(this.startTime) || this.startTime === '请选择') {
                            MessageBox('提示', `签退开始时间不能为空!`)
                            return
                        }
                        let startTime = new Date(this.startTime).getTime() / 1000
                        if (tools.isEmpty(this.endTime) || this.endTime === '请选择') {
                            MessageBox('提示', `签退结束时间不能为空!`)
                            return
                        }
                        let endTime = new Date(this.endTime).getTime() / 1000
                        if(startTime >= endTime){
                            MessageBox('提示', `签退开始时间不能大于签到结束时间!`)
                            return
                        }
                        let signType = Number(this.signType)
                        let distance = 0
                        let signPosition = 0
                        let latitude = ''
                        let longitude = ''
                        let duration = 0
                        let signCaption = ''
                        if (signType === 0) {
                            if (tools.isEmpty(this.tempSignPosition)) {
                                MessageBox('提示', '请选择签退位置!')
                                return
                            }
                            if (this.tempSignPosition[0] === '不限') {
                                signPosition = 0
                            } else {
                                signPosition = 1
                            }
                            distance = this.tempSignPosition[3]
                            signCaption = this.tempSignPosition[0]
                            latitude = this.tempSignPosition[1]
                            longitude = this.tempSignPosition[2]
                            duration = 0
                        } else {
                            signPosition = 0
                            distance = 0
                            signCaption = ''
                            latitude = ''
                            longitude = ''
                            if (this.qrCodeStr === '请选择') {
                                MessageBox('提示', '请选择二维码有效时间!')
                                return
                            }
                            duration = Number(this.qrCodeStr.slice(0, this.qrCodeStr.length - 1))
                        }
                        para = {
                            signBack:signBack,
                            signBackStartTime: startTime,
                            signBackEndTime: endTime,
                            signType: signType,
                            signPosition: signPosition,
                            longitude: longitude,
                            latitude: latitude,
                            distance: distance,
                            duration: duration,
                            signCaption: signCaption
                        }
                    }
                    this.setSignBack(para)
                }
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            },
            getIndexTitle() {
                if (this.index === 0) {
                    this.indexTitle = '首次签到'
                } else {
                    this.indexTitle = tools.getChineseNum(this.index + 1) + '次签到'
                }
            },
            selectTime(field) {
                switch (field) {
                    case 'startTime': {
                        if (tools.isNotEmpty(this.startTime)) {
                            this.pickerValue = new Date(this.startTime)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'endTime': {
                        if (tools.isNotEmpty(this.endTime)) {
                            this.pickerValue = new Date(this.endTime)
                        }
                        this.field = field
                        this.$refs.picker.open();
                    }
                        break;
                    case 'qrCode' : {
                        this.modalField = 'qrCode'
                        this.showModal = true
                    }
                        break;
                    case 'face': {
                        this.$router.push({
                            path: '/selectAddress'
                        })
                    }
                        break;
                    case 'signBack': {
                        this.modalField = 'signBack'
                        this.showModal = true
                    }
                        break;
                    default: {

                    }
                        break;
                }
            },
            handleConfirm() {
                switch (this.field) {
                    case 'startTime': {
                        this.startTime = tools.formatTime(this.pickerValue.getTime() / 1000)
                        this.pickerValue = this.startDate
                    }
                        break;
                    case 'endTime': {
                        this.endTime = tools.formatTime(this.pickerValue.getTime() / 1000)
                        this.pickerValue = this.startDate
                    }
                        break;
                }
            },
            selectQrCode(val) {
                switch (this.modalField) {
                    case 'qrCode' : {
                        let duration = val[1]
                        this.qrCodeStr = duration
                        this.showModal = false
                    }
                        break;
                    case 'signBack': {
                        this.signBackStr = val[1]
                        this.showModal = false
                    }
                        break;
                }
            },
            cancelModal() {
                this.showModal = false
            }

        },
        components: {
            BottomModal
        }
    }
</script>

<style scoped lang="scss">
    .add-new-sign-item {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        .index-title {
            font-size: 0.4rem;
            color: #33484f;
            padding-left: 0.4267rem;
            background-color: #ffffff;
        }
        .sign-content {
            padding-left: 0.4267rem;
            background-color: #ffffff;
        }
        .item {
            height: 1.3333rem;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 0.4267rem;
            background-color: #ffffff;
        }
        .item.isSignBack {
            padding-left: 0.4267rem;
        }
        .title {
            font-size: 0.4rem;
            color: #91a8b0;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            input {
                outline: none;
                -webkit-appearance: none;
            }
            input[type='radio'] {
                display: block;
                width: 0.5333rem;
                height: 0.5333rem;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
                flex-shrink: 0;
                background-color: #ffffff;
                border: solid 0.0267rem #e2e2e2;
                border-radius: 50%;
                margin-right: 0.16rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            input[type=radio]:checked {
                border: solid 0.0267rem #0099ff;
            }
            input[type=radio]:checked::after {
                content: '';
                display: block;
                width: 0.32rem;
                height: 0.32rem;
                background-color: #0099ff;
                border-radius: 50%;
            }
        }
        .time {
            font-size: 0.4rem;
            color: #33484f;
        }
        .noneContent.time {
            color: #91a8b0;
        }
        .borderBottom {
            border-bottom: 0.0133rem solid #e9e9e9;
        }
        i {
            color: #91a8b0;
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
