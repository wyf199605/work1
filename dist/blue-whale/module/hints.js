define("Hints", ["require", "exports", "Modal", "InputBox", "Button", "Tab", "BwRule"], function (require, exports, Modal_1, InputBox_1, Button_1, tab_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="Hints"/>
    var d = G.d;
    var sys = BW.sys;
    var CONF = BW.CONF;
    /**
     * hint系统提醒
     */
    var Hints = /** @class */ (function () {
        function Hints(para) {
            this.index = 0;
            this.ajax = new BwRule_1.BwRule.Ajax();
            this.init(para);
        }
        Hints.prototype.init = function (para) {
            var _this = this;
            var inputBox = new InputBox_1.InputBox(), lInputBox = new InputBox_1.InputBox();
            this.dataMap = para.data.dataMap;
            this.len = this.dataMap.length;
            this.upButton = new Button_1.Button({
                content: '上一条',
                type: 'primary',
                onClick: function () {
                    _this.ajaxLoad(_this.index - 1);
                    _this.tab.active(_this.index - 1);
                }
            });
            this.nextButton = new Button_1.Button({
                content: '下一条',
                type: 'primary',
                onClick: function () {
                    _this.ajaxLoad(_this.index + 1);
                    _this.tab.active(_this.index + 1);
                }
            });
            this.openButton = new Button_1.Button({
                content: '打开',
                type: 'primary',
                onClick: function () {
                    var active = d.query('.tab-pane.active [data-url]', _this.modal.bodyWrapper);
                    sys.window.open({
                        url: CONF.siteUrl + active.dataset.url
                    });
                }
            });
            this.noWarmButton = new Button_1.Button({
                content: '今日不提醒',
                type: 'primary',
                onClick: function (e) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + e.target.dataset.url, {
                        type: 'POST',
                    }).then(function (_a) {
                        var response = _a.response;
                        _this.noWarmButton.getDom().classList.add('disabled');
                        Modal_1.Modal.toast(response.msg);
                    });
                }
            });
            lInputBox.addItem(this.openButton);
            lInputBox.addItem(this.noWarmButton);
            inputBox.addItem(this.upButton);
            inputBox.addItem(this.nextButton);
            this.modal = new Modal_1.Modal({
                header: '提醒',
                width: '600px',
                isBackground: false,
                body: d.create("<div class=\"hints-body\"></div>"),
                footer: {
                    rightPanel: inputBox,
                    leftPanel: lInputBox
                },
            });
            this.modal.onClose = function () {
                _this.modal.destroy();
            };
            var tabs = [];
            para.data.dataMap.forEach(function (obj) {
                tabs.push({
                    title: obj.content.caption,
                    dom: d.create("<div data-url=\"" + obj.content.link + "\">" + (obj.content.content || '') + "</div>")
                });
            });
            this.tab = new tab_1.Tab({
                tabParent: this.modal.body,
                panelParent: this.modal.body,
                tabs: tabs,
                onClick: function (index) {
                    _this.ajaxLoad(index);
                }
            });
            this.ajaxLoad(this.index);
        };
        /**
         * disabled控制
         * @param index
         * @param msg
         * @param url
         * @param btnUrl
         * @param btnCaption
         */
        Hints.prototype.showMsg = function (index, msg, url, btnUrl, btnCaption) {
            if (index === 0) {
                this.upButton.getDom().classList.add('disabled');
            }
            else {
                this.upButton.getDom().classList.remove('disabled');
            }
            if (index === this.len - 1) {
                this.nextButton.getDom().classList.add('disabled');
            }
            else {
                this.nextButton.getDom().classList.remove('disabled');
            }
            //按钮可点击
            if (btnUrl) {
                this.noWarmButton.getDom().classList.remove('disabled');
                this.noWarmButton.getDom().dataset.url = btnUrl;
            }
            else {
                this.noWarmButton.getDom().classList.add('disabled');
            }
            //按钮存在
            if (btnCaption) {
                this.noWarmButton.getDom().innerHTML = btnCaption;
                this.noWarmButton.getDom().classList.remove('hide');
            }
            else {
                this.noWarmButton.getDom().classList.add('hide');
            }
            this.index = index;
            var active = d.query('.tab-pane.active [data-url]', this.modal.bodyWrapper);
            active.innerHTML = msg;
            active.dataset.url = url;
            if (active.dataset.url) {
                this.openButton.getDom().classList.remove('disabled');
            }
            else {
                this.openButton.getDom().classList.add('disabled');
            }
        };
        Hints.prototype.destroy = function () {
            this.modal.destroy();
        };
        Hints.prototype.ajaxLoad = function (index) {
            var _this = this;
            var data = this.dataMap[index];
            if (!data) {
                return;
            }
            var url = data.content.link;
            this.ajax.fetch(CONF.siteUrl + url, {
                type: 'GET',
                cache: true,
            }).then(function (_a) {
                var response = _a.response;
                var element = response.body.elements[0], btnAddr = element.btnAddr && element.btnAddr.dataAddr, addr = element.openlink && element.openlink.dataAddr || '';
                _this.showMsg(index, element.textMsg, addr, btnAddr, element.btnCaption);
            });
        };
        return Hints;
    }());
    exports.Hints = Hints;
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
