<template>
    <div class="charge-list">
        <div class="charge-list-wrapper">
            <div class="charge-item" v-for="(charge,index) in  chargeData" :key="index">
                <div class="charge-item-content">
                    <div class="content-item"><span class="title">联系人{{index+1}}&nbsp;:</span><span>{{charge.name}}</span>
                    </div>
                    <div class="content-item"><span class="title">联系电话&nbsp;:</span><span>{{charge.phone}}</span></div>
                </div>
                <div class="btns">
                    <div class="icon-btn" @click="editCharge(index)"><i class="sec seclesson-bianji"></i>编辑</div>
                    <div class="icon-btn" @click="removeCharge(index)"><i class="sec seclesson-shanchu"></i>删除</div>
                </div>
            </div>
        </div>
        <div class="btn-wrapper">
            <div class="btn" @click="add">新增</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="backPage">返回</div>
        </div>
    </div>
</template>

<script>
    import EditContacts from './EditContacts'
    import {MessageBox} from 'mint-ui'
    import {mapGetters} from 'vuex'

    export default {
        data() {
            return {
                chargeData:[]
            }
        },
        computed:{
            ...mapGetters([
                'charge'
            ])
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.chargeData = vm.charge
            })
        },
        methods: {
            editCharge(index) {
                this.$router.push({
                    path: '/reportEdit',
                    query: {
                        field: 'charge',
                        index:index
                    }
                })
            },
            removeCharge(index) {
                MessageBox.confirm('确定要删除此联系人吗?').then(action => {
                    let arr = this.chargeData
                    arr.splice(index, 1)
                    this.chargeData = arr
                    this.$store.commit('SET_CHARGE',this.chargeData)
                });
            },
            add() {
                this.$router.push({
                    path: '/reportEdit',
                    query: {
                        field: 'charge',
                        index:-1
                    }
                })
            },
            backPage(){
                this.$router.go(-1)
            }
        },
        components: {
            EditContacts
        }
    }
</script>

<style lang="scss" scoped>
    .charge-list {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        .charge-list-wrapper {
            padding-left: 0.4267rem;
            background-color: #ffffff;
            width: 100%;
        }
        .charge-item {
            width: 100%;
            .charge-item-content {
                color: #33484f;
                font-size: 0.4rem;
                border-bottom: 1px solid #e9e9e9;
                padding-bottom: 0.2667rem;
                padding-top: 0.2667rem;
                .content-item {
                    line-height: 0.8rem;
                    .title {
                        margin-right: 0.2667rem;
                    }
                }
            }
        }
        .btns {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0.3467rem 0.4267rem 0.3467rem 0;
            .icon-btn {
                margin-left: 0.4rem;
                display: flex;
                align-items: center;
                i {
                    margin-right: 0.08rem;
                }
                .seclesson-bianji {
                    font-size: 0.4rem;
                }
            }
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
