define("NoticeDetail", ["require", "exports", "LeRule", "Loading"], function (require, exports, LeRule_1, loading_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var NoticeDetail = /** @class */ (function (_super) {
        __extends(NoticeDetail, _super);
        function NoticeDetail(para) {
            var _this = _super.call(this, para) || this;
            var id = G.tools.url.getPara('id', location.hash);
            setTimeout(function () {
                var s = new loading_1.Loading({
                    container: _this.wrapper.parentElement,
                    duration: 3
                });
                _this.load(id);
            }, 20);
            return _this;
        }
        NoticeDetail.prototype.wrapperInit = function (para) {
            return h("div", { class: "notice-dt-rg" },
                h("div", { class: "notice-detail-title" }),
                h("div", { class: "notice-detail-content" }));
        };
        NoticeDetail.prototype.load = function (id) {
            var detail, title = d.query('.notice-detail-title', this.wrapper.parentElement), content = d.query('.notice-detail-content', this.wrapper.parentElement);
            title.innerHTML = "";
            content.innerHTML = "";
            LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.noticeDetail + ("?id=" + id), {
                loading: {
                    container: this.wrapper.parentElement
                }
            }).then(function (_a) {
                var response = _a.response;
                var data = response.data.data;
                console.log(data);
                if (data[0]) {
                    data.forEach(function (value) {
                        title.innerHTML = value.TITLE;
                        content.innerHTML = value.CONTENT;
                    });
                }
            });
        };
        return NoticeDetail;
    }(Component));
    exports.NoticeDetail = NoticeDetail;
});

define("NoticeList", ["require", "exports", "DataManager", "LeRule"], function (require, exports, DataManager_1, LeRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var NoticeList = /** @class */ (function (_super) {
        __extends(NoticeList, _super);
        function NoticeList(para) {
            var _this = _super.call(this, para) || this;
            _this.getJava().then(function (val) {
                _this.AjaxData = val;
                console.log(_this.AjaxData);
                var paging = d.query('.notice-paging', _this.wrapper);
                console.log(_this.AjaxData);
                _this.dataManage = new DataManager_1.DataManager({
                    data: _this.AjaxData,
                    page: {
                        size: 7,
                        options: [7, 14],
                        container: paging
                    },
                    render: function (start, length, isRefresh) {
                        var data = _this.dataManage.data.slice(start, length + start);
                        _this.dataList(data, true, para.onChange);
                    }
                });
            });
            return _this;
        }
        NoticeList.prototype.wrapperInit = function (para) {
            return h("div", { class: "notice-li-lf" },
                h("div", { class: "notice-li-title" }, "\u516C\u544A"),
                h("div", { class: "notice-list" },
                    h("div", null, "\u516C\u544A")),
                h("div", { class: "notice-paging" }));
        };
        NoticeList.prototype.getJava = function () {
            return new Promise(function (resolve, reject) {
                LeRule_1.LeRule.Ajax.fetch(LE.CONF.ajaxUrl.noticeList).then(function (_a) {
                    var response = _a.response;
                    if ((response.data.data)) {
                        resolve(response.data.data);
                    }
                });
            });
        };
        NoticeList.prototype.dataList = function (data, refresh, fun) {
            var list = d.query('.notice-list', this.wrapper);
            if (refresh) {
                list.innerHTML = "";
            }
            var datawrapp = h("ul", null, data.map(function (value, index) {
                return h("li", { "data-role": value.ID },
                    h("p", null, value.TITLE),
                    h("p", null, value.ACTIME));
            }));
            if (datawrapp) {
                var lis = d.queryAll('li', datawrapp);
                lis.forEach(function (value, index) {
                    d.on(value, 'click', function () {
                        fun(value.dataset.role);
                    });
                });
            }
            d.append(list, datawrapp);
        };
        return NoticeList;
    }(Component));
    exports.NoticeList = NoticeList;
});

define("NoticePage", ["require", "exports", "NoticeList", "NoticeDetail"], function (require, exports, NoticeList_1, NoticeDetail_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="NoticePage"/>
    var SPAPage = G.SPAPage;
    var NoticePage = /** @class */ (function (_super) {
        __extends(NoticePage, _super);
        function NoticePage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NoticePage.prototype.init = function (para, data) {
        };
        NoticePage.prototype.wrapperInit = function () {
            var _this = this;
            return h("div", { class: "notice-page" },
                this.list = h(NoticeList_1.NoticeList, { onChange: function (id) {
                        _this.detail.load(id);
                    } }),
                this.detail = h(NoticeDetail_1.NoticeDetail, null));
        };
        Object.defineProperty(NoticePage.prototype, "title", {
            get: function () {
                return;
            },
            set: function (str) {
            },
            enumerable: true,
            configurable: true
        });
        return NoticePage;
    }(SPAPage));
    exports.NoticePage = NoticePage;
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
