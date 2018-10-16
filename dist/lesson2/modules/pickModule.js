define("LePickModule", ["require", "exports", "TextInput", "LeRule", "Modal", "LeTableModule"], function (require, exports, text_1, LeRule_1, Modal_1, LeTableModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LePickModule = /** @class */ (function (_super) {
        __extends(LePickModule, _super);
        function LePickModule(para) {
            var _this = _super.call(this, Object.assign({}, para, {
                icons: ['sec seclesson-xiala'],
                iconHandle: function () {
                    if (!_this.modal) {
                        var body = h("div", null);
                        _this.modal = new Modal_1.Modal({
                            className: "ile-pick",
                            top: 10,
                            header: {
                            // title : para.title
                            },
                            body: body,
                            footer: {},
                            onOk: function () {
                                var key = para.ui.fieldname, valueRow = _this.lebaseTable.main.ftable.selectedRowsData
                                    .map(function (data) { return data[key]; }).join(',');
                                _this.set(valueRow);
                                _this.modal.isShow = false;
                            }
                        });
                        if (para.ui) {
                            var _loop_1 = function (obj) {
                                if (obj == "fieldnames") {
                                    para.ui['fieldnames'].forEach(function (value, index) {
                                        _this.uiData[obj].push({ fieldname: value, type: "" });
                                    });
                                }
                                else {
                                    _this.uiData[obj] = para.ui[obj];
                                }
                            };
                            for (var obj in para.ui) {
                                _loop_1(obj);
                            }
                        }
                        _this.lebaseTable = h(LeTableModule_1.LeTableModule, { container: _this.modal.bodyWrapper, tableUi: _this.uiData, fields: para.fields });
                    }
                    else {
                        _this.modal.isShow = true;
                    }
                }
            })) || this;
            _this.uiData = {
                id: "",
                caption: "",
                fieldnames: [],
            };
            _this.ajax = new LeRule_1.LeRule.Ajax();
            _this.wrapper.classList.add('le-pick');
            return _this;
        }
        return LePickModule;
    }(text_1.TextInput));
    exports.LePickModule = LePickModule;
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
