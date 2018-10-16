<template>
    <div class="tech-person page">
        <div class="personal-cell">
            <div class="personal-lf"><span>学校</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.SCHOOL_NAME}}</span>
                <span></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPicker('COLLEGE_NAME','COLLEGE_ID')">
            <div class="personal-lf"><span>所属院系</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.COLLEGE_NAME}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPrompt('工号','JOB_ID')">
            <div class="personal-lf"><span>工号</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.JOB_ID}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPrompt('姓名','USER_NAME')">
            <div class="personal-lf"><span>姓名</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.USER_NAME}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPrompt('手机号','MOBILE_ID')">
            <div class="personal-lf"><span>手机号</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.MOBILE_ID}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell" @click="clickCellPicker('TITLE_NAME','TITLE_ID')">
            <div class="personal-lf"><span>职称</span></div>
            <div class="personal-right"><span style="color:rgb(148,148,148)">{{dataList.TITLE_NAME}}</span>
                <span><i class="sec seclesson-youjiantou" style="color:rgb(148,148,148)"></i></span>
            </div>
        </div>
        <div class="personal-cell bottom-just">
            <div class=""><span>研究方向</span></div>
            <textarea name="RESEARCH_AREA" id="" cols="30" rows="10" class="research-area" v-model="RESEARCHAREA">{{RESEARCHAREA}}</textarea>
        </div>

        <mt-button type="primary" size="large" class="teach-commit" @click="commint">提交</mt-button>

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
    import {Picker} from 'mint-ui';
    import {CONF} from "../../utils/URLConfig"
    import {Toast} from 'mint-ui';

    export default {
        name: "personal",
        components: {
            selectText,
            uploader
        },
        data() {
            return {
                md5: "",
                md6: "",
                getDataFun: {
                    type: this.getDataFun
                },
                cancleClass: true,
                RESEARCHAREA: "",
                slots: [
                    {
                        flex: 1,
                        values: [],
                        className: 'slot1',
                        textAlign: 'center',
                        showToolbar: true,
                    },
                ],
                dataList: {
                    USER_ID: '',
                    SCHOOL_NAME: '',
                    COLLEGE_ID: '',
                    COLLEGE_NAME: '',
                    JOB_ID: '',
                    USER_NAME: '',
                    MOBILE_ID: '',
                    TITLE_ID: '',
                    TITLE_NAME: '',
                    RESEARCH_AREA: ''
                },
                selectValue: '',
                selectIndex: "",
                selectID: '',
                selectJson: [],
                putData: [
                    {
                        user_id: '',
                        school_name: '',
                        college_id: '',
                        college_name: '',
                        job_id: '',
                        user_name: '',
                        mobile_id: '',
                        title_id: '',
                        title_name: '',
                        research_area: ''
                    }
                ]
            }
        },
        computed: {
            image() {
                return this.md5 && tools.fileUrlGet(this.md5);
            },
            imageNext() {
                return this.md6 && tools.fileUrlGet(this.md6)
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
            },
            uploading(md5) {
                this.md6 = md5;
            },
            clickHandler() {
                this.$refs.upload.selectImg();
            },
            clickHandler2() {
                this.$refs.uploading.selectImg()
            },
            cancle() {
                this.cancleClass = true;
            },
            commint() {

                console.log(this.RESEARCHAREA);
                this.dataList.RESEARCH_AREA = this.RESEARCHAREA;

                let putData = this.putData[0];
                for (let v in putData) {
                    putData[v] = this.dataList[v.toLocaleUpperCase()];
                }
                // console.log(this.putData);
                request.put(CONF.url.teachNopage, this.putData).then((res) => {
                    if (res.code === 0) {
                        Toast({
                            message: '提交成功',
                            iconClass: ' sec seclesson-gou1'
                        });
                    } else {
                        Toast({
                            message: '提交失败',
                            iconClass: ' sec seclesson-guanbi'
                        });
                    }
                })
            },
            confirm() {
                this.cancleClass = true
                if (this.selectIndex) {
                    this.dataList[this.selectIndex] = this.selectValue;
                    this.selectJson.forEach((value, index, array) => {
                        if (value[this.selectIndex] == this.selectValue) {
                            this.dataList[this.selectID] = value[this.selectID]
                        }
                    })
                    // let putData = this.putData[0];
                    // for (let v in putData) {
                    //     putData[v] = this.dataList[v.toLocaleUpperCase()];
                    // }
                    // // console.log(this.putData);
                    // request.put(CONF.url.teachNopage, this.putData)
                }
            },
            clickCellPrompt(text, val) {
                MessageBox.prompt("", {
                    message: "请输入" + `${text}`,
                    cancelButtonText: "暂不"
                }).then(({value, action}) => {
                    // console.log(value);
                    // console.log(val);
                    this.dataList[val] = value;

                    // let putData = this.putData[0];
                    // for (let v in putData) {
                    //     putData[v] = this.dataList[v.toLocaleUpperCase()];
                    // }
                    // // console.log(this.putData);
                    // request.put(CONF.url.teachNopage, this.putData)

                }).catch(err => {
                    if (err == 'cancel') {//点击暂不的回调

                    }
                });
            },
            clickCellPicker(del, id) {
                this.cancleClass = false;
                this.selectIndex = del;
                this.selectID = id;
                let list = {
                    COLLEGE_NAME: CONF.url.teachFaculty,
                    TITLE_NAME: CONF.url.teachProfessor,

                }
                request.get(list[del]).then((res) => {
                    let data = tools.getCrossTableData(res.data.body.meta, res.data.body.dataList);
                    //console.log(data);
                    this.selectJson = data;
                    this.slots.forEach((value, index, array) => {
                        value.values = [];
                    });
                    data.forEach((val, index, array) => {
                        //这里存个ID值
                        this.slots.forEach((value, index, array) => {
                            value.values.push(val[del]);
                        })
                    })
                })
            }
        },
        created() {
            request.get(CONF.url.teachNopage).then((res) => {
                console.log(res)
                let data = tools.getCrossTableData(res.data.body.meta, res.data.body.dataList);
                // console.log(data[0]);
                for (let val in data[0]) {
                    // console.log(val);
                    this.dataList[val] = data[0][val]
                }
                this.RESEARCHAREA = this.dataList.RESEARCH_AREA;
            })
        },

    }
</script>

<style lang="scss">
    .tech-person {
        background-color: white;
        .just-bottom {
            bottom: -7rem !important;
        }
        .bottom-just {
            border: 0 !important;
            padding: 0.84rem;
        }
        .personal-cell {
            display: flex;
            justify-content: space-between;
            margin-left: 0.45rem;
            padding: 0.45rem;
            font-size: 0.38rem;
            border-bottom: 0.01rem solid rgb(168, 168, 168);

            .research-area {
                height: 2.65rem;
            }
            .personal-lf {

            }
            .personal-right {

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
                .uploader {
                    display: none;

                }
                img {
                    height: 100%;
                }
            }
        }
        .picker-div {
            position: fixed;
            bottom: 0;
            right: 0;
            -webkit-transition: bottom 0.2s linear;
            transition: bottom 0.2s linear;
            left: 0;
            height: 5.8rem;
            z-index: 10;
            background-color: rgb(248, 248, 248);
            .picker-top {
                display: flex;
                justify-content: space-between;
                padding: 0.34rem 0.45rem;
                border-top: 0.03rem solid rgb(168, 168, 168);

            }
        }
        .teach-commit {
            margin: 0.3rem auto;
            width: 80%;
        }
    }


</style>
