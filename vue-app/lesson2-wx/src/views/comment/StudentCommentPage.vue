<template>
    <div class="comment-page">
        <div class="course-info">
            <div class="activity-detail">
                <table-item v-if="rowData" :rowData="rowData"></table-item>
            </div>
        </div>
        <div class="comment">
            <div class="comment-grades">
                <div v-if="!!grades" class="comment-grade" v-for="(item, index) in grades" :key="index">
                    <div class="title">{{item.title}}</div>
                    <start-group :total="5" :default="item.starCount" @onChange="starChange(index, $event)"></start-group>
                </div>
            </div>
            <div class="coment-content">
                <div class="coment-content-header">
                    <div class="title">评语或建议</div>
                    <div class="annotation">注：所有的评论以匿名展示，不超过200个字</div>
                    <div v-if="value.length > 0" class="annotation">（还可以输入{{200 - value.length}}个字）</div>
                </div>
                <div class="comment-content-body">
                    <textarea @input="limitValue" v-model="value" name="comment"></textarea>
                </div>
                <!--<div class="comment-pic">-->
                    <!--<div class="title">花絮照片（最多9张）</div>-->
                    <!--<div class="pic-group">-->
                        <!--<div class="pic-item" v-for="(img, index) in images">-->
                            <!--<div class="pic">-->
                                <!--<img :src="img" alt="">-->
                            <!--</div>-->
                            <!--<a class="close" @click="delImage(index)">-->
                                <!--<i class="sec seclesson-guanbi"></i>-->
                            <!--</a>-->
                        <!--</div>-->
                        <!--<div class="pic-item pic-add" @click="addImage">-->
                            <!--<i class="sec seclesson-xiangji1"></i>-->
                            <!--<span>添加图片</span>-->
                            <!--<upload :is-image="true" ref="upload" @uploadFile="upload"></upload>-->
                        <!--</div>-->
                    <!--</div>-->
                <!--</div>-->
                <div class="btn-group">
                    <mt-button @click="submit" type="primary" size="large" >提交</mt-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { Toast, MessageBox, Indicator } from 'mint-ui';
    import startGroup from '../../components/starGroup/starGroup';
    import upload from '../../components/uploader/uploader';
    import tableItem from '../../components/table/tableItem';
    import tools from '../../utils/tool';
    import request from '../../utils/request';
    import {CONF} from '../../utils/URLConfig';
    export default {
        name: "student-comment-page",
        components: {
            'start-group': startGroup,
            upload,
            tableItem,
        },
        data() {
            return {
                rowData: null,
                activityid: null,
                grades: [
                    {
                        title: '课程活动评分',
                        starCount: 0,
                        name: 'kchdreviewscore'
                    },
                    {
                        title: '活动内容评分',
                        starCount: 0,
                        name: 'hdnrreviewscore'
                    },
                    {
                        title: '活动组织评分',
                        starCount: 0,
                        name: 'hdzzreviewscore'
                    },
                    {
                        title: '活动价值评分',
                        starCount: 0,
                        name: 'hdjzreviewscore'
                    }
                ],
                value: '',
                md5s: []
            }
        },
        computed: {
            images(){
                return this.md5s.map((md5) => {
                    return tools.fileUrlGet(md5);
                })
            },
            formData(){
                let result = {
                    activityuserreview: this.value,
                    activityid: this.activityid,
                };
                for(let item of this.grades){
                    result[item.name] = item.starCount;
                }
                return JSON.stringify([result]);
            }
        },
        beforeRouteEnter(to, from, next) {
            next((vm) => {
                console.log((to.query));
                vm.initData(to.query);
            });
        },
        methods: {
            initData(data){
                if(data){
                    this.activityid = data.activityId;
                    this.rowData = {
                        img: data.img,
                        title: data.activityName,
                        body: [data.time],
                        label: data.label,
                    };
                }
            },
            starChange(index, grade) {
                this.grades[index].starCount = grade;
            },
            limitValue(){
                if(this.value.length > 200){
                    Toast('评论内容不得超过200字！');
                }
                this.value = this.value.slice(0, 200);
            },
            addImage(){
                this.$refs.upload.selectImg();
            },
            delImage(index){
                this.md5s.splice(index, 1);
            },
            submit(){
                // console.log(this.formData);
                if(this.value.length > 0){
                    Indicator.open();
                    console.log(this.formData);
                    request.put(CONF.url.activityComment + '?activityid=' + this.activityid, this.formData).then((e) => {

                        Indicator.close();
                        if(e.code === 0){
                            Toast('评论成功！');
                            window.history.back();
                        }else{
                            MessageBox('温馨提示', e.msg);
                        }
                    }).catch((e) => {
                        console.log(e);
                        Indicator.close();
                    })
                }else{
                    Toast('请填写评论内容！');
                }
            },
            upload(result){
                this.md5s.push(result);
                // console.log(this.md5s)
            }
        }
    }
