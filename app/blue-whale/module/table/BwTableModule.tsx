/// <amd-module name="BwTableModule"/>
import {BwRule} from "../../common/rule/BwRule";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import d = G.d;
import tools = G.tools;
import sys = BW.sys;
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import CONF = BW.CONF;
import {FastBtnTable, IFastBtnTablePara} from "../../../global/components/FastBtnTable/FastBtnTable";
import {ITableCol, TableBase} from "../../../global/components/newTable/base/TableBase";
import {InputBox} from "../../../global/components/general/inputBox/InputBox";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTableCell} from "../../../global/components/newTable/FastTableCell";
import {InventoryBtn, ontimeRefresh} from "./InventoryBtn";
import UploadModule from "../uploadModule/uploadModule";
import {Loading} from "../../../global/components/ui/loading/loading";
import {LayoutImage} from "../../../global/components/view/LayoutImg/LayoutImage";
import {NewTableModule} from "./newTableModule";
import Shell = G.Shell;
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {Inputs} from "../inputs/inputs";
import {FlowDesigner} from "../flowDesigner/FlowDesigner";
import {PasswdModal} from "../changePassword/passwdModal";

export interface IBwTableModulePara extends IComponentPara {
    ui: IBW_Table;
    tableModule?: NewTableModule;
    isSub?: boolean;
    ajaxData?: obj;
    editParam?: IBW_TableAddrParam;
}

interface IEditImgModuleUploadHandler {
    (md5s: objOf<string>): void;
}

export class BwTableModule extends Component {

    static EVT_READY = '__TABLE_READY__';  // 创建fastTable完成后的事件

    protected wrapperInit(para: IBwTableModulePara): HTMLElement {
        return <div className="table-module-wrapper"/>;
    }

    protected readonly isDrill: boolean;   // 是否钻取
    readonly isPivot: boolean;   // 是否是交叉表
    protected readonly hasQuery: boolean;  // 是否有查询器
    public ui: IBW_Table;                  // 表格UI JSON
    public readonly editParam: IBW_TableAddrParam; // 表格编辑的JSON
    private isRfid: boolean = false;       // 是否有rfid

    protected tableModule: NewTableModule;
    protected btnsLinkName: string[] = []; // 快捷按钮的字段名称

    protected ajax = new BwRule.Ajax();

    public ftable: FastBtnTable;

    public readonly isSub: boolean;        // 是否子表
    constructor(para: IBwTableModulePara) {
        super(para);

        this.isSub = !!para.isSub;
        this.editParam = para.editParam;
        this.tableModule = para.tableModule;

        BwRule.beforeHandle.table(para.ui); // 初始化UI, 设置一些默认值
        let ui = this.ui = para.ui;
        this.isPivot = ui.relateType === 'P';

        this.isDrill = ['web', 'webdrill', 'drill'].includes(ui.uiType); // 是否为钻取

        // 判断是否有rfid
        this.isRfid = tools.isNotEmpty(ui.rfidCols) ||
            (Array.isArray(ui.subButtons) && ui.subButtons.some((btn) => btn.openType.indexOf('rfid') >= 0));

        // 是否有查询器
        this.hasQuery = ui.querier && ([3, 13].includes(ui.querier.queryType)) || ui.noQuery;

        // 初始化fields
        this.fieldsInit(ui.cols);

        let subBtns = ui.subButtons;
        // 查出快捷按钮
        this.btnsLinkName = Array.isArray(subBtns) ? subBtns.filter(btn => btn.linkName).map(btn => btn.linkName) : [];

        // 异步查询参数(wbf)
        if (ui.isAsyn) {
            para.ajaxData = para.ajaxData || {};
            para.ajaxData['uiurl'] = this.pageUrl.substring(find(this.pageUrl, '/', 5), this.pageUrl.length);
        }

        function find(str, cha, num) {
            let x = str.indexOf(cha);
            for (let i = 0; i < num; i++) {
                x = str.indexOf(cha, x + 1);
            }
            return x;
        }

        if (this.isPivot) {
            // 交叉制表
            this.pivotInit(para.ajaxData);
        } else {
            // 正常表格
            this.ftableInit(para.ajaxData);
        }
    }

    private get baseFtablePara(): IFastBtnTablePara {
        // 基本配置
        return {
            isWrapLine: tools.isMb && (this.ui.cols ? this.ui.cols.some((col) => col.atrrs.displayWidth > 0) : false),
            tabIndex: true,
            cols: null,
            container: this.wrapper,
            pseudo: {
                type: 'number',
                multi: tools.isNotEmpty(this.ui.multiValue) ? this.ui.multiValue : tools.isMb // 多选单选,默认移动端多选,pc单选
            },
            sort: true,
            maxHeight: this.isDrill ? 400 : void 0,
            maxWidth: 200,
            dragSelect: tools.isPc,
            dragCol: !this.isPivot && tools.isPc,
            clickSelect: true,
            isResizeCol: tools.isPc,
            colCount: this.isDrill,
            btn: tools.isMb && this.isDrill ? {
                name: null,
                isReplaceTable: this.isDrill,
            } : {
                name: [this.isRfid ? null : 'search', 'statistic', 'export'],
                type: tools.isMb ? "dropdown" : "button",
                target: tools.isMb ? d.query('[data-target="popover"]>[data-action="down-menu"]') : void 0,
                isReplaceTable: this.isDrill,
            },
            cellFormat: (cellData, cell: FastTableCell) => {
                let col = cell.column,
                    rowData = this.ftable.tableData.rowDataGet(cell.row.index); // 行数据
                return col ? this.cellFormat(col.content, cellData, rowData) : {text: cellData};
            },
            rowFormat: (rowData: obj) => {
                let color = '',
                    bgColor = '',
                    attr = {};

                // 行背景和文字变色
                ['GRIDBACKCOLOR', 'GRIDFORECOLOR'].forEach((name, i) => {
                    let colorVal = rowData[name];
                    if (colorVal) {
                        // 显示颜色
                        let {r, g, b} = tools.val2RGB(colorVal),
                            colorStr = `rgb(${r},${g},${b})`;
                        if (i === 0) {
                            bgColor = colorStr
                        } else {
                            color = colorStr;
                        }
                    }
                });
                return {color, bgColor, attr};
            },
            page: this.ui.multPage === 0 ? null : {
                size: 50,
                options: [50, 100, 500],
            },
            menu: [this.isPivot ? null : {
                colMulti: 1,
                title: '锁定/解锁列',
                onClick: (cell) => {
                    let isFixed = cell.column.isFixed;
                    cell.column.isFixed = !isFixed;
                    Modal.toast(!isFixed ? '已锁定' : '已解锁');
                }
            }, {
                title: '复制单元格',
                onClick: (cell) => {
                    sys.window.copy(cell.text);
                }
            }, {
                title: '复制行',
                onClick: (cell, rows, columns) => {
                    let col = columns[0];
                    if (col) {
                        sys.window.copy(rows.map(row => row.cells.map(cell => cell.text).join("\t")).join("\r\n"));
                    }
                }
            }, {
                colMulti: 1,
                title: '复制列',
                onClick: (cell, rows, columns) => {
                    let col = columns[0];
                    if (col) {
                        let cells = [...col.cells[0], ...col.cells[1]].map(cell => cell.text).join("\r\n");
                        sys.window.copy(cells)
                    }
                }
            }, {
                rowMulti: 1,
                title: '列复制',
                children: this.cols.filter(col => !col.noShow).map(col => {
                    return {
                        title: col.title,
                        onClick: (cell: FastTableCell) => {
                            sys.window.copy(cell.frow.data[col.name]);
                        }
                    }
                })
            }, tools.isMb ? {
                title: '列排序',
                onClick: () => {
                    this.ftable.colsSort.open();
                }
            } : null]
        }
    }

