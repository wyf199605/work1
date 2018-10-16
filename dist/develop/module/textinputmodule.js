/// <amd-module name="TextInputModule"/>
define("TextInputModule", ["require", "exports", "TextInput", "CheckBox"], function (require, exports, text_1, checkBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var TextInputModule = /** @class */ (function (_super) {
        __extends(TextInputModule, _super);
        function TextInputModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        TextInputModule.prototype.wrapperInit = function () {
            return d.create("\n       <div class=\"textInputModule\">\n            <label class=\"textInputLabel\"></label>\n            <div class=\"textInputContent\"></div>\n            <div class=\"checkboxContent\"></div>\n            <div class=\"clear\"></div>\n       </div>\n        ");
        };
        // private changeBoxValue?:(val)=>void;
        TextInputModule.prototype.init = function (para) {
            if (para.placeHolder) {
                this.tmPlaceHolder = para.placeHolder;
            }
            else {
                this.tmPlaceHolder = '';
            }
            this.title = para.title;
            this.disabled = para.disabled || false;
            this.isShowCheckBox = para.isShowCheckBox;
            this.checkboxText = para.checkboxText;
            if (this.isShowCheckBox) {
                this.checkBox;
            }
            if (para.value !== '') {
                this.textInput.set(para.value);
            }
            // this.changeBoxValue = textInputPara.changeBoxValue;
        };
        Object.defineProperty(TextInputModule.prototype, "disabled", {
            get: function () {
                return this._disabled;
            },
            set: function (disabled) {
                this._disabled = disabled;
                this.textInput.disabled = disabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInputModule.prototype, "checkBox", {
            get: function () {
                var self = this;
                if (!this._checkBox && this.isShowCheckBox) {
                    this._checkBox = new checkBox_1.CheckBox({
                        container: d.query('.checkboxContent', this.wrapper),
                        text: this.checkboxText,
                        onSet: function (check) {
                            // self.changeBoxValue(check);
                        }
                    });
                }
                return this._checkBox;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInputModule.prototype, "textInput", {
            get: function () {
                if (!this._textInput) {
                    this._textInput = new text_1.TextInput({
                        container: d.query('.textInputContent', this.wrapper),
                        placeholder: this.tmPlaceHolder
                    });
                }
                return this._textInput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextInputModule.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (title) {
                d.query('.textInputLabel', this.wrapper).innerText = title + " :";
            },
            enumerable: true,
            configurable: true
        });
        TextInputModule.prototype.get = function () {
            return this.textInput.get();
        };
        TextInputModule.prototype.set = function (val) {
            this.textInput.set(val);
        };
        return TextInputModule;
    }(Component));
    exports.TextInputModule = TextInputModule;
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
