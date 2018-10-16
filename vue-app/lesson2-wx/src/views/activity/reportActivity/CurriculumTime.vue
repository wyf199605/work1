<template>
    <div>
        <div class="curriculum-time">
            <div class="curriculum-time-wrapper">
                <div class="curriculum-time-left">
                    <div class="title">开课时间</div>
                </div>
                <div class="curriculum-time-right">
                    <div class="start-time">
                        <span class="time">(开始) {{activityTime.startTime}}</span> <i
                        class="sec seclesson-youjiantou"></i>
                    </div>
                    <div class="end-time">
                        <span class="time">(结束) {{activityTime.endTime}}</span> <i class="sec seclesson-youjiantou"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activityTime: {
                    startTime: '请选择',
                    endTime: '请选择'
                }
            }
        },
        methods: {}
    }
</script>

<style lang="scss" scoped>
    .curriculum-time {
        background-color: #ffffff;
        padding-left: 0.4267rem;
        width: 100%;
        height: 2.8rem;
        .curriculum-time-wrapper {
            padding-right: 0.4267rem;
            display: flex;
            height: 100%;
            width: 100%;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e9e9e9;
            .curriculum-time-left,
            .curriculum-time-right {
                display: flex;
                align-items: center;
                height: 100%;
            }
            .curriculum-time-right {
                padding: 0.4rem 0;
                flex-direction: column;
                justify-content: space-between;
                .start-time,
                .end-time {
                    display: flex;
                    align-items: center;
                }
                .time {
                    color: #34474e;
                    font-size: 0.4rem;
                }
                i {
                    position: relative;
                    font-size: 0.4rem;
                    width: 0.4rem;
                    height: 0.56rem;
                    color: #91a8b0;
                    margin-top: 0.0267rem;
                }
                i::before {
                    position: absolute;
                    top: 0;
                    left: 0;
                    line-height: 0.56rem;
                }
            }
            .title {
                font-size: 0.4rem;
                color: #33484f;
            }
            .addClassHour {
                width: 2.1333rem;
                height: 0.8rem;
                background-color: #ffffff;
                border-radius: 0.0667rem;
                border: solid 0.0133rem #0099ff;
                font-size: 0.4rem;
                line-height: 0.7733rem;
                color: #0099ff;
                text-align: center;
            }
        }
    }
</style>
