<template>
    <div class="detail-footer">
        <div class="grade-footer" v-if="baseInfo && baseInfo.activity">
            <div @click="collect" :class="['collect']">
                <span :class="[baseInfo.activity.scFlag === 1 ? 'seclesson-star-fill1':'seclesson-star1','sec']"></span>
                <span>{{baseInfo.activity.scNumber}}人收藏</span>
            </div>
            <div class="btn-groups" v-if="isStuLogin">
                <div :class="['dark-grey',btnStatus(baseInfo.activity.wksbmFlag)]">暂未开始报名</div>
                <div @click="showCall" :class="['bg-orange',btnStatus(baseInfo.activity.zxFlag)]">咨询</div>
                <div @click="showRegister" :class="['bg-blue',btnStatus(baseInfo.activity.ljbmFlag)]">立即报名</div>
                <div @click="jumpSignNow" :class="['bg-blue',btnStatus(baseInfo.activity.ljqdFlag)]">立即签到</div>
                <div @click="cancelRegister" :class="['bg-blue',btnStatus(baseInfo.activity.qxbmFlag)]">
                    取消报名
                </div>
                <div :class="['dark-green',btnStatus(baseInfo.activity.hdjxzFlag)]">活动进行中</div>
                <div :class="['dark-grey',btnStatus(baseInfo.activity.yqxFlag)]">已取消</div>

                <div :class="['btn',btnStatus(baseInfo.activity.qtFlag)]">
                    <mt-button @click="jumpSignOff" size="small" type="primary" plain>签退</mt-button>
                </div>
                <div :class="['btn',btnStatus(baseInfo.activity.bqFlag)]">
                    <mt-button @click="jumpSupple" size="small" type="primary" plain>补签</mt-button>
                </div>
                <div :class="['btn',btnStatus(baseInfo.activity.ljpjFlag)]">
                    <mt-button @click="jumpCommentNow" size="small" type="primary" plain>立即评价</mt-button>
                </div>
            </div>
            <div class="btn-groups" v-else-if="!isStuLogin">
                <div @click="jumpStuLogin" :class="['bg-blue']">完善学籍</div>
            </div>

        </div>
        <div class="call-modal" v-show="isCallShow" v-if="baseInfo && baseInfo.activity">
            <div class="modal-body">
                <div class="charge" v-for="item in baseInfo.charge" v-if="baseInfo.activity.activityCategory === '0'">
                    <div class="call-info">
                        <span>{{item.name}}</span>
                        <a v-if="item.phone" :href="'tel:' + item.phone ">{{item.phone}}</a>
                    </div>
                    <div v-if="item.phone" class="icon">
                        <img width="30" src="../../assets/phone.png" alt="">
                    </div>
                </div>
                <div class="charge" v-if="baseInfo.activity.activityCategory === '1'">
                    <div class="call-info">
                        <span>{{baseInfo.activity.teacherName}}</span>
                        <a v-if="baseInfo.activity.teacherPhone" :href="'tel:' + baseInfo.activity.teacherPhone">{{baseInfo.activity.teacherPhone}}</a>
                    </div>
                    <div v-if="baseInfo.activity.teacherPhone" class="icon">
                        <img width="30" src="../../assets/phone.png" alt="">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="modal-cancel" @click="hideCall">取消</div>
            </div>
        </div>
        <div v-show="isCallShow" class="modal-bg" @click="hideCall"></div>
        <div v-show="isRegisterShow" class="modal-bg" @click="hideRegister"></div>
        <div class="register-modal" v-show="isRegisterShow">
            <div class="modal-body">
                <div class="radio">
                    <mt-radio
                        :options="this.option"
                        :value.sync="activity_role_id"
                        @change="checkRadio">
                    </mt-radio>
                </div>
                <div class="limit" v-if="ruleSetting">
                    <span v-if="ruleSetting.participantType">{{ numLimit(ruleSetting.participantType.maxPlayers)}}</span>
                    <span v-if="ruleSetting.organizerType">{{ numLimit(ruleSetting.organizerType.maxPlayers)}}</span>
                    <span v-if="ruleSetting.controllerType">{{ numLimit(ruleSetting.controllerType.maxPlayers)}}</span>
                </div>
            </div>
            <div class="modal-footer">
                <div class="modal-cancel" @click="hideRegister">取消</div>
                <div class="modal-ok" @click="register">确定</div>
            </div>
        </div>
    </div>
</template>

