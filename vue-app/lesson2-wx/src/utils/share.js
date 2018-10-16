import wxmp from '../api/auth'
import wx from 'weixin-js-sdk'

const jsApiList = ['onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareQZone','onMenuShareWeibo','checkJsApi', 'scanQRCode'];

export default {
    // 获取JSSDK
    getJSSDK(_url) {
        wxmp.jssdk({url: _url}).then(res => {
            const wxconfig = {
                debug: false,
                appId: res.data.appId,
                timestamp: res.data.timestamp,
                nonceStr: res.data.nonceStr,
                signature: res.data.signature,
                jsApiList: jsApiList
            }
            // 配置微信
            wx.config(wxconfig)
        })
    },
    getJSSDKAsync(_url) {
        return new Promise((resolve) => {
            wxmp.jssdk({url: _url}).then(res => {
                const wxconfig = {
                    debug: false,
                    appId: res.data.appId,
                    timestamp: res.data.timestamp,
                    nonceStr: res.data.nonceStr,
                    signature: res.data.signature,
                    jsApiList: jsApiList
                }
                // 配置微信
                wx.config(wxconfig)
                resolve()
            })
        })
    },
    setWxShare({title, desc, link, imgUrl}) {
        wx.error((err) => {
            console.log(err)
        })
        wx.ready(() => {
            wx.checkJsApi({
                jsApiList: jsApiList
            });
            wx.onMenuShareWeibo({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                success() {
                    // console.log('分享App成功')
                },
                cancel() {

                }
            });
            wx.onMenuShareQQ({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                success() {
                    // console.log('分享App成功')
                },
                cancel() {

                }
            });
            wx.onMenuShareQZone({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                success() {
                    // console.log('分享App成功')
                },
                cancel() {

                }
            });
            // 分享给朋友
            wx.onMenuShareAppMessage({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                success() {
                    // console.log('分享App成功')
                },
                cancel() {

                }
            });
            // 分享到朋友圈
            wx.onMenuShareTimeline({
                // 分享标题
                title: title,
                // 分享描述
                desc: desc,
                // 分享链接 默认以当前链接
                link: link,
                // 分享图标
                imgUrl: imgUrl,
                success() {
                    // console.log('分享朋友圈成功')
                },
                cancel() {
                }
            });
        })
    }
}
