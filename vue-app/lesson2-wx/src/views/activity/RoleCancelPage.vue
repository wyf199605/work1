<template>
    <div class="role-cancel-page">
        <div class="page-title">{{title}}</div>
        <div class="radio">
            <div class="item">
                <span class="title"><input @change="changeType" type="radio" name="radioName" v-model="value" value="0" id="no"><label
                    for="no">{{radioValues[0]}}</label></span>
            </div>
            <div class="item">
                <span class="title"><input @change="changeType" type="radio" name="radioName" v-model="value" value="1" id="yes"><label
                    for="yes">{{radioValues[1]}}</label></span>
            </div>
            <div class="item space-between">
                <span class="time-title">{{titleTime}}</span>
                <span class="time" @click="selectTime(0)"><span class="start" v-if="field !== 'activityComment'">(开始)</span><span
                    :class="startTimeStr === '请选择' ? 'noContent' : ''">{{startTimeStr}}</span><i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
            <div class="item flex-end" v-if="field !== 'activityComment'">
                <span class="time" @click="selectTime(1)"><span class="start">(结束)</span><span
                    :class="endTimeStr === '请选择' ? 'noContent' : ''">{{endTimeStr}}</span><i
                    class="sec seclesson-youjiantou"></i></span>
            </div>
        </div>
        <div class="btn-wrapper">
            <div class="btn" @click="cancel">返回</div>
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
    import {mapMutations, mapGetters} from 'vuex'
    import * as types from '../../store/mutations-types'
    import tools from '../../utils/tool'

    export default {
        data() {
            return {
                title: '',
                titleTime: '',
                startTimeStr: '请选择',
                endTimeStr: '请选择',
                radioValues: ['否', '是'],
                value: 0,
                pickerValue: new Date(),
                startDate: new Date(),
                field: '',
                isStart:true
            }
        },
        computed: {
            ...mapGetters([
                'roleCancel',
                'roleCancelBeginTime',
                'roleCancelEndTime',
                'activityComment',
                'commentEndTime',
                'activityRetroactive',
                'activityRetroBeginTime',
                'activityRetroEndTime'
            ])
        },
        created() {
            let startDate = new Date((new Date().getTime()) - 24 * 60 * 60 * 365 * 1000)
            this.startDate = startDate
            this.pickerValue = startDate
            let field = this.$route.query.field
            this.field = field
            switch (field) {
                case 'roleCancel': {
                    document.title = '角色取消'
                    if (tools.isNotEmpty(this.roleCancelBeginTime) && this.roleCancelBeginTime !== 0) {
                        this.startTimeStr = tools.formatTime(this.roleCancelBeginTime)
                    }
                    if (tools.isNotEmpty(this.roleCancelEndTime) && this.roleCancelEndTime !== 0) {
                        this.endTimeStr = tools.formatTime(this.roleCancelEndTime)
                    }
                    this.value = Number(this.roleCancel)
                    this.title = '角色取消'
                    this.titleTime = '角色取消时间'
                }
                    break;
                case 'activityRetroactive': {
                    document.title = '活动补签'
                    if (tools.isNotEmpty(this.activityRetroBeginTime) && this.activityRetroBeginTime !== 0) {
                        this.startTimeStr = tools.formatTime(this.activityRetroBeginTime)
                    }
                    if (tools.isNotEmpty(this.activityRetroEndTime) && this.activityRetroEndTime !== 0) {
                        this.endTimeStr = tools.formatTime(this.activityRetroEndTime)
                    }
                    this.value = Number(this.activityRetroactive)
                    this.title = '活动补签'
                    this.titleTime = '活动补签时间'
                }
                    break;
                case 'activityComment': {
                    document.title = '活动评价'
                    if (tools.isNotEmpty(this.commentEndTime) && this.commentEndTime !== 0) {
                        this.startTimeStr = tools.formatTime(this.commentEndTime)
                    }
                    this.value = Number(this.activityComment)
                    this.title = '活动评价'
                    this.titleTime = '活动评价时间'
                    this.radioValues = ['强制评价','开放评价']
                }
                    break;
            }
        },
        methods: {
            ...mapMutations({
                setActivityRetroactive: types.SET_ACTIVITYRETROACTIVE,
                setActivityRetroBeginTime: types.SET_ACTIVITYRETROBEGINTIME,
                setActivityRetroEndTime:types.SET_ACTIVITYRETROENDTIME,
                setRoleCancel: types.SET_ROLECANCEL,
                setRoleCancelBeginTime: types.SET_ROLECANCELBEGINTIME,
                setRoleCancelEndTime: types.SET_ROLECANCELENDTIME,
                setActivityComment: types.SET_ACTIVITYCOMMENT,
                setCommentEndTime: types.SET_COMMENTENDTIME
            }),
            selectTime(index){
                this.pickerValue = this.startDate
                switch (this.field) {
                    case 'activityComment': {
                        this.startTimeStr !== '请选择' && (this.pickerValue = new Date(this.startTimeStr))
                        this.isStart = true
                    }
                        break;
                    default:{
                        if (index === 0){
                            this.startTimeStr !== '请选择' && (this.pickerValue = new Date(this.startTimeStr))
                        }else{
                            this.endTimeStr !== '请选择' && (this.pickerValue = new Date(this.endTimeStr))
                        }
                        this.isStart =  index === 0 ? true : false
                    }
                    break;
                }
                this.$refs.picker.open();
            },
            handleConfirm() {
                switch (this.field) {
                    case 'roleCancel': {
                        if (this.isStart){
                            this.setRoleCancelBeginTime(this.pickerValue.getTime() / 1000)
                        }else{
                            this.setRoleCancelEndTime(this.pickerValue.getTime() / 1000)
                        }
                    }
                        break;
                    case 'activityRetroactive': {
                        if (this.isStart){
                            this.setActivityRetroBeginTime(this.pickerValue.getTime() / 1000)
                        }else{
                            this.setActivityRetroEndTime(this.pickerValue.getTime() / 1000)
                        }
                    }
                        break;
                    case 'activityComment': {
                        this.setCommentEndTime(this.pickerValue.getTime() / 1000)
                    }
                        break;
                }
                if (this.isStart){
                    this.startTimeStr = tools.formatTime(this.pickerValue.getTime() / 1000)
                }else{
                    this.endTimeStr = tools.formatTime(this.pickerValue.getTime() / 1000)
                }
            },
            changeType(){
                switch (this.field) {
                    case 'roleCancel': {
                        this.setRoleCancel(Number(this.value))
                    }
                        break;
                    case 'activityRetroactive': {
                        this.setActivityRetroactive(Number(this.value))
                    }
                        break;
                    case 'activityComment': {
                        this.setActivityComment(Number(this.value))
                    }
                        break;
                }
            },
            cancel(){
                this.$router.go(-1)
            }
        }
    }
