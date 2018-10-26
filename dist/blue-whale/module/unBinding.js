/// <amd-module name="UnBinding"/>
define("UnBinding", ["require", "exports", "Modal", "BwRule"], function (require, exports, Modal_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sys = BW.sys;
    var tools = G.tools;
    var CONF = BW.CONF;
    var d = G.d;
    var UnBinding = /** @class */ (function () {
        function UnBinding(data) {
            var _this = this;
            var full;
            if (sys.os !== 'pc') {
                full = 'full';
            }
            var ul = h("ul", { className: "device-view" });
            this.modal = new Modal_1.Modal({
                header: '设备管理',
                body: ul,
                position: full,
                isOnceDestroy: true
            });
            this.modal.isShow = true;
            //遍历li
            data.forEach(function (d) {
                ul.appendChild(_this.deviceTpl(d));
            });
            var self = this;
            //unbind
            d.on(ul, 'click', '.unbind', function () {
                var data = JSON.stringify([{ uuid: this.dataset.name }]);
                // Rule.ajax(CONF.ajaxUrl.unbound,{
                //     type: 'post',
                //     data: data,
                //     success : function (r) {
                //         self.modal.isShow = false;
                //         Modal.toast('解绑成功');
                //     }
                // });
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.unbound, {
                    type: 'post',
                    data: data,
                }).then(function () {
                    self.modal.isShow = false;
                    Modal_1.Modal.toast('解绑成功');
                });
            });
        }
        UnBinding.prototype.show = function () {
            this.modal.isShow = true;
        };
        UnBinding.prototype.deviceTpl = function (data) {
            return h("li", { className: "device-cell" },
                h("div", { className: "icon-box" },
                    h("span", { className: "iconfont " + (tools.isMb ? 'icon-device-mb' : 'icon-device-pc') })),
                h("div", { className: "device-name" },
                    h("div", { className: "device-modal" },
                        "\u578B\u53F7\uFF1A",
                        data.MODEL),
                    h("div", { className: "device-vendor" },
                        "\u54C1\u724C\uFF1A",
                        data.VENDOR),
                    h("div", { className: "device-time" },
                        "\u6CE8\u518C\u65F6\u95F4\uFF1A",
                        data.REGISTER_TIME)),
                h("div", { className: "btn-group" },
                    h("button", { className: "unbind", "data-name": data.UUID }, "\u89E3\u7ED1")));
        };
        return UnBinding;
    }());
    exports.UnBinding = UnBinding;
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
