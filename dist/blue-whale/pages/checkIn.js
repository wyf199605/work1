define(["require", "exports", "BasicPage", "TextInput", "Tab", "Button", "Modal", "InputBox", "BwRule", "ShellAction"], function (require, exports, basicPage_1, text_1, tab_1, Button_1, Modal_1, InputBox_1, BwRule_1, ShellAction_1) {
    "use strict";
    var d = G.d;
    var CONF = BW.CONF;
    var tools = G.tools;
    var Shell = G.Shell;
    return /** @class */ (function (_super) {
        __extends(CheckInPage, _super);
        function CheckInPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.passwordEl = null;
            var parent = para.dom.parentNode;
            var height = parent.offsetHeight - parent.firstChild.offsetHeight;
            para.dom.style.height = height + 'px';
            _this.initPage();
            return _this;
        }
        CheckInPage.prototype.initPage = function () {
            var self = this, para = self.para;
            var detail = h("div", { class: "checkIn-detail" });
            //创建左侧框
            var content = h("div", { class: "checkIn-content" },
                h("h4", { class: "datetime" }));
            //输入userid进行密码修改
            self.passwordEl = h("div", { class: "password-content" },
                h("form", null,
                    h("div", { class: "from-group" },
                        h("div", { "data-type": "text", type: "text" }),
                        h("div", { "data-type": "password", type: "text" }),
                        h("div", { "data-type": "submit" }))));
            var text = new text_1.TextInput({
                container: self.passwordEl.querySelector('[data-type="text"]'),
                type: 'text',
                placeholder: '请输入用户名',
                icons: ['iconfont icon-avatar']
            });
            var password = new text_1.TextInput({
                container: self.passwordEl.querySelector('[data-type="password"]'),
                type: 'password',
                placeholder: '请输入密码',
                icons: ['iconfont icon-suo4']
            });
            var submit = new Button_1.Button({
                container: self.passwordEl.querySelector('[data-type=submit]'),
                content: '确定',
                type: 'primary'
            });
            //指纹考勤与密码考勤切换
            var attendTab = new tab_1.Tab({
                tabParent: detail,
                panelParent: content,
                tabs: [
                    {
                        title: '密码修改',
                        dom: self.passwordEl
                    },
                    {
                        title: '指纹登记',
                        dom: h("div", { class: "register-finger" })
                    }
                ],
                onClick: function (index) {
                    if (index === 1) {
                        self.registerFinger(); //调用指纹录入
                    }
                }
            });
            detail.appendChild(content);
            para.dom.appendChild(detail);
            this.registerPassword();
        };
        /*
       *指纹登记
       * */
        CheckInPage.prototype.registerFinger = function () {
            //创建确定与关闭按钮
            var inputBox = new InputBox_1.InputBox({}), cancelBtn = new Button_1.Button({ content: '取消', type: 'danger', key: 'cancelBtn', }), okBtn = new Button_1.Button({
                content: '确定',
                type: 'primary',
                onClick: tools.pattern.debounce(function (e) {
                    if (tools.isEmpty(text.get())) {
                        Modal_1.Modal.toast('员工号不能为空');
                    }
                    else {
                        finger.style.opacity = '1';
                        var userid = text.get().toUpperCase();
                        if ('AppShell' in window) {
                            fingerPrint(userid);
                        }
                        else if ('BlueWhaleShell' in window) {
                            oldFingerPrint(userid);
                        }
                    }
                }, 500),
            });
            inputBox.addItem(okBtn);
            inputBox.addItem(cancelBtn);
            //生成录入userid的模态框
            var main = new Modal_1.Modal({
                header: '注册指纹',
                body: h("div", { class: "main", style: "padding:13px 18px" },
                    h("div", { class: "form" },
                        h("div", { "data-type": "text", style: "border:1px solid #ccc;border-radius:5px;" }),
                        h("p", { class: "help-block" }, "\u8F93\u5165\u5458\u5DE5\u53F7\u540E\u6309\u786E\u5B9A\u5F55\u5165\u6307\u7EB9"),
                        h("div", { "data-type": "button" })),
                    h("div", { style: "opacity:0;transition:1s", class: "finger" },
                        h("h4", null, "\u8BF7\u6309\u4E0B\u6307\u7EB9"),
                        h("p", { "data-msg": "msg" }))),
                footer: {
                    rightPanel: inputBox,
                },
                onClose: function () {
                    // 关闭指纹
                    if ('AppShell' in window) {
                        Shell.finger.cancel();
                    }
                    else if ('BlueWhaleShell' in window) {
                        ShellAction_1.ShellAction.get().erp().cancelFinger();
                    }
                }
            });
            var finger = main.bodyWrapper.querySelector('.finger');
            var text = new text_1.TextInput({
                container: main.bodyWrapper.querySelector('[data-type="text"]'),
                type: 'text'
            });
            text.focus();
            //指纹登记
            function fingerPrint(userid) {
                var _this = this;
                var msg = finger.querySelector('[data-msg="msg"]');
                G.Shell.finger.cancel();
                G.Shell.finger.get({
                    type: 1,
                    option: 1
                }, function (e) {
                    console.log(e);
                    if (e.success) {
                        var data = e.data, print_1 = data.finger, type = data.fingerType;
                        msg.innerHTML = '<span>指纹数据正在录入中，请稍后...</span>';
                        var url = CONF.ajaxUrl.atdFingerReg;
                        // Rule.ajax(url, {
                        //     type: 'POST',
                        //     data: '[' + JSON.stringify({
                        //         userid: userid,
                        //         fingertype: type,
                        //         fingerprint: print
                        //     }) + ']',
                        //     success(response) {
                        //         finger.style.opacity = '0';
                        //         main.destroy();
                        //         Modal.alert('指纹录入成功');
                        //         text.set('');
                        //         (<any>ShellAction.get()).erp().cancelFinger();
                        //     },
                        //     error(err) {
                        //         main.destroy();
                        //         text.set('');
                        //         Modal.alert('指纹录入失败');
                        //         (<any>ShellAction.get()).erp().cancelFinger();
                        //     }
                        // })
                        BwRule_1.BwRule.Ajax.fetch(url, {
                            type: 'POST',
                            data: [{
                                    userid: userid,
                                    fingertype: type,
                                    fingerprint: print_1
                                }]
                        }).then(function (_a) {
                            var response = _a.response;
                            finger.style.opacity = '0';
                            Modal_1.Modal.alert('指纹录入成功');
                        }).catch(function () {
                            // main.destroy();
                            // text.set('');
                            Modal_1.Modal.alert('指纹录入失败');
                            // (<any>ShellAction.get()).erp().cancelFinger();
                        }).finally(function () {
                            main.destroy();
                            text.set('');
                            Shell.finger.cancel();
                        });
                    }
                    else {
                        Shell.finger.cancel();
                        msg.innerHTML = '<span>' + e.msg + '</span>';
                        _this.registerFinger(); //调用指纹录入
                    }
                }, function (ev) {
                    msg.innerHTML = '<span>' + ev.data.text + '</span>';
                }, true);
            }
            function oldFingerPrint(userid) {
                var erp = ShellAction_1.ShellAction.get().erp(), self = this;
                var msg = finger.querySelector('[data-msg="msg"]');
                erp.callFinger({ type: 1 });
                erp.callFingerMsg({
                    callback: function (event) {
                        var text = JSON.parse(event.detail);
                        msg.innerHTML = '<span>' + text.msg + '</span>';
                    }
                });
                erp.setFinger({
                    callback: function (event) {
                        var result = JSON.parse(event.detail);
                        var print = result.msg.fingerPrint;
                        var type = result.msg.fingerType;
                        if (result.success) {
                            msg.innerHTML = '<span>指纹数据正在录入中，请稍后...</span>';
                            var url = CONF.ajaxUrl.atdFingerReg;
                            BwRule_1.BwRule.Ajax.fetch(url, {
                                type: 'POST',
                                data: [{
                                        userid: userid,
                                        fingertype: type,
                                        fingerprint: print
                                    }]
                            }).then(function (_a) {
                                var response = _a.response;
                                finger.style.opacity = '0';
                                Modal_1.Modal.alert('指纹录入成功');
                            }).catch(function () {
                                // main.destroy();
                                // text.set('');
                                Modal_1.Modal.alert('指纹录入失败');
                                // (<any>ShellAction.get()).erp().cancelFinger();
                            }).finally(function () {
                                main.destroy();
                                text.set('');
                                (ShellAction_1.ShellAction.get()).erp().cancelFinger();
                            });
                        }
                        else {
                            (ShellAction_1.ShellAction.get()).erp().cancelFinger();
                            msg.innerHTML = '<span>' + result.msg + '</span>';
                            self.registerFinger(); //调用指纹录入
                        }
                    }
                });
            }
        };
        /*
       * 密码登记
       * */
        CheckInPage.prototype.registerPassword = function () {
            var self = this;
            var form = self.passwordEl.querySelector('form');
            form.querySelector('[data-type=submit]>button').type = 'submit';
            d.on(form, 'submit', function (ev) {
                ev.preventDefault();
                var username = form.querySelector('input[type=text]').value.toUpperCase();
                var password = form.querySelector('input[type=password]').value;
                if (!tools.str.toEmpty(username) || !tools.str.toEmpty(password)) {
                    Modal_1.Modal.alert('密码不能为空');
                }
                else {
                    var url_1 = CONF.ajaxUrl.atdPwdReg;
                    BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.passwordEncrypt, {
                        data: { str: password }
                    }).then(function (_a) {
                        var response = _a.response;
                        var encodePassword = response.body.bodyList[0];
                        return BwRule_1.BwRule.Ajax.fetch(url_1, {
                            type: "POST",
                            data: JSON.stringify({
                                userid: username,
                                password: encodePassword
                            })
                        });
                    }).then(function (_a) {
                        var response = _a.response;
                        var result = response.msg;
                        form.querySelector('input[type=text]').value = '';
                        form.querySelector('input[type=password]').value = '';
                        Modal_1.Modal.toast(response.msg);
                    });
                }
            });
        };
        CheckInPage.prototype.destroy = function () {
            Shell.finger.cancel();
        };
        return CheckInPage;
    }(basicPage_1.default));
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