</script>

<style scoped lang="scss">
    .role-cancel-page {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        .page-title {
            width: 100%;
            height: 1.3333rem;
            border-bottom: 0.0133rem solid #e9e9e9;
            background-color: #ffffff;
            font-size: 0.4rem;
            color: #33484f;
            display: flex;
            align-items: center;
            padding-left: 0.4267rem;
        }
        .radio {
            padding-left: 0.4267rem;
            background-color: #ffffff;
            .time {
                font-size: 0.4rem;
                color: #33484f;
                display: flex;
                align-items: center;
                .noContent {
                    color: #91a8b0;
                }
                i.sec {
                    color: #91a8b0;
                    margin-top: 0.0267rem;
                }
                .start {
                    margin-right: 0.2667rem;
                }
            }
            .item {
                height: 1.3333rem;
                width: 100%;
                display: flex;
                align-items: center;
                padding-right: 0.4267rem;
                background-color: #ffffff;
                border-bottom: 0.0133rem solid #e9e9e9;
            }
            .item.flex-end {
                justify-content: flex-end;
            }
            .item.space-between {
                justify-content: space-between;
            }
            .title {
                display: flex;
                align-items: center;
                label {
                    margin-left: 0.3733rem;
                    font-size: 0.4rem;
                    color: #33484f;
                }
            }
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
            input[type='radio']:checked {
                border: solid 0.0267rem #0099ff;
            }
            input[type='radio']:checked::after {
                content: '';
                display: block;
                width: 0.32rem;
                height: 0.32rem;
                background-color: #0099ff;
                border-radius: 50%;
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
