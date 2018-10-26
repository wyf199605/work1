define("bugListPage", ["require", "exports", "Tab", "BugList", "BugReport"], function (require, exports, tab_1, BugList_1, BugReport_1) {
    "use strict";
    /// <amd-module name="bugListPage"/>
    var d = G.d;
    var CONF = BW.CONF;
    return /** @class */ (function () {
        function BugListPage() {
            this.addEvent = (function () {
                var eidtHanlder = function (e) {
                    new BugReport_1.BugReportModal(-1, true);
                };
                return {
                    on: function () { return d.on(d.query('.mui-bar'), 'click', '#editBug', eidtHanlder); },
                    off: function () { return d.off(d.query('.mui-bar'), 'click', '#editBug', eidtHanlder); }
                };
            })();
            var muiContent = d.query('.mui-content'), tabParent = h("div", { className: "tabParent" }), panelParent = h("div", { className: "panelParent" });
            muiContent.appendChild(tabParent);
            muiContent.appendChild(panelParent);
            var mine = new BugList_1.BugList({
                allowUpdate: true,
                ajaxUrl: CONF.ajaxUrl.bugList + '?self=1'
            });
            var all = new BugList_1.BugList({
                ajaxUrl: CONF.ajaxUrl.bugList
            });
            var tab = new tab_1.Tab({
                tabParent: tabParent,
                panelParent: panelParent,
                tabs: [
                    {
                        name: 'mine',
                        title: '我的',
                        dom: mine.wrapper
                    },
                    {
                        name: 'all',
                        title: '全部',
                        dom: all.wrapper
                    }
                ],
                onClick: function (index) {
                    index === 0 ? mine.dataManager.refresh() : all.dataManager.refresh();
                }
            });
            this.addEvent.on();
        }
        return BugListPage;
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
