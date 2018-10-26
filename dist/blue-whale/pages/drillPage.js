define(["require", "exports", "BasicPage", "BwSubTableModule"], function (require, exports, basicPage_1, BwSubTableModule_1) {
    "use strict";
    return /** @class */ (function (_super) {
        __extends(drillPage, _super);
        function drillPage(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            _this.tableModules = [];
            var subTables = para.subTables, allTabs = para.uniqueDom;
            allTabs.on('shown.bs.tab', function (e) {
                if (e.target.dataset.load === '1') {
                    return;
                }
                var index = parseInt(e.target.dataset.index), tableConf = subTables[index];
                // this.tableModules[index] = new TableModulePc({
                //     tableEl: para.tableDom[index],
                //     scrollEl:this.dom.parentElement,
                //     fixTop: 40
                // }, tableConf);
                _this.tableModules[index] = new BwSubTableModule_1.BwSubTableModule({
                    container: para.tableDom[index],
                    ui: tableConf
                });
                e.target.dataset.load = '1';
            });
            allTabs.first().tab('show');
            allTabs.first().parent().find('.panel-tools').show();
            // this.on('wake', () => {
            //     // this.tableModules.forEach( tm => tm.table.resize() )
            // });
            _this.panelInit();
            return _this;
        }
        drillPage.prototype.panelInit = function () {
            // panel close
            var drillPage = $(this.para.dom), allTabs = this.para.uniqueDom, self = this;
            drillPage.on('click', '.panel-collapse', function (e) {
                $(this.parentNode).find('.panel-tools').toggle();
                var allTabsIndex = $(allTabs[this.dataset.index]);
                e.preventDefault();
                toggleDomClass(this);
                allTabsIndex.trigger('shown.bs.tab');
            });
            // panel fullscreen
            drillPage.on('click', '.panel-fullscreen', function (e) {
                var selfDom = this, heading = selfDom.parentNode.parentNode.querySelector('.panel-collapse'), panel = heading.parentNode.parentNode, index = heading.dataset.index, allTabsIndex = $(allTabs[index]);
                if (panel.classList.contains('is-fullscreen')) {
                    panel.classList.remove('is-fullscreen');
                }
                else {
                    panel.classList.add('is-fullscreen');
                    if (panel.classList.contains('collapses')) {
                        toggleDomClass(selfDom);
                    }
                }
                allTabsIndex.trigger('shown.bs.tab');
                /*表格样式空白问题处理*/
                // self.tableModules[index] && self.tableModules[index].table.resize(true);
            });
            /*展开或关闭body*/
            function toggleDomClass(self) {
                var panel = $(self).closest(".panel");
                var bodyPanel = panel.children(".panel-body");
                bodyPanel.slideToggle(200, function () {
                    panel.toggleClass("collapses");
                });
            }
        };
        return drillPage;
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