<script>
    import request from "../../utils/request";
    import tools from "../../utils/tool"
    import {Radio, MessageBox, Toast } from 'mint-ui';
    import {CONF} from "../../utils/URLConfig";
    import {getStuIsLogin} from '../../utils/setUserInfo'

    export default {
        name: "btnGroup",
        props:['baseInfoData','ruleSettingData'],
        computed: {
            option(){
                let set = this.ruleSetting,
                    op = [];
                if(set){
                    if(set.participantType){
                        op.push({
                            label: '参与者',
                            value: '1',
                        });
                        this.activity_role_id = '1';
                    }
                    if(set.organizerType){
                        op.push({
                            label: '组织者',
                            value: '3',
                        });
                        !set.participantType && (this.activity_role_id = '3');
                    }
                    if(set.controllerType){
                        op.push({
                            label: '管理者',
                            value: '2',
                        });
                        !set.participantType && !set.organizerType && (this.activity_role_id = '2');
                    }

                }
                return op;
            },
            getImgUrl() {
                return tools.fileUrlGet(this.$data.baseInfo && this.$data.baseInfo.activity && this.$data.baseInfo.activity.coverPicture, 'coverPicture')
            },
            getActivityId(){
                return this.$data.baseInfo.activity && this.$data.baseInfo.activity.activityId;
            },
            getActivityName(){
                return this.$data.baseInfo.activity && this.$data.baseInfo.activity.activityName;
            },
            getActivityPlatformName(){
                return this.$data.baseInfo.activity && this.$data.baseInfo.activity.activityPlatformName;
            },
            getTime(){
                return this.$data.ruleSetting.rule && tools.formatTime(this.$data.ruleSetting.rule.activityBeginTime);
            },
            getAddress(){
                return this.$data.baseInfo.activity && this.$data.baseInfo.activity.address;
            },
        },
        data() {
            return {
                tools,
                collecting : false,
                isCallShow: false,
                isRegisterShow: false,
                isStuLogin : getStuIsLogin() === 'true',
                activity_role_id : '1',
                baseInfo: this.baseInfoData || {},
                ruleSetting: this.ruleSettingData || {},
            }
        },
        watch:{
            baseInfoData:function (newVal) {
                this.baseInfo = newVal;
            },
            ruleSettingData:function (newVal) {
                this.ruleSetting = newVal;
            }
        },
        methods:{
            jumpSupple() { // 补签
                this.$router.push({
                    path: `/retroactive`,
                    query: {
                        activityId: this.getActivityId,
                        activityName: this.getActivityName, // 活动名称
                        signInTotal: this.$data.ruleSetting.signContent.length, //总签到次数
                        currentCount: this.$data.baseInfo.activity.signNumber, //当前签到次数
                    }
                })
            },
            jumpSignOff() { // 签退
                if(this.$data.baseInfo.activity && this.$data.baseInfo.activity.signModeId === 0) {
                    this.$router.push({
                        path: `/checkIn`,
                        query: {
                            activityId: this.getActivityId,
                            isChecked: 1, //1 签退， 0签到
                            img: this.getImgUrl, // 活动图片
                            activityName: this.getActivityName, // 活动名称
                            label: this.getActivityPlatformName, //活动类
                            time: this.getTime, //活动时间
                            address: this.getAddress, // 活动地址
                        }
                    })
                }else {
                    MessageBox.alert('请使用扫码签到');
                }
            },
            jumpCommentNow() { // 立即评价
                this.$router.push({
                    path: `/comment`,
                    query: {
                        activityId: this.getActivityId,
                        img: this.getImgUrl, // 活动图片
                        activityName: this.getActivityName, // 活动名称
                        label: this.getActivityPlatformName, //活动类
                        time: this.getTime, //活动时间
                    }
                })
            },
            jumpSignNow() { // 立即签到
                if(this.$data.baseInfo.activity && this.$data.baseInfo.activity.signModeId === 0){
                    this.$router.push({
                        path: `/checkIn`,
                        query: {
                            activityId: this.getActivityId,
                            isChecked: 0, //1 签退， 0签到
                            img: this.getImgUrl, // 活动图片
                            activityName: this.getActivityName, // 活动名称
                            label: this.getActivityPlatformName, //活动类
                            time: this.getTime, //活动时间
                            address: this.getAddress, // 活动地址
                        }
                    })
                }else {
                    MessageBox.alert('请使用扫码签到');
                }
            },
            jumpStuLogin(){
                this.$router.push({
                    path: '/stu-status'
                })
            },
            showCall() {
                this.$data.isCallShow = true
            },
            hideCall() {
                this.$data.isCallShow = false
            },
            showRegister() {
                this.$data.isRegisterShow = true
            },
            hideRegister() {
                this.$data.isRegisterShow = false
            },
            register() {
                //请求
                request
                    .get(CONF.ajaxUrl.registerNow, {
                        activityid: this.$data.baseInfo.activity.activityId,
                        activity_role_id: this.$data.activity_role_id
                    })
                    .then(response => {
                        this.hideRegister();
                        MessageBox.alert(response.msg).then(e => {
                            if (e === 'confirm' && response.code === 0) {
                                location.reload()
                            }
                        })
                    })
            },
            collect() {
                let collected = this.$data.baseInfo.activity.scFlag;
                if(this.$data.collecting){
                    return;
                }

                if(!this.isStuLogin){
                    MessageBox.alert('请先完善学籍');
                    return;
                }
                this.$data.collecting = true;
                request
                    .get(CONF.ajaxUrl.collect, {
                        iscollection: collected ? 0 : 1,
                        activityid : this.$data.baseInfo.activity.activityId
                    })
                    .then(() => {
                        this.$data.collecting = false;
                        let msg = '';
                        if (collected === 1) {
                            msg = '取消收藏成功';
                            this.$data.baseInfo.activity.scNumber--
                        } else {
                            msg = '收藏成功';
                            this.$data.baseInfo.activity.scNumber++
                        }
                        this.$data.baseInfo.activity.scFlag = collected ? 0 : 1;
                        Toast(msg)
                    })
            },
            checkRadio(num) {
                // 请求
                this.$data.activity_role_id = num
            },
            numLimit(str) {
                return str === 0 ? '无限制' : '余' + str + '个名额'
            },
            btnStatus(num) {
                let className = '';
                switch (num) {
                    case 0:
                        className = 'hide';
                        break;
                    case 2:
                        className = 'disabled';
                        break
                }
                return className
            },
            cancelRegister() {
                MessageBox({
                    message: `确定要取消报名吗？`,
                    showCancelButton: true
                }).then(action => {
                    if (action === 'confirm') {
                        request
                            .get(CONF.ajaxUrl.cancelRegister, {
                                activityid: this.$data.baseInfo.activity.activityId
                            })
                            .then(response => {
                                MessageBox.alert(response.msg).then(() => {
                                    if(response.code === 0){
                                        location.reload();
                                    }
                                })
                            })
                    }
                })
            }
        }
    }
