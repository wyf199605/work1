define("RfidBarCode", ["require", "exports", "Toggle", "Modal", "SelectInputMb", "Loading"], function (require, exports, toggle_1, Modal_1, selectInput_mb_1, loading_1) {
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
            _this.downData(para);
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
                        h("span", { className: "shelf-category" }, "\u8D27\u67B6\u53F7:"),
                        h("span", { className: "shelf-number" }, "1002004"),
                        h("i", { className: "iconfont icon-shuxie", onclick: function () {
                                var mode = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: _this.domHash['category'],
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: d.create("<div data-code=\"barcodeModal\">\n                                        <form>\n                                            <label>\u8BF7\u8F93\u5165:</label>\n                                            <input type=\"text\" class=\"set-rfid-shelf\" style=\"height: 30px\">\n                                        </form>\n                                    </div>"),
                                    footer: {},
                                    onOk: function () {
                                        var val = d.query('.set-rfid-shelf')['value'];
                                        //console.log(d.query('.set-rfid-code').value);
                                        d.query('.rfid-shelf-number>.shelf-number').innerText = val;
                                        console.log("打印了");
                                        mode.destroy();
                                    },
                                    onClose: function () {
                                        Modal_1.Modal.toast('输入成功');
                                    }
                                });
                            } })),
                    h("div", { class: "rfid-barCode-content" },
                        h("div", { class: "rfid-barCode-left" },
                            h("span", { class: "title2" }, "\u5206\u7C7B-\u6807\u98982 "),
                            h("i", { className: "iconfont icon-shuxie", onclick: function () {
                                    var s;
                                    var mode = new Modal_1.Modal({
                                        isMb: false,
                                        position: "center",
                                        header: _this.domHash['category1'],
                                        isOnceDestroy: true,
                                        isBackground: true,
                                        body: d.create("<div data-code=\"barcodeModal\">\n                                        <form>\n                                            <label>\u8BF7\u8F93\u5165:</label>\n                                            <input type=\"text\" class=\"set-rfid-shelf\" style=\"height: 30px\">\n                                        </form>\n                                    </div>"),
                                        footer: {},
                                        onOk: function () {
                                            var val = d.query('.set-rfid-shelf')['value'];
                                            //console.log(d.query('.set-rfid-code').value);
                                            _this.domHash['categoryVal1'].innerText = val;
                                            console.log("打印了");
                                            mode.destroy();
                                        },
                                        onClose: function () {
                                            Modal_1.Modal.toast('输入成功');
                                        }
                                    });
                                } }),
                            h("p", { class: "value2", style: "color:rgb(0, 122, 255)" }, "100000"),
                            h("span", { className: "title3" }, "\u5206\u7C7B-\u6807\u98983 "),
                            " ",
                            h("i", { className: "iconfont icon-shuxie", onClick: function () {
                                    var mode = new Modal_1.Modal({
                                        isMb: false,
                                        position: "center",
                                        header: _this.domHash['category2'],
                                        isOnceDestroy: true,
                                        isBackground: true,
                                        body: d.create("<div data-code=\"barcodeModal\">\n                                        <form>\n                                            <label>\u8BF7\u8F93\u5165:</label>\n                                            <input type=\"text\" class=\"set-rfid-shelf\" style=\"height: 30px\">\n                                        </form>\n                                    </div>"),
                                        footer: {},
                                        onOk: function () {
                                            var val = d.query('.set-rfid-shelf')['value'];
                                            //console.log(d.query('.set-rfid-code').value);
                                            _this.domHash['categoryVal2'].innerText = val;
                                            console.log("打印了");
                                            mode.destroy();
                                        },
                                        onClose: function () {
                                            Modal_1.Modal.toast('输入成功');
                                        }
                                    });
                                } }),
                            h("p", { class: "value3", style: "color:rgb(0, 122, 255)" }, "2321312")),
                        h("div", { class: "rfid-barCode-right" },
                            h("p", { class: "title" }, "\u6761\u7801"),
                            h("p", { class: "value", style: "color:red" }))),
                    h("div", { class: "rifd-bar-code-describe" }, "\u5345\u8FBE\u590F \u5305\u888BOL/\u660E\u5A9A481 109 \u9ED1\u8272"),
                    h("div", { class: "rfid-barCode-nums" },
                        h("div", { class: "rfid-barCode-set" },
                            h("div", { class: "set-row" },
                                h("div", null, "\u9010\u4E00\u626B\u63CF"),
                                h(toggle_1.Toggle, { size: 20, custom: { check: "ON", noCheck: "OFF" }, onClick: function (isChecked) {
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
                                        // 切换注入监听事件
                                        var optionStype, where = {}, modeVal = d.query('.shelf-nums>input');
                                        _this.fields && _this.fields.forEach(function (re) {
                                            if (re.index == 0) {
                                                where[re.name] = _this.domHash['categoryVal'];
                                            }
                                            else if (re.index == 1) {
                                                where[re.name] = _this.domHash['categoryVal1'];
                                            }
                                            else {
                                                where[re.name] = _this.domHash['categoryVal2'];
                                            }
                                        });
                                        if (_this.mode[key] == '逐一') {
                                            optionStype = 2;
                                            _this.params = {
                                                optionStype: optionStype,
                                                num: modeVal['value'] || 0,
                                                nameId: para.uniqueFlag,
                                                Where: where
                                            };
                                            //先关闭之前的监听重新开启
                                            //开启重新的
                                            G.Shell.inventory.openRegistInventory(2, _this.params, function (res) {
                                                alert(JSON.stringify(res));
                                                var num = d.query('.total-nums>span');
                                                num.innerText = (parseInt(num.innerText) + 1) + '';
                                                var data = res.data;
                                                if (data.name) {
                                                    var arr = data.array;
                                                    for (var i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value);
                                                        _this.domHash['barcode'].innerText = arr[i].barcode;
                                                        _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        _this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        _this.domHash['count'].innerText = arr[i].count;
                                                        _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        _this.domHash['Commodity'].innerText = arr[i].name;
                                                    }
                                                }
                                            });
                                        }
                                        else if (_this.mode[key] == '替换') {
                                            G.Shell.inventory.openRegistInventory(1, _this.params, function (res) {
                                                //alert(JSON.stringify(res))
                                                var data = res.data;
                                                _this.fields.forEach(function (res) {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                    else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal1'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal2'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                });
                                                if (data.name == _this.uid) {
                                                    var arr = data.array;
                                                    for (var i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value);
                                                        _this.domHash['barcode'].innerText = arr[i].barcode;
                                                        _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        _this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        _this.domHash['count'].innerText = arr[i].count;
                                                        _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        _this.domHash['Commodity'].innerText = arr[i].name;
                                                    }
                                                }
                                            });
                                        }
                                    } })),
                            h("div", { class: "set-row" },
                                h("div", null, "\u7D2F\u52A0"),
                                h(toggle_1.Toggle, { size: 20, custom: { check: "ON", noCheck: "OFF" }, onClick: function (isChecked) {
                                        isChecked ? _this.accumulation = "1" : _this.accumulation = "0";
                                        var key = _this.stepByone + _this.accumulation;
                                        if (key && _this.mode[key]) {
                                            d.query(".shelf-nums>.shelf-mode").innerHTML = _this.mode[key];
                                        }
                                        // 切换注入监听事件
                                        var optionStype, where = {}, modeVal = d.query('.shelf-nums>input');
                                        _this.fields && _this.fields.forEach(function (re) {
                                            if (re.index == 0) {
                                                where[re.name] = _this.domHash['categoryVal'];
                                            }
                                            else if (re.index == 1) {
                                                where[re.name] = _this.domHash['categoryVal1'];
                                            }
                                            else {
                                                where[re.name] = _this.domHash['categoryVal2'];
                                            }
                                        });
                                        if (_this.mode[key] == '累加') {
                                            optionStype = 1;
                                            _this.params = {
                                                optionStype: optionStype,
                                                num: modeVal['value'] || 0,
                                                nameId: para.uniqueFlag,
                                                Where: where
                                            };
                                            //先关闭之前的监听重新开启
                                            G.Shell.inventory.closeRegistInventory(2, _this.params, function (res) {
                                            });
                                            //开启重新的
                                            G.Shell.inventory.openRegistInventory(2, _this.params, function (res) {
                                                alert(JSON.stringify(res));
                                                var data = res.data;
                                                if (data.name) {
                                                    var arr = data.array;
                                                    for (var i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value);
                                                        _this.domHash['barcode'].innerText = arr[i].barcode;
                                                        _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        _this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        _this.domHash['count'].innerText = arr[i].count;
                                                        _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        _this.domHash['Commodity'].innerText = arr[i].name;
                                                    }
                                                }
                                            });
                                            //
                                        }
                                        else if (_this.mode[key] == '替换') {
                                            G.Shell.inventory.openRegistInventory(1, _this.params, function (res) {
                                                //alert(JSON.stringify(res))
                                                var data = res.data;
                                                _this.fields.forEach(function (res) {
                                                    if (res.index == 1) {
                                                        //分类一
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                    else if (res.index == 2) {
                                                        //分类二
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal1'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        //分类三
                                                        if (data.name == res.name) {
                                                            var arr = data.array;
                                                            for (var i = 0; i < arr.length; i++) {
                                                                _this.domHash['categoryVal2'] = arr[i].value;
                                                            }
                                                        }
                                                    }
                                                });
                                                if (data.name == _this.uid) {
                                                    var arr = data.array;
                                                    for (var i = 0; i < arr.length; i++) {
                                                        alert(arr[i].classify1_value);
                                                        _this.domHash['barcode'].innerText = arr[i].barcode;
                                                        _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                        _this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                        _this.domHash['count'].innerText = arr[i].count;
                                                        _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                        _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                        _this.domHash['Commodity'].innerText = arr[i].name;
                                                    }
                                                }
                                            });
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
                            h("span", { style: "color:#007aff" }, "0"))),
                    h("div", { class: "total-rfid" },
                        h("p", { class: "bar-code-scan" },
                            "\u5171\u626B\u63CF",
                            h("span", null, "0"),
                            "\u9879"),
                        h("p", { class: "bar-code-amount" },
                            "\u603B\u6570\u91CF\u4E3A",
                            h("span", null, "0")))),
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
                                        var val = d.query('.set-rfid-code')['value'], category = [];
                                        category.push(d.query('.rfid-shelf-number>.shelf-number').innerText);
                                        d.query('.rfid-barCode-content>.rfid-barCode-right>.value').innerHTML = val;
                                        //替换，累加，上传
                                        G.Shell.inventory.inputcodedata(0, para.uniqueFlag, val, category, function (res) {
                                            alert(JSON.stringify(res));
                                            var data = res.data;
                                            var arr = data.array;
                                            for (var i = 0; i < arr.length; i++) {
                                                if (arr[i].name) {
                                                    _this.domHash['barcode'].innerText = arr[i].barcode;
                                                    _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                                                    _this.domHash['scanamout'].innerText = arr[i].scanCount;
                                                    _this.domHash['count'].innerText = arr[i].count;
                                                    _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                                                    _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                                                    _this.domHash['Commodity'].innerText = arr[i].name;
                                                }
                                            }
                                        });
                                        mode.destroy();
                                    },
                                    onClose: function () {
                                        //Modal.toast('输入成功');
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
                                        h("p", null, _this.domHash['inventory'].innerHTML),
                                        h("p", null,
                                            "\u64CD\u4F5C\u8005\u4FE1\u606F:",
                                            para.USERID + "店" + para.SHO_ID),
                                        h("p", null,
                                            '共扫描' + _this.domHash['scanamout'].innerText + '项',
                                            "\uFF0C",
                                            '总数量为' + _this.domHash['count'].innerText),
                                        h("div", null,
                                            h("p", null, "\u4E0A\u4F20\u6570\u636E\u5904\u7406\u65B9\u5F0F"),
                                            updataEl = h(selectInput_mb_1.SelectInputMb, { data: str }))),
                                    footer: {
                                        rightPanel: [{
                                                content: "上传",
                                                onClick: function () {
                                                    console.log(updataEl.getText());
                                                    ;
                                                    G.Shell.inventory.uploadcodedata(para.uniqueFlag, function (res) {
                                                        alert(JSON.stringify(res));
                                                    });
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
                                var deleteEL, uid, category;
                                uid = _this.uid;
                                _this.fields.forEach(function (res) {
                                    if (res.index == 1) {
                                        category = res.name;
                                    }
                                });
                                var deModel = new Modal_1.Modal({
                                    isMb: false,
                                    position: "center",
                                    header: '请选择删除数据范围 ',
                                    isOnceDestroy: true,
                                    isBackground: true,
                                    body: h("div", { "data-code": "deleteModal" },
                                        h("div", null, deleteEL = h(selectInput_mb_1.SelectInputMb, { data: [{ value: { 'barcode': '', 'category': '' }, text: "所有" }, { value: { 'barcode': '', 'category': _this.domHash['categoryVal'].innerHTML }, text: _this.domHash['category'].innerText }, {
                                                    value: { 'barcode': _this.domHash['barcode'].innerText, 'category': _this.domHash['categoryVal'].innerText }, text: _this.domHash['category'].innerText + "条码" + _this.domHash['barcode'].innerText
                                                }, { value: { 'barcode': _this.domHash['barcode'].innerText, 'category': '' }, text: '条码' + _this.domHash['barcode'].innerText }] }))),
                                    footer: {
                                        rightPanel: [{
                                                content: "确认删除",
                                                onClick: function () {
                                                    console.log(deleteEL.getText());
                                                    console.log(deleteEL.get());
                                                    var value = deleteEL.get(), where = {};
                                                    where[uid] = value.barcode;
                                                    where[category] = value.category;
                                                    G.Shell.inventory.delInventoryData(para.uniqueFlag, where, function (res) {
                                                        alert(JSON.stringify(res));
                                                    });
                                                    deModel.destroy();
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
                            } }, "\u5220\u9664\u6570\u636E"))));
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
            var category = d.query('.rfid-shelf-number>.shelf-category'), barcode = d.query('.rfid-barCode-content>.rfid-barCode-right>.value'), barcodeTitl = d.query('.rfid-barCode-content>.rfid-barCode-right>.title'), categoryVal = d.query('.rfid-shelf-number>.shelf-number'), category1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title2'), category2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.title3'), categoryVal1 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value2'), categoryVal2 = d.query('.rfid-barCode-content>.rfid-barCode-left>.value3'), Commodity = d.query('.rifd-bar-code-describe'), num = d.query('.shelf-nums'), scanamout = d.query('.total-rfid >.bar-code-scan>span'), count = d.query('.total-rfid>.bar-code-amount>span'), title = d.query('.rfid-barCode-title>.barCode-title'), title1 = d.query('.rfid-barCode-title>.barCode-title1'), inventory = d.query('.rfid-barCode-body>.rfid-barCode-inventory');
            this.domHash['category'] = category;
            this.domHash['barcode'] = barcode;
            this.domHash['categoryVal'] = categoryVal;
            this.domHash['category1'] = category1;
            this.domHash['category2'] = category2;
            this.domHash['categoryVal1'] = categoryVal1;
            this.domHash['categoryVal2'] = categoryVal2;
            this.domHash['barcodeTitl'] = barcodeTitl;
            this.domHash['Commodity'] = Commodity;
            this.domHash['num'] = num;
            this.domHash['scanamout'] = scanamout;
            this.domHash['count'] = count;
            this.domHash['title'] = title;
            this.domHash['title1'] = title1;
            this.domHash['inventory'] = inventory;
        };
        RfidBarCode.prototype.downData = function (para) {
            var _this = this;
            var loading = new loading_1.Loading({
                msg: "加载中"
            });
            this.params = {
                optionStype: 0,
                num: 0,
                nameId: para.uniqueFlag,
            };
            //需要加个加载中
            var s = G.Shell.inventory.downloadbarcode(para.uniqueFlag, BW.CONF.siteUrl + para.downUrl, BW.CONF.siteUrl + para.uploadUrl, function (res) {
                var data = G.Shell.inventory.getTableInfo(para.uniqueFlag);
                var pageName = data.data;
                alert(JSON.stringify(pageName));
                _this.uid = pageName.uid;
                _this.domHash['inventory'].innerHTML = pageName.AffilTitle;
                _this.domHash['title'].innerText = pageName.funTitle;
                _this.domHash['barcodeTitl'].innerHTML = pageName.uidName;
                //分类字段
                _this.domHash['count'].innerHTML = pageName.count;
                _this.fields = pageName.fields;
                _this.fields.forEach(function (val) {
                    if (val.index == 1) {
                        _this.domHash['category'].innerText = val.title;
                    }
                    else if (val.index == 2) {
                        _this.domHash['category1'].innerText = val.title;
                    }
                    else {
                        _this.domHash['category2'].innerText = val.title;
                    }
                });
                loading.destroy();
            });
            G.Shell.inventory.openRegistInventory(1, this.params, function (res) {
                //alert(JSON.stringify(res))
                var data = res.data;
                _this.fields.forEach(function (res) {
                    if (res.index == 1) {
                        //分类一
                        if (data.name == res.name) {
                            var arr = data.array;
                            for (var i = 0; i < arr.length; i++) {
                                _this.domHash['categoryVal'] = arr[i].value;
                            }
                        }
                    }
                    else if (res.index == 2) {
                        //分类二
                        if (data.name == res.name) {
                            var arr = data.array;
                            for (var i = 0; i < arr.length; i++) {
                                _this.domHash['categoryVal1'] = arr[i].value;
                            }
                        }
                    }
                    else {
                        //分类三
                        if (data.name == res.name) {
                            var arr = data.array;
                            for (var i = 0; i < arr.length; i++) {
                                _this.domHash['categoryVal2'] = arr[i].value;
                            }
                        }
                    }
                });
                if (data.name == _this.uid) {
                    var arr = data.array;
                    for (var i = 0; i < arr.length; i++) {
                        alert(arr[i].classify1_value);
                        _this.domHash['barcode'].innerText = arr[i].barcode;
                        _this.domHash['categoryVal'].innerText = arr[i].classify1_value;
                        _this.domHash['scanamout'].innerText = arr[i].scanCount;
                        _this.domHash['count'].innerText = arr[i].count;
                        _this.domHash['categoryVal1'].innerText = arr[i].classify2_value;
                        _this.domHash['categoryVal2'].innerText = arr[i].classify3_value;
                        _this.domHash['Commodity'].innerText = arr[i].name;
                    }
                }
            });
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