    private addOldData(data: obj[]): obj[]{
        let res = data;
        if (data) {

            let editParam = this.editParam;
            if (editParam) {
                let varList = [];
                ['insert', 'update', 'delete'].forEach(type => {
                    let canOld = ['update', 'delete'].indexOf(editParam[`${type}Type`]) > -1,
                        typeVarList = editParam[type];

                    if (canOld && Array.isArray(typeVarList)) {
                        varList = varList.concat(typeVarList)
                    }
                });
                // 加上OLD变量
                BwRule.addOldField(BwRule.getOldField(varList), data);
            }
        }
        return res;
    }

    private ftableInit(ajaxData?: obj) {
        let ui = this.ui;
        this.ftable = new FastBtnTable(
            Object.assign(this.baseFtablePara, {
                exportTitle: this.ui.caption,
                cols: this.colParaGet(this._cols), // 把fields转为表格的参数
                ajax: {
                    ajaxData,
                    once: ui.multPage !== 1, // =1时后台分页, 0 不分页, 2,前台分页
                    auto: !this.hasQuery,    // 有查询器时不自动查询
                    fun: ({pageSize, current, sort, custom}) => {
                        let url = CONF.siteUrl + BwRule.reqAddr(ui.dataAddr);
                        pageSize = pageSize === -1 ? 3000 : pageSize;

                        let pagesortparams = Array.isArray(sort) ?
                            JSON.stringify(
                                sort.map(s => `${s[0]},${s[1].toLocaleLowerCase()}`)
                            ) : '';

                        return Promise.all([
                            // 获取表格数据
                            this.ajax.fetch(url, {
                                needGps: ui.dataAddr.needGps,
                                timeout: 30000,
                                data: Object.assign({
                                    pageparams: `{"index"=${current + 1},"size"=${pageSize},"total"=1}`,
                                    pagesortparams
                                }, custom)
                            }),
                            // 获取lookup数据
                            this.lookup
                        ]).then(([{response}]) => {
                            let {data, head} = response;
                            // 选项查询处理(wbf)
                            this.sectionField(response);
                            data = this.addOldData(data);
                            return {
                                data,
                                total: head ? head.totalNum : 0,
                            };
                        });
                    }
                }
            })
        );


        !this.isDrill && this.ftable.btnAdd('filter', {
            type: 'default',
            icon: 'sousuo',
            content: '本地过滤',
            onClick: () => {
                this.filter.init();
            },
        }, 1);

        (this.ui.rfidFlag == 1) && this.ftable.btnAdd('rfid', {
            type: 'default',
            content: 'rfid设置',
            onClick: () => {
                require(['RfidSetting'], function (RfidSetting) {
                    new RfidSetting.RfidSettingModal();
                });
            },
        });

        this.ftableReady();

        this.ftable.on(FastTable.EVT_TABLE_COL_CHANGE, (ev) => {
            if (tools.isNotEmpty(this.ui.settingId)) {
                BwRule.Ajax.fetch(`${CONF.siteAppVerUrl}/setting/${this.ui.settingId}`, {
                    type: 'put',
                    data2url: true,
                    data: {
                        columnorderparam: JSON.stringify(ev.data)
                    },
                }).then(() => {
                    Modal.toast('修改成功');
                }).catch((e) => {
                    Modal.toast('修改失败');
                })
            }
        })
    }

    protected isFtableReady;
    protected _ftableReadyHandler: Function;

    set onFtableReady(handler: Function) {
        if (this.isFtableReady) {
            tools.isFunction(handler) && handler()
        } else {
            this._ftableReadyHandler = handler;
        }
    }

    protected ftableReady() {
        this.clickInit(); // 初始化 点击事件

        // 查询聚合字段
        this.aggregate.get(this.ajaxData);

        // rfid初始化 (lyq)
        this.rfidColInit();
        this.reportCaptionInit();

        tools.isFunction(this._ftableReadyHandler) && this._ftableReadyHandler();
        this.isFtableReady = true;
        this.trigger(BwTableModule.EVT_READY);
    }

    private colParaGet(fields: R_Field[]): IFastTableCol[][] {
        let isAbsField = fields.some(col => tools.isNotEmpty(col.subcols)), // 是否有子列
            colsPara: IFastTableCol[][] = [[]],
            showCount = 0; // 显示字段个数统计

        fields.forEach((field) => {
            if (!field.noShow) {
                showCount++;
            }
            let subCols = field.subcols,
                hasSubCol = isAbsField && Array.isArray(subCols) && subCols[0];

            colsPara[0].push({
                title: field.caption,
                name: field.name,
                content: field,
                isFixed: showCount === 1, // 锁定第一个显示的字段
                isNumber: BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                isVirtual: field.noShow,
                colspan: hasSubCol ? subCols.length : 1, // 其他列有子列
                rowspan: isAbsField && !hasSubCol ? 2 : 1,
                maxWidth: field.atrrs && (field.atrrs.displayWidth ? field.atrrs.displayWidth * 6 : void 0),
                isCanSort: field.isCanSort // 是否可排序
            } as IFastTableCol);

            if (hasSubCol) {
                // 是否有子列
                colsPara[1] = colsPara[1] || [];
                subCols.forEach((subCol) => {
                    colsPara[1].push({
                        title: subCol.caption,
                        name: subCol.name,
                        content: subCol,
                        isVirtual: subCol.noShow,
                        colspan: 1,
                        rowspan: 1
                    })
                });
            }
        });
        return colsPara;
    }

    private pivotRefresh(ajaxData: obj = {}): Promise<any>{
        return new Promise((resolve, reject) => {
            let loading = new Loading({
                msg: '加载中...',
                container: this.container
            });
            this.ajax.fetch(CONF.siteUrl + BwRule.reqAddr(this.ui.dataAddr), {
                data: Object.assign({}, ajaxData, {pageparams: `{"index"=1,"size"=3000,"total"=1}`})  //设置初始分页条件
            }).then(({response}) => {
                resolve(response);
            }).catch((e) => {
                reject(e);
            }).finally(() => {
                loading.destroy();
                loading = null;
            });
        })

    }
    /**
     * 初始化交叉制表
     * @param ajaxData - 查询参数
     */
    private pivotInit(ajaxData: obj = {}) {
        /**
         * 把返回的数据与UI合并成交叉制表的列参数(具体规则要问下小路, 太久记不清了)
         * @param meta
         */
        let colsParaGet = (meta: string[]): obj[] => {

            let originCols = this._cols,
                fields: R_Field[] = BwRule.getCrossTableCols(meta, originCols).cols;

            let countFields = [], // 统计字段
                otherFields = []; // 其他字段

            fields.forEach(field => {
                let hasDot = ~field.title.indexOf('.');
                if ((hasDot && ~field.name.indexOf('小计')) || !hasDot) {
                    countFields.push(field);
                } else {
                    otherFields.push(field);
                }
            });

            // 将统计字段前置
            fields = [...countFields, ...otherFields];

            let colsPara: IFastTableCol[][] = [[], []],
                currentOriginField = {
                    name: '',
                    count: 1
                };
            fields.forEach((field, i) => {

                let [mainName, subName] = field.name.split('.'),
                    nextField = fields[i + 1] || {name: ''},
                    [nextMainName] = nextField.name.split('.');

                if (mainName !== nextMainName) {
                    let mainField = originCols.filter(col => col.name === mainName)[0];
                    // if(mainField) {

                    colsPara[0].push({
                        title: mainField ? mainField.caption : mainName,
                        name: mainField ? mainField.name : mainName,
                        isFixed: !colsPara[0],
                        colspan: subName ? currentOriginField.count : 1,
                        rowspan: subName ? 1 : 2,
                        content: subName ? void 0 : field,
                        isNumber: subName ? void 0 :
                            BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                        isVirtual: subName ? void 0 : field.noShow,
                        isCanSort: field.isCanSort
                    } as IFastTableCol);

                    currentOriginField = {
                        name: nextMainName,
                        count: 1
                    };
                } else {
                    currentOriginField.count++;
                }

                if (subName) {

                    colsPara[1].push({
                        title: field.caption,
                        name: field.name,
                        content: field,
                        isNumber: BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                        isVirtual: field.noShow,
                        colspan: 1,
                        rowspan: 1,
                        isCanSort: field.isCanSort
                    } as IFastTableCol);
                }

            });

            return colsPara;
        };

        // let isFirst = tableDom.classList.contains('mobileTable');
        return this.pivotRefresh(ajaxData).then((response) => {
            if (tools.isEmpty(response)) {
                return;
            }
            response.data = this.addOldData(response.data);
            this.ftable = new FastBtnTable(
                Object.assign(this.baseFtablePara, {
                    exportTitle: this.ui.caption,
                    cols: colsParaGet(response.meta),
                    data: response.data
                })
            );
            this.ftableReady();
        });
    }

