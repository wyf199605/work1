define(["require", "exports", "BasicPage"], function (require, exports, basicPage_1) {
    "use strict";
    return /** @class */ (function (_super) {
        __extends(menuPage, _super);
        function menuPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            var MENU = {
                openWindowWithBadge: function (url, dom) {
                    var badge = dom.querySelector('[data-url]');
                    var num = 0;
                    if (badge) {
                        num = parseInt(badge.textContent);
                    }
                    var data = badge ? { badge: num } : {};
                    BW.sys.window.open({ url: url, data: data }, _this.url);
                }
            };
            $('.file-box').on('click', 'a[data-href]', function () {
                MENU.openWindowWithBadge(BW.CONF.siteUrl + this.dataset.href, this);
            });
            function animationHover(element, animation) {
                element = $(element);
                element.hover(function () {
                    element.addClass('animated ' + animation);
                }, function () {
                    setTimeout(function () {
                        element.removeClass('animated ' + animation);
                    }, 2000);
                });
            }
            $(document).ready(function () {
                $('.file-box').each(function () {
                    animationHover(this, 'pulse');
                });
            });
            return _this;
        }
        return menuPage;
    }(basicPage_1.default));
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
