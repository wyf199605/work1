define(["require", "exports"], function (require, exports) {
    "use strict";
    var CONF = BW.CONF;
    var sys = BW.sys;
    var d = G.d;
    return /** @class */ (function () {
        function mainMbPage(para) {
            //         mui.init({
            //             swipeBack: false
            //         });
            //         mui.plusReady(function () {
            //             //iOS防止回退
            // //        if (mui.os.ios) {
            //             let currentWebview = plus.webview.currentWebview();
            //             // 关闭侧滑返回功能
            //             currentWebview.setStyle({'popGesture':'none'});
            // //        }
            //         });
            this.para = para;
            var SUB_PAGE = {
                pagesContainer: document.getElementById('pagesContainer'),
                pages: {
                    home: CONF.url.home,
                    message: CONF.url.message,
                    contact: CONF.url.contact,
                    myselfMenu: CONF.url.myselfMenu
                },
                lastShowPage: null,
                createIframes: function () {
                    var pageName, iframes = [], thisSubPage = this;
                    for (pageName in this.pages) {
                        if (this.pages.hasOwnProperty(pageName)) {
                            var pageUrl = this.pages[pageName];
                            var iframe = d.create('<iframe data-page-name="' + pageName + '" class="full-height has-footer-tab hide" src="' + pageUrl + '"> </iframe>');
                            iframes.push(iframe);
                            thisSubPage.pagesContainer.appendChild(iframe);
                        }
                    }
                    return iframes;
                },
                autoShow: function () {
                    this.pagesContainer.classList.remove('has-spinner');
                    var firstIframe = this.pagesContainer.querySelector('[src="' + this.pages.home + '"]');
                    this.lastShowPage = firstIframe;
                    firstIframe.classList.remove('hide');
                },
                showIframe: function (pageName) {
                    var iframe = this.pagesContainer.querySelector('[data-page-name="' + pageName + '"]');
                    if (this.lastShowPage !== null) {
                        this.lastShowPage.classList.add('hide');
                    }
                    iframe.classList.remove('hide');
                    this.lastShowPage = iframe;
                },
                initPages: function () {
                    var thisSubPage = this;
                    var iframes = thisSubPage.createIframes();
                    setTimeout(function () {
                        thisSubPage.autoShow();
                    }, 500);
                    var list = d.query('.mui-bar.mui-bar-tab');
                    d.on(list, 'click', '[data-page-name]', function (e) {
                        d.queryAll('[data-page-name]', list).forEach(function (el) {
                            el.classList.remove('mui-active');
                        });
                        d.closest(e.target, '[data-page-name]').classList.add('mui-active');
                        thisSubPage.showIframe(this.dataset.pageName);
                    });
                    return iframes;
                }
            };
            var iframes = SUB_PAGE.initPages();
            sys.window.close = double_back;
        }
        return mainMbPage;
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
