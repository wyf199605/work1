/// <amd-module name="AddVARModule"/>
define("AddVARModule", ["require", "exports", "Component", "DropDownModule", "TextInputModule", "SQLEditor", "Button", "DVAjax"], function (require, exports, Component_1, DropDownModule_1, TextInputModule_1, SQLEditor_1, Button_1, DVAjax_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Ajax = G.Ajax;
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var AddVARModule = /** @class */ (function (_super) {
        __extends(AddVARModule, _super);
        function AddVARModule(addVARPara) {
            var _this = _super.call(this, addVARPara) || this;
            if (tools.isEmpty(addVARPara)) {
                addVARPara = {};
            }
            _this.init(addVARPara);
            return _this;
        }
        AddVARModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"addVar\">\n                <div class=\"items\">\n                        <div class=\"varId\"></div>\n                        <div class=\"varName\"></div>\n                        <div class=\"dataSource\"></div>\n                </div>\n                <div class=\"content\">\n\n                </div>\n            <div class=\"buttons\"></div>\n        </div>\n        ");
        };
        AddVARModule.prototype.init = function (addVARPara) {
            var _this = this;
            this.addVARData = addVARPara.addVARData;
            this.initItems();
            Ajax.fetch(config.ajaxUrl.datasourceQuery).then(function (_a) {
                var response = _a.response;
                response = JSON.parse(response);
                if (response.errorCode === 0) {
                    var arr_1 = [];
                    response.dataArr.forEach(function (item) {
                        arr_1.push(item['DATA_SOURCE']);
                    });
                    _this.textInputModules.dataSource.dpData = arr_1;
                }
            });
        };
        AddVARModule.prototype.initItems = function () {
            var _this = this;
            this.textInputModules = {
                varId: null,
                varName: null,
                dataSource: null,
                varSql: null
            };
            var varId = new TextInputModule_1.TextInputModule({
                container: d.query('.varId', this.wrapper),
                title: 'VAR ID',
                placeHolder: '可自动生成'
            });
            this.textInputModules.varId = varId;
            var varName = new TextInputModule_1.TextInputModule({
                container: d.query('.varName', this.wrapper),
                title: '变量名称',
                value: ''
            });
            this.textInputModules.varName = varName;
            var dataSource = new DropDownModule_1.DropDownModule({
                container: d.query('.dataSource', this.wrapper),
                title: '数据源',
                data: [],
                disabled: false
            });
            this.textInputModules.dataSource = dataSource;
            var varSql = d.create("\n            <div class=\"var-group\">\n                <label for=\"varID\" class=\"title-label\">\u53D8\u91CFSQL:</label>\n                <div class=\"textEditor\"></div>\n                <div class=\"clear\"></div>\n            </div>\n        ");
            d.query('.content', this.wrapper).appendChild(varSql);
            var textEditot = new SQLEditor_1.SQLEditor({
                container: d.query('.textEditor', this.wrapper),
                width: '100%',
                height: 100
            });
            this.textInputModules.varSql = textEditot;
            var saveBtn = new Button_1.Button({
                content: '保存并返回',
                container: d.query('.buttons', this.wrapper),
                className: 'save',
                onClick: function (e) {
                    var varItem = {
                        varId: '',
                        dataSource: '',
                        varName: '',
                        varSql: ''
                    };
                    for (var key in varItem) {
                        varItem[key] = _this.textInputModules[key].get();
                    }
                    var para = {
                        type: 'var',
                        insert: [varItem]
                    };
                    DVAjax_1.DVAjax.varManagerAjax(function (res) {
                        console.log(res);
                    }, { type: 'POST', data: para });
                }
            });
            var cancelBtn = new Button_1.Button({
                content: '取消',
                container: d.query('.buttons', this.wrapper),
                className: 'cancel'
            });
        };
        Object.defineProperty(AddVARModule.prototype, "addVARData", {
            get: function () {
                return this._addVARData;
            },
            set: function (arr) {
                if (tools.isEmpty(arr)) {
                    arr = [];
                }
                this._addVARData = arr;
            },
            enumerable: true,
            configurable: true
        });
        return AddVARModule;
    }(Component_1.Component));
    exports.AddVARModule = AddVARModule;
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
