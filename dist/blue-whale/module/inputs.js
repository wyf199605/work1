define("Inputs", ["require", "exports", "Modal", "Toast", "BwRule"], function (require, exports, Modal_1, Toast_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name="Inputs"/>
    var d = G.d;
    var CONF = BW.CONF;
    /**
     * monitorKey
     */
    var Inputs = /** @class */ (function () {
        function Inputs(para) {
            this.para = para;
            this.p = para;
            this.eventInit(para);
        }
        /**
         * 匹配成功
         * @param data
         * @param text
         */
        Inputs.prototype.matchPass = function (data, text) {
            var newUrl = this.url ? this.url : data.dataAddr.dataAddr;
            if (newUrl.indexOf('?') > -1) {
                newUrl += '&';
            }
            else {
                newUrl += '?';
            }
            var ajaxUrl = CONF.siteUrl + newUrl + data.fieldName.toLowerCase() + '=' + text;
            var self = this;
            ajaxLoad(ajaxUrl);
            function ajaxLoad(aUrl) {
                BwRule_1.BwRule.Ajax.fetch(aUrl)
                    .then(function (_a) {
                    var response = _a.response;
                    var category = response.body.bodyList[0].category, type = category.type, showText = category.showText;
                    self.url = category.url;
                    switch (type) {
                        case 0:
                            //数据覆盖
                            response.data && (self.p.table.data = response.data);
                            logTip();
                            break;
                        case 1:
                            //标签打印
                            // debugger
                            self.p.table.labelPrint.show(self.p.table.labelBtn.wrapper, category.printList, function () {
                                ajaxLoad(CONF.siteUrl + self.url);
                            });
                            logTip();
                            break;
                        case 2:
                            //提示错误信息
                            Modal_1.Modal.alert(showText);
                            break;
                        case 3:
                            //提示信息,确定(下一步)/取消
                            Modal_1.Modal.confirm({
                                msg: showText,
                                btns: ['取消', '确定'],
                                callback: function (index) {
                                    if (index === true) {
                                        ajaxLoad(CONF.siteUrl + self.url);
                                    }
                                    else {
                                        self.url = null;
                                    }
                                }
                            });
                            break;
                        case 4:
                            //提示信息,自动下一步
                            ajaxLoad(CONF.siteUrl + self.url);
                            logTip();
                            break;
                    }
                    if (!type && type !== 0) {
                        logTip();
                    }
                    function logTip() {
                        self.m && self.m.destroy();
                        self.m = new Toast_1.Toast({
                            duration: 0,
                            type: 'simple',
                            isClose: true,
                            position: 'bottom',
                            content: showText,
                            container: self.para.container
                        });
                    }
                });
            }
        };
        /**
         * 初始化按键事件
         * @param para
         */
        Inputs.prototype.eventInit = function (para) {
            var _this = this;
            para.inputs.forEach(function (obj) {
                var container = d.closest(para.container, '.mobileTableWrapper'), text = '', timer = null, timeInterval = obj.timeout;
                d.on(container, 'keydown', function (e) {
                    text += e.key;
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        var len = text.length;
                        if (obj.minLength <= len && len <= obj.maxLength) {
                            var reg = _this.regExpMatch(para.inputs, text);
                            //匹配成功
                            reg && _this.matchPass(reg, text);
                        }
                        timer = null;
                        text = '';
                    }, timeInterval);
                });
            });
        };
        /**
         * 正则匹配按键
         * @param inputs
         * @param inputContent
         * @returns {boolean}
         */
        Inputs.prototype.regExpMatch = function (inputs, inputContent) {
            var regArr, data;
            inputs.forEach(function (d) {
                if (d.fieldRegex && d.inputType === '2') {
                    regArr = d.fieldRegex.split(';');
                    regArr.forEach(function (r) {
                        var patt = inputContent.match(r);
                        if (patt && patt[0] === inputContent) {
                            data = d;
                        }
                    });
                }
            });
            return data;
        };
        return Inputs;
    }());
    exports.Inputs = Inputs;
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
