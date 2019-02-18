/// <amd-module name="GroupTabsPage"/>

import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import {DetailBtnModule} from "../../module/detailModule/detailBtnModule";
import {NewTableModule} from "../../module/table/newTableModule";
import {Panel} from "../../../global/components/view/panel/Panel";
import {Tab} from "../../../global/components/ui/tab/tab";
import d = G.d;
import tools = G.tools;

export interface IGroupTabItem {
    refresh(data: obj): Promise<any>;

    linkedData: obj;
    btnWrapper: HTMLElement;
    getData?: () => obj;
}

interface IGroupTabsPagePara extends BasicPagePara {
    ui: IBW_UI<IBW_Slave_Ui>
}

export class GroupTabsPage extends BasicPage {
    protected ui: IBW_Slave_Ui;
    protected subUi: IBW_Slave[] = [];

    protected main: IGroupTabItem;
    protected subs: IGroupTabItem[] = [];

    protected tab: Tab | Panel;

    constructor(para: IGroupTabsPagePara) {
        super(para);
        this.ui = para.ui.body.elements[0];
        this.ui.uiType = this.ui.uiType || para.ui.uiType;
        this.subUi = this.ui.subTableList || [];
        delete this.ui.subTableList;
        // if (tools.isNotEmpty(this.subUi)) {
        //     // tab  panel
        //
        // } else {
        //     this.main = window['d'] = new DetailBtnModule({
        //         ui: this.ui,
        //         container: para.dom
        //     });
        // }
        this.main = window['d'] = new DetailBtnModule({
            ui: this.ui,
            container: para.dom
        });
    }

    initPanel() {
        let tables = [this.ui, ...this.subUi];
        this.tab = new Panel({
            panelItems: tables.map((item) => {
                return {
                    title: item.caption
                }
            }),
            isOpenFirst: false,
            onChange: ({index, isSelected, item}) => {
                if (isSelected) {
                    this.createTabItem(index, item.wrapper);
                }
            }
        })
    }

    initTab() {
        let tables = [this.ui, ...this.subUi];
        this.tab = new Tab({
            tabs: tables.map((item) => {
                return {
                    title: item.caption
                }
            }),
            onChange: (index) => {
                let wrapper = d.query(`div.tab-pane[data-index="${index}"]`, this.dom);
                this.createTabItem(index, wrapper);
            }
        })
    }

    protected createTabItem(index: number, wrapper: HTMLElement) {
        if (index === 0) {
            // 主表
            if (tools.isEmpty(this.main)) {
                this.main = this.createTable(this.ui, wrapper);
            }
        } else {
            let sub = this.subs[index - 1];
            if (tools.isEmpty(sub)) {
                this.getUi(this.subUi[index - 1]).then((ui) => {
                    this.subs[index - 1] = this.createTable(ui, wrapper);
                });
            }
        }
    }

    getUi(sub: IBW_Slave): Promise<IBW_Slave_Ui> {
        return new Promise((resolve, reject) => {
            if ('uiAddr' in sub) {
                let url = BW.CONF.siteUrl + BwRule.reqAddr((sub as IBW_SubTableAddr).uiAddr);
                BwRule.Ajax.fetch(url).then(({response}) => {
                    let ui = response.ui.body.elements[0];
                    ui.uiType = ui.uiType || response.ui.uiType;
                    resolve(ui);
                }).catch(() => {
                    reject();
                })
            } else {
                resolve(sub);
            }
        });
    }

    createTable(tableUi: IBW_Slave_Ui, wrapper: HTMLElement): IGroupTabItem {
        let item;
        switch (tableUi.uiType) {
            case 'table': {
                item = new NewTableModule({
                    bwEl: tableUi as IBW_Table,
                    container: wrapper
                });
            }
                break;
            case 'detail':
            case 'view': {
                item = new DetailBtnModule({
                    container: wrapper,
                    ui: tableUi as IBW_Detail
                });
            }
                break;
        }
        return item;
    }

    subRefresh() {
        if (tools.isNotEmpty(this.subs)) {
            this.subs.forEach((sub) => {
                sub.refresh(this.main.getData());
            })
        }
    }

    destroy() {
        super.destroy();
        this.ui = null;
        this.subUi = null;
        this.subs = null;
        this.tab = null;
    }
}