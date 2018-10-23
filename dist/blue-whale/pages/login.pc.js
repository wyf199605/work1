/// <amd-module name="LoginPcPage"/>
define("LoginPcPage", ["require", "exports", "LoginPage", "Button", "CheckBox"], function (require, exports, login_1, Button_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var LoginPcPage = /** @class */ (function (_super) {
        __extends(LoginPcPage, _super);
        function LoginPcPage(para) {
            var _this = this;
            // 初始化头部logo和注册按钮
            var logoWrapper = h("div", { className: "logo" },
                h("img", { "data-action": "selectServer", src: G.requireBaseUrl + '../img/login-logo.png', alt: "fastlion" }));
            // 初始化表单内容（输入框、按钮等）
            var form = h("form", { className: "login-form" },
                h("div", { className: "form-group" },
                    h("input", { id: "username", type: "text", placeholder: "\u8BF7\u8F93\u5165\u5458\u5DE5\u53F7/\u624B\u673A\u53F7\u7801" })),
                h("div", { className: "form-group" },
                    h("input", { id: "password", type: "password", placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801" })),
                h("div", { className: "form-group checkbox-group" }),
                h("div", { className: "btn-group" }));
            d.on(form, 'submit', function (e) {
                e.preventDefault();
            });
            // alert(2);
            var passwordInput = d.query('#password', form);
            // 登录按钮
            var loginBtn = new Button_1.Button({
                container: d.query('.btn-group', form),
                content: '登录',
                className: 'login-submit',
            });
            // 记住密码
            var checkBox = new checkBox_1.CheckBox({
                container: d.query('.checkbox-group', form),
                text: '记住密码',
            });
            // 忘记密码
            var forgetPwd = h("div", { class: "forget-pwd" },
                h("a", { href: "#" }, "\u5FD8\u8BB0\u5BC6\u7801?"));
            // let forgetPwd = <div class="forget-pwd"></div>;
            // let btn = new Button({
            //     container: d.query('.fotget-pwd', forgetPwd),
            //     content: '忘记密码'
            // });
            d.append(d.query('.checkbox-group', form), forgetPwd);
            // 指纹登录和设备注册按钮
            var loginOption = h("div", { className: "login-option" },
                h("a", { href: "#", className: "zhiwen" },
                    h("i", { className: "iconfont icon-zhiwen" }),
                    "\u6307\u7EB9\u767B\u5F55"),
                h("a", { href: "#", className: "device" },
                    h("i", { className: "iconfont icon-device-mb" }),
                    "\u8BBE\u5907\u6CE8\u518C"));
            d.append(form, loginOption);
            var footer = h("div", { className: "footer" },
                h("div", { className: "login-fqa" }),
                h("div", { className: "copyright" }, "\u00A92018\u901F\u72EE\u8F6F\u4EF6\u7248\u6743\u6240\u6709"));
            var fqaBtn = new Button_1.Button({
                container: d.query('.login-fqa', footer),
                content: '常见问题',
            });
            // 初始化登录页
            var wrapper = h("div", { className: "login-wrapper mui-content" },
                logoWrapper,
                form,
                footer);
            d.append(para.dom, wrapper);
            para.dom.style.backgroundImage = "url(" + (G.requireBaseUrl + '../img/bg.png') + ")";
            para.dom.style.backgroundRepeat = 'repeat-x';
            para.dom.style.backgroundPositionY = 'center';
            _this = _super.call(this, {
                responseBean: para.responseBean,
                loginButton: loginBtn,
                userId: document.getElementById('username'),
                password: document.getElementById('password'),
                saveButton: checkBox,
                fingerMbBtn: d.query('.zhiwen', loginOption),
                regButton: d.query('.device', loginOption),
                fqaBtn: fqaBtn
            }) || this;
            return _this;
        }
        return LoginPcPage;
    }(login_1.LoginPage));
    exports.LoginPcPage = LoginPcPage;
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
