<template>
    <div class="role-item">
        <div class="role-item-title">
            <span v-if="select" class="active" @click="selectChange(false)"><i class="sec seclesson-gou1"></i></span>
            <span v-else class="normal" @click="selectChange(true)"></span>
            <div @click="selectTitleChange()">{{title}}</div>
        </div>
        <div class="role-item-content">
            <div class="role-item-content-row">
                <div class="role-item-content-title">报名人数</div>
                <input type="number" class="role-input" placeholder="不输入则不限制人数" v-model="maxPlayers">
            </div>
            <div class="role-item-content-row">
                <div class="role-item-content-title">指定用户</div>
                <div class="role-buttons">
                    <div class="role-btn add-student" @click="addStudent">添加学生</div>
                    <div class="role-btn query-student" @click="lookStudent">查看学生</div>
                </div>
            </div>
            <div class="role-item-content-row">
                <div class="role-item-content-title">积分倍数</div>
                <input type="number" class="role-input" placeholder="请填写倍数" v-model="integralMultiple">
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters,mapMutations} from 'vuex'
    import tools from '../../../utils/tool'
    import {MessageBox} from 'mint-ui'
    import * as types from '../../../store/mutations-types'
    export default {
        data() {
            return {
                maxPlayers: '',
                integralMultiple: 1,
                select: false
            }
        },
        created() {
            let titleArr = ['参与者', '组织者', '管理者']
            let index = titleArr.indexOf(this.title)
            switch (index) {
                case 0: {
                    if (tools.isNotEmpty(this.participantType)) {
                        this.maxPlayers = this.participantType.maxPlayers
                        this.integralMultiple = this.participantType.integralMultiple
                    }
                    if (tools.isNotEmpty(this.participant)) {
                        this.setTempParticipantStudents(this.participant)
                    }
                    this.select = this.tempParticipantSelect
                }
                    break;
                case 1: {
                    if (tools.isNotEmpty(this.organizerType)) {
                        this.maxPlayers = this.organizerType.maxPlayers
                        this.integralMultiple = this.organizerType.integralMultiple
                    }
                    if (tools.isNotEmpty(this.organizer)) {
                        this.setTempOrganizerStudents(this.organizer)
                    }
                    this.select = this.tempOrganizerSelect
                }
                    break;
                case 2: {
                    if (tools.isNotEmpty(this.controllerType)) {
                        this.maxPlayers = this.controllerType.maxPlayers
                        this.integralMultiple = this.controllerType.integralMultiple
                    }
                    if (tools.isNotEmpty(this.controller)) {
                        this.setTempControllerStudents(this.controller)
                    }
                    this.select = this.tempControllerSelect
                }
                    break;
            }
        },
        props: {
            title: {
                type: String,
                default: ''
            }
        },
        computed: {
            ...mapGetters([
                'controllerType',
                'controller',
                'organizerType',
                'organizer',
                'participantType',
                'participant',
                'tempControllerStudents',
                'tempOrganizerStudents',
                'tempParticipantStudents',
                'tempControllerSelect',
                'tempOrganizerSelect',
                'tempParticipantSelect',
            ])
        },
        methods: {
            ...mapMutations({
                setTempParticipantStudents:types.SET_PARTICIPANT_TEMPSTUDENTS,
                setTempOrganizerStudents:types.SET_ORGANIZER_TEMPSTUDENTS,
                setTempControllerStudents:types.SET_CONTROLLER_TEMPSTUDENTS,
                setTempControllerSelect:types.SET_TEMP_CONTROLLER_SELECT,
                setTempOrganizerSelect:types.SET_TEMP_ORGANIZER_SELECT,
                setTempParticipantSelect:types.SET_TEMP_PARTICIPANT_SELECT,
            }),
            selectTitleChange(){
                this.select = !this.select
                switch (this.title) {
                    case '管理者':{
                        this.setTempControllerSelect(this.select)
                    }
                        break;
                    case '组织者':{
                        this.setTempOrganizerSelect(this.select)
                    }
                        break;
                    case '参与者':{
                        this.setTempParticipantSelect(this.select)
                    }
                        break;
                }
            },
            selectChange(isSelect){
                this.select = isSelect
                switch (this.title) {
                    case '管理者':{
                        this.setTempControllerSelect(isSelect)
                    }
                        break;
                    case '组织者':{
                        this.setTempOrganizerSelect(isSelect)
                    }
                        break;
                    case '参与者':{
                        this.setTempParticipantSelect(isSelect)
                    }
                        break;
                }
            },
            addStudent() {
                let titleArr = ['参与者', '组织者', '管理者']
                let fields = ['participant', 'organizer', 'controller']
                this.$router.push({
                    path: '/searchStudent',
                    query: {
                        field: fields[titleArr.indexOf(this.title)],
                        type:'activity'
                    }
                })
            },
            lookStudent() {
                let students = []
                switch (this.title) {
                    case '管理者':{
                        students = this.tempControllerStudents
                    }
                        break;
                    case '组织者':{
                        students = this.tempOrganizerStudents
                    }
                        break;
                    case '参与者':{
                        students = this.tempParticipantStudents
                    }
                        break;
                }
                if (tools.isEmpty(students)){
                    MessageBox('提示','当前没有选择学生!')
                    return
                }
                this.$router.push({
                    path: '/showStudent',
                    query: {
                        students: students
                    }
                })
            },
            getData() {
                let students = []
                switch (this.title) {
                    case '管理者':{
                        students = this.handlerStudents(this.tempControllerStudents)
                    }
                        break;
                    case '组织者':{
                        students = this.handlerStudents(this.tempOrganizerStudents)
                    }
                        break;
                    case '参与者':{
                        students = this.handlerStudents(this.tempParticipantStudents)
                    }
                        break;
                }
                if (this.select === true) {
                    if(tools.isNotEmpty(this.maxPlayers)){
                        let index = parseInt(this.maxPlayers)
                        if (index !== 0 && students.length > index) {
                            MessageBox('提示', '报名学生人数不能大于限制人数!')
                            return false
                        }
                    }
                    return {
                        type: {
                            maxPlayers: Number(this.maxPlayers),
                            integralMultiple: this.integralMultiple
                        },
                        students: students
                    }
                } else {
                    return {}
                }
            },
            handlerStudents(stus){
                if (tools.isEmpty(stus)){
                    return []
                }
                let arr = []
                stus.forEach(s => {
                    arr.push({
                        userid:s[0],
                        username:s[1],
                        userschool:s[2]
                    })
                })
                return arr
            }
        }
    }
