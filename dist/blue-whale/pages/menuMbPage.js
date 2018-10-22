define(["require", "exports", "menuMrg", "BwRule", "Search"], function (require, exports, menuMrg_1, BwRule_1, search_1) {
    "use strict";
    var sys = BW.sys;
    var tools = G.tools;
    var CONF = BW.CONF;
    var d = G.d;
    function setBadge(badge, num) {
        if (num > 0) {
            badge.classList.remove('hide');
            badge.textContent = num;
        }
        else {
            badge.classList.add('hide');
        }
    }
    return /** @class */ (function () {
        function menuMbPage(para) {
            this.para = para;
            // mui.init({
            //     gestureConfig: {
            //         longtap: true //默认为false
            //     }
            // });
            // mui('.mui-scroll-wrapper').scroll();
            //     gpsInfo = result;
            // });
            // window.addEventListener('putGps', function (e:CustomEvent) {
            //     gpsInfo = JSON.parse(e.detail).msg;
            // });
            d.on(d.query('#list'), 'click', 'li.mui-table-view-cell[data-href]', function () {
                sys.window.open({ url: CONF.siteUrl + this.dataset.href, gps: !!parseInt(this.dataset.gps) });
            });
            d.on(d.query('#list'), 'press', 'li.mui-table-view-cell', function () {
                var type = tools.isEmpty(this.dataset.favid) ? 'add' : 'cancel';
                menuMrg_1.MENU_FAVORITE.toggleFavSheet(this, type, {
                    favid: this.dataset.favid,
                    link: this.dataset.href
                });
            });
            (function () {
                var badgesDom = document.querySelectorAll('.mui-badge:not([data-url=""])');
                function loadBadge(badges) {
                    for (var i = 0, len = badges.length; i < len; i++) {
                        (function (el) {
                            // Rule.ajax(CONF.siteUrl + el.dataset.url, {
                            //     success : function (r) {
                            //         if(r.data[0].N !== undefined){
                            //             setBadge(el, parseInt(r.data[0].N));
                            //         }
                            //     }
                            // });
                            BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + el.dataset.url)
                                .then(function (_a) {
                                var response = _a.response;
                                if (response.data[0].N !== undefined) {
                                    setBadge(el, parseInt(response.data[0].N));
                                }
                            });
                        })(badges[i]);
                    }
                }
                loadBadge(badgesDom);
                window.addEventListener('refreshBadge', function () {
                    loadBadge(badgesDom);
                });
            }());
            //sys.window.wake('wake');
            window.addEventListener('wake', function () {
                d.queryAll('.mui-badge:not([data-url=""])').forEach(function (el) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + el.dataset.url)
                        .then(function (_a) {
                        var response = _a.response;
                        if (response.data[0].N !== undefined) {
                            setBadge(el, parseInt(response.data[0].N));
                        }
                    });
                    // Rule.ajax(CONF.siteUrl + el.dataset.url, {
                    //     success : function (r) {
                    //         if(r.data[0].N !== undefined){
                    //             setBadge(el, parseInt(r.data[0].N));
                    //         }
                    //     }
                    // });
                });
            });
            new search_1.Search({
                nodeId: para.nodeId,
                baseUrl: para.baseUrl,
                searchBtn: para.searchBtn
            });
        }
        return menuMbPage;
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
