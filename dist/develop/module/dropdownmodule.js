define("DropDownModule", ["require", "exports", "SelectInput"], function (require, exports, selectInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var DropDownModule = /** @class */ (function (_super) {
        __extends(DropDownModule, _super);
        function DropDownModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para))
                para = {};
            _this.init(para);
            return _this;
        }
        DropDownModule.prototype.wrapperInit = function (dropDownPara) {
            return d.create("\n       <div class=\"dropDownModule\">\n            <label class=\"dropDownLabel\">" + dropDownPara.title + " :</label>\n            <div class=\"dropDownContainer\"></div>\n            <div class=\"clear\"></div>\n       </div>\n        ");
        };
        DropDownModule.prototype.init = function (para) {
            this.dropClassName = para.dropClassName;
            this.changeValue = para.changeValue;
            // 设置选项内容
            if (para.data) {
                this.dpData = para.data;
            }
            this.disabled = para.disabled;
        };
        Object.defineProperty(DropDownModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                this._disabled = !!disabled || false;
                this.dropDown.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropDownModule.prototype, "dropClassName", {
            get: function () {
                return this._dropClassName;
            },
            set: function (className) {
                this._dropClassName = className || '';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropDownModule.prototype, "dropDown", {
            get: function () {
                if (!this._dropDown) {
                    var self_1 = this;
                    this._dropDown = new selectInput_1.SelectInput({
                        container: this.wrapper.querySelector('.dropDownContainer'),
                        disabled: true,
                        dropClassName: this.dropClassName,
                        onSet: function (val) {
                            if (self_1.changeValue) {
                                self_1.changeValue(val);
                            }
                        }
                    });
                }
                return this._dropDown;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DropDownModule.prototype, "dpData", {
            get: function () {
                return this._dpData;
            },
            set: function (data) {
                this._dpData = data;
                this.dropDown.setPara({ data: this._dpData });
                if (this._dpData.length > 0) {
                    this.dropDown.set(this._dpData[0]);
                }
            },
            enumerable: true,
            configurable: true
        });
        DropDownModule.prototype.get = function () {
            return this.dropDown.get();
        };
        DropDownModule.prototype.set = function (val) {
            if (val === '') {
                val = 0;
            }
            if (typeof val === 'number') {
                this.dropDown.set(this._dpData[val]);
            }
            else {
                this.dropDown.set(val);
            }
        };
        return DropDownModule;
    }(Component));
    exports.DropDownModule = DropDownModule;
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
