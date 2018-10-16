define("Privilege", ["require", "exports", "LeBasicPage", "LeRule", "Button"], function (require, exports, LeBasicPage_1, LeRule_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Privilege"/>
    var d = G.d;
    var SPA = G.SPA;
    var PrivilegeModal = /** @class */ (function (_super) {
        __extends(PrivilegeModal, _super);
        function PrivilegeModal() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PrivilegeModal.prototype.init = function () { };
        PrivilegeModal.prototype.modalParaGet = function () {
            return {
                header: {
                    title: '权限管理'
                },
                width: '800px',
                body: new Privilege().init(this.para),
                className: 'lesson-modal',
            };
        };
        return PrivilegeModal;
    }(LeBasicPage_1.LeBasicPage));
    exports.PrivilegeModal = PrivilegeModal;
    var Privilege = /** @class */ (function () {
        function Privilege() {
        }
        Privilege.prototype.init = function (para) {
            var _this = this;
            this.p = para;
            this.requestData();
            return h("div", null,
                h("div", { className: "privilege-header" },
                    h("div", { className: "set" },
                        "\u89D2\u8272\u540D\u79F0: \u00A0\u00A0",
                        this.inputEl = h("input", { disabled: true, placeholder: "\u89D2\u8272\u540D\u79F0", className: "default", type: "text" }))),
                this.tableEl = h("table", { className: "privilege-table" },
                    h("thead", null,
                        h("tr", null,
                            h("th", null, "\u6A21\u5757"),
                            h("th", null, "\u83DC\u5355"),
                            h("th", null, "\u5907\u6CE8")))),
                h("div", { className: "privilege-footer" },
                    h("div", null,
                        h(Button_1.Button, { content: "\u53D6\u6D88", size: "large", onClick: function () {
                                SPA.close();
                            } }),
                        h(Button_1.Button, { content: "\u4FDD\u5B58", size: "large", type: "primary", onClick: function () {
                                LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.privilegeSave, {
                                    type: 'post',
                                    data: JSON.stringify(_this.getData()),
                                    dataType: 'json',
                                }).then(function (_a) {
                                    var response = _a.response;
                                    console.log(response);
                                });
                                SPA.close();
                            } }))));
        };
        Privilege.prototype.requestData = function () {
            var _this = this;
            this.ajaxData = JSON.parse(this.p.ajaxData);
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.privilege, {
                type: 'get',
                data: this.ajaxData,
                dataType: 'json',
            }).then(function (_a) {
                var response = _a.response;
                var data = response && response.data;
                // 树形表格生成
                Array.isArray(data) && data.forEach(function (l) {
                    var tbody = h("tbody", null), lChild = l.CHILDREN, lLen = lChild && lChild.length, firstTd = h("td", { rowSpan: lLen, "data-name": "first" }, _this.checkBox(l, function (e) {
                        var allCheck = d.queryAll('input', tbody), checked = e.target.checked;
                        allCheck.forEach(function (obj) {
                            obj.checked = checked === true;
                        });
                    }));
                    if (Array.isArray(lChild)) {
                        lChild.forEach(function (m, index) {
                            var tr = h("tr", null), secondTd = h("td", { "data-name": "second" }, _this.checkBox(m, function (e) {
                                var input = e.target, parent = d.query('[data-name="first"] input', tbody), thisLevel = d.queryAll("[data-name=\"second\"] input", tbody), children = d.queryAll('[data-name="third"] input', tr);
                                if (input.checked) {
                                    parent.checked = true;
                                    children.forEach(function (obj) {
                                        obj.checked = true;
                                    });
                                }
                                else {
                                    var isNotCheck_1 = true;
                                    thisLevel.forEach(function (obj) {
                                        if (obj.checked) {
                                            isNotCheck_1 = false;
                                        }
                                    });
                                    if (isNotCheck_1 && parent) {
                                        parent.checked = false;
                                    }
                                    children.forEach(function (obj) {
                                        obj.checked = false;
                                    });
                                }
                            })), thirdTd = h("td", { "data-name": "third" });
                            if (index === 0) {
                                d.append(tr, firstTd);
                            }
                            d.append(tr, secondTd);
                            Array.isArray(m.CHILDREN) && m.CHILDREN.forEach(function (n) {
                                d.append(thirdTd, _this.checkBox(n, function (e) {
                                    var firstParent = d.query('[data-name="first"] input', tbody), parent = d.query('[data-name="second"] input', tr);
                                    if (e.target.checked) {
                                        parent.checked = true;
                                        firstParent.checked = true;
                                    }
                                }));
                            });
                            d.append(tr, thirdTd);
                            d.append(tbody, tr);
                        });
                    }
                    else {
                        var tr = h("tr", null);
                        d.append(tr, firstTd);
                        d.append(tbody, tr);
                    }
                    d.append(_this.tableEl, tbody);
                });
                _this.inputEl.value = _this.ajaxData.role_name || '';
            });
        };
        Privilege.prototype.getData = function () {
            var allCheck = d.queryAll('input', this.tableEl), ids = [];
            allCheck.forEach(function (input) {
                if (input.checked) {
                    ids.push(input.dataset.id);
                }
            });
            return {
                role_id: this.ajaxData.role_id,
                priv_id: ids
            };
        };
        Privilege.prototype.checkBox = function (data, click) {
            var input, id = 'CHECKBOXID_' + G.tools.getGuid(), checkbox = h("div", null,
                input = h("input", { "data-id": data.ELEMENTID, "data-parent-id": data.PARENTID, type: "checkbox", className: "normal", id: id }),
                h("label", { htmlFor: id }, data.TEXT));
            if (data.CHECKED) {
                input.checked = true;
            }
            d.on(input, 'click', click);
            return checkbox;
        };
        return Privilege;
    }());
    exports.Privilege = Privilege;
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
