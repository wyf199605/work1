define("MainPage", ["require", "exports", "MainPageHeader", "MainPageSideBar", "LeBasicPageHeader"], function (require, exports, MainPageHeader_1, MainPageSideBar_1, LeBasicPageHeader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="MainPage"/>
    var SPAPage = G.SPAPage;
    var d = G.d;
    var SPA = G.SPA;
    var MainPage = /** @class */ (function (_super) {
        __extends(MainPage, _super);
        function MainPage(props) {
            var _this = _super.call(this, props) || this;
            _this.hashEvent = (function () {
                var handler = function (e) {
                    var hash = e.newURL.split('#')[1], para = SPA.hashAnalyze(hash).para;
                    if (para.inTab) {
                        _this.tabsActive(hash);
                    }
                    if (!para.inTab && !para.inModal) {
                        _this.tabsClear();
                    }
                };
                return {
                    on: function () {
                        d.on(window, 'hashchange', handler);
                    },
                    off: function () {
                        d.off(window, 'hashchange', handler);
                    }
                };
            })();
            _this.hashEvent.on();
            return _this;
        }
        Object.defineProperty(MainPage.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (t) {
                this._title = t;
            },
            enumerable: true,
            configurable: true
        });
        MainPage.prototype.wrapperInit = function () {
            return h("div", { className: "lesson-main" },
                this.header = h(MainPageHeader_1.MainPageHeader, null),
                h("div", { className: "lesson-container" },
                    h("div", { className: "lesson-menu", "data-name": "lesson-menu" }, this.sideBar = h(MainPageSideBar_1.MainPageSideBar, { mainPage: this })),
                    h("div", { className: "lesson-content", id: "body" },
                        this.tabsEl = h("div", { className: "main-tabs menu-tabs" }),
                        h("div", { id: "lesson-body" }))));
        };
        MainPage.prototype.tabsRender = function (tabs, title) {
            if (title === void 0) { title = '页面'; }
            this.tabsEl.innerHTML = '';
            if (tabs[0] && tabs[0].hash) {
                this.pageHeader = h(LeBasicPageHeader_1.LeBasicPageHeader, { title: title, container: this.tabsEl });
                d.append(this.tabsEl, h("ul", { className: "nav nav-tabs nav-tabs-line" }, (tabs || []).map(function (tab) { return h("li", null,
                    h("a", { href: '#' + tab.hash }, tab.title)); })));
                SPA.open(tabs[0].hash);
                this.tabsActive(tabs[0].hash);
            }
        };
        MainPage.prototype.tabsClear = function () {
            this.tabsEl.innerHTML = '';
        };
        MainPage.prototype.tabsActive = function (hash) {
            var activeClass = 'active';
            var actived = d.query("li." + activeClass, this.tabsEl), tabEl = d.query("li a[href=\"#" + hash + "\"]", this.tabsEl);
            d.classRemove(actived, activeClass);
            tabEl && d.classAdd(tabEl.parentElement, activeClass);
        };
        MainPage.prototype.init = function (para, data) {
            this.title = '首页';
        };
        MainPage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.sideBar.destroy();
            this.header.destroy();
            this.hashEvent.off();
            this.hashEvent = null;
            this.sideBar = null;
            this.header = null;
        };
        return MainPage;
    }(SPAPage));
    exports.MainPage = MainPage;
});

