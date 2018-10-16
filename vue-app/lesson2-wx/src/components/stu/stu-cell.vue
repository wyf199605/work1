<template xmlns="http://www.w3.org/1999/html">
    <div class="cell-wrapper">
        <div class="left-content">
            <slot name="cell-title"></slot>
            <slot name="cell-content"></slot>
        </div>
        <div class="right-content">
            <router-link :to=" (confirm === 1) ? '/stu-person':'/stu-status'">
                <p>
                    {{confirm === 1 ? "学籍信息" : "学籍认证"}}<i class="sec seclesson-youjiantou"></i>
                </p>
                <p></p>
            </router-link>
        </div>
    </div>

</template>

<script>
    export default {
        name: "stu-cell",
        props: {
            confirm: {
                default: 0
            }
        },
        created(){
            // console.log(this.confirm);
        }
    }
</script>

<style lang="scss" scoped>
    .cell-wrapper {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
        position: relative;
        padding-bottom: 0.78rem;
        border-bottom: .2rem solid rgb(248, 248, 248);
        .left-content {
        }
        .right-content {
            margin-right: 0.5rem;
            font-size: 0.36rem;
            margin-top: 0.5rem;
            a {
                text-decoration: none;
                color: rgb(148, 148, 148);
            }
        }
    }
</style>
