define("LoginInfoModule", ["require", "exports", "DVAjax", "Modal"], function (require, exports, DVAjax_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LoginInfoModule"/>
    var d = G.d;
    var tools = G.tools;
    var SPA = G.SPA;
    var Component = G.Component;
    var LoginInfoModule = /** @class */ (function (_super) {
        __extends(LoginInfoModule, _super);
        function LoginInfoModule(loginInfo) {
            var _this = _super.call(this, loginInfo) || this;
            _this.loginInfo = loginInfo;
            if (tools.isEmpty(loginInfo))
                loginInfo = {};
            _this.init(loginInfo);
            return _this;
        }
        LoginInfoModule.prototype.wrapperInit = function (loginInfo) {
            return d.create("<div data-loginInfo=\"loginInfo\" class=\"login-info\">\n        <div class=\"item\"><img src='../../img/develop/user.png'></div>\n        <div class=\"login-detail\"></div>\n        <div class=\"clear\"></div>\n        </div>");
        };
        LoginInfoModule.prototype.init = function (loginInfo) {
            // this.department = loginInfo.department;
            // this.userName = loginInfo.userName;
            // this.headerImgUrl = loginInfo.headerImgUrl;
            var detail = null;
            if (localStorage.getItem('userId')) {
                detail = d.create("<div>\n<div class=\"item userName\">\u5E73\u53F0\u90E8 " + localStorage.getItem('userId') + "</div>\n<div class=\"item line\"> | </div>\n<div class=\"item logout\">\u9000\u51FA</div>\n</div>");
            }
            else {
                detail = d.create("<div class=\"item login\">\u767B\u5F55</div>");
            }
            d.query('.login-detail', this.wrapper).appendChild(detail);
            d.on(d.query('.logout', this.wrapper), 'click', function (e) {
                DVAjax_1.DVAjax.logout(function (res) {
                    if (res.errorCode === 0) {
                        localStorage.removeItem('userId');
                        Modal_1.Modal.toast('退出成功!');
                        SPA.open(SPA.hashCreate('loginReg', 'login'));
                    }
                });
            });
            d.on(d.query('.login', this.wrapper), 'click', function (e) {
                SPA.open(SPA.hashCreate('loginReg', 'login'));
            });
        };
        Object.defineProperty(LoginInfoModule.prototype, "department", {
            get: function () {
                return this._department;
            },
            set: function (department) {
                if (tools.isEmpty(department)) {
                    department = '';
                }
                this._department = department;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LoginInfoModule.prototype, "userName", {
            get: function () {
                return this._userName;
            },
            set: function (userName) {
                if (tools.isEmpty(userName)) {
                    userName = '';
                }
                this._userName = userName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LoginInfoModule.prototype, "headerImgUrl", {
            get: function () {
                return this._headerImgUrl;
            },
            set: function (headerImgUrl) {
                if (tools.isEmpty(headerImgUrl)) {
                    headerImgUrl = '';
                }
                this._headerImgUrl = headerImgUrl;
            },
            enumerable: true,
            configurable: true
        });
        LoginInfoModule.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            d.off(this.wrapper);
            d.remove(this.wrapper);
        };
        return LoginInfoModule;
    }(Component));
    exports.LoginInfoModule = LoginInfoModule;
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