    protected _sectionField: string; // 分组字段
    /**
     * 选项查询处理 (wbf)
     * @param response
     */
    sectionField(response: obj) {

        const sectionName = '分段';
        let meta = response.meta,
            ajaxData = this.ajaxData,
            optionsParam = ajaxData.queryoptionsparam && JSON.parse(ajaxData.queryoptionsparam);

        // 有分组字段是增加新的列
        if (optionsParam && optionsParam.sectionParams && optionsParam.sectionParams.sectionField) {
            let sectionField = optionsParam.sectionParams.sectionField,
                sectionTitle = '';

            // 防止重复添加
            if (sectionField !== this._sectionField) {
                for (let col of this.ui.cols) {
                    if (col.name === sectionField) {
                        sectionTitle = col.caption;
                    }
                }

                let title = sectionTitle + '段',
                    sec = this.ftable.columnGet(sectionName);
                if (sec) {
                    sec.title = title;
                } else {
                    this.ftable.columnAdd({
                        title: title,
                        name: sectionName,
                    }, void 0, 0);
                }
                // this.ftable.
                this._sectionField = sectionField;
            }
        } else {
            // 没有分段时删除分段字段
            this._sectionField && this.ftable.columnDel(sectionName);
            this._sectionField = '';
        }

        if (tools.isNotEmpty(response.data)) {
            // 隐藏无数据的字段, 但排除lookup字段
            this.ftable.columns.forEach(column => {
                let field = column.content || {};
                column.show = field.elementType === 'lookup' || meta.includes(column.name)
            })
        }
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    private get lookup(): Promise<void> {
        if (tools.isEmpty(this._lookUpData)) {
            let allPromise = this.cols.filter(col => col.elementType === 'lookup')
                .map(col => BwRule.getLookUpOpts(col).then((items) => {
                    // debugger;
                    this._lookUpData = this._lookUpData || {};
                    this._lookUpData[col.name] = items;
                }));

            return Promise.all(allPromise).then(() => {
            })
        } else {
            return Promise.resolve();
        }
    }

    protected tdClickHandler(field: R_Field, rowData: obj) {
        // 判断是否为link
        if (!field) {
            return;
        }
        let link = field.link;
        if (link && (field.endField ? rowData[field.endField] === 1 : true)) {
            BwRule.link({
                link: link.dataAddr,
                varList: link.varList,
                dataType: field.atrrs.dataType,
                data: rowData,
                needGps: link.needGps === 1,
                type: link.type
            });

            return;
        }

        // 是否为钻取
        let url = drillUrlGet(field, rowData, this.ui.keyField);
        if (url) {
            sys.window.open({url});
        }
    };

    protected clickInit() {
        let ftable = this.ftable,
            clickableSelector = '.section-inner-wrapper:not(.pseudo-table) tbody', // 可点击区域
            tdSelector = `${clickableSelector} td`,
            trSelector = `${clickableSelector} tr td:not(.cell-link)`,
            self = this;

        // 点击链接时
        ftable.click.add(`${tdSelector}:not(.cell-img)`, function (e: MouseEvent) {
            if (e.altKey || e.ctrlKey || e.shiftKey) {
                return;
            }

            let rowIndex = parseInt(this.parentNode.dataset.index),
                colName = this.dataset.name,
                field: R_Field = ftable.columnGet(colName).content,
                row = ftable.rowGet(rowIndex),
                rowData = row.data;

            if (field) {
                self.tdClickHandler(field, rowData);
            }
            // if (field.link && !colIsImg && (field.endField ? rowData[field.endField] === 1 : true)) {
        });

        // 点击显示图片， 判断是否存在缩略图
        let hasThumbnail = this.cols.some(col => {
            let dataType = col.atrrs && col.atrrs.dataType;
            return !col.noShow && [BwRule.DT_IMAGE, BwRule.DT_MUL_IMAGE].includes(dataType);
        });

        let imgHandler = function (e: MouseEvent, isTd = true) {
            if (e.altKey || e.ctrlKey || e.shiftKey) {
                return;
            }
            let td = d.closest(e.target as HTMLElement, 'td'),
                index = parseInt(td.parentElement.dataset.index),
                name = td.dataset.name;

            if (isTd && self.cols.some(col => col.name === name && col.atrrs.dataType === '22')) {
                self.multiImgEdit.show(name, index);
            } else {
                self.imgEdit.showImg(index);
            }
        };

        if (hasThumbnail) {
            d.on(ftable.wrapper, 'click', `${tdSelector}.cell-img:not(.disabled-cell)`, tools.pattern.throttling((e) => {
                imgHandler(e, true);
            }, 1000))
        } else {
            ftable.click.add(trSelector, tools.pattern.throttling((e) => {
                imgHandler(e, false);
            }, 1000));
        }

    }

    get ajaxData() {
        return this.ftable.tableData.ajaxData;
    }

    refresh(data?: obj) {
        if(this.isPivot){
            this.ftable && this.ftable.destroy();
            return this.pivotInit(data);
        }else{
            return this.ftable.tableData.refresh(data).then(() => {
                this.aggregate.get(data);
            });
        }

    }

    // protected fastTableInit

    protected pageContainer: HTMLElement;
    protected _pageUrl: string;
    get pageUrl() {
        if (!this._pageUrl) {
            if (sys.isMb) {
                this._pageUrl = location.href;
            } else {
                let pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
                this.pageContainer = pageContainer;
                this._pageUrl = pageContainer ? pageContainer.dataset.src : '';
            }
        }
        return this._pageUrl;
    }


    protected _rowDefData: obj;

    // 获取默认数据
    get rowDefData(): Promise<obj> {
        return new Promise((resolve, reject) => {
            if (tools.isNotEmpty(this._rowDefData)) {
                resolve(this._rowDefData);
            } else {
                let data = BwRule.getDefaultByFields(this.cols),
                    defAddrs = this.ui.defDataAddrList;

                if (tools.isNotEmpty(defAddrs)) {
                    Promise.all(defAddrs.map(url => {
                        return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(url))
                            .then(({response}) => {
                                data = Object.assign(data, response.data[0] || {})
                                // cb();
                            });
                    })).then(() => {
                        this._rowDefData = data;
                        resolve(data);
                    }).catch(() => {
                        reject()
                    })
                } else {
                    this._rowDefData = data;
                    resolve(data);
                }
            }
        })
    }

