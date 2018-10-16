/// <amd-module name="LeQueryModule"/>
define("LeQueryModule", ["require", "exports", "Button", "FormFactory", "BasicBoxGroup", "CheckBox"], function (require, exports, Button_1, FormFactory_1, selectBoxGroup_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var LeQueryModule = /** @class */ (function (_super) {
        __extends(LeQueryModule, _super);
        function LeQueryModule(para) {
            var _this = this;
            var ui = para.ui;
            _this = _super.call(this, Object.assign({}, para, {
                cond: ui.cond,
                isWrapLine: true,
            })) || this;
            _this.selects = para.selects;
            _this.toggle = para.toggle;
            _this.search = para.search;
            _this.initOption(ui.options);
            // 查询函数
            // 初始化查询按钮
            if (_this.forms.length > 0) {
                d.append(d.query('.form-com-wrapper', _this.wrapper), h("div", { className: "form-com-item" },
                    h(Button_1.Button, { className: "query-search-btn", content: "\u67E5\u8BE2", onClick: function () {
                            typeof _this.search === 'function' && _this.search(_this.json);
                        } })));
            }
            return _this;
        }
        LeQueryModule.prototype.initOption = function (options) {
            var _this = this;
            if (Array.isArray(options)) {
                if (!this.optionsWrapper) {
                    this.optionsWrapper = h("div", { className: "query-options-wrapper" });
                    d.prepend(this.wrapper, this.optionsWrapper);
                }
                this.options = [];
                if (tools.isNotEmpty(this.fields)) {
                    var data_1 = this.fields.map(function (field) { return { title: field.caption, value: field.name }; });
                    options.forEach(function (option) {
                        var boxGroup, BoxGroup = selectBoxGroup_1.CheckBoxGroup, Box = checkBox_1.CheckBox;
                        var fileNames = data_1.filter(function (field) { return option.fieldNames.indexOf(field.value) > -1; });
                        d.append(_this.optionsWrapper, h("div", { className: "query-option-wrapper" },
                            tools.isNotEmpty(option.caption) ? h("div", { className: "query-option-caption" }, option.caption) : null,
                            h("div", { className: "query-option-tag" }, boxGroup = h(BoxGroup, { type: "tag", custom: option }, fileNames.map(function (filed) {
                                var box = h(Box, { value: filed.value, text: filed.title });
                                box.checked = true;
                                box.onClick = function (checked) {
                                    if (typeof _this.toggle === 'function') {
                                        var result = [filed.value];
                                        if (Array.isArray(_this.selects)) {
                                            for (var _i = 0, _a = _this.selects; _i < _a.length; _i++) {
                                                var select = _a[_i];
                                                if (select.relateFields === filed.value) {
                                                    select.titleField && result.push(select.titleField);
                                                }
                                            }
                                        }
                                        console.log(result, checked);
                                        _this.toggle(result, checked);
                                    }
                                };
                                return box;
                            })))));
                        boxGroup.onSet = function (e) {
                            typeof _this.search === 'function' && _this.search(_this.json);
                        };
                        _this.options.push(boxGroup);
                    });
                }
            }
        };
        // 初始化formCom额外参数
        LeQueryModule.prototype.selectParaInit = function (cond) {
            var _this = this;
            var result = {}, type = cond.type, titleField = cond.titleField;
            cond.auto && (result.onSet = function () {
                typeof _this.search === 'function' && _this.search(_this.json);
            });
            if (cond.relateFields && this.fields) {
                for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
                    var field = _a[_i];
                    if (field.name === titleField) {
                        result.placeholder = field.caption;
                        break;
                    }
                }
            }
            // switch (type){
            //     case "selectText":
            //         break;
            //     case "date":
            //         break;
            //     case "datetime":
            //         break;
            //     case "tag":
            //         break;
            //     case "selectBox":
            //         break;
            //     case "number":
            //         break;
            //     case "text":
            //     default:
            //         break;
            // }
            return result;
        };
        LeQueryModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "query-module-wrapper" });
        };
        Object.defineProperty(LeQueryModule.prototype, "json", {
            // 获取数据
            get: function () {
                var json = {};
                this.forms.forEach(function (form) {
                    var cond = form.custom, value = form.value;
                    // console.log(value);
                    // if(cond.relateFields){
                    //
                    // }
                    json.params = json.params || [];
                    if (form instanceof selectBoxGroup_1.BasicBoxGroup && Array.isArray(value)) {
                        value = value.join(',');
                    }
                    value = Array.isArray(value) ? value : [value];
                    if (!(value.length === 1 && tools.isEmpty(value[0]))) {
                        if (!(value.length === 2 && tools.isEmpty(value[0]) && tools.isEmpty(value[1]))) {
                            json.params.push([cond.fieldName, value]);
                        }
                    }
                });
                if (this.options) {
                    json.option = json.option || {};
                    for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
                        var option = _a[_i];
                        var type = option.custom.type;
                        if (tools.isNotEmpty(option.value)) {
                            json.option[type] = option.value;
                        }
                    }
                }
                for (var key in json) {
                    json[key] = JSON.stringify(json[key]);
                }
                console.log(json);
                return json;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeQueryModule.prototype, "search", {
            get: function () {
                return this._search;
            },
            set: function (flag) {
                this._search = flag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeQueryModule.prototype, "toggle", {
            get: function () {
                return this._toggle;
            },
            set: function (flag) {
                this._toggle = flag;
            },
            enumerable: true,
            configurable: true
        });
        return LeQueryModule;
    }(FormFactory_1.FormFactory));
    exports.LeQueryModule = LeQueryModule;
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
