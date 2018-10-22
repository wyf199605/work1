define("TurnPage", ["require", "exports", "Button"], function (require, exports, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="TurnPage"/>
    var Component = G.Component;
    var TurnPage = /** @class */ (function (_super) {
        __extends(TurnPage, _super);
        function TurnPage(para) {
            var _this = _super.call(this) || this;
            var len = para.len;
            _this.curIndex = G.tools.isNotEmpty(para.curIndex) && para.curIndex || 0;
            _this.prePage = new Button_1.Button({
                content: '上一条',
                container: _this.wrapper,
                size: 'small',
                className: 'pre-page',
                onClick: function () {
                    _this.curIndex--;
                    if (_this.curIndex === 0) {
                        _this.prePage.disabled = true;
                    }
                    _this.nextPage.disabled = false;
                    para.onChange(_this.curIndex);
                }
            });
            if (_this.curIndex === 0) {
                _this.prePage.disabled = true;
            }
            _this.nextPage = new Button_1.Button({
                content: '下一条',
                container: _this.wrapper,
                size: 'small',
                disabled: _this.curIndex === len,
                className: 'next-page',
                onClick: function () {
                    _this.curIndex++;
                    if (_this.curIndex === len - 1) {
                        _this.nextPage.disabled = true;
                    }
                    _this.prePage.disabled = false;
                    para.onChange(_this.curIndex);
                }
            });
            if (_this.curIndex === len - 1) {
                _this.prePage.disabled = true;
            }
            return _this;
        }
        TurnPage.prototype.wrapperInit = function () {
            return h("div", { class: "turn-page" });
        };
        return TurnPage;
    }(Component));
    exports.TurnPage = TurnPage;
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