    protected _cols: R_Field[];

    protected fieldsInit(fields: R_Field[]) {

        this._cols = fields.map(col => {
            let newCol = Object.assign({}, col);

            // 判断是否有默认不显示的字段(文字颜色, 背景颜色)
            if (BwRule.NoShowFields.includes(newCol.name)) {
                newCol.noShow = true;
            }

            let attrs = newCol.atrrs;
            // 时间类型加上默认的显示格式
            if (attrs) {
                if (attrs.dataType === BwRule.DT_DATETIME && !attrs.displayFormat) {
                    attrs.displayFormat = 'yyyy-MM-dd HH:mm:ss';
                }

                if (attrs.dataType === BwRule.DT_TIME && !attrs.displayFormat) {
                    attrs.displayFormat = 'HH:mm:ss';
                }
            }

            return newCol;
        });
    }

    get cols() {
        let cols = [];
        this._cols.forEach((col) => {
            getCols(col);
        });
        return cols;

        function getCols(col: R_Field) {
            if (tools.isEmpty(col.subcols)) {
                cols.push(col);
            } else {
                col.subcols.forEach((subcol) => {
                    getCols(subcol as R_Field)
                });
            }
        }

    }

    public aggregate = (() => {
        let aggrWrap: HTMLElement = null,
            urlData: obj = null;

        /**
         * 初始化
         * @return {boolean} - 初始成功或者失败
         */
        let init = () => {
            if (!Array.isArray(this.ui.aggrList) || !this.ui.aggrList[0]) {
                return false;
            }
            aggrWrap = <div className="aggr-wrapper"/>;
            d.before(this.ftable.wrapper, aggrWrap);
            return true;
        };

        let get = (data?: obj) => {
            if (aggrWrap === null && !init()) {
                return; // 初始化失败
            }

            if (data) {
                urlData = data
            }

            aggrWrap.innerHTML = '';
            this.ui.aggrList.forEach(aggr => {
                let valSpan = <span>{aggr.caption}:</span>;
                d.append(aggrWrap, valSpan);
                BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(aggr.dataAddr, urlData))
                    .then(({response}) => {
                        let value = tools.keysVal(response, 'data', 0, tools.keysVal(response, 'meta', 0));
                        valSpan.innerHTML = `${aggr.caption}:${value || 0} &nbsp;&nbsp;`;
                    });
            });
        };

        return {get};
    })();

    protected filter = (() => {
        let modal: Modal = null,
            builder = null;

        let searchHandler = () => {
            let searchData = builder.dataGet();
            this.ftable.filter.set(searchData.params);
            modal.isShow = false;
        };

        let showOriginTable = () => {
            this.ftable.filter.clear();
        };

        let init = () => {
            if (builder === null) {
                let body = tools.isMb ?
                    <div className="mui-content">
                        <ul className="mui-table-view" data-query-name="local"/>
                        <div data-action="add" data-name="local" className="mui-btn mui-btn-block mui-btn-primary">
                            <span className="mui-icon mui-icon-plusempty"/> 添加条件
                        </div>
                    </div>
                    :
                    <div className="filter-form" data-query-name="local">
                        <span data-action="add" className="iconfont blue icon-jiahao"/>
                    </div>;

                modal = new Modal({
                    container: d.closest(this.wrapper, '.page-container'),
                    header: '本地过滤',
                    body: body,
                    position: tools.isMb ? 'full' : '',
                    width: '730px',
                    isShow: true,
                    className: 'local',
                    zIndex: 1003,
                });
                modal.className = 'queryBuilder';
                // modal.wrapper.style.zIndex = '1002';
                if (tools.isMb) {

                    modal.modalHeader.rightPanel = (() => {
                        let rightInputBox = new InputBox(),
                            clearBtn = new Button({
                                content: '清除',
                                onClick: () => {
                                    showOriginTable();
                                    modal.isShow = false;
                                }
                            }),
                            saveBtn = new Button({
                                icon: 'sousuo',
                                onClick: searchHandler
                            });
                        rightInputBox.addItem(clearBtn);
                        rightInputBox.addItem(saveBtn);
                        return rightInputBox;
                    })();

                    d.on(body, 'click', '[data-action="add"]', function () {
                        builder.rowAdd();

                        let ul = (this as HTMLElement).previousElementSibling;
                        ul.scrollTop = ul.scrollHeight;

                    });
                } else {
                    modal.footer = {
                        rightPanel: (() => {
                            let rightBox = new InputBox();
                            rightBox.addItem(new Button({
                                content: '取消',
                                type: 'default',
                                key: 'cancelBtn',
                                onClick: () => {
                                    modal.isShow = false;
                                }
                            }));
                            rightBox.addItem(new Button({
                                content: '清除',
                                type: 'default',
                                key: 'clearBtn',
                                onClick: () => {
                                    showOriginTable();
                                    modal.isShow = false;
                                }
                            }));
                            rightBox.addItem(new Button({
                                content: '查询',
                                type: 'primary',
                                onClick: searchHandler,
                                key: 'queryBtn'
                            }));

                            return rightBox;
                        })()
                    }
                }
                let queryCols = this.ui.querier.queryparams0 || this.ui.querier.queryparams1
                    || this.ui.querier.atvarparams || initQueryConfigs(getCols());
                require(['QueryBuilder'], (QueryBuilder) => {
                    builder = new QueryBuilder.QueryBuilder({
                        queryConfigs: queryCols, // 查询字段名、值等一些配置，后台数据直接传入
                        resultDom: tools.isMb ? d.query('ul.mui-table-view', body) : body, // 查询条件容器
                        setting: null  // 默认值
                    });
                });

            } else {
                modal && (modal.isShow = true);
            }
        };

        let getCols = () => {
            let cols = [];
            this.ftable && this.ftable.columns.forEach((col) => {
                if(col && col.show && !col.isVirtual){
                    cols.push({
                        name: col.name,
                        title: col.title,
                        isNumber: col.isNumber,
                        content: col.content,
                    })
                }

            });
            return cols;
        };

        function initQueryConfigs(cols: ITableCol[]): QueryConf[] {
            return cols.map(col => {
                return {
                    caption: col.title,
                    field_name: col.name,
                    dynamic: 0,
                    link: '',
                    type: '',
                    atrrs: col.content
                }
            });
        }

        return {
            init
        }
    })();

    private reportCaptionInit() {
        let reportCaption = this.ui.reportTitle;
        if (!reportCaption) {
            return;
        }
        d.prepend(this.wrapper, <div className="table-module-report">{reportCaption}</div>);
    }

    private countElements: objOf<HTMLElement> = {};
    private OLD_DIFFAMOUNT: number = 0;

