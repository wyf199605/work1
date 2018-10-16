define("FeedBack", ["require", "exports", "SelectInput", "LeRule", "LeBasicPage"], function (require, exports, selectInput_1, LeRule_1, LeBasicPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="FeedBack"/>
    var d = G.d;
    var FeedBack = /** @class */ (function (_super) {
        __extends(FeedBack, _super);
        function FeedBack() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FeedBack.prototype.init = function (para, data) {
            this.title = '问题反馈';
        };
        FeedBack.prototype.bodyInit = function () {
            var _this = this;
            var select, query, content, tpl = h("div", { className: "student-feedback-page" },
                h("div", { className: "student-feedback-body" },
                    h("div", { className: "student-feedback-item" },
                        select = h("div", { className: "select" }),
                        query = h("div", { className: "btn btn-blue query" }, "\u67E5\u8BE2")),
                    content = h("div", { className: "student-feedback-content" })));
            d.on(query, 'click', function () {
                _this.search(content);
            });
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.feedBackSelect, {
                dataType: 'json'
            }).then(function (_a) {
                var response = _a.response;
                var data = [];
                response.data.data.forEach(function (obj) {
                    data.push({
                        value: obj.QUESTION_TYPE,
                        text: obj.QUESTION_TYPE_NAME,
                    });
                });
                _this.select = new selectInput_1.SelectInput({
                    container: select,
                    readonly: true,
                    data: data
                });
                if (data[0]) {
                    _this.select.set(data[0].value);
                    _this.search(content);
                }
            });
            return tpl;
        };
        FeedBack.prototype.search = function (content) {
            var _this = this;
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.feedBackQuery + '?question_type=' + this.select.get(), {
                type: 'get',
            }).then(function (_a) {
                var response = _a.response;
                content.innerHTML = null;
                d.append(content, _this.createItem(response.data.data));
            });
        };
        FeedBack.prototype.createItem = function (data) {
            var fragment = document.createDocumentFragment();
            Array.isArray(data) && data.forEach(function (obj) {
                fragment.appendChild(h("div", { className: "student-feedback-item" },
                    h("p", { className: "item-title" },
                        h("span", null,
                            "\u3010",
                            obj.QUESTION_TYPE_NAME,
                            "\u3011"),
                        h("span", null, obj.TITLE)),
                    h("div", { className: "item-content" }, obj.CONTENT),
                    h("div", { className: "item-footer" },
                        h("div", { className: "item-row" },
                            h("div", null,
                                h("span", { className: "item-name" }, "\u63D0\u95EE\u4EBA\uFF1A"),
                                h("span", { className: "item-value" }, obj.QUESTIONER)),
                            h("div", null,
                                h("span", { className: "item-name" }, "\u63D0\u4EA4\u65F6\u95F4\uFF1A"),
                                h("span", { className: "item-value" }, obj.QUESTIONTIME))),
                        h("div", { className: "item-row" },
                            h("div", null,
                                h("span", { className: "item-name" }, "\u56DE\u590D\u4EBA\uFF1A"),
                                h("span", { className: "item-value" }, obj.RESPONDER)),
                            h("div", null,
                                h("span", { className: "item-name" }, "\u56DE\u590D\u65F6\u95F4\uFF1A"),
                                h("span", { className: "item-value" }, obj.RESPONSETIME)),
                            h("div", null,
                                h("span", { className: "item-name" }, "\u56DE\u590D\u72B6\u6001\uFF1A"),
                                h("span", { className: "item-value" }, obj.ANSWERSTATUS))))));
            });
            return fragment;
        };
        FeedBack.prototype.destroy = function () {
            this.basicPageEl.remove();
            this.basicPageEl = null;
            this.select.destroy();
            this.select = null;
        };
        return FeedBack;
    }(LeBasicPage_1.LeBasicPage));
    exports.FeedBack = FeedBack;
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
