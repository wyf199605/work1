<template>
    <transition name="modal-fade">
    <div class="modal-wrapper">
        <div class="modal-content-wrapper">
            <div class="modal-header-wrapper">
                <span class="modal-title">{{title}}</span>
            </div>
            <div class="modal-body-wrapper">
                <slot name="body"></slot>
            </div>
            <div class="modal-footer-wrapper">
                <div class="modal-btn cancel" @click="cancel">取消</div>
                <div class="modal-btn confirm" @click="confirm">确定</div>
            </div>
        </div>
    </div>
    </transition>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '提示'
    }
  },
  methods: {
    cancel() {
      this.$emit('modalCancel', '')
    },
    confirm() {
      this.$emit('modalConfirm', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-fade-enter,
.modal-fade-leave-active {
  opacity: 0;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  .modal-content-wrapper {
    width: 9.1467rem;
    background-color: #ffffff;
    min-height: 3.2rem;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    z-index: 1001;
  }
  .modal-header-wrapper {
    height: 1.3333rem;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.48rem;
    color: #34474e;
    flex-grow: 0;
  }
  .modal-body-wrapper {
    flex-grow: 1;
    width: 100%;
    padding: 0 0.4533rem;
  }
  .modal-footer-wrapper {
    height: 1.2rem;
    width: 100%;
    display: flex;
    align-items: center;
    border-top: 1px solid #e9e9e9;
    flex-grow: 0;
    .modal-btn {
      width: 50%;
      font-size: 0.48rem;
      color: #0099ff;
      line-height: 1.1733rem;
      text-align: center;
      height: 100%;
    }
    .modal-btn:nth-child(2) {
      border-left: 1px solid #e9e9e9;
    }
  }
}
</style>
