/// <amd-module name="drillMbPage">

import d = G.d;
import {IPanelItemPara, Panel} from "../../../global/components/view/panel/Panel";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {BwTableElement} from "../table/newTablePage";

export = class drillMbPage {
    constructor(para){
        let len = para.mtPara.length,
            panelItems: IPanelItemPara[] = [],
            tables: BwTableElement[] = Array.from({length: len}),
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
                            table.tableModule.main.ftable.statistic('chart').then(() => {
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
                    tables[ev.index] = new BwTableElement({
                        container: ev.item.contentEl,
                        tableEl: para.mtPara[ev.index],
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



 