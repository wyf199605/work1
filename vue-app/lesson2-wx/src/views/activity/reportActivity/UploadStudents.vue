<template>
    <div class="upload-students">
        <div class="upload-students-wrapper">
            <span>{{remark}}</span>
            <uploader :isGetExcelData="true" :text="'上传学生'"/>
        </div>
    </div>
</template>

<script>
import Uploader from '../../../components/uploader/uploader'
import Bus from '../../../bus'
export default {
  components: {
    Uploader
  },
  props: {
    remark: {
      type: String,
      default: ''
    }
  },
  created() {
    Bus.$on('getexceldata', val => {
      Bus.$emit('uploadstudents', val)
    })
  }
}
</script>

<style lang="scss">
.upload-students {
  padding-left: 0.4267rem;
  width: 100%;
  height: 1.3333rem;
  background-color: #ffffff;
  .upload-students-wrapper {
    width: 100%;
    height: 100%;
    padding-right: 0.4267rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-bottom: 1px solid #e9e9e9;
    span {
      font-size: 0.4rem;
      color: #91a8b0;
    }
    .uploader {
      width: 2.6667rem;
      height: 0.8rem;
      background-color: #0099ff;
      border-radius: 0.0667rem;
      text-align: center;
      line-height: 0.7733rem;
      margin-left: 0.2667rem;
      span {
        color: #ffffff;
      }
    }
  }
}
</style>
