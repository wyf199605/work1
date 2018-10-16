<template>
    <div class="roles">
        <role-item ref="roles" v-for="(title,index) in titles" :key="index" :title="title"/>
        <div class="btn-wrapper">
            <div class="btn" @click="isShowModal = true">查看积分</div>
        </div>
        <div class="btn-wrapper">
            <div class="btn cancel" @click="save()">保存</div>
        </div>
        <modal v-if="isShowModal" title="查看积分" v-on:modalCancel="cancelModal" v-on:modalConfirm="confirmModal">
            <table slot="body">
                <tr>
                    <th v-for="(th,index) in thArr" :key="index">{{th}}</th>
                </tr>
                <tr v-for="(tr,index) in integralDetails" :key="index">
                    <td v-for="(td,i) in tr" :key="i">{{td}}</td>
                </tr>
            </table>
        </modal>
    </div>
</template>

<script>
    import RoleItem from './reportActivity/RoleItem'
    import Modal from '../../components/modal/Modal'
    import {MessageBox} from 'mint-ui'
    import * as types from '../../store/mutations-types'
    import {mapMutations,mapGetters} from 'vuex'
    import tools from '../../utils/tool'

    export default {
        data() {
            return {
                titles: ['参与者', '组织者', '管理者'],
                fields: ['participant', 'organizer', 'controller'],
                isShowModal: false,
                integralDetails: [],
                thArr: []
            }
        },
        components: {
            RoleItem,
            Modal
        },
        computed: {
            ...mapGetters([
                'controllerType', 'controller', 'organizerType', 'organizer', 'participantType', 'participant'
            ])
        },
        beforeRouteLeave(to,from,next){
            if (to.path === '/reportActivity') {
                this.setTempControllerSelect(false)
                this.setTempOrganizerSelect(false)
                this.setTempParticipantSelect(false)
                this.setTempParticipantStudents([])
                this.setTempOrganizerStudents([])
                this.setTempControllerStudents([])
            }
            next()
        },
        created() {
            if (this.$route.query.path === 'activityReport') {
                if(tools.isNotEmpty(this.controllerType) || tools.isNotEmpty(this.controller)){
                    this.setTempControllerSelect(true)
                }
                if(tools.isNotEmpty(this.organizerType) || tools.isNotEmpty(this.organizer)){
                    this.setTempOrganizerSelect(true)
                }
                if(tools.isNotEmpty(this.participantType) || tools.isNotEmpty(this.participant)){
                    this.setTempParticipantSelect(true)
                }
            }
            // 查看积分
            // report
            //     .lookIntegral()
            //     .then(result => {
            //         this.handlerHeaderData(result.data.sysFieldsList)
            //         this.handlerBodyData(result.data.data, result.data.sysFieldsList)
            //     })
            //     .catch(err => {
            //     })
        },
        methods: {
            ...mapMutations({
                setController: types.SET_CONTROLLER,
                setOrganizer: types.SET_ORGANIZER,
                setParticipant: types.SET_PARTICIPANT,
                setTempControllerSelect:types.SET_TEMP_CONTROLLER_SELECT,
                setTempOrganizerSelect:types.SET_TEMP_ORGANIZER_SELECT,
                setTempParticipantSelect:types.SET_TEMP_PARTICIPANT_SELECT,
                setTempParticipantStudents:types.SET_PARTICIPANT_TEMPSTUDENTS,
                setTempOrganizerStudents:types.SET_ORGANIZER_TEMPSTUDENTS,
                setTempControllerStudents:types.SET_CONTROLLER_TEMPSTUDENTS,
            }),
            cancelModal() {
                this.isShowModal = false
            },
            confirmModal() {
                this.isShowModal = false
            },
            handlerBodyData(data, head) {
                let result = []
                data.forEach(item => {
                    let arr = []
                    for (const key in item) {
                        const element = item[key]
                        for (let i = 0; i < head.length; i++) {
                            const h = head[i]
                            if (h.field === key) {
                                arr.push(element)
                                break
                            }
                        }
                    }
                    result.push(arr)
                })
                this.integralDetails = result
            },
            handlerHeaderData(data) {
                let arr = []
                data.forEach(element => {
                    arr.push(element.caption)
                })
                this.thArr = arr
            },
            save() {
                let participant = this.$refs.roles[0].getData()
                if (participant === false) {
                    return
                }
                let organizer = this.$refs.roles[1].getData()
                if (organizer === false) {
                    return
                }
                let controller = this.$refs.roles[2].getData()
                if (controller === false) {
                    return
                }
                if (tools.isEmpty(participant) && tools.isEmpty(organizer) && tools.isEmpty(controller)) {
                    MessageBox('提示', '请至少选择一个角色')
                    return
                }
                let controllerData = tools.isNotEmpty(controller) ? {
                    controller: controller.students,
                    controllerType: controller.type
                } : {
                    controller: [],
                    controllerType: {}
                }
                let organizerData = tools.isNotEmpty(organizer) ? {
                    organizer: organizer.students,
                    organizerType: organizer.type
                } : {
                    organizer: [],
                    organizerType: {}
                }
                let participantData = tools.isNotEmpty(participant) ? {
                    participant: participant.students,
                    participantType: participant.type
                } : {
                    participant: [],
                    participantType: {}
                }
                this.setOrganizer(organizerData)
                this.setController(controllerData)
                this.setParticipant(participantData)
                this.$router.go(-1)
            }
        }
    }
</script>

<style lang="scss">
    .roles {
        background-color: #f8f8f8;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        table {
            width: 100%;
            border: solid 0.0133rem #33484f;
            border-collapse: collapse;
            th, td {
                height: 0.8rem;
                border: solid 0.0133rem #33484f;
                text-align: center;
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
            .btn.cancel {
                background-color: #ffffff;
                border: solid 0.0133rem #0099ff;
                color: #0099ff;
            }
            .btn.cancel:active {
                border: solid 0.0133rem #0089e5;
                color: #0089e5;
                background-color: #ffffff;
            }
        }
    }
</style>
