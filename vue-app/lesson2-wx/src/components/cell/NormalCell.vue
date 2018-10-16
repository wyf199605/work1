<template>
  <router-link class="normal-cell" :to="link" >
    <div class="cell-wrapper" @click="$emit('click')">
     <div class="cell-content">
       <i v-if="icon !== ''" :class="'sec ' + icon" :style="{color:iconColor}"></i>
       <span class="text">{{text}}</span>
      </div>
      <div class="right-content">
          <span v-if="rightText !== ''">{{rightText}}</span>
          <badge v-if="number !== 0" :number="number" class="cell-badge"></badge>
          <i v-if="arrow" class="sec seclesson-youjiantou"></i>
      </div>
    </div>
  </router-link>
</template>

<script>
import Badge from './Badge'
export default {
  components: {
    Badge
  },
  props: {
    link: {
      default: ''
    },
    number: {
      default: 0
    },
    icon: {
      default: ''
    },
    text: {
      default: ''
    },
    iconColor: {
      default: '#ffffff'
    },
    arrow: {
      default: true
    },
    rightText: {
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.normal-cell {
  background-color: #ffffff;
  display: block;
  width: 100%;
  text-decoration: none;
  padding-left: 0.4267rem;
  font-size: 0.4267rem;
  .cell-wrapper {
    border-bottom: 0.0133rem solid #e9e9e9;
    padding-right: 0.4267rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 1.3333rem;
    position: relative;
    .cell-content {
      display: flex;
      align-items: center;
      flex-grow: 1;
      color: #33484f;
      i {
        margin-right: 0.5333rem;
      }
    }
  }

  .cell-badge {
    flex-shrink: 0;
    flex-grow: 0;
    padding-right: 0.0267rem;
  }
  .right-content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #33484f;
  }
  i.seclesson-youjiantou {
    position: relative;
    font-size: 0.4rem;
    // right: 0.2667rem;
    // top: calc((100% - 0.56rem) / 2);
    width: 0.4rem;
    height: 0.56rem;
    color: #91a8b0;
    margin-left: 0.2667rem;
  }
  i.seclesson-youjiantou::before {
    position: absolute;
    top: 0;
    left: 0;
    line-height: 0.56rem;
    // border: solid 2px #c8c8cd;
    // border-bottom-width: 0;
    // border-left-width: 0;
    // content: ' ';
    // top: 50%;
    // right: 20px;
    // position: absolute;
    // width: 16px;
    // height: 26px;
    // -webkit-transform: translateY(-50%) rotate(45deg);
    // transform: translateY(-50%) rotate(45deg);
  }
}
</style>
