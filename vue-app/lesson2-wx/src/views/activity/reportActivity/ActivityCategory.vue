<template>
    <div class="activity-category">
        <div :class="'category-item '+ (index === 0 ? 'active' : '')" @click="clickHandler(0)">
            <span>活动类</span>
            <div class="line"></div>
        </div>
        <div :class="'category-item '+ (index === 1 ? 'active' : '')" @click="clickHandler(1)">
            <span>课程类</span>
            <div class="line"></div>
        </div>
    </div>
</template>

<script>
    import Bus from '../../../bus'
    import {mapGetters} from 'vuex'
    export default {
        data() {
            return {
                index: 0
            }
        },
        computed:{
            ...mapGetters([
                'isShowCourse'
            ])
        },
        created() {
            let showCourse = this.isShowCourse
            if (showCourse === true) {
                this.clickHandler(1)
            }
        },
        methods: {
            clickHandler(index) {
                this.index = index
                Bus.$emit('activitycategorychange', index)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .activity-category {
        display: flex;
        align-items: center;
        height: 1.3333rem;
        width: 100%;
        font-size: 0.4267rem;
        color: #33484f;
        background-color: #ffffff;
        text-align: center;
        .category-item {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            &.active {
                color: #0099ff;
                font-weight: bold;
                div.line {
                    background-color: #0099ff;
                }
            }
            div.line {
                width: 0.7467rem;
                height: 0.08rem;
                background-color: #ffffff;
                margin-top: 0.1333rem;
            }
        }
    }
</style>
