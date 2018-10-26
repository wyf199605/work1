/// <amd-module name="newTableModule"/>
import {BwRule} from "../../common/rule/BwRule";
import {BwMainTableModule} from "./BwMainTable";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {BwSubTableModule} from "./BwSubTableModule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {MbPage} from "../../../global/components/view/mbPage/MbPage";
import d = G.d;
import tools = G.tools;
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button, IButton} from "../../../global/components/general/button/Button";
import CONF = BW.CONF;
import {Loading} from "../../../global/components/ui/loading/loading";
import {BwTableModule} from "./BwTableModule";
import {EditModule} from "../edit/editModule";
import {FastTableCell} from "../../../global/components/newTable/FastTableCell";
import IComponentPara = G.IComponentPara;
import {ITab, Tab} from "../../../global/components/ui/tab/tab";
import {FormCom} from "../../../global/components/form/basic";
import {TableDataCell} from "../../../global/components/newTable/base/TableCell";

export interface ITableModulePara extends IComponentPara{
    bwEl: IBW_Table;
    ajaxData?: obj;
    data?: obj[];
}

export class NewTableModule {

    static EVT_EDIT_SAVE = "__event_edit_save__";

    main: BwMainTableModule = null;
    sub: obj = {};
    protected dragLine: HTMLElement;
    editable: boolean;
    protected _defaultData: obj[];
    private subTabActiveIndex: number;
    private rowData: obj;
    private tab: Tab;

    get defaultData() {
        return this._defaultData
            ? this._defaultData.map((obj) => Object.assign({}, obj || {}))
            : null;
    }

