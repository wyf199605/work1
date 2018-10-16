define("PersonCenter", ["require", "exports", "LeRule", "SelectInput"], function (require, exports, LeRule_1, selectInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="PersonCenter"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var PersonCenter = /** @class */ (function (_super) {
        __extends(PersonCenter, _super);
        function PersonCenter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PersonCenter.prototype.init = function (para, data) {
            this.setting();
        };
        PersonCenter.prototype.setting = function () {
            var _this = this;
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.personCenter).then(function (_a) {
                var response = _a.response;
                var setting = response && response.data && response.data[0], texts = d.queryAll('input[data-name][type="text"]', _this.wrapper), textArea = d.query('[data-name="research"]', _this.wrapper);
                textArea && texts.push(textArea);
                texts.forEach(function (obj) {
                    var dataName = obj.dataset.name.toLocaleUpperCase();
                    if (dataName in setting) {
                        obj.value = setting[dataName];
                    }
                });
                if ('JOBTITLE' in setting) {
                    _this.select.set(setting['JOBTITLE']);
                }
            });
        };
        Object.defineProperty(PersonCenter.prototype, "title", {
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersonCenter.prototype, "titlt", {
            get: function () {
                return this._title;
            },
            enumerable: true,
            configurable: true
        });
        PersonCenter.prototype.wrapperInit = function () {
            var _this = this;
            var tpl = h("div", { className: "system-manager-page" },
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u6240\u5C5E\u9662\u7CFB\uFF1A"),
                    h("input", { "data-name": "department", className: "base-system-input sys-disabled", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u8D26\u6237\uFF1A"),
                    h("input", { "data-name": "id", className: "base-system-input sys-disabled", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u59D3\u540D\uFF1A"),
                    h("input", { "data-name": "personname", className: "base-system-input", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u5DE5\u53F7\uFF1A"),
                    h("input", { "data-name": "jobnumber", className: "base-system-input", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u65B0\u5BC6\u7801\uFF1A"),
                    h("input", { "data-name": "personpassword", className: "base-system-input", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u624B\u673A\u53F7\u7801\uFF1A"),
                    h("input", { placeholder: "\u8BF7\u8F93\u5165\u65B0\u5BC6\u7801", "data-name": "phonenumber", className: "base-system-input", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u804C\u79F0\uFF1A"),
                    h("div", { "data-name": "jobtitle", class: "" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u7814\u7A76\u65B9\u5411\uFF1A"),
                    h("textarea", { placeholder: "\u4E0D\u8D85\u8FC764\u4E2A\u5B57", "data-name": "research", maxlength: "64", name: "", id: "", cols: "30", rows: "6" })),
                h("div", { className: "sys-item-group" },
                    h("span", { className: "sys-title" }, "\u56FE\u7247\uFF1A"),
                    h("input", { className: "base-system-input", type: "text" })),
                h("div", { className: "sys-item-group" },
                    h("div", { class: "save btn" }, "\u4FDD\u5B58"))), jobTitle = d.query('[data-name="jobtitle"]', tpl), saveBtn = d.query('.save', tpl);
            this.select = new selectInput_1.SelectInput({
                container: jobTitle,
                readonly: true,
                ajax: {
                    fun: function (url, value, callback) {
                        LeRule_1.LeRule.Ajax.fetch(url, {
                            type: 'json'
                        }).then(function (_a) {
                            var response = _a.response;
                            var data = [];
                            response.data.forEach(function (obj) {
                                data.push({
                                    value: obj.JOBTITLE,
                                    text: obj.JOBTITLE,
                                });
                            });
                            callback(data);
                        });
                    },
                    url: LE.CONF.ajaxUrl.jobTitle
                }
            });
            d.on(saveBtn, 'click', function () {
                var texts = d.queryAll('[data-name]', _this.wrapper), ajaxData = {};
                texts.forEach(function (input) {
                    var name = input.dataset.name;
                    ajaxData[name] = input.value;
                    if (name === 'jobtitle') {
                        ajaxData[name] = _this.select.getText();
                    }
                });
                console.log(ajaxData);
            });
            return tpl;
        };
        return PersonCenter;
    }(SPAPage));
    exports.PersonCenter = PersonCenter;
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
