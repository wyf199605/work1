/// <amd-module name="LeBaseTableModule"/>
import {LeRule} from "../../common/rule/LeRule";
import d = G.d;
import tools = G.tools;
import {FastTable, IFastTableCol, IFastTablePara} from "../../../global/components/newTable/FastTable";
import CONF = LE.CONF;
import {FastTableCell} from "../../../global/components/newTable/FastTableCell";
import Component = G.Component;
import IComponentPara = G.IComponentPara;
import {LeTableModule} from "./LeTableModule";
import {LeButtonGroup} from "../LeButton/LeButtonGroup";
import {FastTableColumn} from "../../../global/components/newTable/FastTabelColumn";
import {LayoutImage} from "../../../global/components/view/LayoutImg/LayoutImage";
import {Modal} from "../../../global/components/feedback/modal/Modal";


export interface ILeTableModulePara extends IComponentPara {
    ui: ILE_Table;
    isSub?: boolean;
    ajaxData?: obj;
    tableModule: LeTableModule;
}
const BTN_COL_NAME = '__BTN_COL_NAME__';
export class LeBaseTable extends Component {

    protected wrapperInit(para: ILeTableModulePara): HTMLElement {
        return <div className="table-module-wrapper"/>;
    }

    protected tableModule: LeTableModule;
    protected readonly hasQuery: boolean;
    public ui: ILE_Table;

    protected btnsLinkName: string[] = [];

    protected ajax = new LeRule.Ajax();

    public ftable: FastTable;

    protected colButtons: ILE_Button[];

    public readonly isSub: boolean;
    constructor(para: ILeTableModulePara) {
        super(para);

        this.isSub = !!para.isSub;

        // LeRule.beforeHandle.table(para.ui);
        let ui = this.ui = para.ui;

        this.hasQuery = !!ui.queryId;
        this.tableModule = para.tableModule;

        this.colButtons = (ui.button || []).filter(button => button.multi === 1);
        this.fieldsInit(ui.fieldnames || ui['filednames']);

        let subBtns = ui.button;
        this.btnsLinkName = Array.isArray(subBtns) ? subBtns.filter(btn => btn.buttonName).map(btn => btn.buttonName) : [];


        this.ftableInit(para.ajaxData);

    }

    private get baseFtablePara(): IFastTablePara {
        return {
            cols: null,
            container: this.wrapper,
            pseudo: {
                type: 'number',
                multi: false
            },
            sort: true,
            maxHeight: 420 ,
            // maxWidth: 200,
            dragSelect: 'multivalue' in this.ui ? !!this.ui.multivalue : true,
            clickSelect: true,
            // isResizeCol: tools.isPc,
            // colCount: this.isDrill,
            cellFormat: (cellData, cell: FastTableCell) => {
                let col = cell.column;

                return col ? this.cellFormat(col, cellData, cell.row.index) : {text: cellData};
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
                            colorStr = `rgb(${r},${g},${b}`;

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
                size: 10,
                options: [10, 30, 50, 100],
            },
            menu: [{
                title: '复制单元格',
                onClick: () => {
                    tools.copy(this.ftable.selectedCells
                        .filter(cells => tools.isNotEmpty(cells))
                        .map(cells => cells.map(cell => cell.text).join("\t"))
                        .join("\r\n"));
                }
            }, null, {
                colMulti: 1,
                title: '复制列',
                onClick: (cell, rows, columns) => {
                    let col = columns[0];
                    if (col) {
                        let cells = [...col.cells[0], ...col.cells[1]].map(cell => cell.text).join("\r\n");
                        tools.copy(cells)
                    }
                }
            },
            //     {
            //     colMulti: 1,
            //     title: '锁定/解锁列',
            //     onClick: (cell) => {
            //         let isFixed = cell.column.isFixed;
            //         cell.column.isFixed = !isFixed;
            //         Modal.toast(isFixed ? '已锁定' : '已解锁');
            //     }
            // },
                {
                title: '列排序',
                onClick: () => {
                    this.ftable.colsSort.open();
                }
            }, {
                rowMulti: 1,
                title: '列复制',
                children: this.fields.filter(col => !col.showFlag).map(col => {
                    return {
                        title: col.caption,
                        onClick: (cell: FastTableCell) => {
                            tools.copy(cell.frow.data[col.name]);
                        }
                    }
                })
            }]
        }
    }

