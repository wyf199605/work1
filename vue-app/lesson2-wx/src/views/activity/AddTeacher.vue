<template>
    <div class="add-teacher">
        <search-bar :link="link" v-on:searchResult="searchResult" placeholderStr="搜索姓名或工号"/>
        <ul v-infinite-scroll="loadMore"
            infinite-scroll-disabled="loading"
            infinite-scroll-distance="10">
            <div class="teacher-wrapper" v-for="(teacherData,index) in showTeacherArr" :key="index"
                 @click="selectTeacher(index)">
                <div class="content">
                    <div class="stu-num">{{teacherData[0]}}</div>
                    <div class="stu-name">{{teacherData[1] + '(' + teacherData[2] + ')'}}</div>
                </div>
                <i v-if="select === index" class="sec seclesson-gou1"></i>
            </div>
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
    import {Indicator, MessageBox} from 'mint-ui'
    import {mapMutations, mapGetters} from 'vuex'
    import * as types from '../../store/course-mutations-types'
    import axios from 'axios'

    export default {
        components: {
            SearchBar
        },
        data() {
            return {
                field: '',
                link: '',
                teacherData: [],
                index: 0,
                pageSize: 10,
                total: 0,
                showTeacherArr: [],
                loadStr: '点击加载更多',
                isShowLoadStr: false,
                loading: false,
                select: -1
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
                this.teacherData = res.data.data.body.dataList
                this.index = 0
                this.showTeacherArr = this.teacherData.slice(
                    0,
                    this.index * this.pageSize
                )
            }).catch(()=>{
                Indicator.close()
            })
        },
        computed: {
            ...mapGetters([])
        },
        methods: {
            ...mapMutations({
                setTeacher: types.COURSE_SET_TEACHER
            }),
            searchResult(data) {
                this.total = data.head.totalNum
                this.teacherData = data.body.dataList
                this.index = 0
                this.showTeacherArr = this.teacherData.slice(
                    0,
                    this.index * this.pageSize
                )
            },
            loadMore() {
                this.loading = true
                setTimeout(() => {
                    this.index = this.index + 1
                    this.showTeacherArr = this.teacherData.slice(
                        0,
                        this.index * this.pageSize
                    )
                    this.loading = false
                }, 500)
            },
            save() {
                if (this.select === -1) {
                    MessageBox('提示', '未选择老师!')
                    return
                }
                let teacher = this.showTeacherArr[this.select]
                this.setTeacher({
                    teacherId:teacher[0],
                    teacherName:teacher[1],
                    teacherPosition:teacher[2]
                })
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            },
            selectTeacher(index) {
                if (this.select === index) {
                    this.select = -1
                } else {
                    this.select = index
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .add-teacher {
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
        .buttons {
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
        .teacher-wrapper{
            width: 100%;
            height: 1.4667rem;;
            border-bottom: 0.0133rem solid #e9e9e9;
            font-size: 0.4rem;
            color: #33484f;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-right: 0.4267rem;
            background-color: #ffffff;
            padding-left: 0.4267rem;
            .content{
                display: flex;
                align-items: center;
                margin-right: 0.2667rem;
            }
            .stu-num{
                flex-grow: 0;
                flex-shrink: 0;
                margin-right: 0.2667rem;
            }
            .stu-name{
                text-overflow: ellipsis;
                word-break: break-all;
                white-space: nowrap;
                overflow: hidden;
            }
            i{
                color: #0099ff;
                flex-shrink: 0;
                flex-grow: 0;
            }
        }
    }
</style>
