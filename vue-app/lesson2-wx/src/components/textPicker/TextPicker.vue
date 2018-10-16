<template>
    <div class="text-picker">
        <div class="top">
            <span class="cancel" @click="cancel">取消</span>
            <span class="title">{{title}}</span>
            <span class="confirm" @click="confirm">确认</span>
        </div>
        <ul>
            <li v-for="(item,index) in slots" :key="index" :class="selectIndex === index ? 'active' : ''" @click="clickItem(item,index)">
                {{item[1]}}
            </li>
        </ul>
    </div>
</template>

<script>
import { Picker } from 'mint-ui'
export default {
  data() {
    return {
      slots: this.pickerData,
      selectIndex: -1,
      selectItem:[]
    }
  },
  props: {
    pickerData: {
      type: Array,
      default: function() {
        return []
      }
    },
    title:{
        type:String,
        default:''
    }
  },
  watch: {
    pickerData(newVal) {
      this.slots = newVal
    }
  },
  methods: {
    clickItem(item, index) {
      this.selectIndex = index
      this.selectItem = item
    },
    cancel() {
        this.$emit('textPickerCancel')
    },
    confirm() {
        this.$emit('textPickerConfirm',this.selectItem)
    }
  }
}
</script>

<style lang="scss" scoped>
.text-picker {
  width: 100%;
  background-color: #ffffff;
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  ul {
    max-height: 5.3333rem;
    overflow: auto;
    min-width: 2.6667rem;
  }
  li {
    height: 1.0667rem;
    margin: 0.1333rem 0;
    width: 100%;
    background-color: #ffffff;
    font-size: 0.4rem;
    color: #91a8b0;
    padding-left: 0.4267rem;
    line-height: 1.0667rem;
  }
  li.active {
    background-color: #f2f2f2;
    color: #33484f;
  }
  .top {
    height: 1.3333rem;
    width: 100%;
    font-size: 0.4rem;
    color: #33484f;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.4267rem;
    border-bottom: 1px solid #e9e9e9;
    .title {
      font-size: 0.4267rem;
      font-weight: bold;
    }
    .confirm {
      color: #0099ff;
    }
  }
}
</style>
