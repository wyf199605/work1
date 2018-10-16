/// <amd-module name="LeTablePage"/>
define("LeTablePage", ["require", "exports", "LeTableModule", "LeQueryModule", "LeButtonGroup", "LeTableEditModule", "FastTable"], function (require, exports, LeTableModule_1, LeQueryModule_1, LeButtonGroup_1, LeTableEditModule_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var tools = G.tools;
    var d = G.d;
    var LeTablePage = /** @class */ (function (_super) {
        __extends(LeTablePage, _super);
        function LeTablePage(para) {
            return _super.call(this, para) || this;
        }
        Object.defineProperty(LeTablePage.prototype, "tableModule", {
            get: function () {
                return this._tableModule;
            },
            set: function (table) {
                this._tableModule = table;
            },
            enumerable: true,
            configurable: true
        });
        LeTablePage.prototype.wrapperInit = function (para) {
            var _this = this;
            var multiBtns = (para.table.button || []).filter(function (button) { return button.multi !== 1; });
            if (tools.isNotEmpty(multiBtns)) {
                var buttonWrapper_1 = para.inTab ? h("div", { className: "basic-page-btns" }) : para.basePage.buttonGroupEl;
                if (para.inTab) {
                    setTimeout(function () {
                        d.prepend(_this.wrapper, buttonWrapper_1);
                    });
                }
                this.buttonGroup = h(LeButtonGroup_1.LeButtonGroup, { "c-var": "buttonGroup", container: buttonWrapper_1, buttons: multiBtns, dataGet: function () { return _this.tableModule.main.ftable.selectedRowsData; } });
            }
            var wrapper = h("div", { className: "table-single-page" },
                para.querier ?
                    this.queryModule = h(LeQueryModule_1.LeQueryModule, { "c-var": "queryModule", ui: para.querier, fields: para.common.fields, defaultData: para.queryData, search: function (searchData) { return _this.tableModule.refresh(searchData); }, selects: para.table.edit ? para.table.edit.selects : null, toggle: function (names, isCheck) {
                            _this.setColShow(names, isCheck);
                        } }) : null,
                para.editor ?
                    this.editModule = h(LeTableEditModule_1.LeTableEditModule, { isAutoLoad: false, isWrapLine: false, ui: para.editor, fields: para.common.fields }) : null);
            setTimeout(function () {
                // 防止加载框不居中
                _this.tableModule = h(LeTableModule_1.LeTableModule, { ajaxData: _this.queryModule ? _this.queryModule.json : null, tableUi: para.table, container: wrapper, fields: para.common.fields });
                if (_this.editModule) {
                    var mftable_1 = _this.tableModule.main.ftable, pseudoTable_1 = mftable_1.pseudoTable;
                    mftable_1.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                        // let sub = this.sub || this.subInit(subUi);
                        if (mftable_1.editing) {
                            return;
                        }
                        var firstRow = mftable_1.rowGet(0);
                        firstRow.selected = true;
                        setTimeout(function () {
                            _this.editModule.loadDefaultData(firstRow.data);
                            pseudoTable_1 && pseudoTable_1.setPresentSelected(0);
                        }, 200);
                    });
                    var self_1 = _this;
                    mftable_1.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                        var rowIndex = parseInt(this.dataset.index), row = mftable_1.rowGet(rowIndex);
                        if (row && row.selected) {
                            self_1.editModule.loadDefaultData(row.data);
                            pseudoTable_1 && pseudoTable_1.setPresentSelected(rowIndex);
                        }
                    });
                }
                tools.isNotEmpty(para.onReady) && para.onReady();
            }, 10);
            return wrapper;
        };
        LeTablePage.prototype.setColShow = function (names, isShow) {
            var _this = this;
            Array.isArray(names) && names.forEach(function (name) {
                var column = _this.tableModule.main.ftable.columnGet(name);
                column && (column.show = isShow);
            });
        };
        LeTablePage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.queryModule && this.queryModule.destroy();
            this._tableModule && this._tableModule.destroy();
            this.buttonGroup && this.buttonGroup.destroy();
            this.queryModule = null;
            this._tableModule = null;
            this.buttonGroup = null;
        };
        return LeTablePage;
    }(Component));
    exports.LeTablePage = LeTablePage;
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
