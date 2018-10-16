import d = G.d;
import {TableModule} from "../../module/table/tableModule";
import {BwSubTableModule} from "../../module/table/BwSubTableModule";
import {IPanelItemPara, Panel} from "../../../global/components/view/panel/Panel";
import {Spinner} from "../../../global/components/ui/spinner/spinner";

export = class drillMbPage {
    constructor(para){
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
        let len = para.mtPara.length,
            panelItems: IPanelItemPara[] = [],
            tables: BwSubTableModule[] = Array.from({length: len}),
            indexes: number[] = [];
        para.mtPara.forEach((tableConf, index) => {
            panelItems.push({
                title: tableConf.caption,
                icon: 'jingyingfenxi',
                btn: [
                    {
                        icon: 'bingzhuangtu',
                        onClick: () => {
                            let spinner = new Spinner({
                                el: panel.panelItems[index].btnGroup[0].wrapper,
                                type: 1,
                            });
                            spinner.show();

                            let table = tables[index];
                            table.ftable.statistic('chart').then(() => {
                                spinner.hide();
                            });
                        }
                    },
                    {
                        icon: 'biaoge',
                        isShow: false,
                        onClick: () => {
                            // let table = tables[index];
                            panel.panelItems[index].btnGroup[1].isShow = false;
                        }
                    }
                ]
            })
        });
        let panel = new Panel({
            panelItems,
            container: para.tableDom,
            onChange(ev){
                if(indexes.indexOf(ev.index) === -1){
                    indexes.push(ev.index);
                    tables[ev.index] = new BwSubTableModule({
                        container: ev.item.contentEl,
                        ui: para.mtPara[ev.index],
                    });
                }
            }
        });

        d.on(para.toggleDom, 'click', function () {
            let isOpen = this.classList.contains('ti-plus');
            this.classList.toggle('ti-plus');
            this.classList.toggle('ti-minus');
            panel.toggle(isOpen);
        });
    }
}



 