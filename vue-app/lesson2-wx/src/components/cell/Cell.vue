<template>
  <router-link class="cell" :to="link">
    <div class="cell-wrapper">
      <div class="left-content">
        <slot name="cell-title"></slot>
        <slot name="cell-content"></slot>
      </div>
      <i class="sec seclesson-youjiantou"></i>
    </div>
  </router-link>
</template>

<script>
import Badge from './Badge'
export default {
  data() {
    return {}
  },
  components: {
    Badge
  },
  props: {
    link: {
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.cell {
  background-color: #ffffff;
  display: block;
  width: 100%;
  text-decoration: none;
  padding-left: 0.4267rem;
  .cell-wrapper {
    border-bottom: 0.0133rem solid #e9e9e9;
    display: flex;
    align-items: center;
    min-height: 1.3333rem;
    position: relative;
    justify-content: space-between;
    padding-right: 0.4267rem;
    .left-content {
      display: flex;
      align-items: center;
    }
  }
  i {
    position: relative;
    font-size: 0.4rem;
    width: 0.4rem;
    height: 0.56rem;
    color: #91a8b0;
  }
  i::before {
    position: absolute;
    top: 0;
    left: 0;
    line-height: 0.56rem;
  }
}
</style>