    private ftableInit(ajaxData?: obj) {
        let ui = this.ui,
            cols = this.colParaGet(this.fields);

        if(tools.isNotEmpty(this.colButtons)) {
            cols[0].unshift({
                isFixed: true,
                title : "操作",
                name: BTN_COL_NAME,
                minWidth: this.colButtons.length * 90,
                maxWidth: this.colButtons.length * 90

            })
        }
        this.ftable = new FastTable(
            Object.assign(this.baseFtablePara, {
                isLockRight: true,
                cols: cols,
                ajax: {
                    ajaxData,
                    once: ui.multPage !== 1, // =1时后台分页, 0 不分页, 2,前台分页
                    auto: true,
                    fun: ({pageSize, current, sort, custom}) => {
                        let url = LeRule.linkParse2Url(ui.link);
                        pageSize = pageSize === -1 ? 3000 : pageSize;

                        let pagesortparams = Array.isArray(sort) ?
                            JSON.stringify(
                                sort.map(s => `${s[0]},${s[1].toLocaleLowerCase()}`)
                            ) : '';

                        return Promise.all([
                            this.ajax.fetch(url, {
                                timeout: 30000,
                                data: Object.assign({
                                    pageparams: `{"index"=${current + 1},"size"=${pageSize},"total"=1}`,
                                    pagesortparams
                                }, custom)
                            }),
                            this.lookup
                        ]).then(([{response}]) => {
                            let {data, head} = response.data;
                            // this.sectionField(data, response.data.body.meta);
                            // // console.log(response);
                            return {
                                data : data || [],
                                total: head ? head.totalNum : 0,
                            };
                        });
                    }
                }
            })
        );


        // !this.isDrill && this.ftable.btnAdd('filter', {
        //     type: 'default',
        //     icon: 'sousuo',
        //     content: '本地过滤',
        //     onClick: () => {
        //         this.filter.init();
        //     },
        // }, 1);


        this.ftableReady();

        // this.ftable.on(FastTable.EVT_TABLE_COL_CHANGE, (ev) => {
        //     LeRule.Ajax.fetch(`${CONF.siteAppVerUrl}/setting/${this.ui.settingId}`, {
        //         type: 'put',
        //         data2url: true,
        //         data: {
        //             columnorderparam: JSON.stringify( ev.data)
        //         },
        //     }).then(() => {
        //         Modal.toast('修改成功');
        //     }).catch((e) => {
        //         console.log(e);
        //         Modal.toast('修改失败');
        //     })
        // })
    }

    protected ftableReady() {
        this.clickInit();
        this.aggregate.get(this.ajaxData);
        // this.ftable.on(FastTable.EVT_RENDERED, () => {
        //     this.ftable.
        // })
    }