    constructor(para: ITableModulePara) {
        console.log(para);
        this.bwEl = para.bwEl;
        this._defaultData = para.data || null;
        this.subTabActiveIndex = 0;
        let subUi = this.bwEl.subTableList,
            {mainParam, subParam} = getMainSubVarList(para.bwEl.tableAddr);
        // this.mainEditable = !!mainVarList;
        // this.subEditable = !!subVarList;
        this.editable = !!(mainParam || (subUi && subParam));
        let main = this.main = new BwMainTableModule({
            ui: para.bwEl,
            container: para.container,
            editParam: mainParam,
            ajaxData: para.ajaxData,
            tableModule: this,
        });

        main.onFtableReady = () => {
            if(tools.isNotEmpty(this.bwEl.subButtons)) {
                main.subBtns.init(this.btnWrapper);
            }

            if (this.editable) {
                this.editBtns.init(this.btnWrapper);
            }
            // this.editInit(para.bwEl);

            if (tools.isNotEmpty(subUi)) {
                let mftable = main.ftable,
                    pseudoTable = mftable.pseudoTable;
                // 创建标签页
                let container = this.main.container,
                    modal: Modal = null;
                d.classAdd(container, 'table-module-has-sub');
                let tabWrapper:HTMLElement = null;
                if (!tools.isMb) {
                    if (tools.isEmpty(this.dragLine)) {
                        this.dragLine = <div className="drag-line"/>;
                        d.append(container, this.dragLine);
                    }
                    tabWrapper = <div className="sub-table-tab-wrapper"/>;
                    d.append(container, tabWrapper);
                } else {
                    modal = new Modal({
                        className: 'modal-mbPage sub-table',
                        isBackground: false,
                        height: '60%',
                        width: '75%',
                        isMb: false,
                        position: 'right',
                        onClose: () => {
                            let pseudoTable = this.main.ftable.pseudoTable;
                            pseudoTable && pseudoTable.clearPresentSelected();
                            this.active.isMain = true;
                        }
                    });
                    this.main.subBtns.box && (modal.wrapper.style.bottom = '36px');
                    // modal.wrapper.style.right = '0';
                    modal.wrapper.style.left = 'auto';
                    modal.wrapper.style.top = 'auto';
                    modal.wrapper.style.bottom = '40px';
                    this.mobileModal = modal;
                    let mbPage = new MbPage({
                        headerHeight: '30px',
                        container: modal.bodyWrapper,
                        title: '子表',
                        right: [{
                            icon: 'close',
                            onClick() {
                                modal.isShow = false
                            }
                        }],
                        left: [{
                            icon: 'fa fa-expand',
                            iconPre: 'mui-icon',
                            onClick() {
                                d.classToggle(modal.wrapper, 'full-screen');
                                d.classToggle(modal.wrapper, 'sub-table');
                            }
                        }],
                    });
                    tabWrapper = mbPage.bodyEl;
                }
                let tabs: ITab[] = [];
                this.subWrapper = tools.isMb ? modal.wrapper : tabWrapper;
                !tools.isMb && this.draggedEvent.on();
                this.active.on();
                let isFirst = true;
                mftable.on(FastTable.EVT_RENDERED, () => {
                    // let sub = this.sub || this.subInit(subUi);
                    if (mftable.editing) {
                        return;
                    }

                    !(this.subIndex in mftable.rows) && (this.subIndex = 0);
                    let firstRow = mftable.rowGet(this.subIndex);
                    if(!firstRow) {
                        this.mobileModal && (this.mobileModal.isShow = false);
                        return;
                    }
                    firstRow.selected = true;
                    if (tools.isEmpty(this.tab)){
                        this.tab = new Tab({
                            panelParent: tabWrapper,
                            tabParent: tabWrapper,
                            tabs: tabs,
                            onClick: (index) => {
                                this.subTabActiveIndex = index;
                                let selectedData = this.rowData ? this.rowData : (mftable.selectedRowsData[0] || {}),
                                    ajaxData = Object.assign({}, main.ajaxData, BwRule.varList(this.bwEl.subTableList[index].dataAddr.varList, selectedData));
                                if (!tools.isNotEmpty(this.sub[index])) {
                                    let {subParam} = getMainSubVarList(this.bwEl.tableAddr),
                                        tabEl = d.query(`.tab-pane[data-index="${index}"]`, this.tab.getPanel());
                                    this.subInit(this.bwEl.subTableList[index], subParam, ajaxData, tabEl);
                                } else {
                                    this.mobileModal && (this.mobileModal.isShow = true);
                                    this.sub[index].refresh(ajaxData).catch();
                                }
                            }
                        });
                        if (!tools.isMb){
                            d.query('ul.nav-tabs',this.main.container).appendChild(<i className="fa fa-expand full-icon"/>)
                        }
                    }
                    this.tab.len <= 0 && this.bwEl.subTableList.forEach((sub) => {
                        this.tab.addTab([{
                            title: sub.caption,
                            dom: null
                        }]);
                    });
                    setTimeout(() => {
                        // this.subRefresh(firstRow.data);
                        if (isFirst) {
                            this.tab.active(0);
                            pseudoTable && pseudoTable.setPresentSelected(this.subIndex);
                            isFirst = false;
                        }
                        if (!tools.isMb){
                            d.on(this.tab.getTab(), 'click', '.full-icon', () => {
                                let tabEl = d.query('.table-module-sub', d.query(`.tab-pane[data-index="${this.subTabActiveIndex}"]`, this.tab.getPanel()));
                                new Modal({
                                    body: tabEl,
                                    className: 'full-screen sub-table-full',
                                    header: {
                                        title: this.bwEl.subTableList[this.subTabActiveIndex].caption
                                    },
                                    onClose: () => {
                                        this.sub[this.subTabActiveIndex].ftable.removeAllModal();
                                        d.query(`.tab-pane[data-index="${this.subTabActiveIndex}"]`, this.tab.getPanel()).appendChild(tabEl);
                                    }
                                })
                            });
                        }
                    }, 200);
                });

                let self = this;
                mftable.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                    let rowIndex = parseInt(this.dataset.index),
                        row = mftable.rowGet(rowIndex);
                    self.subIndex = rowIndex;
                    if(row && row.selected){
                        self.subRefresh(row.data);
                        pseudoTable && pseudoTable.setPresentSelected(rowIndex);
                    }else{
                        self.mobileModal && (self.mobileModal.isShow = false);
                    }
                });
            }
        };
    }

    protected subIndex = 0;
    subRefresh(rowData?:obj) {
        let bwEl = this.bwEl,
            subUi = bwEl.subTableList && bwEl.subTableList[0],
            main = this.main,
            mftable = main.ftable;

        if(tools.isEmpty(subUi)) {
            return;
        }

        let selectedData = rowData ? rowData : (mftable.selectedRowsData[0] || {}),
            ajaxData = Object.assign({}, main.ajaxData, BwRule.varList(subUi.dataAddr.varList, selectedData));

        // 查询从表时不需要带上选项参数
        delete ajaxData['queryoptionsparam'];
        this.mobileModal && (this.mobileModal.isShow = true);
        Object.values(this.sub).forEach((subTable) => {
            subTable.refresh(ajaxData).catch();
        });

    }

    public mobileModal: Modal = null;
    private subWrapper: HTMLElement = null;

    subInit(ui: IBW_Table, editParam: IBW_TableAddrParam, ajaxData?: obj, tabEl?: HTMLElement) {
        // 如果查询有带分段，那么从表不生成
        // let section = JSON.parse(ajaxData.queryoptionsparam);
        // if(section && section.section){
        //     return;
        // }
        this.sub[this.subTabActiveIndex] = new BwSubTableModule({
            ui,
            editParam,
            ajaxData,
            isSub: true,
            tableModule: this,
            container: tabEl
        });
    }

    protected draggedEvent = (() => {
        let mainHeight = 0,
            subHeight = 0,
            mouseDownHandler = null,
            mouseMoveHandler = null,
            mouseUpHandler = null;
        return {
            on: () => {
                let mainWrapper = this.main.wrapper;
                let subWrapper = this.subWrapper;
                mainHeight = mainWrapper.offsetHeight;
                subHeight = subWrapper.offsetHeight;
                d.on(this.main.container, 'mousedown', '.drag-line', mouseDownHandler = (ev: MouseEvent) => {
                    document.body.style.cssText = 'cursor: n-resize!important';
                    let disY = ev.clientY;
                    d.off(document, 'mousemove', mouseMoveHandler);
                    d.off(document, 'mouseup', mouseUpHandler);
                    d.on(document, 'mousemove', mouseMoveHandler = (ev) => {
                        let translate = ev.clientY - disY;
                        if(mainHeight + translate > 200 && subHeight - translate > 200) {
                            disY = ev.clientY;
                            mainHeight += translate;
                            subHeight -= translate;
                            mainWrapper.style.height = mainHeight + 'px';
                            subWrapper.style.height = subHeight + 'px';
                        }
                    });
                    d.on(document, 'mouseup', mouseUpHandler = () => {
                        d.off(document, 'mousemove', mouseMoveHandler);
                        d.off(document, 'mouseup', mouseUpHandler);
                        document.body.style.removeProperty('cursor');
                    })
                })
            },
            off: () => {
                d.off(this.dragLine, 'mousedown', mouseDownHandler);
            }
        }
    })();

    bwEl: IBW_Table;

    refresh(data?: obj) {
        return this.main.refresh(data)
    }

    editBtns = (() => {

        let box: InputBox,
            editBtnData: IButton[] = [];

        let start = () => {
            btnStatus.start();
            return this.edit.start();
        };

        let dbclick = (() => {
            let selector = '.section-inner-wrapper:not(.pseudo-table) tbody td:not(.cell-img)',
                handler = function () {
                    start().then(() => {
                        this.click();
                    });
                };
            return {
                on: () => {
                    d.on(this.main.container, 'dblclick', selector, handler);
                },
                off: () => {
                    d.off(this.main.container, 'dblclick', selector, handler);
                }
            }
        })();


        let editParamHas = (varNames: string[], isMain?: boolean) => {
            let params: IBW_TableAddrParam[] = [],
                mainEditParam = this.main.editParam,
                subEditParam = tools.isNotEmpty(this.sub) &&  tools.isNotEmpty(this.sub[this.subTabActiveIndex]) && this.sub[this.subTabActiveIndex].editParam;

            if (typeof isMain === 'undefined') {
                params = [mainEditParam, subEditParam];
            } else {
                params = [isMain ? mainEditParam : subEditParam];
            }

            return params.some((param) => editVarHas(param, varNames));
        };

        let btnStatus = {
            end: (isMain?: boolean) => {

                let status = {
                    edit: editParamHas(['update'], isMain),
                    insert: editParamHas(['insert'], isMain),
                    del: editParamHas(['delete'], isMain),
                    save: false,
                    cancel: false
                };

                if (box) {
                    for (let key in status) {
                        let btn = box.getItem(key);
                        btn && (btn.isDisabled = !status[key]);
                    }
                }

                dbclick.on();
            },
            start: (isMain?: boolean) => {
                let status = {
                    edit: false,
                    insert: editParamHas(['insert'], isMain),
                    del: editParamHas(['delete'], isMain),
                    save: true,
                    cancel: true
                };
                //
                for (let key in status) {
                    let btn = box.getItem(key);
                    if (btn) {
                        btn.isDisabled = !status[key]
                    }
                }
                dbclick.off();
            }
        };


        let initInner = (wrapper: HTMLElement) => {
            editBtnData = [
                {
                    key: 'edit',
                    content: '编辑',
                    onClick: () => {
                        start();
                    },
                    icon: 'app-bianji',
                    iconPre: 'appcommon'
                }, {
                    key: 'insert',
                    content: '新增',
                    onClick: () => {
                        btnStatus.start();
                        this.edit.insert();
                    },
                    icon: 'app-xinzeng',
                    iconPre: 'appcommon'
                }, {
                    key: 'del',
                    content: '删除',
                    onClick: () => {
                        btnStatus.start();
                        this.edit.del();
                    },
                    icon: 'app-shanchu',
                    iconPre: 'appcommon'
                }, {
                    key: 'save',
                    content: '保存',
                    onClick: () => {
                        this.edit.save()
                    },
                    icon: 'app-baocun',
                    iconPre: 'appcommon'
                }, {
                    key: 'cancel',
                    content: '取消',
                    onClick: () => {
                        btnStatus.end();
                        this.edit.cancel();
                    },
                    icon: 'app-quxiao',
                    iconPre: 'appcommon'
                }
            ];


            box = new InputBox({
                container: wrapper
            });
            d.classAdd(box.wrapper, 'pull-left edit-btns');
            editBtnData.forEach((btnData) => {
                box.addItem(new Button(btnData));
            });
            btnStatus.end();

            this.active.onChange = (isMain) => {
                this.main.ftable.editing ? btnStatus.start(isMain) : btnStatus.end(isMain);
            }
        };

        return {
            init: (wrapper: HTMLElement) => {
                initInner(wrapper);
            },
            get box() {
                return box;
            },
            start,
            end: () => {
                btnStatus.end();
            }
        }
    })();


    protected active = (() => {
        let isMainActive = true,
            handler1, handler2,
            onChange = (isActive: boolean) => {
            };

        let on = () => {
            this.sub && d.on(this.subWrapper, 'click', handler1 = () => {
                isMainActive = false;
                tools.isFunction(onChange) && onChange(isMainActive);
            });
            d.on(this.main.wrapper, 'click', handler2 = () => {
                isMainActive = true;
                tools.isFunction(onChange) && onChange(isMainActive);
            });
        };

        let off = () => {
            this.sub && d.off(this.subWrapper, 'click', handler1);
            d.off(this.main.wrapper, 'click', handler2);
        };

        return {
            on, off,
            get isMain(){
                return isMainActive;
            },
            set isMain(isMain: boolean) {
                isMainActive = isMain;
            },
            set onChange(hander: (iMain: boolean) => void){
                onChange = hander;
            }
        }
    })();

    edit = (() => {

        let self = this,
            editModule: EditModule = null;

        let tableEach = (fun: (tm: BwTableModule, index:number) => void) => {
            [this.main, ...Object.values(this.sub)].forEach((table, i) => {
                fun(table, i)
            })
        };
        let cancel = () => {
            this.main.ftable.editorCancel();
            this.sub && Object.values(this.sub).forEach((subTable) => {
                subTable.ftable.editorCancel()
            });
        };

        let start = (): Promise<void> => {
            // debugger;
            let mftable = this.main.ftable;
            if (mftable.editing) {
                return;
            }
            let allPromise: Promise<void>[] = [];
            tableEach(table => {
                if (table) {
                    allPromise.push(Promise.all([
                        editModuleLoad(),
                        table.rowDefData
                    ]).then(([TableEditModule, defData]) => {

                        let index = mftable.pseudoTable ? mftable.pseudoTable.presentOffset : -1,
                            mainData = table.isSub && index >= 0 ? mftable.tableData.rowDataGet(index) : null;

                        tableEditInit(TableEditModule, table, Object.assign({}, defData, mainData));
                    }));
                }
            });
            return Promise.all(allPromise).then(() => {
            });
        };

        let tableEditInit = (TableEditModule: typeof EditModule, bwTable: BwTableModule, defData: obj) => {
            editModule = new TableEditModule({
                auto: false,
                type: 'table',
                fields: bwTable.cols.map(f => {
                    return {
                        dom: null,
                        field: f
                    }
                })
            });

            bwTable.ftable.editorInit({
                defData,
                isPivot: bwTable.isPivot,
                autoInsert: false,
                inputInit: (cell, col, data) => {
                    let rowIndex = cell.row.index,
                        row = bwTable.ftable.rowGet(rowIndex),
                        field = col.content as R_Field;
                    let value = data;
                    if (field.elementType === 'lookup') {
                        let lookUpKeyField = field.lookUpKeyField,
                            cell = row.cellGet(lookUpKeyField);
                        value = cell ? cell.data : '';
                    }

                    let com = !BwRule.isImage(field.atrrs && field.atrrs.dataType) ? editModule.init(col.name, {
                        dom: cell.wrapper,
                        data: row.data,
                        field,
                        onExtra: (data, relateCols, isEmptyClear = false) => {
                            if (tools.isEmpty(data) && isEmptyClear) {
                                // table.edit.modifyTd(td, '');
                                cell.data = '';
                                return;
                            }
                            //TODO 给row.data赋值会销毁当前cell的input
                            // row.data = Object.assign({}, row.data, data);

                            if (field.elementType === 'lookup') {
                                let lookUpKeyField = field.lookUpKeyField,
                                    cell = row.cellGet(lookUpKeyField);
                                if (cell && cell.column) {
                                    let filed = cell.column.content as R_Field;
                                    cell.data = data[lookUpKeyField];

                                    if (filed.assignSelectFields && filed.assignAddr) {
                                        NewTableModule.initAssignData(filed.assignAddr, row ? row.data : {})
                                            .then(({response}) => {

                                                let data = response.data;
                                                if (data && data[0]) {
                                                    filed.assignSelectFields.forEach((name) => {
                                                        let assignCell = row.cellGet(name) as TableDataCell;
                                                        if (assignCell) {
                                                            assignCell.data = data[0][name];
                                                        }
                                                    })
                                                }
                                            });
                                    }
                                }
                            } else if(Array.isArray(field.assignSelectFields)){
                                // 上传文件返回File_id，需要设置file_id值， 或者修改关联的assign的值
                                field.assignSelectFields.forEach((name) => {
                                    let cell = row.cellGet(name) as TableDataCell;
                                    if(cell){
                                        cell.data = data[name] || '';
                                    }
                                })
                            } else if(Array.isArray(field.relateFields)){
                                for(let key in data){
                                    let cell = row.cellGet(key) as TableDataCell;
                                    if(cell){
                                        cell.data = data[key] || '';
                                    }
                                }
                            }
                        }
                    }) : null;

                    if (com instanceof FormCom) {
                        com.set(value);
                    }
                    return com;
                },
                cellCanInit: (col, type) => {
                    // let field = col.content || {};
                    // return  type === 1 ? !field.noModify : !field.noEdit;
                    return cellCanInit(col, type);
                },
                rowCanInit: (row) => {
                    // let canRowInit = (isMain: boolean, rowData?: obj) => {
                    //     if(isMain) {
                    //         return !(rowData && (rowData['EDITEXPRESS'] === 0));
                    //     } else {
                    //         let main = this.main.ftable,
                    //             mainIndex = main.pseudoTable.presentOffset,
                    //             mainRowData = main.rowGet(mainIndex).data;
                    //
                    //         return canRowInit(true, mainRowData)
                    //     }
                    // };
                    //
                    // return canRowInit(!bwTable.isSub, row.data);
                    //当为0时不可编辑
                    return rowCanInit(row, bwTable.isSub)
                }
            });

            // 控件销毁时验证
            bwTable.ftable.on(FastTable.EVT_CELL_EDIT_CANCEL, (cell: FastTableCell) => {
                validate(cell);
            });

            let validate = (cell: FastTableCell) => {
                // debugger;
                let name = cell.name,
                    field: R_Field = cell.column.content,
                    fastRow = cell.frow,
                    rowData = fastRow.data,
                    lookUpCell,
                    result;

                if (field.elementType === 'lookup') {
                    lookUpCell = fastRow.cellGet(field.lookUpKeyField);
                    if (lookUpCell && lookUpCell.column) {
                        field = lookUpCell.column.content;
                        result = editModule.validate.start(lookUpCell.name, lookUpCell.data);
                    }
                } else {
                    result = editModule.validate.start(name, cell.data);
                }

                if (result && result[name]) {
                    cell.errorMsg = result[name].errMsg;
                    // callback(td, false);
                } else if (field.chkAddr && tools.isNotEmpty(rowData[name])) {
                    TableEditModule.checkValue(field, rowData, () => {
                        cell.data = null;
                        lookUpCell && (lookUpCell.data = null);
                    })
                        .then((res) => {
                            let {errors, okNames} = res;
                            Array.isArray(errors) && errors.forEach(err => {
                                let {name, msg} = err,
                                    cell = fastRow.cellGet(name);
                                if (cell) {
                                    cell.errorMsg = msg;
                                }
                                //     callback(el, false);
                            });

                            Array.isArray(okNames) && okNames.forEach(name => {
                                cell.errorMsg = null;
                            })
                        });
                } else {
                    cell.errorMsg = '';
                    // callback(td, true);
                }
            };
        };

        let editModuleLoad = (): Promise<typeof EditModule> => {
            return new Promise((resolve) => {
                require(['EditModule'], (edit) => {
                    resolve(edit.EditModule as typeof EditModule);
                })
            })
        };

        let editParamDataGet = (tableData, varList: IBW_TableAddrParam, isPivot = false) => {
            let paramData: obj = {};
            varList && ['update', 'delete', 'insert'].forEach(key => {
                let dataKey = varList[`${key}Type`];
                if (varList[key] && tableData[dataKey][0]) {

                    let data = BwRule.varList(varList[key], tableData[dataKey], true,
                        !isPivot);
                    if (data) {
                        paramData[key] = data;
                    }
                }
            });

            if (!tools.isEmpty(paramData)) {
                paramData.itemId = varList.itemId;
            }
            return paramData;
        };

        let editDataGet = (data?) => {
            let postData = {
                param: [] as obj[]
            };

            [this.main, ...Object.values(this.sub)].forEach((bwTable, i) => {
                if (!bwTable) {
                    return;
                }

                let editData = bwTable.ftable.editedData,
                    isPivot = editData.isPivot;
                delete editData.isPivot;
                if (i === 1) {
                    // 带上当前主表的字段
                    let mainData = this.main.ftable.edit;
                    for (let key in editData) {
                        if (tools.isNotEmpty(editData[key])) {
                            editData[key].forEach((obj, i) => {
                                editData[key][i] = Object.assign({}, mainData, obj)
                            });
                        }
                    }
                }
                //
                let data = editParamDataGet(editData, bwTable.editParam, isPivot);
                // tm.table.edit.reshowEditing();
                //
                if (!tools.isEmpty(data)) {
                    postData.param.push(data);
                }
            });
            return postData;
        };

        let insert = () => {
            let main = this.main,
                sub = this.sub[this.subTabActiveIndex];

            (main.ftable.editing ? Promise.resolve() : start())
                .then(() => {
                    let currentTable = this.active.isMain ? main : sub;
                    currentTable && currentTable.ftable.rowAdd();
                })
        };

        let save = () => {
            return editModule.assignPromise.then(() => {
                let saveData = editDataGet();
                if (tools.isEmpty(saveData.param)) {
                    Modal.toast('没有数据改变');
                    cancel();
                    this.editBtns.end();
                    return
                }

                let loading = new Loading({
                    msg: '保存中',
                    disableEl: this.main.wrapper
                });

                BwRule.Ajax.fetch(CONF.siteUrl + this.bwEl.tableAddr.dataAddr, {
                    type: 'POST',
                    data: saveData,
                }).then(({response}) => {

                    BwRule.checkValue(response, saveData, () => {
                        // 刷新主表
                        this.refresh();
                        // 刷新子表
                        !(this.subIndex in this.main.ftable.rows) && (this.subIndex = 0);
                        let row = this.main.ftable.rowGet(this.subIndex);
                        this.subRefresh(row.data);
                        Modal.toast(response.msg);
                        this.editBtns.end();
                        // loading && loading.destroy();
                        // loading = null;
                        cancel();
                        tools.event.fire(NewTableModule.EVT_EDIT_SAVE);
                    });
                }).finally(() => {
                    loading && loading.destroy();
                    loading = null;
                });
            });
        };

        let del = () => {
            let main = this.main,
                sub = this.sub[this.subTabActiveIndex];
            (main.ftable.editing ? Promise.resolve() : start())
                .then(() => {
                    // let currentTable = isMainActive ? main : sub;
                    // currentTable && currentTable.ftable.rowAdd();
                    let mainFtable = main.ftable,
                        subFtable = sub ? sub.ftable : null;
                    if (!subFtable || tools.isEmpty(subFtable.data)) {
                        mainFtable.rowDel(mainFtable.selectedRows.map(row => row.index));
                    } else if (subFtable && tools.isNotEmpty(subFtable.selectedRows)) {
                        subFtable.rowDel(subFtable.selectedRows.map(row => row.index));
                    } else {
                        Modal.alert('不能删除有明细的主表数据');
                    }
                })

        };

        let cellCanInit = (col, type) => {
            let field = col.content || {};
            return type === 1 ? !field.noModify : !field.noEdit;
        };
        let rowCanInit = (row, isSub) => {
            let canRowInit = (isMain: boolean, rowData?: obj) => {
                if (isMain) {
                    return !(rowData && (rowData['EDITEXPRESS'] === 0));
                } else {
                    let main = self.main.ftable,
                        mainIndex = main.pseudoTable.presentOffset,
                        row = main.rowGet(mainIndex),
                        mainRowData = row ? row.data : {};

                    return canRowInit(true, mainRowData)
                }
            };

            return tools.isEmpty(row) ? false : canRowInit(!isSub, row.data);
            //当为0时不可编辑
        };

        return {
            start,
            cancel,
            save,
            insert,
            del,
            cellCanInit,
            rowCanInit
        }
    })();

    protected static initAssignData(assignAddr: R_ReqAddr, data: obj) {
        return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(assignAddr, data), {
            cache: true,
        })
    }

    protected _btnWrapper: HTMLElement;
    protected get btnWrapper() {
        if (!this._btnWrapper) {
            let main = this.main;
            // debugger;
            if (tools.isMb) {
                d.classAdd(this.main.wrapper, 'has-footer-btn');
                this._btnWrapper = <footer className="mui-bar mui-bar-footer"></footer>;
                //
                d.append(this.main.wrapper, this._btnWrapper);
                if (this.editable && tools.isNotEmpty(this.bwEl.subButtons)) {
                    let btnWrapper = <div className="all-btn"></div>;

                    new CheckBox({
                        className: 'edit-toggle',
                        container: this._btnWrapper,
                        onClick: (isChecked) => {
                            this.main.subBtns.box.isShow = !isChecked;
                            this.editBtns.box.isShow = isChecked;
                        }
                    });

                    d.append(this._btnWrapper, btnWrapper);
                    this._btnWrapper = btnWrapper;
                }

            } else {
                this._btnWrapper = main.ftable.btnWrapper
            }
        }
        return this._btnWrapper;
    }

    destroy() {
        this.mobileModal && this.mobileModal.destroy();
        this.draggedEvent.off();
        d.remove(this.dragLine);
        this.main && this.main.destroy();
        this.sub && Object.values(this.sub).forEach((subTable) => {
            subTable.destroy()
        });
        d.remove(this.subWrapper);
        this.subWrapper = null;
        this.main = null;
        this.sub = null;
        this.edit = null;
        this.bwEl = null;
        this._btnWrapper = null;
        this.tab = null;
    }
}

function getMainSubVarList(addr: IBW_TableAddr) {
    let varlist = {
        mainParam: null as IBW_TableAddrParam,
        subParam: null as IBW_TableAddrParam,
    };

    addr && Array.isArray(addr.param) && addr.param.forEach(p => {
        if (p.type === 'sub') {
            varlist.subParam = p;
        } else if (p.type === 'main') {
            varlist.mainParam = p;
        }
    });

    return varlist;
}


function editVarHas(varList: IBW_TableAddrParam, hasTypes: string[]) {
    let types = ['update', 'insert', 'delete'];
    if (varList) {
        for (let t of types) {
            if (hasTypes.indexOf(varList[`${t}Type`]) > -1) {
                return true
            }
        }
    }
    return false;
}