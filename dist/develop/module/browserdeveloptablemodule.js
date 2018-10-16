/// <amd-module name="BrowserDevelopTableModule"/>
define("BrowserDevelopTableModule", ["require", "exports", "Component", "Button", "FastTable"], function (require, exports, Component_1, Button_1, FastTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var BrowserDevelopTableModule = /** @class */ (function (_super) {
        __extends(BrowserDevelopTableModule, _super);
        function BrowserDevelopTableModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        BrowserDevelopTableModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"browserDevelopTableModule\">\n                <div class=\"tableButtons\"></div>\n                <div class=\"tableContent\"></div>\n        </div>\n        ");
        };
        BrowserDevelopTableModule.prototype.init = function (para) {
            this.btnArr = para.btnArr;
            this.initTableButtons();
            if (para.tableData.cols) {
                this.initTable(para.tableData.cols);
            }
            this.tableData = para.tableData.data;
        };
        BrowserDevelopTableModule.prototype.initTableButtons = function () {
            var _this = this;
            var buttonContainers = d.query('.tableButtons', this.wrapper);
            this.allBtns = [];
            if (this.btnArr) {
                this.btnArr.forEach(function (value, index) {
                    var btn = new Button_1.Button({
                        container: buttonContainers,
                        content: value.name,
                        icon: value.icon,
                        iconPre: value.iconPre
                    });
                    _this.allBtns.push(btn);
                });
            }
        };
        BrowserDevelopTableModule.prototype.initTable = function (cols) {
            this.table = new FastTable_1.FastTable({
                container: d.query('.tableContent', this.wrapper),
                cols: [cols],
                pseudo: {
                    type: 'checkbox'
                }
            });
        };
        Object.defineProperty(BrowserDevelopTableModule.prototype, "tableData", {
            get: function () {
                return this._tableData;
            },
            set: function (arr) {
                if (tools.isEmpty(arr)) {
                    arr = [];
                }
                this._tableData = arr;
                if (this.table && this._tableData.length > 0) {
                    this.table.data = this._tableData;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDevelopTableModule.prototype, "isShow", {
            get: function () {
                return this._isShow;
            },
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
                    this.wrapper.classList.remove('tableHide');
                }
                else {
                    this.wrapper.classList.add('tableHide');
                }
            },
            enumerable: true,
            configurable: true
        });
        // 获取表格数据
        BrowserDevelopTableModule.prototype.get = function () {
            return this.table.data;
        };
        return BrowserDevelopTableModule;
    }(Component_1.Component));
    exports.BrowserDevelopTableModule = BrowserDevelopTableModule;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="pollfily.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="spa.ts"/>