//根据列头实时更新方法
    public rfidColthead() {

        let rfidCols = this.ui.rfidCols;
        if (rfidCols.calc) {
            //调用接口 传rfid.amount
            let calcCols = rfidCols.calc.cols || {},
                when = rfidCols.calc.when || {},
                countElements = this.countElements,
                {calculate, calculateScan, calculateDiff, calculateAdd} = calcCols,
                calcRule = rfidCols.calc.calcRule || [],
                calculateEl = countElements[calculate],
                calculateScanEL = countElements[calculateScan],
                calculateDiffEl = countElements[calculateDiff],
                calculateAddEl = countElements[calculateAdd],
                checkMount = 0;
            Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val) => {
                let cols = rfidCols.calc.cols || {};
                if (cols.calculateAdd) {
                    let content = rfidCols.calc.cols.calculateAdd;
                    if (val.calcField == content) {
                        checkMount = parseInt(val.calcValue);
                    }
                }

            });
            Shell.inventory.columnCountOn(when, 1, rfidCols.inventoryKey, false, false, (res) => {

                let resData = typeof res.data !== 'object' ? {} : res.data || {};
                //  ['Calculate', 'CalculateScan', 'CalculateDiff'].forEach(key => {
                //    if(typeof resData[key] !== 'number'){
                //      resData[key] = 0;
                //}
                // });

                if (calculateEl && resData.Calculate !== "-1") {
                    calculateEl.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);

                }
                if (calculateScanEL && resData.CalculateScan !== "-1") {

                    calculateScanEL.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                }
                if (calculateDiffEl && resData.CalculateDiff !== "-1") {
                    calculateDiffEl.innerHTML = "-" + ((resData.CalculateDiff === undefined) ? "0" : resData.CalculateDiff);
                }

                if (calculateAddEl && resData.CalculateAdd !== "-1") {

                    let num = checkMount + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                    calculateAddEl.innerHTML = isNaN(num) ? '-' : num + '';
                    //this.countAddInit = num;
                }

                let colHeadStr = {};
                for (let name in countElements) {
                    colHeadStr[name] = countElements[name].innerHTML;
                }
                if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan == "-1") {
                    colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                }
                colHeadStr['OLD_DIFFAMOUNT'] = this.OLD_DIFFAMOUNT;

                if (rfidCols.scanField) {
                    colHeadStr[rfidCols.scanField.toUpperCase()] = countElements['scanyet'].innerHTML;
                }

                calcRule.forEach(calc => {
                    let {field, rule} = calc;
                    if (field && rule) {
                        let diffValue = tools.str.parseTpl(rule, colHeadStr),
                            el = countElements[field];
                        el && (el.innerHTML = tools.calc(diffValue));
                    }
                });

            })
        }
    }

