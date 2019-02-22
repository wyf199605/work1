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
import {TextInput} from "../../../global/components/form/text/text";
import {EditModule} from "../../module/edit/editModule";
import {DetailItem} from "../../module/detailModule/detailItem";
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";

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
        console.log(para);
        window['d'] = this;
        this.ui = para.ui.body.elements[0];
        let btns = para.ui.body.subButtons;
        if(Array.isArray(btns)){
            this.ui.subButtons = [...btns, ...(this.ui.subButtons || [])]
        }

        this.ui.uiType = this.ui.uiType || para.ui.uiType;
        this.subUi = this.ui.subTableList || [];
        delete this.ui.subTableList;

        this.wrapper = tools.isPc ? this.dom : d.query('body > .mui-content');
        this.wrapper.classList.add('group-tab-page');
        // 当前子表数组为空，则为表格/单页，否则为主从
        this.styleType = (this.ui.exhibitionType && this.ui.exhibitionType.showType) || 'tab';

        if(this.styleType === 'tab'){
            this.styleType = 'panel-on';
            this.isInventory = true;
            this.dom.classList.add('inventory');
        }

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

    protected isInventory = false;
    inventory = () => {
        if(!this.isInventory){
            return;
        }

        let countEl : HTMLElement,
            countTextEl : HTMLElement,
            countText : TextInput,
            aggrListEl : HTMLElement,
            btnWrapper = <div class="inventory-group-btn"/>,
            editModule: {
                main: EditModule,
                sub: EditModule
            };

        let box: InputBox;
        let btnInit = (edit : EditModule) => {
            let initButton = (btn: R_Button, ): Button =>{
                return new Button({
                    content: btn.caption,
                    onClick: () => {
                        let data = edit.get();
                        ButtonAction.get().clickHandle(btn, data, () => {
                        }, this.url || '');
                    }
                })
            };
            return {
                init: (btns: R_Button[] = []) => {
                    if(!box){
                        box = new InputBox({
                            container: btnWrapper,
                            isResponsive: true,
                            limitCount: 3,
                        });
                    }
                    btns.forEach((btn) => {
                        box.addItem(initButton(btn));
                    });
                },
                addBtn(btn: R_Button, position?){
                    box && box.addItem(initButton(btn), position);
                },
                get box(){
                    return box;
                }
            }
        };

        let init = () => {
            let wrapper = <div/>,
                mainUi = this.ui as IBW_Detail,
                subUi = this.subUi[0] as IBW_Detail,
                main = this.main,
                sub = this.subs[0];

            if(!editModule){
                editModule = {
                    main: new EditModule({
                        auto: false,
                        type: 'table',
                        fields: mainUi.fields.map((field) => {
                            return {
                                dom: null,
                                field: field
                            }
                        }),
                        container: main.container,
                        cols: mainUi.fields
                    }),
                    sub:  new EditModule({
                        auto: false,
                        type: 'table',
                        fields: subUi.fields.map((field) => {
                            return {
                                dom: null,
                                field: field
                            }
                        }),
                        container: sub.container,
                        cols: subUi.fields
                    })
                };

                main.editInit((field: R_Field, item: DetailItem) => {
                    return editModule.main.init(field.name, {
                        dom: item.contentEl,
                        field: field,
                        data: main.getData(),
                        onSet: () => {
                            // this.main
                            console.log(11);
                        }
                    })
                });

                sub.editInit((field: R_Field, item: DetailItem) => {
                    return editModule.sub.init(field.name, {
                        dom: item.contentEl,
                        field: field,
                        data: sub.getData(),
                        onSet: () => {
                            console.log(11);

                        }
                    })
                })

            }

            btnInit(editModule.main).init(this.subBtn.main);
            btnInit(editModule.sub).init(this.subBtn.sub);

            d.append(this.dom, wrapper);

            d.append(this.dom, btnWrapper);
        };

        let uiPara = () => {
            return this.ui;
        };

        let getNum = () => {
            return Number(countText.get());
        };

        let aggrList = () => {
            aggrListEl = <div className="barcode-count">
                <div className="barcode-row aggr-list">
                    <div className="barcode-cell">
                        <div>共扫描项数：</div>
                        <div>0</div>
                    </div>
                    <div className="barcode-cell barcode-right">
                        <div>总数量：</div>
                        <div>0</div>
                    </div>
                </div>
            </div>;
            let list = this.ui.aggrList;
            if(Array.isArray(list)){
                // list.forEach(obj => {
                //
                // })
            }
        };

        let count = () => {
            countEl = <div className="barcode-count">
                <div className="barcode-row count">
                    <div className="barcode-cell">
                        {countTextEl = <div>{2? '替换' : '累加'}数值：</div>}
                        {countText = <TextInput type = 'number' blur={() => {
                            console.log(1);
                        }} placeholder="请输入"/>}
                    </div>
                    <div className="barcode-cell barcode-right">
                        <div>∑数量：</div>
                        <div>0</div>
                    </div>
                </div>
            </div>;
            // d.prepend(this.btnWrapper, this._countEl);
            this.wrapper.classList.add('has-count');
        };

        let setCount = (option) => {
            if (option === 1) {
                d.classAdd(this.wrapper, 'hide-count')
            } else {
                if (option === 2) {
                    countTextEl.innerHTML = '替换数值：';
                } else if (option === 3) {
                    countTextEl.innerHTML = '累加数值：';
                }
                d.classRemove(this.wrapper, 'hide-count')
            }
        };

        init();
        return {init, uiPara, setCount}
    };

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

    protected subBtn: {
        main: R_Button[],
        sub: R_Button[]
    } = {
        main: [],
        sub: []
    };
    protected createTabItem(index: number, wrapper: HTMLElement) {
        if (index === 0) {
            // 主表
            if (tools.isNotEmpty(this.main)) {
                return;
            }
            if(this.isInventory){
               this.subBtn.main = this.ui.subButtons;
               delete this.ui.subButtons;
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
                this.subUi[index - 1] = ui;
                if(this.isInventory){
                    this.subBtn.sub = ui.subButtons;
                    delete ui.subButtons;
                }

                this.subs[index - 1] = GroupTabsPage.createTable(ui, wrapper, this.main.getData());
                this.subIndexes[index - 1] = index - 1;

                let sub = this.subs[index - 1];
                if(this.subUi.every((ui, index) => index in this.subs)){
                    sub.onRender = () => {
                        this.inventory();
                        sub.onRender = null;
                    }
                }
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
                    ajaxData,
                    autoLoad: !tableUi.offline
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