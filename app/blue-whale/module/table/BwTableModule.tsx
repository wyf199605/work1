/// <amd-module name="BwTableModule"/>
import { BwRule } from "../../common/rule/BwRule";
import IComponentPara = G.IComponentPara;
import Component = G.Component;
import d = G.d;
import tools = G.tools;
import sys = BW.sys;
import { FastTable, IFastTableCol } from "../../../global/components/newTable/FastTable";
import CONF = BW.CONF;
import { FastBtnTable, IFastBtnTablePara } from "../../../global/components/FastBtnTable/FastBtnTable";
import { ITableCol, TableBase } from "../../../global/components/newTable/base/TableBase";
import { InputBox } from "../../../global/components/general/inputBox/InputBox";
import { Button, IButton } from "../../../global/components/general/button/Button";
import { Modal } from "../../../global/components/feedback/modal/Modal";
import { FastTableCell } from "../../../global/components/newTable/FastTableCell";
import { InventoryBtn, ontimeRefresh } from "./InventoryBtn";
import { Loading } from "../../../global/components/ui/loading/loading";
import { LayoutImage } from "../../../global/components/view/LayoutImg/LayoutImage";
import { NewTableModule } from "./newTableModule";
import Shell = G.Shell;
import {ButtonAction} from "../../common/rule/ButtonAction/ButtonAction";
import {Inputs} from "../inputs/inputs";
import {FlowDesigner} from "../flowDesigner/FlowDesigner";
import {PasswdModal} from "../changePassword/passwdModal";
import {Spinner} from "../../../global/components/ui/spinner/spinner";
import {FormCom} from "../../../global/components/form/basic";
import {EditModule} from "../edit/editModule";
import {TableDataCell} from "../../../global/components/newTable/base/TableCell";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {BwUploader} from "../uploadModule/bwUploader";
import {ImgModal, ImgModalPara} from "../../../global/components/ui/img/img";
import {BwLayoutImg} from "../uploadModule/bwLayoutImg";
import {TableDataRow} from "../../../global/components/newTable/base/TableRow";
import {FastTableColumn} from "../../../global/components/newTable/FastTabelColumn";
import {NewIDB} from "../../../global/NewIDB";
import {Datetime} from "../../../global/components/form/datetime/datetime";
import {DatetimeMb} from "../../../global/components/form/datetime/datetimeInput.mb";
import {BwTableEditModule} from "./BwTableEditModule";
import { ShareCode } from '../../common/share-code/shareCode';
import { ChartTableModule } from "../echart-module/chartTableModule";

export interface IBwTableModulePara extends IComponentPara {
    ui: IBW_Table;
    tableModule?: NewTableModule;
    isSub?: boolean;
    ajaxData?: obj;
    editParam?: IBW_TableAddrParam;
    btnShow?: boolean
}

interface IEditImgModuleUploadHandler {
    (md5s: objOf<string>): void;
}

export class BwTableModule extends Component {
    private mapState: boolean;
    private submitState: boolean;
    static EVT_READY = '__TABLE_READY__';  // 创建fastTable完成后的事件

