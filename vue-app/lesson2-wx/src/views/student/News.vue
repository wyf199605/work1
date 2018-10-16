<template>
    <div class="stu-news page">
        <div class="news-model" v-for="val in dataList">
            <div class="news-title">{{val.ACTIME}}</div>
            <div class="news-content">
                <h3>{{val.TITLE}}</h3>
                <p> 发布时间:{{val.ACTIME}}</p>
                <p>
                    {{removeHtml(val.INTRODUCTION)}}
                </p>
            </div>
        </div>
        </div>
</template>

<script>
    import request from '../../utils/request'
    import tools from '../../utils/tool'
    import {CONF} from "../../utils/URLConfig"
    export default {

        name: "News",
        data(){
            return {
                dataList:[

                ]
            }
        },
        created(){
            request.get(CONF.url.studentNews).then((res)=>{
                //  console.log(res);
                 let data = tools.getCrossTableData(res.data.body.meta,res.data.body.dataList)
                 this.dataList = data
            }).catch((e)=>{
                console.log(e);
            })
        },
        methods:{
            removeHtml(html){
                return tools.removeHtmlTags(html)
            }
        }
    }
</script>

<style lang="scss" scoped>

    .stu-news{
        background-color: white;
        .news-model{
            padding: 0 0.34rem;
            .news-title{
                text-align: center;
                margin: 0.34rem;
            }
            .news-content{
                border-radius: 4%;
                background: rgb(248,248,248);
                border-top: 0.1rem solid rgb(0,153,255);
                padding: 0.24rem;
            }
        }
    }
</style>
