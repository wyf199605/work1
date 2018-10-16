<template>
    <div class="select-college">
        <div class="content">
            <college-item ref="collegeItem" v-for="(item,index) in resultData" :key="item[0]" :item="item" :index="index" v-on:selectAll="selectAll" v-on:selectNone="selectNone"/>
        </div>
        <div class="buttons">
            <div class="btn-wrapper">
                <div class="btn" @click="save">确认</div>
            </div>
            <div class="btn-wrapper">
                <div class="btn cancel" @click="cancel">取消</div>
            </div>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import {CONF} from '../../utils/URLConfig'
    import CollegeItem from './reportActivity/CollegeItem'
    import tools from '../../utils/tool'
    import {MessageBox} from 'mint-ui'
    import {mapMutations,mapGetters} from 'vuex'
    import * as types from '../../store/mutations-types'
    export default {
        data() {
            return {
                resultData: [],
                field: '',
                title:'',
                trueData:[]
            }
        },
        components:{
            CollegeItem
        },
        computed:{
            ...mapGetters([
                'tempCollege',
                'tempMajor',
                'tempGrade',
                'tempClbum'
            ])
        },
        created() {
            let field = this.$route.query.field
            this.field = field
            switch (field) {
                case 'college': {
                    document.title = '选择学院'
                    this.title = '学院'
                    axios.get(CONF.ajaxUrl.college).then((res)=>{
                        this.trueData = res.data.data.body.dataList
                        let arr =[[0,'不限']].concat(res.data.data.body.dataList)
                        this.resultData = arr
                    })
                }
                    break;
                case 'major': {
                    document.title = '选择专业'
                    this.title = '专业'
                    this.getMajorAjaxData()
                }
                    break;
                case 'grade': {
                    document.title = '选择年级'
                    this.title = '年级'
                    axios.get(CONF.ajaxUrl.grade).then((res)=>{
                        this.trueData = res.data.data.body.dataList
                        let arr =[[0,'不限']].concat(res.data.data.body.dataList)
                        this.resultData = arr
                    })
                }
                    break;
                case 'clbum': {
                    document.title = '选择班级'
                    this.title = '班级'
                    this.getClassAjaxData()
                }
                    break;
            }
        },
        methods: {
            ...mapMutations({
                setTempCollege: types.SET_TEMP_COLLEGE,
                setTempMajor: types.SET_TEMP_MAJOR,
                setTempGrade: types.SET_TEMP_GRADE,
                setTempClbum: types.SET_TEMP_CLBUM,
                setTempLimitCollege: types.SET_TEMP_LIMITCOLLEGE,
                setTempLimitMajor: types.SET_TEMP_LIMITMAJOR,
                setTempLimitGrade: types.SET_TEMP_LIMITGRADE,
                setTempLimitClass: types.SET_TEMP_LIMITCLASS
            }),
            save() {
                let selectData = this.getAllResults()
                let limit = 1
                if (this.$refs.collegeItem[0].selectIndex){
                    limit = 0
                }
                if (tools.isEmpty(selectData) && limit === 1){
                    MessageBox('提示',`请选择${this.title}!`)
                    return
                }
                switch (this.field) {
                    case 'college': {
                        this.setTempLimitCollege(limit)
                        this.setTempCollege(selectData)
                        this.setTempLimitMajor(-1)
                        this.setTempMajor([])
                        this.setTempLimitGrade(-1)
                        this.setTempGrade([])
                    }
                        break;
                    case 'major': {
                        this.setTempLimitMajor(limit)
                        this.setTempMajor(selectData)
                        this.setTempLimitClass(-1)
                        this.setTempClbum([])
                    }
                        break;
                    case 'grade': {
                        this.setTempLimitGrade(limit)
                        this.setTempGrade(selectData)
                        this.setTempLimitClass(-1)
                        this.setTempClbum([])
                    }
                        break;
                    case 'clbum': {
                        this.setTempLimitClass(limit)
                        this.setTempClbum(selectData)
                    }
                        break;
                }
                this.$router.go(-1)
            },
            cancel() {
                this.$router.go(-1)
            },
            getMajorAjaxData(){
                let val = []
                let values = this.tempCollege
                if (tools.isEmpty(values)) {
                    val.push('')
                } else {
                    let allStr = ''
                    values.forEach((item, index) => {
                        if (index === 0) {
                            allStr += item.id
                        } else {
                            allStr += `,${item.id}`
                        }
                    });
                    val.push(allStr);
                }
                let url = tools.url.addObj(CONF.ajaxUrl.major, {
                    queryparams0: JSON.stringify({
                        not: false,
                        op: 0,
                        params: [{
                            not: false,
                            op: 2,
                            field: "sub_college_id",
                            values: val
                        }]
                    })
                });
                axios.get(url).then((res)=>{
                    this.trueData = res.data.data.body.dataList
                    let arr =[[0,'不限']].concat(res.data.data.body.dataList)
                    this.resultData = arr
                })
            },
            getClassAjaxData(){
                let valMajor = []
                let majorValues = this.tempMajor
                if (tools.isEmpty(majorValues)) {
                    valMajor.push('')
                } else {
                    let allStr = '';
                    majorValues.forEach((item, index) => {
                        if (index === 0) {
                            allStr += item.id
                        } else {
                            allStr += `,${item.id}`
                        }
                    });
                    valMajor.push(allStr)
                }
                let valGrade = []
                let gradeValues = this.tempGrade
                if (tools.isEmpty(majorValues)) {
                    valGrade.push('')
                } else {
                    let allStr = '';
                    gradeValues.forEach((item, index) => {
                        if (index === 0) {
                            allStr += item.id
                        } else {
                            allStr += `,${item.id}`
                        }
                    });
                    valGrade.push(allStr)
                }
                let url = tools.url.addObj(CONF.ajaxUrl.clbum, {
                    queryparams0: JSON.stringify({
                        not: false,
                        op: 0,
                        params: [{
                            not: false,
                            op: 2,
                            field: "major_id",
                            values: valMajor
                        }, {
                            not: false,
                            op: 2,
                            field: "grade_name",
                            values: valGrade
                        }]
                    })
                })
                axios.get(url).then((res)=>{
                    this.trueData = res.data.data.body.dataList
                    let arr =[[0,'不限']].concat(res.data.data.body.dataList)
                    this.resultData = arr
                })
            },
            getAllResults(){
                if(this.$refs.collegeItem[0].selectIndex){
                    let arr = []
                    let items =  this.trueData
                    for (let i = 0;i<items.length;i++){
                        let item = this.resultData[i]
                        arr.push({
                            id:item[0],
                            name:item[1]
                        })
                    }
                    return arr
                }else{
                    let arr = []
                    let items =  this.$refs.collegeItem
                    for (let i = 0;i<items.length;i++){
                        if (items[i].selectIndex){
                            let item = this.resultData[i]
                            arr.push({
                                id:item[0],
                                name:item[1]
                            })
                        }
                    }
                    return arr
                }
            },
            selectAll(index){
                if (index === 0){
                    this.$refs.collegeItem.forEach(item => {
                        item.selectIndex = true
                    })
                }else{
                    let arr =  this.$refs.collegeItem.slice(1)
                    for (let i = 0;i<arr.length;i++){
                        if (!arr[i].selectIndex){
                            return
                        }
                    }
                    this.$refs.collegeItem[0].selectIndex = true
                }
            },
            selectNone(index){
                if (index === 0){
                    this.$refs.collegeItem.forEach(item => {
                        item.selectIndex = false
                    })
                }else{
                    this.$refs.collegeItem[0].selectIndex = false
                }
            }
        }
    }
</script>
<style scoped lang="scss">
    .select-college {
        background-color: #f8f8f8;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: auto;
        padding-bottom: 4.2667rem;
        .content{
            background-color: #ffffff;
            padding-left: 0.4267rem;
        }
        .buttons{
            width: 100%;
            position: fixed;
            bottom: 0;
            left: 0;
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
