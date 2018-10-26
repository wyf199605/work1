define("HelpMsg", ["require", "exports", "Button", "Modal", "BwRule"], function (require, exports, Button_1, Modal_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var HelpMsg = /** @class */ (function (_super) {
        __extends(HelpMsg, _super);
        function HelpMsg(para) {
            var _this = _super.call(this, {
                icon: 'iconfont icon-xinxi',
                className: 'help-module',
                onClick: function () {
                    if (!_this.modal) {
                        _this.modal = new Modal_1.Modal({
                            header: {
                                title: para && para.title || '帮助'
                            },
                            body: h("div", { class: "help-body" }),
                            className: 'help-modal',
                            position: G.tools.isMb ? 'full' : '',
                            footer: {}
                        });
                        _this.getBodyHtml(para);
                    }
                    else {
                        _this.modal.isShow = true;
                    }
                }
            }) || this;
            return _this;
        }
        HelpMsg.prototype.getBodyHtml = function (para) {
            var _this = this;
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.ajaxUrl.helpMsg, {
                data: {
                    helpid: para.helpId
                },
                type: 'get',
            }).then(function (_a) {
                var response = _a.response;
                console.log(response);
                _this.createHtml(response && response.data);
            });
        };
        HelpMsg.prototype.createHtml = function (data) {
            var body = this.modal.body;
            data.content = ['文字内容', '文字内容', '文字内容', '文字内容'];
            Array.isArray(data.content) && data.content.forEach(function (obj) {
                d.append(body, h("div", { class: "help-text" },
                    "$",
                    obj));
            });
            data.picture = [{ fileId: '', fileName: 'http://127.0.0.1:8080/img/dist/../img/fqa/androidDownload.png' }];
            Array.isArray(data.picture) && data.picture.forEach(function (img) {
                d.append(body, h("div", { class: "help-img" },
                    h("img", { src: img.fileName, alt: "" })));
            });
            data.voice = [{ fileId: '', fileName: '' }];
            Array.isArray(data.voice) && data.voice.forEach(function (v) {
                d.append(body, h("div", null,
                    h("audio", { src: v.fileName, controls: "controls" }, "\u4F60\u7684\u6709\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u8BE5\u97F3\u9891\u64AD\u653E")));
            });
            data.video = [{ fileId: '', fileName: '' }];
            Array.isArray(data.video) && data.video.forEach(function (v) {
                d.append(body, h("div", { class: "help-video" },
                    h("video", { src: v.fileName, controls: "controls" }, "\u4F60\u7684\u6709\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u8BE5\u89C6\u9891\u64AD\u653E")));
            });
            console.log(body);
            return body;
        };
        return HelpMsg;
    }(Button_1.Button));
    exports.HelpMsg = HelpMsg;
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
