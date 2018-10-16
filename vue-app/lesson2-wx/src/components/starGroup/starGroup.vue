<template>
    <div class="star-group">
        <i v-for="i in total" @click="isChange ? starChange(i) : null"
           :class="['sec', selected < i ?'seclesson-star1' : 'seclesson-star-fill1 selected']"></i>
    </div>
</template>

<script>
    export default {
        name: "star-group",
        props: {
            total: {
                type: Number,
                default: 5
            },
            default: {
                type: Number,
                default: 0
            },
            isChange: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                selected: this.default,
            }
        },
        methods: {
            starChange(index){
                this.selected = index;
                this.$emit('onChange', index)
            }
        }
    }
</script>

<style lang="scss">
    .star-group {
        letter-spacing: .1rem;
        display: inline-block;
        line-height: inherit;
        font-size: 20px;
        i {
            font-size: inherit;
            &.selected {
                color: orange;
            }
        }
    }
</style>
