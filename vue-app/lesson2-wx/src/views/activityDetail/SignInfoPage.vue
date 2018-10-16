<template>
    <div class="sign-info">
        <sign-info-item v-for="(signInfo,index) in signInfoData" :key="index" :signInfoData="signInfo"/>
        <div class="no-data" v-if="!signInfoData[0]">
            暂无签到记录
        </div>
    </div>
</template>

<script>
    import SignInfoItem from '../../components/activityDetail/SignInfoItem'
    import report from '../../api/report'

    export default {
        data() {
            return {
                signInfoData: []
            }
        },
        components: {
            SignInfoItem
        },
        created() {
            let student_no = this.$route.params.stuId,
                activityid = this.$route.query.activityid;

            report
                .getSignInfoData({
                    student_no: student_no,
                    activityid: activityid
                })
                .then(result => {
                    this.signInfoData = result.data.dataList
                })
                .catch(err => {
                })
        }
    }
</script>

<style lang="scss" scoped>
    .sign-info {
        background-color: #f8f8f8;
        position: absolute;
        left: 0;
        top: 0;
        min-height: 100%;
        width: 100%;
        .no-data {
            padding: .5rem;
            font-size: .5rem;
            text-align: center;
        }
    }
</style>
