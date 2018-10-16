/// <amd-module name="StuModalDetail"/>
define("StuModalDetail", ["require", "exports", "Modal", "Button"], function (require, exports, Modal_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var StuModalDetailModal = /** @class */ (function (_super) {
        __extends(StuModalDetailModal, _super);
        function StuModalDetailModal() {
            var _this = this;
            var btn = new Button_1.Button({
                className: 'print',
                content: '打印',
                onClick: function () {
                }
            });
            _this = _super.call(this, {
                header: {
                    title: '学生成绩',
                    rightPanel: btn.wrapper,
                    isDrag: false
                },
                body: new StuModalDetail().wrapper,
                isShow: true,
                width: '71%',
                className: 'student-modal',
                position: 'full',
                isDrag: false
            }) || this;
            return _this;
        }
        return StuModalDetailModal;
    }(Modal_1.Modal));
    exports.StuModalDetailModal = StuModalDetailModal;
    var StuModalDetail = /** @class */ (function (_super) {
        __extends(StuModalDetail, _super);
        function StuModalDetail() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StuModalDetail.prototype.wrapperInit = function (para) {
            var tpl = h("div", { className: "student-modal-detail" },
                h("div", { className: "student-modal-header" },
                    h("div", { className: "student-modal-title" },
                        h("img", { width: "180", src: "../../img/lesson2/logo.png", alt: "" }),
                        h("div", { className: "modal-title" },
                            h("div", { className: "lang-ch" }, "\u7B2C\u4E8C\u8BFE\u5802\u6210\u7EE9\u5355"),
                            h("div", { className: "lang-en" }, "Extracurricular Activities Record"))),
                    h("div", { className: "flex-layout" },
                        h("div", { className: "student-modal-left" },
                            h("div", null,
                                h("p", null,
                                    h("img", { src: "../../img/lesson2/name.png", alt: "" }),
                                    h("span", null, "\u59D3\u540D\uFF1A\u859B\u7433")),
                                h("p", null,
                                    h("img", { src: "../../img/lesson2/college.png", alt: "" }),
                                    h("span", null, "\u9662\u7CFB\uFF1A\u7269\u7406\u5B66\u4E0E\u7535\u5B50\u4FE1\u606F\u5DE5\u7A0B")),
                                h("p", null,
                                    h("img", { src: "../../img/lesson2/student_id.png", alt: "" }),
                                    h("span", null, "\u5B66\u53F7\uFF1A5145678")),
                                h("p", null,
                                    h("img", { src: "../../img/lesson2/profession.png", alt: "" }),
                                    h("span", null, "\u4E13\u4E1A\uFF1A\u673A\u68B0\u7535\u5B50\u5DE5\u7A0B"))),
                            h("p", { className: "img-rank" }, "100.00%")),
                        h("div", { className: "student-modal-right" },
                            h("img", { width: "120", src: "../../img/lesson2/rank.png", alt: "" })))));
            return tpl;
        };
        return StuModalDetail;
    }(Component));
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
