<template>
    <div class="activity-sign-in-page">
        <nav class="navbar">
            <check-box-group @change="changeHandle" type="radio" styleType="button" :boxesData="titles"></check-box-group>
            <div class="sign-in-time-list">
                <table cellpadding="0">
                    <tr>
                        <td>签到时间：</td>
                        <td>（开始）</td>
                        <td class="time">{{startTime}}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>（结束）</td>
                        <td class="time">{{endTime}}</td>
                    </tr>
                </table>
            </div>
        </nav>
        <div class="body">
            <article>
                <div class="sign-status">
                    <div class="sign-in-count">已报名人数：<span class="count">{{total - remain}}人</span></div>
                    <div class="sign-up-count">还剩<span class="count">{{remain}}人</span></div>
                </div>
                <le-progress className="sign-progress" :value="progress"></le-progress>
                <!--<div class="sign-progress">-->
                    <!--<mt-progress :value="progress" :bar-height="10"></mt-progress>-->
                <!--</div>-->
            </article>
            <section>
                <ul class="sign-in-list">
                    <li class="sign-in-item" v-for="student in limitStudents">
                        <div class="pic">
                            <img :src="student.IMG" alt="">
                        </div>
                        <span>{{student.NAME}}</span>
                    </li>
                </ul>
                <div class="btn-wrapper">
                    <button type="button" @click="loadMore">{{msg}}</button>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
    import checkBoxGroup from '../checkBoxGroup/CheckBoxGroup';
    import leProgress from '../progress/Progress';
    import checkBox from '../checkBox/CheckBox';
    import request from '../../utils/request';
    import {CONF} from '../../utils/URLConfig';
    import tools from '../../utils/tool';
    import {Toast, Indicator} from 'mint-ui';
    export default {
        name: "sign-in",
        components: {
            'check-box-group': checkBoxGroup,
            'check-box': checkBox,
            leProgress
        },
        props: {
            activityid: {
                type: String,
            },
            activityData:{

            },
            signContentData:{

            }
        },
        watch:{
            activityData:function (newVal) {
                this.activity = newVal;
            },
            signContentData:function (newVal) {
                this.activity = newVal;
            },
            activityid(e){
                this.activityId = e;
            }
        },
        computed: {
            tabData(){
                return this.allData[this.selected] || {};
            },
            tabListData(){
                return this.tabData.data || [];
            },
            limitStudents(){
                let limit = Math.min(this.limit, this.total);
                return this.tabListData.slice(0, limit);
            },
            startTime(){
                return this.tabData.startTime || '';
            },
            endTime(){
                return this.tabData.endTime || '';
            },
            remain(){
                return this.tabData.remain || 0;
            },
            total(){
                return this.tabListData.length;
            },
            limit: {
                get(){
                    return this.tabData.limit || 0;
                },
                set(limit){
                    this.tabData.limit = limit;
                }
            },
            progress(){
                return this.total === 0 ? 0 :(100 - this.remain / this.total * 100);
            },
            msg(){
                return this.limit >= this.total ? '已无更多' : '查看更多';
            },
        },
        created(){
            Indicator.open();
            request.get(CONF.url.activitySignIn, {
                activityid: this.activityId,
            }).then((res) => {
                let data = res.data;
                if(data){
                    data.forEach((item) => {
                        this.allData.push({
                            remain: item.remain,
                            endTime: item.endtime,
                            startTime: item.starttime,
                            data: item.list || null,
                            limit: 10,
                        });
                        this.titles.push({
                            value: item.link,
                            text: item.title,
                        })
                    });
                }
            }).catch(() => {
                Toast('获取数据失败，请重试！');
            }).finally(() => {
                Indicator.close();
            })
        },
        methods: {
            loadMore(){
                this.limit = this.total;
            },
            changeHandle(e){
                if(e.checked){
                    let index = e.index,
                        link = e.value,
                        tabData = this.allData[index];
                    // this.limit = 10;
                    this.selected = index;

                    if(tools.isEmpty(tabData.data)){
                        let ajaxData = Object.assign({}, {
                            activityid: this.activityId
                        }, link || {});

                        request.get(CONF.ajaxUrl.activitySignInData, ajaxData).then((res) =>{
                            let data = res.data;
                            if(data){
                                this.allData[index].data = data.list;
                                this.selected = index;
                            }
                        }).catch(() => {
                            Toast('获取数据失败，请重试！');
                        })
                    }
                }
            },
        },
        data(){
            return {
                allData: [],
                titles: [],
                selected: 0,
                activityId: this.activityid,
                activity : this.activityData,
                signContent : this.signContentData,
            }
        }
    }
</script>

<style lang="scss">
    .activity-sign-in-page{
        .navbar{
            padding: .4rem 0;
            .select-box-wrapper{
                width: 10rem;
                box-sizing: border-box;
                padding: 0 0.4rem;
                margin: 0 auto;
                overflow-x: auto;
                display: flex;
                .select-box{
                    min-width: 25%;
                    line-height: .9rem;

                    .check-text{
                        width: 100%;
                        text-align: center;
                        font-size: 14px;
                        padding: 0;
                    }
                }
            }
            .sign-in-time-list{
                padding: .4rem 0.4rem;
                font-size: 14px;
                border-bottom: 1px solid #ccc;
                table{
                    td:not(.time){
                        color: #91a8b0;
                    }
                }
            }
        }

        .body{
            padding: 0 0.4rem;
            article{
                padding-bottom: .2rem;
                .sign-status{
                    font-size: 13px;
                    padding: 0 1rem .3rem 0;
                    color: #91a8b0;
                    &::after{
                        content: "";
                        clear: both;
                        display: block;
                    }

                    .count{
                        color: #f5956b;
                    }

                    .sign-in-count{
                        float: left;
                    }

                    .sign-up-count{
                        float: right;
                    }
                }

                .sign-progress{
                    padding: 10px 0;
                }
            }

            section{
                .sign-in-list{
                    padding: 0 0 10px;
                    margin: 0;
                    border-bottom: 1px solid #ccc;
                    &::after{
                        content: "";
                        display: block;
                        clear: both;
                    }
                    .sign-in-item{
                        float: left;
                        width: 1.84rem;
                        list-style-type: none;
                        margin-bottom: .3rem;
                        .pic{
                            width: 1.33rem;
                            height: 1.33rem;
                            overflow: hidden;
                            margin: 0 auto 5px;
                            border-radius: 50%;
                            img{
                                height: 100%;
                                width: auto
                            }
                        }
                        span{
                            display: block;
                            text-align: center;
                        }
                    }
                }
            }

            .btn-wrapper{
                button{
                    display: block;
                    border: none;
                    background: transparent;
                    width: 100%;
                    padding: .4rem 0;
                    text-align: center;
                    color: #91a8b0;
                }
            }

        }
    }
</style>
