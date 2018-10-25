define(["require", "exports", "BwRule", "Modal", "User", "ShellAction"], function (require, exports, BwRule_1, Modal_1, User_1, ShellAction_1) {
    "use strict";
    var sys = BW.sys;
    var tools = G.tools;
    var CONF = BW.CONF;
    var d = G.d;
    var Ajax = G.Ajax;
    var Shell = G.Shell;
    return /** @class */ (function () {
        function myselfMbPage() {
            var _this = this;
            // mui.init();
            // '.mui-scroll-wrapper').scroll();
            var self = this;
            var user = User_1.User.get();
            d.setHTML(d.query('#userid'), user.are_id + ' ' + user.department);
            d.setHTML(d.query('#name'), user.username + ' ' + user.userid);
            var list = d.query('#table-list');
            if (tools.isMb) {
                this.setFontSize(list);
                this.rfidSettingInit(list);
            }
            // 安卓判断
            if (sys.os === 'ad') {
                var li1 = h("li", { className: "mui-table-view-cell", "data-page-name": "powerManager" },
                    h("a", { href: "#", className: "mui-navigate-right" },
                        " ",
                        h("i", { class: "iconfont icon-023tuceng-copy-copy", style: "color:#f15054;margin-right:10px" }),
                        "\u6743\u9650\u7BA1\u7406")), li2 = h("li", { className: "mui-table-view-cell", "data-page-name": "whiteBat" },
                    h("a", { href: "#", className: "mui-navigate-right" },
                        " ",
                        h("i", { class: "iconfont icon-renyuan", style: "color:#4ea6f1;margin-right:10px" }),
                        "\u7535\u6C60\u767D\u540D\u5355"));
                d.append(list, li1);
                d.append(list, li2);
                d.on(d.query('[data-page-name=powerManager]'), 'click', function () {
                    sys.window.powerManager();
                });
                d.on(d.query('[data-page-name=whiteBat]'), 'click', function () {
                    sys.window.whiteBat();
                });
            }
            if (CONF.appid === 'app_fastlion_retail') {
                var li = h("li", { className: "mui-table-view-cell", id: "changePassword" },
                    h("a", { href: "#", className: "mui-navigate-right" },
                        " ",
                        h("i", { className: "iconfont icon-renyuan", style: "color:#FFB741;margin-right:10px" }),
                        "\u5BC6\u7801\u4FEE\u6539"));
                d.append(list, li);
            }
            d.on(d.query('.selfMenuPage'), 'click', '.mui-table-view>.mui-table-view-cell[data-page-name]', function (e) {
                var dataset = d.closest(e.target, '.mui-table-view-cell[data-page-name]').dataset.pageName;
                var pageUrl = BW.CONF.url[dataset];
                if (pageUrl) {
                    if (dataset === 'myself') {
                        sys.window.open({
                            url: tools.url.addObj(CONF.url.myself, {
                                userid: user.userid
                            })
                        });
                    }
                    else if (dataset === 'bugReport') {
                        sys.window.open({
                            url: CONF.url.bugList
                        });
                    }
                    else if (dataset === 'myApplication') {
                        sys.window.open({
                            url: CONF.url.myApplication
                        });
                    }
                    else if (dataset === 'myApproval') {
                        sys.window.open({
                            url: CONF.url.myApproval
                        });
                    }
                    else {
                        sys.window.open({
                            url: pageUrl
                        });
                    }
                }
            });
            d.on(d.query('#changPassword'), 'click', function () {
                sys.window.open({
                    url: CONF.url.changePassword
                });
            });
            d.on(d.query('#check'), 'click', function () {
                sys.window.update();
            });
            d.on(d.query('#clear'), 'click', function () {
                sys.window.clear();
                Modal_1.Modal.toast('清理成功');
            });
            d.on(d.query('#scan'), 'click', function () {
                (ShellAction_1.ShellAction.get()).device().scan({
                    callback: function (e) {
                        alert(e.detail);
                    }
                });
            });
            d.on(d.query('[data-action="logout"]'), 'click', function () {
                // Rule.ajax(CONF.ajaxUrl.logout, {
                //     success : function () {
                //         Modal.toast('退出成功');
                //         sys.window.logout(CONF.siteAppVerUrl + "/index?uuid="+Device.get().uuid);
                //     }
                // });
                BwRule_1.BwRule.Ajax.fetch(CONF.ajaxUrl.logout)
                    .then(function (_a) {
                    Modal_1.Modal.toast('退出成功');
                    sys.window.logout();
                });
            });
            d.on(d.query('#testNetwork'), 'click', function () {
                _this.initModal();
                var urls = [100, 300, 500, 400].map(function (num) { return tools.url.addObj(CONF.ajaxUrl.speedTest, { size: num }); });
                var testStart = true;
                d.on(d.query('body'), 'click', '.mui-rotate-box', function () {
                    var _this = this;
                    if (testStart) {
                        var progressBar_1 = d.query('.mui-progress-bar', this.parentElement);
                        var progressWidth_1 = d.query('.mui-progress', this.parentElement).offsetWidth;
                        progressBar_1.style.width = 0 + 'px';
                        testStart = false;
                        this.className += ' animate_start';
                        var interval_1 = null;
                        var timeout_1 = null;
                        var width_1 = 0;
                        var scroll_1 = 0;
                        var addWidth_1 = function () {
                            progressBar_1.style.transition = 0 + 's';
                            progressBar_1.style.webkitTransition = 0 + 's';
                            interval_1 = setInterval(function () {
                                width_1++;
                                _this.querySelector('.box-content').innerHTML = '测速中...';
                                progressBar_1.style.width = width_1 + 'px';
                                if (width_1 / progressWidth_1 >= scroll_1) {
                                    clearInterval(interval_1);
                                }
                            }, 100);
                        };
                        addWidth_1();
                        self.speedTest(urls, function (results) {
                            clearInterval(interval_1);
                            clearInterval(timeout_1);
                            scroll_1 = (results.length + 1) / urls.length;
                            progressBar_1.style.transition = .8 + 's';
                            progressBar_1.style.webkitTransition = .8 + 's';
                            width_1 = progressWidth_1 * (results.length / urls.length);
                            progressBar_1.style.width = width_1 + 'px';
                            timeout_1 = setTimeout(function () {
                                addWidth_1();
                            }, 800);
                            if (results.length === urls.length) {
                                clearInterval(interval_1);
                                clearInterval(timeout_1);
                                var sum_1 = 0;
                                results.forEach(function (val) {
                                    sum_1 += val;
                                });
                                setTimeout(function () {
                                    _this.className = _this.classList[0];
                                    _this.querySelector('.box-content').innerHTML =
                                        (sum_1 / results.length).toFixed(2) + 'KB/s';
                                    testStart = true;
                                }, 1000);
                            }
                        });
                    }
                });
            });
            sys.window.close = double_back;
        }
        myselfMbPage.prototype.rfidSettingInit = function (list) {
            if (Shell.inventory.canRfid == true) {
                var li = h("li", { className: "mui-table-view-cell", id: "rfidSettingIn" },
                    h("a", { href: "#", className: "mui-navigate-right" },
                        h("i", { className: "iconfont icon-pinlei", style: "color:#FFB741;margin-right:10px" }),
                        "rfid\u8BBE\u7F6E\u914D\u7F6E"));
                d.after(list.children[1], li);
                d.on(li, 'click', function () {
                    //let setting = new RfidSettingModal();
                    sys.window.open({
                        url: (CONF.siteAppVerUrl + "/commonui/pageroute?page=rfidSetting")
                    });
                });
            }
        };
        myselfMbPage.prototype.initModal = function () {
            var wrapper = h("div", { className: "test-module-wrapper" });
            var body = h("div", { className: "mui-content" },
                h("div", { className: "mui-rotate-box" },
                    h("div", { className: "box-content" }, "\u70B9\u51FB\u6D4B\u901F"),
                    h("div", { className: "circle-box1" }),
                    h("div", { className: "circle-box2" })),
                h("div", { className: "mui-progress" },
                    h("div", { className: "mui-progress-bar" })));
            var modal = new Modal_1.Modal({
                container: d.closest(wrapper, '.page-container'),
                header: '网络测速',
                body: body,
                position: sys.isMb ? 'full' : '',
                width: '730px',
                isShow: true
            });
        };
        myselfMbPage.prototype.speedTest = function (urls, callback) {
            test(urls);
            var results = [];
            function test(urls, num) {
                if (num === void 0) { num = 0; }
                if (urls.length === num) {
                    return;
                }
                var startTime = new Date().getTime();
                Ajax.fetch(urls[num])
                    .then(function (_a) {
                    var response = _a.response;
                    var time = new Date().getTime() - startTime;
                    num++;
                    var size = tools.str.utf8Len(response);
                    results.push((size / 1024) / (time / 1000));
                    callback && callback(results);
                    test(urls, num);
                });
            }
        };
        myselfMbPage.prototype.setFontSize = function (list) {
            var _this = this;
            var li = h("li", { className: "mui-table-view-cell", id: "setFontSize" },
                h("a", { href: "#", className: "mui-navigate-right" },
                    h("i", { class: "iconfont icon-icon-test", style: "color:#4ea6f1;" }),
                    " \u8BBE\u7F6E\u5B57\u4F53\u5927\u5C0F"));
            d.append(list, li);
            var selectPanel = h("div", { className: "select-panel hide" },
                h("div", { className: "fs-item small", "data-index": "0" }, "\u4E2D(\u9ED8\u8BA4)"),
                h("div", { className: "fs-item middle", "data-index": "1" }, "\u5927"),
                h("div", { className: "fs-item big", "data-index": "2" }, "\u7279\u5927"));
            d.append(list, selectPanel);
            d.on(d.query('#setFontSize'), 'click', function () {
                d.query('.select-panel').classList.toggle('hide');
                d.query('#setFontSize').classList.toggle('active');
            });
            this.setFontSizeItemClass();
            var classArr = ['defalut', 'big', 'super-fontsize'];
            d.on(d.query('.select-panel'), 'click', '.fs-item', function (e) {
                var target = e.target, className = classArr[target.dataset['index']];
                d.query('.select-panel').classList.add('hide');
                d.query('#setFontSize').classList.remove('active');
                if (className === localStorage.getItem('bw-fontsize')) {
                    return;
                }
                Modal_1.Modal.confirm({
                    msg: '需要重新登录，确认更改字体大小？',
                    title: '温馨提示',
                    callback: function (flag) {
                        if (flag) {
                            if (className === 'default') {
                                className = '';
                            }
                            localStorage.setItem('bw-fontsize', className);
                            sys.window.logout();
                        }
                        else {
                            _this.setFontSizeItemClass();
                        }
                    }
                });
            });
        };
        myselfMbPage.prototype.setFontSizeItemClass = function () {
            d.queryAll('.fs-item').forEach(function (el) {
                el.classList.remove('active');
            });
            var classArr = ['defalut', 'big', 'super-fontsize'];
            var localClass = localStorage.getItem('bw-fontsize');
            if (tools.isEmpty(localClass)) {
                localClass = 'defalut';
            }
            d.queryAll('.fs-item')[classArr.indexOf(localClass)].classList.add('active');
        };
        return myselfMbPage;
    }());
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
