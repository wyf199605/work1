define("TablePage", ["require", "exports", "BwRule", "Button", "BasicPage"], function (require, exports, BwRule_1, Button_1, basicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var TablePage = /** @class */ (function (_super) {
        __extends(TablePage, _super);
        // protected abstract initQuery(queryModule:typeof QueryModuleData, para : QueryModulePara);
        function TablePage(para, callback) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var mtPara = _this.para.mtPara;
            if (G.tools.isEmpty(mtPara.cols)) {
                // 有查询器
                var queryModuleName = BW.sys.isMb ? 'QueryModuleMb' : 'QueryModulePc';
                // 动态加载查询模块
                require([queryModuleName], function (Query) {
                    // console.log(this.para)
                    var isFirst = true, container = d.closest(sys.isMb ? _this.para.tableDom : _this.para.dom, '.page-container');
                    var query = new Query({
                        qm: mtPara,
                        refresher: function (ajaxData, after, before) {
                            var url = CONF.siteUrl + BwRule_1.BwRule.reqAddr(mtPara.uiPath);
                            ajaxData['output'] = 'json';
                            BwRule_1.BwRule.Ajax.fetch(G.tools.url.addObj(url, ajaxData), {
                                timeout: 30000,
                                defaultCallback: false,
                                needGps: mtPara && mtPara.uiPath && !!mtPara.uiPath.needGps
                            }).then(function (_a) {
                                var response = _a.response;
                                delete ajaxData['output'];
                                _this.tableModule && _this.tableModule.destroy();
                                _this.tableModule = null;
                                _this.para.tableDom = null;
                                var cb = function () {
                                    if (!sys.isMb) {
                                        isFirst && query.toggleCancle();
                                        _this.tableModule.rightBtns.add(new Button_1.Button({
                                            content: '查询器',
                                            type: 'default',
                                            icon: 'shaixuan',
                                            onClick: function () {
                                                query.show();
                                            }
                                        }));
                                    }
                                    isFirst = false;
                                    typeof callback === 'function' && callback();
                                    _this.tableModule.tableData.cbFun.setOuterAfter(after);
                                    _this.tableModule.tableData.cbFun.setOuterBefore(before);
                                };
                                _this.requireTable(response.body.elements[0], ajaxData, cb);
                            }).catch(function () {
                            });
                        },
                        cols: [],
                        url: null,
                        container: container,
                        tableGet: function () { return null; }
                    });
                    !sys.isMb && query.toggleCancle();
                    if (sys.isMb) {
                        //打开查询面板
                        d.on(d.query('body > header [data-action="showQuery"]'), 'click', function () {
                            query.show();
                        });
                    }
                    if (mtPara.asynData) {
                        var asynData = {
                            query: query,
                            qm: mtPara,
                            container: container,
                        };
                        _this.asynQuery(asynData);
                    }
                });
                // tools.obj.merge(true, )
            }
            else {
                _this.requireTable(mtPara, null, callback);
            }
            return _this;
        }
        // private initTableCommon(tableModule : typeof TableModule){}
        TablePage.prototype.requireTable = function (newMtPara, queryData, callback) {
            var _this = this;
            BwRule_1.BwRule.beforeHandle.table(newMtPara);
            var tableModuleName = this.isMb ? 'TableModuleMb' : 'TableModulePc';
            require([tableModuleName], function (tableModule) {
                _this.initTable(tableModule, newMtPara, queryData);
                var tm = _this.tableModule;
                _this.on(BwRule_1.BwRule.EVT_REFRESH, function () {
                    tm && tm.refresher(null, function () {
                        tm.aggregate.get();
                    });
                });
                //excel表格数据添加
                _this.on('table-data-add', function (e) {
                    //进入编辑模式
                    _this.tableModule.editBtns.edit();
                    setTimeout(function () {
                        // console.log(e.detail,this.tableModule.table.copy.match(e.detail));
                        _this.tableModule.table.copy.match(e.detail).forEach(function (obj) {
                            _this.tableModule.tableEdit.add(obj);
                        });
                    }, 800);
                });
                typeof callback === 'function' && callback();
            });
        };
        TablePage.prototype.asynQuery = function (data) {
            var _this = this;
            require(['AsynQuery'], function (asyn) {
                new asyn.AsynQuery(G.tools.obj.merge(_this.para, {
                    asynData: data
                }));
            });
        };
        return TablePage;
    }(basicPage_1.default));
    exports.TablePage = TablePage;
});

define("TablePageMb", ["require", "exports", "BwRule", "ButtonAction", "TablePage"], function (require, exports, BwRule_1, ButtonAction_1, tablePage_1) {
    "use strict";
    var d = G.d;
    return /** @class */ (function (_super) {
        __extends(TablePageMb, _super);
        function TablePageMb() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.dealConf = (function () {
                var addBtn = null;
                var headerBut = null;
                var _clickHandle = function () {
                    ButtonAction_1.ButtonAction.get().clickHandle(addBtn, null);
                };
                var add = function (newMtPara) {
                    destory();
                    var buttons = G.tools.isEmpty(newMtPara.subButtons) ? [] : newMtPara.subButtons;
                    var subTables = G.tools.isEmpty(newMtPara.subTableList) ? [] : newMtPara.subTableList;
                    var btnArray = [];
                    for (var _i = 0, buttons_1 = buttons; _i < buttons_1.length; _i++) {
                        var btn = buttons_1[_i];
                        if (btn.subType === 'insert') {
                            addBtn = btn;
                        }
                        else {
                            btnArray.push(btn);
                        }
                    }
                    newMtPara.subButtons = btnArray;
                    if (addBtn) {
                        var butHtml = '';
                        var tempBut = [addBtn];
                        for (var _a = 0, tempBut_1 = tempBut; _a < tempBut_1.length; _a++) {
                            var btn = tempBut_1[_a];
                            var tblBtn = btn;
                            butHtml += "<a class=\"mui-pull-right\"><span class=\"mui-icon " + tblBtn.icon + "\"></span>" + tblBtn.title + "</a>";
                        }
                        headerBut = d.create(butHtml);
                        d.before(d.query('body > header > .mui-pull-right'), headerBut);
                        // 绑定header中的事件
                        d.on(headerBut, 'tap', _clickHandle);
                    }
                    //从表
                    for (var _b = 0, subTables_1 = subTables; _b < subTables_1.length; _b++) {
                        var sTable = subTables_1[_b];
                        BwRule_1.BwRule.beforeHandle.table(sTable);
                    }
                };
                var destory = function () {
                    if (headerBut) {
                        d.off(headerBut, 'tap', _clickHandle);
                        d.remove(headerBut);
                    }
                };
                return { add: add };
            })();
            return _this;
        }
        TablePageMb.prototype.initTable = function (tableModule, newMtPara, queryData) {
            this.dealConf.add(newMtPara);
            if (!this.para.tableDom) {
                this.para.tableDom = d.create('<table class="mobileTable"><tbody></tbody></table>');
                var mobileCon = d.query('body > .mui-content');
                d.append(mobileCon, this.para.tableDom);
            }
            this.tableModule = new tableModule({
                tableEl: this.para.tableDom,
                scrollEl: document.body,
                // fixTop: 44,
                ajaxData: queryData
            }, newMtPara);
        };
        return TablePageMb;
    }(tablePage_1.TablePage));
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
