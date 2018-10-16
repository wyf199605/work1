<template>
    <div class="panel-wrapper">
        <div class="panel-title" @click="toggle">
            <a>{{title}}</a>
            <i :class="['icon', 'sec', isOpen ? 'seclesson-xiala' : 'seclesson-youjiantou']"></i>
        </div>
        <transition name="slide">
            <div v-show="isOpen" class="panel-content">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: "panel",
        props: {
            title: {
                type: String,
                required: false,
            },
            isShow: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            toggle(){
                this.isOpen = !this.isOpen;
                this.$emit('onOpen');
            }
        },
        data(){
            return {
                isOpen: this.isShow,
            }
        }
    }
</script>

<style lang="scss">
    .panel-wrapper{
        padding-left: 0.44rem;
        .panel-title{
            padding: 0.4rem 0;
            border-bottom: 1px solid #ccc;
            font-size: 16px;
            font-weight: normal;
            position: relative;

            a{
                background: transparent;
            }

            .icon{
                position: absolute;
                font-size: 20px;
                right: .4rem;
                top: .4rem;
            }
        }
        .panel-content{
            /*border-bottom: 1px solid #ccc;*/
            padding: 0.4rem 0;
            font-size: 14px;
            overflow: hidden;
        }
        .slide-enter-active, .slide-leave-active {
            transition: font-size 0.15s ease-out, padding 0.25s ease-out, opacity 0.25s ease-out;
        }
        .slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
            font-size: 0;
            padding: 0;
            opacity: 0;

        }
    }
</style>
