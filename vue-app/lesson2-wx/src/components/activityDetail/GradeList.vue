<template>
    <div class="grade-list">
        <grade v-for="grade in gradeList" :key="grade[0]" :gradeData="grade" :activityid="activityid"/>
    </div>
</template>

<script>
    import Grade from './Grade'
    import report from '../../api/report'

    export default {
        components: {
            Grade
        },
        props: ['activityid'],
        data() {
            return {
                gradeList: []
            }
        },
        created() {
            report.getGradeList({
                activityid : this.activityid
            }).then((result) => {
                this.gradeList = result.data.dataList
            }).catch((err) => {

            });
        }
    }
</script>

<style lang="scss">
    .grade-list {
        background-color: #f8f8f8;
        .grade {
            margin-bottom: 0.1333rem;
        }
    }
</style>