    protected wrapperInit(para: IBwTableModulePara): HTMLElement {
        return <div className="table-module-wrapper" />;
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
    public isModalEdit: boolean = true;

    public readonly isSub: boolean;        // 是否子表
    constructor(para: IBwTableModulePara) {
        super(para);
        this._btnShow = tools.isEmpty(para.btnShow) ? true : para.btnShow;
        this.isSub = !!para.isSub;
        this.editParam = para.editParam;
        this.tableModule = para.tableModule;
        let ui = this.ui = para.ui;
        console.log('para', para);
        this.isModalEdit = ui.operationType && ui.operationType.editType
            ? ui.operationType.editType === 'modal' : false;
        this.isPivot = ui.relateType === 'P';
        if (this.tableModule && !this.tableModule.editable && !this.isPivot) {
            this.editParam = null;
        }

        BwRule.beforeHandle.table(ui); // 初始化UI, 设置一些默认值

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
        this.linkedData = para.ajaxData || {};

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

    protected _btnShow: boolean = true;
    get btnShow() {
        return this._btnShow;
    }

    set btnShow(flag: boolean) {
        this._btnShow = flag;
        this.ftable && (this.ftable.btnShow = flag);
    }

    protected getBaseFtablePara(): IFastBtnTablePara {
        // 基本配置
        return {
            isWrapLine: tools.isMb && (this.ui.cols ? this.ui.cols.some((col) => col.atrrs && (col.atrrs.displayWidth > 0)) : false),
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
                    name: [this.isRfid ? null : null, 'statistic', 'export'],
                    type: tools.isMb ? "dropdown" : "button",
                    target: tools.isMb ? d.query('[data-target="popover"]>[data-action="down-menu"]') : void 0,
                    isReplaceTable: this.isDrill,
                },
            cellFormat: (cellData, cell: FastTableCell) => {
                let col = cell.column,
                    rowData = this.ftable.data[cell.row.index]; // 行数据
                if (col) {
                    return this.cellFormat(cell, cellData, rowData);
                } else {
                    return { text: cellData }
                }
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
                        let { r, g, b } = tools.val2RGB(colorVal),
                            colorStr = `rgb(${r},${g},${b})`;
                        if (i === 0) {
                            bgColor = colorStr
                        } else {
                            color = colorStr;
                        }
                    }
                });
                return { color, bgColor, attr };
            },
            page: this.ui.multPage === 0 ? null : {
                size: 50,
                options: [50, 100, 500],
                isPulldownRefresh: true
            },
            menu: [this.isPivot ? null : {
                colMulti: 1,
                title: '锁定/解锁列',
                onClick: (cell) => {
                    let column = cell.column as FastTableColumn,
                        isFixed = column.isFixed;
                    column.isFixed = !isFixed;
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
            } : null],
            dataAction: (data, type, callback) => {
                let editModule = this.initModalEdit(),
                    isEdit = type !== 'show',
                    isInsert = type === 'insert';
                editModule.clear();
                editModule.initStatus(isInsert, isEdit);
                editModule.set(data);
                editModule.modalShow = true;

                editModule.onFinish = (data) => {
                    editModule.modalShow = false;
                    if (isEdit) {
                        callback && callback(data);
                        Modal.toast('请点击保存以保存数据');
                    }
                }
            }
        }
    }

    private addOldData(data: obj[]): obj[] {
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

    //查看地图
    private viewMap(data) {
        console.log('viewMap.....')
        G.Shell.location.drawMap(data)
    }

    //提交
    private sumitMap() {
        let cancel = <button>取消</button>
        let sure = <button>确定</button>
        let start = null;
        let end = null;
        let body = <div className="select_time_wrap">
            <div className="select_time">
                <header>选择日期</header>
                <div id="time_wrap">
                    <div className="time_item">
                        {/* <input type="text" placeholder="请选择时间" disabled /> */}
                        {
                            start = <DatetimeMb className="datetime" c-var="time" format="yyyy-MM-dd HH:mm"
                                placeholder="请选择时间" />
                        }
                        {/* <i className="iconfont icon-arrow-right"></i> */}
                    </div>
                    <div className="time_item">
                        {/* <input type="text" placeholder="请选择时间" disabled /> */}
                        {
                            end = <DatetimeMb className="datetime" c-var="time" format="yyyy-MM-dd HH:mm"
                                placeholder="请选择时间" />
                        }
                        {/* <i className="iconfont icon-arrow-right"></i> */}
                    </div>
                </div>
                <footer>
                    {cancel}
                    {sure}
                </footer>
            </div>
        </div>
        d.append(document.body, body)
        d.on(cancel, "click", () => {
            body.remove();
        })
        d.on(sure, "click", () => {
            if (!start.value) {
                Modal.toast("请选择开始时间")
                return false;
            }
            if (!end.value) {
                Modal.toast("请选择结束时间")
                return false;
            }
            if (!/(20\d{2}([\.\-/|年月\s]{1,3}\d{1,2}){2}日?(\s?\d{2}:\d{2}(:\d{2})?)?)|(\d{1,2}\s?(分钟|小时|天)前)/.test(start.value)) {
                Modal.toast("请选择正确的开始时间格式")
                return false;
            }
            if (!/(20\d{2}([\.\-/|年月\s]{1,3}\d{1,2}){2}日?(\s?\d{2}:\d{2}(:\d{2})?)?)|(\d{1,2}\s?(分钟|小时|天)前)/.test(end.value)) {
                Modal.toast("请选择正确的结束时间格式")
                return false;
            }
            if (new Date(end.value).getTime() <= new Date(start.value).getTime()) {
                Modal.toast("开始时间必须小于结束时间")
                return false;
            }
            body.remove();
            let user_id = JSON.parse(localStorage.getItem("userInfo")).userid || "";
            let params = { "start_time": start.value, "end_time": end.value, user_id }
            BwRule.Ajax.fetch(CONF.ajaxUrl.location, {
                type: "POST",
                data: params
            }).then(({ response }) => {
                G.Shell.location.localSubmit(response)
            })
        })
        // let modal = new Modal({
        //     container: document.body,

        // });
    }


    private ftableInit(ajaxData?: obj) {
        let ui = this.ui;
        this.ftable = new FastBtnTable(
            Object.assign(this.getBaseFtablePara(), {
                exportTitle: this.ui.caption,
                cols: BwTableModule.colParaGet(this._cols), // 把fields转为表格的参数
                ajax: {
                    ajaxData,
                    once: ui.multPage !== 1, // =1时后台分页, 0 不分页, 2,前台分页
                    auto: !this.hasQuery,    // 有查询器时不自动查询
                    timeout: (this.ui.timeOut || 0) * 1000,
                    fun: ({ pageSize, current, sort, custom, timeout }) => {
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
                                timeout: timeout,
                                data: Object.assign({
                                    pageparams: `{"index"=${current + 1},"size"=${pageSize},"total"=1}`,
                                    pagesortparams
                                }, custom)
                            }),
                            // 获取lookup数据
                            this.lookup
                        ]).then(([{ response }]) => {
                            this.wrapper.style.display = 'block';
                            new ChartTableModule(this.ui, this.wrapper, response, this.ftable);
                            let { data, head } = response;
                            // 选项查询处理(wbf)
                            this.sectionField(response);
                            data = this.addOldData(data);
                            this.tableModule.trigger(NewTableModule.EVT_DATA_GET);
                            return {
                                data,
                                total: head ? head.totalNum : (data.length || 0),
                            };
                        });
                    }
                }
            })
        );
        this.ftable.btnShow = this.btnShow;

        // !this.isDrill && this.ftable.btnAdd('filter', {
        //     type: 'default',
        //     icon: 'sousuo',
        //     content: '本地过滤',
        //     onClick: () => {
        //         this.filter.init();
        //     },
        // }, 1);

        (this.ui.rfidFlag == 1) && this.ftable.btnAdd('rfid', {
            type: 'default',
            content: 'rfid设置',
            onClick: () => {
                require(['RfidSetting'], function (RfidSetting) {
                    new RfidSetting.RfidSettingModal();
                });
            },
        });
        // this.ftable.btnAdd('shareCode', {
        //     type: 'default',
        //     content: '二维码分享',
        //     onClick: () => {
        //         console.log('二维码分享',ui);
        //         new ShareCode(this.tableModule.main.ftable.selectedRowsData);

        //     },
        // });

        !tools.isMb && this.ftable.btnAdd('switch-chart', {
            type: 'default',
            content: '图表',
            onClick: () => {
                console.log('图表',ui);
                // new ShareCode(this.tableModule.main.ftable.selectedRowsData);
                console.log(this);
                debugger;
                let chartDom: HTMLElement | null = d.query('.chart-table', this.container);
                if(chartDom) {
                    this.wrapper.style.display = 'none';
                    chartDom.style.display = 'block';
                }

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
        this.trClickInit();

        tools.isFunction(this._ftableReadyHandler) && this._ftableReadyHandler();
        this.isFtableReady = true;
        this.trigger(BwTableModule.EVT_READY);
    }

    static colParaGet(fields: R_Field[]): IFastTableCol[][] {
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
                isCanSort: field.isCanSort, // 是否可排序
                sortName: field.sortName
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

    private pivotRefresh(ajaxData: obj = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            let loading = new Loading({
                msg: '加载中...',
                container: this.container
            });
            this.ajax.fetch(CONF.siteUrl + BwRule.reqAddr(this.ui.dataAddr), {
                data: Object.assign({}, ajaxData, { pageparams: `{"index"=1,"size"=3000,"total"=1}` })  //设置初始分页条件
            }).then(({ response }) => {
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
        /*let colsParaGet = (meta: string[]): obj[] => {

            let originCols = this._cols,
                fields: R_Field[] = BwRule.getCrossTableCols(meta, originCols).cols;

            BwRule.createCrossTableCols(meta, originCols);
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
                        isCanSort: field.isCanSort,
                        sortName: field.sortName,
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
        };*/

        // let isFirst = tableDom.classList.contains('mobileTable');
        return this.pivotRefresh(ajaxData).then((response) => {
            if (tools.isEmpty(response)) {
                return;
            }
            if (tools.isEmpty(response.data)) {
                this.ftableInit(ajaxData);
                return
            }
            response.data = this.addOldData(response.data);
            this.ftable = new FastBtnTable(
                Object.assign(this.getBaseFtablePara(), {
                    exportTitle: this.ui.caption,
                    cols: BwRule.createCrossTableCols(response.meta, this._cols),
                    data: response.data
                })
            );
            tools.isPc && (this._btnWrapper = this.ftable.btnWrapper);
            this.ftable.btnShow = this.btnShow;
            this.ftableReady();
            this.subBtns.initState();
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

    get lookup(): Promise<void> {
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

    trClickInit() {
        let ui = this.ui,
            field = ui.cols,
            ftable = this.ftable,
            rowLinkField = ui.rowLinkField,
            selector = '.section-inner-wrapper:not(.pseudo-table) tbody tr td:not(.cell-link):not(.cell-img)';

        if (!rowLinkField) {
            return
        }

        ftable.click.add(selector, (e: MouseEvent) => {
            if (e.altKey || e.ctrlKey || e.shiftKey) {
                return;
            }

            let target = e.target as HTMLTableCellElement,
                rowIndex = parseInt(target.parentElement.dataset.index),
                row = ftable.rowGet(rowIndex),
                rowData = row.data;
            for (let field of this.cols) {
                if (field.name === rowLinkField) {
                    this.tdClickHandler(field, rowData, true);
                    break;
                }
            }
        })
    }

    protected tdClickHandler(field: R_Field, rowData: obj, empty = false) {
        // 判断是否为link
        if (!field) {
            return;
        }
        let link = field.link,
            dataType = field.dataType || (field.atrrs && field.atrrs.dataType);

        if (!empty && tools.isEmpty(rowData[field.name])) {
            return;
        }

        if (BwRule.isNewFile(dataType)) {
            let url = tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                "md5_field": field.name,
                [field.name]: rowData[field.name],
                down: 'allow'
            });
            sys.window.download(url, rowData[field.name]);
            return;
        }

        if (link && (field.endField ? rowData[field.endField] === 1 : true)) {
            BwRule.link({
                link: tools.url.addObj(link.dataAddr, G.Rule.parseVarList(link.parseVarList, rowData)),
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
            sys.window.open({ url });
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
            return !col.noShow && BwRule.isImage(dataType);
        });
        let hasImg = this.cols.some(col => {
            let dataType = col.atrrs && col.atrrs.dataType;
            return BwRule.isImage(dataType);
        });

        let imgHandler = function (e: MouseEvent, isTd = true) {
            if (e.altKey || e.ctrlKey || e.shiftKey) {
                return;
            }
            let td = d.closest(e.target as HTMLElement, 'td'),
                index = parseInt(td.parentElement.dataset.index),
                name = td.dataset.name;

            let row = ftable.rows[index],
                cell = row ? row.cellGet(name) : null;
            if (self.ftable.editing) {
                self.imgManager.open(cell);
            } else {
                self.imgManager.showImg(cell);
            }

            // 旧的图片查看编辑
            // if (isTd && self.cols.some(col => col.name === name && BwRule.isNewImg(col.atrrs.dataType))) {
            //     let row = ftable.rows[index],
            //         cell = row ? row.cellGet(name) : null;
            //     if(self.ftable.editing){
            //         self.imgManager.open(cell);
            //     }else{
            //         self.imgManager.showImg(cell);
            //     }
            // } else if (isTd && self.cols.some(col => col.name === name && col.atrrs.dataType === '22')) {
            //     self.multiImgEdit.show(name, index);
            // } else {
            //     self.imgEdit.showImg(index);
            // }
        };

        if (hasThumbnail) {
            d.on(ftable.wrapper, 'click', `${tdSelector}.cell-img:not(.disabled-cell)`, tools.pattern.throttling((e) => {
                imgHandler(e, true);
            }, 1000))
        } else {

            // let imgColumn = this.ftable.columns.filter(col => {
            //     let field = col.content as R_Field;
            //     let dataType = field.atrrs && field.atrrs.dataType;
            //     return BwRule.isImage(dataType);
            // })[0];

            ftable.click.add(trSelector, tools.pattern.throttling((e) => {
                let td = d.closest(e.target as HTMLElement, 'td'),
                    index = parseInt(td.parentElement.dataset.index);
                //     cell = imgColumn.bodyCells[index] as FastTableCell;
                // cell && self.imgManager.showImg(cell);
                this.imgEdit.showImg(index);
            }, 1000));
        }

    }

    protected imgManager = (() => {
        let layoutImg: BwLayoutImg;

        let getImg = (cell: FastTableCell) => {
            let urls = [];
            if (cell && cell.column) {
                let column = cell.column,
                    data = cell.data,
                    row = cell.row,
                    field = column.content as R_Field;
                if (BwRule.isNewImg(field.atrrs.dataType)) {
                    if (data && typeof data === 'string') {
                        data.split(',').forEach((data) => {
                            urls.push(tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                                "md5_field": field.name,
                                [field.name]: data,
                                down: 'allow'
                            }))
                        });
                    }
                } else if (BwRule.isOldImg(field.atrrs.dataType)) {
                    let picAddrList = this.ui.pictureAddrList;

                    if (tools.isNotEmptyArray(picAddrList)) {

                        let rowData = this.ftable.tableData.rowDataGet(row.index),
                            url: string = '';
                        if (rowData[field.name]) {
                            url = tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                                // name_field: nameField,
                                md5_field: 'FILE_ID',
                                file_id: rowData[field.name],
                                // [nameField]: fileName,
                                down: 'allow'

                            });
                        } else {
                            url = picAddrList.map(addr =>
                                tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(addr, rowData), this.ajaxData, true, true)
                            )[0] || '';
                        }

                        urls = [url];
                    }
                }
            }
            return urls;
        };

        return {
            getImg,
            showImg(cell: FastTableCell) {
                if (!cell || !cell.column) {
                    return;
                }

                let urls = getImg(cell);
                if (tools.isNotEmpty(urls)) {
                    let imgData: ImgModalPara = {
                        img: urls
                    };
                    let index = cell.row.index,
                        field = cell.column.content as R_Field,
                        name = field.name,
                        len = cell.ftable.data.length;

                    if (len > 1) {
                        imgData.turnPage = (next) => {
                            let getCell = (i) => {
                                let rows = cell.ftable.rows,
                                    row = rows[i + 1];
                                if (!next) {
                                    row = rows[i - 1];
                                }
                                let curCell = row && row.cellGet(name);
                                if (curCell) {
                                    if (!getImg(curCell)[0]) {
                                        getCell(next ? index++ : index--);
                                    } else {
                                        ImgModal.destroy();
                                        this.showImg(curCell);
                                        cell.selected = false;
                                        curCell.selected = true;
                                    }
                                }
                            };
                            getCell(index);
                        }
                    }
                    ImgModal.show(imgData);
                } else {
                    Modal.toast('无图片')
                }
            },
            open: (cell: FastTableCell) => {
                layoutImg && layoutImg.destroy();
                let images = [];
                if (cell && cell.column) {
                    let field = cell.column.content as R_Field,
                        row = this.ftable.rowGet(cell.row.index),
                        dataType = field.dataType || field.atrrs.dataType,
                        multi = dataType === '28';
                    layoutImg = new BwLayoutImg({
                        isCloseMsg: true,
                        isDelete: dataType !== '20',
                        multi: multi,
                        nameField: field.name,
                        thumbField: dataType === '20' ? field.name : void 0,
                        loading: {
                            msg: '图片上传中...'
                        },
                        autoUpload: true,
                        onDelete: (index) => {
                            delete images[index];
                        },
                        onSuccess: (res) => {
                            if (BwRule.isOldImg(dataType)) {

                                let data = res.data,
                                    md5Data = {};
                                for (let fieldKey in data) {
                                    md5Data[data[fieldKey].key] = data[fieldKey].value;
                                }
                                images = [md5Data[field.name]];
                                row.data = Object.assign({}, row.data, md5Data);
                            } else if (BwRule.isNewImg(dataType)) {
                                if (multi) {
                                    images.push(res.data.unique);
                                } else {
                                    images = [res.data.unique];
                                }
                            }
                        },
                        onFinish: () => {
                            return new Promise<any>((resolve) => {
                                BwRule.isNewImg(dataType) && (cell.data = images.filter((a) => !!a).join(','));
                                resolve();
                            });
                        }
                    });

                    layoutImg.set(getImg(cell));
                    if (cell.data && typeof cell.data === 'string') {
                        images = cell.data.split(',');
                    }
                    layoutImg.modalShow = true;
                }
            }
        }
    })();

    get ajaxData() {
        
        setTimeout(() => {
            this.defaultSelected()
        }, 500);
        return this.ftable.tableData.ajaxData;
    }

    refresh(data?: obj) {
        
        if (this.isPivot) {
            this.ftable && this.ftable.destroy();
            this.modalEditCancel();
            return this.pivotInit(data);
        } else {
            return this.ftable.tableData.refresh(data).then(() => {
                this.aggregate.get(data);
                this.modalEditCancel();
                setTimeout(() => {
                    this.subBtns.initState();
                    
                     this.ftable && this.ftable.clearSelectedRows();
                     this.defaultSelected();
                    
                }, 500)
            });
        }

    }

    protected defaultSelected() {
        
            let keyField = localStorage.getItem('keyField');
            // localStorage.removeItem('keyField');
            console.log('defaultSelected')
            if(keyField) {
                let shareData = JSON.parse(keyField);
                this.ftable.clearSelectedRows();
                

                if(shareData.key) {
                    this.ftable.data.forEach((row,i) => {
                        if(Object.keys(row).includes(shareData.key)) {
                            shareData.data && shareData.data.forEach( id => {
                                if(id === row[shareData.key]) {
                                    this.ftable.rows[i].selected = true;
                                    this.ftable.rows[i].selected = true;
                                    this.ftable._drawSelectedCells();
                                    this.ftable.pseudoTable.setCheckBoxStatus();
                                }
                            })
                        }
                    })
                }
                
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
                            .then(({ response }) => {
                                // TODO data可能不存在
                                let resultData = tools.keysVal(response, 'data', 0) || {};
                                data = Object.assign(data, resultData);
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
            aggrWrap = <div className="aggr-wrapper" />;
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
                    .then(({ response }) => {
                        let value = tools.keysVal(response, 'data', 0, tools.keysVal(response, 'meta', 0));
                        valSpan.innerHTML = `${aggr.caption}:${value || 0} &nbsp;&nbsp;`;
                    });
            });
        };

        return { get };
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
                        <ul className="mui-table-view" data-query-name="local" />
                        <div data-action="add" data-name="local" className="mui-btn mui-btn-block mui-btn-primary">
                            <span className="mui-icon mui-icon-plusempty" /> 添加条件
                        </div>
                    </div>
                    :
                    <div className="filter-form" data-query-name="local">
                        <span data-action="add" className="iconfont blue icon-jiahao" />
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
                let queryCols = this.ui.querier && (this.ui.querier.queryparams0 || this.ui.querier.queryparams1
                    || this.ui.querier.atvarparams) || initQueryConfigs(getCols());
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
                if (col && col.show && !col.isVirtual) {
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
        if (!reportCaption || reportCaption == 'null') {
            return;
        }
        d.prepend(this.wrapper, <div className="table-module-report">{reportCaption}</div>);
    }

    private countElements: objOf<HTMLElement> = {}; //存储哈希表 表列头的结构
    private OLD_DIFFAMOUNT: number = 0;

    //根据列头实时更新统计
    public rfidColthead() {

        let rfidCols = this.ui.rfidCols,
            ftable = this.ftable;
        if (rfidCols.calc) {
            //调用接口 传rfid.amount
            let calcCols = rfidCols.calc.cols || {},
                when = rfidCols.calc.when || {},
                countElements = this.countElements,
                { calculate, calculateScan, calculateDiff, calculateAdd } = calcCols,
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
                    let { field, rule } = calc;
                    if (rule.slice(0, 3) == 'SUM') {
                        let sum = this.countCalcSum(ftable, field),
                            el = countElements[field];
                        el && (el.innerHTML = sum + '');
                    } else {
                        if (field && rule) {
                            let diffValue = tools.str.parseTpl(rule, colHeadStr),
                                el = countElements[field];
                            el && (el.innerHTML = tools.calc(diffValue));
                        }
                    }
                });

            })
        }
    }

    //下载更新后表列头统计
    public rfidDownAndUpInitHead() {
        let rfidCols = this.ui.rfidCols,
            ftable = this.ftable;

        //Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val)=>{

        //  this.countElements[val.calcField].innerHTML = val.calcValue;
        //})

        if (rfidCols.calc) {
            //调用接口 传rfid.amount
            let calcCols = rfidCols.calc.cols || {},
                when = rfidCols.calc.when || {},
                countElements = this.countElements,
                { calculate, calculateScan, calculateDiff, calculateAdd } = calcCols,
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
                    let { field, rule } = calc;
                    if (rule.slice(0, 3) == 'SUM') {
                        let sum = this.countCalcSum(ftable, field),
                            el = countElements[field];
                        el && (el.innerHTML = sum + '');
                    } else {
                        if (field && rule) {
                            let diffValue = tools.str.parseTpl(rule, colHeadStr),
                                el = countElements[field];
                            el && (el.innerHTML = tools.calc(diffValue));
                        }
                    }
                });

                Shell.inventory.columnCountOff({}, 1, rfidCols.inventoryKey, (res) => {
                })
            })
        }

    }

    public countCalcSum(ft, str) {

        let column = ft.columnGet(str),
            sum = 0;
        column.data.forEach((col) => {
            sum += col;
        })
        return sum;
    }

    //进入盘点页面 初始化
    public rfidColInit() {
        let rfidCols = this.ui.rfidCols,
            ftable = this.ftable,
            fields = this.ui.cols;
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
        //创建表列头  页面结构
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
        // 盘点需要配置的 已扫描量字段 scanField
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

        //监听表格 渲染数据
        ftable.on(FastTable.EVT_RENDERED, () => {
            let subBtn = this.ui.subButtons;
            //if (Array.isArray(subBtn) && subBtn.some(btn => btn.openType === 'rfid_begin')) {

            //调用壳接口 获取扫到的数据 与表格数据做判断  如果已经有该条数据 就更新,如果没有就渲染添加
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
                            if (count !== 0) {
                                return {
                                    field: cell,
                                    count: count
                                }
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
                { calculate, calculateScan, calculateDiff, calculateAdd } = calcCols,
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
            let inventory = rfidCols.inventoryKey ? rfidCols.inventoryKey : "key"; //盘点单 作为参数传入壳接口
            if (tools.isNotEmpty(rfidCols.calc)) {
                Shell.inventory.columnCountOn(when, 1, inventory, true, false, (res) => {
                    //渲染表列头数据，以及根据后台配置的规则进行计算
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

                    setTimeout(() => {
                        calcRule.forEach(calc => {
                            let { field, rule } = calc;
                            if (rule.slice(0, 3) == 'SUM') {
                                let sum = this.countCalcSum(ftable, field),
                                    el = countElements[field];
                                el && (el.innerHTML = sum + '');
                            } else {
                                if (field && rule) {
                                    let diffValue = tools.str.parseTpl(rule, colHeadStr),
                                        el = countElements[field];
                                    el && (el.innerHTML = tools.calc(diffValue));
                                }
                            }
                        });
                    }, 980);
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
    private cellFormat(cell: FastTableCell, cellData: any, rowData: obj) {
        let text: string | Node = cellData, // 文字 或 Node
            field = cell.column.content as R_Field,
            data = null,
            color: string,                  // 文字颜色
            bgColor: string,                // 背景颜色
            classes: string[] = [];         // 类名
        if (field && !field.noShow && field.atrrs) {
            let dataType = field.atrrs.dataType,
                isImg = dataType === BwRule.DT_IMAGE;

            if (isImg && field.link) {
                // 缩略图
                let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, rowData), this.ajaxData, true, true);
                url = tools.url.addObj(url, { version: new Date().getTime() });

                text = <img src={url} />;
                classes.push('cell-img');

            } else if (BwRule.isNewImg(dataType)) {
                if (cellData && typeof cellData === 'string') {
                    let urls = [];
                    cellData.split(',').forEach((data) => {
                        urls.push(tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                            "md5_field": field.name,
                            [field.name]: data,
                            down: 'allow'
                        }))
                    });
                    text = <div>
                        {urls.map((url) => {
                            let width = 100 / urls.length;
                            return <img style={{
                                maxWidth: width - 2 + '%',
                                marginRight: '2%'
                            }} src={url} alt="" />
                        })}
                    </div>;
                }
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
                        text = new LayoutImage({ urls }).wrapper;
                    }
                }

                classes.push('cell-img');

            } else if (BwRule.isNewFile(dataType)) {
                if (cellData) {
                    BwRule.getFileInfo(field.name, cellData).then(({ response }) => {
                        response = JSON.parse(response);
                        if (response && response.dataArr && response.dataArr[0]) {
                            let data = response.dataArr[0];
                            text = data.filename;
                        }
                        classes.push('cell-link');
                        color = 'blue';
                        cell.formatCell({ text, classes, bgColor, color, data });
                    }).catch((e) => {
                        console.log(e);
                    });
                }
            } else if (dataType === '50') {
                // 打钩打叉
                text = <div
                    className={`appcommon ${cellData === 1 ? 'app-xuanzhong' : 'app-guanbi1'}`}
                    style={`color: ${cellData === 1 ? 'green' : 'red'}`}>
                </div>;

            } else if (field.name === 'STDCOLORVALUE') {
                // 显示颜色
                let { r, g, b } = tools.val2RGB(cellData);
                text = <div style={`backgroundColor: rgb(${r},${g},${b})`} height="100%"></div>;

            } else if (field.elementType === 'lookup') {
                // lookUp替换
                let options = this.lookUpData[field.name] || [];
                for (let opt of options) {
                    if (opt.value == rowData[field.lookUpKeyField]) {
                        text = opt.text;
                        data = opt.text;
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

            // 后台计算规则
            let when = field.backWhen;
            if (when) {
                if (eval(tools.str.parseTpl(when, rowData))) {
                    let { r, g, b } = tools.val2RGB(field.backColor);
                    bgColor = `rgb(${r},${g},${b})`
                }
            }
            // if(text && typeof text === 'object' && text['localName'] === 'img' && tools.isMb){
            //     text['onclick'] = (e)=> {
            //         e.preventDefault();
            //         console.log('123');
            //         console.log(e.path[0].baseURI);
            //         let picture = e.path[0].src.replace(/thumbnail/i,'picture');
            //         console.log(picture);
            //         sys.window.openImg(picture);
            //     }
            // }
            return { text, classes, bgColor, color, data };
        }
    }

    // 多图查看与编辑
    protected multiImgEdit = (() => {
        let modal: Modal = null;

        let imgCreate = (url: string, md5: string, isClose: boolean = true) => {
            return <div className="img">
                {isClose ? <div className="appcommon app-guanbi1 img-close" data-md5={md5} /> : ''}
                <img src={url} />
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
                uploadModule: BwUploader;

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

            let rowCanEdit = this.edit.rowCanInit(row, this.isSub),
                cellCanEdit = this.edit.cellCanInit(column, isInsert ? 1 : 0);

            updatable = updatable && rowCanEdit && cellCanEdit;

            let btnWrapper: HTMLElement = null,
                imgWrapper: HTMLElement = null,
                wrapper = <div className="table-img-wrapper">
                    {btnWrapper = <div className="table-img-wrapper-btns" />}
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
                    (this.ftable.editing ? Promise.resolve() : tableModule.editManage.start(this))
                        .then(() => {
                            setTimeout(() => {
                                let row = this.ftable.rowGet(rowIndex);
                                if (row) {
                                    row.data = Object.assign(row.data, {
                                        [fieldName]: md5Data.join(',')
                                    })
                                }
                            }, 500);
                        });
                }
            };
            let dataType = field.dataType || field.atrrs.dataType,
                isSign = dataType === BwRule.DT_SIGN;
            if (updatable) {
                let imgContainer = <div className="table-img-uploader" />;
                d.append(btnWrapper, imgContainer);
                uploadModule = new BwUploader({
                    uploadType: isSign ? 'sign' : 'file',
                    nameField: fieldName,
                    // thumbField: thumbField,
                    loading: {
                        msg: '图片上传中...'
                    },
                    container: imgContainer,
                    text: isSign ? '获取签名' : '添加图片',
                    accept: {
                        title: '图片'
                        , extensions: 'jpg,png,gif,jpeg'
                        , mimeTypes: 'image/*'
                    },
                    uploadUrl: CONF.ajaxUrl.fileUpload,
                    isChangeText: false,
                    onSuccess: (response, file) => {
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

        return { show };
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
                if (col.atrrs && (col.atrrs.dataType === '20')) {
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
                this.tableModule && this.tableModule.editManage.start(this).then(() => {
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
                    <div className="table-img-wrapper-btns" />
                    <div className="table-img">
                        <img data-index={imgIndex} style="max-height:500px;max-width:700px" />
                    </div>
                </div>;

            if (!updatable && !deletable) {
                return wrapper;
            }

            let btnWrapper = d.query('.table-img-wrapper-btns', wrapper),
                img = d.query('img', wrapper) as HTMLImageElement,
                dataType = field.dataType || field.atrrs.dataType,
                isSign = dataType === BwRule.DT_SIGN;
            if (updatable) {
                let imgContainer = <div className="table-img-uploader"></div>;
                d.append(btnWrapper, imgContainer);
                new BwUploader({
                    uploadType: isSign ? 'sign' : 'file',
                    nameField,
                    loading: {
                        msg: '图片上传中...',
                        disableEl: document.body
                    },
                    thumbField: thumbField,
                    container: imgContainer,
                    text: isSign ? '签名' : '选择图片',
                    accept: {
                        title: '图片'
                        , extensions: 'jpg,png,gif,jpeg'
                        , mimeTypes: 'image/*'
                    },
                    uploadUrl: CONF.ajaxUrl.fileUpload,
                    isChangeText: false,
                    onSuccess: (response, file) => {
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
                        tools.isFunction(onUploaded) && onUploaded({ [nameField]: '' });
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
            let dataObj: obj;
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
                    tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(addr, rowData), this.ajaxData, true, true)
                );
                // this.tableImgEdit.indexSet(rowIndex, urls);
                // debugger;

                Promise.all(imgsUrl.map((url) => {
                    return new Promise<string>((resolve, reject) => {
                        let idb = new NewIDB(BwRule.IMG_CACHE_CONF);
                        idb.getCollection(BwRule.IMG_TABLE).then((store) => {
                            store.find((val) => {
                                return val['url'] === url;
                            }).then((response) => {
                                if (tools.isNotEmpty(response)) {
                                    let data = response[0],
                                        version = data['version'];
                                    version && (url = tools.url.addObj(url, { version: version }));
                                }
                                idb.destroy();
                                resolve(url);
                            });
                        });
                    });
                })).then((urls) => {
                    imgs.forEach((img, i) => {
                        img.src = md5s[i] ? imgUrlCreate(md5s[i]) : urls[i];
                        // img.src = md5s[i] ? imgUrlCreate(md5s[i]) : tools.url.addObj(imgsUrl[i], {'_': Date.now()});
                    });
                }).catch(() => {
                    imgs.forEach((img, i) => {
                        img.src = md5s[i] ? imgUrlCreate(md5s[i]) : imgsUrl[i];
                        // img.src = md5s[i] ? imgUrlCreate(md5s[i]) : tools.url.addObj(imgsUrl[i], {'_': Date.now()});
                    });
                });

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

        let btnRefresh = () => {
            if (ftable && ftable.selectedRows) {
                let selectedLen = ftable.selectedRows.length,
                    rowData = ftable.selectedRowsData[0],
                    allLen = ftable.rows.length;

                box && box.children.forEach(btn => {
                    let btnField = btn.data as R_Button,
                        selectionFlag = btnField.selectionFlag,
                        len = btnField.selectionFlag ? allLen - selectedLen : selectedLen;

                    if(btnField.multiselect === 0){
                        btn.isDisabled = false;
                        return ;
                    }
                    if (len === 0) {
                        btn.isDisabled = selectionFlag ? false : btnField.multiselect > 0;
                    } else if (selectedLen === 1) {
                        btn.isDisabled = false;
                        // 根据表格行数据判断按钮是否可点击
                        if (tools.isNotEmpty(btnField.judgefield) && rowData) {
                            let judges = btnField.judgefield.split(','),
                                flag = judges.every((judge) => tools.isNotEmpty(rowData[judge]) ? rowData[judge] === 1 : true);
                            btn.isDisabled = !flag;
                        }
                    } else {
                        btn.isDisabled = btnField.multiselect !== 2 || tools.isNotEmpty(btnField.judgefield);
                    }

                });
            }

        };

        let init = (wrapper: HTMLElement) => {
            let btnsUi = this.ui.subButtons;
            ftable = this.ftable;
            box && box.destroy();
            box = new InputBox({
                container: wrapper,
                isResponsive: true,
                className: !tools.isMb ? 'more-btns' : ''
            });
            //btnsUi = [{ "caption": "测试设计", "title": "测试设计", "icon": "", "actionAddr": { "type": "none", "needGps": 0, "dataAddr": "/app_sanfu_retail/null/audit/flow-6/2/flow_design", "varList": [{ "varName": "PROCESS_ID" }], "varType": 0, "addrType": false, "commitType": 1 }, "buttonType": 0, "subType": "", "openType": "flow-design", "hintBeforeAction": false, "refresh": 0, "multiselect": 1, "level_no": 10 }, { "caption": "流程设计", "title": "流程设计", "icon": "", "actionAddr": { "type": "none", "needGps": 0, "dataAddr": "/app_sanfu_retail/null/audit/flow-6/2/flow_design", "varList": [{ "varName": "PROCESS_ID" }], "varType": 0, "addrType": false, "commitType": 1 }, "buttonType": 0, "subType": "", "openType": "flow-design", "hintBeforeAction": false, "refresh": 0, "multiselect": 1, "level_no": 0 }];
            //    console.log(btnsUi);
            Array.isArray(btnsUi) && btnsUi.forEach((btnUiItem) => {
                let btn = new Button({
                    icon: btnUiItem.icon,
                    content: btnUiItem.title,
                    level: btnUiItem.level_no,
                    isDisabled: !(btnUiItem.multiselect === 0 || btnUiItem.multiselect === 2 && btnUiItem.selectionFlag),
                    data: btnUiItem,
                    onClick: () => {
                        this.tableModule.saveData().then(() => {
                            if (btn.data.openType.indexOf('rfid') > -1) {
                                // RFID 操作按钮
                                InventoryBtn(btn, this);
                            } else if (btn.data.openType === "buildMap") {
                                this.mapState = false;
                                this.submitState = false;
                                this.viewMap(btn.data);
                            } else if (btn.data.openType === "submit") {
                                this.mapState = false;
                                this.submitState = false;
                                this.sumitMap();
                            } else if (btn.data.openType === 'stopLocation') {
                                console.log('stopLocation');
                                let stopBtn = d.query(".stop_location", wrapper)
                                let startBtn = d.query(".start_location", wrapper);
                                // let btnStatus = stopBtn.classList.contains("disabled") || startBtn.classList.contains("disabled");

                                // if(btnStatus) {
                                const dataAddr = BwRule.reqAddr(btnUiItem.actionAddr, ftable.selectedPreRowData);
                                const stopLocationJson = {
                                    dataAddr: btnUiItem.actionAddr ? dataAddr : ''
                                };
                                let keStatus = G.Shell.location.stopRecord(stopLocationJson, () => {
                                })
                                // if (keStatus) {
                                //     // Modal.toast("已结束发送位置")
                                //     stopBtn.classList.add("disabled")
                                //     startBtn.classList.remove("disabled")
                                // }
                                // }
                                // if (!btnStatus) {
                                //     // Modal.toast("请先选择开始记录")
                                // } else {
                                //     let keStatus = G.Shell.location.stopRecord(() => {
                                //     })
                                //     if (keStatus) {
                                //         // Modal.toast("已结束发送位置")
                                //         stopBtn.classList.add("disabled")
                                //         startBtn.classList.remove("disabled")
                                //     } else {
                                //         // Modal.toast("结束发送位置失败")
                                //     }
                                // }
                            } else if (btn.data.openType === 'startLocation') {
                                console.log(ftable, '==============');
                                // const  dataAddr = CONF.siteUrl + BwRule.reqAddr(btnUiItem.actionAddr,ftable.selectedPreRowData);
                                const dataAddr = BwRule.reqAddr(btnUiItem.actionAddr, ftable.selectedPreRowData);
                                const startLocationJson = {
                                    dataAddr: btnUiItem.actionAddr ? dataAddr : '',
                                    needGps: btnUiItem.actionAddr ? btnUiItem.actionAddr.needGps : '',
                                    timeStep: 5000,
                                };

                                let stopBtn = d.query(".stop_location", wrapper)
                                let startBtn = d.query(".start_location", wrapper);
                                // let btnStatus = stopBtn.classList.contains("disabled") || startBtn.classList.contains("disabled")
                                let keStatus = G.Shell.location.startRecord(startLocationJson, () => {
                                })
                                console.log(keStatus);
                                // if (keStatus) {
                                //     // Modal.toast("已开始发送位置")
                                //     stopBtn.classList.remove("disabled")
                                //     startBtn.classList.add("disabled")
                                // }
                                // else {
                                //     // Modal.toast("发送位置失败")
                                // }

                            } else if (btn.data.openType === 'passwd') {
                                let selectData = ftable.selectedRowsData[0];
                                if (selectData) {
                                    let res = G.Rule.varList(btn.data.actionAddr.varList, selectData, true),
                                        data = [];
                                    for (let key in res) {
                                        for (let col of this.ui.cols) {
                                            if (col.name.toLowerCase() === key) {
                                                data.push({
                                                    title: col.caption,
                                                    name: key,
                                                    value: res[key]
                                                });
                                                break;
                                            }
                                        }
                                    }
                                    new PasswdModal({
                                        data,
                                        confirm: (res) => {
                                            let ajaxData = {};
                                            for (let key in res) {
                                                if (key === 'new_password') {
                                                    ajaxData[key] = res[key];
                                                } else {
                                                    ajaxData['up' + key] = res[key];
                                                }
                                            }
                                            return BwRule.Ajax.fetch(tools.url.addObj(CONF.ajaxUrl.personPassword, { isAdmin: 1 }, false), {
                                                type: 'POST',
                                                data: JSON.stringify([ajaxData])
                                            }).then(({ response }) => {
                                                return new Promise((resolve) => {
                                                    if (response.errorCode === 0) {
                                                        resolve(true);
                                                        Modal.alert(response.msg, '温馨提示', () => {
                                                            ButtonAction.get().btnRefresh(btn.data.refresh, this.pageUrl);
                                                        })
                                                    } else {
                                                        resolve(false);
                                                        Modal.alert(response.msg);
                                                    }
                                                })
                                            })
                                        }
                                    })
                                }
                            } else if (btn.data.openType.indexOf('flow') > -1) {
                                // 流程引擎操作按钮
                                let btnUi = btn.data as R_Button,
                                    { multiselect, selectionFlag } = btnUi,
                                    selectedData = multiselect === 2 && selectionFlag ?
                                        ftable.unselectedRowsData : ftable.selectedRowsData;
                                let select = multiselect === 1 ? selectedData[0] : selectedData,
                                    dataAddr = BW.CONF.siteUrl + btnUi.actionAddr.dataAddr,
                                    varList = btnUi.actionAddr.varList;
                                if (tools.isNotEmpty(varList)) {
                                    varList.forEach((li, index) => {
                                        let name = li.varName;
                                        for (let key in select) {
                                            if (key === name) {
                                                if (index === 0) {
                                                    dataAddr += '?';
                                                } else {
                                                    dataAddr += '&';
                                                }
                                                dataAddr = dataAddr + `${key.toLowerCase()}=${select[key]}`
                                            }
                                        }
                                    })
                                }
                                let field = btn.data.openType.split('-')[1];
                                switch (field) {
                                    case 'look': {
                                        BwRule.Ajax.fetch(dataAddr).then(({ response }) => {
                                            new FlowDesigner(response, field);
                                        }).catch(err => {
                                            console.log(err);
                                        });
                                    }
                                        break;
                                    case 'design': {
                                        BwRule.Ajax.fetch(dataAddr, {
                                            type: 'GET'
                                        }).then(({ response }) => {
                                            new FlowDesigner(response, field);
                                        }).catch(err => {
                                            console.log(err);
                                        });
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
                                console.log('popup000000--=========');
                                box.children.forEach((button) => {
                                    button && (button.isDisabled = true);
                                });
                                let spinner = new Spinner({
                                    el: btn.wrapper,
                                    type: Spinner.SHOW_TYPE.replace,
                                    time: 5000,
                                    onTimeout: () => {
                                        box.children.forEach((button) => {
                                            button && (button.isDisabled = false);
                                        });
                                        // Modal.toast('当前网络不佳～');
                                    }
                                });
                                spinner.show();
                                let btnUi = btn.data as R_Button,
                                    { multiselect, selectionFlag } = btnUi,
                                    selectedData = multiselect === 2 && selectionFlag ?
                                        ftable.unselectedRowsData : ftable.selectedRowsData;
                                let linkedData = this.linkedData || {};
                                let select = multiselect === 1
                                    ? Object.assign({}, linkedData, selectedData[0] || {})
                                    : (
                                        multiselect === 2
                                            ? selectedData.map((o) =>
                                                Object.assign({}, linkedData || {}, o))
                                            : null
                                    );
                                select = tools.isEmpty(select) ? Object.assign({}, linkedData) : select;

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
                                                console.log('0----------------');
                                                box.children.forEach((button) => {
                                                    button && (button.isDisabled = false);
                                                });
                                                spinner && spinner.hide();
                                            }, this.pageUrl, this.ui.itemId);
                                        }
                                    }, 50);

                                } else {
                                    window.localStorage.removeItem('nextKeyField');
                                    window.localStorage.removeItem('currentKeyField');
                                    ButtonAction.get().clickHandle(btnUi, select, (res) => {
                                        console.log('1111111');
                                        box.children.forEach((button) => {
                                            button && (button.isDisabled = false);
                                        });
                                        spinner && spinner.hide();
                                    }, this.pageUrl, this.ui.itemId);
                                }
                            }
                        }).catch(() => {

                        })

                    }
                });
                if (btn.data.openType === 'stopLocation') {
                    btn.className = "stop_location"
                }
                if (btn.data.openType === 'startLocation') {
                    btn.className = "start_location"
                }
                box.addItem(btn);
            });

            // 根据选中行数判断按钮是否可操作
            this.ftable.off(FastTable.EVT_SELECTED, handler);
            this.ftable.on(FastTable.EVT_SELECTED, handler = () => {
                btnRefresh();
            });
        };

        return {
            init,
            get box() {
                return box
            },
            initState: btnRefresh
        }
    })();

    modify = (() => {
        let self = this,
            box: InputBox,
            isEdit = true;
        let start = () => {
            if (!isEdit) {
                return Promise.reject();
            }
            btnStatus.start();
            return this.edit.start();
        };

        let btnStatus = {
            end: () => {
                let status = this.edit.editBtnStateInit(box, false);
                if (status.edit) {
                    dbclick.on();
                } else {
                    dbclick.off();
                }
            },
            start: () => {
                this.edit.editBtnStateInit(box, true);
                dbclick.off();
            }
        };

        let dbclick = (() => {
            let selector = '.section-inner-wrapper:not(.pseudo-table) tbody td:not(.cell-img)',
                handler = function () {
                    self.tableModule && self.tableModule.editManage.start(self).then(() => {
                        this.click();
                    });
                };
            return {
                on: () => {
                    !this.isModalEdit && d.on(this.wrapper, 'dblclick', selector, handler);
                },
                off: () => {
                    d.off(this.wrapper, 'dblclick', selector, handler);
                }
            }
        })();
        return {
            set isCanEdit(flag: boolean) {
                isEdit = flag;
                isEdit ? dbclick.on() : dbclick.off();
            },
            insert: () => {
                if (!isEdit) {
                    return;
                }
                btnStatus.start();
                this.edit.insert();
            },
            delete: () => {
                if (!isEdit) {
                    return;
                }
                btnStatus.start();
                this.edit.del();
            },
            start: () => {
                return start();
            },
            end: () => {
                btnStatus.end();
                this.edit.cancel();
            },
            save: () => {
                return this.edit.save();
            },
            init(inputBox: InputBox, isChangeBtnStatus = true) {
                box = inputBox;
                isChangeBtnStatus && this.end();
            },
            get box() {
                return box;
            }
        }
    })();

    protected _btnWrapper: HTMLElement;
    get btnWrapper() {
        if (!this._btnWrapper) {
            // debugger;
            if (tools.isMb) {
                console.log('footer bar');
                d.classAdd(this.wrapper, 'has-footer-btn');
                this._btnWrapper = <footer className="mui-bar mui-bar-footer" />;
                //
                d.append(this.wrapper, this._btnWrapper);
                if (this.tableModule && ((this.tableModule.editType === 'linkage'
                    && this.tableModule.editable && tools.isNotEmpty(this.ui.subButtons))
                    || (this.tableModule.editType === 'self')
                    && this.editParam && tools.isNotEmpty(this.ui.subButtons))) {
                    let btnWrapper = <div className="all-btn" />;

                    new CheckBox({
                        className: 'edit-toggle',
                        container: this._btnWrapper,
                        onClick: (isChecked) => {
                            this.subBtns.box.isShow = !isChecked;
                            this.modify.box.isShow = isChecked;
                            if (!isChecked) {
                                this.subBtns.box.responsive();
                            }
                        }
                    });

                    d.append(this._btnWrapper, btnWrapper);
                    this._btnWrapper = btnWrapper;
                }

            } else {
                this._btnWrapper = this.ftable.btnWrapper
            }
        }
        return this._btnWrapper;
    }

    edit = (() => {
        let self = this,
            editModule: EditModule,
            EditConstruct: typeof EditModule,
            handler: Function,
            validList: Promise<any>[] = [];


        let cancel = () => {
            closeCellInput();
            this.ftable && this.ftable.editorCancel();
            validList = [];
        };

        let start = (): Promise<void> => {
            // debugger;
            if (this.ftable && this.ftable.editing) {
                return Promise.resolve();
            }

            return Promise.all([
                editModuleLoad(),
                this.rowDefData
            ]).then(([TableEditModule, defData]) => {

                tableEditInit(TableEditModule, this, Object.assign({}, defData, this.linkedData || {}));
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
                }),
                container: this.container,
                cols: this.ui.cols
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

                    let com = BwRule.isImage(field.atrrs && field.atrrs.dataType) ? null : editModule.init(col.name, {
                        dom: cell.wrapper,
                        data: row.data,
                        isNewData: true,
                        field,
                        onExtra: (data, relateCols, isEmptyClear = false, isValid = true, isReplace = false) => {
                            if (tools.isEmpty(data) && isEmptyClear) {
                                // table.edit.modifyTd(td, '');
                                cell.data = '';
                                return;
                            }
                            //TODO 给row.data赋值会销毁当前cell的input
                            // row.data = Object.assign({}, row.data, data);
                            for (let key in data) {
                                let hCell = row.cellGet(key);
                                if (hCell && (isReplace || hCell !== cell)) {
                                    let cellData = tools.isEmpty(data[key]) ? '' : data[key];
                                    if (hCell.data != cellData) {
                                        hCell.data = cellData;
                                    }
                                }
                            }
                            let content = cell.column.content as R_Field;
                            console.log(isValid);
                            if (isValid && content.assignSelectFields && content.assignSelectFields[0]) {
                                validate(editModule, cell);
                            }
                            if (field.elementType === 'lookup') {
                                let lookUpKeyField = field.lookUpKeyField,
                                    hCell = row.cellGet(lookUpKeyField);
                                if (hCell && hCell.column) {
                                    let hField = hCell.column.content as R_Field;
                                    hCell !== cell && (hCell.data = data[lookUpKeyField]);

                                    if (hField.assignSelectFields && hField.assignAddr) {
                                        BwTableModule.initAssignData(hField.assignAddr, row ? row.data : {})
                                            .then(({ response }) => {
                                                let data = response.data;
                                                if (data && data[0]) {
                                                    hField.assignSelectFields.forEach((name) => {
                                                        let assignCell = row.cellGet(name);
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
                    });

                    // 设置默认值
                    if (com instanceof FormCom) {
                        let onSet = com.onSet;
                        com.onSet = null;
                        com.set(value);
                        com.onSet = onSet;
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
            bwTable.ftable.off(FastTable.EVT_CELL_EDIT_CANCEL, handler);
            bwTable.ftable.on(FastTable.EVT_CELL_EDIT_CANCEL, handler = (cell: FastTableCell) => {
                if (cell.isEdited) {
                    editModule ? editModule.assignPromise.then(() => {
                        // setTimeout(() => {
                        validList.push(validate(editModule, cell))
                        // }, 100);
                    }) : validList.push(validate(editModule, cell));
                }
            });
        };

        let validate = (editModule: EditModule, cell: FastTableCell, checkLinkCell = true): Promise<any> => {
            let promise: Promise<any> = new Promise((resolve, reject) => {
                let name = cell.name,
                    row = cell.row,
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
                } else if (field.assignSelectFields && field.assignSelectFields[0]) {
                    lookUpCell = fastRow.cellGet(field.assignSelectFields[0]);
                    if (lookUpCell && lookUpCell.column) {
                        field = lookUpCell.column.content;
                        result = editModule.validate.start(lookUpCell.name, lookUpCell.data);
                    }
                } else {
                    result = editModule.validate.start(name, cell.data);
                }

                let errorMsg = result && (result[name] || result[field.name]);
                if (errorMsg) {
                    cell.errorMsg = errorMsg.errMsg;
                    // lookUpCell && (lookUpCell.errorMsg = errorMsg.errMsg);
                    resolve();
                    // callback(td, false);
                } else if (field.chkAddr/* && tools.isNotEmpty(rowData[name])*/) {
                    if (checkLinkCell && Array.isArray(this.ui.cols)) {
                        let chkName = field.name;
                        for (let col of this.ui.cols) {
                            // 不存在chkAddr不继续验证
                            if (!col.chkAddr || !Array.isArray(col.chkAddr.varList)) {
                                continue;
                            }
                            let varList = col.chkAddr.varList,
                                fieldName = col.name;

                            // 字段名一样不继续验证
                            if (fieldName === name || fieldName === chkName) {
                                continue;
                            }

                            // chkAdd.varList包含修改的cell的字段则不继续验证
                            if (!varList.some(({ varName }) => varName === chkName)) {
                                continue;
                            }
                            let linkCell: FastTableCell = row ? row.cellGet(fieldName) as FastTableCell : null;

                            // 此时未触发编辑事件，需给予延时
                            setTimeout(() => {
                                // 判断linkCell是否处于编辑状态，否则不予验证
                                linkCell && !linkCell.editing && validList.push(validate(editModule, linkCell, false));
                            }, 100);

                        }
                    }
                    EditConstruct.checkValue(field, rowData, () => {
                        if (this.ftable && this.ftable.editing) {
                            lookUpCell && (lookUpCell.data = null);
                            cell.data = null;
                        }
                    }, name)
                        .then((res) => {
                            let { errors, okNames } = res;
                            Array.isArray(errors) && errors.forEach(err => {
                                let { name, msg } = err,
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
                        }).catch(() => reject());
                } else {
                    cell.errorMsg = '';
                    // lookUpCell && (lookUpCell.errorMsg = '');
                    resolve();
                    // callback(td, true);
                }
            }).then(() => {
                cell.isChecked = true;
            }).finally(() => {
                let index = validList.indexOf(promise);
                if (index > -1) {
                    validList.splice(index, 1);
                }
            });
            // debugger;
            return promise
        };

        let editModuleLoad = (): Promise<typeof EditModule> => {
            return new Promise((resolve) => {
                require(['EditModule'], (edit) => {
                    EditConstruct = edit.EditModule;
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
                        if (!paramData.allData) {
                            paramData.allData = {};
                        }
                        paramData.allData[key] = tableData[dataKey]
                    }
                }
            });

            if (!tools.isEmpty(paramData)) {
                paramData.itemId = varList.itemId;
            }
            return paramData;
        };

        let editDataGet = () => {
            let bwTable = this;

            if (!bwTable || !bwTable.ftable || !bwTable.ftable.editedData) {
                return;
            }

            let editData = bwTable.ftable.editedData,
                isPivot = editData.isPivot;
            delete editData.isPivot;
            if (this.linkedData) {
                // 带上当前主表的字段
                let mainData = this.linkedData;
                for (let key in editData) {
                    if (tools.isNotEmpty(editData[key])) {
                        editData[key].forEach((obj, i) => {
                            editData[key][i] = Object.assign({}, mainData, obj)
                        });
                    }
                }
            }

            return editParamDataGet(editData, bwTable.editParam, isPivot);
        };

        let insert = () => {
            (this.ftable.editing ? Promise.resolve() : start())
                .then(() => {
                    let ftable = this.ftable;
                    ftable.rowAdd();
                    ftable.clearSelectedRows();
                    let firstRow = ftable.rows[0];
                    firstRow && (firstRow.selected = true);
                })
        };

        let cellCheckValue = () => {
            return Promise.all(this.ftable.editedCells.map((cell) => {
                if (!cell.isChecked && !cell.isVirtual && cell.show && !cell.disabled) {
                    return validate(editModule, cell);
                } else {
                    return Promise.resolve();
                }
            }));
        };

        let closeCellInput = () => {
            let ftable = this.ftable;

            ftable && ftable.closeCellInput();
        };

        let save: () => Promise<obj> = () => {
            return new Promise((resolve, reject) => {
                let loading = new Loading({
                    msg: '验证中...',
                    disableEl: this.wrapper
                });
                closeCellInput();
                setTimeout(() => {
                    (editModule && editModule.assignPromise ? editModule.assignPromise : Promise.resolve()).then(() => {
                        Promise.all(validList).then(() => {
                            cellCheckValue().then(() => {
                                setTimeout(() => {
                                    let saveData = editDataGet();
                                    this.saveVerify.then(() => {
                                        if (tools.isNotEmpty(saveData)) {
                                            let data = saveData['allData']['update'] || [],
                                                pictureAddrList = this.ui.pictureAddrList;

                                            if (pictureAddrList) {
                                                pictureAddrList.forEach((addr) => {
                                                    this.updateImgVersion(data.map((rowData) => {
                                                        return tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(addr, rowData), this.ajaxData, true, true)
                                                    }));
                                                })
                                            }
                                            delete saveData['allData'];
                                        }
                                        resolve(saveData);
                                    }).catch((msg) => reject(msg));
                                }, 100);
                            }).catch(() => reject('noMessage')).finally(() => {
                                loading && loading.hide();
                                loading = null;
                            });
                        }).catch(() => {
                            loading && loading.hide();
                            loading = null;
                            reject('noMessage');
                        }).finally(() => {
                            validList = [];
                        })

                    })
                }, 200)
            })
        };

        let del = () => {
            let ftable = this.ftable;
            (ftable.editing ? Promise.resolve() : start())
                .then(() => {
                    ftable.rowDel(ftable.selectedRows.map(row => row.index));

                })
        };

        let cellCanInit = (col, type) => {
            let field = col.content || {};
            return type === 1 ? !field.noModify : !field.noEdit;
        };
        let rowCanInit = (row, isSub) => {
            let canRowInit = (isMain: boolean, rowData?: obj) => {
                // if (isMain) {
                return !(rowData && (rowData['EDITEXPRESS'] === 0));
                // } else {
                //     let ftable = self.ftable,
                //         index = ftable.pseudoTable.presentOffset,
                //         row = ftable.rowGet(index),
                //         mainRowData = row ? row.data : {};
                //
                //     return canRowInit(true, mainRowData)
                // }
            };

            return tools.isEmpty(row) ? false : canRowInit(!isSub, row.data);
            //当为0时不可编辑
        };

        let editBtnStateInit = (box: InputBox, isStart = true) => {
            let status = {
                edit: isStart ? false : editVarHas(this.editParam, ['update']),
                insert: editVarHas(this.editParam, ['insert']),
                del: editVarHas(this.editParam, ['delete']),
                save: isStart,
                cancel: isStart,
                // "modal-edit": isStart ? false : editVarHas(this.editParam, ['update']),
                // "modal-insert": isStart ? false : editVarHas(this.editParam, ['insert'])
            };

            if (box) {
                for (let key in status) {
                    let btn = box.getItem(key);
                    btn && (btn.isDisabled = !status[key]);
                }
            }
            return status;
        };

        return {
            start,
            cancel,
            save,
            insert,
            del,
            cellCanInit,
            rowCanInit,
            editBtnStateInit
        }
    })();

    updateImgVersion(urls: string[]) {
        if (tools.isEmpty(urls)) {
            return;
        }

        let idb = new NewIDB(BwRule.IMG_CACHE_CONF);
        idb.getCollection(BwRule.IMG_TABLE).then(store => {
            store.find((val) => {
                return urls.indexOf(val['url']) > -1;
            }).then((response) => {
                let data = response || [];
                for (let url of urls) {
                    if (tools.isEmpty(url)) {
                        continue;
                    }
                    if (data.some((item) => item['url'] === url)) {
                        // update
                        store.update((val) => {
                            return url === val['url'];
                        }, () => ({
                            url: url,
                            version: new Date().getTime()
                        }));
                    } else {
                        // insert
                        store.insert({
                            url: url,
                            version: new Date().getTime()
                        });
                    }
                }
            })
        })
    }

    protected modalEdit: BwTableEditModule;

    initModalEdit(data?: obj): BwTableEditModule {
        if (this.modalEdit) {
            return this.modalEdit;
        }

        return this.modalEdit = new BwTableEditModule({
            container: this.container,
            fields: this.cols,
            defaultData: data,
            title: this.ui.caption,
            bwTable: this,
        });
    }

    modalEditCancel() {
        this.modalEdit && this.modalEdit.destroy();
        this.modalEdit = null;
    }

    // 关联数据，每次按钮请求时需附带的参数
    public linkedData = {};

    get saveVerify() {
        return new Promise((resolve, reject) => {
            let errorMsg = this.ftable.errorMsg;
            if (!errorMsg) {
                resolve();
            } else {
                reject(errorMsg);
            }
        });
    }

    static initAssignData(assignAddr: R_ReqAddr, data: obj) {
        return BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(assignAddr, data), {
            cache: true,
        })
    }

    destroy() {
        super.destroy();
        this.ftable.destroy();
        this.imgEdit.destroy();
        this.ftable = null;
        this.edit = null;
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
