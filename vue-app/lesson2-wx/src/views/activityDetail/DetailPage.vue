<template>
    <div :class="['page-detail']">
        <div class="page-title">
            <img height="100%" :src="getImgUrl" alt="">
            <span class="img-status">{{baseInfo.activity && baseInfo.activity.state}}</span>
        </div>
        <!-- navbar -->
        <mt-navbar class="page-part" v-model="selected">
            <mt-tab-item id="intro">简介</mt-tab-item>
            <mt-tab-item id="signup">报名</mt-tab-item>
            <mt-tab-item v-if="isTeacher" id="signin">签到</mt-tab-item>
            <mt-tab-item id="assess">评价</mt-tab-item>
            <mt-tab-item v-if="isTeacher" id="grade">成绩</mt-tab-item>
        </mt-navbar>
        <!-- tabcontainer -->
        <mt-tab-container v-model="selected" :class="[isTeacher ? 'teacher':'student']">
            <mt-tab-container-item id="intro">
                <intro v-on:changeShare="changeShare" v-if="intro" :baseInfoData="baseInfo" :ruleSettingData="ruleSetting" :objectSettingData="objectSetting" ></intro>
            </mt-tab-container-item>
            <mt-tab-container-item id="signup">
                <signup v-if="signup" :activityid="baseInfo.activity && baseInfo.activity.activityId"></signup>
            </mt-tab-container-item>
            <mt-tab-container-item v-if="isTeacher" id="signin">
                <sign-in v-if="signin" :activityid="baseInfo.activity && baseInfo.activity.activityId"
                         :activityData="baseInfo.activity" :signContentData="ruleSetting.signContent"></sign-in>
            </mt-tab-container-item>
            <mt-tab-container-item id="assess">
                <assess v-if="assess" :activityid="baseInfo.activity && baseInfo.activity.activityId"></assess>
            </mt-tab-container-item>
            <mt-tab-container-item v-if="isTeacher" id="grade">
                <grade-list v-if="grade" :activityid="baseInfo.activity && baseInfo.activity.activityId"/>
            </mt-tab-container-item>
        </mt-tab-container>

        <btn-group v-if="!isTeacher" :base-info-data="baseInfo" :rule-setting-data="ruleSetting"></btn-group>
        <share v-if="isShare" v-on:changeShare="changeShare"></share>

    </div>
</template>

