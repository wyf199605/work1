define("LeButtonGroup", ["require", "exports", "Button", "Modal", "LeRule", "LeUploadModule"], function (require, exports, Button_1, Modal_1, LeRule_1, UploadModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var SPA = G.SPA;
    var CONF = LE.CONF;
    var tools = G.tools;
    var LeButtonGroup = /** @class */ (function (_super) {
        __extends(LeButtonGroup, _super);
        function LeButtonGroup(props) {
            var _this = _super.call(this, props) || this;
            _this.dataGet = props.dataGet;
            return _this;
        }
        LeButtonGroup.prototype.wrapperInit = function (para) {
            var _this = this;
            var buttons = (para.buttons || []).filter(function (btn) {
                if (btn.judgefield) {
                    var data_1 = para.dataGet() || {};
                    return btn.judgefield.split(',').every(function (field) { return data_1[field]; });
                }
                return true;
            });
            function type2color(btn) {
                if (btn) {
                    if (btn.link && btn.link.requestType === 'DELETE') {
                        return 'red';
                    }
                    if (btn.type === 'download') {
                        return 'green';
                    }
                    if (btn.type === 'excel') {
                        return 'light-blue';
                    }
                }
                return '';
            }
            return h("div", { className: "le-button-group" }, buttons.map(function (button) {
                return button.type === 'excel' ?
                    h(UploadModule_1.LeUploadModule, { isAutoUpload: true, className: "btn le-button light-blue", url: LeRule_1.LeRule.linkParse2Url(button.link), isChangeText: false, text: button.caption, successHandler: function () {
                            Modal_1.Modal.toast("\u4E0A\u4F20\u6210\u529F");
                        } }) :
                    h(Button_1.Button, { className: "le-button " + type2color(button), content: button.caption, onClick: function () {
                            exports.buttonAction.click(button, _this.dataGet());
                        } });
            }));
        };
        return LeButtonGroup;
    }(Component));
    exports.LeButtonGroup = LeButtonGroup;
    // class LeButton extends Button{
    //     private _bgColor: string;
    //
    // }
    exports.buttonAction = {
        /**
         * button点击后业务操作规则
         */
        click: function (btn, data) {
            var _this = this;
            var self = this;
            if (tools.isEmpty(btn.link.varList)) {
                data = undefined;
            }
            if (btn.hint) {
                Modal_1.Modal.confirm({
                    msg: "\u786E\u5B9A\u8981" + btn.caption + "\u5417?",
                    callback: function (flag) {
                        if (flag) {
                            self.btnAction(btn, data)
                                .then(function () {
                                _this.btnRefresh(btn.refresh);
                            });
                        }
                    }
                });
            }
            else {
                self.btnAction(btn, data).then(function () {
                    _this.btnRefresh(btn.refresh);
                });
            }
        },
        /**
         * openTyp="popup";//弹出新窗口,"newwin";//打开新窗口,"none";//保持在原界面
         * 处理按钮规则buttonType=0:get,1:post,2put,3delete
         */
        btnAction: function (btn, dataObj) {
            if (btn.multi === 0 && Array.isArray(dataObj)) {
                dataObj = dataObj[0] || {};
            }
            switch (btn.type) {
                case 'download':
                    window.open(LeRule_1.LeRule.linkParse2Url(btn.link, dataObj));
                    return Promise.resolve();
                case 'excel':
                    break;
                default:
                    var openType = btn.link.openType;
                    switch (openType) {
                        case 'data':
                        case 'none':
                            return exports.buttonAction.checkAction(btn.link, dataObj);
                        case 'popup':
                        case 'newwin':
                            LeRule_1.LeRule.linkOpen(btn.link, dataObj);
                            return Promise.resolve();
                    }
            }
            return Promise.resolve();
        },
        checkAction: function (link, dataObj, url) {
            var _a;
            var addr = (_a = url ? { addr: url, data: null } : LeRule_1.LeRule.linkParse(link, dataObj), _a.addr), data = _a.data;
            return LeRule_1.LeRule.Ajax.fetch(CONF.siteUrl + addr, {
                data: data,
                data2url: link.varType !== 3,
                type: link.requestType
            }).then(function (_a) {
                var response = _a.response;
                var data = response.data;
                if (data && (data.type || data.type === 0)) {
                    if (data.type === 0) {
                        Modal_1.Modal.alert(data.showText);
                        return Promise.reject('');
                    }
                    else {
                        return new Promise(function (resolve, reject) {
                            Modal_1.Modal.confirm({
                                msg: data.showText,
                                callback: function (confirmed) {
                                    if (confirmed) {
                                        exports.buttonAction.checkAction(link, dataObj, data.url)
                                            .then(function () {
                                            resolve();
                                        }).catch(function () {
                                            reject();
                                        });
                                    }
                                    else {
                                        reject();
                                    }
                                }
                            });
                        });
                    }
                }
                else {
                    // 默认提示
                    response.msg && Modal_1.Modal.toast(response.msg);
                }
            });
        },
        /**
         * 根据button的refresh属性
         * @param {int} refresh
         * 0 - 本页面不刷新
         * 1 - 本页面刷新
         * 2 - 关闭本页面 页面并不刷新
         * 3 - 关闭本页面 页面并刷新
         * 4 - 本页不刷新 手动返回上级时刷新上级
         */
        btnRefresh: function (refresh) {
            switch (refresh) {
                case 1:
                    var page = SPA.pageGet();
                    page && page.refresh();
                    // BW.sys.window.fire(LeRule.EVT_REFRESH);
                    break;
                case 2:
                    setTimeout(function () {
                        SPA.close();
                    }, 900);
                    break;
                case 3:
                    setTimeout(function () {
                        SPA.close();
                        setTimeout(function () {
                            var page = SPA.pageGet();
                            page && page.refresh();
                        }, 100);
                    }, 900);
                    break;
                case 4:
                    // BW.sys.window.firePreviousPage(BwRule.EVT_REFRESH, null, url);
                    break;
                default:
            }
        }
    };
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

/// <reference path="index.ts"/>
/// <reference path="common/Config.ts"/>
/// <reference path="common/rule/LeRule.tsx"/>
