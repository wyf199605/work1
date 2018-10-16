<template>
    <div class="sign-type">
        <sign-select v-on:signTypeTitleChange="signTypeTitleChangeHandler"/>
        <div class="sign-in" v-if="index === 0">
            <sign-item v-for="(item,index) in signContent" :key="index" :signPara="item" :index="index+1"/>
            <div class="btn-wrapper">
                <div class="btn" @click="addNewSignIn">新增</div>
            </div>
        </div>
        <div class="sign-back" v-else>
            <sign-item :signPara="signBackContent" :isSignIn="isSignIn"/>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="cancel">返回</div>
        </div>
    </div>
</template>

<script>
    import SignTypeSelect from './reportActivity/SignTypeSelect'
    import SignItem from './reportActivity/SignItemDetail'
    import {mapGetters} from 'vuex'
    export default {
        data(){
          return{
              index:0,
              signBackContent:{},
              isSignIn:false
          }
        },
        created(){
            let para = {
                signBack:this.signBack,
                signStartTime: this.signBackStartTime, //签到开始时间
                signEndTime: this.signBackEndTime, //签到结束时间
                signType: this.signBackType, // 签到方式
                signPosition: this.signPosition, //签到位置
                longitude: this.longitude, //经度
                latitude: this.latitude,//纬度
                distance: this.distance,// 签到限制距离
                duration: this.duration, // 二维码有效时间
                signCaption: this.signCaption// 签到位置名称
            }
            this.signBackContent = para
        },
        computed:{
            ...mapGetters(['signContent','signBack','signBackStartTime','signBackEndTime','longitude','latitude','signBackType','distance','signPosition','duration','signCaption','signBack'])
        },
        methods:{
            signTypeTitleChangeHandler(index){
                this.index = index
            },
            addNewSignIn(){
                this.$router.push({
                    path:'/addSign',
                    query:{
                        isSignIn:true,
                        index:-1
                    }
                })
            },
            cancel(){
                this.$router.go(-1)
            }
        },
        components:{
            SignItem,
            "sign-select":SignTypeSelect,
        }
    }
</script>

<style scoped lang="scss">
    .sign-type{
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100%;
        z-index: 2;
        overflow: auto;
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
        }
    }
</style>
