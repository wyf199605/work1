/// <amd-module name="FqaModal"/>
define("FqaModal", ["require", "exports", "Modal", "Panel"], function (require, exports, Modal_1, Panel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var FqaModal = /** @class */ (function () {
        function FqaModal(para) {
            var body = h("div", { className: "fqa-content" });
            FqaModal.initPanel(body);
            this.modal = new Modal_1.Modal({
                container: para.container,
                header: '常见问题',
                body: body,
                isShow: true,
                position: tools.isMb ? 'full' : '',
                width: '730px',
                className: 'fqa-modal',
                isOnceDestroy: true,
            });
        }
        // get isShow(){
        //     return this.modal.isShow;
        // }
        // set isShow(isShow: boolean){
        //     this.modal.isShow = isShow;
        // }
        FqaModal.initPanel = function (el) {
            var panel = new Panel_1.Panel({
                container: el,
                isOpenFirst: false,
                panelItems: [
                    {
                        title: '手机如何下载蓝鲸后台？',
                        content: FqaModal.initDownloadTap(),
                    },
                    {
                        title: '如何安装？',
                        content: FqaModal.initInstallTap(),
                    },
                    {
                        title: '如何正确注册手机号码及遇到问题该如何处理？',
                        content: FqaModal.initRegisterTap(),
                    },
                    {
                        title: '如何正确登录蓝鲸后台？',
                        content: FqaModal.initLoginTap(),
                    },
                    {
                        title: '遇到手机/手机号码更换导致登录失败？',
                        content: FqaModal.initLoginErrorTap(),
                    }
                ],
                onChange: function (data) {
                    var item = data.item, wrapper = item.wrapper;
                    if (item.selected) {
                        d.queryAll('img[data-src]', wrapper).forEach(function (img) {
                            img.src = img.dataset['src'];
                            img.removeAttribute('data-src');
                        });
                    }
                }
            });
            d.on(d.query('a[data-href]', panel.wrapper), 'click', function () {
                var url = this.dataset["href"];
                if (url) {
                    BW.sys.window.open({ url: url, isDownLoad: true });
                }
            });
        };
        FqaModal.initDownloadTap = function () {
            // sys.window.open({ url: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale'});
            return h("div", null,
                h("p", null,
                    "\u6253\u5F00\u94FE\u63A5",
                    h("a", { "data-href": "http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale" }, "http://a.app.qq.com/o/simple.jsp?pkgname=com.sanfu.blue.whale"),
                    ", \u4E3A\u4E86\u65B9\u4FBF\u7528\u6237\u4E0B\u8F7D\uFF0C\u8FD9\u91CC\u4E5F\u63D0\u4F9B\u4E00\u4E2A\u4E8C\u7EF4\u7801\uFF0C\u4F7F\u7528\u624B\u673A\u6D4F\u89C8\u5668\u6216\u8005\u82F9\u679C\u76F8\u673A\uFF08\u4E5F\u53EF\u4EE5\u4F7F\u7528qq\u6216\u8005\u5FAE\u4FE1\u626B\u4E00\u626B\u529F\u80FD\uFF09\uFF0C \u90FD\u80FD\u626B\u7801\u4E0B\u8F7D\uFF0C\u4E8C\u7EF4\u7801\u5982\u56FE\uFF1A"),
                h("img", { className: "qrcode", src: "", "data-src": FqaModal.initUrl("../img/fqa/qrcode.png"), alt: "\u4E0B\u8F7D\u4E8C\u7EF4\u7801" }),
                h("p", null, "\u5982\u679C\u662F\u5B89\u5353\u624B\u673A\uFF0C\u754C\u9762\u5982\u56FE\u6240\u793A\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/androidDownload.png"), alt: "\u5B89\u5353\u4E0B\u8F7D\u9875\u9762" }),
                h("p", null,
                    "\u8BF7\u70B9\u51FB",
                    h("span", { className: "bold" }, "\u666E\u901A\u4E0B\u8F7D"),
                    ",\u5982\u679C\u70B9\u51FB\u5B89\u5168\u4E0B\u8F7D\uFF0C\u4F1A\u4E0B\u8F7D\u5E94\u7528\u5B9D\uFF08\u4E0D\u662F\u6211\u4EEC\u60F3\u8981\u7684\uFF09\u3002"),
                h("p", null, "\u5982\u679C\u662F\u82F9\u679C\u624B\u673A\uFF0C\u754C\u9762\u5982\u56FE\u6240\u793A:"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/IOSDownload.png"), alt: "\u82F9\u679C\u4E0B\u8F7D\u9875\u9762" }),
                h("p", null, "\u4F1A\u81EA\u52A8\u8DF3\u8F6C\u5230\u82F9\u679C\u5546\u5E97\uFF0C\u8BF7\u76F4\u63A5\u70B9\u51FB\u4E0B\u8F7D\u3002"));
        };
        FqaModal.initInstallTap = function () {
            return h("div", null,
                h("p", null, "\u82F9\u679C\u624B\u673A\u5728\u82F9\u679C\u5546\u5E97\u4E0B\u8F7D\uFF0C\u4E0B\u8F7D\u5B8C\u6210\u540E\u4F1A\u81EA\u52A8\u5B89\u88C5\uFF08\u82F9\u679C\u4EC5\u652F\u63019.0\u53CA\u4EE5\u4E0A\u7CFB\u7EDF\uFF0C\u5982\u679C\u4F4E\u4E8E9.0\u5C06\u65E0\u6CD5\u5B89\u88C5\uFF09\u5982\u56FE\u6240\u793A\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/IOSDownloadError.png"), alt: "\u82F9\u679C\u624B\u673A\u4E0B\u8F7D\u5931\u8D25" }),
                h("p", null, "\u73B0\u5728\u4E3B\u8981\u8BB2\u89E3\u4E0B\u5B89\u5353\u624B\u673A\u7684\u5B89\u88C5\u6B65\u9AA4\uFF0C\u4E0B\u8F7D\u6210\u529F\u540E\uFF0C\u4F1A\u5F39\u51FA\u7C7B\u4F3C\u56FE3\u6240\u793A\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/androidDownloadSuccess.png"), alt: "\u5B89\u5353\u624B\u673A\u4E0B\u8F7D\u6210\u529F" }),
                h("p", null, "\u8BF7\u70B9\u51FB\u201C\u4EC5\u5141\u8BB8\u672C\u6B21\u5B89\u88C5\u201D\uFF0C\u4F1A\u8FDB\u5165\u5F00\u59CB\u5B89\u88C5\u754C\u9762\uFF0C\u8FD9\u65F6\u5019\u63D0\u793A\u8BE5app\u9700\u8981\u7684\u6743\u9650\uFF0C\u8BF7\u70B9\u51FB\u4FE1\u4EFB\u6216\u8005\u9ED8\u8BA4\u60C5\u51B5\u4E0B\u70B9\u51FB\u4E0B\u4E00\u6B65\u6216\u8005\u5B89\u88C5\uFF0C\u5F00\u59CB\u7B49\u5F85\u5B89\u88C5\u7ED3\u675F\u3002\u5982\u56FE\u6240\u793A\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/androidInstallSuccess.png"), alt: "\u5B89\u5353\u624B\u673A\u5B89\u88C5\u6210\u529F" }),
                h("p", null, "\u5176\u5B83\u724C\u5B50\u624B\u673A\uFF0C\u5982oppo\uFF0Cvivo\u8FD9\u4E24\u6B3E\u624B\u673A\uFF0C\u4ED6\u4EEC\u5728\u5B89\u88C5\u7684\u65F6\u5019\u53EF\u80FD\u9700\u8981\u5148\u9A8C\u8BC1\u8EAB\u4EFD\uFF0C\u5982\u56FE\u6240\u793A\uFF0C\u8BF7\u6309\u7167\u624B\u673A\u7684\u65B9\u6CD5\u8F93\u5165\u8D26\u53F7\u5BF9\u5E94\u7684\u5BC6\u7801\uFF0C\u6216\u8005\u53BB\u6743\u9650\u91CC\u9762\u8BB2\u6307\u7EB9\u529F\u80FD\u7528\u4E8E\u5B89\u88C5\u9009\u9879\u6253\u5F00\uFF0C\u5982\u56FE\u6240\u793A\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/androidVerify.png"), alt: "\u5B89\u5353\u624B\u673A\u9A8C\u8BC1\u8EAB\u4EFD" }));
        };
        FqaModal.initRegisterTap = function () {
            return h("div", null,
                h("p", null, "\u5B89\u88C5\u6210\u529F\u540E\uFF0C\u6253\u5F00\u84DD\u9CB8\u540E\u53F0app\uFF0C\u6B63\u5E38\u60C5\u51B5\u4E0B\u4F1A\u51FA\u73B0\u5982\u56FE\u6240\u793A\u754C\u9762\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/register.png"), alt: "\u6CE8\u518C\u9875\u9762" }),
                h("p", null, "\u5982\u679C\u51FA\u73B0\u56FE5\u6240\u793A\uFF0C\u8BF7\u8F93\u5165\u718A\u732B\u540E\u53F0\u7684\u624B\u673A\u53F7\u7801\u548C\u9A8C\u8BC1\u7801\uFF0C\u5982\u679C\u624B\u673A\u53F7\u7801\u548C\u718A\u732B\u91CC\u9762\u7684\u53F7\u7801\u4E0D\u5339\u914D\uFF0C\u5C06\u4F1A\u51FA\u73B0\u5982\u56FE7\u6240\u793A\uFF0C\u51FA\u73B0\u8FD9\u79CD\u60C5\u51B5\uFF0C\u8BF7\u81EA\u884C\u53BBbpm\u66F4\u6539\u624B\u673A\u53F7\u7801\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/registerError.png"), alt: "\u6CE8\u518C\u5931\u8D25" }),
                h("p", null, "\u5982\u679C\u70B9\u51FB\u83B7\u53D6\u9A8C\u8BC1\u7801\u51FA\u73B0\u624B\u673A\u53F7\u683C\u5F0F\u6709\u8BEF\uFF0C\u5982\u56FE\u6240\u793A\uFF0C\u8BF7\u8054\u7CFBQQ\uFF1A1726015841"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/telError.png"), alt: "\u624B\u673A\u53F7\u7801\u9519\u8BEF" }),
                h("p", null, "\u5982\u679C\u70B9\u51FB\u6CE8\u518C\u7684\u65F6\u5019\u63D0\u793A\u201C\u9A8C\u8BC1\u7801\u6709\u8BEF\u6216\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u9A8C\u8BC1\u7801\u201D\u3002\u5982\u56FE\u6240\u793A\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\uFF0C\u83B7\u53D6\u6210\u529F\u8F93\u5165\u70B9\u51FB\u6CE8\u518C\u6309\u94AE\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/checkCodeError.png"), alt: "\u9A8C\u8BC1\u7801\u9519\u8BEF" }),
                h("p", null, "\u5982\u679C\u70B9\u51FB\u6CE8\u518C\u63D0\u793A\u201C\u8BBE\u5907\u6CE8\u518C\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\u201D\uFF0C\u5982\u56FE\u6240\u793A\u3002\u8BF7\u70B9\u51FB\u524D\u5F80\u89E3\u7ED1\u6309\u94AE\uFF0C\u7136\u540E\u70B9\u51FB\u89E3\u7ED1\uFF0C\u6210\u529F\u540E\u8FD4\u56DE\u70B9\u51FB\u6CE8\u518C\u6309\u94AE\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/registerCountError.png"), alt: "\u6CE8\u518C\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650" }),
                h("p", null, "\u5982\u679C\u70B9\u51FB\u6CE8\u518C\u63D0\u793A\u201C\u8BBE\u5907\u6CE8\u518C\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\u201D\uFF0C\u5982\u56FE\u6240\u793A\u3002\u8BF7\u70B9\u51FB\u524D\u5F80\u89E3\u7ED1\u6309\u94AE\uFF0C\u7136\u540E\u70B9\u51FB\u89E3\u7ED1\uFF0C\u6210\u529F\u540E\u8FD4\u56DE\u70B9\u51FB\u6CE8\u518C\u6309\u94AE\u3002"));
        };
        FqaModal.initLoginTap = function () {
            return h("div", null,
                h("p", null, "\u6CE8\u518C\u6210\u529F\u540E\uFF0C\u4F1A\u8FDB\u5165\u767B\u5F55\u754C\u9762\uFF0C\u5982\u56FE\u6240\u793A\uFF0C\u5728\u6CE8\u518C\u754C\u9762\u67094\u79CD\u767B\u5F55\u65B9\u5F0F\uFF0C\u5206\u522B\u662F\u5E10\u53F7\u5BC6\u7801\u767B\u5F55\uFF0C\u6307\u7EB9\u767B\u5F55\uFF0C\u5FAE\u4FE1\u767B\u5F55,\u77ED\u4FE1\u9A8C\u8BC1\u7801\u767B\u5F55\u3002\u4E0B\u9762\u5206\u522B\u4ECB\u7ECD\u4E0B\u8FD9\u4E09\u79CD\u767B\u5F55\uFF1A"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/login.png"), alt: "" }),
                h("p", null, "1.\u5E10\u53F7\u5BC6\u7801\u767B\u5F55\uFF1A\u5E10\u53F7\u4E3A\u5458\u5DE5\u53F7\uFF0C\u5BC6\u7801\u9700\u8981\u8054\u7CFBQQ\uFF1A2276799304\uFF0C\u91CD\u7F6E\u6216\u8BE2\u95EE\u76F8\u5173\u5BC6\u7801\u4E8B\u9879\u3002 \u5982\u679C\u5728\u8BE5\u8BBE\u5907\u4E0A\u767B\u5F55\u4E0D\u5C5E\u4E8E\u81EA\u5DF1\u7684\u5458\u5DE5\u53F7\uFF0C\u4F1A\u63D0\u793A\u5982\u56FE\u4FE1\u606F"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/login2.png"), alt: "" }),
                h("p", null, "2.\u6307\u7EB9\u767B\u5F55\uFF1A\u6307\u7EB9\u767B\u5F55\u9700\u8981\u624B\u673A\u8BBE\u5907\u4E0A\u6709\u6307\u7EB9\u8BC6\u522B\u529F\u80FD\uFF0C\u5E76\u4E14\u5728\u6307\u7EB9\u767B\u5F55\u7684\u65F6\u5019\u9A8C\u8BC1\u901A\u8FC7\u624D\u80FD\u767B\u5F55\u3002"),
                h("p", null, "3.\u5FAE\u4FE1\u767B\u5F55\uFF1A\u4F7F\u7528\u5FAE\u4FE1\u767B\u5F55\u7684\u65F6\u5019\u9700\u8981\u672C\u673A\u7684\u5FAE\u4FE1\u767B\u5F55\u548C\u718A\u732B\u5FAE\u4FE1\u540E\u53F0\u7684\u5FAE\u4FE1\u4E00\u76F4\u624D\u80FD\u767B\u5F55\uFF0C\u5426\u5219\u4F1A\u51FA\u73B0\u5982\u56FE12\u6240\u793A\uFF0C\u5982\u679C\u51FA\u73B0\u8BE5\u95EE\u9898\uFF0C\u8BF7\u5728\u624B\u673A\u4E0A\u767B\u5F55\u718A\u732B\u540E\u53F0\u7ED1\u5B9A\u7684\u5FAE\u4FE1\uFF0C\u6216\u8005\u5728\u718A\u732B\u91CC\u9762\u7684\u5FAE\u4FE1\u8D26\u53F7\u4FEE\u6539\u4E3A\u5F53\u524D\u767B\u5F55\u7684\u5E10\u53F7\uFF08\u6B63\u786E\u7684\u5E10\u53F7\u80FD\u591F\u6536\u5230\u6BCF\u4E2A\u5B63\u5EA6\u7684\u4F18\u60E0\u5238\uFF09\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/login3.png"), alt: "" }),
                h("p", null, "4.\u77ED\u4FE1\u9A8C\u8BC1\u7801\u767B\u5F55\uFF1A\u8F93\u5165\u6CE8\u518C\u8BE5\u8BBE\u5907\u7684\u624B\u673A\u53F7\u7801\uFF0C\u70B9\u51FB\u83B7\u53D6\u77ED\u4FE1\u9A8C\u8BC1\u7801\uFF0C\u9A8C\u8BC1\u7801\u65F6\u6548\u60271\u5206\u949F\uFF0C\u5426\u5219\u9700\u8981\u91CD\u65B0\u83B7\u53D6\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/login4.png"), alt: "" }));
        };
        FqaModal.initLoginErrorTap = function () {
            return h("div", null,
                h("p", null, "1.\u66F4\u6362\u624B\u673A"),
                h("p", null, "\u5728\u65B0\u624B\u673A\u4E0A\uFF0C\u7528\u539F\u5148\u624B\u673A\u53F7\u7801\u6CE8\u518C\uFF0C\u7136\u540E\u4F1A\u63D0\u793A\u524D\u5F80\u89E3\u7ED1\uFF0C\u7136\u540E\u70B9\u51FB\u89E3\u7ED1\uFF0C\u518D\u70B9\u6CE8\u518C\u3002"),
                h("img", { src: "", "data-src": FqaModal.initUrl("../img/fqa/loginError.png"), alt: "" }),
                h("p", null, "2.\u66F4\u6362\u624B\u673A\u53F7\u7801"),
                h("p", null, "\u4F8B\u5982\uFF1A\u65E7\u53F7\u78011500000000---->\u65B0\u53F7\u78011800000000\uFF1B"),
                h("p", null, "\u5148\u75281500000000\u5728\u5176\u4ED6\u672A\u6CE8\u518C\u8FC7\u7684\u624B\u673A\u4E0A\u70B9\u51FB\u6CE8\u518C\uFF0C\u7136\u540E\u524D\u5F80\u89E3\u7ED1\uFF0C\u89E3\u7ED1\u540E\u5C31\u4E0D\u8981\u5728\u70B9\u51FB\u6CE8\u518C\u4E86\u3002"),
                h("p", null, "\u9700\u8981\u627E\u4EBA\u4E8B\u66F4\u6539\u624B\u673A\u53F7\u7801\u4E3A1800000000\uFF0C\u7136\u540E\u624D\u80FD\u75281800000000\u53BB\u6CE8\u518C\u3002"));
        };
        FqaModal.initUrl = function (url) {
            return G.requireBaseUrl + url;
        };
        return FqaModal;
    }());
    exports.FqaModal = FqaModal;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
