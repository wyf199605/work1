<template>
    <div class="signup">
        <div class="signup-title">
            <div class="time" v-if="isTeacher">
                <div class="grey">报名时间：</div>
                <div>
                    <div> <span class="grey">(开始)</span>{{tool.formatTime(startTime)}}</div>
                    <div> <span class="grey">(结束)</span>{{tool.formatTime(endTime)}}</div>
                </div>
            </div>
            <div class="count" v-if="!isTeacher">
                <div v-if="remain['1']">参与者：已报名
                    <span class="red">{{peopleCount[0]}}人</span>
                    <span v-if="remain['1'] !== -1">，还剩
                    <span class="red">{{remain["1"]}}个</span>名额</span>
                    <span v-if="remain['1'] === -1">，人数不限制</span>
                </div>
                <div v-if="remain['2']">管理者：已报名
                    <span class="red">{{peopleCount[1]}}人</span>
                    <span v-if="remain['2'] !== -1">，还剩
                    <span class="red">{{remain["2"]}}个</span>名额</span>
                    <span v-if="remain['2'] === -1">，人数不限制</span>
                </div>
                <div v-if="remain['3']">组织者：已报名
                    <span class="red">{{peopleCount[2]}}人</span>
                    <span v-if="remain['3'] !== -1">，还剩
                    <span class="red">{{remain["3"]}}个</span>名额</span>
                    <span v-if="remain['3'] === -1">，人数不限制</span>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div class="signup-content">
            <div class="caption" v-if="isTeacher">
                <mt-navbar class="page-part" v-model="selected">
                    <mt-tab-item id="organizer">组织者</mt-tab-item>
                    <mt-tab-item id="controller">管理者</mt-tab-item>
                    <mt-tab-item id="participant">参与者</mt-tab-item>
                </mt-navbar>

                <!-- tabcontainer -->
                <mt-tab-container v-model="selected">
                    <mt-tab-container-item id="organizer">
                        <div class="personal-count">
                            <div class="grey">已报名<span class="red">{{peopleCount[0]}}人</span></div>
                            <div class="grey" v-if="remain['1'] !== -1">还剩<span class="red">{{remain["1"]}}人</span>名额</div>
                            <div class="grey" v-if="remain['1'] === -1">人数不限制</div>
                        </div>
                        <le-progress v-if="remain['1'] !== -1" className="sign-progress" :value='progress(peopleCount[0], remain["1"])'></le-progress>

                        <div class="padding-10">
                            <div class="img-list" v-for="item in list" v-if="item.role === '1'">
                                <div>
                                    <img width="60" :src="item.img" alt="">
                                </div>
                                <span>{{item.name}}</span>
                            </div>
                        </div>
                    </mt-tab-container-item>
                    <mt-tab-container-item id="controller">
                        <div class="personal-count">
                            <div class="grey">已报名<span class="red">{{peopleCount[1]}}人</span></div>
                            <div class="grey" v-if="remain['2'] !== -1">还剩<span class="red">{{remain["2"]}}人</span>名额</div>
                            <div class="grey" v-if="remain['2'] === -1">人数不限制</div>
                        </div>
                        <le-progress v-if="remain['2'] !== -1" className="sign-progress" :value='progress(peopleCount[1], remain["2"])'></le-progress>

                        <div class="padding-10">
                            <div class="img-list" v-for="item in list" v-if="item.role === '2'">
                                <div>
                                    <img width="60" :src="item.img" alt="">
                                </div>
                                <span>{{item.name}}</span>
                            </div>
                        </div>
                    </mt-tab-container-item>
                    <mt-tab-container-item id="participant">
                        <div class="personal-count">
                            <div class="grey">已报名<span class="red">{{peopleCount[2]}}人</span></div>
                            <div class="grey" v-if="remain['3'] !== -1">还剩<span class="red">{{remain["3"]}}人</span>名额</div>
                            <div class="grey" v-if="remain['3'] === -1">人数不限制</div>
                        </div>
                        <le-progress v-if="remain['3'] !== -1" className="sign-progress" :value='progress(peopleCount[2], remain["3"])'></le-progress>

                        <div class="padding-10">
                            <div class="img-list" v-for="item in list" v-if="item.role === '3'">
                                <div>
                                    <img width="60" :src="item.img" alt="">
                                </div>
                                <span>{{item.name}}</span>
                            </div>
                        </div>

                    </mt-tab-container-item>
                </mt-tab-container>
            </div>
            <div v-if="!isTeacher">
                <div class="title">已报名人员</div>
                <div class="padding-10">
                    <div class="img-list" v-for="item in list">
                        <div>
                            <img width="60" :src="item.img" alt="">
                        </div>
                        <span>{{item.name}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import request from "../../utils/request";
    import {CONF} from "../../utils/URLConfig";
    import leProgress from '../progress/Progress';
    import tool from '../../utils/tool';
    import store from '../../store/getters'

    export default {
        name: "signup",
        components:{
            leProgress
        },
        mounted() {
            request.get(CONF.ajaxUrl.signNumber + '?output=json',{
                activityid : this.activityid,
            }).then((response) => {
                let data = response && response.data || {};
                this.startTime = data.startTime;
                this.endTime = data.endTime;
                this.list = data.list || [];
                this.remain = data.remain || [];
            })
        },
        props : ['activityid'],
        data() {
            return {
                tool : tool,
                isTeacher : localStorage.getItem('role') === 'teacher',
                selected : 'organizer',
                total : 0,
                startTime: '',
                endTime: '',
                list: [
                    {
                        img: "",  // md5
                        name: "",
                        role: "", // 1-参与者  2-管理者 3-组织者
                    }
                ],
                remain: {
                    1: 0,  //      1-参与者剩余人数    -1无上限
                    2: 0,  //      2-管理者剩余人数
                    3: 0,  //       3-组织者剩余人数
                }
            }
        },
        computed : {
            peopleCount(){
                let list = this.$data.list || [],
                    organizer = 0,
                    controller = 0,
                    participant = 0;
                list.forEach(obj => {
                    switch (obj.role){
                        case '1':
                            organizer ++;
                            break;
                        case '2':
                            controller ++;
                            break;
                        case '3':
                            participant ++;
                            break;
                    }
                });
                return [organizer, controller, participant];
            },
            totals(){
                return this.$data.list.length;
            },
            remains(){
                let remain = this.$data.remain || {};
                return (remain["1"] || 0) + (remain["2"] || 0) + (remain["3"] || 0);
            },

        },
        methods : {
            progress(signNum, overNum){
                return  100 * signNum / ( signNum + overNum );
            }
        }
    }
</script>

<style lang="scss">
    .signup{
        background: white;
        .signup-title{
            left: 0;
            top: 0;
            background: inherit;
            background-color: rgba(255, 255, 255, 1);
            box-sizing: border-box;
            border-radius: 0;
            -moz-box-shadow: none;
            -webkit-box-shadow: none;
            box-shadow: none;
            font-size: .44rem;
            .time{
                height: 1.48rem;
                padding: .27rem;
                margin-bottom: .4rem;
                >div{
                    display: inline-block;
                    float: left;
                    >div{
                        &:first-child{
                            margin-bottom: .22rem;
                        }
                        .grey{
                            margin-right: .27rem;
                        }
                    }
                }
            }
            .count{
                display: inline-block;
                >div{
                    /*margin: .27rem auto 20px auto;*/
                    padding: .135rem .62rem;
                }

            }
        }
        .signup-content{
            .page-part{
                width: 90%;
                margin-left: 5%;
                margin-top: .27rem;
                .mint-tab-item{
                    padding: .27rem 0;
                    border: 1px solid #26a2ff;
                    border-right: none;
                    color: #26a2ff;
                    div{
                        font-size: .44rem;
                    }
                    &:first-child{
                        border-top-left-radius: .13rem;
                        border-bottom-left-radius: .13rem;
                    }
                    &:last-child{
                        border-top-right-radius: .13rem;
                        border-bottom-right-radius: .13rem;
                        border-right: 1px solid #26a2ff;
                    }
                    &.is-selected{
                        border-bottom: none;
                        background: #26a2ff;
                        color: white;
                        margin-bottom: 0;
                    }

                }
            }
            .personal-count{
                display: flex;
                >div{
                    padding: .27rem;
                    margin: auto;
                    display: inline-block;
                    font-size: .44rem;
                }
            }
            .img-list{
                margin-bottom: .3rem;
                width: 1.84rem;
                float: left;
                >div{
                    width: 1.33rem;
                    height: 1.33rem;
                    overflow: hidden;
                    margin: 0 auto .135rem;
                    border-radius: 50%;
                    img{
                        height: 100%;
                        width: auto;
                    }
                }
                >span{
                    display: block;
                    text-align: center;
                }
            }
            .title{
                padding: .27rem;
                font-size: .44rem;
                margin: 0 .27rem;
                border-bottom: 1px solid #ddd;
            }
            .sign-progress{
                width: 90%;
                margin-left: 5%;
            }
        }

        .name {
            border-width: 0;
            padding: .27rem;
            white-space: nowrap;
        }
        .content {
            padding-left: .27rem;
            color: #BCBCBC;
        }
        .line {
            height: .19rem;
            background: #f3f3f3;
        }
        .red{
            color: red;
        }
        .grey{
            color: #A0B1B8;
        }
        .padding-10{
            padding: .27rem;
        }
    }
    .teacher{
        .signup{
            .padding-10{
                overflow-y: auto;
                height: calc(100vh - 10rem);
            }
        }
    }

</style>
