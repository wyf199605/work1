<template>
  <div class="stu-grade page">
      <div class="stu-year">
          <div>学年</div>
          <div>
              <select-text ref="selectInput" :placeholder="placeholder.type" :dataList = "dataList" @select="selectData" :default-value="defaultYear"></select-text>
          </div>
      </div>
      <div class="stu-credit">
          <span>学分</span>
          <span>:</span>
          <span>{{gredit}}学分</span>
      </div>
      <ul
          v-infinite-scroll="loadMore"
          infinite-scroll-disabled="loading"
          infinite-scroll-distance="10"
          class="stu-grade-list">
          <li v-for="(val,index) in gradeContent" @click="detailLoad(val.id)" :key="index">
             <div class="grade-content">
                   <div class="grade-icon">
                       <i class="sec seclesson-ziyuan"></i>
                   </div>
                   <div>
                       <p>
                           <span>{{val.title}}</span>
                           <span style="color: rgb(148,148,148)">(最底学分{{val.minpoint}})</span>
                       </p>
                       <p style="color: rgb(148,148,148)">
                           已获得学分: {{val.score}}
                       </p>
                   </div>
             </div>
              <div class="grade-right-content">
                  <i class="sec seclesson-youjiantou"></i>
              </div>
          </li>
      </ul>
  </div>
</template>

<script>
    import selectText from '../../components/selectText/selectText'
    import request from '../../utils/request'
    import {CONF} from "../../utils/URLConfig"
    export default {
        name: "grade",
        components:{
            selectText
        },
        data(){
            return {
               visible:true,
                gredit:0,
                defaultYear :"",
                yearTag:"",
                placeholder:{
                  type:"学年"
                },
                dataList:[

                ],
                list:[
                    1,2
                ],
                gradeContent:[
                    {
                        course:"思想政治素养",
                        minCredit:0.5,
                        getGredit:5,
                        id:0
                    },

                    ]
            }
        },
        methods:{
            loadMore() {
                this.loading = true;
                setTimeout(() => {

                    this.loading = false;
                }, 2500);
            },
            selectData(data){
                // console.log(data)
                let year  = parseInt(data.value);
                request.get( CONF.url.studentScore +`?school_year=${year}`).then((res)=>{
                    let list = res.data.list;
                    this.gredit = res.data.head.score;
                    this.gradeContent = []
                    list.forEach((res)=>{
                        // console.log(res);
                        this.gradeContent.push(res)
                    })

                }).catch((e)=>{
                     alert(e)
                })
            },
            detailLoad(index){
                if(index){
                    this.$router.push({ path:`/stu-gradeDetail/${index}` })
                }
            }
        },
        created(){
            request.get(CONF.url.studentGrade).then((res)=>{
                let data = res.data.list,
                    defaultY = res.data.default;
                data.forEach((val)=>{
                    this.dataList.push(val.SCHOOL_YEAR_NAME)
                    if(val.SCHOOL_YEAR === defaultY){
                        this.$refs.selectInput.value = val.SCHOOL_YEAR_NAME;
                        this.yearTag = val.SCHOOL_YEAR_NAME;
                    }

                })


            }).catch((e)=>{
                console.log(e);
            })
            request.get(CONF.url.studentScore + `?school_year=${this.yearTag}`).then((res)=>{

                let list = res.data.list;
                this.gredit = res.data.head.score;
                this.gradeContent = []
                list.forEach((res)=>{
                    // console.log(res);
                    this.gradeContent.push(res)
                })

            }).catch((e)=>{

            })
        }
    }
</script>

<style lang="scss" scoped>
      .stu-grade{
          background-color: white;
          .stu-year{
              display: flex;
              justify-content: space-between;
              padding: 0.3rem 0.3rem;
              border-bottom: 0.001rem solid rgb(202, 202, 202);
              font-size: 0.45rem;
              color: rgb(117, 117, 117);
          }
          .stu-credit{
              border-top: 0.1rem solid rgb(248,248,248);
              padding: 0.34rem;
              border-bottom: 0.001rem solid rgb(239, 239, 239);
              color: rgb(28,162,254);
              font-size: 0.40rem;
          }
          .stu-grade-list {
              list-style: none;
              padding-left:  0.34rem;
              margin-top: 0;
              li {
                  display: flex;
                  justify-content: space-between;
                  .grade-content{
                      display: flex;
                       div{
                           margin-right: 0.34rem;
                       }
                      .grade-icon{
                          line-height: 2.5;
                      }
                  }
                  .grade-right-content{
                      line-height: 4;
                      margin-right: 0.34rem;
                      color: rgb(148,148,148);
                  }
                  border-bottom: 0.001rem solid rgb(239, 239, 239);;
              }
          }
      }
</style>
