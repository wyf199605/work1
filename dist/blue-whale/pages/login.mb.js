/// <amd-module name="LoginMbPage"/>
define("LoginMbPage", ["require", "exports", "LoginPage", "Button", "CheckBox"], function (require, exports, login_1, Button_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var LoginMbPage = /** @class */ (function (_super) {
        __extends(LoginMbPage, _super);
        function LoginMbPage(para) {
            var _this = this;
            // 初始化头部logo和注册按钮
            var logoWrapper = h("div", { className: "login-logo" },
                h("img", { src: G.requireBaseUrl + "../img/fastlion_logo.png", alt: "fastlion" }));
            var header = h("header", { className: "login-header mui-bar mui-bar-nav ios-top" });
            var registerBtn = new Button_1.Button({
                container: header,
                content: '注册',
                className: 'login-register',
            });
            registerBtn.wrapper.classList.add('mui-pull-right');
            var untied = new Button_1.Button({
                container: header,
                content: '解绑',
                className: 'login-untied',
            });
            untied.wrapper.classList.add('mui-pull-right');
            // 初始化表单内容（输入框、按钮等）
            var form = h("form", { className: "login-form" },
                h("div", { className: "form-group" },
                    h("label", { for: "username" }, "\u8D26\u53F7"),
                    h("input", { id: "username", type: "text", placeholder: "\u8BF7\u8F93\u5165\u5458\u5DE5\u53F7/\u624B\u673A\u53F7\u7801" })),
                h("div", { className: "form-group" },
                    h("label", { for: "password" }, "\u5BC6\u7801"),
                    h("input", { id: "password", type: "password", placeholder: "\u8BF7\u8F93\u5165\u767B\u5F55\u5BC6\u7801" }),
                    h("button", { className: "password-show", type: "button" },
                        h("i", { className: "appcommon app-xianxingyanjing" }))),
                h("div", { className: "form-group checkbox-group" }),
                h("div", { className: "btn-group" }));
            d.on(form, 'submit', function (e) {
                e.preventDefault();
            });
            // alert(2);
            var passwordInput = d.query('#password', form);
            // 显示密码按钮事件
            d.on(d.query('.password-show', form), 'click', function (e) {
                e.preventDefault();
                this.classList.toggle('checked');
                passwordInput.type = this.classList.contains('checked') ? 'text' : 'password';
            });
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
            // 指纹和微信登录按钮
            var moreLogin = h("div", { className: "login-more" },
                h("div", { className: "login-tel-msg" }),
                h("div", { className: "login-link-list" },
                    h("a", { href: "#", className: "zhiwen" },
                        h("i", { className: "iconfont icon-zhiwen" }),
                        "\u6307\u7EB9\u767B\u5F55"),
                    h("a", { href: "#", className: "weixin" },
                        h("i", { className: "iconfont icon-weixin" }),
                        "\u5FAE\u4FE1\u767B\u5F55")),
                h("div", { className: "login-fqa" }));
            // 短信验证码登录按钮
            var smsBtn = new Button_1.Button({
                container: d.query('.login-tel-msg', moreLogin),
                content: '短信验证码登录',
            });
            var fqaBtn = new Button_1.Button({
                container: d.query('.login-fqa', moreLogin),
                content: '常见问题',
            });
            // 初始化登录页
            var wrapper = h("div", { className: "login-wrapper mui-content" },
                logoWrapper,
                form,
                moreLogin);
            d.append(para.dom, header);
            d.append(para.dom, wrapper);
            _this = _super.call(this, {
                responseBean: para.responseBean,
                loginButton: loginBtn,
                userId: document.getElementById('username'),
                password: document.getElementById('password'),
                saveButton: checkBox,
                fingerMbBtn: d.query('.zhiwen', moreLogin),
                wxButton: d.query('.weixin', moreLogin),
                regButton: registerBtn,
                utButton: untied,
                SMSBtn: smsBtn,
                fqaBtn: fqaBtn
            }) || this;
            return _this;
        }
        return LoginMbPage;
    }(login_1.LoginPage));
    exports.LoginMbPage = LoginMbPage;
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
