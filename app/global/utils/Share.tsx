/// <amd-module name="Share"/>
interface ISharePara {
    url : string,
}
interface IMenuPara {
    title : string,
    desc : string,
    link : string,
    imgUrl : string,
    type : string,
    dataUrl : string,
    success : () => void,
    cancel : () => void,
}

export class Share {
    constructor(para : ISharePara){
        this.wx().then((wx : any) => {
            G.Ajax.fetch(para.url).then((response : obj) => {
                this.config(wx, response.data);
            })
        })
    }

    private config(wx :any, webChar : obj){
        let defaultPara = {
            title : '',
            desc : '',
            link: '',
            imgUrl: '',
            type: '',
            dataUrl: '',
            success: function () {

            },
            cancel: function () {

            }
        };
        wx.config({
            debug: false,
            appId: webChar.appId,
            timestamp: webChar.timestamp,
            nonceStr: webChar.nonceStr,
            signature: webChar.signature,
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone']
        });

        wx.ready(function () {
            wx.updateAppMessageShareData({
                title: '', // 分享标题
                desc: '', // 分享描述
                link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: '', // 分享图标
                success: function () {
                    // 设置成功
                }
            });
            // wx.onMenuShareAppMessage(defaultPara);
            // wx.onMenuShareTimeline(defaultPara);
            // wx.onMenuShareQQ(defaultPara);
            // wx.onMenuShareWeibo(defaultPara);
            // wx.onMenuShareQZone(defaultPara);
        });

        wx.error(function (res) {});
    }

    private wx(){
        return new Promise((resolve => {
            return require(['weixin'], (wx) => {
                resolve(wx);
            });
        }));
    }
}