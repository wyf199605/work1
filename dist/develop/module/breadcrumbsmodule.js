/// <amd-module name="BreadCrumbsModule"/>
define("BreadCrumbsModule", ["require", "exports", "Component"], function (require, exports, Component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var BreadCrumbsModule = /** @class */ (function (_super) {
        __extends(BreadCrumbsModule, _super);
        function BreadCrumbsModule(breadCrumbs) {
            var _this = _super.call(this, breadCrumbs) || this;
            _this.breadCrumbs = breadCrumbs;
            if (tools.isEmpty(breadCrumbs))
                breadCrumbs = {};
            _this.init(breadCrumbs);
            return _this;
        }
        BreadCrumbsModule.prototype.wrapperInit = function () {
            return d.create('<div class="breadCrumbs"></div>');
        };
        BreadCrumbsModule.prototype.init = function (breadCrumbs) {
            this.title = breadCrumbs.title;
        };
        Object.defineProperty(BreadCrumbsModule.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (arr) {
                if (tools.isEmpty(arr)) {
                    arr = [];
                }
                this._title = arr;
                var htmlStr = '';
                if (!tools.isEmpty(this._title)) {
                    this._title.forEach(function (value, index, arr) {
                        if (arr.length - 1 == index) {
                            htmlStr += "<span class=\"breadCrumbs-item\">" + value + "</span>";
                        }
                        else {
                            htmlStr += "<span class=\"breadCrumbs-item\">" + value + "</span><span> >> </span>";
                        }
                    });
                }
                this.wrapper.innerHTML = htmlStr;
            },
            enumerable: true,
            configurable: true
        });
        return BreadCrumbsModule;
    }(Component_1.Component));
    exports.BreadCrumbsModule = BreadCrumbsModule;
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
