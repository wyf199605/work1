/// <amd-module name="OverviewModule"/>
define("OverviewModule", ["require", "exports", "DropDownModule", "TextInputModule", "DVAjax", "QueryDevicePage", "MenuDevelopPage"], function (require, exports, DropDownModule_1, TextInputModule_1, DVAjax_1, QueryDevicePage_1, MenuDevelopPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var OverviewModule = /** @class */ (function (_super) {
        __extends(OverviewModule, _super);
        function OverviewModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        OverviewModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"overviewItems hide\">\n                <div class=\"overviewItem\"></div>\n                <div class=\"overviewItem\"></div>\n                <div class=\"overviewItem\"></div>\n                <div class=\"clear\"></div>\n                <div class=\"overviewItem\"></div>\n                <div class=\"overviewItem\"></div>\n                <div class=\"overviewItem\"></div>\n                <div class=\"clear\"></div>\n        </div>\n        ");
        };
        OverviewModule.prototype.init = function (para) {
            var _this = this;
            this.initAllItems();
            var overviewData = {
                itemId: '',
                captionSql: '',
                dataSource: '',
                baseTable: '',
                keyField: '',
                captionField: ''
            };
            DVAjax_1.DVAjax.dataSourceQueryAjax(function (response) {
                _this.allItems['dataSource'].dpData = response;
                if (para.isQuery) {
                    if (tools.isNotEmpty(QueryDevicePage_1.QueryDevicePage.itemId)) {
                        DVAjax_1.DVAjax.itemQueryAjax(function (res) {
                            for (var key in res.data) {
                                if (overviewData.hasOwnProperty(key)) {
                                    overviewData[key] = res.data[key];
                                }
                            }
                            _this.qdData = overviewData;
                        }, QueryDevicePage_1.QueryDevicePage.itemId);
                    }
                    else {
                        _this.qdData = overviewData;
                    }
                }
                else {
                    if (tools.isNotEmpty(MenuDevelopPage_1.MenuDevelopPage.itemId)) {
                        DVAjax_1.DVAjax.itemQueryAjax(function (res) {
                            for (var key in res.data) {
                                if (overviewData.hasOwnProperty(key)) {
                                    overviewData[key] = res.data[key];
                                }
                            }
                            _this.qdData = overviewData;
                        }, MenuDevelopPage_1.MenuDevelopPage.itemId);
                    }
                    else {
                        _this.qdData = overviewData;
                    }
                }
            });
            // 根据基表获取主键字段
            d.on(this.allItems['baseTable'].wrapper, 'change', 'input', function (e) {
                var tableName = e.target.value + '?ds=' + _this.allItems['dataSource'].get();
                if (tools.isNotEmpty(tableName)) {
                    DVAjax_1.DVAjax.baseTableQueryAjax(tableName, function (res) {
                        if (res) {
                            _this.allItems['keyField'].set(res.data);
                        }
                    });
                }
            });
        };
        OverviewModule.prototype.initAllItems = function () {
            var contentContainers = d.queryAll('.overviewItem', this.wrapper), index = 0;
            var data = {
                itemId: {
                    title: "页面编码",
                    palceHolder: "自动生成",
                    isDropDown: false,
                    id: 'itemId',
                    checkboxTitle: '',
                    isShowCheckBox: false
                },
                captionSql: {
                    title: "标题",
                    isDropDown: false,
                    checkboxTitle: 'sql',
                    id: 'captionSql',
                    isShowCheckBox: true
                },
                dataSource: {
                    title: "数据源",
                    isDropDown: true,
                    id: 'dataSource'
                },
                baseTable: {
                    title: "基表",
                    isDropDown: false,
                    id: 'baseTable',
                    checkboxTitle: '',
                    isShowCheckBox: false
                },
                keyField: {
                    title: "主键字段",
                    palceHolder: "根据基表填充建议值",
                    isDropDown: false,
                    id: 'keyField',
                    checkboxTitle: '',
                    isShowCheckBox: false
                },
                captionField: {
                    title: "标题字段",
                    palceHolder: "",
                    isDropDown: false,
                    id: 'captionField',
                    checkboxTitle: '',
                    isShowCheckBox: false
                }
            };
            for (var key in data) {
                var container = contentContainers[index];
                index++;
                var module = null;
                if (data[key].isDropDown == true) {
                    module = new DropDownModule_1.DropDownModule({
                        container: container,
                        title: data[key].title,
                        disabled: false
                    });
                }
                else {
                    module = new TextInputModule_1.TextInputModule({
                        container: container,
                        title: data[key].title,
                        placeHolder: data[key].palceHolder,
                        isShowCheckBox: data[key].isShowCheckBox,
                        checkboxText: data[key].checkboxTitle,
                    });
                    if (index > 4) {
                        // module.disabled = true;
                    }
                }
                this.allItems[data[key].id] = module;
            }
            // QueryDevicePage.itemId && (this.allItems['itemId'].disabled = true);
        };
        Object.defineProperty(OverviewModule.prototype, "allItems", {
            get: function () {
                if (!this._allItems) {
                    this._allItems = {
                        itemId: null,
                        captionSql: null,
                        dataSource: null,
                        baseTable: null,
                        keyField: null,
                        captionField: null
                    };
                }
                return this._allItems;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._allItems = obj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverviewModule.prototype, "qdData", {
            get: function () {
                return this._qdData;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._qdData = obj;
                for (var key in this.allItems) {
                    if (this._qdData.hasOwnProperty(key)) {
                        this.allItems[key].set(this._qdData[key]);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OverviewModule.prototype, "isShow", {
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
                    var itemId = QueryDevicePage_1.QueryDevicePage.itemId, inputItemId = this.allItems['itemId'].get();
                    tools.isNotEmpty(itemId) && this.allItems['itemId'].set(itemId);
                    tools.isNotEmpty(itemId) || tools.isNotEmpty(inputItemId) && (this.allItems['itemId'].disabled = true);
                    this.wrapper.classList.add('show');
                    this.wrapper.classList.remove('hide');
                }
                else {
                    this.wrapper.classList.remove('show');
                    this.wrapper.classList.add('hide');
                }
            },
            enumerable: true,
            configurable: true
        });
        OverviewModule.prototype.get = function () {
            var itemData = {
                itemId: '',
                captionSql: '',
                dataSource: '',
                baseTable: '',
                keyField: '',
                captionField: ''
            };
            for (var key in itemData) {
                if (this.allItems.hasOwnProperty(key)) {
                    var result = this.allItems[key].get();
                    if (key === 'dataSource') {
                        itemData[key] = result === '请选择' ? '' : result;
                    }
                    else {
                        itemData[key] = result;
                    }
                }
            }
            return itemData;
        };
        return OverviewModule;
    }(Component));
    exports.OverviewModule = OverviewModule;
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
