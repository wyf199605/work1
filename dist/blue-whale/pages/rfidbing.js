define("RfidBing", ["require", "exports", "Modal", "FastTable", "MbPage", "Button", "BwRule"], function (require, exports, Modal_1, FastTable_1, MbPage_1, Button_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var sys = BW.sys;
    var RfidBingModal = /** @class */ (function (_super) {
        __extends(RfidBingModal, _super);
        function RfidBingModal(para) {
            var _this = this;
            var epcList = new EpcList(para);
            _this = _super.call(this, {
                isShow: true,
                height: '100%',
                width: '100%',
                className: 'bind-report',
                position: 'down'
            }) || this;
            new MbPage_1.MbPage({
                container: _this.bodyWrapper,
                body: epcList.wrapper,
                title: '解绑/绑定',
                left: [{
                        icon: 'mui-icon-left-nav',
                        iconPre: 'mui-icon',
                        onClick: function () {
                            _this.isShow = false;
                        }
                    }]
            });
            _this.epcList = epcList;
            return _this;
        }
        RfidBingModal.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.epcList.destroy();
            this.epcList = null;
        };
        return RfidBingModal;
    }(Modal_1.Modal));
    exports.RfidBingModal = RfidBingModal;
    var EpcList = /** @class */ (function (_super) {
        __extends(EpcList, _super);
        function EpcList(para) {
            var _this = _super.call(this, para) || this;
            _this.turn = false;
            _this.bindtimer = null;
            _this.bindBarTime = null;
            _this.bingCell = {};
            _this.tableInit();
            _this.btnInit(para.bindBtn);
            _this.getSku(para.bindBtn.type);
            _this.judge(para);
            _this.colConfig(para.bindBtn);
            return _this;
        }
        EpcList.prototype.wrapperInit = function (para) {
            return h("div", { className: "rfid-bing-page" },
                h("div", { className: 'bind-screen-top' },
                    h("label", null,
                        "SKU",
                        this.skuEl = h("input", { type: "text" })),
                    h("div", { className: 'bind-data' },
                        h("div", { className: 'bind-tied-up' },
                            para.bindBtn.type == '0' ? '已解绑' : '已绑定',
                            " : ",
                            this.boundEl = h("span", null, "0")),
                        h("div", { className: 'bing-scanning' },
                            "\u626B\u63CF\u91CF: ",
                            this.scanNumEl = h("span", null, "0")))));
        };
        EpcList.prototype.btnInit = function (bindBtn) {
            var _this = this;
            var wrapper = h("div", { className: "rfid-bing-btns" }), content = bindBtn.caption, param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            var address = tools.url.addObj("/inventoryrfid/import/" + bindBtn.itemid + "/" + bindBtn.elementid, param), ftables = this.ftable, scanNumEl = this.scanNumEl, boundEl = this.boundEl;
            var i = 0;
            var s = new Button_1.Button({
                container: wrapper,
                content: '开始扫描',
                onClick: function () {
                    //测试
                    if (s.content === "开始扫描") {
                        G.Shell.inventory.startEpc({}, function (res) {
                            var epcArr = res.data;
                            if (Array.isArray(epcArr)) {
                                epcArr.forEach(function (val) {
                                    var epc = val.epc, table = _this.ftable.data, flag = true;
                                    for (var i_1 = 0; i_1 < table.length; i_1++) {
                                        if (epc == table[i_1].epc) {
                                            flag = false;
                                            break;
                                        }
                                    }
                                    if (flag) {
                                        ftables.dataAdd(epcArr);
                                        scanNumEl.innerHTML = parseInt(scanNumEl.innerHTML) + epcArr.length + '';
                                    }
                                });
                                tools.pattern.debounce(_this.senData, 500);
                            }
                        });
                        _this.updataCellData(bindBtn);
                        s.content = "停止扫描";
                    }
                    else {
                        console.log(_this.ftable.data);
                        clearInterval(_this.bindBarTime);
                        G.Shell.inventory.stopEpc({}, function (res) { });
                        s.content = "开始扫描";
                    }
                }
            });
            var c = new Button_1.Button({
                container: wrapper,
                content: '清除数据',
                onClick: function () {
                    ftables.data = []; //清空 但是打印长度为原来的长度
                    scanNumEl.innerHTML = 0 + '';
                    //Modal.alert(ftables.rows.length);
                    G.Shell.inventory.clearEpc([], function (res) {
                        if (res) {
                            ftables.data = []; //打印长度为原来的长度；
                        }
                    });
                }
            });
            var j = new Button_1.Button({
                container: wrapper,
                content: content,
                onClick: function () {
                    //更新绑定量
                    BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address, {
                        type: 'post',
                        data: {
                            info: bindBtn.type === '0' ? {
                                epc: _this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                            } : {
                                sku: _this.skuEl.value,
                                epc: _this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                            }
                        }
                    }).then(function (_a) {
                        var response = _a.response;
                        if (response) {
                            G.Shell.inventory.clearEpc([], function (res) {
                                if (res) {
                                    Modal_1.Modal.alert(response.msg, "", function () {
                                        if (content === "报废" || content === "调出" || content === "调入") {
                                            sys.window.close();
                                        }
                                    });
                                    boundEl.innerHTML = _this.ftable.data.length + parseInt(boundEl.innerHTML) + '';
                                    ftables.data = [];
                                    scanNumEl.innerHTML = 0 + '';
                                }
                            });
                            sys.window.firePreviousPage(BwRule_1.BwRule.EVT_REFRESH);
                        }
                    });
                }
            });
            d.append(this.wrapper, wrapper);
        };
        EpcList.prototype.tableInit = function () {
            var ftable = new FastTable_1.FastTable({
                container: this.wrapper,
                cols: [[{ name: 'epc', title: 'EPC' }]],
                page: {
                    size: 50
                },
                cellFormat: function (data) {
                    var fragDoc = document.createDocumentFragment();
                    d.append(fragDoc, data);
                    d.append(fragDoc, h("div", { className: "delete" }, "x"));
                    return {
                        text: fragDoc
                    };
                }
            });
            var that = this;
            ftable.click.add('tr>td>.delete', function () {
                var tr = this.parentElement.parentElement, rowIndex = parseInt(tr.dataset.index), str = [];
                that.scanNumEl.innerHTML = parseInt(that.scanNumEl.innerHTML) - 1 + '';
                var rowdata = ftable.rowGet(rowIndex).data;
                if (G.tools.isNotEmpty(rowdata)) {
                    str.push(rowdata);
                }
                ftable.rowDel([rowIndex]);
                G.Shell.inventory.clearEpc(str, function (res) {
                });
            });
            this.ftable = ftable;
        };
        //获取SKU
        EpcList.prototype.getSku = function (para) {
            var _this = this;
            if (para === '1') {
                G.Shell.inventory.openScan(function (res) {
                    if (res.data && res.data !== 'openSuponScan') {
                        _this.skuEl.value = res.data;
                    }
                });
            }
        };
        EpcList.prototype.judge = function (para) {
            if (para.bindBtn.type === '0') {
                d.query('.bind-screen-top>label', this.wrapper).style.display = 'none';
                // d.query('.bind-tied-up',this.wrapper).innerText = '已解绑:';
            }
            if (para.bindBtn.nohead) {
                d.query('.bind-data > .bind-tied-up', this.wrapper).style.display = 'none';
            }
        };
        EpcList.prototype.colConfig = function (bindBtn) {
            var _this = this;
            var param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            var address = tools.url.addObj("/inventoryrfid/getdata/" + bindBtn.itemid + "/" + bindBtn.elementid, param), line = d.query('.bind-data', this.wrapper), temp = document.createDocumentFragment();
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address).then(function (_a) {
                var response = _a.response;
                console.log(response.body.bodyList);
                //let data = res.body.bodyList || [];
                if (tools.isNotEmpty(response.body.bodyList)) {
                    var data = response.body.bodyList;
                    for (var i = 0; i < data.length; i++) {
                        data[i].forEach(function (val) {
                            var div = h("div", { className: val.calcField },
                                val.calcCaption,
                                " : ",
                                h("span", null, val.calcValue));
                            _this.bingCell[val.calcField] = d.query('span', div);
                            d.append(temp, div);
                        });
                    }
                    console.log(_this.bingCell);
                    d.append(line, temp);
                }
                //console.log(data)
            });
        };
        EpcList.prototype.updataCellData = function (bindBtn) {
            var _this = this;
            var param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            var address = tools.url.addObj("/inventoryrfid/getdata/" + bindBtn.itemid + "/" + bindBtn.elementid, param);
            this.bindBarTime = setInterval(function () {
                BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address, {
                    type: 'post',
                    data: {
                        info: bindBtn.type === '0' ? {
                            epc: _this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                        } : {
                            sku: _this.skuEl.value,
                            epc: _this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                        }
                    }
                }).then(function (_a) {
                    var response = _a.response;
                    if (tools.isNotEmpty(response.body.bodyList)) {
                        var data = response.body.bodyList;
                        console.log(data);
                        for (var i = 0; i < data.length; i++) {
                            ;
                            data[i].forEach(function (val) {
                                _this.bingCell[val.calcField].innerHTML = val.calcValue + "";
                            });
                        }
                    }
                    else {
                        clearInterval(_this.bindtimer);
                    }
                });
            }, 1009);
        };
        EpcList.prototype.senData = function (bindBtn) {
            //监听表格的动态
            var param = tools.isNotEmpty(bindBtn.param) ? bindBtn.param : {};
            var address = tools.url.addObj("/inventoryrfid/getdata/" + bindBtn.itemid + "/" + bindBtn.elementid, param);
            BwRule_1.BwRule.Ajax.fetch(BW.CONF.siteAppVerUrl + address, {
                type: 'post',
                data: {
                    info: bindBtn.type === '0' ? {
                        epc: this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                    } : {
                        sku: this.skuEl.value,
                        epc: this.ftable.data.filter(function (data) { return !!data; }).map(function (res) { return res.epc; })
                    }
                }
            }).then(function (_a) {
                var response = _a.response;
            });
        };
        return EpcList;
    }(Component));
    exports.EpcList = EpcList;
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
