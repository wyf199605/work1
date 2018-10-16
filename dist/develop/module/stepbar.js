define("StepBar", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var StepBar = /** @class */ (function (_super) {
        __extends(StepBar, _super);
        function StepBar(para) {
            var _this = _super.call(this, para) || this;
            _this.clickEvent = (function () {
                var clickHandler = function (e) {
                    var ele = e.target;
                    var index = parseInt(ele.dataset.index);
                    if (index > _this.currentIndex + 1 && _this.isAll === true) {
                        Modal_1.Modal.alert('请按照顺序操作');
                        return;
                    }
                    else if (index === _this.currentIndex) {
                        return;
                    }
                    else {
                        _this.currentIndex = index;
                        _this.changePage(index);
                    }
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.num', clickHandler); },
                    off: function () { return d.off(_this.wrapper, 'click', '.num', clickHandler); }
                };
            })();
            _this.init(para);
            return _this;
        }
        StepBar.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"browserDevelopNav\"></div>\n        ");
        };
        StepBar.prototype.init = function (para) {
            this.btnArray = para.btnArr;
            this.initButtons();
            this.currentIndex = 0;
            var self = this;
            this.isAll = true;
            this.changePage = para.changePage;
            para.allowClickNum && this.clickEvent.on();
        };
        Object.defineProperty(StepBar.prototype, "isAll", {
            get: function () {
                return this._isAll;
            },
            set: function (isAll) {
                this._isAll = isAll;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StepBar.prototype, "currentIndex", {
            get: function () {
                return this._currentIndex;
            },
            set: function (index) {
                if (index >= this.btnArray.length - 1) {
                    this._currentIndex = this.btnArray.length - 1;
                    this.isAll = false;
                }
                else {
                    this._currentIndex = index;
                }
                this.changeStep(this._currentIndex);
            },
            enumerable: true,
            configurable: true
        });
        StepBar.prototype.initButtons = function () {
            var self = this;
            this.wrapper.appendChild(d.create("<div class=\"line\"></div>"));
            this.wrapper.appendChild(d.create("<div class=\"items\"></div>"));
            var buttonContainer = d.query('.items', this.wrapper);
            this.btnArray.forEach(function (value, index) {
                var htmlStr = "\n                <div class=\"item\">\n                    <div class=\"num\" data-name=\"num\" data-index=\"" + index + "\">" + (index + 1) + "</div>\n                    <div class=\"text\">" + value + "</div>\n                </div>\n                ";
                var htmlEle = d.create(htmlStr);
                if (index === 0) {
                    d.query('.num', htmlEle).classList.add('active');
                }
                buttonContainer.appendChild(htmlEle);
            });
        };
        StepBar.prototype.changeStep = function (index) {
            var allNum = d.queryAll('.num', this.wrapper), len = allNum.length;
            if (index >= len) {
                return;
            }
            for (var i = 0; i < len; i++) {
                if (i === index) {
                    if (!allNum[i].classList.contains('active')) {
                        allNum[i].classList.add('active');
                    }
                }
                else {
                    if (allNum[i].classList.contains('active')) {
                        allNum[i].classList.remove('active');
                    }
                }
            }
        };
        return StepBar;
    }(Component));
    exports.StepBar = StepBar;
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
