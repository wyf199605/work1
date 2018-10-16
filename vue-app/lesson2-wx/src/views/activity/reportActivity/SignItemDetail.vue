<template>
    <div class="sign-item-detail">
        <div v-if="isShowNoSign">
            <div class="index-title item borderBottom">不签退</div>
            <div class="btns">
                <span @click="editSignItem(isSignIn,2)"><i class="sec seclesson-bianji"></i>编辑</span>
            </div>
        </div>
        <div v-else>
            <div class="index-title item borderBottom" v-if="isSignIn">{{indexTitle}}</div>
            <div class="sign-content borderBottom">
                <div class="item borderBottom">
                    <span class="title">{{isSignIn ? '签到' : '签退'}}开始时间</span>
                    <span class="time">{{startTime}}</span>
                </div>
                <div class="item borderBottom">
                    <span class="title">{{isSignIn ? '签到' : '签退'}}结束时间</span>
                    <span class="time">{{endTime}}</span>
                </div>
                <div class="item">
                    <span class="title">{{isSignIn ? '签到' : '签退'}}方式</span>
                    <span class="time">{{signPara.signType === 0 ? '人脸识别' : '签到二维码'}}</span>
                </div>
            </div>
            <div class="btns">
                <span v-if="isSignIn" @click="editSignItem(isSignIn,index-1)"><i
                    class="sec seclesson-bianji"></i>编辑</span>
                <span v-else @click="editSignItem(isSignIn,2)"><i class="sec seclesson-bianji"></i>编辑</span>
            </div>
        </div>

    </div>
</template>
<script>
    import tools from '../../../utils/tool'

    export default {
        data() {
            return {
                indexTitle: '',
                startTime: tools.formatTime(this.signPara.signStartTime),
                endTime: tools.formatTime(this.signPara.signEndTime),
                signBack: -1,
                isShowNoSign: false
            }
        },
        props: {
            signPara: {
                type: Object,
                default: function () {
                    return {
                        signBack: -1,
                        signStartTime: 0, //签到开始时间
                        signEndTime: 0, //签到结束时间
                        signType: 0, // 签到方式
                        signPosition: 0, //签到位置
                        longitude: '', //经度
                        latitude: '',//纬度
                        distance: 0,// 签到限制距离
                        duration: 0, // 二维码有效时间
                        signCaption: ''// 签到位置名称
                    }
                }
            },
            index: {
                type: Number,
                default: 1
            },
            isSignIn: {
                type: Boolean,
                default: true
            }
        },
        created() {
            if (this.isSignIn === false) {
                this.signBack = this.signPara.signBack
                if (this.signBack === 0){
                    this.isShowNoSign = true
                }
            }
            if(this.isSignIn){
                if (this.index === 1) {
                    this.indexTitle = '首次签到'
                } else {
                    this.indexTitle = tools.getChineseNum(this.index) + '次签到'
                }
            }
        },
        methods: {
            editSignItem(isSignIn, index) {
                this.$router.push({
                    path: '/addSign',
                    query: {
                        isSignIn: isSignIn,
                        index: index
                    }
                })
            }
        }
    }
</script>
<style scoped lang="scss">
    .sign-item-detail {
        background-color: #ffffff;
        width: 100%;
        margin-top: 0.1333rem;
        .index-title {
            font-size: 0.4rem;
            color: #33484f;
            padding-left: 0.4267rem;
        }
        .sign-content {
            padding-left: 0.4267rem;
        }
        .item {
            height: 1.3333rem;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 0.4267rem;
        }
        .title {
            font-size: 0.4rem;
            color: #91a8b0;
        }
        .time {
            font-size: 0.4rem;
            color: #33484f;
        }
        .borderBottom {
            border-bottom: 0.0133rem solid #e9e9e9;
        }
        .btns {
            height: 1.0667rem;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            font-size: 0.3733rem;
            color: #33484f;
            padding-right: 0.4267rem;
            i {
                margin-right: 0.1067rem;
            }
        }
    }
</style>
