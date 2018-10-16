<template>
    <mt-tabbar v-model="message" fixed>
        <mt-tab-item v-for="item in tabData" :key="item.id" :id="item.id">
            <i slot="icon" :class="item.icon"></i>
            {{item.text}}
        </mt-tab-item>
    </mt-tabbar>
</template>
<script>
    import {Indicator} from 'mint-ui';
    import {getRole} from '../../utils/setUserInfo'

    export default {
        data() {
            return {
                message: this.selected,
                tabData: []
            }
        },
        props: {
            selected: String
        },
        created() {
            let role = getRole();
            if (role === 'teacher') {
                this.tabData = [
                    {
                        id: 'activity',
                        icon: 'sec seclesson-huodongguanli',
                        text: '活动管理'
                    },
                    {
                        id: 'approve',
                        icon: 'sec seclesson-shenpizhongxin',
                        text: '审批中心'
                    },
                    {
                        id: 'mine',
                        icon: 'sec seclesson-zhanghuxianxing',
                        text: '我的'
                    }
                ]
            } else {
                this.tabData = [
                    {
                        id: 'home',
                        icon: 'sec seclesson-home',
                        text: '首页'
                    },
                    {
                        id: 'classify',
                        icon: 'sec seclesson-fenlei',
                        text: '分类'
                    },
                    {
                        id: 'stu-mine',
                        icon: 'sec seclesson-zhanghuxianxing',
                        text: '我的'
                    }
                ]
            }
        },
        methods: {},
        watch: {
            message: function (val, oldVal) {
                Indicator.close();
                this.message = val
                this.$router.push({
                    path: '/' + val
                })
            }
        }
    }
</script>
<style scoped lang="scss">
    .mint-tab-item {
        color: #91a8b0;
    }

    i {
        font-size: 24px;
    }
</style>
