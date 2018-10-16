/// <amd-module name="FieldConfigModule"/>
define("FieldConfigModule", ["require", "exports", "Component", "DropDownModule", "CheckBox", "TextInputModule"], function (require, exports, Component_1, DropDownModule_1, checkBox_1, TextInputModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import {TableLite} from "../../../global/components/tableLite/tableLite";
    var d = G.d;
    var tools = G.tools;
    var FieldConfigModule = /** @class */ (function (_super) {
        __extends(FieldConfigModule, _super);
        function FieldConfigModule(fieldConfigPara) {
            var _this = _super.call(this, fieldConfigPara) || this;
            if (tools.isEmpty(fieldConfigPara)) {
                fieldConfigPara = {};
            }
            _this.init(fieldConfigPara);
            return _this;
        }
        FieldConfigModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"fieldConfig hide\">\n                <div class=\"table myContainer\"></div>\n                <div class=\"content\"></div>\n        </div>\n        ");
        };
        FieldConfigModule.prototype.init = function (fieldConfigPara) {
            this.fieldConfigData = fieldConfigPara.fieldConfigData;
            this.initContent();
        };
        Object.defineProperty(FieldConfigModule.prototype, "allItems", {
            get: function () {
                if (!this._allItems) {
                    this._allItems = {
                        requiredFlag: null,
                        noCopy: null,
                        noSum: null,
                        noEdit: null,
                        noSort: null,
                        inputHint: null,
                        displayFormat: null,
                        editFormat: null,
                        maxLength: null,
                        minLength: null,
                        displayWidth: null,
                        maxValue: null,
                        minValue: null,
                        defaultValue: null,
                        caption: null,
                        dataType: null,
                        hyperRes: null
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
        FieldConfigModule.prototype.initContent = function () {
            var _this = this;
            var html = d.create("\n            <div>\n                <div class=\"topItems\">\n                    <div class=\"col-lg-4 col-md-4 col-sm-4 col-xs-4 fieldTitle\"></div>\n                    <div class=\"col-lg-4 col-md-4 col-sm-4 col-xs-4 dataType\"></div>\n                    <div class=\"col-lg-4 col-md-4 col-sm-4 col-xs-4 linkResource\"></div>\n                </div>\n                <div>\n                    <div class=\"col-lg-8 col-md-8 col-sm-8 col-xs-8\">\n                        <div class=\"checkboxItem\"></div>\n                        <div class=\"checkboxItem\"></div>\n                        <div class=\"checkboxItem\"></div>\n                        <div class=\"checkboxItem\"></div>\n                        <div class=\"checkboxItem\"></div>\n                    </div>\n                    <div class=\"col-lg-4 col-md-4 col-sm-4 col-xs-4 inputTip\">\n                        \n                    </div>\n                </div>\n                <div class=\"col-sm-12 cancelPadding\">\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">\n                        \n                   </div>\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">\n                        \n                   </div>\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">\n                        \n                   </div>\n                   <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 showFormat\"></div>\n                   <div class=\"col-lg-3 col-md-3 col-sm-3 col-xs-3 editFormat\"></div>\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">\n                        \n                   </div>\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">\n                        \n                   </div>\n                   <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 shortInput\">                        \n                   </div>\n                </div>\n            </div>\n        ");
            d.query('.content', this.wrapper).appendChild(html);
            var caption = new TextInputModule_1.TextInputModule({
                title: "字段标题",
                value: '',
                container: d.query('.fieldTitle', this.wrapper)
            });
            this.allItems['caption'] = caption;
            var dataType = new TextInputModule_1.TextInputModule({
                title: "数据类型",
                value: '',
                container: d.query('.dataType', this.wrapper)
            });
            this.allItems['dataType'] = dataType;
            var hyperRes = new DropDownModule_1.DropDownModule({
                title: "链接资源",
                data: [],
                container: d.query('.linkResource', this.wrapper)
            });
            var checkboxItems = d.queryAll('.checkboxItem', this.wrapper);
            var checkBoxArr = [
                {
                    text: "不可编辑",
                    id: 'noEdit'
                },
                {
                    text: "不可复制",
                    id: 'noCopy'
                },
                {
                    text: "不可汇总",
                    id: 'noSum'
                },
                {
                    text: "不可排序",
                    id: 'noSort'
                },
                {
                    text: "必输",
                    id: 'requiredFlag'
                }
            ];
            checkboxItems.forEach(function (value, index, arr) {
                var check = new checkBox_1.CheckBox({
                    text: checkBoxArr[index].text,
                    container: value
                });
                _this.allItems[checkBoxArr[index].id] = check;
            });
            var inputHint = new TextInputModule_1.TextInputModule({
                container: d.query('.inputTip', this.wrapper),
                title: "输入提示",
                value: ""
            });
            this.allItems['inputHint'] = inputHint;
            var displayFormat = new DropDownModule_1.DropDownModule({
                container: d.query('.showFormat', this.wrapper),
                title: "显示格式",
                data: []
            });
            this.allItems['displayFormat'] = displayFormat;
            var editFormat = new DropDownModule_1.DropDownModule({
                container: d.query('.editFormat', this.wrapper),
                title: "编辑格式",
                data: []
            });
            this.allItems['editFormat'] = editFormat;
            var shortInputs = d.queryAll('.shortInput', this.wrapper);
            var textInputArr = [
                {
                    title: "最大长度",
                    value: "",
                    id: 'maxLength'
                },
                {
                    title: "最小长度",
                    value: "",
                    id: 'minLength'
                },
                {
                    title: "显示宽度",
                    value: "",
                    id: 'displayWidth'
                },
                {
                    title: "最大值",
                    value: "",
                    id: 'maxValue'
                },
                {
                    title: "最小值",
                    value: "",
                    id: 'minValue'
                },
                {
                    title: "默认值",
                    value: "",
                    id: 'defaultValue'
                },
            ];
            shortInputs.forEach(function (value, index, arr) {
                var check = new TextInputModule_1.TextInputModule({
                    container: value,
                    title: textInputArr[index].title,
                    value: textInputArr[index].value
                });
                _this.allItems[textInputArr[index].id] = check;
            });
        };
        Object.defineProperty(FieldConfigModule.prototype, "fieldConfigData", {
            get: function () {
                return this._fieldConfigData;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._fieldConfigData = obj;
                // this.initTable(this._fieldConfigData.tableData);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldConfigModule.prototype, "isShow", {
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
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
        return FieldConfigModule;
    }(Component_1.Component));
    exports.FieldConfigModule = FieldConfigModule;
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
