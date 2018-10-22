define("RfidSetting", ["require", "exports", "Modal", "MbPage"], function (require, exports, Modal_1, MbPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var RfidSettingModal = /** @class */ (function (_super) {
        __extends(RfidSettingModal, _super);
        function RfidSettingModal() {
            var _this = this;
            var rfidSetting = new RfidSetting({});
            _this = _super.call(this, {
                isShow: true,
                height: '100%',
                width: '100%',
                isOnceDestroy: true,
                className: 'modal-mbPage',
                position: 'down',
                onClose: function () {
                    rfidSetting.rfidClose();
                }
            }) || this;
            new MbPage_1.MbPage({
                container: _this.bodyWrapper,
                body: rfidSetting.wrapper,
                title: "rfid配置",
                left: [{
                        icon: 'mui-icon-left-nav',
                        iconPre: 'mui-icon',
                        onClick: function () {
                            _this.isShow = false;
                        }
                    }]
            });
            _this.rfidSetting = rfidSetting;
            return _this;
        }
        RfidSettingModal.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.rfidSetting.destroy();
        };
        return RfidSettingModal;
    }(Modal_1.Modal));
    exports.RfidSettingModal = RfidSettingModal;
    var RfidSetting = /** @class */ (function (_super) {
        __extends(RfidSetting, _super);
        function RfidSetting(para) {
            var _this = _super.call(this, para) || this;
            _this.powerEl = d.query('.power', _this.wrapper);
            _this.frequenEl = d.query('#frequency', _this.wrapper);
            _this.rfidcs = d.query('.rfid-setting-btn>input', _this.wrapper);
            _this.rfidcl = d.query('.rfid-clear>input', _this.wrapper);
            _this.jobReduce = d.query('.rfid-job-reduce', _this.wrapper);
            _this.restReduce = d.query('.rfid-rest-reduce', _this.wrapper);
            _this.jobInput = d.query('.rifd-job-input', _this.wrapper);
            _this.restInput = d.query('.rifd-rest-input', _this.wrapper);
            _this.jobAdd = d.query('.rfid-job-add', _this.wrapper);
            _this.restAdd = d.query('.rfid-rest-add', _this.wrapper);
            _this.rfidOpen();
            _this.getband();
            _this.getMinMaxBand();
            _this.rfidsave();
            _this.clearCook();
            _this.keyupReduce();
            _this.keyupAdd();
            return _this;
        }
        RfidSetting.prototype.wrapperInit = function (para) {
            return h("form", { className: 'rfid-setting-page' },
                h("div", { className: "rfid-power" },
                    h("span", null, "\u8F93\u51FA\u529F\u7387:"),
                    h("div", null,
                        h("select", { name: "power", class: "power" },
                            h("option", { value: "0" }, "--\u8BF7\u9009\u62E9--"),
                            h("option", { value: "\u529F\u7387" }, "--\u529F\u7387--")),
                        "dMB")),
                h("div", { className: "rfid-frequency" },
                    h("span", null, "\u8F93\u51FA\u9891\u7387:"),
                    h("select", { name: "frequency", id: "frequency" },
                        h("option", { value: "0" }, "--\u8BF7\u9009\u62E9--"),
                        h("option", { value: "\u54C8\u54C8" }, "--\u8BF7\u9009\u62E9--"))),
                h("div", { className: "rfid-model" },
                    h("span", null, "\u8702\u9E23\u6A21\u5F0F:"),
                    h("div", null,
                        h("label", null,
                            "\u8FDE\u7EED ",
                            h("input", { name: "mode", type: "radio", value: "lianxu" })),
                        h("label", null,
                            "\u4E0D\u8FDE\u7EED ",
                            h("input", { name: "mode", type: "radio", value: "nolianxu" })))),
                h("div", { className: "rfid-job" },
                    h("span", null, "\u5DE5\u4F5C\u6A21\u5F0F:"),
                    h("div", { className: "rfid-number" },
                        h("div", { className: "rfid-reduce rfid-job-reduce" }, "-"),
                        h("input", { type: "number", className: "rifd-job-input" }),
                        h("div", { className: "rfid-add rfid-job-add" }, "+")),
                    "MS"),
                h("div", { className: "rfid-rest" },
                    h("span", null, "\u4F11\u606F\u6A21\u5F0F:"),
                    h("div", { className: "rfid-number" },
                        h("div", { className: "rfid-reduce rfid-rest-reduce" }, "-"),
                        h("input", { type: "number", className: "rifd-rest-input" }),
                        h("div", { className: "rfid-add rfid-rest-add" }, "+")),
                    "MS"),
                h("div", { className: "rfid-gun" },
                    h("span", null, "\u76D8\u70B9\u68D2:"),
                    h("div", { class: "rfid-gun-set" },
                        h("select", { name: "rod", id: "rod", class: "rfid-rod" },
                            h("option", { value: "0", class: "rod-f" }, "\u5426"),
                            h("option", { value: "1", class: "rod-t" }, "\u662F")))),
                h("div", { className: "rfid-setting-btn" },
                    h("input", { type: "button", value: "\u4FDD\u5B58" })),
                h("div", { className: "rfid-setting-btn rfid-clear" },
                    h("input", { type: "button", value: "\u6E05\u9664\u7F13\u5B58" })));
        };
        RfidSetting.prototype.getParam = function () {
            var powerRes;
            var that = this;
            powerRes = G.Shell.inventory.rfidGetParam({}, function (res) {
                var data = res.data;
                that.powerEl.innerHTML = "";
                that.frequenEl.innerHTML = "";
                var powerel = h("option", { value: data.power }, data.power);
                that.powerEl.appendChild(powerel);
                var freel = h("option", { value: data.frequencyMode }, data.frequencyMode);
                that.frequenEl.appendChild(freel);
            });
            //{“frequencyMode”:"美国标准(902~928MHz)","power":"30"} 渲染数据到页面上
        };
        RfidSetting.prototype.rfidOpen = function () {
            var _this = this;
            var that = this, rfidGun = d.query('.rfid-rod', that.wrapper), rodSel = d.queryAll('option', rfidGun), result = G.Shell.inventory.defaultRfidDevice("get", 0);
            if (G.tools.isNotEmpty(result) && result.data === 0) {
                //rodF['selected'] = "selected";
                // rodF['selected'] = true;
                rodSel[0]['selected'] = true;
            }
            else {
                // rodT['selected'] = "selected";
                rodSel[1]['selected'] = true;
            }
            G.Shell.inventory.getPwn(function (res) {
                var val = res.data;
                if (val) {
                    that.jobInput['value'] = val.workTime;
                    that.restInput['value'] = val.waitTime;
                    _this.getParam();
                }
            });
        };
        RfidSetting.prototype.getband = function () {
            var that = this;
            G.Shell.inventory.getBand({}, function (res) {
                var resData = res.data;
                d.on(that.frequenEl, 'focus', function () {
                    var frag = document.createDocumentFragment();
                    this.innerHTML = "";
                    for (var i = 0; i < resData.length; i++) {
                        var option = h("option", { value: resData[i] }, resData[i]);
                        frag.appendChild(option);
                    }
                    this.appendChild(frag);
                });
            });
        };
        RfidSetting.prototype.getMinMaxBand = function () {
            var _this = this;
            G.Shell.inventory.getMinMaxBand({}, function (res) {
                var data = res.data;
                d.on(_this.powerEl, 'click', function (e) {
                    e.stopPropagation();
                    var frag = document.createDocumentFragment();
                    _this.powerEl.innerHTML = "";
                    for (var i = 0; i < data.length; i++) {
                        var option = h("option", { value: data[i] }, data[i]);
                        frag.appendChild(option);
                    }
                    _this.powerEl.appendChild(frag);
                });
            });
        };
        // 保存
        RfidSetting.prototype.rfidsave = function () {
            var _this = this;
            d.on(this.rfidcs, 'click', function () {
                var power = _this.powerEl['value'];
                var fre = _this.frequenEl['value'];
                var jobInput = _this.jobInput['value'];
                var resInput = _this.restInput['value'];
                var data = { 'band': fre, 'powerBand': power }, rfidGun = d.query('.rfid-rod', _this.wrapper), rodSel = d.queryAll('option', rfidGun);
                G.Shell.inventory.rfidSetParam(data, function (res) {
                    if (res.data === "成功") {
                        G.Shell.inventory.setPwm({ "workTime": jobInput, "waitTime": resInput }, function (res) {
                        });
                        var num = parseInt(rfidGun['value']);
                        G.Shell.inventory.defaultRfidDevice("set", num);
                    }
                });
            });
        };
        //清除缓存
        RfidSetting.prototype.clearCook = function () {
            d.on(this.rfidcl, 'click', function () {
                var re = G.Shell.inventory.clearData('', function (res) {
                });
            });
        };
        RfidSetting.prototype.rfidClose = function () {
            var close = G.Shell.inventory.rfidClose(function (res) {
            });
        };
        //监听减少和增加事件
        RfidSetting.prototype.keyupReduce = function () {
            var _this = this;
            d.on(this.jobReduce, 'click', function () {
                var val = _this.jobInput['value'];
                if (val && val > 0) {
                    _this.jobInput['value'] = parseInt(val) - 1;
                }
            });
            d.on(this.restReduce, 'click', function () {
                var resVal = _this.restInput['value'];
                if (resVal && resVal > 0) {
                    _this.restInput['value'] = parseInt(resVal) - 1;
                }
            });
        };
        RfidSetting.prototype.keyupAdd = function () {
            var _this = this;
            d.on(this.jobAdd, 'click', function () {
                var val = _this.jobInput['value'];
                if (val && val > 0) {
                    _this.jobInput['value'] = parseInt(val) + 1;
                }
            });
            d.on(this.restAdd, 'click', function () {
                var resVal = _this.restInput['value'];
                if (resVal && resVal > 0) {
                    _this.restInput['value'] = parseInt(resVal) + 1;
                }
            });
        };
        return RfidSetting;
    }(Component));
    exports.RfidSetting = RfidSetting;
});
//操作 保存状态

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
