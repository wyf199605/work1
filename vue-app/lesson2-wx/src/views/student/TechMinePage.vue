<template>
    <div class="tech-minepage page">
        <div class="tech-head" @click="pathJump">
            <div class="head-lf">
                <img :src="headerImgUrl || 'http://placekitten.com/g/120/120'" alt="">
                <div>
                    <h4>{{nickName || '未知'}}</h4>
                    <p style=" color: rgb(148,148,148)">{{deptName}}-{{userName}}</p>
                </div>
            </div>
            <i class="sec seclesson-youjiantou"></i>
        </div>
        <div class="line-cell">
            <lineCell v-for="(cell,index) in LineData" :key="index" :text=cell.text :icon=cell.icon :number=cell.number
                      :iconColor="cell.iconColor" :link="cell.link"/>
        </div>
        <tabBar :selected="selected"></tabBar>
    </div>
</template>

<script>
import tabBar from '../../components/tabbar/Tabbar'
import lineCell from '../../components/stu/stu-LineCell'
import { getHeaderImgUrl, getNickName } from '../../utils/setUserInfo'
import request from '../../utils/request'
import {CONF} from "../../utils/URLConfig"
export default {
  name: 'TechMinePage',
  components: {
    tabBar,
    lineCell
  },
  data() {
    return {
      confirm: false,
      selected: 'mine',
      headerImgUrl: '',
      nickName: '',
        userName:'',
        deptName:'',
      LineData: [
        {
          text: '活动申报',
          icon: 'seclesson-kechenggenzong1',
          number: 0,
          iconColor: '#4ea6f1',
          link: '/reportActivity'
        },
        {
          text: '公告',
          icon: 'seclesson-tongzhi1',
          number: 0,
          iconColor: '#F6956B',
          link: '/stu-news'
        },
        {
          text: '通知',
          icon: 'seclesson-gonggao',
          number: 0,
          iconColor: '#4ea6f1',
          link: '/stu-messages'
        },
        {
          text: '切换后台',
          icon: 'seclesson-qiehuan1',
          number: 0,
          iconColor: '#41CBBB'
        }
      ]
    }
  },
  methods: {
    pathJump() {
      this.$router.push('/techPerson')
    }
  },
  created() {
    this.headerImgUrl = getHeaderImgUrl()
    this.nickName = getNickName()

      request.get(CONF.url.teachInfo).then((res)=>{
          if(res.data){
              console.log(res.data)
              let data = res.data;
              this.userName = data['user_name'];
              this.deptName = data['dept_name'];
          }
      })

  }
}
</script>

<style lang="scss" scoped>
.tech-minepage {
  background: white;
  padding-bottom: 55px;
  .tech-head {
    display: flex;
    justify-content: space-between;
    border-bottom: 0.2rem solid rgb(248, 248, 248);
    padding: 0.33rem;
    .head-lf {
      display: flex;
      align-items: center;
      img {
        border-radius: 50%;
        width: 1.6rem;
        height: 1.6rem;
      }
      div {
        height: 100%;
        margin-left: 0.34rem;
        display: flex;
        justify-content: center;
        flex-direction: column;
        h4 {
          font-size: 0.48rem;
          color: #33484f;
          margin: 0;
          padding: 0;
        }
        p {
          margin: 0;
          padding: 0;
          margin-top: 0.2667rem;
          font-size: 0.4rem;
          color: #91a8b0;
        }
      }
    }
    i {
      line-height: 5.5;
    }
  }
  .Icon-cell {
    display: flex;
    justify-content: space-around;
    text-align: center;
    border-bottom: 0.2rem solid rgb(248, 248, 248);
    padding: 0.1rem 0;
    div {
      font-size: 0.38rem;
      p:last-child {
        color: rgb(148, 148, 148);
      }
    }
    .classify-cell {
      padding: 0px;
      p:first-child {
        font-size: 0.56rem;
        margin-top: 0.2rem;
        margin-bottom: 0rem;
      }
    }
  }
}
</style>

