define("LeBaseTableModule", ["require", "exports", "LeRule", "FastTable", "LeButtonGroup", "LayoutImage", "Modal"], function (require, exports, LeRule_1, FastTable_1, LeButtonGroup_1, LayoutImage_1, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var Component = G.Component;
    var BTN_COL_NAME = '__BTN_COL_NAME__';
    var LeBaseTable = /** @class */ (function (_super) {
        __extends(LeBaseTable, _super);
        function LeBaseTable(para) {
            var _this = _super.call(this, para) || this;
            _this.btnsLinkName = [];
            _this.ajax = new LeRule_1.LeRule.Ajax();
            _this.aggregate = (function () {
                var aggrWrap = null, urlData = null;
                /**
                 * 初始化
                 * @return {boolean} - 初始成功或者失败
                 */
                var init = function () {
                    if (!Array.isArray(_this.ui.aggregates) || !_this.ui.aggregates[0]) {
                        return false;
                    }
                    aggrWrap = h("div", { className: "aggr-wrapper" });
                    d.before(_this.ftable.wrapper, aggrWrap);
                    return true;
                };
                var get = function (data) {
                    if (aggrWrap === null && !init()) {
                        return; // 初始化失败
                    }
                    if (data) {
                        urlData = data;
                    }
                    aggrWrap.innerHTML = '';
                    _this.ui.aggregates.forEach(function (aggr) {
                        aggr.caption = _this.tableModule.fieldGet(aggr.fieldname).caption;
                        var valSpan = h("div", { className: "aggregate-text" },
                            aggr.caption,
                            ": ");
                        d.append(aggrWrap, valSpan);
                        LeRule_1.LeRule.linkReq(aggr.link, urlData)
                            .then(function (_a) {
                            var response = _a.response;
                            var data = response.data.data;
                            if (data[0]) {
                                valSpan.innerHTML = aggr.caption + ": <span style=\"color:#009bff\">" + (data[0][aggr.fieldname] || '') + "</span>";
                            }
                        });
                    });
                };
                return { get: get };
            })();
            _this._lookUpData = {};
            _this.lookUps = {};
            _this.multiImgEdit = (function () {
                var modal = null;
                var imgCreate = function (url) {
                    return h("div", { className: "img" },
                        h("img", { src: url }));
                };
                var show = function (fieldName, md5str) {
                    var md5Arr = [];
                    if (md5str && typeof md5str === 'string') {
                        md5Arr = md5str.split(',');
                    }
                    if (tools.isEmpty(md5Arr)) {
                        return;
                    }
                    var wrapper = h("div", { className: "table-img-wrapper" },
                        h("div", { className: "table-img" }, md5Arr.map(function (md5) { return imgCreate(LeRule_1.LeRule.imgUrlGet(md5, fieldName)); })));
                    modal = new Modal_1.Modal({
                        header: '图片查看',
                        top: 80,
                        body: wrapper,
                        height: '80%',
                        width: tools.isMb ? void 0 : '70%',
                        position: 'down',
                        isDrag: true,
                        isOnceDestroy: true,
                        className: 'modal-img'
                    });
                };
                return { show: show };
            })();
            _this.isSub = !!para.isSub;
            // LeRule.beforeHandle.table(para.ui);
            var ui = _this.ui = para.ui;
            _this.hasQuery = !!ui.queryId;
            _this.tableModule = para.tableModule;
            _this.colButtons = (ui.button || []).filter(function (button) { return button.multi === 1; });
            _this.fieldsInit(ui.fieldnames || ui['filednames']);
            var subBtns = ui.button;
            _this.btnsLinkName = Array.isArray(subBtns) ? subBtns.filter(function (btn) { return btn.buttonName; }).map(function (btn) { return btn.buttonName; }) : [];
            _this.ftableInit(para.ajaxData);
            return _this;
        }
        LeBaseTable.prototype.wrapperInit = function (para) {
            return h("div", { className: "table-module-wrapper" });
        };
        Object.defineProperty(LeBaseTable.prototype, "baseFtablePara", {
            get: function () {
                var _this = this;
                return {
                    cols: null,
                    container: this.wrapper,
                    pseudo: {
                        type: 'number',
                        multi: false
                    },
                    sort: true,
                    maxHeight: 420,
                    // maxWidth: 200,
                    dragSelect: 'multivalue' in this.ui ? !!this.ui.multivalue : true,
                    clickSelect: true,
                    // isResizeCol: tools.isPc,
                    // colCount: this.isDrill,
                    cellFormat: function (cellData, cell) {
                        var col = cell.column;
                        return col ? _this.cellFormat(col, cellData, cell.row.index) : { text: cellData };
                    },
                    rowFormat: function (rowData) {
                        var color = '', bgColor = '', attr = {};
                        // 行背景和文字变色
                        ['GRIDBACKCOLOR', 'GRIDFORECOLOR'].forEach(function (name, i) {
                            var colorVal = rowData[name];
                            if (colorVal) {
                                // 显示颜色
                                var _a = tools.val2RGB(colorVal), r = _a.r, g = _a.g, b = _a.b, colorStr = "rgb(" + r + "," + g + "," + b;
                                if (i === 0) {
                                    bgColor = colorStr;
                                }
                                else {
                                    color = colorStr;
                                }
                            }
                        });
                        return { color: color, bgColor: bgColor, attr: attr };
                    },
                    page: this.ui.multPage === 0 ? null : {
                        size: 10,
                        options: [10, 30, 50, 100],
                    },
                    menu: [{
                            title: '复制单元格',
                            onClick: function () {
                                tools.copy(_this.ftable.selectedCells
                                    .filter(function (cells) { return tools.isNotEmpty(cells); })
                                    .map(function (cells) { return cells.map(function (cell) { return cell.text; }).join("\t"); })
                                    .join("\r\n"));
                            }
                        }, null, {
                            colMulti: 1,
                            title: '复制列',
                            onClick: function (cell, rows, columns) {
                                var col = columns[0];
                                if (col) {
                                    var cells = col.cells[0].concat(col.cells[1]).map(function (cell) { return cell.text; }).join("\r\n");
                                    tools.copy(cells);
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
                            onClick: function () {
                                _this.ftable.colsSort.open();
                            }
                        }, {
                            rowMulti: 1,
                            title: '列复制',
                            children: this.fields.filter(function (col) { return !col.showFlag; }).map(function (col) {
                                return {
                                    title: col.caption,
                                    onClick: function (cell) {
                                        tools.copy(cell.frow.data[col.name]);
                                    }
                                };
                            })
                        }]
                };
            },
            enumerable: true,
            configurable: true
        });
        LeBaseTable.prototype.ftableInit = function (ajaxData) {
            var _this = this;
            var ui = this.ui, cols = this.colParaGet(this.fields);
            if (tools.isNotEmpty(this.colButtons)) {
                cols[0].unshift({
                    isFixed: true,
                    title: "操作",
                    name: BTN_COL_NAME,
                    minWidth: this.colButtons.length * 90,
                    maxWidth: this.colButtons.length * 90
                });
            }
            this.ftable = new FastTable_1.FastTable(Object.assign(this.baseFtablePara, {
                isLockRight: true,
                cols: cols,
                ajax: {
                    ajaxData: ajaxData,
                    once: ui.multPage !== 1,
                    auto: true,
                    fun: function (_a) {
                        var pageSize = _a.pageSize, current = _a.current, sort = _a.sort, custom = _a.custom;
                        var url = LeRule_1.LeRule.linkParse2Url(ui.link);
                        pageSize = pageSize === -1 ? 3000 : pageSize;
                        var pagesortparams = Array.isArray(sort) ?
                            JSON.stringify(sort.map(function (s) { return s[0] + "," + s[1].toLocaleLowerCase(); })) : '';
                        return Promise.all([
                            _this.ajax.fetch(url, {
                                timeout: 30000,
                                data: Object.assign({
                                    pageparams: "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}",
                                    pagesortparams: pagesortparams
                                }, custom)
                            }),
                            _this.lookup
                        ]).then(function (_a) {
                            var response = _a[0].response;
                            var _b = response.data, data = _b.data, head = _b.head;
                            // this.sectionField(data, response.data.body.meta);
                            // // console.log(response);
                            return {
                                data: data || [],
                                total: head ? head.totalNum : 0,
                            };
                        });
                    }
                }
            }));
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
        };
        LeBaseTable.prototype.ftableReady = function () {
            this.clickInit();
            this.aggregate.get(this.ajaxData);
            // this.ftable.on(FastTable.EVT_RENDERED, () => {
            //     this.ftable.
            // })
        };
        LeBaseTable.prototype.colParaGet = function (fields) {
            var isAbsField = false, colsPara = [[]], noShowCount = 0, noShowField = (this.ui.noShowField || "").split(',').map(function (field) { return field.toUpperCase(); });
            fields.forEach(function (field) {
                var subCols = null, hasSubCol = isAbsField && Array.isArray(subCols) && subCols[0], isHide = noShowField.includes(field.name);
                if (!isHide) {
                    noShowCount++;
                }
                colsPara[0].push({
                    title: field.caption,
                    name: field.name,
                    content: field,
                    // isFixed: noShowCount === 1,
                    isNumber: LeRule_1.LeRule.isNumber(field.dataType),
                    isVirtual: isHide,
                    colspan: hasSubCol ? subCols.length : 1,
                    rowspan: isAbsField && !hasSubCol ? 2 : 1
                });
                if (hasSubCol) {
                    colsPara[1] = colsPara[1] || [];
                    subCols.forEach(function (subCol) {
                        colsPara[1].push({
                            title: subCol.caption,
                            name: subCol.name,
                            content: subCol,
                            isVirtual: noShowField.includes(subCol.name),
                            colspan: 1,
                            rowspan: 1
                        });
                    });
                }
            });
            return colsPara;
        };
        LeBaseTable.prototype.sectionField = function (data, meta) {
            var sectionName = '分段';
            var ajaxData = this.ajaxData, optionsParam = ajaxData.queryoptionsparam && JSON.parse(ajaxData.queryoptionsparam);
            // 有分组字段是增加新的列
            if (optionsParam && optionsParam.sectionParams && optionsParam.sectionParams.sectionField) {
                var sectionField = optionsParam.sectionParams.sectionField, sectionTitle = '';
                // 防止重复添加
                if (sectionField !== this._sectionField) {
                    for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
                        var col = _a[_i];
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
            }
            else {
                // 没有分段时删除分段字段
                this._sectionField && this.ftable.columnDel(this._sectionField);
            }
            if (tools.isNotEmpty(data)) {
                // 隐藏无数据的字段
                this.ftable.columns.forEach(function (column) {
                    column.show = meta.includes(column.name) || column.name === BTN_COL_NAME;
                });
            }
        };
        Object.defineProperty(LeBaseTable.prototype, "lookUpData", {
            get: function () {
                return this._lookUpData || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LeBaseTable.prototype, "lookup", {
            get: function () {
                var _this = this;
                if (tools.isEmpty(this._lookUpData)) {
                    (tools.keysVal(this.ui, 'edit', 'selects') || []).forEach(function (obj) {
                        _this.lookUps[obj.fieldname] = obj;
                    });
                    var allPromise = this.fields
                        .filter(function (col) { return _this.lookUps[col.name]; })
                        .map(function (col) { return LeRule_1.LeRule.getLookUpOpts(_this.lookUps[col.name]).then(function (items) {
                        _this._lookUpData = _this._lookUpData || {};
                        _this._lookUpData[col.name] = items;
                    }).catch(function (e) { return console.log(e); }); });
                    return Promise.all(allPromise).then(function () {
                    });
                }
                else {
                    return Promise.resolve();
                }
            },
            enumerable: true,
            configurable: true
        });
        LeBaseTable.prototype.tdClickHandler = function (field, rowData) {
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
        ;
        LeBaseTable.prototype.clickInit = function () {
            var ftable = this.ftable, clickableSelector = '.section-inner-wrapper:not(.pseudo-table) tbody', tdSelector = clickableSelector + " td", trSelector = clickableSelector + " tr", self = this;
            ftable.click.add(tdSelector + ":not(.cell-img)", function (e) {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                var rowIndex = parseInt(this.parentNode.dataset.index), colName = this.dataset.name, field = ftable.columnGet(colName).content, rowData = ftable.rowGet(rowIndex).data;
                self.tdClickHandler(field, rowData);
                // if (field.link && !colIsImg && (field.endField ? rowData[field.endField] === 1 : true)) {
            });
            // 点击显示图片， 判断是否存在缩略图
            var hasThumbnail = this.fields.some(function (col) { return LeRule_1.LeRule.isImage(col.dataType); });
            var imgHandler = function (e) {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                var index = parseInt(this.parentElement.dataset.index), name = this.dataset.name;
                self.multiImgEdit.show(name, self.ftable.tableData.rowDataGet(index)[name]);
            };
            if (hasThumbnail) {
                d.on(ftable.wrapper, 'click', tdSelector + ".cell-img:not(.disabled-cell)", tools.pattern.throttling(imgHandler, 1000));
            }
        };
        Object.defineProperty(LeBaseTable.prototype, "ajaxData", {
            get: function () {
                return this.ftable.tableData.ajaxData;
            },
            enumerable: true,
            configurable: true
        });
        LeBaseTable.prototype.refresh = function (data) {
            return this.ftable.tableData.refresh(data);
        };
        LeBaseTable.prototype.fieldsInit = function (cols) {
            var _this = this;
            this._fields = cols.map(function (col) { return _this.tableModule.fieldGet(col.fieldname); }).filter(function (col) { return tools.isNotEmpty(col); });
        };
        Object.defineProperty(LeBaseTable.prototype, "fields", {
            get: function () {
                return this._fields;
            },
            enumerable: true,
            configurable: true
        });
        LeBaseTable.prototype.cellFormat = function (col, cellData, rowIndex) {
            var _this = this;
            var text = cellData, color, bgColor, classes = [], rowData = this.ftable.tableData.rowDataGet(rowIndex);
            if (col && col.show) {
                var field_1 = col.content || {}, dataType = field_1.dataType, isImg = LeRule_1.LeRule.isImage(dataType);
                if (dataType === LeRule_1.LeRule.DT_MUL_IMAGE) {
                    // 缩略图
                    // let
                    if (typeof cellData === 'string' && cellData[0]) {
                        var urls = cellData.split(',')
                            .map(function (md5) { return LeRule_1.LeRule.imgUrlGet(md5, field_1.name, true); })
                            .filter(function (url) { return url; });
                        if (tools.isNotEmptyArray(urls)) {
                            text = new LayoutImage_1.LayoutImage({ urls: urls }).wrapper;
                        }
                    }
                    classes.push('cell-img');
                }
                else if (col.name === 'STDCOLORVALUE') {
                    // 显示颜色
                    var _a = tools.val2RGB(cellData), r = _a.r, g = _a.g, b = _a.b;
                    text = h("div", { style: "backgroundColor: rgb(" + r + "," + g + "," + b + ")", height: "100%" });
                }
                else if (this.lookUps[field_1.name]) {
                    // lookUp替换
                    var lookup = this.lookUps[field_1.name], options = this.lookUpData[field_1.name] || [];
                    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                        var opt = options_1[_i];
                        if (opt.value == rowData[lookup.relateFields]) {
                            text = opt.text;
                        }
                    }
                }
                else if (col.name === BTN_COL_NAME) {
                    classes.push('td-btn');
                    text = new LeButtonGroup_1.LeButtonGroup({
                        buttons: this.colButtons,
                        dataGet: function () { return _this.ftable.tableData.rowDataGet(rowIndex); }
                    }).wrapper;
                }
                else {
                    // 其他文字
                    text = LeRule_1.LeRule.formatTableText(cellData, field_1);
                }
                // 时间
                if (cellData && LeRule_1.LeRule.isTime(dataType)) {
                    text = LeRule_1.LeRule.strDateFormat(cellData, field_1.displayFormat);
                }
                // 样式处理
                if (LeRule_1.LeRule.isNumber(dataType)) {
                    classes.push('text-right');
                }
                // if (field.link && !isImg && (field.endField ? rowData[field.endField] === 1 : true)) {
                //     color = 'blue';
                // }
                if (this.btnsLinkName.includes(field_1.name)) {
                    // attrs['data-click-type'] = 'btn';
                    classes.push('blue');
                }
            }
            return { text: text, classes: classes, bgColor: bgColor, color: color };
        };
        LeBaseTable.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        return LeBaseTable;
    }(Component));
    exports.LeBaseTable = LeBaseTable;
});

define("LeMainTableModule", ["require", "exports", "LeBaseTableModule"], function (require, exports, LeBaseTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var LeMainTableModule = /** @class */ (function (_super) {
        __extends(LeMainTableModule, _super);
        function LeMainTableModule(para) {
            var _this = _super.call(this, para) || this;
            d.classAdd(_this.wrapper, 'table-module-main');
            return _this;
        }
        // protected ftableReady(){
        //     super.ftableReady();
        //     // this.tableHeightInit()
        // }
        LeMainTableModule.prototype.tdClickHandler = function (field, rowData) {
            _super.prototype.tdClickHandler.call(this, field, rowData);
            // linkName 快捷点击按键
            // let fieldName = field.name;
            // if(this.btnsLinkName.includes(fieldName)) {
            //     let allBtn = (this.subBtns.box && this.subBtns.box.children) || [];
            //     for (let btn of allBtn) {
            //         let rBtn: R_Button = btn.data;
            //         if (rBtn && rBtn.linkName && rBtn.linkName === fieldName) {
            //
            //             // 等待表格行选中后
            //             setTimeout(() => {
            //                 btn.onClick.call(btn, null);
            //             }, 100);
            //         }
            //     }
            // }
        };
        LeMainTableModule.prototype.clickInit = function () {
            _super.prototype.clickInit.call(this);
            // let ftable = this.ftable;
            //
            // this.ftable.click.add(`${clickableSelector} tbody td`, function () {
            //     // 是否为快捷按钮
            //
            //
            //
            // });
        };
        return LeMainTableModule;
    }(LeBaseTable_1.LeBaseTable));
    exports.LeMainTableModule = LeMainTableModule;
});

define("LeSubTableModule", ["require", "exports", "LeBaseTableModule", "LeButtonGroup"], function (require, exports, LeBaseTable_1, LeButtonGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="LeSubTableModule"/>
    var d = G.d;
    var tools = G.tools;
    var LeSubTableModule = /** @class */ (function (_super) {
        __extends(LeSubTableModule, _super);
        function LeSubTableModule(para) {
            var _this = _super.call(this, para) || this;
            d.classAdd(_this.wrapper, 'table-module-sub');
            return _this;
        }
        LeSubTableModule.prototype.wrapperInit = function (para) {
            var _this = this;
            var wrapper = _super.prototype.wrapperInit.call(this, para), multiBtns = (para.ui.button || []).filter(function (button) { return button.multi !== 1; });
            //
            // multiBtns.forEach(btn => {
            //     if(btn.multi === 0){
            //         btn.multi = 1;
            //     }
            // });
            if (tools.isNotEmpty(multiBtns)) {
                this.buttonGroup = h(LeButtonGroup_1.LeButtonGroup, { "c-var": "buttonGroup", container: wrapper, buttons: multiBtns, dataGet: function () { return _this.tableModule.main.ftable.selectedRowsData[0]; } });
            }
            return wrapper;
        };
        return LeSubTableModule;
    }(LeBaseTable_1.LeBaseTable));
    exports.LeSubTableModule = LeSubTableModule;
});

define("LeTableModule", ["require", "exports", "LeRule", "FastTable", "LeMainTableModule", "LeSubTableModule"], function (require, exports, LeRule_1, FastTable_1, LeMainTable_1, LeSubTable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var Component = G.Component;
    var LeTableModule = /** @class */ (function (_super) {
        __extends(LeTableModule, _super);
        function LeTableModule(para) {
            var _this = _super.call(this, para) || this;
            _this.main = null;
            _this.sub = null;
            _this.fields = {};
            _this.mobileModal = null;
            _this.subWrapper = null;
            _this.bwEl = para.tableUi;
            var subUi = _this.bwEl.children && _this.bwEl.children[0];
            para.fields.forEach(function (field) {
                _this.fields[field.name] = field;
            });
            // this.mainEditable = !!mainVarList;
            // this.subEditable = !!subVarList;
            var main = _this.main = new LeMainTable_1.LeMainTableModule({
                ui: para.tableUi,
                container: _this.wrapper,
                ajaxData: para.ajaxData,
                tableModule: _this
            });
            //
            // if(tools.isNotEmpty(this.bwEl.subButtons)) {
            //     main.subBtns.init(this.btnWrapper);
            // }
            //
            // if (this.editable) {
            //     this.editBtns.init(this.btnWrapper);
            // }
            // this.editInit(para.bwEl);
            if (subUi) {
                var mftable_1 = main.ftable, pseudoTable_1 = mftable_1.pseudoTable;
                mftable_1.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                    // let sub = this.sub || this.subInit(subUi);
                    if (mftable_1.editing) {
                        return;
                    }
                    var firstRow = mftable_1.rowGet(0);
                    if (!firstRow) {
                        _this.mobileModal && (_this.mobileModal.isShow = false);
                        return;
                    }
                    firstRow.selected = true;
                    setTimeout(function () {
                        _this.subRefresh(firstRow.data);
                        pseudoTable_1 && pseudoTable_1.setPresentSelected(0);
                    }, 200);
                });
                var self_1 = _this;
                mftable_1.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                    var rowIndex = parseInt(this.dataset.index), row = mftable_1.rowGet(rowIndex);
                    if (row && row.selected) {
                        self_1.subRefresh(row.data);
                        pseudoTable_1 && pseudoTable_1.setPresentSelected(rowIndex);
                    }
                    else {
                        self_1.mobileModal && (self_1.mobileModal.isShow = false);
                    }
                });
            }
            return _this;
        }
        LeTableModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "le-table-module" });
        };
        LeTableModule.prototype.subRefresh = function (rowData) {
            var bwEl = this.bwEl, subUi = bwEl.children && bwEl.children[0], main = this.main, mftable = main.ftable;
            if (tools.isEmpty(subUi)) {
                return;
            }
            var selectedData = rowData ? rowData : (mftable.selectedRowsData[0] || {}), ajaxData = Object.assign({}, main.ajaxData, LeRule_1.LeRule.varList(subUi.link.varList, selectedData));
            // 查询从表时不需要带上选项参数
            delete ajaxData['queryoptionsparam'];
            if (!this.sub) {
                this.subInit(subUi, ajaxData);
            }
            else {
                this.mobileModal && (this.mobileModal.isShow = true);
                this.sub.refresh(ajaxData).catch();
            }
        };
        LeTableModule.prototype.subInit = function (ui, ajaxData) {
            // ui.tableAddr
            this.sub = new LeSubTable_1.LeSubTableModule({
                container: this.wrapper,
                ui: ui,
                ajaxData: ajaxData,
                isSub: true,
                tableModule: this
            });
            this.subWrapper = this.sub.wrapper;
        };
        LeTableModule.prototype.refresh = function (data) {
            var _this = this;
            return this.main.refresh(data).then(function () {
                _this.main.aggregate.get();
            });
        };
        LeTableModule.prototype.fieldGet = function (name) {
            var _this = this;
            if (Array.isArray(name)) {
                return name.map(function (n) { return _this.fields[n] || {}; });
            }
            else if (typeof name === 'string') {
                return this.fields[name] || { name: name, caption: name };
            }
            else {
                return {};
            }
        };
        LeTableModule.prototype.destroy = function () {
            this.main && this.main.destroy();
            this.sub && this.sub.destroy();
            this.main = null;
            this.sub = null;
            // this.edit = null;
            this.bwEl = null;
            // this._btnWrapper = null;
        };
        return LeTableModule;
    }(Component));
    exports.LeTableModule = LeTableModule;
});

/**
 * 本文件用于gulp打包时引用，防止找不到变量G
 */
/// <reference path="polyfill.ts"/>
/// <reference path="rule.ts"/>
/// <reference path="storage.ts"/>
/// <reference path="tools.ts"/>
/// <reference path="dom.ts"/>
/// <reference path="ajax.ts"/>
/// <reference path="components/Component.ts"/>
/// <reference path="requireConfig.ts"/>
/// <reference path="spa.ts"/>
/// <reference path="shell.ts"/>

/// <reference path="index.ts"/>
/// <reference path="common/Config.ts"/>
/// <reference path="common/rule/LeRule.tsx"/>
