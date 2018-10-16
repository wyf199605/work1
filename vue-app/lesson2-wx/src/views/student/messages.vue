<template>
  <div class="stu-message page">
      <div class="message-model" v-for="(val,index) in  dataList" :key="index">
          <div style="color: rgb(148,148,148)" class="time">{{val.CREATE_TIME}}</div>
          <div class="content">
              <div>
                  <span>{{val.TITLE}}</span></div>
              <p>课程活动: 11点50分报名</p>
              <p style="color: rgb(37,165,254)">{{val.CONTENT}}</p>
          </div>

      </div>
      <div v-if="noData" class="shuju"> <i class="sec seclesson-zanwushuju"></i></div>
  </div>
</template>

<script>
    import request from '../../utils/request'
    import tools from '../../utils/tool'
    import {CONF} from "../../utils/URLConfig"
    import {
        getStuIsLogin,
    } from '../../utils/setUserInfo'
    export default {
        name: "messages",
        data(){
            return {
                dataList:[

                ],
                prompt: false,
                noData:false
            }
        },
        created(){
            let re = getStuIsLogin();
            request.get(CONF.url.studentAdvice).then((res)=>{

                let data = tools.getCrossTableData(res.data.body.meta,res.data.body.dataList)
                if( data.length === 0 ){
                    this.noData = true;
                    console.log("进来了")
                }else {
                    this.noData = false;
                }

                if(re === "false" || re === false){
                   this.prompt = true
               }
                this.dataList = data
            })

        }
    }
</script>

<style lang="scss" scoped>
    .stu-message{
        background: white;
        .message-model{
            margin: 0.54rem;
            font-size: 0.45rem;
            .content {
                background: rgb(248,248,248);
                height: 4.6rem;
                box-sizing: border-box;
                padding: 0.64rem;
                margin-top: 0.34rem;
                overflow-y: scroll;
            }
            .time{
                text-align: center;

            }
            div:last-child{
                 span {
                     background: rgb(101,179,241);
                     color: white;
                     padding: 0.16rem;
                 }
            }

        }
        .shuju {
             text-align: center;
             font-size: 3.3rem;
             padding: 3rem;
            color: rgb(215,215,215);
            i{
                font-size: 4.3rem;
                margin-top: 3rem;
            }
         }
    }
</style>
