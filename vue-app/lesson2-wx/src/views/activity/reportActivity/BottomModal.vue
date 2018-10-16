<template>
    <div class="bottom-modal">
        <text-picker :pickerData="pickerData" :title="title" v-on:textPickerCancel="cancel"
                     v-on:textPickerConfirm="confirm"/>
    </div>
</template>

<script>
    import TextPicker from '../../../components/textPicker/TextPicker'
    import report from '@/api/report'
    import tools from '../../../utils/tool'
    import {MessageBox} from 'mint-ui'

    export default {
        components: {
            TextPicker
        },
        data() {
            return {
                pickerData: [],
                title: ''
            }
        },
        props: {
            field: {
                type: String,
                default: ''
            }
        },
        created() {
            document.body.style.overflow = 'hidden'
            switch (this.field){
                case 'activityLevel':{
                    this.title = '选择活动级别'
                    report
                        .getActivityLevel()
                        .then(result => {
                            this.pickerData = result.data.body.dataList
                        })
                        .catch(err => {
                        })
                }
                break;
                case 'qrCode':{
                    this.title = '请选择二维码有效时间'
                    report
                        .getQrCodeTime()
                        .then(result => {
                            this.pickerData = this.handleRes(result.data.body.dataList)
                        })
                        .catch(err => {
                        })
                }
                    break;
                case 'signBack':{
                    this.title = '请选择是否签退'
                    this.pickerData = this.handleRes(['否','是'])
                }
                    break;
                case 'otherCollege':{
                    this.title = '请选择'
                    this.pickerData = this.handleRes(['不限','允许报名但不给学分','不允许报名'])
                }
                    break;
            }
        },
        methods: {
            cancel() {
                this.$emit('cancelEdit', '')
                document.body.style.overflow = 'auto'
            },
            handleRes(data){
                if(this.field === 'signBack'){
                    let arr = []
                    data.forEach((da,index) => {
                        arr.push([index,da])
                    })
                    return arr
                }else if(this.field === 'qrCode'){
                    let arr = []
                    data.forEach((da,index) => {
                        arr.push([index,da[0]+ 's'])
                    })
                    return arr
                }else if(this.field === 'otherCollege'){
                    let arr = []
                    data.forEach((da,index) => {
                        arr.push([index,da])
                    })
                    return arr
                }
            },
            confirm(val) {
                if (tools.isEmpty(val)) {
                    if (this.field === 'activitylevel') {
                        MessageBox('温馨提示', '活动级别不能为空')
                    }
                    return
                }
                this.$emit('selectBottom', val)
                document.body.style.overflow = 'auto'
            }
        }
    }
</script>

<style lang="scss">
    .bottom-modal {
        position: fixed;
        bottom: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 2;
        background: rgba(0, 0, 0, 0.4);
        .text-picker {
            position: absolute;
            bottom: 0;
            left: 0;
        }
    }
</style>
