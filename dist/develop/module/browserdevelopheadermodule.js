/// <amd-module name="BrowserDevelopHeaderModule"/>
define("BrowserDevelopHeaderModule", ["require", "exports", "Component", "Modal"], function (require, exports, Component_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var BrowserDevelopHeaderModule = /** @class */ (function (_super) {
        __extends(BrowserDevelopHeaderModule, _super);
        function BrowserDevelopHeaderModule(browserDevelopHeaderPara) {
            var _this = _super.call(this, browserDevelopHeaderPara) || this;
            _this.init(browserDevelopHeaderPara);
            return _this;
        }
        BrowserDevelopHeaderModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"browserDevelopNav\"></div>\n        ");
        };
        BrowserDevelopHeaderModule.prototype.init = function (browserDevelopHeaderPara) {
            this.btnArray = browserDevelopHeaderPara.btnArr;
            this.initButtons();
            this.currentIndex = 0;
            var self = this;
            this.isAll = true;
            this.changePage = browserDevelopHeaderPara.changePage;
            d.on(this.wrapper, 'click', '.num', function (e) {
                var ele = e.target;
                var index = parseInt(ele.dataset.index);
                if (index > self.currentIndex + 1 && self.isAll === true) {
                    Modal_1.Modal.alert('请按照顺序操作');
                    return;
                }
                else if (index === self.currentIndex) {
                    return;
                }
                else {
                    self.currentIndex = index;
                    self.changePage(index);
                }
            });
        };
        Object.defineProperty(BrowserDevelopHeaderModule.prototype, "isAll", {
            get: function () {
                return this._isAll;
            },
            set: function (isAll) {
                this._isAll = isAll;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDevelopHeaderModule.prototype, "currentIndex", {
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
        BrowserDevelopHeaderModule.prototype.initButtons = function () {
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
        BrowserDevelopHeaderModule.prototype.changeStep = function (index) {
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
        return BrowserDevelopHeaderModule;
    }(Component_1.Component));
    exports.BrowserDevelopHeaderModule = BrowserDevelopHeaderModule;
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