<script>
    import request from '../../utils/request'
    import tools from '../../utils/tool'
    import intro from '../../components/activityDetail/intro'
    import GradeList from '../../components/activityDetail/GradeList'
    import assess from '../../components/activityDetail/Assess'
    import signIn from '../../components/activityDetail/SignIn'
    import {Radio, MessageBox, Toast} from 'mint-ui'
    import {CONF} from '../../utils/URLConfig'
    import signup from '../../components/activityDetail/Signup'
    import btnGroup from '../../components/activityDetail/BtnGroup'
    import share from '../../components/activityDetail/share'
    import wxshare from '../../utils/share.js'

    export default {
        components: {
            intro,
            signup,
            GradeList,
            assess,
            signIn,
            btnGroup,
            share,
        },
        name: 'page-detail',
        created() {
            request
                .get(CONF.ajaxUrl.detail + '?output=json', {
                    activityid: this.$route.query.activityid
                })
                .then(response => {
                    let data = response.data || {};
                    this.baseInfo = data.baseInfo || {};
                    this.ruleSetting = data.ruleSetting || {};
                    this.objectSetting = data.objectSetting || {};
                    document.title = data.baseInfo.activity && data.baseInfo.activity.activityName || '活动详情'
                    wxshare.getJSSDKAsync(window.location.href.split('#')[0]).then(()=>{
                        wxshare.setWxShare({
                            title: data.baseInfo.activity.activityName,
                            desc: data.baseInfo.activity.courseDescription,
                            link: window.location.href,
                            imgUrl: tools.fileUrlGet(data.baseInfo.activity.coverPicture,'COVERPICTURE',true)
                        })
                    })
                })
        },
        data() {
            return {
                tools,
                isShare:false,
                isCallShow: false,
                isRegisterShow: false,
                isTeacher: localStorage.getItem('role') === 'teacher',
                activity_role_id: '',
                value: '',
                checkValue: '1',
                // radio的选项
                options: [
                    {
                        label: '', // 参与者
                        value: '1'
                    },
                    {
                        label: '', // 组织者
                        value: '3'
                    },
                    {
                        label: '', // 管理者
                        value: '2'
                    }
                ],
                selected: 'intro',
                intro : true,
                signup : false,
                signin : false,
                assess : false,
                grade : false,
                baseInfo: {
                    activity: {
                        state: '', // 待审核
                        coverPicture: '', // 41ACD1A23390CB72620011E39EDD569A
                        zxFlag: 0,  // 收藏
                        wksbmFlag: 0, // 未开始报名
                        ljpjFlag: 0, // 立即评价
                        qtFlag: 0, //签退
                        ljbmFlag: 0, // 立即报名
                        hdjxzFlag: 0, // 活动进行中
                        scFlag: 0,  // 收藏
                        yqxFlag: 0, // 已取消
                        bqFlag: 0, // 补签
                        qxbmFlag: 0, // 取消报名
                        ljqdFlag: 0, // 立即签到
                        scNumber: 0, // 收藏数量
                        signNumber : 1, // 签到次数
                        activityId: '', // 3780.0
                        activityAttribution: '',
                        activityAttributionNameDesc : '', // 开课系院
                        activityLevel: '',
                        activityLevelName: '', // 活动级别
                        activityAttributionName : '', // 活动归属
                        activityPlatform: '',
                        activityPlatformName: '', // 活动平台
                        platformCategory: '',
                        platformCategoryName: '', // 平台类别
                        signModeId : '', // 0 人脸识别 1 扫码签到
                        remind: '',
                        remark: '',
                        address: '',
                        activityCategory: '',
                        activityCategoryName: '',// 活动类别
                        activityName: '',  // 标题
                        courseDescription: '', // 课程详情
                        teacherId: '',
                        teacherName: '',// 教师名字
                        teacherPhone: '', // 电话
                        slogan: '', // 标题内容
                        accessory: ''
                    },
                    charge: [
                        {
                            name: '',
                            phone: ''
                        },
                        {
                            name: '',
                            phone: ''
                        }
                    ],
                    controllerType: { // 管理者
                        maxPlayers: 0,
                        integralMultiple: ''

                    },
                    organizerType: { // 组织者
                        maxPlayers: 0,
                        integralMultiple: ''
                    },
                    participantType: { // 参与者
                        maxPlayers: 0,
                        integralMultiple: ''
                    }
                },
                ruleSetting: {
                    tables: [
                        // ["2015级积分表", 0, 1, 2],
                    ],
                    rule: {
                        activityBeginTime: "", // 活动开始时间
                        activityEndTime: "", // 活动结束时间
                        applicationBeginTime: "", // 活动报名开始时间
                        applicationEndTime: "", // 活动报名结束时间
                        activityRetroactive: "", // 活动补签true/false
                        activityRetroBeginTime: "", // 活动补签开始时间
                        activityRetroEndTime: "", // 活动补签结束时间
                        activityCancel: "", // 活动取消true/false
                        activityCancelBeginTime: "", // 活动取消开始时间
                        activityCancelEndTime: "", // 活动取消结束时间
                        activitiesList: "", // 是否导入活动名单true/false
                        roleCancel: "", // 角色取消true/false
                        roleCancelBeginTime: "", // 角色取消开始时间
                        roleCancelEndTime: "", // 角色取消结束时间
                        activityComment: "", // 活动评价
                        commentEndTime: "", // 活动评价结束时间
                        signBack: "", // 签退true/false
                        signBackStartTime: "", // 签退开始时间
                        signBackEndTime: "", // 签退结束时间
                        longitude: "", // 经度
                        latitude: "", // 纬度
                        signType: "", // 签退方式0/1
                        distance: "", // 距离123
                        signPosition: "", // 签到位置类型0/1/2
                        duration: "", // 有效时间
                        activityCreateTime: "", // 活动创建时间
                        activityCreateUser: "" // 活动创建发起人
                    },
                    signContent: [
                        {
                            signStartTime: "", // 签到开始时间
                            signEndTime: "", // 签到结束时间
                            signType: "", // 签到方式0/1
                            signPosition: "", // 签到位置类型0/1/2
                            longitude: "", // 经度
                            latitude: "", // 纬度
                            distance: "", // 距离
                            duration: "" // 有效时间
                        }, {
                            signStartTime: "", // 签到开始时间
                            signEndTime: "", // 签到结束时间
                            signType: "", // 签到方式0/1
                            signPosition: "", // 签到位置类型0/1/2
                            longitude: "", // 经度
                            latitude: "", // 纬度
                            distance: "", // 距离
                            duration: "" // 有效时间
                        }
                    ],
                    controllerType: {
                        maxPlayers: "",
                        integralMultiple: "",
                        remain : "", // 剩余多少人
                    },
                    controller: [
                        {
                            userid: "", // 用户id
                            username: "" // 用户名
                        }
                    ],
                    organizerType: {
                        maxPlayers: "",
                        integralMultiple: "",
                        remain : "", // 剩余多少人
                    },
                    organizer: [{
                        userid: "",
                        username: ""
                    }],
                    participantType: {
                        maxPlayers: "", // 总共多少人，为0时不限制
                        integralMultiple: "",
                        remain : "", // 剩余多少人
                    },
                    participant: [{
                        userid: "",
                        username: ""
                    }],
                    activitieList: [{
                        userid: "",
                        username: ""
                    }]
                },
                objectSetting: {
                    object: {
                        limitCollege: "", // 不限学院0/1
                        limitMajor: "", // 不限专业0/1
                        limitGrade: "", // 不限年级0/1
                        limitClass: "", // 不限班级0/1
                        otherCollege: "", // 其他学院0/1
                        otherMajor: "", // 其他专业0/1
                        otherGrade: "", // 其他年级0/1
                        otherClass: "" // 其他班级0/1/2
                    },
                    major: [
                        {
                            id: "", // 专业编号
                            name: "", // 专业名称
                        }
                    ],
                    grade: [
                        {
                            id: "", // 年级编号
                            name: "" // 年级
                        }
                    ],
                    clbum: [
                        {
                            id: "", // 班级编号
                            name: "" // 班级
                        }
                    ],
                    college: [
                        {
                            name: "", // 服装与艺术工程学院
                            id: "" //S001D065
                        }
                    ]

                }
            }
        },
        watch:{
            selected:function () {
                switch (this.$data.selected){
                    case 'signup':
                        this.$data.signup = true;
                        break;
                    case 'signin':
                        this.$data.signin = true;
                        break;
                    case 'assess':
                        this.$data.assess = true;
                        break;
                    case 'grade':
                        this.$data.grade = true;
                        break;
                }
            }
        },
        computed: {
            getImgUrl() {
                return tools.fileUrlGet(this.$data.baseInfo && this.$data.baseInfo.activity && this.$data.baseInfo.activity.coverPicture, 'coverPicture')
            },

        },
        methods: {
            changeShare(isShow) {
                this.isShare = isShow;
            }
        }
    }
</script>
<style lang="scss">
    .page-detail {
        .hide{
            display: none!important;
        }
        .disabled {
            pointer-events: none;
            opacity: 0.5;
        }
        .student {
            >.mint-tab-container-wrap {
                >.mint-tab-container-item {
                    overflow-y: auto;
                    height: calc(100vh - 6.8rem);
                    margin-top: 3px;
                    background: white;
                }
            }
        }
        .teacher {
            >.mint-tab-container-wrap {
                >.mint-tab-container-item {
                    height: calc(100vh - 5.44rem);
                    overflow-y: auto;
                    margin-top: 3px;
                    background: white;
                }
            }
        }

        >.page-title {
            position: relative;
            height: 4rem;
            img {
                width: 100%;
            }
            .img-status {
                position: absolute;
                display: block;
                right: 10px;
                color: white;
                font-size: 16px;
                top: 12px;
            }
        }
        >.page-part {
            border-bottom: 1px solid rgba(228, 228, 228, 1);
            .mint-tab-item-label {
                font-size: 18px;
            }
            >.mint-tab-item{
                padding: .4rem 0;
            }
        }

    }
</style>
