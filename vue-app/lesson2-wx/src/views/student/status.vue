<template>
    <div class="stu-status page">
        <div class="life-piture" @click="clickHandler">
            <div>
                <img v-if="!!image" :src="image" alt="" class="upload-photo">
                <span v-else class="sec seclesson-xiangji1 "></span>
            </div>
            <uploader ref="upload" :acceptType="accept" @uploadFile="upload" name-field="life_photo"
                      field="LIFE_PHOTO"></uploader>
            <p>请上传生活照</p>
        </div>
        <div class="personal">
            <div class="account">
                <i class="sec seclesson-zhanghuxianxing"></i>
                <input type="text" placeholder="请输入身份证号" v-model="account">
            </div>
            <div class="password">
                <i class="sec seclesson-mimaxianxing1"></i>
                <input type="text" placeholder="请输入学号" v-model="pw">
            </div>
        </div>
        <div class="login-waring">
            <span v-if="loginISNull == 1">*** 请上传图片</span>
            <span v-else-if="loginISNull == 2">*** 请填写身份证 不能为空</span>
            <span v-else-if="loginISNull == 3">*** 请输入学号 不能为空</span>
            <span v-else-if="loginISNull == 4">*** 不能为空</span>
        </div>
        <div class="status-opera">
            <mt-button class="mt-button" type="default" size="normal" @click="cancle">取消</mt-button>
            <mt-button class="mt-button" type="primary" size="normal" @click="Verification">保存
            </mt-button>
        </div>
        <mt-actionsheet
            :actions="actions"
            v-model="sheetVisible">
        </mt-actionsheet>
    </div>
</template>

<script>
    import {Toast} from 'mint-ui';
    import tools from '../../utils/tool';
    import uploader from '../../components/uploader/uploader'
    import request from '../../utils/request'
    import {CONF} from "../../utils/URLConfig"
    import {setStuIsLogin, getOpenId} from '../../utils/setUserInfo'

    export default {
        name: "status",
        components: {
            uploader
        },
        data() {
            return {
                loginISNull:Number,
                account: "",
                pw: null,
                md5: '',
                accept: 'image/png,image/jpg,image/gif',
                actions: [{
                    name: '从相册中选择',
                    method: this.getLibrary
                }, {
                    name: '拍照',
                    method: this.getCamera
                }],
                sheetVisible: false
            }
        },
        computed: {
            image() {
                return this.md5 && tools.fileUrlGet(this.md5, 'life_photo');
            }
        },
        watch: {
            pw(){
               if(this.pw){
                   this.loginISNull = 0
               }
            },
            account(){
                if(this.account) {
                    this.loginISNull = 0
                }
            },
            md5(){
                if(this.md5){
                    this.loginISNull = 0
                }
            }

        },
        methods: {
            clickHandler() {
                this.sheetVisible = true;
            },
            upload(md5) {
                this.md5 = md5;
            },
            getLibrary() {
                this.accept = 'image/png,image/jpg,image/gif,image/jpeg';
                setTimeout(() => {
                    this.$refs.upload.selectImg();
                    this.sheetVisible = false;
                }, 100)
            },
            getCamera() {
                this.accept = 'image/*';
                setTimeout(() => {
                    this.$refs.upload.selectImg();
                    this.sheetVisible = false;
                }, 100)
            },
            Verification() {
                if(!this.md5){
                    this.loginISNull = 1
                }else if(!this.account){
                    this.loginISNull = 2
                }else if(!this.pw){
                    this.loginISNull = 3
                }else if (!this.account && !this.pw){
                    this.loginISNull = 4
                }else {
                    this.loginISNull = 0
                }
               if(!!this.md5){
                   request.post(CONF.url.studentAuthentication, [{
                       "avatar": this.md5,
                       "idcard": this.account,
                       "studentno": this.pw,
                       "openid": getOpenId()
                   }]).then((res) => {

                       // console.log(res);
                       if (res.code == 0) {
                           let instance = Toast({
                               message: res.msg,
                               iconClass: ' sec seclesson-gou1'
                           });
                           setStuIsLogin(true)
                           this.loginISNull = 0
                           setTimeout(() => {
                               instance.close();
                               this.$router.push('/stu-mine');
                           }, 580);
                       }else {
                           let instance = Toast({
                               message: res.msg,
                               iconClass: ' sec seclesson-guanbi'
                           });
                       }
                   })
               }

            },
            cancle() {
                this.$router.push('/stu-mine');
            }
        },
        created(){
          this.loginISNull = 0;
        }
    }
</script>

<style lang="scss">
    .stu-status {
        width: 100%;
        height: 100%;
        background: white;
        .life-piture {
            padding: 1.86rem 0 .86rem 0;
            margin: auto;
            .uploader {
                display: none;
            }
            div:first-child {
                text-align: center;
                border: 1px solid rgb(219, 229, 235);
                border-radius: 50%;
                width: 2.5rem;
                height: 2.5rem;
                color: rgb(219, 229, 235);
                font-size: 1.2rem;
                line-height: 1.9;
                margin: auto;
                overflow: hidden;
            }
            .upload-photo {
                height: 100%;
            }
            span {
                text-align: center;
                font-size: 0.93rem;
            }
            p {
                text-align: center;
                font-size: 0.45rem;
            }
        }
        .personal {
            .account {
                width: 7rem;
                height: 1.3rem;
                border: 1px solid rgb(219, 229, 235);
                border-radius: 3px;
                margin: auto;
                position: relative;
                padding-left: 0.2rem;
                i {
                    font-size: 0.8rem;
                    line-height: 1.5;
                }
                input {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 5.5rem;
                    height: 100%;
                    border: 0px;
                    font-size: .48rem;
                }
            }
            .password {
                width: 7rem;
                height: 1.3rem;
                border: 1px solid rgb(219, 229, 235);
                border-radius: 3px;
                border-top: 0px;
                margin: auto;
                position: relative;
                padding-left: 0.2rem;
                i {
                    font-size: 0.8rem;
                    line-height: 1.5;
                }
                input {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 5.5rem;
                    height: 100%;
                    border: 0px;
                    font-size: .48rem;
                }

            }
        }
        .status-opera {
            text-align: center;
            margin-top: 1.3rem;
            .mt-button {
                width: 4rem;
                height: 1.45rem;
                margin-right: 0.5rem;
            }
        }
        .login-waring{
            text-align: center;
            color: rgb(216,0,0);
            transition: 0.3s display linear;
        }

    }

</style>