    public aggregate = (() => {
        let aggrWrap: HTMLElement = null,
            urlData: obj = null;

        /**
         * 初始化
         * @return {boolean} - 初始成功或者失败
         */
        let init = () => {
            if (!Array.isArray(this.ui.aggregates) || !this.ui.aggregates[0]) {
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
            this.ui.aggregates.forEach(aggr => {
                aggr.caption = this.tableModule.fieldGet(aggr.fieldname).caption;

                let valSpan = <div className="aggregate-text">{aggr.caption}: </div>;
                d.append(aggrWrap, valSpan);
                LeRule.linkReq(aggr.link, urlData)
                    .then(({response}) => {
                        let data = response.data.data;
                        if(data[0]){
                            valSpan.innerHTML = `${aggr.caption}: <span style="color:#009bff">${data[0][aggr.fieldname] || ''}</span>`;
                        }
                    });
            });
        };

        return {get};
    })();


    private colParaGet(fields: ILE_Field[]): IFastTableCol[][] {
        let isAbsField = false,
            colsPara: IFastTableCol[][] = [[]],
            noShowCount = 0,
            noShowField = (this.ui.noShowField || "").split(',').map(field => field.toUpperCase());

        fields.forEach((field) => {
            let subCols = null,
                hasSubCol = isAbsField && Array.isArray(subCols) && subCols[0],
                isHide = noShowField.includes(field.name);

            if (!isHide) {
                noShowCount++;
            }

            colsPara[0].push({
                title: field.caption,
                name: field.name,
                content: field,
                // isFixed: noShowCount === 1,
                isNumber: LeRule.isNumber(field.dataType),
                isVirtual: isHide,
                colspan: hasSubCol ? subCols.length : 1, // 其他列有子列
                rowspan: isAbsField && !hasSubCol ? 2 : 1
            } as IFastTableCol);

            if (hasSubCol) {
                colsPara[1] = colsPara[1] || [];
                subCols.forEach((subCol) => {
                    colsPara[1].push({
                        title: subCol.caption,
                        name: subCol.name,
                        content: subCol,
                        isVirtual: noShowField.includes(subCol.name),
                        colspan: 1,
                        rowspan: 1
                    })
                });
            }
        });
        return colsPara;
    }

    protected _sectionField: string; // 分组字段
    sectionField(data: obj[], meta: string[]) {

        const sectionName = '分段';

        let ajaxData = this.ajaxData,
            optionsParam = ajaxData.queryoptionsparam && JSON.parse(ajaxData.queryoptionsparam);

        // 有分组字段是增加新的列
        if (optionsParam && optionsParam.sectionParams && optionsParam.sectionParams.sectionField) {
            let sectionField = optionsParam.sectionParams.sectionField,
                sectionTitle = '';

            // 防止重复添加
            if (sectionField !== this._sectionField) {
                for (let col of this.fields) {
                    if (col.name === sectionField) {
                        sectionTitle = col.caption;
                    }
                }

                this.ftable.columnAdd({
                    title: sectionTitle + '段',
                    name: sectionName
                });

                this._sectionField = sectionField;
            }

        } else {
            // 没有分段时删除分段字段
            this._sectionField && this.ftable.columnDel(this._sectionField);
        }

        if (tools.isNotEmpty(data)) {
            // 隐藏无数据的字段
            this.ftable.columns.forEach(column => {
                column.show = meta.includes(column.name) || column.name === BTN_COL_NAME
            })
        }
    }

    private _lookUpData: objOf<ListItem[]> = {};
    get lookUpData() {
        return this._lookUpData || {};
    }

    private lookUps: objOf<ILE_TableEditSelect> = {};

    private get lookup(): Promise<void> {
        if (tools.isEmpty(this._lookUpData)) {
            (tools.keysVal(this.ui, 'edit', 'selects') || []).forEach(obj => {
                this.lookUps[obj.fieldname] = obj
            });

            let allPromise = this.fields
                .filter(col => this.lookUps[col.name])
                .map(col => LeRule.getLookUpOpts(this.lookUps[col.name]).then((items) => {
                    this._lookUpData = this._lookUpData || {};
                    this._lookUpData[col.name] = items;
                }).catch((e) => console.log(e)));

            return Promise.all(allPromise).then(() => {
            })
        } else {
            return Promise.resolve();
        }
    }

    protected tdClickHandler(field: ILE_Field, rowData: obj) {
        // 判断是否为link
        // let link = field.link;
        // if (link && (field.endField ? rowData[field.endField] === 1 : true)) {
        //     // LeRule.link({
        //     //     link: link.dataAddr,
        //     //     varList: link.varList,
        //     //     dataType: field.atrrs.dataType,
        //     //     data: rowData
        //     // });
        //     return;
        // }

        // 是否为钻取
        // let url = drillUrlGet(field, rowData, this.ui.keyField);
        // if (url) {
        //     // sys.window.open({url});
        // }
    };

    protected clickInit() {
        let ftable = this.ftable,
            clickableSelector = '.section-inner-wrapper:not(.pseudo-table) tbody',
            tdSelector = `${clickableSelector} td`,
            trSelector = `${clickableSelector} tr`,
            self = this;

        ftable.click.add(`${tdSelector}:not(.cell-img)`, function (e: MouseEvent) {
            if(e.altKey || e.ctrlKey || e.shiftKey){
                return;
            }

            let rowIndex = parseInt(this.parentNode.dataset.index),
                colName = this.dataset.name,
                field: ILE_Field = ftable.columnGet(colName).content,
                rowData = ftable.rowGet(rowIndex).data;

            self.tdClickHandler(field, rowData);
            // if (field.link && !colIsImg && (field.endField ? rowData[field.endField] === 1 : true)) {
        });

        // 点击显示图片， 判断是否存在缩略图
        let hasThumbnail = this.fields.some(col => LeRule.isImage(col.dataType));

        let imgHandler = function (e:MouseEvent) {
            if(e.altKey || e.ctrlKey || e.shiftKey){
                return;
            }
            let index = parseInt( this.parentElement.dataset.index),
                name = this.dataset.name;

            self.multiImgEdit.show(name, self.ftable.tableData.rowDataGet(index)[name]);

        };

        if(hasThumbnail){
            d.on(ftable.wrapper, 'click', `${tdSelector}.cell-img:not(.disabled-cell)`, tools.pattern.throttling(imgHandler, 1000))
        }
    }

    get ajaxData() {
        return this.ftable.tableData.ajaxData;
    }

    refresh(data?: obj) {
        return this.ftable.tableData.refresh(data);
    }

    // protected fastTableInit

    // protected pageContainer: HTMLElement;
    // protected _pageUrl: string;
    // get pageUrl() {
    //     if (!this._pageUrl) {
    //         if (tools.isMb) {
    //             this._pageUrl = location.href;
    //         } else {
    //             let pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
    //             this.pageContainer = pageContainer;
    //             this._pageUrl = pageContainer ? pageContainer.dataset.src : '';
    //         }
    //     }
    //     return this._pageUrl;
    // }


    // protected _rowDefData: obj;
    // get rowDefData(): Promise<obj> {
    //     return new Promise((resolve, reject) => {
    //         if (tools.isNotEmpty(this._rowDefData)) {
    //             resolve(this._rowDefData);
    //         } else {
    //             let data = LeRule.getDefaultByFields(this.fields),
    //                 defAddrs = this.ui.defDataAddrList;
    //
    //             if (tools.isNotEmpty(defAddrs)) {
    //                 Promise.all(defAddrs.map(url => {
    //                     return LeRule.Ajax.fetch(CONF.siteUrl + LeRule.reqAddr(url))
    //                         .then(({response}) => {
    //                             data = Object.assign(data, response.data[0] || {})
    //                             // cb();
    //                         });
    //                 })).then(() => {
    //                     this._rowDefData = data;
    //                     resolve(data);
    //                 }).catch(() => {
    //                     reject()
    //                 })
    //             } else {
    //                 this._rowDefData = data;
    //                 resolve(data);
    //             }
    //         }
    //     })
    // }

    protected _fields: ILE_Field[];

    protected fieldsInit(cols: {fieldname: string, type: string}[]) {
        this._fields = cols.map(col => this.tableModule.fieldGet(col.fieldname)).filter(col => tools.isNotEmpty(col))
    }

    get fields() {
        return this._fields
    }

    private cellFormat(col: FastTableColumn, cellData: any, rowIndex: number) {
        let text: string | Node = cellData,
            color: string,
            bgColor: string,
            classes: string[] = [],
            rowData = this.ftable.tableData.rowDataGet(rowIndex);

        if (col && col.show) {
            let field = col.content || {},
                dataType = field.dataType,
                isImg = LeRule.isImage(dataType);

            if (dataType === LeRule.DT_MUL_IMAGE) {
                // 缩略图
                // let
                if(typeof cellData === 'string' && cellData[0]) {
                    let urls = cellData.split(',')
                        .map(md5 => LeRule.imgUrlGet(md5, field.name, true))
                        .filter(url => url);

                    if(tools.isNotEmptyArray(urls)) {
                        text = new LayoutImage({urls}).wrapper;
                    }
                }

                classes.push('cell-img');

            } else
            if (col.name === 'STDCOLORVALUE') {
                // 显示颜色
                let {r, g, b} = tools.val2RGB(cellData);
                text = <div style={`backgroundColor: rgb(${r},${g},${b})`} height="100%"></div>;

            } else if (this.lookUps[field.name]) {
                // lookUp替换
                let lookup = this.lookUps[field.name],
                    options = this.lookUpData[field.name] || [];

                for (let opt of options) {
                    if (opt.value == rowData[lookup.relateFields]) {
                        text = opt.text;
                    }
                }
            } else if (col.name === BTN_COL_NAME) {
                    classes.push('td-btn');
                text = new LeButtonGroup({
                    buttons: this.colButtons,
                    dataGet: () => this.ftable.tableData.rowDataGet(rowIndex)
                }).wrapper;
            } else {
                // 其他文字
                text = LeRule.formatTableText(cellData, field);
            }

            // 时间
            if (cellData && LeRule.isTime(dataType)) {
                text = LeRule.strDateFormat(cellData, field.displayFormat);
            }

            // 样式处理
            if (LeRule.isNumber(dataType)) {
                classes.push('text-right');
            }


            // if (field.link && !isImg && (field.endField ? rowData[field.endField] === 1 : true)) {
            //     color = 'blue';
            // }

            if (this.btnsLinkName.includes(field.name)) {
                // attrs['data-click-type'] = 'btn';
                classes.push('blue');
            }

        }

        return {text, classes, bgColor, color};

    }

    protected multiImgEdit = (() => {
        let modal: Modal = null;

        let imgCreate = (url: string) => {
            return <div className="img">
                <img src={url}/>
            </div>
        };

        let show = (fieldName: string, md5str: string) => {
            let md5Arr: string[] = [];

            if(md5str && typeof md5str === 'string') {
                md5Arr = md5str.split(',');
            }

            if( tools.isEmpty(md5Arr) ) {
                return
            }

            let wrapper = <div className="table-img-wrapper">
                    <div className="table-img">
                        {md5Arr.map(md5 => imgCreate(LeRule.imgUrlGet(md5, fieldName)))}
                    </div>
                </div>;

            modal = new Modal({
                header: '图片查看',
                top: 80,
                body: wrapper,
                height:'80%',
                width: tools.isMb ? void 0 : '70%',
                position: 'down',
                isDrag: true,
                isOnceDestroy: true,
                className: 'modal-img'
            });
        };

        return {show};
    })();

    destroy(){
        super.destroy();
    }
}