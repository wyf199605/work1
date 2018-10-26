define("BugList", ["require", "exports", "BugReport", "DataManager", "BwRule"], function (require, exports, BugReport_1, DataManager_1, BwRule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var CONF = BW.CONF;
    var sys = BW.sys;
    var d = G.d;
    var tools = G.tools;
    var BugList = /** @class */ (function (_super) {
        __extends(BugList, _super);
        function BugList(para) {
            var _this = _super.call(this) || this;
            _this.noData = (function () {
                return {
                    toggle: function (isShow) {
                        _this.wrapper.classList.toggle(BugList.BUGLISt_NOT_DATA_CLASS, isShow);
                    }
                };
            })();
            _this.detailEvent = (function () {
                var detailHandler = function (e) {
                    var bugItem = d.closest(e.target, '.bug-item'), id = bugItem.dataset.id;
                    sys.window.open({
                        url: tools.url.addObj(CONF.url.bugDetail, {
                            bugid: id,
                            isself: _this.allowUpdate
                        })
                    });
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'click', '.bug-item', detailHandler); },
                    off: function () { return d.off(_this.wrapper, 'click', '.bug-item', detailHandler); }
                };
            })();
            _this.swipeEvent = (function () {
                var expansion = null, x = 0, y = 0, X = 0, Y = 0, swipeX = false, swipeY = false;
                var swipeHandler = function (event) {
                    _this.currentItem && _this.currentItem.classList.remove('active');
                    var bugItem = d.closest(event.target, '.bug-item');
                    bugItem.classList.add('active');
                    _this.currentItem = bugItem;
                    if (_this.allowUpdate) {
                        x = event.changedTouches[0].pageX;
                        y = event.changedTouches[0].pageY;
                        swipeX = true;
                        swipeY = true;
                        if (expansion) { //判断是否展开，如果展开则收起
                            expansion.classList.remove('swipeleft');
                        }
                        var moveHandler_1 = function (e) {
                            e.stopPropagation();
                            X = e.changedTouches[0].pageX;
                            Y = e.changedTouches[0].pageY;
                            var target = d.closest(e.target, '.bug-item'), swipeout = d.query('.swipeout', target);
                            // 左右滑动
                            if (swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0) {
                                // 阻止事件冒泡
                                e.stopPropagation();
                                if (X - x > 10) { //右滑
                                    swipeout.classList.remove('swipeleft'); //右滑收起
                                }
                                if (x - X > 10) { //左滑
                                    swipeout.classList.add('swipeleft'); //左滑展开
                                    expansion = swipeout;
                                }
                                swipeY = false;
                            }
                            // 上下滑动
                            if (swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                                swipeX = false;
                            }
                        };
                        var endHandler_1;
                        d.on(_this.wrapper, 'touchmove', '.bug-item', moveHandler_1);
                        d.on(_this.wrapper, 'touchend', '.bug-item', endHandler_1 = function () {
                            d.off(_this.wrapper, 'touchmove', '.bug-item', moveHandler_1);
                            d.off(_this.wrapper, 'touchend', '.bug-item', endHandler_1);
                        });
                    }
                    else {
                        var endHandler_2;
                        d.on(_this.wrapper, 'touchend', '.bug-item', endHandler_2 = function () {
                            d.off(_this.wrapper, 'touchend', '.bug-item', endHandler_2);
                        });
                    }
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'touchstart', '.bug-item', swipeHandler); },
                    off: function () { return d.off(_this.wrapper, 'touchstart', '.bug-item', swipeHandler); }
                };
            })();
            _this.updateEvent = (function () {
                var tapHanlder = function (e) {
                    e.stopPropagation();
                    var bugItem = d.closest(e.target, '.bug-item');
                    new BugReport_1.BugReportModal(parseInt(bugItem.dataset.id), true);
                };
                return {
                    on: function () { return d.on(_this.wrapper, 'touchstart', '.swipeout', tapHanlder); },
                    off: function () { return d.off(_this.wrapper, 'touchstart', '.swipeout', tapHanlder); }
                };
            })();
            _this.currentBugItemId = -1;
            _this.noData.toggle(true);
            // setTimeout(() => {
            // 查询所有列表
            var muiContent = d.query('.mui-content');
            var dataManager = new DataManager_1.DataManager({
                loading: {
                    msg: '正在加载，请稍后...',
                    disableEl: muiContent,
                    container: document.body
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var ajaxPara = "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}";
                        return BwRule_1.BwRule.Ajax.fetch(para.ajaxUrl, {
                            data: {
                                pageparams: ajaxPara
                            }
                        }).then(function (_a) {
                            var response = _a.response;
                            return { data: response.data, total: response.head.totalNum };
                        });
                    },
                    auto: true,
                },
                page: {
                    size: 20,
                    options: [20],
                    container: _this.wrapper.parentElement
                },
                render: function (start, length) {
                    var data = dataManager.data.slice(start, length);
                    _this.noData.toggle(data.length === 0);
                    _this.initDom(data);
                }
            });
            _this.dataManager = dataManager;
            _this.detailEvent.on();
            _this.allowUpdate = tools.isNotEmpty(para.allowUpdate) ? para.allowUpdate : false;
            _this.swipeEvent.on();
            _this.updateEvent.on();
            return _this;
            // }, 50);
        }
        BugList.prototype.wrapperInit = function () {
            return h("div", { className: "bug-container" });
        };
        Object.defineProperty(BugList.prototype, "currentItem", {
            get: function () {
                return this._currentItem;
            },
            set: function (item) {
                this._currentItem = item;
            },
            enumerable: true,
            configurable: true
        });
        BugList.prototype.initDom = function (bugList) {
            var _this = this;
            this.wrapper.innerHTML = '';
            var status = ['未处理', '处理中', '已解决', '重新申报'], // 0,1,2,3
            statusClass = ['open', 'close', 'doing', 'redo'];
            bugList.forEach(function (bug) {
                var message = bug.MESSAGE;
                message = tools.isNotEmpty(message) ? message : '用户未描述';
                var bugItemWrapper = h("div", { className: "bug-item", "data-id": bug.BUG_ID },
                    h("div", { className: "title-wrapper" },
                        h("div", { className: "title" }, bug.TITLE),
                        h("div", { className: "status " + statusClass[bug.BUG_STATUS] }, status[bug.BUG_STATUS]),
                        h("div", { className: "time" }, _this.handlerTime(bug.UPDATE_TIME))),
                    h("div", { className: "content" }, message),
                    h("div", { className: "line" }),
                    h("div", { className: "swipeout" }, "\u4FEE\u6539"));
                _this.wrapper.appendChild(bugItemWrapper);
            });
        };
        BugList.prototype.handlerTime = function (time) {
            var date = new Date(time * 1000), year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate(), monthStr = month < 10 ? '0' + month : month, dayStr = day < 10 ? '0' + day : day;
            return year + '/' + monthStr + '/' + dayStr;
        };
        BugList.prototype.destory = function () {
            this.updateEvent.off();
            this.swipeEvent.off();
            this.detailEvent.off();
            this.currentBugItemId = -1;
        };
        BugList.BUGLISt_NOT_DATA_CLASS = 'buglist-nodata';
        return BugList;
    }(Component));
    exports.BugList = BugList;
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
