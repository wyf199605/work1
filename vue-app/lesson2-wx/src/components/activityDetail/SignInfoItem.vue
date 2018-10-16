<template>
    <div class="sign-info-item">
        <div class="sign-info-normal">
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">签到类型&nbsp;:</div>
                <div class="sign-info-content">{{getSignType()}}</div>
            </div>
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">签到方式&nbsp;:</div>
                <div class="sign-info-content">{{signModeArr[signInfoData[4]]}}</div>
            </div>
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">签到时间&nbsp;:</div>
                <div class="sign-info-content">{{signInfoData[5]}}</div>
            </div>
        </div>
        <div class="signed-supplement-info">
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">是否补签&nbsp;:</div>
                <div class="sign-info-content">{{supplementArr[signInfoData[6]]}}</div>
            </div>
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">补签时间&nbsp;:</div>
                <div class="sign-info-content">{{signInfoData[7] ? signInfoData[7] : '无'}}</div>
            </div>
            <div class="sign-info-item-wrapper">
                <div class="sign-info-title">补签原因&nbsp;:</div>
                <div class="sign-info-content">{{signInfoData[8] ? signInfoData[8] : '无'}}</div>
            </div>
        </div>
    </div>
</template>

<script>
import tools from '../../utils/tool'
export default {
  data() {
    return {
      signTypeArr: ['签到', '签退'],
      signModeArr: ['人脸识别', '签到二维码'],
      supplementArr: ['否', '是']
    }
  },
  props: {
    signInfoData: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  methods:{
      getSignType(){
          let chineseNum = tools.getChineseNum(this.signInfoData[3]) + '次',typeStr = this.signTypeArr[Number(this.signInfoData[2])]
          return chineseNum + typeStr
      }
  }
}
</script>

<style lang="scss" scoped>
.sign-info-item {
  padding: 0 0.4267rem;
  background-color: #ffffff;
  margin-bottom: 0.1333rem;
  .sign-info-normal,
  .signed-supplement-info {
    padding: 0.4rem 0;
  }
  .sign-info-normal {
    border-bottom: 0.0133rem solid #e9e9e9;
  }
  .sign-info-item-wrapper {
    line-height: 0.96rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.4267rem;
    color: #33484f;
  }
  .sign-info-title {
    color: #94a8af;
  }
}
</style>
