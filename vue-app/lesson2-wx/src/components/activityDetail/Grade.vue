<template>
    <div class="grade">
        <div class="grade-content">
            <div class="grade-content-wrapper">
                <div class="grade-item"><div class="grade-title">姓名&nbsp;:</div><div class="grade-info">{{gradeData[1]}}</div></div>
                <div class="grade-item"><div class="grade-title">学号&nbsp;:</div><div class="grade-info">{{gradeData[0]}}</div></div>
                <div class="grade-item"><div class="grade-title">角色&nbsp;:</div><div class="grade-info">{{gradeData[3]}}</div></div>
            </div>
            <div class="grade-content-wrapper">
                <div class="grade-item"><div class="grade-title">性别&nbsp;:</div><div class="grade-info">{{gradeData[2]}}</div></div>
                <div class="grade-item"><div class="grade-title">签到次数&nbsp;:</div><div class="grade-info">{{gradeData[4]}}</div></div>
                <div class="grade-item"><div class="grade-title">积分&nbsp;:</div><div class="grade-info">{{gradeData[5]}}</div></div>
            </div>
        </div>
        <div class="btns">
                <div @click="signInfo(gradeData[0])" class="grade-signinfo-btn">
                    签到记录
                </div>
        </div>
    </div>
</template>

<script>
import store from '../../store'
export default {
  name: 'grade',
  data() {
    return {}
  },
  props: {
    gradeData: {
      type: Array,
      default: function() {
        return []
      }
    },
    activityid: ''
  },
  methods: {
    signInfo(studentId) {
      this.$router.push({
        path: `/signInfo/${this.gradeData[0]}?activityid=${this.activityid}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.grade {
  background: #ffffff;
  padding-left: 0.4267rem;
  padding-right: 0.4267rem;
  .grade-content {
    border-bottom: 0.0133rem solid #e9e9e9;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5333rem 0;
    .grade-content-wrapper {
      width: 50%;
      display: flex;
      flex-direction: column;
      .grade-item {
        line-height: 0.96rem;
        display: flex;
        font-size: 0.4rem;
        color: #33484f;
        .grade-title {
          color: #91a8b0;
          margin-right: 0.2667rem;
        }
      }
    }
  }
  .btns {
    display: flex;
    padding: 0.4rem 0.4267rem 0.4rem 0;
    display: flex;
    justify-content: flex-end;
    .grade-signinfo-btn {
      width: 2rem;
      height: 0.8rem;
      background-color: #ffffff;
      border-radius: 0.0667rem;
      border: solid 0.0133rem #0099ff;
      font-size: 0.3733rem;
      color: #0099ff;
      text-align: center;
      line-height: 0.7733rem;
    }
  }
}
</style>