//下载更新后列统计
    public rfidDownAndUpInitHead() {
        let rfidCols = this.ui.rfidCols;

        //Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val)=>{

        //  this.countElements[val.calcField].innerHTML = val.calcValue;
        //})

        if (rfidCols.calc) {
            //调用接口 传rfid.amount
            let calcCols = rfidCols.calc.cols || {},
                when = rfidCols.calc.when || {},
                countElements = this.countElements,
                {calculate, calculateScan, calculateDiff, calculateAdd} = calcCols,
                calcRule = rfidCols.calc.calcRule || [],
                calculateEl = countElements[calculate],
                calculateScanEL = countElements[calculateScan],
                calculateDiffEl = countElements[calculateDiff],
                calculateAddEl = countElements[calculateAdd],
                checkMount = 0;

            Shell.inventory.columnCountOn(when, 1, rfidCols.inventoryKey, true, false, (res) => {
                let resData = typeof res.data !== 'object' ? {} : res.data || {};

                Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val) => {
                    let cols = rfidCols.calc.cols || {};
                    if (cols.calculateAdd) {
                        let content = rfidCols.calc.cols.calculateAdd;
                        if (val.calcField == content) {
                            checkMount = parseInt(val.calcValue);
                        }
                    }
                });
                if (calculateEl && resData.Calculate !== "-1") {
                    calculateEl.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);
                }
                if (calculateScanEL && resData.CalculateScan !== "-1") {
                    calculateScanEL.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                }
                if (calculateDiffEl && resData.CalculateDiff !== "-1") {
                    calculateDiffEl.innerHTML = "-" + (resData.CalculateDiff === undefined ? "0" : resData.CalculateDiff);
                }
                if (calculateAddEl && resData.CalculateAdd !== "-1") {
                    let num = checkMount + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                    calculateAddEl.innerHTML = num + "";

                }

                let colHeadStr = {};
                for (let name in countElements) {
                    colHeadStr[name] = countElements[name].innerHTML;
                }

                if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan !== "-1") {
                    colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                }
                colHeadStr['OLD_DIFFAMOUNT'] = this.OLD_DIFFAMOUNT;
                if (rfidCols.scanField) {
                    colHeadStr[rfidCols.scanField.toUpperCase()] = countElements['scanyet'].innerHTML;
                }
                calcRule.forEach(calc => {
                    let {field, rule} = calc;
                    if (field && rule) {
                        let diffValue = tools.str.parseTpl(rule, colHeadStr),
                            el = countElements[field];

                        el && (el.innerHTML = tools.calc(diffValue));
                    }
                });

                Shell.inventory.columnCountOff({}, 1, rfidCols.inventoryKey, (res) => {
                })
            })
        }

    }

    public rfidColInit() {
        let rfidCols = this.ui.rfidCols,
            ftable = this.ftable,
            fields = this.ui.cols,
            colfield: obj[];
        if (!tools.os.android || !this.isRfid || !rfidCols || !rfidCols.amountFlag) {
            return
        }
        //初始化按钮
        this.ui.subButtons && this.ui.subButtons.forEach((val, index) => {
            if (val.openType === "rfid_down") {
                val.title = val.title + "下载";
            } else if (val.openType === "rfid_up") {
                val.title = val.title + "上传";
            }
        })
        // 判断是否是盘点页面 有未上传数据
        if (Shell.inventory.canRfid && this.isRfid && this.ui.subButtons.some(val => val.openType === 'rfid_begin')) {
            (sys.window as any).closeConfirm = {
                condition: () => {
                    // 李森
                    return new Promise((resolve, reject) => {
                        Shell.inventory.columnCountOn(rfidCols.calc.when, 1, rfidCols.inventoryKey, true, true, (res) => {

                            resolve(!!(res.data && res.data.CalculateAdd && res.data.CalculateAdd > 0))
                        })
                    })
                },
                msg: '有未上传的数据, 是否确认要退出？',
                btn: ['确定', '取消']
            }

        }
        let wrapper = <div className="table-module-amount">{

            Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val) => {
                if (val.calcField == 'DIFFAMOUNT') {
                    this.OLD_DIFFAMOUNT = parseInt(val.calcValue);
                }
                let el = <span>{!val.calcValue ? 0 : val.calcValue}</span>;
                this.countElements[val.calcField] = el;
                return <span>{val.calcCaption}:{el}</span>
            })

        }
        </div>;
        if (rfidCols.scanFieldName) {
            let scan = <span>0</span>;
            this.countElements['scanyet'] = scan;
            let el = <span>已扫描量:{scan}</span>;
            d.append(wrapper, el);
            if (rfidCols.amount) {
                Shell.inventory.getScanCount(rfidCols.amount.toUpperCase(), (res) => {
                    this.countElements['scanyet'].innerHTML = res.data.SCANAMOUNTS || '0';
                })
            }
        }

        //监听渲染
        ftable.on(FastTable.EVT_RENDERED, () => {
            let subBtn = this.ui.subButtons;
            //if (Array.isArray(subBtn) && subBtn.some(btn => btn.openType === 'rfid_begin')) {

            if (rfidCols.inventoryKey && rfidCols.classify) {
                let column = ftable.columnGet(rfidCols.classify.toUpperCase());
                Shell.inventory.getData(rfidCols.inventoryKey, rfidCols.classify.toUpperCase(), (res) => {
                    let resData = res.data,
                        initColData = column.data.map(cell => {
                            let count = 0;
                            for (let data of resData) {
                                if (data.field == cell) {
                                    count = data.count;
                                    break;
                                }
                            }
                            return {
                                field: cell,
                                count: count
                            }
                        });
                    ontimeRefresh(initColData, this, rfidCols);

                })
            }

            //}

        });

        d.classAdd(this.wrapper, 'has-amount');
        if (rfidCols.calcData) {
            d.prepend(this.wrapper, wrapper);
        }
        if (tools.isNotEmpty(rfidCols.calc)) {
            //调用接口 传rfid.amount
            let calcCols = rfidCols.calc.cols || {},
                when = rfidCols.calc.when || {},
                countElements = this.countElements,
                {calculate, calculateScan, calculateDiff, calculateAdd} = calcCols,
                calcRule = rfidCols.calc.calcRule || [],
                calculateEl = countElements[calculate],
                calculateScanEL = countElements[calculateScan],
                calculateDiffEl = countElements[calculateDiff],
                calculateAddEl = countElements[calculateAdd],
                checkMount = 0;

            Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val) => {
                let cols = rfidCols.calc.cols || {};
                if (cols.calculateAdd) {
                    let content = rfidCols.calc.cols.calculateAdd;
                    if (val.calcField == content) {
                        checkMount = parseInt(val.calcValue);
                    }
                }
            });
            let inventory = rfidCols.inventoryKey ? rfidCols.inventoryKey : "key";
            if (tools.isNotEmpty(rfidCols.calc)) {
                Shell.inventory.columnCountOn(when, 1, inventory, true, false, (res) => {
                    let resData = typeof res.data !== 'object' ? {} : res.data || {};

                    if (tools.isEmpty(resData)) {
                        Shell.inventory.columnCountOff({}, 1, inventory, () => {
                        });
                        return;

                    }
                    if (calculateEl && resData.Calculate !== "-1") {
                        calculateEl.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);
                    }
                    if (calculateScanEL && resData.CalculateScan !== "-1") {

                        calculateScanEL.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                    }
                    if (calculateDiffEl && resData.CalculateDiff !== "-1") {
                        calculateDiffEl.innerHTML = "-" + (resData.CalculateDiff === undefined ? "0" : resData.CalculateDiff);
                    }

                    if (calculateAddEl && resData.CalculateAdd !== "-1") {
                        let num = checkMount + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                        calculateAddEl.innerHTML = isNaN(num) ? '-' : num + '';
                    }

                    let colHeadStr = {};
                    for (let name in countElements) {
                        colHeadStr[name] = countElements[name].innerHTML;
                    }
                    if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan !== "-1") {
                        colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                    }
                    colHeadStr['OLD_DIFFAMOUNT'] = this.OLD_DIFFAMOUNT;

                    calcRule.forEach(calc => {
                        let {field, rule} = calc;
                        if (field && rule) {
                            let diffValue = tools.str.parseTpl(rule, colHeadStr),
                                el = countElements[field];
                            el && (el.innerHTML = tools.calc(diffValue));
                        }
                    });

                    Shell.inventory.columnCountOff(when, 1, inventory, (res) => {
                    })
                })
            }

        }

    }

    /**
     * 格式化单元格数据
     * @param field - 列字段
     * @param cellData - 单元格数据
     * @param rowData - 行数据
     */
    private cellFormat(field: R_Field, cellData: any, rowData: obj) {
        let text: string | Node = cellData, // 文字 或 Node
            color: string,                  // 文字颜色
            bgColor: string,                // 背景颜色
            classes: string[] = [];         // 类名
        if (field && !field.noShow && field.atrrs) {
            let dataType = field.atrrs.dataType,
                isImg = dataType === BwRule.DT_IMAGE;

            if (isImg && field.link) {
                // 缩略图
                let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, rowData), this.ajaxData);
                text = <img src={url}/>;
                classes.push('cell-img');

            } else if (dataType === BwRule.DT_MUL_IMAGE) {
                // 多图缩略图
                if (typeof cellData === 'string' && cellData[0]) {
                    // url生成
                    let urls = cellData.split(',')
                        .map(md5 => BwRule.fileUrlGet(md5, field.name, true))
                        .filter(url => url);

                    // 多图缩略图控件
                    if (tools.isNotEmptyArray(urls)) {
                        text = new LayoutImage({urls}).wrapper;
                    }
                }

                classes.push('cell-img');

            } else if (dataType === '50') {
                // 打钩打叉
                text = <div
                    className={`appcommon ${cellData === 1 ? 'app-xuanzhong' : 'app-guanbi1'}`}
                    style={`color: ${cellData === 1 ? 'green' : 'red'}`}>
                </div>;

            } else if (field.name === 'STDCOLORVALUE') {
                // 显示颜色
                let {r, g, b} = tools.val2RGB(cellData);
                text = <div style={`backgroundColor: rgb(${r},${g},${b})`} height="100%"></div>;

            } else if (field.elementType === 'lookup') {
                // lookUp替换
                let options = this.lookUpData[field.name] || [];
                for (let opt of options) {
                    if (opt.value == rowData[field.lookUpKeyField]) {
                        text = opt.text;
                    }
                }
            } else {
                // 其他文字(金额,百分比,数字 等)
                text = BwRule.formatTableText(cellData, field);
            }

            // 时间
            if (cellData && BwRule.isTime(dataType)) {
                text = BwRule.strDateFormat(cellData, field.atrrs.displayFormat);
            }

            // 数字默认右对齐
            if (BwRule.isNumber(dataType)) {
                classes.push('text-right');
            }

            // 可点击单元格样式
            ['drillAddr', 'webDrillAddr', 'webDrillAddrWithNull'].forEach((addr, i) => {
                // debugger;
                let reqAddr: R_ReqAddr = field[addr],
                    keyFieldData = rowData[this.ui.keyField];
                if (reqAddr && reqAddr.dataAddr) {
                    if (i === 2 ? tools.isEmpty(keyFieldData) : tools.isNotEmpty(keyFieldData)) {
                        color = 'blue';
                        classes.push("cell-link");
                    }
                }
            });

            // 可点击单元格样式
            if (field.link && !isImg && (field.endField ? rowData[field.endField] === 1 : true)) {
                color = 'blue';
                classes.push("cell-link");
            }

            if (this.btnsLinkName.includes(field.name)) {
                classes.push("cell-link");
                color = 'blue';
            }

        }

        return {text, classes, bgColor, color};

    }

    // 多图查看与编辑
    protected multiImgEdit = (() => {
        let modal: Modal = null;

        let imgCreate = (url: string, md5: string, isClose: boolean = true) => {
            return <div className="img">
                {isClose ? <div className="appcommon app-guanbi1 img-close" data-md5={md5}/> : ''}
                <img src={url}/>
            </div>
        };

        let show = (fieldName: string, rowIndex: number) => {
            let field = this.cols.filter(col => col.name === fieldName)[0],
                ftable = this.ftable,
                row = ftable.rowGet(rowIndex),
                column = ftable.columnGet(fieldName),
                rowData = ftable.tableData.rowDataGet(rowIndex),
                md5Arr: string[] = [],
                md5str = rowData[fieldName],
                editParam = this.editParam,
                upVarList: R_VarList[] = editParam && editParam[editParam.updateType] || [],
                updatable = upVarList.some(v => fieldName === v.varName),
                handler = null,
                uploadModule: UploadModule;

            if (md5str && typeof md5str === 'string') {
                md5Arr = md5str.split(',');
            }
            if (field.atrrs && field.atrrs.dataType !== '22') {
                return;
            }
            if (!(tools.isNotEmpty(md5Arr) || (tools.isEmpty(md5Arr) && updatable))) {
                return
            }
            let isInsert = row ?
                ftable.edit.addIndex.get().indexOf(row.data[TableBase.GUID_INDEX]) > -1 : false;

            let rowCanEdit = this.tableModule.edit.rowCanInit(row, this.isSub),
                cellCanEdit = this.tableModule.edit.cellCanInit(column, isInsert ? 1 : 0);

            updatable = updatable && rowCanEdit && cellCanEdit;

            let btnWrapper: HTMLElement = null,
                imgWrapper: HTMLElement = null,
                wrapper = <div className="table-img-wrapper">
                    {btnWrapper = <div className="table-img-wrapper-btns"/>}
                    {imgWrapper = <div className="table-img">
                        {md5Arr.map(md5 => imgCreate(BwRule.fileUrlGet(md5, fieldName), md5, updatable))}
                    </div>}
                </div>;

            modal = new Modal({
                header: '图片查看',
                top: 80,
                body: wrapper,
                height: '80%',
                width: tools.isMb ? void 0 : '70%',
                position: 'down',
                isDrag: true,
                isOnceDestroy: true,
                className: 'modal-img',
                onClose: () => {
                    d.off(wrapper, 'click', '.img .img-close', handler);
                    uploadModule && uploadModule.destroy();
                }
            });

            let onUploaded = (md5Data: string[]) => {
                let tableModule = this.tableModule;
                if (tableModule) {
                    (this.ftable.editing ? Promise.resolve() : tableModule.editBtns.start())
                        .then(() => {
                            let row = this.ftable.rowGet(rowIndex);
                            if (row) {
                                row.data = Object.assign(row.data, {
                                    [fieldName]: md5Data.join(',')
                                })
                            }
                        });
                }
            };
            if (updatable) {
                let imgContainer = <div className="table-img-uploader"/>;
                d.append(btnWrapper, imgContainer);
                uploadModule = new UploadModule({
                    nameField: fieldName,
                    // thumbField: thumbField,
                    container: imgContainer,
                    text: '添加图片',
                    accept: {
                        title: '图片'
                        , extensions: 'jpg,png,gif'
                        , mimeTypes: 'image/*'
                    },
                    uploadUrl: CONF.ajaxUrl.fileUpload,
                    showNameOnComplete: false,
                    onComplete: (response, file) => {
                        let data = response.data,
                            newMd5s = [];

                        for (let fieldKey in data) {
                            newMd5s.unshift(data[fieldKey].value)
                        }

                        md5Arr = newMd5s.concat(md5Arr);

                        newMd5s.forEach(md5 => {
                            d.prepend(imgWrapper, imgCreate(BwRule.fileUrlGet(md5, fieldName), md5, updatable));
                        });
                        onUploaded(md5Arr);
                    }
                });

                d.on(wrapper, 'click', '.img .img-close', handler = function () {
                    let delMd5 = this.dataset.md5;
                    md5Arr = md5Arr.filter(md5 => md5 !== delMd5);
                    d.remove(this.parentElement);
                    onUploaded(md5Arr);
                });
            }


        };

        return {show};
    })();

    // 单图查看与编辑
    protected imgEdit = (() => {
        // private pictures: string[];
        let fields: R_Field[] = [],
            thumbField: string,
            deletable: boolean,
            updatable: boolean,
            onUploaded: IEditImgModuleUploadHandler,
            onSave: Function,
            imgs: HTMLImageElement[] = [],
            modal: Modal = null,
            currentRowIndex = -1;


        let init = () => {
            this.cols.forEach(col => {
                if (col.atrrs && col.atrrs.dataType === '20') {
                    if (col.noShow) {
                        fields.push(col);
                    } else {
                        thumbField = col.name;
                    }
                }
            });

            let editParam = this.editParam,
                fieldsName = fields.map(f => f.name),
                delVarList: R_VarList[] = editParam && editParam[editParam.deleteType] || [],
                upVarList: R_VarList[] = editParam && editParam[editParam.updateType] || [];


            deletable = delVarList.some(v => fieldsName.includes(v.varName));
            updatable = upVarList.some(v => fieldsName.includes(v.varName));
            onUploaded = (md5Data: obj) => {
                this.tableModule && this.tableModule.editBtns.start().then(() => {
                    let row = this.ftable.rowGet(currentRowIndex);
                    row.data = Object.assign(row.data, md5Data);
                });
            };

            onSave = () => {
                // this.editBtns && this.editBtns.btnSave();
            };
            modalInit();
        };


        let modalInit = () => {

            let doc = document.createDocumentFragment();

            fields.forEach((field, i) => {
                // let pic = this.pictures[i];
                d.append(doc, imgWrapperGet(field, i));
            });

            imgs = d.queryAll('img', doc) as HTMLImageElement[];

            modal = new Modal({
                header: '图片查看',
                top: 80,
                body: doc,
                height: '70%',
                position: 'down',
            });
        };

        let imgWrapperGet = (field: R_Field, imgIndex: number) => {
            let nameField = field.name,
                wrapper = <div className="table-img-wrapper" data-field={nameField}>
                    <div className="table-img-wrapper-btns"/>
                    <div className="table-img">
                        <img data-index={imgIndex} style="max-height:500px;max-width:700px"/>
                    </div>
                </div>;

            if (!updatable && !deletable) {
                return wrapper;
            }

            let btnWrapper = d.query('.table-img-wrapper-btns', wrapper),
                img = d.query('img', wrapper) as HTMLImageElement;
            if (updatable) {
                let imgContainer = <div className="table-img-uploader"></div>;
                d.append(btnWrapper, imgContainer);
                new UploadModule({
                    nameField,
                    thumbField: thumbField,
                    container: imgContainer,
                    text: '选择图片',
                    accept: {
                        title: '图片'
                        , extensions: 'jpg,png,gif'
                        , mimeTypes: 'image/*'
                    },
                    uploadUrl: CONF.ajaxUrl.fileUpload,
                    showNameOnComplete: false,
                    onComplete: (response, file) => {
                        let data = response.data,
                            md5Data = {};
                        for (let fieldKey in data) {
                            md5Data[data[fieldKey].key] = data[fieldKey].value;
                        }
                        img.src = imgUrlCreate(md5Data[nameField]);

                        tools.isFunction(onUploaded) && onUploaded(md5Data);

                        // saveBtn.isDisabled = false;
                    }
                });
            }

            if (deletable) {
                new Button({
                    content: '删除图片',
                    container: btnWrapper,
                    onClick: () => {
                        // this.md5s[nameField] = '';
                        img.src = '';
                        tools.isFunction(onUploaded) && onUploaded({[nameField]: ''});
                    }
                });
            }

            // let saveBtn = new Button({
            //     content: '保存图片',
            //     container: btnWrapper,
            //     isDisabled: true,
            //     onClick: () => {
            //         // debugger;
            //         tools.isFunction(this.onSave) && this.onSave();
            //         saveBtn.isDisabled = true;
            //     }
            // });


            return wrapper;
        };

        let imgUrlCreate = (md5: string) => {
            return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                // name_field: nameField,
                md5_field: 'FILE_ID',
                file_id: md5,
                // [nameField]: fileName,
                down: 'allow'

            });
        };

        let showImg = (rowIndex: number) => {

            let picAddrList = this.ui.pictureAddrList;

            if (tools.isNotEmptyArray(picAddrList)) {

                if (!modal) {
                    init();
                }

                let rowData = this.ftable.tableData.rowDataGet(rowIndex),
                    md5s: string[] = [];

                fields.forEach(field => {
                    md5s.push(rowData[field.name]);
                });

                let imgsUrl = picAddrList.map(addr =>
                    tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(addr, rowData), this.ajaxData)
                );
                // this.tableImgEdit.indexSet(rowIndex, urls);
                // debugger;
                imgs.forEach((img, i) => {
                    img.src = md5s[i] ? imgUrlCreate(md5s[i]) : imgsUrl[i];
                    // img.src = md5s[i] ? this.imgUrlCreate(md5s[i]) : tools.url.addObj(urls[i], {'_': Date.now()});
                })
            }
            currentRowIndex = rowIndex;
            modal && (modal.isShow = true);
        };

        return {
            showImg,
            destroy: () => {
                modal && modal.destroy();
                fields = null;
                imgs = null;
                onUploaded = null;
                onSave = null;
                modal = null;
            }
        }

    })();

    public subBtns = (() => {
        let box: InputBox = null,
            ftable: FastBtnTable = null,
            handler = null;

        let init = (wrapper: HTMLElement) => {
            let btnsUi = this.ui.subButtons;
            ftable = this.ftable;
            box && box.destroy();
            box = new InputBox({
                container: wrapper,
                isResponsive: !tools.isMb,
                className: !tools.isMb ? 'more-btns' : ''
            });

            Array.isArray(btnsUi) && btnsUi.forEach((btnUi) => {
                let btn = new Button({
                    icon: btnUi.icon,
                    content: btnUi.title,
                    isDisabled: !(btnUi.multiselect === 0 || btnUi.multiselect === 2 && btnUi.selectionFlag),
                    data: btnUi,
                    onClick: () => {
                        if (btn.data.openType.indexOf('rfid') > -1) {
                            // RFID 操作按钮
                            InventoryBtn(btn, this);

                        } else if(btn.data.openType === 'passwd'){
                            let selectData = ftable.selectedRowsData[0];
                            if(selectData){
                                let res = G.Rule.varList(btn.data.actionAddr.varList, selectData, true),
                                    data = [];
                                for(let key in res){
                                    for(let col of this.ui.cols){
                                        if(col.name.toLowerCase() === key){
                                            data.push({
                                                title: col.caption,
                                                name: key,
                                                value: res[key]
                                            });
                                            break;
                                        }
                                    }
                                }
                                console.log(data);
                                new PasswdModal({
                                    data,
                                    confirm: (ajaxData) => {
                                        ajaxData.isAdmin = 1;
                                        return BwRule.Ajax.fetch(CONF.ajaxUrl.personPassword, {
                                            type: 'POST',
                                            data: JSON.stringify([ajaxData])
                                        }).then(({response}) => {
                                            console.log(response);
                                            return new Promise((resolve) => {
                                                if(response.errorCode === 0){
                                                    resolve(true);
                                                    Modal.alert(response.msg, '温馨提示', () => {
                                                        ButtonAction.get().btnRefresh(btn.data.refresh, this.pageUrl);
                                                    })
                                                }else{
                                                    resolve(false);
                                                    Modal.alert(response.msg);
                                                }
                                            })
                                        })
                                    }
                                })
                            }
                        }else if (btn.data.openType.indexOf('flow') > -1) {
                            // 流程引擎操作按钮
                            let btnUi = btn.data as R_Button,
                                {multiselect, selectionFlag} = btnUi,
                                selectedData = multiselect === 2 && selectionFlag ?
                                    ftable.unselectedRowsData : ftable.selectedRowsData;
                            let select = multiselect === 1 ? selectedData[0] : selectedData,
                                dataAddr = BW.CONF.siteUrl + btnUi.actionAddr.dataAddr,
                                varList = btnUi.actionAddr.varList;
                            if (tools.isNotEmpty(varList)){
                                varList.forEach((li,index)=>{
                                    let name = li.varName;
                                    for (let key in select){
                                        if (key === name){
                                            if (index === 0){
                                                dataAddr += '?';
                                            }else{
                                                dataAddr += '&';
                                            }
                                            dataAddr = dataAddr + `${key.toLowerCase()}=${select[key]}`
                                        }
                                    }
                                })
                            }
                            let field = btn.data.openType.split('-')[1];
                            switch (field){
                                case 'look':{
                                    new FlowDesigner(dataAddr);
                                }
                                break;
                                case 'design':{
                                    new FlowDesigner();
                                }
                                break;
                            }
                        } else {
                            // 通用操作按钮
                            // if (multiselect === 2 && !selectedData[0]) {
                            //     // 验证多选
                            //     Modal.alert('请至少选一条数据');
                            //     return;
                            // } else if (btn.data.multiselect === 1 && (!selectedData[0] || selectedData[1])) {
                            //     // 单选验证
                            //     Modal.alert('请选最多一条数据');
                            //     return;
                            // }
                            let btnUi = btn.data as R_Button,
                                {multiselect, selectionFlag} = btnUi,
                                selectedData = multiselect === 2 && selectionFlag ?
                                    ftable.unselectedRowsData : ftable.selectedRowsData;
                            let select = multiselect === 1 ? selectedData[0] : selectedData;
                            let tData = ftable.tableData.data;

                            if (btnUi.haveRoll) {
                                let addr = btnUi.actionAddr,
                                    varList = addr.varList,
                                    index = 0,
                                    arr = [];
                                tData.forEach((td, i) => {
                                    let obj = {};
                                    varList.forEach(list => {
                                        let name = list.varName;
                                        obj[name] = td[name];
                                    });
                                    arr.push(obj);
                                    if (tools.obj.isEqual(select, td)) {
                                        index = i;
                                    }
                                });
                                window.localStorage.setItem('currentKeyField', index + '');
                                window.localStorage.setItem('nextKeyField', JSON.stringify(arr));

                                let interval = setInterval(() => {
                                    let locData = window.localStorage.getItem('nextKeyField');
                                    if (tools.isNotEmpty(locData)) {
                                        clearInterval(interval);
                                        ButtonAction.get().clickHandle(btnUi, select, (res) => {
                                        }, this.pageUrl, this.ui.itemId);
                                    }
                                }, 50);

                            } else {
                                window.localStorage.removeItem('nextKeyField');
                                window.localStorage.removeItem('currentKeyField');
                                ButtonAction.get().clickHandle(btnUi, select, (res) => {
                                }, this.pageUrl, this.ui.itemId);
                            }
                        }
                    }
                });
                box.addItem(btn);
            });

            // 根据选中行数判断按钮是否可操作
            this.ftable.off(FastTable.EVT_SELECTED, handler);
            this.ftable.on(FastTable.EVT_SELECTED, handler = () => {
                let selectedLen = ftable.selectedRows.length,
                    allLen = ftable.rows.length;

                box.children.forEach(btn => {
                    let selectionFlag = btn.data.selectionFlag,
                        len = btn.data.selectionFlag ? allLen - selectedLen : selectedLen;

                    if (len === 0) {
                        btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
                    } else if (selectedLen === 1) {
                        btn.isDisabled = false;
                    } else {
                        btn.isDisabled = btn.data.multiselect !== 2;
                    }
                });
            });
        };


        return {
            init,
            get box() {
                return box
            }
        }
    })();

    destroy() {
        super.destroy();
        this.ftable.destroy();
        this.imgEdit.destroy();
        this.ftable = null;
        this.multiImgEdit = null;
        this.imgEdit = null;
        this._ftableReadyHandler = null;
    }
}

export function drillUrlGet(field: R_Field, data: obj, keyField: string) {
    let url;
    for (let type of ['drillAddr', 'webDrillAddr', 'webDrillAddrWithNull']) {
        let addr = field[type];
        url = addr && addr.dataAddr ? BwRule[type](addr, data, keyField) : '';
        if (url) {
            break;
        }
    }

    return url ? CONF.siteUrl + url : '';
}

