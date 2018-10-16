<template>
    <div class="retroactive-page">
        <div class="list-item">
            <div class="label">活动名称：</div>
            <div class="content">{{activityName}}</div>
        </div>
        <div class="list-item">
            <div class="label">签到次数：</div>
            <div class="content"><span style="color: #0099ff;">{{currentCount}}</span>/{{signInTotal}}</div>
        </div>
        <div class="list-item no-border">
            <div class="label">补签原因：</div>
            <div class="content-text">
                <textarea v-model="value"></textarea>
            </div>
        </div>
        <div class="btn-wrapper">
            <mt-button type="primary" size="large" @click="submit">提交</mt-button>
        </div>
    </div>
</template>

<script>
    import request from '../../utils/request';
    import {CONF} from '../../utils/URLConfig';
    import { Toast, MessageBox, Indicator } from 'mint-ui';
    export default {
        name: "retroactive",
        data(){
            return {
                activityName: '非常多内容非常多内容非常多内容非常多内容非常多',
                currentCount: 0,
                signInTotal: 0,
                activityId: null,
                value: '',
            }
        },
        created(){
            // console.log(this.$route.query);
            this.initData(this.$route.query)
        },
        methods: {
            initData(data){
                if(data){
                    this.activityName = data.activityName;
                    this.currentCount = data.currentCount;
                    this.signInTotal = data.signInTotal;
                    this.activityId = data.activityId;
                }
            },
            submit(){
                if(this.value === ''){
                    Toast('请填写补签原因！');
                }else{
                    Indicator.open();
                    request.post(CONF.url.signIn + '?activityid=' +
                        this.activityId +'&supplement=1', [
                        {
                            "reason": this.value
                        }
                    ]).then((e) => {
                        Indicator.close();
                        if(e.code === 0){
                            Toast(e.msg);
                            window.history.back();
                        }else{
                            MessageBox('提示', e.msg);
                        }
                    }).catch((e) => {
                        Indicator.close();
                        MessageBox('提示', e.msg);
                    })
                }
            }
        }
    }
</script>

<style lang="scss">
    .retroactive-page{
        padding: .4rem;
        font-size: 15px;
        .list-item{
            padding: .3rem 0;
            color: #33484f;
            border-bottom: 1px solid #d8e3e9;

            &.no-border{
                border-bottom: none;
            }

            &::after{
                content: "";
                display: block;
                clear: both;
            }
            .label{
                width: 25%;
                float: left;
            }
            .content{
                width: 75%;
                float: left;
            }
            .content-text{
                width: 100%;
                float: left;
                height: 4.493rem;
                margin-top: .3rem;

                textarea{
                    font-size: 15px;
                    width: 100%;
                    height: 100%;
                    resize: none;
                    border: solid 1px #d8e3e9;
                }
            }
        }
        .btn-wrapper{
            margin-top: .5rem;
        }
    }
</style>
