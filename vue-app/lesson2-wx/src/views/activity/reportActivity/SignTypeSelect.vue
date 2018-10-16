<template>
    <div class="sign-select-type">
        <div :class="'sign-select-item '+ (index === 0 ? 'active' : '')" @click="clickHandler(0)">
            <span>签到</span>
            <div class="line"></div>
        </div>
        <div :class="'sign-select-item '+ (index === 1 ? 'active' : '')" @click="clickHandler(1)">
            <span>签退</span>
            <div class="line"></div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                index: 0
            }
        },
        methods:{
            clickHandler(index){
                this.index = index
                this.$emit('signTypeTitleChange',index)
            }
        }
    }
</script>

<style lang="scss" scoped>
    .sign-select-type {
        display: flex;
        align-items: center;
        height: 1.3333rem;
        width: 100%;
        font-size: 0.4267rem;
        color: #33484f;
        background-color: #ffffff;
        text-align: center;
        .sign-select-item {
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
