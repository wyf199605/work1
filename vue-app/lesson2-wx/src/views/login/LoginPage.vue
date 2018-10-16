<template>
  <div class="login-page">
    <div class="login-input">
      <div class="input-group">
        <i class="iconfont seclesson-zhanghu"></i><input type="text" v-model="userid" placeholder="请输入账号">
      </div>
      <div class="input-group">
        <i class="iconfont seclesson-mima"></i><input type="password" v-model="password" placeholder="请输入密码">
      </div>
    </div>
    <div class="login-btn">
       <div class="btn bind" @click="binding">绑定</div>
       <div class="btn cancel" @click="cancel">取消</div>
    </div>
  </div>
</template>

<script>
import { MessageBox, Toast, Indicator } from 'mint-ui'
import {getOpenId} from '@/utils/setUserInfo'
import {loginByUserid, logout} from '@/api/login'
import wx from 'weixin-js-sdk'
export default {
  data() {
    return {
      userid: '',
      password: ''
    }
  },
  methods: {
    binding() {
      if (this.userid.length <= 0) {
        MessageBox('提示', '账户不能为空!')
        return
      }
      if (this.password.length <= 0) {
        MessageBox('提示', '密码不能为空!')
        return
      }
      // 登录
        let openid = getOpenId()
        loginByUserid(this.userid, this.password, openid).then(response => {
            Indicator.close()
            if (response.code === 0){
                if (response.data.isbind === true) {
                    Toast('绑定成功!')
                    this.$router.push({ path: '/activity' })
                }
            }else if(response.code === 50002){
                Toast('密码错误!')
            }else{
                Toast(response.msg)
            }

        }).catch(error => {
            Indicator.close()
            Toast('绑定失败!')
            this.$router.push({ path: '/error' })
        })
    },
    cancel() {
        wx.closeWindow();
    }
  }
}
</script>

<style lang="scss" scoped>
$border-color: #e2e2e2;
$btn-color: #3391ff;
.login-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.3333rem 0.4267rem 0;
  background-color: #ffffff;
  .login-input {
    border-radius: 0.1067rem;
    border: solid 0.0133rem $border-color;
    height: 3.2rem;
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    .input-group {
      padding-left: 0.4rem;
      padding-right: 0.4rem;
      width: 100%;
      height: 50%;
      display: flex;
      display: -webkit-flex;
      align-items: center;
      i {
        color: #333333;
        font-size: 0.5333rem;
        margin-right: 0.2667rem;
      }
      &:nth-child(2) {
        border-top: 0.0133rem solid $border-color;
      }
      input {
        font-size: 0.4rem;
        border: none;
        height: calc(100% - 0.0133rem);
        flex-grow: 1;
        &:focus {
          outline: none;
        }
      }
      input::-webkit-input-placeholder {
        color: #b0b0b0;
      }
    }
  }
  .login-btn {
    display: flex;
    align-items: center;
    margin-top: 1.0667rem;
    .btn {
      height: 1.3333rem;
      border-radius: 0.2rem;
      width: 50%;
      font-size: 0.48rem;
      line-height: 1.3333rem;
      text-align: center;
    }
    .bind {
      background-color: $btn-color;
      color: #ffffff;
    }
    .cancel {
      background-color: #ffffff;
      border: solid 0.0133rem $btn-color;
      margin-left: 0.5333rem;
      color: $btn-color;
    }
  }
}
</style>
