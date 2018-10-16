<template>
    <div class="stu-person page">
        <div class="personal-cell">
            <div class="personal-lf"><span>学校</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.SCHOOL_NAME}}</span>
               <span></span>
            </div>
        </div>
        <div class="personal-cell">
            <div class="personal-lf"><span>学号</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.STUDENT_ID}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" >
            <div class="personal-lf"><span>姓名</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.USER_NAME}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell">
            <div class="personal-lf"><span>身份证</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.IDENTITY_ID}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPrompt('联系方式','MOBILE_ID')">
            <div class="personal-lf"><span>联系方式</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.MOBILE_ID}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell"  @click="clickCellPrompt('邮箱','MAIL_ID')">
            <div class="personal-lf"><span>邮箱</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.MAIL_ID}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPicker('SEX','SEX_ID')">
            <div class="personal-lf"><span>性别</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.SEX}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" >
            <div class="personal-lf"><span>所属系院</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.COLLEGE_NAME}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell">
            <div class="personal-lf"><span>专业</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.MAJOR_NAME}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" >
            <div class="personal-lf"><span>年级</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.GRADE_NAME}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" >
            <div class="personal-lf"><span>班级</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.CLASS_NO}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" >
            <div class="personal-lf"><span>政治面貌</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.POLITICAL_NAME}}</span>
                <span></span>
            </div>
        </div>


            <div class="per-photo">
            <div>
                <p>生活照</p>
                <p style="color: silver">用于人脸识别签到</p>
            </div>
            <div class="pirture" @click="clickHandler">
                <uploader :isUseCamera="isUseCamera" ref="upload" @uploadFile="upload" name-field="life_photo" field="LIFE_PHOTO"></uploader>
                <img v-if="!!image" :src="image" alt="" class="upload-photo">
            </div>
        </div>
        <div class="per-photo">
            <div>
                <p>正装照</p>
                <p style="color: silver">用于成绩单</p>
            </div>
            <div class="pirture" @click="clickHandler2">
                <uploader :isUseCamera="isUseCamera" ref="uploading" @uploadFile="uploading" name-field="id_photo" field="ID_PHOTO"></uploader>
                <img v-if="!!imageNext" :src="imageNext" class="upload-photo" alt="">
            </div>
        </div>
        <div :class="{ 'picker-div': true, 'just-bottom':cancleClass }">
            <div class="picker-top">
                <mt-button type="default" size="small" @click="cancle">取消</mt-button>
                <mt-button type="danger" size="small" @click="confirm">确定</mt-button>
            </div>
            <mt-picker :slots="slots" @change="onValuesChange">

            </mt-picker>
        </div>

    </div>
</template>

