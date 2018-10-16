<template>
    <div class="accordion">
        <panel v-if="!!accordionData" v-for="(acItem, acIndex) in accordionData" :key="acIndex" :title="acItem.TITLE" :is-show="acIndex===0">
            <div class="panel-item-body">
                 <li v-for="(item,index) in acItem.CHILDREN" :key="index" @click="childrenClick(acItem,item)">
                    <div class="li-wrapper">
                        <span>{{item.TITLE}}</span>
                        <i v-show="selectID === item.ID" class="sec seclesson-gou1 duihao"></i>
                    </div>
                 </li>
            </div>
        </panel>
    </div>
</template>

<script>
import Panel from '../panel/Panel'
export default {
  data() {
    return {
      accordionData: this.children,
      selectID: ''
    }
  },
  components: {
    Panel
  },
  props: {
    children: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  watch: {
    children(newVal) {
      this.accordionData = newVal
    }
  },
  created() {
    this.accordionData = this.children
    this.select = this.isSelect
  },
  methods: {
    childrenClick(acItem,item) {
      this.selectID = item.ID
      this.$emit('activityClass',[acItem,item])
    }
  }
}
</script>

<style lang="scss">
.accordion {
  padding-right: 0.4267rem;
  width: 100%;
  height: auto;
  font-size: 30px;
  color: #33484f;
  .title {
    height: 100px;
    width: 100%;
    border-bottom: 1px solid #e9e9e9;
  }
  i {
    position: relative;
    font-size: 0.4rem;
    width: 0.4rem;
    height: 0.56rem;
    color: #91a8b0;
    margin-top: 0.0267rem;
  }
  i.seclesson-xiala,
  i.seclesson-youjiantou {
    color: #91a8b0 !important;
  }
  i::before {
    position: absolute;
    top: 0;
    left: 0;
    line-height: 0.56rem;
  }
  i.sec.duihao {
    color: #0099ff;
  }
  .panel-content{
      padding: 0 !important;
  }
  .slide-enter-active,
  .slide-leave-active {
    transition: font-size 0.15s ease-out, padding 0.25s ease-out,
      opacity 0.25s ease-out;
  }
  .slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
    font-size: 0;
    padding: 0;
    opacity: 0;
  }
  .panel-item-body {
    li {
      list-style: none;
      padding: 0;
      margin: 0;
      height: 1.3333rem;
      padding-left: 0.9333rem;
      .li-wrapper{
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 0.4rem;
          border-bottom: 1px solid #e9e9e9;
      }
    }
  }
}
</style>
