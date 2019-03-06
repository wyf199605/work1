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
import {IButton} from "../../../global/components/general/button/Button";
import {BtnGroup} from "../../../global/components/ui/buttonGroup/btnGroup";
import Shell = G.Shell;
import {Modal} from "../../../global/components/feedback/modal/Modal";

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
        if (Array.isArray(btns)) {
            this.ui.subButtons = [...btns, ...(this.ui.subButtons || [])]
        }

        this.ui.uiType = this.ui.uiType || para.ui.uiType;
        this.subUi = this.ui.subTableList || [];
        delete this.ui.subTableList;

        this.wrapper = tools.isPc ? this.dom : d.query('body > .mui-content');
        this.wrapper.classList.add('group-tab-page');
        // 当前子表数组为空，则为表格/单页，否则为主从
        this.styleType = (this.ui.exhibitionType && this.ui.exhibitionType.showType) || 'tab';

        if (['panel-one', 'panel-none'].includes(this.styleType)) {
            this.styleType = 'panel-on';
            this.isInventory = true;
            this.dom.classList.add('inventory');
        }

        if (tools.isNotEmpty(this.subUi)) {
            this.dom.classList.add(this.styleType + '-main-sub');
            switch (this.styleType) {
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
    imports = {
        countText: null as TextInput, // 累加替换输入框
        countTextEl: null as HTMLElement,
        amountEl: null as HTMLElement, // 数量的值容器
        aggrEl: null as HTMLElement,
        btnWrapper: null as HTMLElement,
        _commitBtn: null as HTMLElement,
        footer: null as HTMLElement,
        fieldName: 'amountcount', // 标识值，从壳获取count时候需壳以改字段作为属性键值
        aggrArr: [] as R_Aggr[], // 主表+子表的aggrList合并的字段
        isOnSet: true, // 是否开启编辑模块的onSet
        isModify: false, // 是否有替换累加字段未提交
        editModule: {
            main: null as EditModule,
            sub: null as EditModule
        },
        init: () => {
            if (!this.isInventory) {
                return;
            }
            console.log(this.ui, this.subUi);
            const mainUi = this.ui as IBW_Detail,
                subUi = this.subUi[0] as IBW_Detail,
                subId = subUi ? {itemId: subUi.itemId} : {},
                mainId = {itemId: mainUi.itemId},
                corArr = [...(tools.isNotEmpty(mainUi.correlation) && [Object.assign({}, mainId, mainUi.correlation)] || []),
                    ...(tools.isNotEmpty(subUi && subUi.correlation) && [Object.assign({}, subId, subUi.correlation)] || [])] as IBW_Detail_Cor[],
                main = this.main,
                sub = this.subs[0];
            this.imports.aggrArr = [...(mainUi && mainUi.aggrList && mainUi.aggrList.map(list => Object.assign({}, mainId, list)) || []),
                ...(subUi && subUi.aggrList && subUi.aggrList.map(list => Object.assign({}, subId, list)) || [])];

            this.imports.footer = <div class="inventory-footer">
                <div className="barcode-count">
                    <div className={'barcode-row count ' + (corArr[0] ? '' : 'hide')}>
                        {/* corArr虽为数组，这里仅支持一条数据，主表或子表合并起来有且有一条数据 */}
                        {corArr.map(cor => {
                            if (cor.default === '1') {
                                d.classAdd(this.dom, 'hide-count');
                            }
                            if (cor.numberName) {
                                return <div>
                                    <div className="barcode-cell">
                                        {this.imports.countTextEl =
                                            <div data-item={cor.itemId} data-name={cor.numberName}
                                                 data-value={cor.default}>
                                                {cor.default === '3' ? '累加数值：' : '替换数值：'}
                                            </div>}
                                        {this.imports.countText = <TextInput blur={() => {
                                            if (this.imports.countText.get()) {
                                                this.imports.isModify = true;
                                            } else {
                                                this.imports.isModify = false;
                                            }
                                        }} type='number' placeholder="请输入"/>}
                                    </div>
                                    <div className="barcode-cell barcode-right">
                                        <div>{cor.caption + '：'}</div>
                                        {this.imports.amountEl = <div/>}
                                    </div>
                                </div>
                            }
                        })}
                    </div>
                    {this.imports.aggrEl =
                        <div className={'barcode-row aggr-list ' + (this.imports.aggrArr[0] ? '' : 'hide')}>
                            {this.imports.aggrArr.map((list, i) => {
                                return <div data-item={list.itemId}
                                            className={"barcode-cell " + (i % 2 !== 0 ? 'barcode-right' : '')}>
                                    <div>{list.caption + '：'}</div>
                                    <div data-name={list.fieldName}/>
                                </div>
                            })}
                        </div>}
                </div>
                {this.imports.btnWrapper = <div class="inventory-group-btn"/>}
            </div>;

            if (!this.imports.aggrArr[0]) {
                d.classAdd(this.dom, 'no-aggr');
            }
            if (!corArr[0]) {
                d.classAdd(this.dom, 'no-cor');
            }

            if (!this.imports.editModule.main) {
                this.imports.editModule = {
                    main: new EditModule({
                        auto: false,
                        type: 'detail',
                        fields: mainUi.fields.map((field) => {
                            return {
                                dom: null,
                                field: field
                            }
                        }),
                        container: main.container,
                        cols: mainUi.fields,
                    }),
                    sub: subUi && new EditModule({
                        auto: false,
                        type: 'detail',
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

                let init = (edit: EditModule, field: R_Field, item: DetailItem, ui: IBW_Detail, data) => {
                    return edit.init(field.name, {
                        dom: item.contentEl,
                        field,
                        data,
                        isOffLine: true,
                        onSet: () => {
                            if (!this.imports.isOnSet) return;
                            this.imports.operateTable(mainUi.uniqueFlag, ui.itemId, field, ui.keyField, edit);
                        }
                    })
                };

                main.editInit((field: R_Field, item: DetailItem) => {
                    return init(this.imports.editModule.main, field, item, mainUi, main.getData())
                });

                subUi && sub.editInit((field: R_Field, item: DetailItem) => {
                    return init(this.imports.editModule.sub, field, item, subUi, sub.getData())
                })
            }

            new BtnGroup({
                container: this.imports.btnWrapper,
                buttons: [...this.imports.btnParaGet(this.subBtn.main, this.imports.editModule.main, mainUi.itemId),
                    ...(subUi && this.imports.btnParaGet(this.subBtn.sub, this.imports.editModule.sub, subUi.itemId) || [])]
            });

            d.append(this.wrapper, this.imports.footer);

            // 开启手持机扫码
            if (this.ui.supportRfid && Shell.inventory.can2dScan) {
                this.imports.openRfid();
            }

            // 隐藏提交按钮
            corArr.forEach(cor => {
                let value = cor.default;
                value && this.imports.toggleComBtn(value);
            });

            // 初始化界面查询是否有上次操作未完成的数据
            let result = Shell.inventory.getScanData(mainUi.uniqueFlag);
            if (result.success) {
                console.log(result.data, 'getScanData');
                Array.isArray(result.data) && result.data.forEach(obj => {
                    const item = obj.itemid;
                    if (!item) return;
                    const {edit} = this.imports.getKeyField(obj.item);
                    this.imports.editSet(edit, obj.array[0]);
                })
            }
        },
        openRfid() {
            Shell.inventory.scan2dOn((result) => {
                if (result.success) {
                    this.query(result.data);
                } else {
                    Modal.toast(result.msg);
                }
            });
        },
        toggleComBtn(value: string) {
            if (this.commitBtn) {
                if (['2', '3'].includes(value)) {
                    this.commitBtn.classList.remove('hide');
                } else {
                    this.commitBtn.classList.add('hide');
                }
            }
        },
        get commitBtn() {
            if (!this._commitBtn) {
                this._commitBtn = d.query('.import-commit');
            }
            return this._commitBtn;
        },
        scanRender: (data) => {
            Array.isArray(data) && data.forEach(obj => {
                const item = obj.itemid;
                if (!item) return;

                const {edit} = this.imports.getKeyField(item);
                this.imports.editSet(edit, obj.array[0]);
                this.imports.setText('');
                this.imports.getCountData();
                this.imports.getAggrData(item);
            });
        }
        ,
        /**
         * 数据查询
         * @param value
         * @param option
         */
        query: (value: string, option?: string) => {
            let keyField = this.ui.keyField,
                field = {[keyField]: this.imports.editModule.main.get(keyField)[keyField]};
            if (!this.subUi[0]) {
                field = {};
            }

            Shell.imports.operateScanTable(value, option || this.imports.getOption(), this.ui.uniqueFlag,
                field, this.imports.getTextPara().name, this.imports.getNum(), (result) => {
                    if (result.success) {
                        console.log(result.data, 'operateScanTable');
                        this.imports.scanRender(result.data);
                    } else {
                        Modal.toast('查询失败，请确认已下载数据');
                    }
                }
            );
        },
        /**
         * 计算规则，在数据渲染结束之后调用
         * @param edit
         */
        caculate(edit: EditModule) {
            const cols = edit.col,
                data = edit.get();
            cols.forEach(col => {
                let expr = col.caculateExpr;
                expr && edit.set({[col.name]: eval(tools.str.parseTpl(expr, data, true, 1, /\%\S+?%/g))})
            })
        },
        /**
         * 编辑模块set值，但不触发onSet事件
         * @param edit
         * @param value
         */
        editSet(edit: EditModule, value: obj) {
            this.isOnSet = false;
            edit.set(value);
            this.caculate(edit);
            this.isOnSet = true;
        },
        clear(edit: EditModule) {
            this.isOnSet = false;
            edit.clear();
            this.isOnSet = true;
        },
        /**
         * 获取itemId对应的相关字段，
         * keyField：主键
         * value：主键对应的值
         * ui：当前表ui
         * edit：当前表对应的详情模块
         * key：主键字段
         * @param itemId
         */
        getKeyField: (itemId: string): { keyField: string, value: obj, ui: IBW_Slave_Ui, edit: EditModule, key: R_Field } => {
            let keyField, ui, edit, value, key;

            if (itemId !== this.ui.itemId) {
                ui = this.imports.subUiGet() as IBW_Slave_Ui;
                key = ui.fields.map(e => {
                    if (e.name === ui.keyField) return e
                })[0];
                keyField = key.name;
                value = this.imports.editModule.sub.get(keyField);
                edit = this.imports.editModule.sub;
            } else {
                ui = this.imports.mainUiGet() as IBW_Slave_Ui;
                key = ui.fields.map(e => {
                    if (e.name === ui.keyField) return e
                })[0];
                keyField = key.name;
                value = this.imports.editModule.main.get(keyField);
                edit = this.imports.editModule.main;
            }
            return {keyField, value, ui, edit, key}
        },
        /**
         * 请求shell查询count数据
         */
        getCountData: () => {
            const data = this.imports.getTextPara(),
                id = data.itemId;
            if (!id) return;

            const {value} = this.imports.getKeyField(id);
            Shell.imports.getCountData(this.ui.uniqueFlag, data.itemId, this.imports.fieldName, data.expression, value, result => {
                console.log(result.data, 'getCountData');
                if (result.success) {
                    this.imports.setAmount(result.data[this.imports.fieldName]);
                } else {
                    Modal.toast(result.msg);
                }
            });
        },
        /**
         * 从壳获取新的aggr值
         * @param item
         */
        getAggrData: (item: string) => {
            this.imports.aggrArr.forEach(aggr => {
                let id = aggr.itemId,
                    {value} = this.imports.getKeyField(id);

                if (item !== id) return;

                Shell.imports.getCountData(this.ui.uniqueFlag, id, this.imports.fieldName, aggr.expression, value, result => {
                    console.log(result.data, 'getAggrData');
                    if (result.success) {
                        this.imports.setAggr(result.data[this.imports.fieldName], id, aggr.fieldName);
                    } else {
                        Modal.toast(result.msg);
                    }
                });
            })
        },
        btnParaGet: (btns: R_Button[], data: obj, itemId: string): IButton[] => {
            return btns.map(btn => {
                return {
                    content: btn.caption,
                    className: btn.openType,
                    onClick: () => {
                        require(['OfflineBtn'], (e) => {
                            let offBtn = new e.OfflineBtn();
                            offBtn.init(btn, this, itemId);
                        });
                    }
                };
            })
        },
        /**
         * 调用shell保存修改的字段值
         * @param uniqueFlag 唯一键
         * @param itemId 当前对应id
         * @param field 当前字段
         * @param keyField 当前表对应主键
         * @param edit 当前编辑内容模块
         */
        operateTable: (uniqueFlag: string, itemId: string, field: R_Field, keyField: string, edit: EditModule) => {
            let name = field.name;

            console.log(edit.get(name));

            Shell.imports.operateTable(uniqueFlag, itemId, {
                [name]: edit.get(name)[name]
            }, {
                [keyField]: edit.get(keyField)[keyField]
            }, 'updata', result => {
                console.log(result);
                if (result.success) {
                    this.imports.editSet(edit, result.data);
                } else {
                    Modal.toast(result.msg);
                }
            });
        },
        mainUiGet: (): IBW_Slave_Ui => {
            return this.ui;
        },
        subUiGet: (): IBW_Slave => {
            return this.subUi[0]
        },
        /**
         * 获取累加替换值
         */
        getNum(): string {
            return this.countText && this.countText.get();
        },
        getOption(): string {
            return this.countTextEl && this.countTextEl.dataset.value;
        },
        /**
         * 拼接查询count（累加替换）数据时候需要的参数
         */
        getTextPara(): { itemId: string, name: string, expression: string } {
            const data = this.countTextEl && this.countTextEl.dataset;
            if (!data) return {
                itemId: null,
                name: null,
                expression: null,
            };

            return {
                itemId: data.item,
                name: data.name,
                expression: 'sum(' + data.name + ')',
            };
        },
        setAmount(value: string) {
            this.amountEl && (this.amountEl.innerHTML = value);
        },
        setText(value: string) {
            this.countText && this.countText.set(value);
        },
        setCount: (option: string) => {
            const el = this.imports.countTextEl;
            if (option === '1') {
                d.classAdd(this.dom, 'hide-count')
            } else {
                if (option === '2') {
                    el.innerHTML = '替换数值：';
                } else if (option === '3') {
                    el.innerHTML = '累加数值：';
                }
                d.classRemove(this.dom, 'hide-count')
            }
            el.dataset.value = option;
        },
        /**
         * 设置aggrList的值
         * @param value
         * @param itemId 指定id
         * @param keyField 修改的字段
         */
        setAggr: (value: string, itemId: string, keyField: string) => {
            const el = d.query(`[data-item=${itemId}] [data-name=${keyField}]`, this.imports.aggrEl);
            if (el) {
                el.innerHTML = value;
            }
        },
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
                    if (this.styleType === 'panel-off') {
                        tools.isNotEmpty(panel) && panel.panelItems.forEach((panelItem) => {
                            if (panelItem !== item) {
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
            if (this.isInventory) {
                this.subBtn.main = this.ui.subButtons;
                delete this.ui.subButtons;
            }
            this.main = GroupTabsPage.createTable(this.ui, wrapper);
            this.main.onDataChange = () => {
                this.subIndexes = [];
            };
            this.main.onRender = () => {
                if (this.styleType === 'panel-on' && this.tab instanceof Panel) {
                    this.tab.toggleAll(true);
                }

                if (!tools.isNotEmptyArray(this.subUi)) {
                    this.imports.init();
                }
                this.main.onRender = null;
            };

        } else {
            let sub = this.subs[index - 1];
            if (tools.isNotEmpty(sub)) {
                if (!((index - 1) in this.subIndexes)) {
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
                if (this.isInventory) {
                    this.subBtn.sub = ui.subButtons;
                    delete ui.subButtons;
                }

                this.subs[index - 1] = GroupTabsPage.createTable(ui, wrapper, this.main.getData());
                this.subIndexes[index - 1] = index - 1;

                let sub = this.subs[index - 1];
                if (this.subUi.every((ui, index) => index in this.subs)) {
                    sub.onRender = () => {
                        this.imports.init();
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
                url = tools.url.addObj(url, G.Rule.parseVarList(sub.uiAddr.parseVarList, {}));
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
            case 'table':
            case 'select': {
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
            this.subs.forEach((sub, index) => {
                if (tools.isNotEmpty(sub)) {
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