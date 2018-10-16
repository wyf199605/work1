<template>
  <div class="badge">
      {{number}}
  </div>
</template>

<script>
export default {
  props: ['number']
}
</script>

<style scoped lang="scss">
.badge {
  width: 0.5067rem;
  height: 0.4267rem;
  background-color: #f56767;
  border-radius: 0.2133rem;
  line-height: 0.4267rem;
  font-size: 0.2933rem;
  color: #ffffff;
  text-align: center;
}
</style>
