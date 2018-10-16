<template>
    <div id="app">
        <transition name="fade">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'App'
    }
</script>

<style lang="scss">
    * {
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
    }

    html,
    body {
        margin: 0;
        // 取消a标签点击时蒙层
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        background-color: #ffffff;
        color: #333;
        height: 100%;
    }

    :focus {
        outline: none;
    }

    a {
        background: #fff;
        text-decoration: none;
        display: block;
        color: #333;
    }

    #app {
        font-family: PingFang-SC-Medium;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        height: 100%;
        background-color: rgb(248, 248, 248);
    }

    .page {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100%;
    }

    input {
        font-size: 0.4rem;
        border: none;
        height: calc(100% - 0.0133rem);
        flex-grow: 1;
        &:focus {
            outline: none;
        }
    }

    input::-webkit-input-placeholder {
        color: #b0b0b0;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }
</style>