define("MainPageHeader", ["require", "exports", "LeRule", "Modal"], function (require, exports, LeRule_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="MainPageHeader"/>
    var d = G.d;
    var Component = G.Component;
    var CONF = LE.CONF;
    var SPA = G.SPA;
    var MainPageHeader = /** @class */ (function (_super) {
        __extends(MainPageHeader, _super);
        function MainPageHeader(para) {
            var _this = _super.call(this, para) || this;
            _this.mainPageHeaderEvents = (function () {
                // 点击隐藏或显示sidebar
                var hideOrShowEvent = function () {
                    _this.isHideSideBar = !_this.isHideSideBar;
                };
                var clickSchoolEvent = function () {
                    _this.isHideSideBar = false;
                };
                var shortcutKeyEvent = function (e) {
                    var a = d.closest(e.target, '.header-link'), linkName = a.dataset.link;
                    switch (linkName) {
                        case 'home':
                            // 首页
                            _this.isHideSideBar = false;
                            break;
                        case 'changeSkin':
                            // 换肤
                            break;
                        case 'help':
                            // 帮助
                            break;
                        case 'logout':
                            // 登出
                            LeRule_1.LeRule.Ajax.fetch(CONF.ajaxUrl.logout).then(function (_a) {
                                var response = _a.response;
                                Modal_1.Modal.toast(response.msg);
                                SPA.open(SPA.hashCreate('loginReg', 'login'));
                            });
                            break;
                    }
                };
                return {
                    on: function () {
                        d.on(_this.wrapper, 'click', '.seclesson-shouqicaidan', hideOrShowEvent);
                        d.on(_this.wrapper, 'click', '.school', clickSchoolEvent);
                        d.on(_this.wrapper, 'click', '.shortcut-key .header-link', shortcutKeyEvent);
                    },
                    off: function () {
                        d.off(_this.wrapper, 'click', '.seclesson-shouqicaidan', hideOrShowEvent);
                        d.off(_this.wrapper, 'click', '.school', clickSchoolEvent);
                        d.off(_this.wrapper, 'click', '.shortcut-key .header-link', shortcutKeyEvent);
                    }
                };
            })();
            _this.mainPageHeaderEvents.on();
            _this.changeColor();
            _this.colorInit();
            return _this;
        }
        MainPageHeader.prototype.wrapperInit = function (para) {
            var _this = this;
            var time = this.getCurrentTime(false);
            this.timer = setTimeout(function () {
                _this.currentTime = _this.getCurrentTime(true);
            }, 1000);
            var loginData = JSON.parse(localStorage.getItem('loginData')), userName = loginData.filter(function (user) { return user.NAME === 'user_name'; })[0], deptName = loginData.filter(function (user) { return user.NAME === 'dept_name'; })[0];
            return h("div", { class: "lesson-header" },
                h("div", { className: "header-left-logo" },
                    h("a", { className: "school", href: "#/lesson2/home" }, deptName.VALUE),
                    h("i", { className: "sec seclesson-shouqicaidan" })),
                h("div", { className: "header-right-info" },
                    h("span", { class: "welcome" },
                        "\u6B22\u8FCE\u60A8\uFF0C",
                        userName.VALUE,
                        "\uFF01\u00A0\u00A0\u00A0\u00A0",
                        h("span", { className: "header-time" }, time)),
                    h("div", { className: "shortcut-key" },
                        h("a", { className: "header-link", "data-link": "home", href: "#/lesson2/home" },
                            h("i", { className: "sec seclesson-shouye" }),
                            " \u9996\u9875"),
                        h("a", { className: "header-link head-huanfu", "data-link": "changeSkin" },
                            h("i", { className: "sec seclesson-huanfu" }),
                            " \u6362\u80A4"),
                        h("a", { className: "header-link", "data-link": "help" },
                            h("i", { className: "sec seclesson-bangzhu" }),
                            " \u5E2E\u52A9"),
                        h("a", { className: "header-link", "data-link": "logout" },
                            h("i", { className: "sec seclesson-tuichu" }),
                            " \u9000\u51FA"))));
        };
        MainPageHeader.prototype.colorInit = function () {
            var color = (localStorage.getItem('huanfu'));
            document.body.classList.add(color);
        };
        Object.defineProperty(MainPageHeader.prototype, "currentTime", {
            get: function () {
                return this._currentTime;
            },
            set: function (time) {
                this._currentTime = time;
                d.query('.header-time', this.wrapper).innerText = this._currentTime;
            },
            enumerable: true,
            configurable: true
        });
        MainPageHeader.prototype.getCurrentTime = function (isTimer) {
            var _this = this;
            var nowDate = new Date(), weeksArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'], year = nowDate.getFullYear(), month = this.checkAndAddZeroForTime(nowDate.getMonth() + 1), date = this.checkAndAddZeroForTime(nowDate.getDate()), hour = this.checkAndAddZeroForTime(nowDate.getHours()), minutes = this.checkAndAddZeroForTime(nowDate.getMinutes()), seconds = this.checkAndAddZeroForTime(nowDate.getSeconds()), week = weeksArr[nowDate.getDay()];
            isTimer && (this.timer = setTimeout(function () {
                _this.currentTime = _this.getCurrentTime(true);
            }, 1000));
            return year + '.' + month + '.' + date + ' ' + week + ' ' + hour + ' : ' + minutes + ' : ' + seconds;
        };
        // 在时间前加0
        MainPageHeader.prototype.checkAndAddZeroForTime = function (time) {
            return time >= 10 ? time : '0' + time;
        };
        Object.defineProperty(MainPageHeader.prototype, "isHideSideBar", {
            get: function () {
                return this._isHideSideBar;
            },
            set: function (isHide) {
                this._isHideSideBar = isHide;
                var angle = isHide ? 180 : 0, translate = isHide ? -100 : 0, width = isHide ? '100%' : 'calc(100% - 212px)', left = isHide ? '0px' : '212px', bodyContent = d.query('#body'), menu = d.query('.lesson-menu'), toggleIcon = d.query('.seclesson-shouqicaidan', this.wrapper);
                toggleIcon.style.transform = "rotate(" + angle + "deg)";
                menu.style.transform = "translateX(" + translate + "%) translateZ(0)";
                bodyContent.style.width = width;
                bodyContent.style.left = left;
            },
            enumerable: true,
            configurable: true
        });
        MainPageHeader.prototype.changeColor = function () {
            var colorArr = ['skin-1', 'skin-2', 'skin-3', 'skin-4', 'skin-5'], i = 0;
            d.on(this.wrapper, 'click', '.head-huanfu', function () {
                var body = document.body, classList = body.className;
                localStorage.setItem('huanfu', colorArr[i]);
                body.classList.add(colorArr[i]);
                for (var j = 0; j < colorArr.length; j++) {
                    if (j == i) {
                        continue;
                    }
                    body.classList.remove(colorArr[j]);
                }
                ++i;
                if (i >= colorArr.length) {
                    i = 0;
                }
            });
        };
        MainPageHeader.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            clearTimeout(this.timer);
            this.timer = null;
            this.mainPageHeaderEvents.off();
        };
        return MainPageHeader;
    }(Component));
    exports.MainPageHeader = MainPageHeader;
});

