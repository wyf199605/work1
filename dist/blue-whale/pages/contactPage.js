define(["require", "exports", "BasicPage", "BwRule", "Modal", "PopMenu", "InputBox", "Button"], function (require, exports, basicPage_1, BwRule_1, Modal_1, PopMenu_1, InputBox_1, Button_1) {
    "use strict";
    var sys = BW.sys;
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    return /** @class */ (function (_super) {
        __extends(contactPage, _super);
        function contactPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var self = _this;
            if (self.isMb) {
                // mui.init({
                //     gestureConfig: {
                //         longtap: true //默认为false
                //     }
                // });
                d.on(d.query('.mui-table-view'), 'press', '.col-content', function () {
                    var menuBtn = [], colContent = this;
                    menuBtn.push("复制");
                    if (colContent.dataset.col === 'MOBILE') {
                        menuBtn.push("拨号");
                        menuBtn.push("短信");
                    }
                    if (menuBtn.length > 0) {
                        var popMenu_1 = new PopMenu_1.PopMenu({
                            arr: menuBtn,
                            callback: function (target, custom) {
                                if (target.innerHTML === '复制') {
                                    sys.window.copy(colContent.textContent);
                                }
                                else if (target.innerHTML === '拨号') {
                                    sys.window.load('tel:' + colContent.textContent);
                                }
                                else if (target.innerHTML === '短信') {
                                    sys.window.load('sms:' + colContent.textContent);
                                }
                                popMenu_1.destroy();
                            }
                        });
                        var position = colContent.getBoundingClientRect(), x1 = colContent.offsetWidth / 2, x2 = position.left, y1 = position.top;
                        popMenu_1.show(y1, x1 + x2);
                        // tools.menu.show(colContent, menuBtn, function (btn) {
                        //
                        // });
                    }
                });
                //初始化单页的区域滚动
                // mui('.mui-scroll-wrapper').scroll();
            }
            if (para.keyField.length === 0) {
                Modal_1.Modal.alert('keyField 为空');
            }
            else {
                var userId = tools.url.getPara('userid', _this.url);
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.myself, {
                    data: userId ? { userid: userId } : null
                }).then(function (_a) {
                    var response = _a.response;
                    var dataCols = sys.isMb ? d.queryAll('.mui-table-view-cell [data-col]') :
                        d.queryAll('.list-group-item [data-col]', para.dom);
                    dataCols.forEach(function (el) {
                        var html = response.data[0][el.dataset.col];
                        if (html === null || html === undefined) {
                            d.remove(el.parentElement.parentElement);
                        }
                        else {
                            el.innerHTML = html;
                        }
                    });
                    // detailData = response.data[0];
                    if (tools.isMb) {
                        self.btnInit();
                    }
                });
            }
            return _this;
        }
        contactPage.prototype.btnInit = function () {
            var inputBox = new InputBox_1.InputBox({
                container: this.para.wrapper,
                size: 'middle',
                compactWidth: 1,
                className: 'button-call'
            });
            var mobile = d.query('[data-col="MOBILE"]');
            if (mobile.textContent) {
                inputBox.addItem(new Button_1.Button({
                    content: '拨号',
                    icon: 'call',
                    className: 'call',
                    onClick: function () {
                        sys.window.load('tel:' + mobile.textContent);
                    }
                }));
                inputBox.addItem(new Button_1.Button({
                    content: '短信',
                    icon: 'xiaoxi',
                    className: 'xiaoxi',
                    onClick: function () {
                        sys.window.load('sms:' + mobile.textContent);
                    }
                }));
            }
            inputBox.addItem(new Button_1.Button({
                content: '邮件',
                icon: 'message',
                className: 'message',
                onClick: function () {
                    var userId = d.query('[data-col="USERID"]').textContent;
                    BW.sys.window.open({
                        url: tools.url.addObj(BW.CONF.url.mail, {
                            defaultvalue: '{"RECEIVERID":"' + userId + '"}'
                        })
                    });
                    // sys.window.load('sms:' + mobile.textContent);
                }
            }));
        };
        return contactPage;
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