</script>

<style lang="scss" scoped>
    .role-item {
        width: 100%;
        background-color: #ffffff;
        margin-bottom: 0.1333rem;
        .role-item-title {
            padding-left: 0.4267rem;
            display: flex;
            align-items: center;
            height: 1.3333rem;
            border-bottom: 1px solid #e9e9e9;
            font-size: 0.4267rem;
            color: #33484f;
            span {
                display: block;
                width: 0.5333rem;
                height: 0.5333rem;
                background-color: #ffffff;
                border: solid 0.0267rem #d7e2e8;
                width: 0.5333rem;
                height: 0.5333rem;
                flex-shrink: 0;
                border-radius: 50%;
                flex-grow: 0;
                margin-right: 0.2667rem;
                position: relative;
            }
            span.active {
                background-color: #0099ff;
                border-color: #0099ff;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                    color: #ffffff;
                    font-size: 0.32rem;
                }
            }
        }
        .role-item-content {
            padding: 0.4rem 1.2rem 0.5333rem 0.4267rem;
            .role-item-content-row {
                display: flex;
                align-items: center;
                margin-bottom: 0.5333rem;
                .role-item-content-title {
                    width: 2.5333rem;
                    flex-shrink: 0;
                    flex-grow: 0;
                    font-size: 0.4rem;
                    color: #91a8b0;
                }
                .role-buttons {
                    display: flex;
                    align-items: center;
                    flex-grow: 1;
                    justify-content: space-between;
                    .role-btn {
                        width: 2.6667rem;
                        height: 0.8rem;
                        background-color: #ffffff;
                        border-radius: 0.0667rem;
                        text-align: center;
                        line-height: 0.8rem;
                        font-size: 0.4rem;
                        color: #33484f;
                        border: solid 1px #33484f;
                    }
                    .role-btn.add-student {
                        border-color: #0099ff;
                        color: #0099ff;
                    }
                }
                input.role-input {
                    height: 0.8rem;
                    flex-grow: 1;
                    background-color: #ffffff;
                    border-radius: 0.0667rem;
                    border: solid 0.0133rem #d7e2e8;
                    font-size: 0.4rem;
                    padding-left: 0.24rem;
                }
                input.role-input::-webkit-input-placeholder {
                    font-size: 0.3733rem;
                }
            }
            .role-item-content-row:last-child {
                margin-bottom: 0;
            }
        }
    }
</style>