/// <amd-module name="MainPageSideBar"/>
define("MainPageSideBar", ["require", "exports", "Menu", "LeRule", "Modal"], function (require, exports, Menu_1, LeRule_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPA = G.SPA;
    var tools = G.tools;
    var Component = G.Component;
    var MainPageSideBar = /** @class */ (function (_super) {
        __extends(MainPageSideBar, _super);
        function MainPageSideBar(para) {
            var _this = _super.call(this, para) || this;
            _this.mainPage = para.mainPage;
            _this.menu = new Menu_1.Menu({
                container: _this.wrapper,
                isVirtual: true,
                isLeaf: false,
                expand: true,
                expandIconArr: ['seclesson-youjiantou', 'seclesson-xiala'],
                expandIconPre: 'sec',
                ajax: function (node) {
                    var url = '', menu = node.content;
                    if (tools.isNotEmpty(menu)) {
                        var path = menu && menu.menuPath;
                        if (path) {
                            url = LE.CONF.siteUrl + path.dataAddr + '?output=json';
                        }
                    }
                    else {
                        url = LE.CONF.ajaxUrl.menu;
                    }
                    if (url) {
                        return LeRule_1.LeRule.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            var children = [], elements = tools.keysVal(response, 'body', 'elements');
                            Array.isArray(elements) && elements.forEach(function (item) {
                                children.push(obj2NodeItem(item, node.deep + 1));
                            });
                            return children;
                        }).catch(function (e) {
                            console.log(e);
                        });
                    }
                    else {
                        return Promise.reject('menuPath参数为空');
                    }
                }
            });
            _this.menu.onOpen = function (node) {
                var menu = node.content, menuType = menu.menuType, menuPath = menu.menuPath;
                if (menuType === 1) {
                    SPA.open(hashGet(menuPath));
                }
                else if (menuType === 0 && node.deep === 2) {
                    var url = LE.CONF.siteUrl + menuPath.dataAddr + '?output=json';
                    LeRule_1.LeRule.Ajax.fetch(url).then(function (_a) {
                        var response = _a.response;
                        var elements = tools.keysVal(response, 'body', 'elements') || [];
                        if (tools.isEmpty(elements)) {
                            Modal_1.Modal.alert('此菜单下页面为空');
                            return;
                        }
                        _this.mainPage.tabsRender(elements.map(function (element) {
                            return { title: element.menuName, hash: hashGet(element.menuPath, true) };
                        }), response.caption);
                    });
                }
                function hashGet(menuPath, inTab) {
                    if (inTab === void 0) { inTab = false; }
                    var isCustom = menuPath.type === 'custom', para = {
                        inTab: inTab,
                        url: isCustom ? null : menuPath.dataAddr
                    };
                    if (menuPath.type === 'custom') {
                        return SPA.hashCreate('lesson2', menuPath.dataAddr, para);
                    }
                    else {
                        return SPA.hashCreate('lesson2', 'common', para);
                    }
                }
            };
            return _this;
        }
        MainPageSideBar.prototype.wrapperInit = function () {
            return h("div", { className: "side-bar" });
        };
        MainPageSideBar.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.menu.destroy();
            this.menu = null;
            this.mainPage = null;
        };
        return MainPageSideBar;
    }(Component));
    exports.MainPageSideBar = MainPageSideBar;
    function obj2NodeItem(ele, deep) {
        return {
            text: ele.menuName,
            icon: tools.isNotEmpty(ele.menuIcon) ? ele.menuIcon : 'icon',
            isLeaf: deep === 2 || ele.menuType !== 0,
            content: ele || {}
        };
    }
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