</script>

<style lang="scss">
    .detail-footer{
        .grade-footer {
            position: fixed;
            height: 50px;
            border-top: 1px solid #ddd;
            width: 100%;
            bottom: 0;
            background: white;
            display: table;
            .collect {
                font-size: 13px;
                background: white;
                float: left;
                color: #a0b1b8;
                display: table-cell;
                line-height: 50px;
                padding: 0 7px;
                text-align: center;
                span {
                    display: inline-block;
                }
                span:last-child {
                    padding-left: 30px;
                    float: left;
                }
                span:first-child {
                    position: absolute;
                    left: 8px;
                }

            }
            .seclesson-star-fill1 {
                font-size: 28px;
                color: #0099ff;
            }
            .seclesson-star1 {
                font-size: 28px;
            }
            .btn-groups{
                > div {
                    display: table-cell;
                    line-height: 50px;
                    font-size: 16px;
                    padding: 0 7px;
                    text-align: center;
                    float: right;
                    /*&:first-child {*/
                        /*background: white;*/
                        /*float: left;*/
                        /*color: #a0b1b8;*/
                    /*}*/
                    &.btn {
                        padding: 0;
                        margin-right: 7px;
                        float: right;
                    }
                }
            }

            .bg-green {
                background: rgb(0, 128, 0);
            }
            .bg-blue {
                background: #65b3f1;
            }
            .bg-orange {
                background: #f5966a;
                color: white;
            }
            .half-opacity {
                opacity: 0.5;
            }
            .dark-green {
                background: #41cbbb;
            }
            .dark-grey {
                background: #d8e3e9;
                color: #648090;
            }
        }
        .register-modal,
        .call-modal {
            position: fixed;
            top: 150px;
            width: 190px;
            z-index: 1001;
            max-width: 100%;
            border: none;
            border-radius: 5px;
            opacity: 1;
            margin: 0 auto;
            background-color: #fff;
            -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);
            box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);
            padding: 0;
            .modal-body {
                padding: 10px;
                max-height: 300px;
                overflow: auto;
                .radio{
                    .mint-radiolist-title{
                        display: none;
                    }
                }
                .charge {
                    border-bottom: 1px solid #ddd;
                    padding: 10px 0;
                    &:last-child {
                        padding-bottom: 0;
                        border: none;
                    }
                    .call-info {
                        display: inline-block;
                        > span,
                        a {
                            display: block;
                            padding: 3px;
                            font-size: 14px;
                            font-weight: 600;
                            color: black;
                        }
                        a {
                            text-decoration: none;
                        }
                    }
                    .icon {
                        display: inline-block;
                        float: right;
                        padding-top: 10px;
                    }
                }
            }
            .modal-footer {
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 16px;
                color: #007aff;
                padding: 10px;
            }
        }
        .call-modal{
            left: calc(50% - 95px);
        }
        .register-modal {
            width: 310px;
            left: calc(50% - 155px);
            .mint-cell-wrapper{
                background: none;
            }
            .mint-cell{
                background: none;
            }
            .modal-body {
                > div {
                    float: left;
                }
                .radio {
                    display: inline-block;
                }
                .limit {
                    display: inline-block;
                    span {
                        display: block;
                        font-size: 16px;
                        line-height: 48px;
                        text-align: left;
                        padding-left: 10px;
                        height: 48px;
                    }
                }
            }

            .modal-footer {
                display: table;
                padding: 0;
                width: 100%;
                > div {
                    display: table-cell;
                    padding: 10px;
                    &:first-child {
                        border-right: 1px solid #ddd;
                    }
                }
            }
        }
        .modal-bg {
            transition: opacity 0.3s ease;
            z-index: 1000;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
        }
    }

</style>
