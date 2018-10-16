<template>
    <div :class="['le-progress', className]">
        <mt-progress :value="progress" :bar-height="10"></mt-progress>
    </div>
</template>

<script>
    export default {
        name: "le-progress",
        props: {
            value: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 100,
            },
            className: {
                type: String,
            }
        },
        data() {
            return {
                maxValue: 100,
                progress: 0,
            }
        },
        watch: {
            max(maxValue){
                this.maxValue = maxValue <= 0 ? 100 : maxValue;
            },
            value(progress){
                this.progress = progress / this.maxValue * 100;
            }
        }
    }
</script>

<style lang="scss">
    .le-progress {
        .mt-progress {
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
        }
    }
</style>
