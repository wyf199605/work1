define(["require", "exports", "BasicPage", "Button", "TextInput", "Modal", "BwRule"], function (require, exports, basicPage_1, Button_1, text_1, Modal_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var ChangePasswordPage = /** @class */ (function (_super) {
        __extends(ChangePasswordPage, _super);
        function ChangePasswordPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            if (!_this.isMb) {
                _this.initPcPage();
            }
            ChangePasswordPage.changePassword(_this.para.dom);
            return _this;
        }
        ChangePasswordPage.prototype.initPcPage = function () {
            var el = this.para.dom, detail = d.create('<div class="change-password-detail"></div>'), 
            //用户密码修改
            content = d.create("<div class=\"content\">\n                    <form action=\"#\">\n                    <div class=\"form-group\">\n                        <div data-type=\"old-password\">\n                            <label class=\"control-label\">\u65E7\u5BC6\u7801</label>\n                        </div>\n                        <div data-type=\"new-password\">\n                            <label class=\"control-label\">\u65B0\u5BC6\u7801</label>\n                        </div>\n                        <div data-type=\"again-password\">\n                            <label class=\"control-label\">\u786E\u8BA4\u5BC6\u7801</label>\n                        </div>\n                        <div data-type=\"submit\"></div>\n                    </div>\n                    </form>\n                </div>");
            d.append(detail, content);
            d.append(el, detail);
            new text_1.TextInput({
                container: el.querySelector('div[data-type="old-password"]'),
                type: 'password',
                placeholder: '请输入当前密码',
                icons: ['iconfont icon-suo4']
            });
            new text_1.TextInput({
                container: el.querySelector('div[data-type="new-password"]'),
                type: 'password',
                placeholder: '请输入新密码',
                icons: ['iconfont icon-suo4']
            });
            new text_1.TextInput({
                container: el.querySelector('div[data-type="again-password"]'),
                type: 'password',
                placeholder: '请再次输入密码',
                icons: ['iconfont icon-suo4']
            });
            new Button_1.Button({
                container: el.querySelector('[data-type=submit]'),
                content: '确定',
                type: 'primary'
            });
            content.querySelector('[data-type=submit]>button').type = 'submit';
        };
        /*
         * 密码修改
         * */
        ChangePasswordPage.changePassword = function (el) {
            var form = el.querySelector('form'), old_input = d.query('[data-type=old-password] input', form), new_input = d.query('[data-type=new-password] input', form), again_input = d.query('[data-type=again-password] input', form);
            d.on(form, 'submit', function (ev) {
                ev.preventDefault();
                var old_password = old_input.value, new_password = new_input.value, again_password = again_input.value;
                if (!tools.str.toEmpty(old_password) || !tools.str.toEmpty(new_password) || !tools.str.toEmpty(again_password)) {
                    Modal_1.Modal.alert('密码不能为空');
                }
                else if (new_password !== again_password) {
                    Modal_1.Modal.alert('密码不一致');
                }
                else {
                    var url = CONF.ajaxUrl.changePassword;
                    BwRule_1.BwRule.Ajax.fetch(url, {
                        type: 'POST',
                        data: {
                            old_password: old_password,
                            new_password: new_password
                        }
                    }).then(function (_a) {
                        var response = _a.response;
                        var result = response.msg;
                        Modal_1.Modal.toast(result);
                        if (result.indexOf('成功') > -1) {
                            old_input.value = '';
                            new_input.value = '';
                            again_input.value = '';
                        }
                    });
                }
            });
        };
        return ChangePasswordPage;
    }(basicPage_1.default));
    exports.ChangePasswordPage = ChangePasswordPage;
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
