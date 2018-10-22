define(["require", "exports", "BasicPage", "BwRule", "Modal", "PopMenu", "InputBox", "Button", "ButtonAction", "TurnPage"], function (require, exports, basicPage_1, BwRule_1, Modal_1, PopMenu_1, InputBox_1, Button_1, ButtonAction_1, TurnPage_1) {
    "use strict";
    var tools = G.tools;
    var sys = BW.sys;
    var d = G.d;
    return /** @class */ (function (_super) {
        __extends(detailPage, _super);
        function detailPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var detailData;
            var ajaxUrl = para.ajaxUrl; // + currentView.mailid;
            var self = _this;
            getData(ajaxUrl, {});
            _this.on('refreshData', function () {
                getData(ajaxUrl, {});
            });
            if (_this.isMb) {
                // mui('.mui-scroll-wrapper').scroll();
                d.on(para.ulDom, 'click', '.mui-table-view-cell[data-href]:not([data-href=""])', function () {
                    var innerDom = d.query('[data-col]', this);
                    BwRule_1.BwRule.link({
                        link: this.dataset.href,
                        varList: JSON.parse(this.dataset.varList),
                        data: detailData,
                        dataType: innerDom.dataset.dataType,
                        openUrl: self.url,
                    });
                });
                //发件人
                d.on(para.ulDom, 'click', '.fold', function () {
                    this.classList.toggle('ellipsis-row3');
                });
                var popMenu_1 = new PopMenu_1.PopMenu({
                    arr: ["复制"],
                    callback: function (target, str) {
                        sys.window.copy(str);
                    }
                });
                d.on(para.ulDom, 'longtap', '.mui-col-xs-8, [data-col=CONTENT]', function (e) {
                    var position = this.getBoundingClientRect(), x1 = this.offsetWidth / 2, x2 = position.left, left = x1 + x2, top = position.top;
                    popMenu_1.show(top, left, tools.str.removeHtmlTags(this.innerHTML));
                });
                d.on(para.btns, 'click', 'span[data-button-type]', function (e) {
                    ButtonAction_1.ButtonAction.get().clickHandle(ButtonAction_1.ButtonAction.get().dom2Obj(this), detailData);
                });
                var locData_1 = JSON.parse(window.localStorage.getItem('nextKeyField')), curIndex = window.localStorage.getItem('currentKeyField');
                if (tools.isNotEmpty(curIndex)) {
                    new TurnPage_1.TurnPage({
                        curIndex: parseInt(curIndex),
                        len: locData_1.length,
                        onChange: function (index) {
                            getData(ajaxUrl.substr(0, ajaxUrl.indexOf('?')), Object.assign({
                                nopage: true,
                            }, locData_1[index]));
                        }
                    });
                }
                var field_1 = para.ui.scannableField;
                if (tools.isNotEmpty(field_1)) {
                    require(['MobileScan'], function (M) {
                        var ui = para.ui;
                        new M.MobileScan({
                            scannableType: ui.scannableType,
                            scannableTime: ui.scannableTime,
                            callback: function (ajaxData) {
                                var _a;
                                getData(ajaxUrl, (_a = {},
                                    _a[field_1] = ajaxData.mobilescan,
                                    _a));
                            }
                        });
                    });
                }
            }
            else {
                d.on(para.btns, 'click', '[data-button-type]', function (e) {
                    ButtonAction_1.ButtonAction.get().clickHandle(ButtonAction_1.ButtonAction.get().dom2Obj(this), detailData, function () { }, self.url);
                });
                d.on(para.list, 'click', '.list-group-item[data-href]:not([data-href=""])', function () {
                    var innerDom = d.query('[data-col]', this);
                    BwRule_1.BwRule.link({
                        link: this.dataset.href,
                        varList: JSON.parse(this.dataset.varList),
                        data: detailData,
                        dataType: innerDom.dataset.dataType,
                    });
                });
            }
            function getData(ajaxUrl, ajaxData) {
                BwRule_1.BwRule.Ajax.fetch(ajaxUrl, {
                    data: ajaxData
                }).then(function (_a) {
                    var response = _a.response;
                    if (response.data.length === 0) {
                        Modal_1.Modal.alert('数据为空');
                        return;
                    }
                    para.dataCols && para.dataCols.forEach(function (el) {
                        var html = response.data[0][el.dataset.col];
                        if (html === null || html === undefined) {
                            d.remove(el.parentNode);
                        }
                        else {
                            el.innerHTML = BwRule_1.BwRule.formatText(html, {
                                dataType: el.dataset.dataType,
                                displayFormat: el.dataset.displayFormat
                            });
                        }
                    });
                    detailData = response.data[0];
                    var inputBox = new InputBox_1.InputBox({
                        container: para.btns,
                        size: 'small',
                    });
                    Array.isArray(para.data) && para.data.forEach(function (d) {
                        var button = new Button_1.Button({
                            content: d.title,
                            icon: d.icon,
                            // type:'default',
                            onClick: function () {
                                ButtonAction_1.ButtonAction.get().clickHandle(d, detailData);
                            }
                        });
                        inputBox.addItem(button);
                    });
                });
                // Rule.ajax(ajaxUrl, {
                //     data: ajaxData,
                //     success: function (response) {
                //         if (response.data.length === 0) {
                //             Modal.alert('数据为空');
                //             return;
                //         }
                //         Array.prototype.forEach.call(para.dataCols, function (el) {
                //             let html = response.data[0][el.dataset.col];
                //             if (html === null || html === undefined) {
                //                 el.parentNode.parentNode.removeChild(el.parentNode);
                //             } else {
                //                 el.innerHTML = Rule.formatText(html, {
                //                     dataType: el.dataset.dataType,
                //                     displayFormat: el.dataset.displayFormat
                //                 });
                //             }
                //         });
                //         detailData = response.data[0];
                //         let inputBox = new InputBox({
                //             container: para.btns,
                //             size: 'small',
                //
                //         });
                //         para.data[0] && para.data.forEach((d) => {
                //             let button = new Button({
                //                 content: d.title,
                //                 icon: d.icon,
                //                 // type:'default',
                //                 onClick: () => {
                //                     ButtonAction.get().clickHandle(d, detailData);
                //                 }
                //             });
                //             inputBox.addItem(button);
                //         });
                //     }
                // });
            }
            return _this;
        }
        return detailPage;
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
