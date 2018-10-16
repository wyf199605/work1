/// <amd-module name="AuthorityConfigModule"/>
define("AuthorityConfigModule", ["require", "exports", "Component", "Button", "CheckBox"], function (require, exports, Component_1, Button_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import {TableLite} from "../../../global/components/tableLite/tableLite";
    var d = G.d;
    var tools = G.tools;
    var AuthorityConfigModule = /** @class */ (function (_super) {
        __extends(AuthorityConfigModule, _super);
        function AuthorityConfigModule(authorityConfigPara) {
            var _this = _super.call(this, authorityConfigPara) || this;
            if (tools.isEmpty(authorityConfigPara)) {
                authorityConfigPara = {};
            }
            _this.init(authorityConfigPara);
            return _this;
        }
        AuthorityConfigModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"authorityConfig hide\">\n                <div class=\"content col-sm-12 cancelPadding\">\n                    <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2 authority\"></div>\n                    <div class=\"buttons\"></div>\n                </div>\n                <div class=\"table myContainer\"></div>\n        </div>\n        ");
        };
        AuthorityConfigModule.prototype.init = function (authorityConfigPara) {
            this.authorityConfigData = authorityConfigPara.authorityConfigData;
            this.initContent();
        };
        // private initTable(tableData) {
        //     d.query('.table', this.wrapper).innerHTML = '';
        //     new TableLite({
        //         table: d.query('.table', this.wrapper),
        //         cols: tableData.cols,
        //         data: tableData.data
        //     })
        // }
        AuthorityConfigModule.prototype.initContent = function () {
            var authorityControl = new checkBox_1.CheckBox({
                text: '权限控制',
                container: d.query('.authority', this.wrapper)
            });
            var addBtn = new Button_1.Button({
                content: "新增",
                container: d.query('.buttons', this.wrapper),
                onClick: function (event) {
                }
            });
            var deleteBtn = new Button_1.Button({
                content: "删除",
                container: d.query('.buttons', this.wrapper),
                onClick: function (event) {
                }
            });
        };
        Object.defineProperty(AuthorityConfigModule.prototype, "authorityConfigData", {
            get: function () {
                return this._authorityConfigData;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._authorityConfigData = obj;
                // this.initTable(this._authorityConfigData.tableData);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AuthorityConfigModule.prototype, "isShow", {
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
        return AuthorityConfigModule;
    }(Component_1.Component));
    exports.AuthorityConfigModule = AuthorityConfigModule;
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
