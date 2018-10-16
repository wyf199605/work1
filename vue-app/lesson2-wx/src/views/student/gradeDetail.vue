
<template>
    <div class="stu-grade-detail page">
        <mt-navbar v-model="selected">
            <mt-tab-item id="1"><span style="font-size: 0.40rem">活动学分</span>
             <p>{{activepoint}}学分/{{activeNum}}次</p>
            </mt-tab-item>
            <mt-tab-item id="2"><span style="font-size: 0.40rem">认证学分</span>
            <p>{{authpoint}}学分/{{authNum}}次</p>
            </mt-tab-item>
        </mt-navbar>

        <!-- tab-container -->
        <mt-tab-container v-model="selected">
            <mt-tab-container-item id="1">
                <div class="actvite-content" v-for="(val,index) in actData" :key="index">
                    <div class="active-lf">
                        <h3>{{val.title}}</h3>
                        <p style="color: rgb(148,148,148)">活动时间:201806-23</p>
                        <p style="color: rgb(148,148,148)">{{val.time}}</p>
                        <p class="course-content"><span>{{val.activetype}}</span><span>{{val.activelevel}}</span></p>
                    </div>
                    <div class="active-rg">

                        <p style="color: rgb(1,152,255)">{{val.score}}</p>
                        <p style="color: rgb(148,148,148)">学分</p>
                    </div>
                </div>
            </mt-tab-container-item>
            <mt-tab-container-item id="2">
                <div class="actvite-content " v-for="(val,index) in autData" :key="index">
                    <div class="active-lf">
                        <h3>{{val.title}}</h3>
                        <p style="color: rgb(148,148,148)">活动时间:201806-23</p>
                        <p style="color: rgb(148,148,148)">{{val.time}}</p>
                        <p class="course-content"><span>{{val.activetype}}</span><span>{{val.activelevel}}</span></p>
                    </div>
                    <div class="active-rg">

                        <p style="color: rgb(1,152,255)">{{val.score}}</p>
                        <p style="color: rgb(148,148,148)">学分</p>
                    </div>
                </div>
            </mt-tab-container-item>
        </mt-tab-container>
    </div>
</template>

<script>
    import { Navbar, TabItem } from 'mint-ui';
    import request from '../../utils/request'
    import {tools} from '../../utils/tool'
    import {CONF} from "../../utils/URLConfig"
    export default {
        name: "grade-detail",
        data(){
            return {
                selected:"1",
                activepoint:0,
                authpoint:0,
                activeNum:0,
                authNum:0,
                actData:[],
                autData:[]
            }
        },
        methods:{
        },
        created(){
          request.get( CONF.url.studentDetail + `?id=${this.$route.params.user}`).then((res)=>{
                // console.log(res)
              this.activepoint = res.data.head.activepoint;
              this.authpoint = res.data.head.authpoint;
              let actData = res.data.activelist;
              let autData = res.data.authlist;
              console.log(actData.length);
              this.actData = actData;
              this.autData = autData
              this.activeNum = actData.length;
              this.authNum = autData.length;
          })
        }
    }
</script>

<style lang="scss" scoped>
  .stu-grade-detail{
    background-color: white;
      .mint-navbar{
          .mint-tab-item{
              margin-bottom: 0;
              padding: 0.33rem 0 ;
              .mint-tab-item-icon{
                  font-size: 0.34rem;
                  background: red;
              }
             .mint-tab-item-label{
                 font-size: 0.36rem;
             }
          }
      }
      .mint-tab-container-item{
          .actvite-content {
              display: flex;
              justify-content: space-between;
              border-bottom: 0.18rem solid rgb(244, 244, 244);
               .active-lf{
                   margin-left: 0.4rem;
                   .course-content {
                       span{
                           margin-right:  0.1rem;
                           padding: 0.02rem;
                           border: 0.02rem solid rgb(152, 152, 152);
                           color:  rgb(152, 152, 152);
                       }
                   }
               }
              .active-rg{
                  width: 2.3rem;
                  text-align: center;
                  padding-top: 0.5rem;
                  font-size: 0.42rem;
              }
          }
      }
  }

</style>
