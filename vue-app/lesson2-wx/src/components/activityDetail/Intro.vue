<template>
    <div class="intro" v-if="!!baseInfo">

        <!-- tabcontainer -->
        <div class="intro-title">
            <div class="name">{{baseInfo && baseInfo.activity && baseInfo.activity.activityName}}</div>
            <div class="content">{{baseInfo && baseInfo.activity && baseInfo.activity.slogan}}</div>
        </div>
        <div class="line"></div>
        <mt-tab-container v-model="selected" class="intro-body">
            <mt-navbar class="page-part side-nav" v-model="selected">
                <mt-tab-item id="time"><span class="sec seclesson-shijian"></span>时间</mt-tab-item>
                <mt-tab-item id="integral"><span class="sec seclesson-jifen"></span>积分</mt-tab-item>
                <mt-tab-item id="detail"><span class="sec seclesson-xiangqing1"></span>详情</mt-tab-item>
                <mt-tab-item id="condition"><span class="sec seclesson-tiaojian1"></span>条件</mt-tab-item>
                <div @click="changeShare" class="mint-tab-item"><span class="sec seclesson-fenxiang1"></span>分享</div>
            </mt-navbar>
            <mt-tab-container-item id="time" v-if="baseInfo">
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        活动地点
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.address}}
                    </div>
                </div>
                <div class="intro-body-item" v-if="category === '0'">
                    <div class="intro-body-title">
                        主办方
                    </div>
                    <div class="intro-body-content">
                        <div class="bg-blue" v-for="item in baseInfo.sponsor">
                            {{item.name}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="category === '0' && baseInfo && baseInfo.contractor">
                    <div class="intro-body-title">
                        承办方
                    </div>
                    <div class="intro-body-content">
                        <div class="bg-blue" v-for="item in baseInfo.contractor">
                            {{item.name}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        活动类别
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.activityCategoryName}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        活动级别
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.activityLevelName}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        活动归属
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.activityAttributionName}}
                    </div>
                </div>
                <div class="intro-body-item" >
                    <div class="intro-body-title">
                        活动平台
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.activityPlatformName}}
                    </div>
                </div>
                <div class="intro-body-item" v-if="baseInfo.activity && baseInfo.activity.platformCategoryName">
                    <div class="intro-body-title">
                        平台类别
                    </div>
                    <div class="intro-body-content">
                        {{ baseInfo.activity.platformCategoryName}}
                    </div>
                </div>
                <div class="intro-body-item" v-if="category === '0'">
                    <div class="intro-body-title">
                        地址
                    </div>
                    <div class="intro-body-content">
                        {{baseInfo.activity && baseInfo.activity.address}}
                    </div>
                </div>
                <div class="intro-body-item" v-if="category === '0' && baseInfo && baseInfo.charge">
                    <div class="intro-body-title">
                        负责人
                    </div>
                    <div class="intro-body-content">
                        <div class="charge" v-for="item in baseInfo.charge">
                            {{item.name + '&nbsp' + item.phone}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting">
                    <div class="intro-body-title">
                        活动时间
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span class="grey">(开始)</span>{{ruleSetting.rule &&
                            tool.formatTime(ruleSetting.rule.activityBeginTime)}}
                        </div>
                        <div><span class="grey">(结束)</span>{{ruleSetting.rule && tool.formatTime(ruleSetting.rule.activityEndTime)}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting">
                    <div class="intro-body-title">
                        报名时间
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span class="grey">(开始)</span>{{ruleSetting.rule &&
                            tool.formatTime(ruleSetting.rule.applicationBeginTime)}}
                        </div>
                        <div><span class="grey">(结束)</span>{{ruleSetting.rule && tool.formatTime(ruleSetting.rule.applicationEndTime)}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting">
                    <div class="intro-body-title sign">
                        签到类型
                        <mt-button
                            :class="['signin', !signIn && 'bg-white', ruleSetting.rule && !ruleSetting.rule.signBack && 'radio-4']"
                            @click="sign(true)" type="primary" size="small">签到
                        </mt-button>
                        <mt-button v-show="ruleSetting.rule && ruleSetting.rule.signBack"
                                   :class="['signoff', signIn && 'bg-white']"
                                   @click="sign(false)" type="primary" size="small">签退
                        </mt-button>
                    </div>
                    <div class="intro-body-content">
                        <div class="sign-content" v-show="signIn">
                            <div v-for="(item, index) in ruleSetting.signContent"
                                 v-if="ruleSetting && ruleSetting.signContent">
                                <div class="font-weight-600">{{chnNumChar[index]}}次签到</div>
                                <div>签到时间：<span>{{tool.formatTime(item.signStartTime)}}</span></div>
                                <div class="padding-left-60">至：{{tool.formatTime(item.signEndTime)}}</div>
                                <div>签到方式：{{item.signType === 0 ? '人脸识别':'动态二维码'}}</div>
                                <div>签到位置：{{item.signPosition === '0' ? '不限' : (item.signCaption ?  item.signCaption + '，': '') + '限制距离' + item.distance}}</div>
                            </div>
                        </div>
                        <div class="sign-content" v-show="!signIn">
                            <div>
                                <div>签退时间：{{ruleSetting.rule && tool.formatTime(ruleSetting.rule.signBackStartTime)}}至{{ruleSetting.rule
                                    && tool.formatTime(ruleSetting.rule.signBackEndTime)}}
                                </div>
                                <div>签退方式：{{ruleSetting.rule && ruleSetting.rule.signType === 0 ? '人脸识别' : '动态二维码'}}</div>
                                <div>签退位置：{{ruleSetting.rule && ruleSetting.rule.signPosition}}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting && ruleSetting.rule && ruleSetting.rule.activityRetroBeginTime">
                    <div class="intro-body-title">
                        活动补签
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span class="grey">(开始)</span>{{tool.formatTime(ruleSetting.rule.activityRetroBeginTime)}}
                        </div>
                        <div><span class="grey">(结束)</span>{{tool.formatTime(ruleSetting.rule.activityRetroEndTime)}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting && ruleSetting.rule && ruleSetting.rule.activityCancelBeginTime">
                    <div class="intro-body-title">
                        活动取消
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span class="grey">(开始)</span>{{tool.formatTime(ruleSetting.rule.activityCancelBeginTime)}}
                        </div>
                        <div><span class="grey">(结束)</span>{{tool.formatTime(ruleSetting.rule.activityCancelEndTime)}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item" v-if="ruleSetting && ruleSetting.rule && ruleSetting.rule.roleCancelBeginTime">
                    <div class="intro-body-title">
                        角色取消
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span class="grey">(开始)</span>{{tool.formatTime(ruleSetting.rule.roleCancelBeginTime)}}
                        </div>
                        <div><span class="grey">(结束)</span>{{tool.formatTime(ruleSetting.rule.roleCancelEndTime)}}
                        </div>
                    </div>
                </div>
                <div class="intro-body-item border-none" v-if="ruleSetting && ruleSetting.rule && ruleSetting.rule.commentEndTime">
                    <div class="intro-body-title">
                        活动评价
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8">
                            评价方式：{{ruleSetting.rule.activityComment === 0 ? '强制评价' : '开放评价'}}
                        </div>
                        <div>
                            截止时间：{{tool.formatTime(ruleSetting.rule.commentEndTime)}}
                        </div>
                    </div>
                </div>

            </mt-tab-container-item>
            <mt-tab-container-item v-if="ruleSetting" id="integral">
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        人员上限
                    </div>
                    <div class="intro-body-content number-limit">
                        <div v-if="tool.isNotEmpty(pMaxPlayers)">
                            <span>参与者</span>
                            <span class="left-30">{{numLimit(pMaxPlayers)}}</span>
                        </div>
                        <div v-if="tool.isNotEmpty(oMaxPlayers)">
                            <span>组织者</span>
                            <span class="left-30">{{numLimit(oMaxPlayers)}}</span>
                        </div>
                        <div v-if="tool.isNotEmpty(cMaxPlayers)">
                            <span>管理者</span>
                            <span class="left-30">{{numLimit(cMaxPlayers)}}</span>
                        </div>
                    </div>
                </div>
                <div class="tables">
                    <table>
                        <thead>
                        <tr>
                            <th>年份</th>
                            <th>角色</th>
                            <th>获得积分</th>
                            <th>未签到扣分</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item) in ruleSetting.tables">
                            <td v-for="td in item">{{td}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </mt-tab-container-item>
            <mt-tab-container-item id="detail" v-if="baseInfo">
                <div class="intro-body-item">
                    <div class="intro-body-title padding-bottom-0">
                        开课系院
                        <div class="attribute">{{baseInfo.activity && baseInfo.activity.activityAttributionNameDesc}}</div>
                    </div>
                </div>
                <div class="intro-body-item"  v-if="category === '1'">
                    <div class="intro-body-title">
                        教师介绍
                    </div>
                    <div class="intro-body-content">
                        <div class="margin-bottom-8"><span>职称：</span>{{baseInfo.activity &&
                            baseInfo.activity.teacherPosition}}
                        </div>
                        <div><span>姓名：</span>{{baseInfo.activity && baseInfo.activity.teacherName}}</div>
                    </div>
                </div>
                <div class="intro-body-item border-none">
                    <div class="intro-body-title">
                        课程详情
                    </div>
                    <div class="intro-body-content">
                        <div class="dotted">
                            {{baseInfo.activity && baseInfo.activity.courseDescription}}
                        </div>
                    </div>
                </div>
            </mt-tab-container-item>
            <mt-tab-container-item id="condition" v-if="objectSetting">
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        面向系院
                    </div>
                    <div class="intro-body-content">
                        {{objectSetting.college && objectSetting.college.map(item => {return item.name}).join('、') || '不限制'}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        面向专业
                    </div>
                    <div class="intro-body-content">
                        {{objectSetting.major && objectSetting.major.map(item => {return item.name}).join('、') || '不限制'}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        面向班级
                    </div>
                    <div class="intro-body-content">
                        {{objectSetting.clbum && objectSetting.clbum.map(item => {return item.name}).join('、') || '不限制'}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        面向年级
                    </div>
                    <div class="intro-body-content">
                        {{objectSetting.grade && objectSetting.grade.map(item => {return item.name}).join('、') || '不限制'}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        其他系院
                    </div>
                    <div class="intro-body-content">
                        {{signUpLimit(objectSetting.object && objectSetting.object.otherCollege) || '不限制'}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        其他专业
                    </div>
                    <div class="intro-body-content">
                        {{signUpLimit(objectSetting.object && objectSetting.object.otherMajor)}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        其他班级
                    </div>
                    <div class="intro-body-content">
                        {{signUpLimit(objectSetting.object && objectSetting.object.otherClass)}}
                    </div>
                </div>
                <div class="intro-body-item">
                    <div class="intro-body-title">
                        其他年级
                    </div>
                    <div class="intro-body-content">
                        {{signUpLimit(objectSetting.object && objectSetting.object.otherGrade)}}
                    </div>
                </div>
            </mt-tab-container-item>
        </mt-tab-container>
    </div>
</template>

<script>
    import request from "../../utils/request";
    import tool from '../../utils/tool';
    import wxshare from '../../utils/share.js'
    import share from '../../components/activityDetail/share'

    export default {
        props: ['baseInfoData', 'ruleSettingData', 'objectSettingData'],
        components: {
            share
        },
        data() {
            return {
                tool: tool,
                signIn: true,
                isShare: false,
                isTeacher: localStorage.getItem('role') === 'teacher',
                selected: 'time',
                chnNumChar: ['一', '二', '三', '四', '五', '六', '七', '八', '九'], // 签到次数阿拉伯转中文
                baseInfo: this.baseInfoData,
                ruleSetting: this.ruleSettingData,
                objectSetting: this.objectSettingData
            }
        },
        watch: {
            baseInfoData: function (newVal) {
                this.baseInfo = newVal;
            },
            ruleSettingData: function (newVal) {
                this.ruleSetting = newVal;
            },
            objectSettingData: function (newVal) {
                this.objectSetting = newVal;
            }
        },
        methods: {
            sign(isSign) {
                this.signIn = isSign;
            },
            numLimit(str) {
                return str === 0 ? '无限制' : str + '人';
            },
            signUpLimit(num) {
                let str = '';
                switch (num) {
                    case '0':
                        str = '不限制';
                        break;
                    case '1':
                        str = '允许报名但不给成绩';
                        break;
                    case '2':
                        str = '不允许报名';
                        break;
                }
                return str;
            },
            changeShare(){
                this.$emit('changeShare', true)
            }
        },
        computed: {
            category(){  // 0活动  1课程
                return this.baseInfo && this.baseInfo.activity && this.baseInfo.activity.activityCategory
            },
            pMaxPlayers: function () {
                let type = this.ruleSetting && this.ruleSetting.participantType;
                return type && type.maxPlayers
            },
            oMaxPlayers: function () {
                let type = this.ruleSetting && this.ruleSetting.organizerType;
                return type && type.maxPlayers
            },
            cMaxPlayers: function () {
                let type = this.ruleSetting && this.ruleSetting.controllerType;
                return type && type.maxPlayers
            }
        }
    }
</script>

<style lang="scss">
    .student{
        .intro-body {
            .mint-tab-container-item{
                height: calc(100vh - 8.7rem);
                overflow-y: auto;
            }
        }

    }
    .teacher{
        .intro-body {
            .mint-tab-container-item{
                height: calc(100vh - 7.3rem);
                overflow-y: auto;
            }
        }

    }
    .intro {
        background: white;
        .side-nav {
            display: block;
            position: fixed;
            z-index: 1;
            border-bottom: none;
            right: 0;
            .mint-tab-item {
                padding: .1rem 10px;
                background: #eef6f6;
                color: #91a9b0;
                margin-bottom: 1px !important;
                .mint-tab-item-label {
                    font-size: 14px;
                }
                &.is-selected {
                    border-bottom: none;
                    color: #26a2ff;
                }
                .sec {
                    display: block;
                    margin-bottom: 1px;
                    font-size: .6rem;
                }
            }
        }
        .intro-title {
            left: 0;
            top: 0;
            height: 1.6rem;
            background: inherit;
            background-color: rgba(255, 255, 255, 1);
            box-sizing: border-box;
            border-radius: 0;
            -moz-box-shadow: none;
            -webkit-box-shadow: none;
            box-shadow: none;
            font-size: 16px;
            .name {
                border-width: 0;
                padding: .1rem .27rem;
                white-space: nowrap;
            }
            .content {
                padding-left: .3rem;
                color: #BCBCBC;
            }
        }
        .intro-body {
            background: white;
            width: calc(100% - 50px);
            /*height: 900px;*/
            .intro-body-item {
                font-size: .44rem;
                border-bottom: 1px solid #ddd;
                padding-bottom: .27rem;
                background: white;
                overflow-y: auto;
                .intro-body-title {
                    padding: .27rem;
                    color: #A0B1B8;
                    &.padding-bottom-0 {
                        padding-bottom: 0;
                    }
                    .bg-white {
                        background: #fff;
                        color: #26a2ff;
                        border: 1px solid #26a2ff;
                    }
                    &.sign {
                        button {
                            font-size: 18px;
                        }
                    }
                    .signin {
                        margin-left: .27rem;
                        border-bottom-right-radius: 0;
                        border-top-right-radius: 0;
                        &.radio-4 {
                            border-radius: 4px;
                        }
                    }
                    .signoff {
                        margin-left: -6px;
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                    .attribute {
                        display: inline-block;
                        margin-left: .54rem;
                        color: #000000;
                    }
                }
                .intro-body-content {
                    padding-left: .27rem;
                    .bg-blue {
                        display: inline-block;
                        background: #64B4F2;
                        color: white;
                        margin-right: .135rem;
                        margin-bottom: .135rem;
                        padding: .08rem .32rem;
                        font-size: 14px;
                    }
                    .charge {
                        display: inline-block;
                        margin-right: .27rem;
                    }
                    .grey {
                        color: #A0B1B8;
                        margin-right: .27rem;
                    }
                    .margin-bottom-8 {
                        margin-bottom: .22rem;
                    }
                    .sign-content {
                        padding-right: .27rem;
                        .padding-left-60{
                            padding-left: 60px;
                        }
                        > div {
                            background: #EFF4F7;
                            margin-bottom: .5rem;
                            > div {
                                padding: .15rem .35rem;
                            }
                            .font-weight-600 {
                                font-weight: 600;
                            }
                            &:last-child {
                                margin-bottom: 0;
                            }
                        }

                    }
                    &.number-limit {
                        > div {
                            margin-bottom: .27rem;
                            &:last-child {
                                margin-bottom: 0;
                            }
                        }
                        .left-30 {
                            margin-left: 50px;
                        }
                    }
                    .dotted {
                        border: 1px dashed #ccc;
                        padding: .27rem;
                        word-wrap: break-word;
                        margin-right: .27rem;
                        line-height: 25px;
                    }
                }
            }
            .tables {
                padding: .4rem .27rem;
                border: 1px solid #d7e4e8;
                background: white;
                width: 95%;
                margin: 2.5%;
                border-radius: .08rem;
                box-shadow: 0 0 1px #ddd;
                table {
                    width: 100%;
                    border-collapse: collapse;
                    td, th {
                        padding: .27rem .05rem;
                        border: 1px solid #33494f;
                        text-align: center;
                    }
                }

            }
            .border-none {
                border: none;
            }
        }
        .line {
            height: .19rem;
            background: #f3f3f3;
        }
    }

</style>
