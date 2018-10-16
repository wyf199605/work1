<template>
<div class="item">
    <div class="head">
        申请编号：{{no}}
    </div>
    <router-link :to="link" class="body">
        <p>类型：{{type}}</p>
        <p>名称：{{name}}</p>
        <p>等级：{{level}}</p>
        <p>时间：{{time}}</p>
        <p v-if="point">积分：{{point}}</p>
        <div class="status"><span :class="statuesIconGet(status)"></span></div>
    </router-link >
    <div v-if="status === 3" class="tail">
        <div class="show-reason" @click="showText(reason)">查看理由</div>
        <button @click="del"><span class="sec seclesson-shanchu"></span> 删除</button>
        <button @click="$router.push({path: '/auth-edit/' + no})"><span class="sec seclesson-bianji"></span> 编辑</button>
    </div>
</div>
</template>

<script>
    import { MessageBox } from 'mint-ui';
    import request from "../../../utils/request";
    import {CONF} from "../../../utils/URLConfig";

    export default {
        name: "AuthListItem",
        props: {
            no: String,
            type: String,
            name: String,
            level: String,
            time: String,
            point: String,
            reason: String,
            status: Number,
            link: String
        },
        components:{
        },
        methods:{
            statuesIconGet: function (status) {
                let icons = {
                    0: 'blue seclesson-daishenhe', // 待审核
                    2: 'red seclesson-yirenzheng', // 已认证
                    3: 'gray seclesson-weitongguo' // 未通过
                };
                return `sec ${icons[status] || icons[0]}`;
            },
            showText(text){
                MessageBox.alert(text, '理由')
            },
            del() {
                MessageBox.confirm("确认要删除吗")
                    .then(() => {
                        return request.get(CONF.ajaxUrl.authDelete, {apply_id: this.no})
                            .then((res) => {
                                if(res.code === 0){
                                    this.$emit('deleted');
                                }
                                MessageBox.alert(res.msg);
                            })
                    })
            }
        },
        data:function () {
            return {
            }
        }
    }
</script>

<style scoped lang="scss">
    .item {
        background: #fff;
        margin: 5px 0;
        position: relative;
        .head, .tail {
            font-size: 0.4rem;
            padding: 12px 0;
            margin: 0 12px;
        }
        .head {
            border-bottom: 1px #f1f1f1 solid;
        }
        .tail {
            border-top: 1px #f1f1f1 solid;
            .show-reason{
                float: left;
                color: #00a6ed;
            }
            button {
                background: #fff;
                border: none;

                float: right;
            }
            &:after{
                content: ' ';
                display: block;
                clear: both;
            }
        }
        .body {
            padding: 5px 12px;
            position: relative;
            p {
                margin: 7px 0;
            }
            .status {
                position: absolute;
                top: 10px;
                right: 20px;

            }
            .sec {
                font-size: 60px;
                &.red {
                    color: rgb(244, 150, 105);
                }
                &.blue {
                    color: #66B3F1;
                }
                &.gray {
                    color: #d9e4ea;
                }
            }
        }
    }
</style>
