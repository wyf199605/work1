/// <amd-module name="LeRichTextModule"/>
define("LeRichTextModule", ["require", "exports", "RichText", "LeUploadModule", "LeRule"], function (require, exports, richText_1, UploadModule_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var LeRichTextModule = /** @class */ (function (_super) {
        __extends(LeRichTextModule, _super);
        function LeRichTextModule(para) {
            return _super.call(this, para) || this;
        }
        LeRichTextModule.prototype.initCom = function (para) {
            this.field = para.field;
            this.addImgBtn(para);
        };
        LeRichTextModule.prototype.addImgBtn = function (para) {
            var _this = this;
            var accept = { extensions: 'jpg,png' }, container = this.para.container, button, btnWrapper = d.query('.note-toolbar.panel-headin', container);
            d.append(btnWrapper, h("div", { class: "note-btn-group btn-group note-table" },
                h("div", { class: "note-btn-group" },
                    button = h("button", { type: "button", class: "note-btn btn btn-default btn-sm", tabindex: "-1", title: "", "data-original-title": "Unordered list (CTRL+SHIFT+NUM7)" },
                        h("i", { class: "note-icon-unorderedlist" })),
                    h("div", { style: "display: none;" }, this.upload = h(UploadModule_1.LeUploadModule, { nameField: para.nameField, isAutoUpload: true, text: '选择图片', isMulti: true, url: LE.CONF.ajaxUrl.fileUpload, accept: accept, successHandler: function (data) {
                            _this.addPictures(data);
                        }, isChangeText: false })))));
            d.on(button, 'click', function () {
                _this.upload.open();
            });
        };
        LeRichTextModule.prototype.addPictures = function (data) {
            var _this = this;
            var content = d.query('.note-editable.panel-body', this.para.container);
            var md5s = [];
            data && data.forEach(function (item) {
                var res = item.data;
                md5s.push(res.data[_this.field]);
            });
            md5s.forEach(function (md5) {
                d.append(content, LeRichTextModule.initPicEl(LeRule_1.LeRule.fileUrlGet(md5, _this.field)));
            });
        };
        LeRichTextModule.initPicEl = function (url) {
            return h("img", { src: url, alt: "" });
        };
        return LeRichTextModule;
    }(richText_1.RichText));
    exports.LeRichTextModule = LeRichTextModule;
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
