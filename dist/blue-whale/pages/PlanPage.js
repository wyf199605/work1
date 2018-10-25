/// <amd-module name="PlanPage"/>
define("PlanPage", ["require", "exports", "BasicPage", "HorizontalQueryModule", "DrawPoint"], function (require, exports, basicPage_1, horizontalFormFactory_1, DrawPoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var PlanPage = /** @class */ (function (_super) {
        __extends(PlanPage, _super);
        function PlanPage(para) {
            var _this = _super.call(this, para) || this;
            _this.wrapper = para.dom;
            var qData = para.ui.body.elements[0];
            console.log(qData);
            var content = h("div", { class: "plan-Head" },
                h(horizontalFormFactory_1.HorizontalQueryModule, { qm: {
                        autTag: qData['autTag'],
                        hasOption: qData['hasOption'],
                        queryType: qData['queryType'],
                        queryparams1: qData['queryparams1'],
                        scannableTime: 0,
                        uiPath: qData['uiPath'],
                        setting: null
                    }, search: function (data) {
                        return new Promise(function (resolve) {
                            //
                            console.log(data.params);
                            resolve(data);
                        });
                    } }),
                h("div", { class: "plan-opera" },
                    h("div", null,
                        h("i", { className: "iconfont icon-chexiao" }),
                        h("span", null, "\u64A4\u6D88(Backspace\u952E)")),
                    h("div", null,
                        h("i", { class: "iconfont icon-wanchengbianji" },
                            h("span", null, "\u5B8C\u6210\u7F16\u8F91"))),
                    h("div", null,
                        h("i", { class: "iconfont icon-maodian" },
                            h("span", null, "\u63CF\u70B9"))),
                    h("div", null,
                        h("i", { className: "iconfont icon-bianjimaodian" },
                            h("span", null, "\u7F16\u8F91\u63CF\u70B9"))),
                    h("div", null,
                        h("i", { className: "iconfont icon-tuodong" },
                            h("span", null, "\u62D6\u52A8(\u7A7A\u683C\u952E+\u5DE6\u51FB)"))),
                    h("div", null,
                        h("i", { className: "iconfont icon-suofang" },
                            h("span", null, "\u7F29\u653E(\u6EDA\u8F6E)")))));
            d.append(_this.wrapper, content);
            //下半部
            var drawContent = h("div", { class: "drawPage", id: "drawPage" }, "}");
            d.append(_this.wrapper, drawContent);
            _this.draw = new DrawPoint_1.DrawPoint({
                wraperId: '#drawPage',
                height: 400,
                width: 700
            });
            return _this;
        }
        PlanPage.prototype.InitDrawPoint = function () {
        };
        return PlanPage;
    }(basicPage_1.default));
    exports.PlanPage = PlanPage;
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

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
