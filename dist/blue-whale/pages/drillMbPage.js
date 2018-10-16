define(["require", "exports", "BwSubTableModule", "Panel", "Spinner"], function (require, exports, BwSubTableModule_1, Panel_1, spinner_1) {
    "use strict";
    var d = G.d;
    return /** @class */ (function () {
        function drillMbPage(para) {
            /*mui.init({
                gestureConfig: {
                    longtap: true //默认为false
                }
            });
    
        //    mui('.mui-scroll-wrapper').scroll();
            (function () {
                let subTables = para.mtPara;
    
                window.addEventListener('loadTable', function (e:CustomEvent) {
                    let index = parseInt(e.detail),
                        tableConf = subTables[ index ];
                    // 加载table
                    // new TableModuleMb({
                    //    tableEl: para.tableDom[index],
                    //    scrollEl: para.tableDom[index].parentElement,
                    //    fixTop: 44
                    // }, tableConf);
    
                    new BwSubTableModule({
                        container: para.tableDom[index],
                        ui: tableConf
                    });
                });
        
                //初始化第一个表格
                tools.event.fire('loadTable', 0);
                d.query('div.statisticsChart', para.tableDom[0].parenNode).classList.remove('hide');
            }());
            (function () {
                d.queryAll('.mui-table-view').forEach((el) => {
                    d.on(el, 'click', '.mui-table-view-cell.mui-collapse .mui-navigate-right', function (e) {
                        e.stopPropagation();
                        d.query('div.statisticsChart', <HTMLElement>this.parentNode).classList.toggle('hide');
                        (<HTMLElement>this.parentNode).classList.toggle('mui-active');
                        if(this.dataset.loaded === '0'){
                            this.dataset.loaded = '1';
                            tools.event.fire('loadTable', this.dataset.index);
                        }
                    });
                });
            }());
        
            d.on(d.query('#toggleCollapse'), 'click', function (e) {
                e.stopPropagation();
                let isOpen = this.classList.contains('ti-plus');
                this.classList.toggle('ti-plus');
                this.classList.toggle('ti-minus');
                let list = document.querySelectorAll('.mui-table-view-cell.mui-collapse');
                Array.prototype.forEach.call(list, function (li) {
                    if(isOpen){
                        if(li.firstElementChild.dataset.loaded === '1'){
                            li.classList.add('mui-active');
                            d.query('div.statisticsChart', li).classList.remove('hide');
                        }
                    }else{
                        li.classList.remove('mui-active');
                        d.query('div.statisticsChart', li).classList.add('hide');
                    }
                });
            });
           /!* mui('table[data-ajax-url] tbody').on('touchstart', 'tr', function () {
                this.classList.add('active');
            });
            mui('table[data-ajax-url] tbody').on('touchend', 'tr', function () {
                this.classList.remove('active');
            });
            mui('table[data-ajax-url] tbody').on('touchmove', 'tr', function () {
                this.classList.remove('active');
            });*!/*/
            // new BwSubTableModule({
            //     container: null,
            //     ui: null
            // });
            var len = para.mtPara.length, panelItems = [], tables = Array.from({ length: len }), indexes = [];
            para.mtPara.forEach(function (tableConf, index) {
                panelItems.push({
                    title: tableConf.caption,
                    icon: 'jingyingfenxi',
                    btn: [
                        {
                            icon: 'bingzhuangtu',
                            onClick: function () {
                                var spinner = new spinner_1.Spinner({
                                    el: panel.panelItems[index].btnGroup[0].wrapper,
                                    type: 1,
                                });
                                spinner.show();
                                var table = tables[index];
                                table.ftable.statistic('chart').then(function () {
                                    spinner.hide();
                                });
                            }
                        },
                        {
                            icon: 'biaoge',
                            isShow: false,
                            onClick: function () {
                                // let table = tables[index];
                                panel.panelItems[index].btnGroup[1].isShow = false;
                            }
                        }
                    ]
                });
            });
            var panel = new Panel_1.Panel({
                panelItems: panelItems,
                container: para.tableDom,
                onChange: function (ev) {
                    if (indexes.indexOf(ev.index) === -1) {
                        indexes.push(ev.index);
                        tables[ev.index] = new BwSubTableModule_1.BwSubTableModule({
                            container: ev.item.contentEl,
                            ui: para.mtPara[ev.index],
                        });
                    }
                }
            });
            d.on(para.toggleDom, 'click', function () {
                var isOpen = this.classList.contains('ti-plus');
                this.classList.toggle('ti-plus');
                this.classList.toggle('ti-minus');
                panel.toggle(isOpen);
            });
        }
        return drillMbPage;
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
