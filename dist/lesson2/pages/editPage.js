/// <amd-module name="LeEditPage"/>
define("LeEditPage", ["require", "exports", "LeTableEditModule"], function (require, exports, LeTableEditModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var LeEditPage = /** @class */ (function (_super) {
        __extends(LeEditPage, _super);
        function LeEditPage(para) {
            var _this = _super.call(this, para) || this;
            _this.editWrapper = h("div", { className: "edit-page-wrapper" });
            d.append(_this.wrapper, _this.editWrapper);
            _this.initEditModule(para.pageEl.body.editor, para.pageEl.common && para.pageEl.common.fields);
            return _this;
        }
        LeEditPage.prototype.wrapperInit = function (para) {
            return para.container;
        };
        LeEditPage.prototype.initEditModule = function (editor, fields) {
            var _this = this;
            if (Array.isArray(editor)) {
                this.editModules = [];
                editor.forEach(function (edit) {
                    _this.editModules.push(new LeTableEditModule_1.LeTableEditModule({
                        ui: edit,
                        container: _this.editWrapper,
                        fields: fields,
                    }));
                });
            }
        };
        return LeEditPage;
    }(Component));
    exports.LeEditPage = LeEditPage;
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
