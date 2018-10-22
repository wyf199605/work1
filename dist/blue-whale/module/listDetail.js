/// <amd-module name="ListItemDetail"/>
define("ListItemDetail", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ListItemDetail = /** @class */ (function () {
        function ListItemDetail(para) {
            this.para = para;
            this.wrapper = para.dom;
        }
        // 初始化详情DOM
        ListItemDetail.prototype.initDetailTpl = function (fields) {
        };
        // 设置详情数据
        ListItemDetail.prototype.render = function (data) {
        };
        // 初始化详情按钮
        ListItemDetail.prototype.initDetailButtons = function (buttons) {
        };
        return ListItemDetail;
    }());
    exports.ListItemDetail = ListItemDetail;
});

/// <amd-module name="ListItemDetailCell"/>
define("ListItemDetailCell", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var ListItemDetailCell = /** @class */ (function (_super) {
        __extends(ListItemDetailCell, _super);
        function ListItemDetailCell(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.render(para);
            return _this;
        }
        ListItemDetailCell.prototype.wrapperInit = function (para) {
            var wrapper = null;
            if (!!para.isImg) {
                wrapper = h("div", { className: "detail-cell-img" },
                    h("div", { "c-var": "title", className: "detail-cell-title" }),
                    h("div", { "c-var": "imgs", className: "detail-cell-imgs" }));
            }
            else {
                wrapper = h("div", { className: "detail-cell" },
                    h("div", { "c-var": "title", className: "detail-cell-title" }),
                    h("div", { "c-var": "content", className: "detail-cell-content" }));
            }
            return wrapper;
        };
        ListItemDetailCell.prototype.createImgs = function (value, imgsWrapper) {
            var _this = this;
            imgsWrapper.innerHTML = '';
            if (tools.isEmpty(value)) {
                return;
            }
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    d.append(imgsWrapper, h("img", { src: v, alt: _this.para.caption + '详情图片' }));
                });
            }
            else {
                d.append(imgsWrapper, h("img", { src: value, alt: this.para.caption + '详情图片' }));
            }
        };
        ListItemDetailCell.prototype.render = function (data) {
            if (!!this.para.isImg) {
                this.innerEl.title.innerText = data.caption || '';
                this.createImgs(data.value, this.innerEl.imgs);
            }
            else {
                this.innerEl.title.innerText = data.caption || '';
                this.innerEl.content.innerText = data.value || '';
            }
        };
        return ListItemDetailCell;
    }(Component));
    exports.ListItemDetailCell = ListItemDetailCell;
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
