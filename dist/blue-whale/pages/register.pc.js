/// <amd-module name="RegisterPcPage"/>
define("RegisterPcPage", ["require", "exports", "Button", "RegPage"], function (require, exports, Button_1, register_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var RegisterPcPage = /** @class */ (function (_super) {
        __extends(RegisterPcPage, _super);
        function RegisterPcPage(para) {
            var _this = this;
            // 初始化头部logo
            var logoWrapper = h("div", { className: "logo" },
                h("img", { "data-action": "selectServer", src: G.requireBaseUrl + '../img/develop/login-logo.png', alt: "fastlion" }));
            var body = h("div", { className: "register-content mui-content" },
                h("div", { className: "register-title" }, "\u8BBE\u5907\u6CE8\u518C"),
                h("form", { className: "register-form" },
                    h("div", { className: "form-group" },
                        h("input", { id: "tel", type: "text", placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7" })),
                    h("div", { className: "form-group" },
                        h("input", { id: "verify", type: "text", placeholder: "\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801" }),
                        h("div", { className: "more-group" })),
                    h("div", { className: "btn-group" })));
            d.on(d.query('.register-form', body), 'submit', function (e) {
                e.preventDefault();
            });
            var registerBtn = new Button_1.Button({
                container: d.query('.btn-group', body),
                content: '注册',
                className: 'register-submit',
            });
            var goLogin = new Button_1.Button({
                container: d.query('.btn-group', body),
                content: '返回登录',
                className: 'goLogin'
            });
            var checkCodeBtn = new Button_1.Button({
                container: d.queryAll('.more-group', body)[0],
                content: '获取验证码',
                className: 'check-code',
            });
            // 底部
            var footer = h("div", { className: "footer" },
                h("div", { className: "login-fqa" }),
                h("div", { className: "copyright" }, "\u00A92018\u901F\u72EE\u8F6F\u4EF6\u7248\u6743\u6240\u6709"));
            var fqaBtn = new Button_1.Button({
                container: d.query('.login-fqa', footer),
                content: '常见问题',
            });
            var wrapper = h("div", { className: "register-wrapper mui-content" },
                logoWrapper,
                body,
                footer);
            d.append(para.dom, wrapper);
            para.dom.style.backgroundImage = "url(" + (G.requireBaseUrl + '../img/develop/bg.png') + ")";
            para.dom.style.backgroundRepeat = 'repeat-x';
            para.dom.style.backgroundPositionY = 'center';
            _this = _super.call(this, {
                goLogin: goLogin.wrapper,
                saveReg: registerBtn.wrapper,
                tel: d.query('#tel', body),
                sendVerify: checkCodeBtn.wrapper,
                smsCheckCode: d.query('#verify', body),
                fqaBtn: fqaBtn
            }) || this;
            return _this;
        }
        return RegisterPcPage;
    }(register_1.RegPage));
    exports.RegisterPcPage = RegisterPcPage;
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
