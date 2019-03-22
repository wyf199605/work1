/// <amd-module name="drillPage">

import BasicPage from "basicPage";
import {BwTableElement} from "../table/newTablePage";
declare const initDataTable : any;
export = class drillPage extends BasicPage{
    private tableModules: BwTableElement[]  = [];
    constructor(private para){
        super(para);
        let subTables = para.subTables,
            allTabs = para.uniqueDom;
        allTabs.on('shown.bs.tab', (e:any) => {
            if(e.target.dataset.load === '1'){
                return;
            }
            let index = parseInt( e.target.dataset.index ),
                tableConf = subTables[index];

            // this.tableModules[index] = new TableModulePc({
            //     tableEl: para.tableDom[index],
            //     scrollEl:this.dom.parentElement,
            //     fixTop: 40
            // }, tableConf);
            this.tableModules[index] = new BwTableElement({
                container: para.tableDom[index],
                tableEl: tableConf
            });

            e.target.dataset.load = '1';
        });
        allTabs.first().tab('show');
        allTabs.first().parent().find('.panel-tools').show();

        // this.on('wake', () => {
        //     // this.tableModules.forEach( tm => tm.table.resize() )
        // });


        this.panelInit();
    }

    private panelInit(){
        // panel close
        let drillPage = $(this.para.dom),
            allTabs = this.para.uniqueDom,
            self = this;

        drillPage.on('click', '.panel-collapse', function(e) {
            $(this.parentNode).find('.panel-tools').toggle();
            let allTabsIndex = $(allTabs[this.dataset.index]);
            e.preventDefault();
            toggleDomClass(this);

            allTabsIndex.trigger('shown.bs.tab');
        });

        // panel fullscreen
        drillPage.on('click','.panel-fullscreen', function (e) {
            let selfDom = this,
                heading = selfDom.parentNode.parentNode.querySelector('.panel-collapse'),
                panel = heading.parentNode.parentNode,
                index = heading.dataset.index,
                allTabsIndex = $(allTabs[index]);


            if(panel.classList.contains('is-fullscreen')){
                panel.classList.remove('is-fullscreen');
            }else {
                panel.classList.add('is-fullscreen');
                if(panel.classList.contains('collapses')){
                    toggleDomClass(selfDom);
                }
            }


            allTabsIndex.trigger('shown.bs.tab');

            /*表格样式空白问题处理*/
            // self.tableModules[index] && self.tableModules[index].table.resize(true);
        } );

        /*展开或关闭body*/
        function toggleDomClass(self){
            let panel = $(self).closest(".panel");
            let bodyPanel = panel.children(".panel-body");
            bodyPanel.slideToggle(200, function() {
                panel.toggleClass("collapses");
            });
        }
    }
}
