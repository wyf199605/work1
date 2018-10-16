<template>
    <div>
        <mt-button id="wxsys" type="primary" v-on:click="sys_click()">扫一扫</mt-button>
    </div>
</template>

<script>
    import wx from 'weixin-js-sdk'
    import share from '../../utils/share'

    export default {
        name: "QrCode",
        data() {
            return {}
        },
        methods: {
            sys_click() {
                share.getJSSDKAsync(window.location.href.split('#')[0]).then( ()=>{
                    wx.error(function (res) {

                        alert("出错了：" + res.errMsg );//这个地方的好处就是wx.config配置错误，会弹出窗口哪里错误，然后根据微信文档查询即可。

                    })


                    wx.scanQRCode({
                        needResult: 1,
                        scanType: ["qrCode", "barCode"],
                        success: function (res) {
                            console.log(res)
                            let result = res.resultStr;
                            alert(result);
                        },
                        fail: function (res) {
                            console.log(res)
                            alert(JSON.stringify(res));

                        }
                    })
                }


            )


            }
        }
    }
</script>

<style scoped>

</style>
