<template>
    <div class="select-address">
        <search-bar :link="link" v-on:searchResult="searchResults" placeholderStr="搜索"/>
        <div class="address-list">
            <div class="address-item" v-for="(address,index) in addressList" :key="index" @click="selectAddress(index)">
                {{index === 0 ? address : address[2]}}
                <i class="sec seclesson-gou1" v-if="selectIndex === index"></i>
            </div>
        </div>
        <div class="defaultRadius">签退位置距中心半径默认为150</div>
        <div class="buttons">
            <div class="btn-wrapper">
                <div class="btn" @click="save()">确认</div>
            </div>
            <div class="btn-wrapper">
                <div class="btn cancel" @click="cancel()">取消</div>
            </div>
        </div>
    </div>
</template>

<script>
    import SearchBar from './reportActivity/Search'
    import {CONF} from '../../utils/URLConfig'
    import tools from '../../utils/tool'
    import {MessageBox,Indicator} from 'mint-ui'
    import axios from 'axios'

    export default {
        data() {
            return {
                link: CONF.ajaxUrl.signLocation,
                addressList: ['不限'],
                selectIndex: -1,
                selectItem: []
            }
        },
        components: {
            SearchBar
        },
        created(){
            Indicator.open()
            axios.get(CONF.ajaxUrl.signLocation, {
                params:{
                    search_str: ''
                }
            }).then((res) => {
                Indicator.close()
                let arr = ['不限'].concat(res.data.data.body.dataList)
                this.addressList = arr
            }).catch(()=>{
                Indicator.close()
            })
        },
        methods: {
            save() {
                if (tools.isEmpty(this.selectItem)) {
                    MessageBox('提示', '请选择一个地址!')
                    return
                }
                if (this.selectItem === '不限') {
                    this.$store.commit('SET_TEMP_SIGNPOSITION', ['不限', 0, 0, 0])
                } else {
                    this.$store.commit('SET_TEMP_SIGNPOSITION', [this.selectItem[2], this.selectItem[4], this.selectItem[5], this.selectItem[3]])
                }
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            },
            searchResults(results) {
                let arr = ['不限'].concat(results.body.dataList)
                this.addressList = arr
                this.selectIndex = -1
            },
            selectAddress(index) {
                if (this.selectIndex === index) {
                    this.selectIndex = -1
                    this.selectItem = []
                } else {
                    this.selectIndex = index
                    this.selectItem = this.addressList[index]
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .select-address {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
        z-index: 2;
        overflow: auto;
        .address-list {
            padding-left: 0.4267rem;
            padding-right: 0.4267rem;
            background-color: #ffffff;
            .address-item {
                width: 100%;
                height: 1.3333rem;
                border-bottom: 0.0133rem solid #e9e9e9;
                font-size: 0.4267rem;
                color: #33484f;
                display: flex;
                align-items: center;
                justify-content: space-between;
                i {
                    color: #0099ff;
                }
            }
        }
        .defaultRadius {
            width: 100%;
            font-size: 0.3733rem;
            color: #91a8b0;
            margin-top: 0.56rem;
            text-align: center;
        }
        .btn-wrapper {
            padding: 0 0.4267rem;
            margin-top: 0.5333rem;
            margin-bottom: 0.6667rem;
            .btn {
                height: 1.3333rem;
                background-color: #0099ff;
                border-radius: 0.2rem;
                font-size: 0.48rem;
                color: #ffffff;
                text-align: center;
                line-height: 1.3333rem;
            }
            .btn:active {
                background-color: #0089e5;
            }
            .cancel {
                background-color: #ffffff;
                border: solid 0.0133rem #0099ff;
                color: #0099ff;
            }
            .cancel:active {
                border: solid 0.0133rem #0089e5;
                color: #0089e5;
                background-color: #ffffff;
            }
        }
    }
</style>
