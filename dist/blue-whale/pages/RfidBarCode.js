define("RfidBarCode", ["require", "exports", "Toggle", "Modal", "SelectInputMb"], function (require, exports, toggle_1, Modal_1, selectInput_mb_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="RfidBarCode"/>
    var Component = G.Component;
    var d = G.d;
    var RfidBarCode = /** @class */ (function (_super) {
        __extends(RfidBarCode, _super);
        function RfidBarCode(para) {
            var _this = _super.call(this, para) || this;
            _this.stepByone = "0";
            _this.accumulation = "0";
            _this.mode = { "00": "替换", "01": "累加", "10": "逐一", "11": "请选择" };
            _this.domHash = { "title": null, "title1": "", "inventory": null, "category": null, "barcode": null, "category1": null, "Commodity": null, "num": null, "scanamout": null, "count": null };
            var key = _this.stepByone + _this.accumulation;
            if (key && _this.mode[key]) {
                d.query(".shelf-nums>.shelf-mode").innerText = _this.mode[key];
            }
            var body = h("div", null);
            new Modal_1.Modal({
                className: 'rfid-bar-code',
                zIndex: 1000,
                body: body,
                header: "条码扫码"
            });
            _this.container = body;
            _this.InitRfidBarCode();
            return _this;
        }
        RfidBarCode.prototype.wrapperInit = function (para) {
            var _this = this;
            return h("div", { class: "rfidBarCode-page" },
                h("div", { class: "rfid-barCode-body" },
                    h("div", { class: "rfid-barCode-title" },
                        h("span", { class: "barCode-title" }, "\u76D8\u70B9\u5355 "),
                        h("span", { class: "barCode-title1" }, "\u9970\u54C1")),
                    h("div", { class: "rfid-barCode-inventory" }, "511X16020400000"),
                    h("div", { className: "rfid-shelf-number" },
                        h("i", { className: "iconfont icon-huojiaqu-" }),
                        h("span", { className: "shelf-category" },
                            "\u8D27\u67B6\u53F7:",
                            h("span", { className: "shelf-number" }, "1002004"),
                            " ")),
                    h("div", { class: "rfid-barCode-content" },
                        h("div", { class: "rfid-barCode-left" },
                            h("p", { class: "title" }, "\u5206\u7C7B"),
                            h("p", { class: "value1", style: "color:rgb(0, 122, 255)" }, "10023232"),
                            h("p", { class: "value2", style: "color:rgb(0, 122, 255)" }),
                            h("p", { class: "value3", style: "color:rgb(0, 122, 255)" }, "2321312")),
                        h("div", { class: "rfid-barCode-center" },
                            h("i", { className: "iconfont icon-tiaoma" })),
                        h("div", { class: "rfid-barCode-right" },
                            h("p", { class: "title" }, "\u6761\u7801"),
                            h("p", { class: "value", style: "color:red" }))),
                    h("div", { class: "rifd-bar-code-describe" }, "\u5345\u8FBE\u590F \u5305\u888BOL/\u660E\u5A9A481 109 \u9ED1\u8272"),
                    h("div", { class: "rfid-barCode-nums" },
                        h("div", { class: "rfid-barCode-set" },
                            h("div", { class: "set-row" },
                                h("div", null, "\u9010\u4E00\u626B\u63CF"),
                                h(toggle_1.Toggle, { size: 18, custom: { check: "ON", noCheck: "OFF" }, onClick: function (isChecked) {
                                        console.log(isChecked);
                                        isChecked ? _this.stepByone = "1" : _this.stepByone = "0";
                                        var key = _this.stepByone + _this.accumulation;
                                        if (key && _this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerText = _this.mode[key];
                                        }
                                        if (isChecked) {
                                            d.query('.shelf-nums>input')['disabled'] = true;
                                        }
                                        else {
                                            d.query('.shelf-nums>input')['disabled'] = false;
                                        }
                                    } })),
                            h("div", { class: "set-row" },
                                h("div", null, "\u7D2F\u52A0"),
                                h(toggle_1.Toggle, { size: 18, custom: { check: "ON", noCheck: "OFF" }, onClick: function (isChecked) {
                                        isChecked ? _this.accumulation = "1" : _this.accumulation = "0";
                                        var key = _this.stepByone + _this.accumulation;
                                        if (key && _this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerHTML = _this.mode[key];
                                        }
                                    } }))),
                        h("div", { class: "shelf-nums" },
                            "\u6570\u91CF(",
                            h("span", { class: "shelf-mode" }),
                            ")",
                            h("input", { type: "number" })),
                        h("div", { class: "total-nums" },
                            h("i", { class: "iconfont icon-zonghesum1" }),
                            "\u6570\u91CF:",
                            h("span", { style: "color:#007aff" }, "6"))),
                    h("div", { class: "total-rfid" },
                        h("p", { class: "bar-code-scan" },
                            "\u5171\u626B\u63CF",
                            h("span", null, "2"),
                            "\u9879"),
                        h("p", { class: "bar-code-amount" },
                            "\u603B\u6570\u91CF\u4E3A",
                            h("span", null, "11")))),
                h("div", { class: "rfid-barCode-footer" },
                    h("div", null,
                        h("button", { onclick: function () {
                                var mode = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: '请输入条码',
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: d.create("<div data-code=\"barcodeModal\">\n                                        <form>\n                                            <label>\u6761\u7801:</label>\n                                            <input type=\"text\" class=\"set-rfid-code\" style=\"height: 30px\">\n                                        </form>\n                                    </div>"),
                                    footer: {},
                                    onOk: function () {
                                        var val = d.query('.set-rfid-code')['value'];
                                        console.log(d.query('.set-rfid-code')['value']);
                                        //console.log(d.query('.set-rfid-code').value);
                                        d.query('.rfid-barCode-content>.rfid-barCode-right>.value').innerHTML = val;
                                        console.log("打印了");
                                        mode.destroy();
                                    },
                                    onClose: function () {
                                        Modal_1.Modal.toast('输入成功');
                                    }
                                });
                            } }, "\u8F93\u5165\u6761\u7801"),
                        h("button", { onclick: function () {
                                console.log(para.codeStype);
                                var str = [];
                                para.codeStype.forEach(function (val) {
                                    var obj = {};
                                    obj['value'] = val['IMPORTDATAMODE'];
                                    obj['text'] = val['IMPORTDATAMODE'];
                                    str.push(obj);
                                });
                                console.log(str);
                                var updataEl;
                                var mode = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: '上传数据 ',
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: h("div", { "data-code": "updataModal" },
                                        h("p", null, "\u8BBE\u5907\u5B58\u5728\u6570\u636E,\u4FE1\u606F\u5982\u4E0B"),
                                        h("p", null,
                                            _this.domHash['title'].innerText,
                                            " ",
                                            _this.domHash['title1'].innerText),
                                        h("p", null, _this.domHash['inventory']),
                                        h("p", null,
                                            "\u64CD\u4F5C\u8005\u4FE1\u606F:",
                                            para.USERID + "店" + para.SHO_ID),
                                        h("p", null,
                                            _this.domHash['scanamout'].innerText,
                                            "\uFF0C",
                                            _this.domHash['count'].innerText),
                                        h("div", null,
                                            h("p", null, "\u4E0A\u4F20\u6570\u636E\u5904\u7406\u65B9\u5F0F"),
                                            updataEl = h(selectInput_mb_1.SelectInputMb, { data: str }))),
                                    footer: {
                                        rightPanel: [{
                                                content: "上传",
                                                onClick: function () {
                                                    console.log(updataEl.getText());
                                                    ;
                                                    console.log("上传成功");
                                                }
                                            }]
                                    },
                                    onOk: function () {
                                        console.log("打印了");
                                        mode.destroy();
                                    },
                                    onClose: function () {
                                        Modal_1.Modal.toast('输入成功');
                                        mode.destroy();
                                    }
                                });
                            } }, "\u4E0A\u4F20\u6570\u636E"),
                        h("button", { onclick: function () {
                                var deleteEL;
                                var deModel = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: '请选择删除数据范围 ',
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: h("div", { "data-code": "deleteModal" },
                                        h("div", null, deleteEL = h(selectInput_mb_1.SelectInputMb, { data: [{ value: "", text: "所有" }, { value: "", text: _this.domHash['category'].innerText }, {
                                                    value: "", text: _this.domHash['category'].innerText + _this.domHash['barcode'].innerText
                                                }, { value: '', text: '条码' + _this.domHash['barcode'].innerText }] }))),
                                    footer: {
                                        rightPanel: [{
                                                content: "确认删除",
                                                onClick: function () {
                                                    console.log(deleteEL.showItems());
                                                    console.log(deleteEL.getText());
                                                    console.log(deleteEL.get());
                                                    console.log("上传成功");
                                                }
                                            }]
                                    },
                                    onOk: function () {
                                        console.log("打印了");
                                        deModel.destroy();
                                    },
                                    onClose: function () {
                                        Modal_1.Modal.toast('输入成功');
                                        deModel.destroy();
                                    }
                                });
                            } }, "\u5220\u9664\u6570\u636E"),
                        h("button", { onclick: function () {
                                var mode = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: '请输入货架号',
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: d.create("<div data-code=\"barcodeModal\">\n                                        <form>\n                                            <label>\u8D27\u67B6\u53F7:</label>\n                                            <input type=\"text\" class=\"set-rfid-shelf\" style=\"height: 30px\">\n                                        </form>\n                                    </div>"),
                                    footer: {},
                                    onOk: function () {
                                        var val = d.query('.set-rfid-shelf')['value'];
                                        //console.log(d.query('.set-rfid-code').value);
                                        d.query('.rfid-shelf-number>.shelf-category>.shelf-number').innerText = val;
                                        console.log("打印了");
                                        mode.destroy();
                                    },
                                    onClose: function () {
                                        Modal_1.Modal.toast('输入成功');
                                    }
                                });
                            } }, "\u8F93\u5165\u8D27\u67B6\u53F7"))));
        };
        RfidBarCode.prototype.InitDom = function () {
        };
        RfidBarCode.prototype.InitRfidBarCode = function () {
            var _this = this;
            //初始化监听输入框的值
            var modeVal = d.query('.shelf-nums>input');
            console.log(modeVal);
            modeVal.onchange = function () {
                console.log('开始改变');
                var num = d.query('.total-nums>span');
                var key = _this.stepByone + _this.accumulation;
                console.log(modeVal['value']);
                if (_this.mode[key] == "累加" && modeVal['value'] !== "") {
                    num.innerText = parseInt(num.innerText) + parseInt(modeVal['value']) + "";
                }
                else if (_this.mode[key] == "替换" && modeVal['value'] !== "") {
                    num.innerText = parseInt(modeVal['value']) + "";
                }
            };
            var category = d.query('.rfid-shelf-number'), barcode = d.query('.rfid-barCode-content>.rfid-barCode-right>.value'), category1 = d.query('.rfid-barCode-content>.rfid-barCode-right>.value1'), category2 = d.query('.rfid-barCode-content>.rfid-barCode-right>.value2'), category3 = d.query('.rfid-barCode-content>.rfid-barCode-right>.value3'), Commodity = d.query('.rifd-bar-code-describe'), num = d.query('.shelf-nums'), scanamout = d.query('.total-rfid >.bar-code-scan'), count = d.query('.total-rfid>.bar-code-amount'), title = d.query('.rfid-barCode-title>.barCode-title'), title1 = d.query('.rfid-barCode-title>.barCode-title1'), inventory = d.query('.rfid-barCode-inventory');
            console.log(num.innerText);
            console.log(scanamout.innerText);
            console.log(count.innerText);
            this.domHash['category'] = category;
            this.domHash['barcode'] = barcode;
            this.domHash['category1'] = category1;
            this.domHash['Commodity'] = Commodity;
            this.domHash['num'] = num;
            this.domHash['scanamout'] = scanamout;
            this.domHash['count'] = count;
            this.domHash['title'] = title;
            this.domHash['title1'] = title1;
            this.domHash['inventory'] = inventory;
        };
        return RfidBarCode;
    }(Component));
    exports.RfidBarCode = RfidBarCode;
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
