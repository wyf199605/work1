<template>
    <div :class="['lesson2-navbar', isFixed ? 'fixed' : '']">
        <div ref="btnWrapper" :class="['navbar-list', isFixedHeader ? 'hide' : '']" v-if="!!list">
            <a v-for="(item, index) in list" @click="clickHandler(index)"
               :class="['navbar-item', selected === index ? 'selected' : '']">{{item}}</a>
        </div>
        <div v-if="isSearch" :class="['navbar-search', isFixedHeader ? 'fixed-search-header' : '']">
            <div class="input-wrapper">
                <input ref="input" id="navbar-search" @change="searchHandler" @focus="focusSearch"
                       v-model="value" type="text" class="search">
                <label for="navbar-search" :class="value==='' ? '' : 'left'">
                    <i class="sec seclesson-sousuo1"></i>
                    <span v-show="value===''">搜索</span>
                </label>
            </div>
            <span v-if="isFixedHeader" class="close" @click="cancelFixedHeader">取消</span>
        </div>
        <div :class="['search-mask', isFixedHeader ? 'show' : '']">
            <!--<div v-show="this.history && this.history.length > 0" class="header">-->
                <!--<span>搜索历史</span>-->
                <!--<a @click="clear">清空</a>-->
            <!--</div>-->
            <!--<ul class="history-list" v-show="history && history.length > 0">-->
                <!--<li class="history-item" v-for="item in history" @click="search(item)">{{item}}</li>-->
            <!--</ul>-->
        </div>
    </div>
</template>

<script>
    import tools from '../../utils/tool';
    import {MessageBox, Toast} from 'mint-ui';

    const SEARCH_LIST = 'searchRecords';
    export default {
        props: {
            list: { // navbar 对应的title
                type: Array,
                required: false,
            },
            isSearch: { // 是否出现搜索框
                type: Boolean,
                default: true,
            },
            isFixed: {  // 是否使用fixed
                type: Boolean,
                default: false,
                required: false,
                timer: null,
            },
            defaultSelect: {
                type: Number,
                default: 0
            },
            defaultValue: {
                type: String,
                default: ''
            }
        },
        watch: {
            defaultValue(e) {
                this.value = e;
            }
        },
        data() {
            return {
                selected: this.defaultSelect,
                value: this.defaultValue,
                isFixedHeader: false,
                history: this.getHistory()
            }
        },
        methods: {
            clickHandler(index) {
                this.selected = index;
                this.$emit('onChange', index);
            },
            searchHandler: tools.pattern.debounce(function () {
                this.$refs.input.blur();
                this.search(this.value);
            }, 500),
            search(value){
                this.isFixedHeader = false;
                this.setHistory(value);
                this.$emit('onSearch', value);
            },
            focusSearch() {
                this.isFixedHeader = true;
            },
            cancelFixedHeader() {
                this.isFixedHeader = false;
            },
            clear(){
                MessageBox.confirm('是否清空搜索记录?', '温馨提示').then(() => {
                    this.clearHistory();
                });
            },
            setHistory(value) {
                let result = this.getHistory();
                if (result.indexOf(value) === -1) {
                    result.unshift(value);
                }
                this.history = result.slice(0, 10);
                window.localStorage.setItem(SEARCH_LIST, JSON.stringify(result.slice(0, 10)));
            },
            clearHistory() {
                this.history = null;
                window.localStorage.setItem(SEARCH_LIST, '');
            },
            getHistory() {
                let history = window.localStorage.getItem(SEARCH_LIST);
                if (history) {
                    history = JSON.parse(history);
                } else {
                    history = [];
                }
                return history;
            }
        },
        mounted(){
            let btnWrapper = this.$refs.btnWrapper;
            if(btnWrapper){
                let btns = btnWrapper.querySelectorAll('a');
                btns[this.defaultSelect].scrollIntoView();
            }
        }
    }
</script>

<style lang="scss">
    .lesson2-navbar {
        position: relative;
        width: 100%;
        border-bottom: 1px solid #ccc;

        &::before {
            content: "";
            display: table;
        }

        &.fixed {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
        }

        .navbar-list {
            padding: 0.2rem .5rem 0;
            overflow-y: hidden;
            overflow-x: auto;
            display: flex;
            transition: height .5s, padding .5s;
            a{
                padding: 6px 8px;
            }

            &.hide {
                height: 0 !important;
                padding: 0 !important;
            }

            &::-webkit-scrollbar {
                display: none;
            }
            .navbar-item:not(:last-child) {
                margin-right: 1.066rem;
            }
            .navbar-item {
                display: block;
                position: relative;
                color: #000;
                text-align: center;
                text-decoration: none;
                font-size: 15px;
                flex: 1;

                &.selected {
                    color: #0099ff;
                    &::after {
                        content: "";
                        display: block;
                        width: 0.747rem;
                        height: 0.08rem;
                        background-color: #0099ff;
                        position: absolute;
                        bottom: 0rem;
                        left: 50%;
                        transform: translateX(-50%);
                    }
                }
            }
        }

        .navbar-search {
            position: relative;
            box-sizing: border-box;
            width: 9rem;
            height: .9rem;
            margin: 0.23rem auto;
            background: #fff;
            font-size: 0;
            transition: background-color .5s;

            &.fixed-search-header {
                margin: 0;
                width: 10rem;
                padding: .23rem;
                height: 1.36rem;
                /*position: fixed;*/
                /*top: 0;*/
                /*left: 0;*/
                /*z-index: 1000;*/
                .input-wrapper {
                    width: 80%;
                    input.search + label {
                        left: 0.3rem;
                        span {
                            display: none;
                        }
                    }
                }
                .close {
                }
            }

            .close {
                font-size: 16px;
                display: inline-block;
                width: 20%;
                text-align: center;
                color: #0099ff;
            }
            .input-wrapper {
                font-size: 16px;
                display: inline-block;
                background-color: #eff5f7;
                height: 100%;
                width: 100%;
                padding-left: 1rem;
                position: relative;

                input.search {
                    box-sizing: border-box;
                    height: 100%;
                    width: 100%;
                    padding: 0;
                    border: none;
                    background: transparent;
                    line-height: .9rem;
                    /*transition: text-indent 0.2s;*/
                }
                input.search + label {
                    position: absolute;
                    top: 0;
                    left: 3.8rem;
                    line-height: .9rem;
                    user-select: none;
                    transition: left 0.1s linear;
                }
                input.search + label.left {
                    left: 0.3rem;
                    span {
                        display: none;
                    }
                }
                input.search:focus + label {
                    left: 0.3rem;
                    span {
                        display: none;
                    }
                }
            }
        }
        .search-mask {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            top: 1.36rem;
            background-color: #fff;
            z-index: -1;
            padding: 0 0.23rem;
            opacity: 0;
            transition: opacity .5s, font-size .5s;

            &.show {
                z-index: 1000;
                opacity: 1;
            }

            .header {
                font-size: 15px;
                padding: .23rem 0;
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #ccc;
                color: #91a8b0;

                a {
                    width: 20%;
                    text-align: center;
                    color: #0099ff;
                }
            }
            .history-list {
                list-style-type: none;
                margin: 0;
                margin-right: -20px;
                padding: 15px 0;
                &::after{
                    display: block;
                    clear: both;
                    content: "";
                }
                .history-item {
                    float: left;
                    padding: 6px 15px;
                    background-color: #eff5f7;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 20px;
                    margin-bottom: 20px;
                }
            }
        }
    }
</style>
