<template>
    <div class="search-bar">
        <div class="search-wrapper">
            <div :class="'input-placeholder ' + (isShowText === false ? 'left-text' : '')"><i
                class="sec seclesson-sousuo1"></i><span v-if="isShowText">{{placeholderStr}}</span></div>
            <input type="text" v-model="searchStr" @focus="getFocus">
        </div>
        <div class="search-btn" v-if="!isShowText" @click="searchStudent">
            搜索
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import { Indicator } from 'mint-ui'
    export default {
        data() {
            return {
                isShowText: true,
                searchStr: ''
            }
        },
        props: {
            link: {
                type: String,
                default: ''
            },
            placeholderStr:{
                type:String,
                default:'搜索姓名和学号'
            }
        },
        methods: {
            getFocus() {
                this.isShowText = false
            },
            searchStudent() {
                Indicator.open('搜索中...')
                axios.get(this.link, {
                    params:{
                        search_str: this.searchStr
                    }
                }).then((res) => {
                    Indicator.close()
                    this.$emit('searchResult',res.data.data)
                }).catch(()=>{
                    Indicator.close()
                })
            }
        }
    }
</script>
<style lang="scss" scoped>
    .search-bar {
        width: 100%;
        height: 1.3333rem;
        background-color: #ffffff;
        padding: 0.2133rem 0.4267rem;
        background-color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .search-wrapper{
            width: 100%;
            height: 100%;
            position: relative;
        }
        input {
            background-color: transparent;
            border: none;
            -webkit-appearance: none;
            outline: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding-left: 0.5867rem;
        }
        .input-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #eff5f7;
            text-align: center;
            line-height: 0.9067rem;
            padding-left: 0.1333rem;
            i {
                font-size: 0.4rem;
                color: #33484f;
                margin-right: 0.2133rem;
            }
            span {
                font-size: 0.4rem;
                color: #91a8b0;
            }
        }
        .input-placeholder.left-text {
            text-align: left;
        }
        .search-btn{
            color: #0099ff;
            width: 1.0667rem;
            flex-shrink: 0;
            text-align: right;
            font-size: 0.4rem;
        }
    }
</style>
