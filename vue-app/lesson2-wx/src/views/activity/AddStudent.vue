<template>
    <div class="add-student">
        <search-bar :link="link" v-on:searchResult="searchResult"/>
        <ul  v-infinite-scroll="loadMore"
             infinite-scroll-disabled="loading"
             infinite-scroll-distance="10">
            <student v-for="item in showStudentArr" ref="students" :key="item[0]" :student="item"/>
        </ul>
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
    import Student from './reportActivity/StudentItem'
    import {Indicator,MessageBox} from 'mint-ui'
    import tools from '../../utils/tool'
    import {mapMutations,mapGetters} from 'vuex'
    import * as types from '../../store/mutations-types'
    import axios from 'axios'
    export default {
        components: {
            SearchBar,
            Student
        },
        data() {
            return {
                field: '',
                link: '',
                studentData: [],
                index: 0,
                pageSize: 10,
                total: 0,
                showStudentArr: [],
                loadStr:'点击加载更多',
                isShowLoadStr:false,
                loading:false
            }
        },
        created() {
            this.link = CONF.ajaxUrl.searchStudent
            Indicator.open()
            axios.get(CONF.ajaxUrl.searchStudent, {
                params:{
                    search_str: ''
                }
            }).then((res) => {
                Indicator.close()
                this.total = res.data.data.head.totalNum
                this.studentData = res.data.data.body.dataList
                this.index = 0
                this.showStudentArr = this.studentData.slice(
                    0,
                    this.index * this.pageSize
                )
            }).catch(()=>{
                Indicator.close()
            })
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.field = to.query.field
            })
        },
        computed:{
            ...mapGetters([
                'tempControllerStudents','tempOrganizerStudents','tempParticipantStudents'
            ])
        },
        methods: {
            ...mapMutations({
                setTempControllerStudents:types.SET_CONTROLLER_TEMPSTUDENTS,
                setTempOrganizerStudents:types.SET_ORGANIZER_TEMPSTUDENTS,
                setTempParticipantStudents:types.SET_PARTICIPANT_TEMPSTUDENTS
            }),
            searchResult(data) {
                this.total = data.head.totalNum
                this.studentData = data.body.dataList
                this.index = 0
                this.showStudentArr = this.studentData.slice(
                    0,
                    this.index * this.pageSize
                )
            },
            loadMore() {
                this.loading = true
                setTimeout(() => {
                    this.index = this.index + 1
                    this.showStudentArr = this.studentData.slice(
                        0,
                        this.index * this.pageSize
                    )
                    this.loading = false
                }, 500)
            },
            save() {
                let selectData = []
                this.$refs.students.forEach((stu)=>{
                    if (stu.select === true){
                        selectData.push(stu.studentData)
                    }
                })
                if (tools.isEmpty(selectData)){
                    MessageBox('提示','未选择学生!')
                    return
                }

                let fields = ['participant', 'organizer', 'controller']
                let fieldIndex = fields.indexOf(this.field)
                let students = []
                switch (this.title) {
                    case '2':{
                        students = this.tempControllerStudents
                    }
                        break;
                    case '1':{
                        students = this.tempOrganizerStudents
                    }
                        break;
                    case '0':{
                        students = this.tempParticipantStudents
                    }
                        break;
                }
                // 去重
                for (let i = 0;i<selectData.length;i++){
                    let newStu = selectData[i]
                    if (students.indexOf(newStu) < 0){
                        students.push(newStu)
                    }
                }
                switch (fieldIndex){
                    case 0:{
                        this.setTempParticipantStudents(students)
                    }
                        break;
                    case 1:{
                        this.setTempOrganizerStudents(students)
                    }
                        break;
                    case 2:{
                        this.setTempControllerStudents(students)
                    }
                        break;
                }
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            }
        }
    }
</script>
<style lang="scss" scoped>
    .add-student {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
        z-index: 2;
        overflow: auto;
        padding-bottom: 4.6667rem;
        ul {
            width: 100%;
            background-color: #ffffff;
            padding: 0;
            margin: 0;
            height: 100%;
            margin-top: 0.16rem;
        }
        .buttons{
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #f8f8f8;
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
