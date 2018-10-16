<template>
    <mt-tabbar v-model="message" fixed>
        <mt-tab-item id="activity">
            <i slot="icon" class="sec seclesson-huodongguanli"></i>
            活动管理
        </mt-tab-item>
        <mt-tab-item id="approve">
            <i slot="icon" class="sec seclesson-shenpizhongxin"></i>
            审批中心
        </mt-tab-item>
        <mt-tab-item id="mine">
            <i slot="icon" class="sec seclesson-zhanghuxianxing"></i>
            我的
        </mt-tab-item>
    </mt-tabbar>
</template>
<script>
    export default {
        data() {
            return {
                message: this.selected
            }
        },
        props: {
            selected: String
        },
        watch: {
            message: function (val, oldVal) {
                switch (val) {
                    case 'activity':
                        this.$router.push('/stu-mine')
                        break
                    case 'approve':
                        this.$router.push('/stu-mine')
                        break
                    case 'mine':
                        this.$router.push('/stu-mine')
                        break
                }
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
