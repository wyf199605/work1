define("NewTablePage", ["require", "exports", "BasicPage", "BwRule", "newTableModule", "Modal", "Loading", "BwTableModule", "FastTable"], function (require, exports, basicPage_1, BwRule_1, newTableModule_1, Modal_1, loading_1, BwTableModule_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var sys = BW.sys;
    var CONF = BW.CONF;
    var d = G.d;
    var Component = G.Component;
    var queryModuleName = sys.isMb ? 'QueryModuleMb' : 'QueryModulePc';
    var NewTablePage = /** @class */ (function (_super) {
        __extends(NewTablePage, _super);
        function NewTablePage(para) {
            var _this = _super.call(this, para) || this;
            d.classAdd(_this.dom.parentElement, 'table-page');
            var bwTableEl = para.ui.body.elements[0];
            var bwTable = new BwTableElement({
                container: tools.isPc ? _this.dom : d.query('body > .mui-content'),
                tableEl: bwTableEl,
                asynData: para.ui.body.elements[1] // 异步查询
            });
            // Shell触发的刷新事件
            _this.on(BwRule_1.BwRule.EVT_REFRESH, function () {
                bwTable.tableModule && bwTable.tableModule.refresh();
            });
            return _this;
        }
        return NewTablePage;
    }(basicPage_1.default));
    exports.NewTablePage = NewTablePage;
    var BwTableElement = /** @class */ (function (_super) {
        __extends(BwTableElement, _super);
        function BwTableElement(para) {
            var _this = _super.call(this, para) || this;
            // d.classAdd(this.dom.parentElement, 'table-page');
            var bwTableEl = para.tableEl, isDynamic = tools.isEmpty(bwTableEl.cols), hasQuery = bwTableEl.querier && ([3, 13].includes(bwTableEl.querier.queryType));
            if (isDynamic) {
                // 动态加载查询模块
                var bwQueryEl_1 = bwTableEl;
                require([queryModuleName], function (Query) {
                    // console.log(this.para)
                    var isFirst = true;
                    var query = new Query({
                        qm: bwTableEl,
                        refresher: function (ajaxData, after, before) {
                            var uiPath = bwQueryEl_1.uiPath, url = CONF.siteUrl + BwRule_1.BwRule.reqAddr(uiPath);
                            ajaxData['output'] = 'json';
                            if (tools.isEmpty(uiPath)) {
                                Modal_1.Modal.alert('查询地址为空');
                                return;
                            }
                            var loading = new loading_1.Loading({
                                msg: '查询中..'
                            });
                            return BwRule_1.BwRule.Ajax.fetch(G.tools.url.addObj(url, ajaxData), {
                                timeout: 30000,
                                needGps: !!uiPath.needGps
                            }).then(function (_a) {
                                var response = _a.response;
                                delete ajaxData['output'];
                                d.off(window, 'wake');
                                _this.tableModule && _this.tableModule.destroy();
                                var tableEl = response.body.elements[0];
                                // this.para.tableDom = null;
                                _this.tableModule = new newTableModule_1.NewTableModule({
                                    bwEl: tableEl,
                                    container: _this.container,
                                    ajaxData: ajaxData,
                                });
                                _this.tableModule.main.ftable.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                                    var locationLine = tableEl.scannableLocationLine;
                                    if (locationLine && ajaxData.mobilescan) {
                                        _this.tableModule.main.ftable.locateToRow(locationLine, ajaxData.mobilescan);
                                    }
                                });
                                if (!sys.isMb) {
                                    isFirst && query.toggleCancle();
                                    _this.tableModule.main.ftable.btnAdd('query', {
                                        content: '查询器',
                                        type: 'default',
                                        icon: 'shaixuan',
                                        onClick: function () {
                                            query.show();
                                        }
                                    }, 0);
                                }
                                isFirst = false;
                                if (tableEl.autoRefresh) {
                                    sys.window.wake("wake", null);
                                    d.on(window, 'wake', function () {
                                        _this.tableModule && _this.tableModule.refresh();
                                    });
                                }
                            }).catch(function () {
                            }).finally(function () {
                                loading.destroy();
                                loading = null;
                            });
                        },
                        cols: [],
                        url: null,
                        container: _this.container,
                        tableGet: function () { return null; }
                    });
                    !sys.isMb && query.toggleCancle();
                    if (sys.isMb) {
                        //打开查询面板
                        d.on(d.query('body > header [data-action="showQuery"]'), 'click', function () {
                            query.show();
                        });
                    }
                    if (para.asynData) {
                        var asynData = {
                            query: query,
                            qm: bwTableEl,
                            container: _this.container,
                            asynData: para.asynData
                        };
                        _this.asynQuery(asynData);
                    }
                });
            }
            else {
                _this.tableModule = new newTableModule_1.NewTableModule({
                    bwEl: bwTableEl,
                    container: _this.container
                });
                if (hasQuery) {
                    require([queryModuleName], function (Query) {
                        _this.queryModule = new Query({
                            qm: bwTableEl.querier,
                            refresher: function (ajaxData) {
                                // debugger;
                                return _this.tableModule.refresh(ajaxData).then(function () {
                                    var locationLine = bwTableEl.scannableLocationLine;
                                    if (locationLine && ajaxData.mobilescan) {
                                        _this.tableModule.main.ftable.locateToRow(locationLine, ajaxData.mobilescan);
                                    }
                                });
                            },
                            cols: bwTableEl.cols,
                            url: CONF.siteUrl + BwRule_1.BwRule.reqAddr(bwTableEl.dataAddr),
                            container: _this.container,
                            tableGet: function () { return _this.tableModule.main; }
                        });
                        if (tools.isMb) {
                            //打开查询面板
                            d.on(d.query('body > header [data-action="showQuery"]'), 'click', function () {
                                _this.queryModule.show();
                            });
                        }
                        else {
                            var main_1 = _this.tableModule.main;
                            var addBtn_1 = function () {
                                main_1.ftable.btnAdd('query', {
                                    content: '查询器',
                                    type: 'default',
                                    icon: 'shaixuan',
                                    onClick: function () { _this.queryModule.show(); }
                                }, 0);
                            };
                            if (main_1.ftable) {
                                addBtn_1();
                            }
                            else {
                                main_1.on(BwTableModule_1.BwTableModule.EVT_READY, function () {
                                    addBtn_1();
                                });
                            }
                        }
                    });
                }
                if (bwTableEl.autoRefresh) {
                    sys.window.wake("wake", null);
                    d.on(window, 'wake', function () {
                        _this.tableModule && _this.tableModule.refresh();
                    });
                }
            }
            !isDynamic && _this.mobileScanInit(bwTableEl);
            _this.on(BwRule_1.BwRule.EVT_REFRESH, function () {
                _this.tableModule && _this.tableModule.refresh();
            });
            return _this;
        }
        BwTableElement.prototype.wrapperInit = function (para) {
            return undefined;
        };
        BwTableElement.prototype.asynQuery = function (asynData) {
            require(['AsynQuery'], function (asyn) {
                new asyn.AsynQuery(asynData);
            });
        };
        BwTableElement.prototype.mobileScanInit = function (ui) {
            var _this = this;
            var field = ui.scannableField;
            if (tools.isPc || !field) {
                return;
            }
            // console.log(this.para)
            require(['MobileScan'], function (M) {
                new M.MobileScan({
                    container: _this.container,
                    cols: ui.cols,
                    scannableField: field.toUpperCase(),
                    scannableType: ui.scannableType,
                    scannableTime: ui.scannableTime,
                    callback: function (ajaxData) {
                        var query = _this.queryModule, table = _this.tableModule;
                        if (query) {
                            query.hide();
                            return query.search(ajaxData, true);
                        }
                        else {
                            return table.refresh(Object.assign(table.main.ajaxData, ajaxData)).then(function () {
                                var locationLine = ui.scannableLocationLine;
                                if (locationLine) {
                                    table.main.ftable.locateToRow(locationLine, ajaxData.mobilescan);
                                }
                            });
                        }
                    }
                });
            });
        };
        return BwTableElement;
    }(Component));
    exports.BwTableElement = BwTableElement;
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
