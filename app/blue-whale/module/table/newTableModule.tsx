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
import AGroupTabItem = BW.AGroupTabItem;
import IGroupTabItemPara = BW.IGroupTabItemPara;

export interface ITableModulePara extends IGroupTabItemPara {
    bwEl: IBW_Table;
    ajaxData?: obj;
    data?: obj[];
}

export class NewTableModule extends AGroupTabItem{

    static EVT_EDIT_SAVE = "__event_edit_save__";
    wrapperInit(){
        return null;
    }

    get btnWrapper(){
        return this.main.btnWrapper;
    }
    getData(){
        return this.main.ftable.selectedRowsData || null;
    }
    onDataChange;
    onRender;

    main: BwMainTableModule = null;
    sub: objOf<BwSubTableModule> = {};
    protected dragLine: HTMLElement;
    editable: boolean;
    protected _defaultData: obj[];
    private subTabActiveIndex: number;
    private rowData: obj;
    private tab: Tab;
    private showSubField: string = '';
    protected subModal: Modal;
    editType: 'self' | 'linkage' = 'linkage';

    get defaultData() {
        return this._defaultData
            ? this._defaultData.map((obj) => Object.assign({}, obj || {}))
            : null;
    }

    private currentSelectedIndexes: number[] = [];

    constructor(para: ITableModulePara) {
        super(para);
        console.log(para);
        this.bwEl = para.bwEl;
        this.showSubField = para.bwEl.showSubField;
        this._defaultData = para.data || null;
        this.subTabActiveIndex = 0;
        let subUi = this.bwEl.subTableList,
            {mainParam, subParam} = getMainSubVarList(para.bwEl.tableAddr);
        // this.mainEditable = !!mainVarList;
        // this.subEditable = !!subVarList;
        this.editable = !!(mainParam || (subUi && subParam));
        if(this.bwEl.uiType === 'templ_single'){
            this.editType = 'self';
            this.editable = false;
        }
        let main = this.main = new BwMainTableModule({
            ui: para.bwEl,
            container: para.container,
            editParam: mainParam,
            ajaxData: para.ajaxData,
            tableModule: this,
        });

        main.onFtableReady = () => {
            if (tools.isNotEmpty(this.bwEl.subButtons)) {
                main.subBtns.init(this.main.btnWrapper);
            }
            this.onRender && this.onRender();

            if (this.editType === 'linkage' && this.editable) {
                this.initEdit(main);
                this.active.onChange = (isMain) => {
                    if(isMain){
                        this.main.modify.end();
                    }else{
                        let sub = this.sub[this.subTabActiveIndex];
                        sub && sub.modify.end();
                    }
                }
            }else if(this.editType === 'self' && this.main.editParam){
                this.initEdit(main);
            }
            let box = tools.keysVal(this.main, 'subBtns', 'box');
            box && box.responsive();

            // this.initEdit(para.bwEl);

            if (tools.isNotEmpty(subUi)) {
                let mftable = main.ftable,
                    pseudoTable = mftable.pseudoTable;
                // 创建标签页
                let container = this.main.container,
                    modal: Modal = null;
                d.classAdd(container, 'table-module-has-sub');
                let tabWrapper: HTMLElement = null;
                if (!tools.isMb) {
                    if (tools.isEmpty(this.dragLine)) {
                        this.dragLine = <div className="drag-line"/>;
                        d.append(container, this.dragLine);
                    }
                    tabWrapper = <div className="sub-table-tab-wrapper"/>;
                    d.append(container, tabWrapper);
                } else {
                    this.subModal = modal = new Modal({
                        className: 'modal-mbPage sub-table sub-table-page-modal',
                        isBackground: false,
                        height: '60%',
                        width: '75%',
                        isMb: false,
                        zIndex: 500,
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
                        // headerHeight: '30px',
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
                !tools.isMb && this.dragged.on();
                this.active.on();
                let isFirst = true;
                mftable.on(FastTable.EVT_RENDERED, () => {
                    // let sub = this.sub || this.subInit(subUi);
                    if (mftable.editing) {
                        return;
                    }

                    !(this.subIndex in mftable.rows) && (this.subIndex = 0);
                    let firstRow = mftable.rowGet(this.subIndex);
                    if (!firstRow) {
                        this.mobileModal && (this.mobileModal.isShow = false);
                        return;
                    }
                    pseudoTable && pseudoTable.setPresentSelected(this.subIndex);
                    firstRow.selected = true;
                    let noLoadSub = this.noLoadSub(mftable, main);
                    if (tools.isEmpty(this.tab)) {
                        this.tab = new Tab({
                            panelParent: tabWrapper,
                            tabParent: tabWrapper,
                            tabs: tabs,
                            onClick: (index) => {
                                this.subTabActiveIndex = index;
                                let selectedData = this.rowData ? this.rowData : (mftable.selectedPreRowData || {}),
                                    ajaxData = Object.assign({}, main.ajaxData, BwRule.varList(this.bwEl.subTableList[this.subTabActiveIndex].dataAddr.varList, selectedData));
                                if (!tools.isNotEmpty(this.sub[index])) {
                                    let {subParam} = getMainSubVarList(this.bwEl.tableAddr, this.bwEl.subTableList[index].itemId),
                                        tabEl = d.query(`.tab-pane[data-index="${index}"]`, this.tab.getPanel()),
                                        subUi = this.bwEl.subTableList[index];

                                    this.subInit(this.bwEl.subTableList[index], subParam, selectedData, ajaxData, tabEl);
                                    this.currentSelectedIndexes.push(index);
                                } else {
                                    this.mobileModal && (this.mobileModal.isShow = true);
                                    if (!~this.currentSelectedIndexes.indexOf(index)) {
                                        this.sub[index].refresh(ajaxData).then(() => {
                                            this.sub[index].isPivot && this.initEdit(this.sub[index]);
                                        }).catch();
                                        this.currentSelectedIndexes.push(index);
                                    }
                                    this.sub[index].linkedData = selectedData;
                                    this.sub[index].ftable && this.sub[index].ftable.recountWidth();
                                }
                            }
                        });

                        !tools.isMb && !this.subIconWrapper && this.initSubIcon();
                    }
                    this.tab.len <= 0 && this.bwEl.subTableList.forEach((sub) => {
                        this.tab.addTab([{
                            title: sub.caption,
                            dom: null
                        }]);
                    });
                    if (noLoadSub) {
                        this.subWrapper.classList.add('hide');
                        return;
                    } else {
                        this.subWrapper.classList.remove('hide');
                    }
                    setTimeout(() => {
                        // this.subRefresh(firstRow.data);
                        if (isFirst && !noLoadSub) {
                            let selectedData = this.rowData ? this.rowData : (mftable.selectedPreRowData || {});
                            if (tools.isNotEmpty(this.showSubField) && tools.isNotEmpty(selectedData[this.showSubField])) {
                                let showSubSeq = selectedData[this.showSubField].split(',');
                                this.tab.setTabsShow(showSubSeq);
                                this.tab.active(parseInt(showSubSeq[0]) - 1);
                                parseInt(showSubSeq[0]) - 1 >= 0 && this.currentSelectedIndexes.push(parseInt(showSubSeq[0]) - 1);
                            } else {
                                this.tab.active(0);
                                this.currentSelectedIndexes.push(0);
                            }
                            pseudoTable && pseudoTable.setPresentSelected(this.subIndex);
                            isFirst = false;
                        }
                    }, 200);
                });

                let self = this;
                mftable.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                    let subTables = Object.values(self.sub);
                    if(subTables.some((table) => table.ftable.editing)){
                        Modal.confirm({
                            msg: '是否保存正在编辑的子表的数据？',
                            callback: (flag) => {
                                let editSubTables = subTables.filter((table) => table.ftable.editing);
                                if(flag){
                                    Promise.all(editSubTables.map((table) => {
                                        return self.editManage.save(table);
                                    }))
                                }else{
                                    editSubTables.forEach((table) => {
                                        self.editManage.end(table);
                                    });
                                    let rowIndex = parseInt(this.dataset.index);
                                    self.currentSelectedIndexes = [];
                                    self.subRefreshByIndex(rowIndex);
                                }
                            }
                        })
                    }else{
                        let rowIndex = parseInt(this.dataset.index);
                        self.currentSelectedIndexes = [];
                        self.subRefreshByIndex(rowIndex);
                    }
                });
            }else{
                let self = this;
                main.ftable.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                    let rowIndex = parseInt(this.dataset.index);
                    self.currentSelectedIndexes = [];
                    self.subRefreshByIndex(rowIndex);
                })
            }
        };
    }

    protected subIconWrapper: HTMLElement = null;
    protected initSubIcon(){
        let navbar = d.query('ul.nav-tabs', this.subWrapper),
            maxIcon,
            minIcon,
            btnShowIcon;
        navbar.classList.add('sub-tab-navbar');

        let iconWrapper = this.subIconWrapper = <div className="sub-icon-navbar">
            {maxIcon = <i title="最大化" className="fa fa-expand sub-icon"/>}
            {minIcon = <i title="最小化" className="iconfont icon-zuixiaohua sub-icon"/>}
            {btnShowIcon = <i title="点击隐藏按钮" className="iconfont icon-arrow-up sub-icon"/>}
        </div>;
        d.append(this.subWrapper, iconWrapper);

        // 子表按钮隐藏显示
        d.on(btnShowIcon, 'click', () => {
            btnShowIcon.classList.toggle('icon-arrow-up');
            btnShowIcon.classList.toggle('icon-arrow-down');
            this.subBtnShow = btnShowIcon.classList.contains('icon-arrow-up');
            for (let sub of Object.values(this.sub)) {
                sub && (sub.btnShow = this.subBtnShow);
                this.subBtnShow ? btnShowIcon.title = '点击隐藏按钮' : btnShowIcon.title = '点击展开按钮';
            }
        });

        // 最小化
        d.on(minIcon, 'click', () => {
            this.subWrapper.style.transition = 'height 0.5s';
            this.main.wrapper.style.transition = 'height 0.5s';
            this.dragged.subHeight = 0;
            setTimeout(() => {
                this.subWrapper.style.removeProperty('transition');
                this.main.wrapper.style.removeProperty('transition');
            }, 600);
        });

        // 最大化
        d.on(maxIcon, 'click', () => {
            if (tools.isEmpty(this.sub[this.subTabActiveIndex])) {
                Modal.alert('当前没有子表可以全屏显示!');
                return;
            }
            let tabEl = d.query('.table-module-sub', d.query(`.tab-pane[data-index="${this.subTabActiveIndex}"]`, this.tab.getPanel()));

            let sub = this.sub[this.subTabActiveIndex],
                isShow = sub ? sub.btnShow : true;
            sub && (sub.btnShow = true);

            new Modal({
                body: tabEl,
                className: 'full-screen sub-table-full',
                header: {
                    title: '子表全屏'
                },
                onClose: () => {
                    sub && (sub.btnShow = isShow);
                    this.sub[this.subTabActiveIndex].ftable.removeAllModal();
                    d.query(`.tab-pane[data-index="${this.subTabActiveIndex}"]`, this.tab.getPanel()).appendChild(tabEl);
                    this.sub[this.subTabActiveIndex].ftable && this.sub[this.subTabActiveIndex].ftable.recountWidth();
                }
            });
            this.sub[this.subTabActiveIndex].ftable && this.sub[this.subTabActiveIndex].ftable.recountWidth();
        });
    }

    protected subBtnShow: boolean = true;

    subRefreshByIndex(index: number) {
        let main = this.main,
            mftable = main.ftable,
            pseudoTable = main.ftable.pseudoTable,
            row = this.main.ftable.rowGet(index);
        this.subIndex = index;
        if (row && row.selected) {
            if (tools.isNotEmpty(this.showSubField) && tools.isNotEmpty(row.data[this.showSubField])) {
                let showSubSeq = row.data[this.showSubField].split(',');
                this.tab.setTabsShow(showSubSeq);
                this.subTabActiveIndex = parseInt(showSubSeq[0]) - 1;
                this.tab.active(parseInt(showSubSeq[0]) - 1);
                pseudoTable && pseudoTable.setPresentSelected(index);
                this.currentSelectedIndexes.push(parseInt(showSubSeq[0]) - 1);
            } else {
                !this.noLoadSub(mftable, main) && this.subRefresh(row.data);
                pseudoTable && pseudoTable.setPresentSelected(index);
                this.currentSelectedIndexes.push(0);
            }
        } else {
            this.mobileModal && (this.mobileModal.isShow = false);
        }
        this.onDataChange && this.onDataChange();
    }

    set subModalShow(flag: boolean) {
        this.subModal && (this.subModal.isShow = flag);
    }

    private noLoadSub(mftable, main) {
        if(tools.isEmpty(this.bwEl.subTableList)){
            return true;
        }
        let selectedData = this.rowData ? this.rowData : (mftable.selectedPreRowData || {}),
            ajaxData = Object.assign({}, main.ajaxData, BwRule.varList(this.bwEl.subTableList[this.subTabActiveIndex].dataAddr.varList, selectedData)),
            qm = ajaxData.queryoptionsparam,
            section;
        try {
            section = (typeof qm === 'string') && JSON.parse(ajaxData.queryoptionsparam)
        } catch (e) {

        }

        return section && section.section
    }

    protected subIndex = 0;

    subRefresh(rowData?: obj): Promise<Array<any>> {
        let promise = [],
            main = this.main,
            mftable = main.ftable,
            selectedData = rowData ? rowData : (mftable.selectedPreRowData || {});
        if (tools.isNotEmpty(this.showSubField) && tools.isNotEmpty(selectedData[this.showSubField])) {
            let showSubSeq = selectedData[this.showSubField].split(',');
            let seqIndex = parseInt(showSubSeq[0]) - 1;
            if(tools.isEmpty(this.sub[seqIndex])){
                this.subTabActiveIndex = seqIndex;
            }
        }
        let bwEl = this.bwEl,
            subUi = bwEl.subTableList && bwEl.subTableList[this.subTabActiveIndex];

        if (tools.isEmpty(subUi)) {
            return Promise.resolve([]);
        }

        let ajaxData = Object.assign({}, main.ajaxData, BwRule.varList(subUi.dataAddr.varList, selectedData));

        // 查询从表时不需要带上选项参数
        delete ajaxData['queryoptionsparam'];
        this.mobileModal && (this.mobileModal.isShow = true);
        if (tools.isNotEmpty(this.showSubField) && tools.isNotEmpty(selectedData[this.showSubField])) {
            let showSubSeq = selectedData[this.showSubField].split(',');
            this.tab.setTabsShow(showSubSeq);
            this.currentSelectedIndexes.push(this.subTabActiveIndex);
            let subs = [];
            for (let key in this.sub) {
                if (~showSubSeq.indexOf(parseInt(key) + 1 + '') && tools.isNotEmpty(this.sub[key])) {
                    subs.push(this.sub[key]);
                }
            }
            subs.forEach((subTable) => {
                promise.push(subTable.refresh(ajaxData).catch());
                subTable.linkedData = selectedData;
            });
            if (tools.isEmpty(this.sub[this.subTabActiveIndex])) {
                this.tab.active(this.subTabActiveIndex);
            }
        } else {
            Object.values(this.sub).forEach((subTable) => {
                promise.push(subTable.refresh(ajaxData).catch());
                subTable.linkedData = selectedData;
            });
        }
        return Promise.all(promise).then((arr) => {
            Object.values(this.sub).forEach((subTable) => {
                if(subTable.isPivot){
                    this.initEdit(subTable);
                }
            });
            return arr;
        });
    }

    public mobileModal: Modal = null;
    private subWrapper: HTMLElement = null;

    subInit(ui: IBW_Table, editParam: IBW_TableAddrParam, rowData: obj, ajaxData?: obj, tabEl?: HTMLElement) {
        if(ui.tableAddr && ui.tableAddr.param && ui.tableAddr.param[0]){
            editParam = ui.tableAddr.param[0];
        }
        let subTable = this.sub[this.subTabActiveIndex] = new BwSubTableModule({
            ui,
            editParam,
            ajaxData,
            isSub: true,
            tableModule: this,
            container: tabEl,
            btnShow: this.subBtnShow
        });

        subTable.onFtableReady = () => {
            subTable.onFtableReady = () => {};
            subTable.linkedData = rowData;
            if(this.editType === 'self'){
                this.editInit(subTable);
            }else if(this.editType === 'linkage'){
                subTable.modify.init(this.main.modify.box, !(this.active.isMain || this.editManage.editing));
                if(this.editManage.editing && !this.main.ftable.editing){
                    let handler;
                    subTable.ftable.on(FastTable.EVT_RENDERED, handler = () => {
                        this.editManage.start(this.sub[this.subTabActiveIndex]);
                        subTable.ftable.off(FastTable.EVT_RENDERED, handler);
                    });
                }
            }
        }
    }

    protected dragged = (() => {
        let mainHeight = 0,
            subHeight = 0,
            mainWrapper,
            subWrapper,
            mouseDownHandler = null,
            mouseMoveHandler = null,
            mouseUpHandler = null;
        return {
            set subHeight(height: number){
                if(mainWrapper && subWrapper){
                    mainHeight = mainHeight + subHeight - height;
                    subHeight = height;
                    mainWrapper.style.height = mainHeight + 'px';
                    subWrapper.style.height = subHeight + 'px';
                }
            },
            on: () => {
                mainWrapper = this.main.wrapper;
                subWrapper = this.subWrapper;
                mainHeight = mainWrapper.offsetHeight;
                subHeight = subWrapper.offsetHeight;
                d.on(this.dragLine, 'mousedown', mouseDownHandler = (ev: MouseEvent) => {
                    d.off(document.body, 'mousemove', mouseMoveHandler);
                    d.off(document.body, 'mouseup', mouseUpHandler);
                    document.body.style.cursor = 'n-resize';
                    let disY = ev.clientY;
                    d.on(document.body, 'mousemove', mouseMoveHandler = (ev) => {
                        let translate = ev.clientY - disY;
                        if (mainHeight + translate > 0 && subHeight - translate > 0) {
                            disY = ev.clientY;
                            mainHeight += translate;
                            subHeight -= translate;
                            mainWrapper.style.height = mainHeight + 'px';
                            subWrapper.style.height = subHeight + 'px';
                        }
                    });
                    d.on(document.body, 'mouseup', mouseUpHandler = () => {
                        d.off(document.body, 'mousemove', mouseMoveHandler);
                        d.off(document.body, 'mouseup', mouseUpHandler);
                        document.body.style.removeProperty('cursor');
                    })
                })
            },
            off: () => {
                d.off(document.body, 'mousemove', mouseMoveHandler);
                d.off(document.body, 'mouseup', mouseUpHandler);
                d.off(this.dragLine, 'mousedown', mouseDownHandler);
            }
        }
    })();

    bwEl: IBW_Table;

    responsive() {
        let sub = this.sub[this.subTabActiveIndex],
            mainBox: InputBox = tools.keysVal(this.main, 'subBtns', 'box'),
            subBox: InputBox = tools.keysVal(sub, 'subBtns', 'box'),
            ftable = this.main.ftable;
        mainBox && mainBox.responsive();
        subBox && subBox.responsive();
        ftable.recountWidth();
        sub && sub.ftable && sub.ftable.recountWidth();
    }

    refresh(data?: obj) {
        let box = tools.keysVal(this.main, 'subBtns', 'box');
        box && box.responsive();
        // 刷新主表
        return this.main.refresh(data).then(() => {
            // 刷新子表
            let mftable = this.main.ftable;
            !(this.subIndex in mftable.rows) && (this.subIndex = 0);
            let row = mftable.rowGet(this.subIndex);
            row && this.subRefresh(row.data).then(() => {
                this.active.off();
                this.active.on();
            });
            this.subWrapper && this.subWrapper.classList.toggle('hide', !row);
            let sub = this.sub[this.subTabActiveIndex],
                subBox = tools.keysVal(sub, 'subBtns', 'box');
            subBox && subBox.responsive();

        });
    }

    protected initEdit(bwTable: BwTableModule){
        let time = 500;
        if((this.editType === 'self' && tools.isNotEmpty(bwTable.editParam)) ||
            (this.editType === 'linkage' && this.editable)){
            let editBtnData = [
                {
                    key: 'edit',
                    content: '编辑',
                    onClick: tools.pattern.throttling(() => {
                        this.editManage.start(bwTable);
                    }, time),
                    icon: 'app-bianji',
                    iconPre: 'appcommon'
                }, {
                    key: 'insert',
                    content: '新增',
                    onClick: tools.pattern.throttling(() => {
                        this.editManage.insert(bwTable);
                    }, time),
                    icon: 'app-xinzeng',
                    iconPre: 'appcommon'
                }, {
                    key: 'del',
                    content: '删除',
                    onClick: tools.pattern.throttling(() => {
                        if(this.active.isMain && this.bwEl.subTableList && this.bwEl.subTableList.length === 1){
                            let sub = this.sub[0];
                            if(sub && sub.ftable.data.length !== 0){
                                Modal.alert('不能删除有子表明细的数据');
                                return;
                            }
                        }
                        this.editManage.del(bwTable);
                    }, time),
                    icon: 'app-shanchu',
                    iconPre: 'appcommon'
                }, {
                    key: 'save',
                    content: '保存',
                    onClick: tools.pattern.throttling(() => {
                        this.editManage.save(bwTable);
                    }, time),
                    icon: 'app-baocun',
                    iconPre: 'appcommon'
                }, {
                    key: 'cancel',
                    content: '取消',
                    onClick: tools.pattern.throttling(() => {
                        this.editManage.end(bwTable);
                    }, time),
                    icon: 'app-quxiao',
                    iconPre: 'appcommon'
                }
            ];

            let box = new InputBox({
                container: bwTable.btnWrapper
            });
            d.classAdd(box.wrapper, 'pull-left edit-btns');
            editBtnData.forEach((btnData) => {
                box.addItem(new Button(btnData));
            });
            bwTable.modify.init(box);
        }

    }

    editManage = (() => {
        let editing = false;
        let editStatusToggle = (bwTable: BwTableModule, flag: boolean) => {
            if (flag) {
                editing = false;
                this.active.on();
                if(this.main.editParam){
                    this.main.modify.isCanEdit = flag;
                    this.main.modify.box.disabled = false;
                }
                this.tab && this.tab.panelContainer.classList.remove('disabled');
            } else {
                editing = true;
                switch (this.editType){
                    case 'self':
                        if (bwTable.modify.box !== this.main.modify.box) {
                            if(this.main.editParam){
                                this.main.modify.box.disabled = true;
                                this.main.modify.isCanEdit = flag;
                            }
                        } else {
                            this.tab && this.tab.panelContainer.classList.add('disabled');
                        }
                        break;
                    case 'linkage':
                        this.active.isMain
                            ? (this.tab && this.tab.panelContainer.classList.add('disabled'))
                            : (this.main.modify.isCanEdit = flag);
                        break;
                }
                this.active.off();
            }
        };

        let getTables = (bwTable: BwTableModule, isMain = true): BwTableModule[] => {
            let tables: BwTableModule[] = [];
            switch (this.editType){
                case 'self':
                    tables = [bwTable];
                    break;
                case 'linkage':
                    tables = isMain ? [this.main] : [...Object.values(this.sub)];
            }
            return tables;
        };

        let save = (bwTable: BwTableModule) => {
            let tables = getTables(bwTable, this.active.isMain),
                promises: Promise<obj>[] = [];
            tables.forEach((table) => {
                promises.push(table.modify.save());
            });
            return Promise.all(promises).then((data) => {
                let saveData = {
                    param: [] as obj[]
                };
                data.forEach((d) => {
                    if(tools.isNotEmpty(d)){
                        saveData.param.push(d);
                    }
                });
                if(tools.isEmpty(saveData.param)){
                    Modal.toast('没有数据改变');
                    end(bwTable);
                    return ;
                }

                let url;
                if(bwTable.ui.tableAddr){
                   url = bwTable.ui.tableAddr.dataAddr
                }
                if(this.bwEl.tableAddr){
                    url = this.bwEl.tableAddr.dataAddr;
                }
                if(url){
                    let loading = new Loading({
                        msg: '保存中',
                        disableEl: this.main.wrapper
                    });
                    BwRule.Ajax.fetch(CONF.siteUrl + url, {
                        type: 'POST',
                        data: saveData,
                    }).then(({response}) => {

                        BwRule.checkValue(response, saveData, () => {
                            this.currentSelectedIndexes = [];
                            // 主表子表刷新
                            this.refresh();
                            Modal.toast(response.msg);
                            // loading && loading.destroy();
                            // loading = null;
                            end(bwTable);
                            tools.event.fire(NewTableModule.EVT_EDIT_SAVE);
                        });
                    }).finally(() => {
                        loading && loading.destroy();
                        loading = null;
                    });
                }else{
                    Modal.alert('保存失败');
                }
            }).catch((e) => {
                console.log(e);
                e && e !== 'noMessage' && Modal.alert(e);
            })
        };

        let start = (bwTable: BwTableModule): Promise<any> => {
            editStatusToggle(bwTable, false);
            let tables = getTables(bwTable, this.active.isMain),
                promises: Promise<any>[] = [];
            tables.forEach((table) => {
                promises.push(table.modify.start());
            });
            return new Promise((resolve, reject) => {
                Promise.all(promises).then(() => resolve()).catch(() => reject());
            });
        };

        let end = (bwTable: BwTableModule) => {
            editStatusToggle(bwTable, true);
            let tables = getTables(bwTable, this.active.isMain);
            tables.forEach((table) => {
                table.modify.end();
            });
        };

        let insert = (bwTable: BwTableModule) => {
            editStatusToggle(bwTable, false);
            switch (this.editType){
                case 'self':
                    bwTable.modify.insert();
                    break;
                case 'linkage':
                    let main = this.main,
                        sub = this.sub[this.subTabActiveIndex],
                        table = this.active.isMain ? main : sub;
                    table && table.modify.insert();
            }
        };

        let del = (bwTable: BwTableModule) => {
            editStatusToggle(bwTable, false);
            switch (this.editType){
                case 'self':
                    bwTable.modify.delete();
                    break;
                case 'linkage':
                    let main = this.main,
                        sub = this.sub[this.subTabActiveIndex],
                        table = this.active.isMain ? main : sub;
                    table && table.modify.delete();
            }
        };

        return {
            get editing(){
                return editing
            },
            save,
            start,
            end,
            insert,
            del,
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
            get isMain() {
                return isMainActive;
            },
            set isMain(isMain: boolean) {
                isMainActive = isMain;
            },
            set onChange(hander: (iMain: boolean) => void) {
                onChange = hander;
            }
        }
    })();

    /*edit = (() => {
        let self = this,
            handlerName = '__EVT_VALID_CANCEL__',
            editName = '__EDIT__MODULE__',
            validList: Promise<any>[] = [];

        let tableEach = (fun: (tm: BwTableModule, index: number) => void) => {
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
                return Promise.resolve();
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
            let editModule = bwTable[editName] = new TableEditModule({
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
                            for (let key in data) {
                                let hCell = row.cellGet(key) as TableDataCell;
                                if (hCell && hCell !== cell) {
                                    let cellData = data[key];
                                    if (hCell.data != cellData) {
                                        hCell.data = cellData || '';
                                    }
                                }
                            }
                            if (field.elementType === 'lookup') {
                                let lookUpKeyField = field.lookUpKeyField,
                                    hCell = row.cellGet(lookUpKeyField);
                                if (hCell && hCell.column) {
                                    let hField = hCell.column.content as R_Field;
                                    hCell !== cell && (hCell.data = data[lookUpKeyField]);

                                    if (hField.assignSelectFields && hField.assignAddr) {
                                        NewTableModule.initAssignData(hField.assignAddr, row ? row.data : {})
                                            .then(({response}) => {

                                                let data = response.data;
                                                if (data && data[0]) {
                                                    hField.assignSelectFields.forEach((name) => {
                                                        let assignCell = row.cellGet(name) as TableDataCell;
                                                        if (assignCell) {
                                                            assignCell.data = data[0][name];
                                                        }
                                                    });
                                                    let rowData = row.data;
                                                    row.cells.forEach((dataCell) => {
                                                        if (dataCell !== cell) {
                                                            let column = dataCell.column,
                                                                field = column.content as R_Field;
                                                            if (field.elementType === 'lookup') {
                                                                if (!rowData[field.lookUpKeyField]) {
                                                                    dataCell.data = '';
                                                                } else {
                                                                    let options = bwTable.lookUpData[field.name] || [];
                                                                    for (let opt of options) {
                                                                        if (opt.value == rowData[field.lookUpKeyField]) {
                                                                            dataCell.data = opt.text;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            });
                                    }
                                }
                            }
                            // else if(Array.isArray(field.assignSelectFields)){
                            //     // 上传文件返回File_id，需要设置file_id值， 或者修改关联的assign的值
                            //     field.assignSelectFields.forEach((name) => {
                            //         let cell = row.cellGet(name) as TableDataCell;
                            //         if(cell){
                            //             cell.data = data[name] || '';
                            //         }
                            //     })
                            // }
                        }
                    }) : null;

                    // 设置默认值
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
            bwTable.ftable.off(FastTable.EVT_CELL_EDIT_CANCEL, bwTable[handlerName]);
            bwTable.ftable.on(FastTable.EVT_CELL_EDIT_CANCEL, bwTable[handlerName] = (cell: FastTableCell) => {
                validList.push(validate(editModule, cell));
            });
        };

        let validate = (editModule, cell: FastTableCell): Promise<any> => {
            return new Promise((resolve, reject) => {
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
                    resolve();
                    // callback(td, false);
                } else if (field.chkAddr && tools.isNotEmpty(rowData[name])) {
                    EditClass.checkValue(field, rowData, () => {
                        lookUpCell && (lookUpCell.data = null);
                        cell.data = null;
                    }, name)
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
                            });

                            resolve();
                        });
                } else {
                    cell.errorMsg = '';
                    resolve();
                    // callback(td, true);
                }
            }).then(() => cell.isChecked = true)
            // debugger;

        };

        let EditClass: typeof EditModule;

        let editModuleLoad = (): Promise<typeof EditModule> => {
            return new Promise((resolve) => {
                require(['EditModule'], (edit) => {
                    EditClass = edit.EditModule;
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
                if (i >= 1) {
                    // 带上当前主表的字段
                    let mainData = this.main.ftable.data[this.subIndex];
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

        let cellCheckValue = () => {
            return new Promise((resolve, reject) => {
                Promise.all([this.main, ...Object.values(this.sub)].map((bwTable) => {
                    return Promise.all(bwTable.ftable.editedCells.map((cell) => {
                        if(!cell.isChecked && !cell.isVirtual && cell.show){
                            return validate(bwTable[editName], cell);
                        }else{
                            return Promise.resolve();
                        }
                    }))
                })).then(() => {}).catch((e) => console.log(e)).finally(() => {
                    resolve()
                });
            })
        };

        let save = () => {
            return Promise.all([this.main, ...Object.values(this.sub)].map((bwTable) => {
                return bwTable[editName] ? bwTable[editName].assignPromise : Promise.resolve();
            })).then(() => {
                this.closeCellInput();
                let loading = new Loading({
                    msg: '验证中...',
                    disableEl: this.main.wrapper
                });
                setTimeout(() => {
                    Promise.all(validList).then(() => {
                    }).catch().finally(() => {
                        cellCheckValue().then(() => {}).finally(() => {
                            validList = [];
                            loading && loading.hide();
                            loading = null;
                            setTimeout(() => {
                                let saveData = editDataGet();
                                if (tools.isEmpty(saveData.param)) {
                                    Modal.toast('没有数据改变');
                                    cancel();
                                    this.editBtns.end();
                                    return
                                }
                                this.saveVerify.then(() => {
                                    let loading = new Loading({
                                        msg: '保存中',
                                        disableEl: this.main.wrapper
                                    });
                                    BwRule.Ajax.fetch(CONF.siteUrl + this.bwEl.tableAddr.dataAddr, {
                                        type: 'POST',
                                        data: saveData,
                                    }).then(({response}) => {

                                        BwRule.checkValue(response, saveData, () => {
                                            this.currentSelectedIndexes = [];
                                            // 主表子表刷新
                                            this.refresh();
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
                                }).catch();
                            }, 100);
                        })
                    })
                }, 100)

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

    protected closeCellInput() {
        let subFtable = this.sub[this.subTabActiveIndex] && this.sub[this.subTabActiveIndex].ftable,
            mainFtable = this.main.ftable;

        mainFtable && mainFtable.closeCellInput();
        subFtable && subFtable.closeCellInput();
    }

    get saveVerify() {
        return new Promise((resolve, reject) => {
            let isSave = this.main.ftable.isSave
                && (this.sub[this.subTabActiveIndex] ? this.sub[this.subTabActiveIndex].ftable.isSave : true);
            if (isSave) {
                resolve()
            } else {
                Modal.alert('您输入的内容有误，请更正后再保存。', '温馨提示', () => reject());
            }
        });
    }
    static initAssignData(assignAddr: R_ReqAddr, data: obj) {
        return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(assignAddr, data), {
            cache: true,
        })
    }*/

    destroy() {
        this.mobileModal && this.mobileModal.destroy();
        this.dragged.off();
        d.remove(this.dragLine);
        this.main && this.main.destroy();
        this.sub && Object.values(this.sub).forEach((subTable) => {
            subTable.destroy()
        });
        d.remove(this.subWrapper);
        this.subWrapper = null;
        this.main = null;
        this.sub = null;
        this.bwEl = null;
        // this._btnWrapper = null;
        this.tab = null;
    }
}

function getMainSubVarList(addr: IBW_TableAddr, subItemId?: string) {
    let varlist = {
        mainParam: null as IBW_TableAddrParam,
        subParam: null as IBW_TableAddrParam,
    };

    addr && Array.isArray(addr.param) && addr.param.forEach(p => {
        if (p.type === 'sub' && (tools.isEmpty(subItemId) || p.itemId === subItemId)) {
            varlist.subParam = p;
        } else if (p.type === 'main') {
            varlist.mainParam = p;
        }
    });

    return varlist;
}