</script>

<style lang="scss">
    .comment-page {
        overflow-y: auto;
        overflow-x: hidden;
        padding-bottom: 100px;

        .course-info{
            background: #fff;
            margin-bottom: .2rem;
            .activity-detail{
                .table-item-wrapper{
                    padding-bottom: 0;
                    margin-top: 0;
                    .more{
                        color: #91a8b0;
                        font-size: 15px;
                        padding: .3rem 0;
                    }
                }
            }
        }

        .comment {
            padding: 0 0.4rem;

            .title {
                font-size: 16px;
                line-height: inherit;
            }
            .comment-grades{
                border-bottom: 1px solid #ccc;
                .comment-grade {
                    height: 1.2rem;
                    line-height: 1.2rem;
                    font-size: 16px;
                    position: relative;
                    font-weight: normal;
                    .title {
                    }

                    .star-group{
                        font-size: 24px;
                        position: absolute;
                        right: 0.4rem;
                        top: 0;
                    }
                }

            }

            .coment-content {
                padding: .4rem 0;
                .coment-content-header {
                    line-height: 2;
                    font-weight: normal;
                    margin-bottom: .2rem;
                    .annotation {
                        font-size: 14px;
                        color: #91a8b0;
                    }
                }
                .comment-content-body {
                    width: 100%;
                    height: 4.5rem;
                    margin-bottom: .5rem;
                    textarea {
                        width: 100%;
                        height: 100%;
                        background: transparent;
                        border-color: #ccc;
                        resize: none;
                        font-size: 16px;
                        box-shadow: none;
                    }
                }

                .comment-pic{
                    .pic-group{
                        padding: 0.5rem 0;
                        margin-right: -.29rem;
                        &::after{
                            content: "";
                            clear: both;
                            display: block;
                        }
                        .pic-item{
                            position: relative;
                            float: left;
                            width: 2.08rem;
                            height: 2.08rem;
                            margin-right: .29rem;
                            margin-bottom: .2rem;
                            .pic{
                                overflow: hidden;
                                height: 100%;
                                width: 100%;
                                img{
                                    width: auto;
                                    height: 100%;
                                }
                            }
                            .close{
                                display: block;
                                position: absolute;
                                width: 0.48rem;
                                height: 0.48rem;
                                line-height: 0.9;
                                right: -.15rem;
                                top: -.15rem;
                                font-size: 20px;
                                text-align: center;
                                border-radius: .24rem;
                                background: rgba(0, 0, 0, .4);
                                color: #fff;
                            }

                            &.pic-add{
                                text-align: center;
                                border: 2px dashed #d8e3e9;
                                padding: .25rem 0;
                                color: #d8e3e9;
                                i{
                                    display: block;
                                    font-size: 30px;
                                }
                                .uploader{
                                    display: none;
                                }
                                /*input{*/
                                    /*position: absolute;*/
                                    /*left: 0;*/
                                    /*top: 0;*/
                                    /*display: block;*/
                                    /*width: 100%;*/
                                    /*height: 100%;*/
                                    /*opacity: 0;*/
                                /*}*/
                            }
                        }
                    }
                }
            }
        }
    }
</style>
