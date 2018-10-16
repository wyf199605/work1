<template>
    <div class="college-item" @click="select">
        <span class="title">{{item[1]}}</span>
        <i class="sec seclesson-gou1" v-if="selectIndex"></i>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                selectIndex: false
            }
        },
        props: {
            item: {
                type: Array,
                default: function () {
                    return []
                }
            },
            index:{
                type:Number,
                default:0
            }
        },
        methods:{
            select(){
                this.selectIndex = !this.selectIndex
                if (this.selectIndex){
                    this.$emit('selectAll',this.index)
                }else{
                    this.$emit('selectNone',this.index)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .college-item {
        height: 1.3333rem;
        width: 100%;
        border-bottom: 0.0133rem solid #e9e9e9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 0.4267rem;
        font-size: 0.4rem;
        color: #33484f;
        i {
            color: #0099ff;
        }
    }
</style>
