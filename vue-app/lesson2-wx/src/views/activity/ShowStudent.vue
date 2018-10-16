<template>
    <div class="show-students">
        <div class="student-item" v-for="student in students" :key="student[0]">
            <div class="top">
                <div class="top-item"><span class="title">姓名&nbsp;:</span>&nbsp;&nbsp;<span class="content">{{student[1]}}</span>
                </div>
                <div class="top-item"><span class="title">学号&nbsp;:</span>&nbsp;&nbsp;<span class="content">{{student[0]}}</span>
                </div>
            </div>
            <div class="bottom">
                <span class="title">学校&nbsp;:</span>&nbsp;&nbsp;<span class="content">{{student[2]}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                students: []
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.students = to.query.students
            })
        }
    }
</script>

<style lang="scss" scoped>
    .show-students {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
        z-index: 2;
        overflow: auto;
        .student-item {
            width: 100%;
            height: 2.2667rem;
            background-color: #ffffff;
            margin-bottom: 0.1333rem;
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 0.5333rem 0.4267rem;
            justify-content: space-between;
            .top {
                width: 100%;
                display: flex;
                align-items: center;
                .top-item {
                    width: 50%;
                }
            }
            .bottom {
                width: 100%;
            }
            .title {
                font-size: 0.4rem;
                color: #91a8b0;
            }
            .content {
                font-size: 0.4rem;
                color: #33484f;
            }
        }
    }
</style>