<script>

    import {MessageBox} from 'mint-ui';
    import selectText from '../../components/selectText/selectText';
    import request from '../../utils/request'
    import tools from '../../utils/tool'
    import uploader from '../../components/uploader/uploader'
    import { Picker } from 'mint-ui';
    import {setStuIsLogin} from  '../../utils/setUserInfo'
    import {CONF} from "../../utils/URLConfig"

    export default {
        name: "personal",
        components: {
            selectText,
            uploader
        },
        data() {
            return {
                md5: "",
                md6:"",
                getDataFun: {
                    type: this.getDataFun
                },
                isUseCamera:true,
                cancleClass:true,
                slots: [
                    {
                        flex: 1,
                        values: [],
                        className: 'slot1',
                        textAlign: 'center',
                        showToolbar:true,
                    },
                ],
                dataList:{
                      USER_ID : '',
                      SCHOOL_NAME:'',
                      STUDENT_ID : '',
                      USER_NAME : '',
                      IDENTITY_ID : '',
                      MOBILE_ID : '',
                      MAIL_ID:'',
                      SEX_ID:'',
                      SEX:'',
                      COLLEGE_ID :'',
                      COLLEGE_NAME :'',
                      MAJOR_ID:'',
                      MAJOR_NAME :'',
                      GRADE_ID:'',
                      GRADE_NAME:'',
                      CLASS_ID:'',
                      CLASS_NO:'',
                      POLITICAL_ID:'',
                      POLITICAL_NAME:'',
                      LIFE_PHOTO:'',
                      ID_PHOTO:''
                },
                selectValue:'',
                selectIndex:"",
                selectID:'',
                selectJson:[],
                putData:[
                    {   user_id:"",
                        school_name:"",
                        student_id:"",
                        user_name:"张丽容test",
                        identity_id:"350624199906123520",
                        mobile_id:"15860219546",
                        mail_id:"2313364411@qq.com",
                        sex_id:"2",
                        college_id:"S001D082",
                        magor_id:"S001D082M173",
                        grade_id:"8",
                        class_id:"S001D082M173G2017C1",
                        political_id:"2",
                        life_photo:"0C1D37E5B1BC89135D73B40DD28C663B",
                         id_photo:"test.png0"}
                ]
            }
        },
        computed: {
            image() {
                // console.log(this.md5);
                return this.md5 && tools.fileUrlGet(this.md5,'life_photo');
            },
            imageNext() {
                return this.md6 && tools.fileUrlGet(this.md6,'id_photo');
            }
        },
        methods: {
            onValuesChange(picker, values) {
                // if (values[0] > values[1]) {
                //     picker.setSlotValue(1, values[0]);
                // }
                this.selectValue = picker.getValues()[0]

            },
            upload(md5) {

                this.md5 = md5;
                this.dataList.LIFE_PHOTO = this.md5;
                let putData = this.putData[0];
                for(let v in putData){
                    putData[v] = this.dataList[v.toLocaleUpperCase()];
                }
                request.put( CONF.url.studentNopage,this.putData)
            },
            uploading(md5){
                this.md6 = md5;
                this.dataList.ID_PHOTO = this.md6;
                let putData = this.putData[0];
                for(let v in putData){
                    putData[v] = this.dataList[v.toLocaleUpperCase()];
                }
                request.put(CONF.url.studentNopage,this.putData)
            },
            clickHandler() {
                this.$refs.upload.selectActionSheet();
            },
            clickHandler2() {
                this.$refs.uploading.selectActionSheet()
            },
            cancle(){
                this.cancleClass =  true;
            },
            confirm(){
                this.cancleClass = true
                if(this.selectIndex){
                    this.dataList[this.selectIndex] = this.selectValue;
                    this.selectJson.forEach((value, index, array)=>{
                          if(value[this.selectIndex] == this.selectValue){
                              this.dataList[this.selectID] = value[this.selectID]
                          }
                    })
                    let putData = this.putData[0];
                    for(let v in putData){
                         putData[v] = this.dataList[v.toLocaleUpperCase()];
                    }
                    request.put(CONF.url.studentNopage,this.putData)
                }
            },
            clickCellPrompt(text,val){
                MessageBox.prompt("", {
                    message: "请输入" + `${text}`,
                    cancelButtonText: "暂不"
                }).then(({value, action}) => {
                    this.dataList[val] = value;
                    let putData = this.putData[0];
                    for(let v in putData){
                        putData[v] = this.dataList[v.toLocaleUpperCase()];
                    }
                    request.put(CONF.url.studentNopage,this.putData)
                }).catch(err => {
                    if (err == 'cancel') {//点击暂不的回调

                    }
                });
            },
            clickCellPicker(del,id){
                this.cancleClass = false;
                this.selectIndex = del;
                this.selectID = id;
                let list = {
                    SEX :CONF.url.studentSex,
                    COLLEGE_NAME:CONF.url.studentCollege,
                    MAJOR_NAME:CONF.url.studentMajor,
                    GRADE_NAME:CONF.url.studentGrade,
                    CLASS_NO:CONF.url.studentClass,
                    POLITICAL_NAME:CONF.url.POLITICAL
                }
                request.get(list[del]).then((res)=>{
                    let data = tools.getCrossTableData(res.data.body.meta, res.data.body.dataList);
                    //console.log(data);
                    this.selectJson = data;
                    this.slots.forEach((value, index, array)=>{
                        value.values = [];
                    }) ;
                    data.forEach((val, index, array)=>{
                        // console.log(val[id]);
                        //这里存个ID值
                        this.slots.forEach((value, index, array)=>{
                            value.values.push( val[del]);
                        })
                    })
                })
            }
        },
        created() {
            request.get(CONF.url.studentNopage).then((res) => {
                let data = tools.getCrossTableData(res.data.body.meta, res.data.body.dataList);
               // console.log(data[0].LIFE_PHOTO);
                data[0].LIFE_PHOTO && (this.md5 = data[0].LIFE_PHOTO);
                data[0].ID_PHOTO && (this.md6 = data[0].ID_PHOTO);
                for( let val in data[0]){
                    this.dataList[val] = data[0][val]
                }

            })
        },

    }


</script>

<style lang="scss" >
    .stu-person {
        background-color: white;
        .just-bottom{
            bottom: -7rem !important;
        }

        .personal-cell{
            display: flex;
            justify-content: space-between;
            margin-left: 0.45rem;
            padding: 0.45rem;
            font-size: 0.38rem;
            border-bottom: 0.01rem solid rgb(168,168,168);
            .personal-lf{

            }
            .personal-right{

            }
        }
        .per-photo {
            margin-left: 0.4267rem;
            justify-content: space-between;
            display: flex;
            border-bottom: 0.490px solid rgb(233, 233, 233);
            padding: 1rem 0;
            .pirture {
                background: rgb(231, 231, 231);
                width: 3.2rem;
                height: 3.5rem;
                margin-right: 0.467rem;
                overflow: hidden;
                 /*.uploader{*/
                     /*display: none;*/

                 /*}*/
                img{
                    height: 100%;
                }
            }
        }
        .picker-div{
            position: fixed;
            bottom: 0;
            right: 0;
            -webkit-transition: bottom 0.2s linear;
            transition: bottom 0.2s linear;
            left: 0;
            height: 5.8rem;
            z-index: 10;
            background-color: rgb(248,248,248);
            .picker-top{
                display: flex;
                justify-content: space-between;
                padding: 0.34rem 0.45rem;
                border-top: 0.03rem solid rgb(168,168,168);

            }
        }
    }


</style>
