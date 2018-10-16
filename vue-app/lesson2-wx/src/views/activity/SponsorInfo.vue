<template>
    <div class="sponsor-info">
        <report-input field="slogan" title="活动口号" @reportInputEdit="edit" :defaultValue="slogan"/>
        <sponsor ref="sponsor" title="主办方" :isRequired="true" field="sponsor"/>
        <sponsor ref="contractor" title="承办方" field="contractor"/>
        <sponsor ref="assist" title="协办方" field="assist"/>
        <report-input :isRequired="true" field="charge" :defaultValue="chargeText" title="咨询人" @reportInputEdit="edit"/>
        <report-input field="remind" title="提醒内容" @reportInputEdit="edit" :defaultValue="remind"/>
        <div class="btn-wrapper">
            <div class="btn" @click="save">确认</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="cancel">取消</div>
        </div>
    </div>
</template>

<script>
    import ReportInput from './reportActivity/ReportInput'
    import Sponsor from './reportActivity/Sponsor'
    import {MessageBox} from 'mint-ui'
    import * as types from '../../store/mutations-types'
    import {mapGetters, mapMutations} from 'vuex'
    import tools from '../../utils/tool'

    export default {
        components: {
            ReportInput,
            Sponsor
        },
        data() {
            return {
                chargeText:'请设置'
            }
        },
        created(){
          if (tools.isNotEmpty(this.charge)){
              this.chargeText = '点击修改';
          }
        },
        computed: {
            ...mapGetters([
                'slogan', 'remind', 'assist', 'sponsor', 'contractor','charge'
            ])
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (from.path === '/reportActivity') {
                    vm.setTempSponsor(vm.sponsor)
                    vm.setTempAssist(vm.assist)
                    vm.setTempContractor(vm.contractor)
                }
            })
        },
        beforeRouteLeave(to, from, next) {
            if (to.path === '/reportEdit' || to.path === '/charge') {
                let sponsorData = this.$refs.sponsor.getResults()
                let contractorData = this.$refs.contractor.getResults()
                let assistData = this.$refs.assist.getResults()
                this.setTempAssist(assistData)
                this.setTempContractor(contractorData)
                this.setTempSponsor(sponsorData)
            }
            next()
        },
        methods: {
            ...mapMutations({
                setSponsor: types.SET_SPONSOR,
                setContractor: types.SET_CONTRACTOR,
                setAssist: types.SET_ASSIST,
                setTempSponsor: types.SET_TEMP_SPONSOR,
                setTempAssist: types.SET_TEMP_ASSIST,
                setTempContractor: types.SET_TEMP_CONTRACTOR
            }),
            edit(field) {
                if (field === 'slogan' || field === 'remind') {
                    this.$router.push({
                        path: '/reportEdit',
                        query: {
                            field: field
                        }
                    })
                } else {
                    this.$router.push({
                        path: '/charge'
                    })
                }
            },
            save() {
                let sponsorData = this.$refs.sponsor.getResults()
                let contractorData = this.$refs.contractor.getResults()
                let assistData = this.$refs.assist.getResults()
                if (tools.isEmpty(sponsorData)) {
                    MessageBox('提示', '主办方不能为空!')
                    return
                }
                if(tools.isEmpty(this.charge)){
                    MessageBox('提示', '咨询人不能为空!')
                    return
                }
                this.setSponsor(sponsorData)
                this.setContractor(contractorData)
                this.setAssist(assistData)
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            }
        }
    }
</script>

<style lang="scss">
    .sponsor-info {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        .modal-enter-active {
            animation: modal-in 0.2s;
        }
        .modal-leave-active {
            animation: modal-in 0.2s reverse;
        }
        @keyframes modal-in {
            0% {
                transform: translate(100%, 0);
            }
            100% {
                transform: translate(0, 0);
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
