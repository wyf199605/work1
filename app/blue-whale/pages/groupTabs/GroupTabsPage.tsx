/// <amd-module name="GroupTabsPage"/>

import BasicPage from "../basicPage";
import {BwRule} from "../../common/rule/BwRule";
import {DetailBtnModule} from "../../module/detailModule/detailBtnModule";
import {NewTableModule} from "../../module/table/newTableModule";
import {Panel} from "../../../global/components/view/panel/Panel";
import {Tab} from "../../../global/components/ui/tab/tab";
import d = G.d;
import tools = G.tools;
import AGroupTabItem = BW.AGroupTabItem;

interface IGroupTabsPagePara extends BasicPagePara {
    ui: IBW_UI<IBW_Slave_Ui>
}

/**
 * @author WUML
 * @date 2019/2/18
 * @Description: 主从类，所有的主从关系都从这里分支
 */
export class GroupTabsPage extends BasicPage {
    protected ui: IBW_Slave_Ui;
    protected subUi: IBW_Slave[] = [];

    protected main: AGroupTabItem;
    protected subs: AGroupTabItem[] = [];

    protected tab: Tab | Panel;
    protected wrapper: HTMLElement;
    protected subIndexes = [];
    protected styleType: string;

    constructor(para: IGroupTabsPagePara) {
        super(para);
        window['d'] = this;
        this.ui = para.ui.body.elements[0];
        this.ui.uiType = this.ui.uiType || para.ui.uiType;
        this.subUi = this.ui.subTableList || [];
        delete this.ui.subTableList;
        this.wrapper = tools.isPc ? this.dom : d.query('body > .mui-content');
        this.wrapper.classList.add('group-tab-page');
        // 当前子表数组为空，则为表格/单页，否则为主从
        this.styleType = (this.ui.exhibitionType && this.ui.exhibitionType.showType) || 'tab';
        if (tools.isNotEmpty(this.subUi)) {
            this.dom.classList.add(this.styleType + '-main-sub');
            switch (this.styleType){
                case 'panel-on':
                case 'panel-off':
                    this.initPanel();
                    break;
                case 'tab':
                default:
                    this.initTab();
                    break;
            }
        } else {
            this.createTabItem(0, this.wrapper);
        }
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: Panel格式的主从
     */
    protected initPanel() {
        let tables = [this.ui, ...this.subUi];
        this.tab = new Panel({
            panelItems: tables.map((item) => {
                return {
                    title: item.caption
                }
            }),
            isOpenFirst: true,
            onChange: ({index, isSelected, item}) => {
                if (isSelected) {
                    let panel = this.tab as Panel;
                    if(this.styleType === 'panel-off'){
                        panel.panelItems.forEach((panelItem) => {
                            if(panelItem !== item){
                                panelItem.selected = false;
                            }
                        });
                    }
                    this.createTabItem(index, item.contentEl);
                }
            },
            container: this.wrapper
        });
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: Tab格式的主从
     */
    protected initTab() {
        let tables = [this.ui, ...this.subUi];
        this.tab = new Tab({
            tabs: tables.map((item) => {
                return {
                    title: item.caption
                }
            }),
            onClick: (index) => {
                let wrapper = d.query(`div.tab-pane[data-index="${index}"]`, this.wrapper);
                this.createTabItem(index, wrapper);
            },
            tabParent: this.wrapper,
            panelParent: this.wrapper
        });
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: 切换Tab或者Panel
     */
    protected createTabItem(index: number, wrapper: HTMLElement) {
        if (index === 0) {
            // 主表
            if (tools.isNotEmpty(this.main)) {
                return;
            }
            this.main = GroupTabsPage.createTable(this.ui, wrapper);
            this.main.onDataChange = () => {
                this.subIndexes = [];
            };

            this.main.onRender = () => {
                if(this.styleType === 'panel-on' && this.tab instanceof Panel){
                    this.tab.toggleAll(true);
                }
                this.main.onRender = null;
            }
        } else {
            let sub = this.subs[index - 1];
            if (tools.isNotEmpty(sub)) {
                if(!((index - 1) in this.subIndexes)){
                    sub.refresh(this.main.getData()).then(() => {
                        this.subIndexes[index - 1] = index - 1;
                    }).catch((e) => {
                        console.log(e);
                    });
                }
                return;
            }
            this.getUi(this.subUi[index - 1]).then((ui) => {
                this.subs[index - 1] = GroupTabsPage.createTable(ui, wrapper, this.main.getData());
                this.subIndexes[index - 1] = index - 1;
            });
        }
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: 获取从表UI
     */
    getUi(sub: IBW_Slave): Promise<IBW_Slave_Ui> {
        return new Promise((resolve, reject) => {
            if ('uiAddr' in sub) {
                let url = tools.url.addObj(BW.CONF.siteUrl + BwRule.reqAddr((sub as IBW_SubTableAddr).uiAddr), {
                    output: 'json'
                });
                BwRule.Ajax.fetch(url).then(({response}: { response: IBW_UI<IBW_Slave_Ui> }) => {
                    let ui = response.body.elements[0];
                    ui.uiType = ui.uiType || response.uiType;
                    resolve(ui);
                }).catch(() => {
                    reject();
                })
            } else {
                resolve(sub);
            }
        });
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: 根据UI创建表格/单页
     */
    static createTable(tableUi: IBW_Slave_Ui, wrapper: HTMLElement, ajaxData?): AGroupTabItem {
        let item;
        switch (tableUi.uiType) {
            case 'table': {
                item = new NewTableModule({
                    bwEl: tableUi as IBW_Table,
                    container: wrapper,
                    ajaxData
                });
            }
                break;
            case 'detail':
            case 'view': {
                item = new DetailBtnModule({
                    container: wrapper,
                    ui: tableUi as IBW_Detail,
                    ajaxData
                });
            }
                break;
        }
        return item;
    }

    /**
     * @author WUML
     * @date 2019/2/18
     * @Description: 所有已加载子表刷新
     */
    subRefresh() {
        if (tools.isNotEmpty(this.subs)) {
            this.subs.forEach((sub,index) => {
                if (tools.isNotEmpty(sub)){
                    sub.refresh(this.main.getData()).catch(() => {

                    });
                    this.subIndexes[index] = index;
                }
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