define(["require", "exports", "BugReport"], function (require, exports, BugReport_1) {
    "use strict";
    var sys = BW.sys;
    var d = G.d;
    return /** @class */ (function () {
        function errorPage(para) {
            d.on(para.buttons, 'click', '[data-action]', function () {
                switch (this.dataset.action) {
                    case 'bugReport':
                        new BugReport_1.BugReportModal(-1, false, {
                            url: location.href,
                            param: '',
                            reqType: '0',
                            errMsg: para.errMsg
                        });
                        break;
                    case 'back':
                        sys.window.backHome();
                        break;
                    case 'goLogin':
                        sys.window.logout();
                        break;
                }
            });
        }
        return errorPage;
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
