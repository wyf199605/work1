/// <amd-module name="RegisterMbPage"/>
define("RegisterMbPage", ["require", "exports", "Button", "RegPage"], function (require, exports, Button_1, register_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var RegisterMbPage = /** @class */ (function (_super) {
        __extends(RegisterMbPage, _super);
        function RegisterMbPage(para) {
            var _this = this;
            var header = h("header", { className: "register-header mui-bar mui-bar-nav ios-top" },
                h("a", { id: "goLogin", className: "mui-icon mui-pull-left mui-icon-left-nav" }));
            var body = h("div", { className: "register-content mui-content" },
                h("div", { className: "register-title" }, "\u8D26\u53F7\u6CE8\u518C"),
                h("form", { className: "register-form" },
                    h("div", { className: "form-group" },
                        h("input", { id: "tel", type: "text", placeholder: "\u8F93\u5165\u624B\u673A\u53F7\u7801" })),
                    h("div", { className: "form-group" },
                        h("input", { id: "verifyCodeInput", type: "text", maxlength: "5", placeholder: "\u8F93\u5165\u9A8C\u8BC1\u7801" }),
                        h("div", { className: "more-group" },
                            h("canvas", { width: "80", height: "30" }, "\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301canvas\uFF0C\u8BF7\u7528\u5176\u4ED6\u6D4F\u89C8\u5668\u6253\u5F00\u3002"))),
                    h("div", { className: "form-group" },
                        h("input", { id: "verify", type: "text", placeholder: "\u8F93\u5165\u77ED\u4FE1\u9A8C\u8BC1\u7801" }),
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
            var checkCodeBtn = new Button_1.Button({
                container: d.queryAll('.more-group', body)[1],
                content: '获取验证码',
                className: 'check-code',
            });
            d.append(para.container, header);
            d.append(para.container, body);
            // this.renderCheckCode(d.query('.more-group>canvas', body));
            // d.on(d.query('.more-group>canvas', body), 'click', () => {
            //     console.log(this.renderCheckCode(d.query('.more-group>canvas', body)));
            //
            // })
            _this = _super.call(this, {
                goLogin: d.query('#goLogin', header),
                saveReg: registerBtn.wrapper,
                tel: d.query('#tel', body),
                verifyELCodeInput: d.query('#verifyCodeInput', body),
                verifyELCode: d.query('.more-group>canvas', body),
                sendVerify: checkCodeBtn.wrapper,
                smsCheckCode: d.query('#verify', body),
            }) || this;
            return _this;
        }
        return RegisterMbPage;
    }(register_1.RegPage));
    exports.RegisterMbPage = RegisterMbPage;
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
