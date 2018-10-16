<template>
  <div class="student-item" @click="select = !select">
      <div class="student-wrapper">
          <div class="content">
              <div class="stu-num">{{studentData[0]}}</div>
              <div class="stu-name">{{studentData[1] + '(' + studentData[2] + ')'}}</div>
          </div>
          <i v-if="select" class="sec seclesson-gou1"></i>
      </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            select:false,
            studentData:this.student
        }
    },
    props:{
        student:{
            type:Array,
            default:function () {
                return []
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.student-item{
    padding-left: 0.4267rem;
    height: 1.4667rem;
    width: 100%;
    background-color: #ffffff;
    .student-wrapper{
        width: 100%;
        height: 100%;
        border-bottom: 0.0133rem solid #e9e9e9;
        font-size: 0.4rem;
        color: #33484f;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 0.4267rem;
        .content{
            display: flex;
            align-items: center;
            margin-right: 0.2667rem;
        }
        .stu-num{
            flex-grow: 0;
            flex-shrink: 0;
            margin-right: 0.2667rem;
        }
        .stu-name{
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
            overflow: hidden;
        }
        i{
            color: #0099ff;
            flex-shrink: 0;
            flex-grow: 0;
        }
    }
}
</style>
