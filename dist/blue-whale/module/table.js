define("BwTableModule", ["require", "exports", "BwRule", "FastTable", "FastBtnTable", "TableBase", "InputBox", "Button", "Modal", "BwInventoryBtnFun", "UploadModule", "Loading", "LayoutImage", "ButtonAction", "Inputs", "FlowDesigner"], function (require, exports, BwRule_1, FastTable_1, FastBtnTable_1, TableBase_1, InputBox_1, Button_1, Modal_1, InventoryBtn_1, uploadModule_1, loading_1, LayoutImage_1, ButtonAction_1, inputs_1, FlowDesigner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Component = G.Component;
    var d = G.d;
    var tools = G.tools;
    var sys = BW.sys;
    var CONF = BW.CONF;
    var Shell = G.Shell;
    var BwTableModule = /** @class */ (function (_super) {
        __extends(BwTableModule, _super);
        function BwTableModule(para) {
            var _this = _super.call(this, para) || this;
            _this.isRfid = false; // 是否有rfid
            _this.btnsLinkName = []; // 快捷按钮的字段名称
            _this.ajax = new BwRule_1.BwRule.Ajax();
            _this._lookUpData = {};
            _this.aggregate = (function () {
                var aggrWrap = null, urlData = null;
                /**
                 * 初始化
                 * @return {boolean} - 初始成功或者失败
                 */
                var init = function () {
                    if (!Array.isArray(_this.ui.aggrList) || !_this.ui.aggrList[0]) {
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
                    _this.ui.aggrList.forEach(function (aggr) {
                        var valSpan = h("span", null,
                            aggr.caption,
                            ":");
                        d.append(aggrWrap, valSpan);
                        BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(aggr.dataAddr, urlData))
                            .then(function (_a) {
                            var response = _a.response;
                            var value = tools.keysVal(response, 'data', 0, tools.keysVal(response, 'meta', 0));
                            valSpan.innerHTML = aggr.caption + ":" + (value || 0) + " &nbsp;&nbsp;";
                        });
                    });
                };
                return { get: get };
            })();
            _this.filter = (function () {
                var modal = null, builder = null;
                var searchHandler = function () {
                    var searchData = builder.dataGet();
                    _this.ftable.filter.set(searchData.params);
                    modal.isShow = false;
                };
                var showOriginTable = function () {
                    _this.ftable.filter.clear();
                };
                var init = function () {
                    if (builder === null) {
                        var body_1 = tools.isMb ?
                            h("div", { className: "mui-content" },
                                h("ul", { className: "mui-table-view", "data-query-name": "local" }),
                                h("div", { "data-action": "add", "data-name": "local", className: "mui-btn mui-btn-block mui-btn-primary" },
                                    h("span", { className: "mui-icon mui-icon-plusempty" }),
                                    " \u6DFB\u52A0\u6761\u4EF6"))
                            :
                                h("form", { className: "filter-form", "data-query-name": "local" },
                                    h("span", { "data-action": "add", className: "iconfont blue icon-jiahao" }));
                        modal = new Modal_1.Modal({
                            container: d.closest(_this.wrapper, '.page-container'),
                            header: '本地过滤',
                            body: body_1,
                            position: tools.isMb ? 'full' : '',
                            width: '730px',
                            isShow: true,
                            className: 'local queryBuilder',
                            zIndex: 1003,
                        });
                        // modal.wrapper.style.zIndex = '1002';
                        if (tools.isMb) {
                            modal.modalHeader.rightPanel = (function () {
                                var rightInputBox = new InputBox_1.InputBox(), clearBtn = new Button_1.Button({
                                    content: '清除',
                                    onClick: function () {
                                        showOriginTable();
                                        modal.isShow = false;
                                    }
                                }), saveBtn = new Button_1.Button({
                                    icon: 'sousuo',
                                    onClick: searchHandler
                                });
                                rightInputBox.addItem(clearBtn);
                                rightInputBox.addItem(saveBtn);
                                return rightInputBox;
                            })();
                            d.on(body_1, 'click', '[data-action="add"]', function () {
                                builder.rowAdd();
                                var ul = this.previousElementSibling;
                                ul.scrollTop = ul.scrollHeight;
                            });
                        }
                        else {
                            modal.footer = {
                                rightPanel: (function () {
                                    var rightBox = new InputBox_1.InputBox();
                                    rightBox.addItem(new Button_1.Button({
                                        content: '取消',
                                        type: 'default',
                                        key: 'cancelBtn',
                                        onClick: function () {
                                            modal.isShow = false;
                                        }
                                    }));
                                    rightBox.addItem(new Button_1.Button({
                                        content: '清除',
                                        type: 'default',
                                        key: 'clearBtn',
                                        onClick: function () {
                                            showOriginTable();
                                            modal.isShow = false;
                                        }
                                    }));
                                    rightBox.addItem(new Button_1.Button({
                                        content: '查询',
                                        type: 'primary',
                                        onClick: searchHandler,
                                        key: 'queryBtn'
                                    }));
                                    return rightBox;
                                })()
                            };
                        }
                        require(['QueryBuilder'], function (QueryBuilder) {
                            builder = new QueryBuilder.QueryBuilder({
                                queryConfigs: initQueryConfigs(getCols()),
                                resultDom: tools.isMb ? d.query('ul.mui-table-view', body_1) : body_1,
                                setting: null // 默认值
                            });
                        });
                    }
                    else {
                        modal && (modal.isShow = true);
                    }
                };
                var getCols = function () {
                    var cols = [];
                    _this.ftable && _this.ftable.columns.forEach(function (col) {
                        cols.push({
                            name: col.name,
                            title: col.title,
                            isNumber: col.isNumber,
                            content: col.content
                        });
                    });
                    return cols;
                };
                function initQueryConfigs(cols) {
                    return cols.map(function (col) {
                        return {
                            caption: col.title,
                            field_name: col.name,
                            dynamic: 0,
                            link: '',
                            type: '',
                            atrrs: col.content
                        };
                    });
                }
                return {
                    init: init
                };
            })();
            _this.countElements = {};
            _this.OLD_DIFFAMOUNT = 0;
            // 多图查看与编辑
            _this.multiImgEdit = (function () {
                var modal = null;
                var imgCreate = function (url, md5, isClose) {
                    if (isClose === void 0) { isClose = true; }
                    return h("div", { className: "img" },
                        isClose ? h("div", { className: "appcommon app-guanbi1 img-close", "data-md5": md5 }) : '',
                        h("img", { src: url }));
                };
                var show = function (fieldName, rowIndex) {
                    var field = _this.cols.filter(function (col) { return col.name === fieldName; })[0], ftable = _this.ftable, row = ftable.rowGet(rowIndex), column = ftable.columnGet(fieldName), rowData = ftable.tableData.rowDataGet(rowIndex), md5Arr = [], md5str = rowData[fieldName], editParam = _this.editParam, upVarList = editParam && editParam[editParam.updateType] || [], updatable = upVarList.some(function (v) { return fieldName === v.varName; }), handler = null, uploadModule;
                    if (md5str && typeof md5str === 'string') {
                        md5Arr = md5str.split(',');
                    }
                    if (field.atrrs && field.atrrs.dataType !== '22') {
                        return;
                    }
                    if (!(tools.isNotEmpty(md5Arr) || (tools.isEmpty(md5Arr) && updatable))) {
                        return;
                    }
                    var isInsert = row ?
                        ftable.edit.addIndex.get().indexOf(row.data[TableBase_1.TableBase.GUID_INDEX]) > -1 : false;
                    var rowCanEdit = _this.tableModule.edit.rowCanInit(row, _this.isSub), cellCanEdit = _this.tableModule.edit.cellCanInit(column, isInsert ? 1 : 0);
                    updatable = updatable && rowCanEdit && cellCanEdit;
                    var btnWrapper = null, imgWrapper = null, wrapper = h("div", { className: "table-img-wrapper" },
                        btnWrapper = h("div", { className: "table-img-wrapper-btns" }),
                        imgWrapper = h("div", { className: "table-img" }, md5Arr.map(function (md5) { return imgCreate(BwRule_1.BwRule.fileUrlGet(md5, fieldName), md5, updatable); })));
                    modal = new Modal_1.Modal({
                        header: '图片查看',
                        top: 80,
                        body: wrapper,
                        height: '80%',
                        width: tools.isMb ? void 0 : '70%',
                        position: 'down',
                        isDrag: true,
                        isOnceDestroy: true,
                        className: 'modal-img',
                        onClose: function () {
                            d.off(wrapper, 'click', '.img .img-close', handler);
                            uploadModule && uploadModule.destroy();
                        }
                    });
                    var onUploaded = function (md5Data) {
                        var tableModule = _this.tableModule;
                        if (tableModule) {
                            (_this.ftable.editing ? Promise.resolve() : tableModule.editBtns.start())
                                .then(function () {
                                var _a;
                                var row = _this.ftable.rowGet(rowIndex);
                                if (row) {
                                    row.data = Object.assign(row.data, (_a = {},
                                        _a[fieldName] = md5Data.join(','),
                                        _a));
                                }
                            });
                        }
                    };
                    if (updatable) {
                        var imgContainer = h("div", { className: "table-img-uploader" });
                        d.append(btnWrapper, imgContainer);
                        uploadModule = new uploadModule_1.default({
                            nameField: fieldName,
                            // thumbField: thumbField,
                            container: imgContainer,
                            text: '添加图片',
                            accept: {
                                title: '图片',
                                extensions: 'jpg,png,gif',
                                mimeTypes: 'image/*'
                            },
                            uploadUrl: CONF.ajaxUrl.fileUpload,
                            showNameOnComplete: false,
                            onComplete: function (response, file) {
                                var data = response.data, newMd5s = [];
                                for (var fieldKey in data) {
                                    newMd5s.unshift(data[fieldKey].value);
                                }
                                md5Arr = newMd5s.concat(md5Arr);
                                newMd5s.forEach(function (md5) {
                                    d.prepend(imgWrapper, imgCreate(BwRule_1.BwRule.fileUrlGet(md5, fieldName), md5, updatable));
                                });
                                onUploaded(md5Arr);
                            }
                        });
                        d.on(wrapper, 'click', '.img .img-close', handler = function () {
                            var delMd5 = this.dataset.md5;
                            md5Arr = md5Arr.filter(function (md5) { return md5 !== delMd5; });
                            d.remove(this.parentElement);
                            onUploaded(md5Arr);
                        });
                    }
                };
                return { show: show };
            })();
            // 单图查看与编辑
            _this.imgEdit = (function () {
                // private pictures: string[];
                var fields = [], thumbField, deletable, updatable, onUploaded, onSave, imgs = [], modal = null, currentRowIndex = -1;
                var init = function () {
                    _this.cols.forEach(function (col) {
                        if (col.atrrs && col.atrrs.dataType === '20') {
                            if (col.noShow) {
                                fields.push(col);
                            }
                            else {
                                thumbField = col.name;
                            }
                        }
                    });
                    var editParam = _this.editParam, fieldsName = fields.map(function (f) { return f.name; }), delVarList = editParam && editParam[editParam.deleteType] || [], upVarList = editParam && editParam[editParam.updateType] || [];
                    deletable = delVarList.some(function (v) { return fieldsName.includes(v.varName); });
                    updatable = upVarList.some(function (v) { return fieldsName.includes(v.varName); });
                    onUploaded = function (md5Data) {
                        _this.tableModule && _this.tableModule.editBtns.start().then(function () {
                            var row = _this.ftable.rowGet(currentRowIndex);
                            row.data = Object.assign(row.data, md5Data);
                        });
                    };
                    onSave = function () {
                        // this.editBtns && this.editBtns.btnSave();
                    };
                    modalInit();
                };
                var modalInit = function () {
                    var doc = document.createDocumentFragment();
                    fields.forEach(function (field, i) {
                        // let pic = this.pictures[i];
                        d.append(doc, imgWrapperGet(field, i));
                    });
                    imgs = d.queryAll('img', doc);
                    modal = new Modal_1.Modal({
                        header: '图片查看',
                        top: 80,
                        body: doc,
                        height: '70%',
                        position: 'down',
                    });
                };
                var imgWrapperGet = function (field, imgIndex) {
                    var nameField = field.name, wrapper = h("div", { className: "table-img-wrapper", "data-field": nameField },
                        h("div", { className: "table-img-wrapper-btns" }),
                        h("div", { className: "table-img" },
                            h("img", { "data-index": imgIndex, style: "max-height:500px;max-width:700px" })));
                    if (!updatable && !deletable) {
                        return wrapper;
                    }
                    var btnWrapper = d.query('.table-img-wrapper-btns', wrapper), img = d.query('img', wrapper);
                    if (updatable) {
                        var imgContainer = h("div", { className: "table-img-uploader" });
                        d.append(btnWrapper, imgContainer);
                        new uploadModule_1.default({
                            nameField: nameField,
                            thumbField: thumbField,
                            container: imgContainer,
                            text: '选择图片',
                            accept: {
                                title: '图片',
                                extensions: 'jpg,png,gif',
                                mimeTypes: 'image/*'
                            },
                            uploadUrl: CONF.ajaxUrl.fileUpload,
                            showNameOnComplete: false,
                            onComplete: function (response, file) {
                                var data = response.data, md5Data = {};
                                for (var fieldKey in data) {
                                    md5Data[data[fieldKey].key] = data[fieldKey].value;
                                }
                                img.src = imgUrlCreate(md5Data[nameField]);
                                tools.isFunction(onUploaded) && onUploaded(md5Data);
                                // saveBtn.isDisabled = false;
                            }
                        });
                    }
                    if (deletable) {
                        new Button_1.Button({
                            content: '删除图片',
                            container: btnWrapper,
                            onClick: function () {
                                var _a;
                                // this.md5s[nameField] = '';
                                img.src = '';
                                tools.isFunction(onUploaded) && onUploaded((_a = {}, _a[nameField] = '', _a));
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
                var imgUrlCreate = function (md5) {
                    return tools.url.addObj(CONF.ajaxUrl.fileDownload, {
                        // name_field: nameField,
                        md5_field: 'FILE_ID',
                        file_id: md5,
                        // [nameField]: fileName,
                        down: 'allow'
                    });
                };
                var showImg = function (rowIndex) {
                    var picAddrList = _this.ui.pictureAddrList;
                    if (tools.isNotEmptyArray(picAddrList)) {
                        if (!modal) {
                            init();
                        }
                        var rowData_1 = _this.ftable.tableData.rowDataGet(rowIndex), md5s_1 = [];
                        fields.forEach(function (field) {
                            md5s_1.push(rowData_1[field.name]);
                        });
                        var imgsUrl_1 = picAddrList.map(function (addr) {
                            return tools.url.addObj(CONF.siteUrl + BwRule_1.BwRule.reqAddr(addr, rowData_1), _this.ajaxData);
                        });
                        // this.tableImgEdit.indexSet(rowIndex, urls);
                        // debugger;
                        imgs.forEach(function (img, i) {
                            img.src = md5s_1[i] ? imgUrlCreate(md5s_1[i]) : imgsUrl_1[i];
                            // img.src = md5s[i] ? this.imgUrlCreate(md5s[i]) : tools.url.addObj(urls[i], {'_': Date.now()});
                        });
                    }
                    currentRowIndex = rowIndex;
                    modal && (modal.isShow = true);
                };
                return {
                    showImg: showImg,
                    destroy: function () {
                        modal && modal.destroy();
                        fields = null;
                        imgs = null;
                        onUploaded = null;
                        onSave = null;
                        modal = null;
                    }
                };
            })();
            _this.subBtns = (function () {
                var box = null, ftable = null, handler = null;
                var init = function (wrapper) {
                    var btnsUi = _this.ui.subButtons;
                    ftable = _this.ftable;
                    box && box.destroy();
                    box = new InputBox_1.InputBox({
                        container: wrapper,
                        isResponsive: !tools.isMb,
                        className: !tools.isMb ? 'more-btns' : ''
                    });
                    Array.isArray(btnsUi) && btnsUi.forEach(function (btnUi) {
                        var btn = new Button_1.Button({
                            icon: btnUi.icon,
                            content: btnUi.title,
                            isDisabled: !(btnUi.multiselect === 0 || btnUi.multiselect === 2 && btnUi.selectionFlag),
                            data: btnUi,
                            onClick: function () {
                                if (btn.data.openType.indexOf('rfid') > -1) {
                                    // RFID 操作按钮
                                    InventoryBtn_1.InventoryBtn(btn, _this);
                                }
                                else if (btn.data.openType.indexOf('flow') > -1) {
                                    // 流程引擎操作按钮
                                    var btnUi_1 = btn.data, multiselect = btnUi_1.multiselect, selectionFlag = btnUi_1.selectionFlag, selectedData = multiselect === 2 && selectionFlag ?
                                        ftable.unselectedRowsData : ftable.selectedRowsData;
                                    var select_1 = multiselect === 1 ? selectedData[0] : selectedData, dataAddr_1 = BW.CONF.siteUrl + btnUi_1.actionAddr.dataAddr, varList = btnUi_1.actionAddr.varList;
                                    if (tools.isNotEmpty(varList)) {
                                        varList.forEach(function (li, index) {
                                            var name = li.varName;
                                            for (var key in select_1) {
                                                if (key === name) {
                                                    if (index === 0) {
                                                        dataAddr_1 += '?';
                                                    }
                                                    else {
                                                        dataAddr_1 += '&';
                                                    }
                                                    dataAddr_1 = dataAddr_1 + (key.toLowerCase() + "=" + select_1[key]);
                                                }
                                            }
                                        });
                                    }
                                    new FlowDesigner_1.FlowDesigner(dataAddr_1);
                                }
                                else {
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
                                    var btnUi_2 = btn.data, multiselect = btnUi_2.multiselect, selectionFlag = btnUi_2.selectionFlag, selectedData = multiselect === 2 && selectionFlag ?
                                        ftable.unselectedRowsData : ftable.selectedRowsData;
                                    var select_2 = multiselect === 1 ? selectedData[0] : selectedData;
                                    var tData = ftable.tableData.data;
                                    if (btnUi_2.haveRoll) {
                                        var addr = btnUi_2.actionAddr, varList_1 = addr.varList, index_1 = 0, arr_1 = [];
                                        tData.forEach(function (td, i) {
                                            var obj = {};
                                            varList_1.forEach(function (list) {
                                                var name = list.varName;
                                                obj[name] = td[name];
                                            });
                                            arr_1.push(obj);
                                            if (tools.obj.isEqual(select_2, td)) {
                                                index_1 = i;
                                            }
                                        });
                                        window.localStorage.setItem('currentKeyField', index_1 + '');
                                        window.localStorage.setItem('nextKeyField', JSON.stringify(arr_1));
                                        var interval_1 = setInterval(function () {
                                            var locData = window.localStorage.getItem('nextKeyField');
                                            if (tools.isNotEmpty(locData)) {
                                                clearInterval(interval_1);
                                                ButtonAction_1.ButtonAction.get().clickHandle(btnUi_2, select_2, function (res) {
                                                }, _this.pageUrl, _this.ui.itemId);
                                            }
                                        }, 50);
                                    }
                                    else {
                                        window.localStorage.removeItem('nextKeyField');
                                        window.localStorage.removeItem('currentKeyField');
                                        ButtonAction_1.ButtonAction.get().clickHandle(btnUi_2, select_2, function (res) {
                                        }, _this.pageUrl, _this.ui.itemId);
                                    }
                                }
                            }
                        });
                        box.addItem(btn);
                    });
                    // 根据选中行数判断按钮是否可操作
                    _this.ftable.off(FastTable_1.FastTable.EVT_SELECTED, handler);
                    _this.ftable.on(FastTable_1.FastTable.EVT_SELECTED, handler = function () {
                        var selectedLen = ftable.selectedRows.length, allLen = ftable.rows.length;
                        box.children.forEach(function (btn) {
                            var selectionFlag = btn.data.selectionFlag, len = btn.data.selectionFlag ? allLen - selectedLen : selectedLen;
                            if (len === 0) {
                                btn.isDisabled = selectionFlag ? false : btn.data.multiselect > 0;
                            }
                            else if (selectedLen === 1) {
                                btn.isDisabled = false;
                            }
                            else {
                                btn.isDisabled = btn.data.multiselect !== 2;
                            }
                        });
                    });
                };
                return {
                    init: init,
                    get box() {
                        return box;
                    }
                };
            })();
            _this.isSub = !!para.isSub;
            _this.editParam = para.editParam;
            _this.tableModule = para.tableModule;
            BwRule_1.BwRule.beforeHandle.table(para.ui); // 初始化UI, 设置一些默认值
            var ui = _this.ui = para.ui;
            _this.isPivot = ui.relateType === 'P';
            _this.isDrill = ['web', 'webdrill', 'drill'].includes(ui.uiType); // 是否为钻取
            // 判断是否有rfid
            _this.isRfid = tools.isNotEmpty(ui.rfidCols) ||
                (Array.isArray(ui.subButtons) && ui.subButtons.some(function (btn) { return btn.openType.indexOf('rfid') >= 0; }));
            // 是否有查询器
            _this.hasQuery = ui.querier && ([3, 13].includes(ui.querier.queryType));
            // 初始化fields
            _this.fieldsInit(ui.cols);
            var subBtns = ui.subButtons;
            // 查出快捷按钮
            _this.btnsLinkName = Array.isArray(subBtns) ? subBtns.filter(function (btn) { return btn.linkName; }).map(function (btn) { return btn.linkName; }) : [];
            // 异步查询参数(wbf)
            if (ui.isAsyn) {
                para.ajaxData = para.ajaxData || {};
                para.ajaxData['uiurl'] = _this.pageUrl.substring(find(_this.pageUrl, '/', 5), _this.pageUrl.length);
            }
            function find(str, cha, num) {
                var x = str.indexOf(cha);
                for (var i = 0; i < num; i++) {
                    x = str.indexOf(cha, x + 1);
                }
                return x;
            }
            if (_this.isPivot) {
                // 交叉制表
                _this.pivotInit(para.ajaxData);
            }
            else {
                // 正常表格
                _this.ftableInit(para.ajaxData);
            }
            return _this;
        }
        BwTableModule.prototype.wrapperInit = function (para) {
            return h("div", { className: "table-module-wrapper" });
        };
        Object.defineProperty(BwTableModule.prototype, "baseFtablePara", {
            get: function () {
                var _this = this;
                // 基本配置
                return {
                    isWrapLine: tools.isMb && (this.ui.cols ? this.ui.cols.some(function (col) { return col.atrrs.displayWidth > 0; }) : false),
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
                    cellFormat: function (cellData, cell) {
                        var col = cell.column, rowData = _this.ftable.tableData.rowDataGet(cell.row.index); // 行数据
                        return col ? _this.cellFormat(col.content, cellData, rowData) : { text: cellData };
                    },
                    rowFormat: function (rowData) {
                        var color = '', bgColor = '', attr = {};
                        // 行背景和文字变色
                        ['GRIDBACKCOLOR', 'GRIDFORECOLOR'].forEach(function (name, i) {
                            var colorVal = rowData[name];
                            if (colorVal) {
                                // 显示颜色
                                var _a = tools.val2RGB(colorVal), r = _a.r, g = _a.g, b = _a.b, colorStr = "rgb(" + r + "," + g + "," + b + ")";
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
                        size: 50,
                        options: [50, 100, 500],
                    },
                    menu: [this.isPivot ? null : {
                            colMulti: 1,
                            title: '锁定/解锁列',
                            onClick: function (cell) {
                                var isFixed = cell.column.isFixed;
                                cell.column.isFixed = !isFixed;
                                Modal_1.Modal.toast(!isFixed ? '已锁定' : '已解锁');
                            }
                        }, {
                            title: '复制单元格',
                            onClick: function (cell) {
                                sys.window.copy(cell.text);
                            }
                        }, {
                            title: '复制行',
                            onClick: function (cell, rows, columns) {
                                var col = columns[0];
                                if (col) {
                                    sys.window.copy(rows.map(function (row) { return row.cells.map(function (cell) { return cell.text; }).join("\t"); }).join("\r\n"));
                                }
                            }
                        }, {
                            colMulti: 1,
                            title: '复制列',
                            onClick: function (cell, rows, columns) {
                                var col = columns[0];
                                if (col) {
                                    var cells = col.cells[0].concat(col.cells[1]).map(function (cell) { return cell.text; }).join("\r\n");
                                    sys.window.copy(cells);
                                }
                            }
                        }, {
                            rowMulti: 1,
                            title: '列复制',
                            children: this.cols.filter(function (col) { return !col.noShow; }).map(function (col) {
                                return {
                                    title: col.title,
                                    onClick: function (cell) {
                                        sys.window.copy(cell.frow.data[col.name]);
                                    }
                                };
                            })
                        }, tools.isMb ? {
                            title: '列排序',
                            onClick: function () {
                                _this.ftable.colsSort.open();
                            }
                        } : null]
                };
            },
            enumerable: true,
            configurable: true
        });
        BwTableModule.prototype.ftableInit = function (ajaxData) {
            var _this = this;
            var ui = this.ui;
            this.ftable = new FastBtnTable_1.FastBtnTable(Object.assign(this.baseFtablePara, {
                cols: this.colParaGet(this._cols),
                ajax: {
                    ajaxData: ajaxData,
                    once: ui.multPage !== 1,
                    auto: !this.hasQuery,
                    fun: function (_a) {
                        var pageSize = _a.pageSize, current = _a.current, sort = _a.sort, custom = _a.custom;
                        var url = CONF.siteUrl + BwRule_1.BwRule.reqAddr(ui.dataAddr);
                        pageSize = pageSize === -1 ? 3000 : pageSize;
                        var pagesortparams = Array.isArray(sort) ?
                            JSON.stringify(sort.map(function (s) { return s[0] + "," + s[1].toLocaleLowerCase(); })) : '';
                        return Promise.all([
                            // 获取表格数据
                            _this.ajax.fetch(url, {
                                needGps: ui.dataAddr.needGps,
                                timeout: 30000,
                                data: Object.assign({
                                    pageparams: "{\"index\"=" + (current + 1) + ",\"size\"=" + pageSize + ",\"total\"=1}",
                                    pagesortparams: pagesortparams
                                }, custom)
                            }),
                            // 获取lookup数据
                            _this.lookup
                        ]).then(function (_a) {
                            var response = _a[0].response;
                            var data = response.data, head = response.head;
                            // 选项查询处理(wbf)
                            _this.sectionField(response);
                            if (data) {
                                var editParam_1 = _this.editParam;
                                if (editParam_1) {
                                    var varList_2 = [];
                                    ['insert', 'update', 'delete'].forEach(function (type) {
                                        var canOld = ['update', 'delete'].indexOf(editParam_1[type + "Type"]) > -1, typeVarList = editParam_1[type];
                                        if (canOld && Array.isArray(typeVarList)) {
                                            varList_2 = varList_2.concat(typeVarList);
                                        }
                                    });
                                    // 加上OLD变量
                                    BwRule_1.BwRule.addOldField(BwRule_1.BwRule.getOldField(varList_2), data);
                                }
                            }
                            return {
                                data: data,
                                total: head ? head.totalNum : 0,
                            };
                        });
                    }
                }
            }));
            !this.isDrill && this.ftable.btnAdd('filter', {
                type: 'default',
                icon: 'sousuo',
                content: '本地过滤',
                onClick: function () {
                    _this.filter.init();
                },
            }, 1);
            (this.ui.rfidFlag == 1) && this.ftable.btnAdd('rfid', {
                type: 'default',
                content: 'rfid设置',
                onClick: function () {
                    require(['RfidSetting'], function (RfidSetting) {
                        new RfidSetting.RfidSettingModal();
                    });
                },
            });
            this.ftableReady();
            this.ftable.on(FastTable_1.FastTable.EVT_TABLE_COL_CHANGE, function (ev) {
                if (tools.isNotEmpty(_this.ui.settingId)) {
                    BwRule_1.BwRule.Ajax.fetch(CONF.siteAppVerUrl + "/setting/" + _this.ui.settingId, {
                        type: 'put',
                        data2url: true,
                        data: {
                            columnorderparam: JSON.stringify(ev.data)
                        },
                    }).then(function () {
                        Modal_1.Modal.toast('修改成功');
                    }).catch(function (e) {
                        Modal_1.Modal.toast('修改失败');
                    });
                }
            });
        };
        Object.defineProperty(BwTableModule.prototype, "onFtableReady", {
            set: function (handler) {
                if (this.isFtableReady) {
                    tools.isFunction(handler) && handler();
                }
                else {
                    this._ftableReadyHandler = handler;
                }
            },
            enumerable: true,
            configurable: true
        });
        BwTableModule.prototype.ftableReady = function () {
            var _this = this;
            this.clickInit(); // 初始化 点击事件
            // 查询聚合字段
            this.aggregate.get(this.ajaxData);
            // rfid初始化 (lyq)
            this.rfidColInit();
            this.reportCaptionInit();
            // inputs (wbf)
            if (tools.isPc) {
                setTimeout(function () {
                    //monitorKey键盘输入
                    if (_this.ui.inputs) {
                        new inputs_1.Inputs({
                            inputs: _this.ui.inputs,
                            container: _this.wrapper,
                            table: _this.ftable,
                        });
                    }
                }, 200);
            }
            tools.isFunction(this._ftableReadyHandler) && this._ftableReadyHandler();
            this.isFtableReady = true;
            this.trigger(BwTableModule.EVT_READY);
        };
        BwTableModule.prototype.colParaGet = function (fields) {
            var isAbsField = fields.some(function (col) { return tools.isNotEmpty(col.subcols); }), // 是否有子列
            colsPara = [[]], showCount = 0; // 显示字段个数统计
            fields.forEach(function (field) {
                if (!field.noShow) {
                    showCount++;
                }
                var subCols = field.subcols, hasSubCol = isAbsField && Array.isArray(subCols) && subCols[0];
                colsPara[0].push({
                    title: field.caption,
                    name: field.name,
                    content: field,
                    isFixed: showCount === 1,
                    isNumber: BwRule_1.BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                    isVirtual: field.noShow,
                    colspan: hasSubCol ? subCols.length : 1,
                    rowspan: isAbsField && !hasSubCol ? 2 : 1,
                    maxWidth: field.atrrs && (field.atrrs.displayWidth ? field.atrrs.displayWidth * 6 : void 0),
                });
                if (hasSubCol) {
                    // 是否有子列
                    colsPara[1] = colsPara[1] || [];
                    subCols.forEach(function (subCol) {
                        colsPara[1].push({
                            title: subCol.caption,
                            name: subCol.name,
                            content: subCol,
                            isVirtual: subCol.noShow,
                            colspan: 1,
                            rowspan: 1
                        });
                    });
                }
            });
            return colsPara;
        };
        /**
         * 初始化交叉制表
         * @param ajaxData - 查询参数
         */
        BwTableModule.prototype.pivotInit = function (ajaxData) {
            // let isFirst = tableDom.classList.contains('mobileTable');
            var _this = this;
            if (ajaxData === void 0) { ajaxData = {}; }
            var loading = new loading_1.Loading({
                msg: '加载中...',
                container: this.wrapper
            });
            this.ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(this.ui.dataAddr), {
                data: Object.assign({}, ajaxData, { pageparams: "{\"index\"=1,\"size\"=3000,\"total\"=1}" }) //设置初始分页条件
            }).then(function (_a) {
                var response = _a.response;
                if (tools.isEmpty(response)) {
                    return;
                }
                _this.ftable = new FastBtnTable_1.FastBtnTable(Object.assign(_this.baseFtablePara, {
                    cols: colsParaGet(response.meta),
                    data: response.data
                }));
                _this.ftableReady();
            }).finally(function () {
                loading.destroy();
                loading = null;
            });
            /**
             * 把返回的数据与UI合并成交叉制表的列参数(具体规则要问下小路, 太久记不清了)
             * @param meta
             */
            var colsParaGet = function (meta) {
                var originCols = _this._cols, fields = BwRule_1.BwRule.getCrossTableCols(meta, originCols).cols;
                var countFields = [], // 统计字段
                otherFields = []; // 其他字段
                fields.forEach(function (field) {
                    var hasDot = ~field.title.indexOf('.');
                    if ((hasDot && ~field.name.indexOf('小计')) || !hasDot) {
                        countFields.push(field);
                    }
                    else {
                        otherFields.push(field);
                    }
                });
                // 将统计字段前置
                fields = countFields.concat(otherFields);
                var colsPara = [[], []], currentOriginField = {
                    name: '',
                    count: 1
                };
                fields.forEach(function (field, i) {
                    var _a = field.name.split('.'), mainName = _a[0], subName = _a[1], nextField = fields[i + 1] || { name: '' }, nextMainName = nextField.name.split('.')[0];
                    if (mainName !== nextMainName) {
                        var mainField = originCols.filter(function (col) { return col.name === mainName; })[0];
                        // if(mainField) {
                        colsPara[0].push({
                            title: mainField ? mainField.caption : mainName,
                            name: mainField ? mainField.name : mainName,
                            isFixed: !colsPara[0],
                            colspan: subName ? currentOriginField.count : 1,
                            rowspan: subName ? 1 : 2,
                            content: subName ? void 0 : field,
                            isNumber: subName ? void 0 :
                                BwRule_1.BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                            isVirtual: subName ? void 0 : field.noShow,
                        });
                        currentOriginField = {
                            name: nextMainName,
                            count: 1
                        };
                    }
                    else {
                        currentOriginField.count++;
                    }
                    if (subName) {
                        colsPara[1].push({
                            title: field.caption,
                            name: field.name,
                            content: field,
                            isNumber: BwRule_1.BwRule.isNumber(field.atrrs && field.atrrs.dataType),
                            isVirtual: field.noShow,
                            colspan: 1,
                            rowspan: 1
                        });
                    }
                });
                return colsPara;
            };
        };
        /**
         * 选项查询处理 (wbf)
         * @param response
         */
        BwTableModule.prototype.sectionField = function (response) {
            var sectionName = '分段';
            var meta = response.meta, ajaxData = this.ajaxData, optionsParam = ajaxData.queryoptionsparam && JSON.parse(ajaxData.queryoptionsparam);
            // 有分组字段是增加新的列
            if (optionsParam && optionsParam.sectionParams && optionsParam.sectionParams.sectionField) {
                var sectionField = optionsParam.sectionParams.sectionField, sectionTitle = '';
                // 防止重复添加
                if (sectionField !== this._sectionField) {
                    for (var _i = 0, _a = this.ui.cols; _i < _a.length; _i++) {
                        var col = _a[_i];
                        if (col.name === sectionField) {
                            sectionTitle = col.caption;
                        }
                    }
                    var title = sectionTitle + '段', sec = this.ftable.columnGet(sectionName);
                    if (sec) {
                        sec.title = title;
                    }
                    else {
                        this.ftable.columnAdd({
                            title: title,
                            name: sectionName,
                        }, void 0, 0);
                    }
                    // this.ftable.
                    this._sectionField = sectionField;
                }
            }
            else {
                // 没有分段时删除分段字段
                this._sectionField && this.ftable.columnDel(sectionName);
                this._sectionField = '';
            }
            if (tools.isNotEmpty(response.data)) {
                // 隐藏无数据的字段, 但排除lookup字段
                this.ftable.columns.forEach(function (column) {
                    var field = column.content || {};
                    column.show = field.elementType === 'lookup' || meta.includes(column.name);
                });
            }
        };
        Object.defineProperty(BwTableModule.prototype, "lookUpData", {
            get: function () {
                return this._lookUpData || {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BwTableModule.prototype, "lookup", {
            get: function () {
                var _this = this;
                if (tools.isEmpty(this._lookUpData)) {
                    var allPromise = this.cols.filter(function (col) { return col.elementType === 'lookup'; })
                        .map(function (col) { return BwRule_1.BwRule.getLookUpOpts(col).then(function (items) {
                        // debugger;
                        _this._lookUpData = _this._lookUpData || {};
                        _this._lookUpData[col.name] = items;
                    }); });
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
        BwTableModule.prototype.tdClickHandler = function (field, rowData) {
            // 判断是否为link
            if (!field) {
                return;
            }
            var link = field.link;
            if (link && (field.endField ? rowData[field.endField] === 1 : true)) {
                BwRule_1.BwRule.link({
                    link: link.dataAddr,
                    varList: link.varList,
                    dataType: field.atrrs.dataType,
                    data: rowData,
                    needGps: link.needGps === 1,
                });
                return;
            }
            // 是否为钻取
            var url = drillUrlGet(field, rowData, this.ui.keyField);
            if (url) {
                sys.window.open({ url: url });
            }
        };
        ;
        BwTableModule.prototype.clickInit = function () {
            var ftable = this.ftable, clickableSelector = '.section-inner-wrapper:not(.pseudo-table) tbody', // 可点击区域
            tdSelector = clickableSelector + " td", trSelector = clickableSelector + " tr", self = this;
            // 点击链接时
            ftable.click.add(tdSelector + ":not(.cell-img)", function (e) {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                var rowIndex = parseInt(this.parentNode.dataset.index), colName = this.dataset.name, field = ftable.columnGet(colName).content, row = ftable.rowGet(rowIndex), rowData = row.data;
                if (field) {
                    self.tdClickHandler(field, rowData);
                }
                // if (field.link && !colIsImg && (field.endField ? rowData[field.endField] === 1 : true)) {
            });
            // 点击显示图片， 判断是否存在缩略图
            var hasThumbnail = this.cols.some(function (col) {
                var dataType = col.atrrs && col.atrrs.dataType;
                return !col.noShow && [BwRule_1.BwRule.DT_IMAGE, BwRule_1.BwRule.DT_MUL_IMAGE].includes(dataType);
            });
            var imgHandler = function (e) {
                if (e.altKey || e.ctrlKey || e.shiftKey) {
                    return;
                }
                var isTd = this.tagName === 'TD', index = parseInt(isTd ? this.parentElement.dataset.index : this.dataset.index), name = this.dataset.name;
                if (isTd && self.cols.some(function (col) { return col.name === name && col.atrrs.dataType === '22'; })) {
                    self.multiImgEdit.show(name, index);
                }
                else {
                    self.imgEdit.showImg(index);
                }
            };
            if (hasThumbnail) {
                d.on(ftable.wrapper, 'click', tdSelector + ".cell-img:not(.disabled-cell)", tools.pattern.throttling(imgHandler, 1000));
            }
            else {
                ftable.click.add(trSelector, tools.pattern.throttling(imgHandler, 1000));
            }
        };
        Object.defineProperty(BwTableModule.prototype, "ajaxData", {
            get: function () {
                return this.ftable.tableData.ajaxData;
            },
            enumerable: true,
            configurable: true
        });
        BwTableModule.prototype.refresh = function (data) {
            var _this = this;
            return this.ftable.tableData.refresh(data).then(function () {
                _this.aggregate.get(data);
            });
        };
        Object.defineProperty(BwTableModule.prototype, "pageUrl", {
            get: function () {
                if (!this._pageUrl) {
                    if (sys.isMb) {
                        this._pageUrl = location.href;
                    }
                    else {
                        var pageContainer = d.closest(this.wrapper, '.page-container[data-src]');
                        this.pageContainer = pageContainer;
                        this._pageUrl = pageContainer ? pageContainer.dataset.src : '';
                    }
                }
                return this._pageUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BwTableModule.prototype, "rowDefData", {
            // 获取默认数据
            get: function () {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    if (tools.isNotEmpty(_this._rowDefData)) {
                        resolve(_this._rowDefData);
                    }
                    else {
                        var data_1 = BwRule_1.BwRule.getDefaultByFields(_this.cols), defAddrs = _this.ui.defDataAddrList;
                        if (tools.isNotEmpty(defAddrs)) {
                            Promise.all(defAddrs.map(function (url) {
                                return BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(url))
                                    .then(function (_a) {
                                    var response = _a.response;
                                    data_1 = Object.assign(data_1, response.data[0] || {});
                                    // cb();
                                });
                            })).then(function () {
                                _this._rowDefData = data_1;
                                resolve(data_1);
                            }).catch(function () {
                                reject();
                            });
                        }
                        else {
                            _this._rowDefData = data_1;
                            resolve(data_1);
                        }
                    }
                });
            },
            enumerable: true,
            configurable: true
        });
        BwTableModule.prototype.fieldsInit = function (fields) {
            this._cols = fields.map(function (col) {
                var newCol = Object.assign({}, col);
                // 判断是否有默认不显示的字段(文字颜色, 背景颜色)
                if (BwRule_1.BwRule.NoShowFields.includes(newCol.name)) {
                    newCol.noShow = true;
                }
                var attrs = newCol.atrrs;
                // 时间类型加上默认的显示格式
                if (attrs) {
                    if (attrs.dataType === BwRule_1.BwRule.DT_DATETIME && !attrs.displayFormat) {
                        attrs.displayFormat = 'yyyy-MM-dd HH:mm:ss';
                    }
                    if (attrs.dataType === BwRule_1.BwRule.DT_TIME && !attrs.displayFormat) {
                        attrs.displayFormat = 'HH:mm:ss';
                    }
                }
                return newCol;
            });
        };
        Object.defineProperty(BwTableModule.prototype, "cols", {
            get: function () {
                var cols = [];
                this._cols.forEach(function (col) {
                    getCols(col);
                });
                return cols;
                function getCols(col) {
                    if (tools.isEmpty(col.subcols)) {
                        cols.push(col);
                    }
                    else {
                        col.subcols.forEach(function (subcol) {
                            getCols(subcol);
                        });
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        BwTableModule.prototype.reportCaptionInit = function () {
            var reportCaption = this.ui.reportTitle;
            if (!reportCaption) {
                return;
            }
            d.prepend(this.wrapper, h("div", { className: "table-module-report" }, reportCaption));
        };
        //根据列头实时更新方法
        BwTableModule.prototype.rfidColthead = function () {
            var _this = this;
            var rfidCols = this.ui.rfidCols;
            if (rfidCols.calc) {
                //调用接口 传rfid.amount
                var calcCols = rfidCols.calc.cols || {}, when = rfidCols.calc.when || {}, countElements_1 = this.countElements, calculate = calcCols.calculate, calculateScan = calcCols.calculateScan, calculateDiff = calcCols.calculateDiff, calculateAdd = calcCols.calculateAdd, calcRule_1 = rfidCols.calc.calcRule || [], calculateEl_1 = countElements_1[calculate], calculateScanEL_1 = countElements_1[calculateScan], calculateDiffEl_1 = countElements_1[calculateDiff], calculateAddEl_1 = countElements_1[calculateAdd], checkMount_1 = 0;
                Array.isArray(rfidCols.calcData) && rfidCols.calcData.map(function (val) {
                    var cols = rfidCols.calc.cols || {};
                    if (cols.calculateAdd) {
                        var content = rfidCols.calc.cols.calculateAdd;
                        if (val.calcField == content) {
                            checkMount_1 = parseInt(val.calcValue);
                        }
                    }
                });
                Shell.inventory.columnCountOn(when, 1, rfidCols.inventoryKey, false, false, function (res) {
                    var resData = typeof res.data !== 'object' ? {} : res.data || {};
                    //  ['Calculate', 'CalculateScan', 'CalculateDiff'].forEach(key => {
                    //    if(typeof resData[key] !== 'number'){
                    //      resData[key] = 0;
                    //}
                    // });
                    if (calculateEl_1 && resData.Calculate !== "-1") {
                        calculateEl_1.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);
                    }
                    if (calculateScanEL_1 && resData.CalculateScan !== "-1") {
                        calculateScanEL_1.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                    }
                    if (calculateDiffEl_1 && resData.CalculateDiff !== "-1") {
                        calculateDiffEl_1.innerHTML = "-" + ((resData.CalculateDiff === undefined) ? "0" : resData.CalculateDiff);
                    }
                    if (calculateAddEl_1 && resData.CalculateAdd !== "-1") {
                        var num = checkMount_1 + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                        calculateAddEl_1.innerHTML = isNaN(num) ? '-' : num + '';
                        //this.countAddInit = num;
                    }
                    var colHeadStr = {};
                    for (var name_1 in countElements_1) {
                        colHeadStr[name_1] = countElements_1[name_1].innerHTML;
                    }
                    if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan == "-1") {
                        colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                    }
                    colHeadStr['OLD_DIFFAMOUNT'] = _this.OLD_DIFFAMOUNT;
                    if (rfidCols.scanField) {
                        colHeadStr[rfidCols.scanField.toUpperCase()] = countElements_1['scanyet'].innerHTML;
                    }
                    calcRule_1.forEach(function (calc) {
                        var field = calc.field, rule = calc.rule;
                        if (field && rule) {
                            var diffValue = tools.str.parseTpl(rule, colHeadStr), el = countElements_1[field];
                            el && (el.innerHTML = tools.calc(diffValue));
                        }
                    });
                });
            }
        };
        //下载更新后列统计
        BwTableModule.prototype.rfidDownAndUpInitHead = function () {
            var _this = this;
            var rfidCols = this.ui.rfidCols;
            //Array.isArray(rfidCols.calcData) && rfidCols.calcData.map((val)=>{
            //  this.countElements[val.calcField].innerHTML = val.calcValue;
            //})
            if (rfidCols.calc) {
                //调用接口 传rfid.amount
                var calcCols = rfidCols.calc.cols || {}, when = rfidCols.calc.when || {}, countElements_2 = this.countElements, calculate = calcCols.calculate, calculateScan = calcCols.calculateScan, calculateDiff = calcCols.calculateDiff, calculateAdd = calcCols.calculateAdd, calcRule_2 = rfidCols.calc.calcRule || [], calculateEl_2 = countElements_2[calculate], calculateScanEL_2 = countElements_2[calculateScan], calculateDiffEl_2 = countElements_2[calculateDiff], calculateAddEl_2 = countElements_2[calculateAdd], checkMount_2 = 0;
                Shell.inventory.columnCountOn(when, 1, rfidCols.inventoryKey, true, false, function (res) {
                    var resData = typeof res.data !== 'object' ? {} : res.data || {};
                    Array.isArray(rfidCols.calcData) && rfidCols.calcData.map(function (val) {
                        var cols = rfidCols.calc.cols || {};
                        if (cols.calculateAdd) {
                            var content = rfidCols.calc.cols.calculateAdd;
                            if (val.calcField == content) {
                                checkMount_2 = parseInt(val.calcValue);
                            }
                        }
                    });
                    if (calculateEl_2 && resData.Calculate !== "-1") {
                        calculateEl_2.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);
                    }
                    if (calculateScanEL_2 && resData.CalculateScan !== "-1") {
                        calculateScanEL_2.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                    }
                    if (calculateDiffEl_2 && resData.CalculateDiff !== "-1") {
                        calculateDiffEl_2.innerHTML = "-" + (resData.CalculateDiff === undefined ? "0" : resData.CalculateDiff);
                    }
                    if (calculateAddEl_2 && resData.CalculateAdd !== "-1") {
                        var num = checkMount_2 + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                        calculateAddEl_2.innerHTML = num + "";
                    }
                    var colHeadStr = {};
                    for (var name_2 in countElements_2) {
                        colHeadStr[name_2] = countElements_2[name_2].innerHTML;
                    }
                    if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan !== "-1") {
                        colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                    }
                    colHeadStr['OLD_DIFFAMOUNT'] = _this.OLD_DIFFAMOUNT;
                    if (rfidCols.scanField) {
                        colHeadStr[rfidCols.scanField.toUpperCase()] = countElements_2['scanyet'].innerHTML;
                    }
                    calcRule_2.forEach(function (calc) {
                        var field = calc.field, rule = calc.rule;
                        if (field && rule) {
                            var diffValue = tools.str.parseTpl(rule, colHeadStr), el = countElements_2[field];
                            el && (el.innerHTML = tools.calc(diffValue));
                        }
                    });
                    Shell.inventory.columnCountOff({}, 1, rfidCols.inventoryKey, function (res) {
                    });
                });
            }
        };
        BwTableModule.prototype.rfidColInit = function () {
            var _this = this;
            var rfidCols = this.ui.rfidCols, ftable = this.ftable, fields = this.ui.cols, colfield;
            if (!tools.os.android || !this.isRfid || !rfidCols || !rfidCols.amountFlag) {
                return;
            }
            //初始化按钮
            this.ui.subButtons && this.ui.subButtons.forEach(function (val, index) {
                if (val.openType === "rfid_down") {
                    val.title = val.title + "下载";
                }
                else if (val.openType === "rfid_up") {
                    val.title = val.title + "上传";
                }
            });
            // 判断是否是盘点页面 有未上传数据
            if (Shell.inventory.canRfid && this.isRfid && this.ui.subButtons.some(function (val) { return val.openType === 'rfid_begin'; })) {
                sys.window.closeConfirm = {
                    condition: function () {
                        // 李森
                        return new Promise(function (resolve, reject) {
                            Shell.inventory.columnCountOn(rfidCols.calc.when, 1, rfidCols.inventoryKey, true, true, function (res) {
                                resolve(!!(res.data && res.data.CalculateAdd && res.data.CalculateAdd > 0));
                            });
                        });
                    },
                    msg: '有未上传的数据, 是否确认要退出？',
                    btn: ['确定', '取消']
                };
            }
            var wrapper = h("div", { className: "table-module-amount" }, Array.isArray(rfidCols.calcData) && rfidCols.calcData.map(function (val) {
                if (val.calcField == 'DIFFAMOUNT') {
                    _this.OLD_DIFFAMOUNT = parseInt(val.calcValue);
                }
                var el = h("span", null, !val.calcValue ? 0 : val.calcValue);
                _this.countElements[val.calcField] = el;
                return h("span", null,
                    val.calcCaption,
                    ":",
                    el);
            }));
            if (rfidCols.scanFieldName) {
                var scan = h("span", null, "0");
                this.countElements['scanyet'] = scan;
                var el = h("span", null,
                    "\u5DF2\u626B\u63CF\u91CF:",
                    scan);
                d.append(wrapper, el);
                if (rfidCols.amount) {
                    Shell.inventory.getScanCount(rfidCols.amount.toUpperCase(), function (res) {
                        _this.countElements['scanyet'].innerHTML = res.data.SCANAMOUNTS || '0';
                    });
                }
            }
            //监听渲染
            ftable.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                var subBtn = _this.ui.subButtons;
                //if (Array.isArray(subBtn) && subBtn.some(btn => btn.openType === 'rfid_begin')) {
                if (rfidCols.inventoryKey && rfidCols.classify) {
                    var column_1 = ftable.columnGet(rfidCols.classify.toUpperCase());
                    Shell.inventory.getData(rfidCols.inventoryKey, rfidCols.classify.toUpperCase(), function (res) {
                        var resData = res.data, initColData = column_1.data.map(function (cell) {
                            var count = 0;
                            for (var _i = 0, resData_1 = resData; _i < resData_1.length; _i++) {
                                var data = resData_1[_i];
                                if (data.field == cell) {
                                    count = data.count;
                                    break;
                                }
                            }
                            return {
                                field: cell,
                                count: count
                            };
                        });
                        InventoryBtn_1.ontimeRefresh(initColData, _this, rfidCols);
                    });
                }
                //}
            });
            d.classAdd(this.wrapper, 'has-amount');
            if (rfidCols.calcData) {
                d.prepend(this.wrapper, wrapper);
            }
            if (tools.isNotEmpty(rfidCols.calc)) {
                //调用接口 传rfid.amount
                var calcCols = rfidCols.calc.cols || {}, when_1 = rfidCols.calc.when || {}, countElements_3 = this.countElements, calculate = calcCols.calculate, calculateScan = calcCols.calculateScan, calculateDiff = calcCols.calculateDiff, calculateAdd = calcCols.calculateAdd, calcRule_3 = rfidCols.calc.calcRule || [], calculateEl_3 = countElements_3[calculate], calculateScanEL_3 = countElements_3[calculateScan], calculateDiffEl_3 = countElements_3[calculateDiff], calculateAddEl_3 = countElements_3[calculateAdd], checkMount_3 = 0;
                Array.isArray(rfidCols.calcData) && rfidCols.calcData.map(function (val) {
                    var cols = rfidCols.calc.cols || {};
                    if (cols.calculateAdd) {
                        var content = rfidCols.calc.cols.calculateAdd;
                        if (val.calcField == content) {
                            checkMount_3 = parseInt(val.calcValue);
                        }
                    }
                });
                var inventory_1 = rfidCols.inventoryKey ? rfidCols.inventoryKey : "key";
                if (tools.isNotEmpty(rfidCols.calc)) {
                    Shell.inventory.columnCountOn(when_1, 1, inventory_1, true, false, function (res) {
                        var resData = typeof res.data !== 'object' ? {} : res.data || {};
                        if (tools.isEmpty(resData)) {
                            Shell.inventory.columnCountOff({}, 1, inventory_1, function () {
                            });
                            return;
                        }
                        if (calculateEl_3 && resData.Calculate !== "-1") {
                            calculateEl_3.innerHTML = ((resData.Calculate === undefined) ? "0" : resData.Calculate);
                        }
                        if (calculateScanEL_3 && resData.CalculateScan !== "-1") {
                            calculateScanEL_3.innerHTML = ((resData.CalculateScan === undefined) ? "0" : resData.CalculateScan);
                        }
                        if (calculateDiffEl_3 && resData.CalculateDiff !== "-1") {
                            calculateDiffEl_3.innerHTML = "-" + (resData.CalculateDiff === undefined ? "0" : resData.CalculateDiff);
                        }
                        if (calculateAddEl_3 && resData.CalculateAdd !== "-1") {
                            var num = checkMount_3 + parseInt((resData.CalculateAdd === undefined ? "0" : resData.CalculateAdd));
                            calculateAddEl_3.innerHTML = isNaN(num) ? '-' : num + '';
                        }
                        var colHeadStr = {};
                        for (var name_3 in countElements_3) {
                            colHeadStr[name_3] = countElements_3[name_3].innerHTML;
                        }
                        if (colHeadStr['SCANAMOUNT'] === undefined && resData.CalculateScan !== "-1") {
                            colHeadStr['SCANAMOUNT'] = ((resData.Calculate === undefined) ? "0" : resData.CalculateScan);
                        }
                        colHeadStr['OLD_DIFFAMOUNT'] = _this.OLD_DIFFAMOUNT;
                        calcRule_3.forEach(function (calc) {
                            var field = calc.field, rule = calc.rule;
                            if (field && rule) {
                                var diffValue = tools.str.parseTpl(rule, colHeadStr), el = countElements_3[field];
                                el && (el.innerHTML = tools.calc(diffValue));
                            }
                        });
                        Shell.inventory.columnCountOff(when_1, 1, inventory_1, function (res) {
                        });
                    });
                }
            }
        };
        /**
         * 格式化单元格数据
         * @param field - 列字段
         * @param cellData - 单元格数据
         * @param rowData - 行数据
         */
        BwTableModule.prototype.cellFormat = function (field, cellData, rowData) {
            var _this = this;
            var text = cellData, // 文字 或 Node
            color, // 文字颜色
            bgColor, // 背景颜色
            classes = []; // 类名
            if (field && !field.noShow && field.atrrs) {
                var dataType = field.atrrs.dataType, isImg = dataType === BwRule_1.BwRule.DT_IMAGE;
                if (isImg && field.link) {
                    // 缩略图
                    var url = tools.url.addObj(CONF.siteUrl + BwRule_1.BwRule.reqAddr(field.link, rowData), this.ajaxData);
                    text = h("img", { src: url });
                    classes.push('cell-img');
                }
                else if (dataType === BwRule_1.BwRule.DT_MUL_IMAGE) {
                    // 多图缩略图
                    if (typeof cellData === 'string' && cellData[0]) {
                        // url生成
                        var urls = cellData.split(',')
                            .map(function (md5) { return BwRule_1.BwRule.fileUrlGet(md5, field.name, true); })
                            .filter(function (url) { return url; });
                        // 多图缩略图控件
                        if (tools.isNotEmptyArray(urls)) {
                            text = new LayoutImage_1.LayoutImage({ urls: urls }).wrapper;
                        }
                    }
                    classes.push('cell-img');
                }
                else if (dataType === '50') {
                    // 打钩打叉
                    text = h("div", { className: "appcommon " + (cellData === 1 ? 'app-xuanzhong' : 'app-guanbi1'), style: "color: " + (cellData === 1 ? 'green' : 'red') });
                }
                else if (field.name === 'STDCOLORVALUE') {
                    // 显示颜色
                    var _a = tools.val2RGB(cellData), r = _a.r, g = _a.g, b = _a.b;
                    text = h("div", { style: "backgroundColor: rgb(" + r + "," + g + "," + b + ")", height: "100%" });
                }
                else if (field.elementType === 'lookup') {
                    // lookUp替换
                    var options = this.lookUpData[field.name] || [];
                    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                        var opt = options_1[_i];
                        if (opt.value == rowData[field.lookUpKeyField]) {
                            text = opt.text;
                        }
                    }
                }
                else {
                    // 其他文字(金额,百分比,数字 等)
                    text = BwRule_1.BwRule.formatTableText(cellData, field);
                }
                // 时间
                if (cellData && BwRule_1.BwRule.isTime(dataType)) {
                    text = BwRule_1.BwRule.strDateFormat(cellData, field.atrrs.displayFormat);
                }
                // 数字默认右对齐
                if (BwRule_1.BwRule.isNumber(dataType)) {
                    classes.push('text-right');
                }
                // 可点击单元格样式
                ['drillAddr', 'webDrillAddr', 'webDrillAddrWithNull'].forEach(function (addr, i) {
                    // debugger;
                    var reqAddr = field[addr], keyFieldData = rowData[_this.ui.keyField];
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
            return { text: text, classes: classes, bgColor: bgColor, color: color };
        };
        BwTableModule.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.ftable.destroy();
            this.imgEdit.destroy();
            this.ftable = null;
            this.multiImgEdit = null;
            this.imgEdit = null;
            this._ftableReadyHandler = null;
        };
        BwTableModule.EVT_READY = '__TABLE_READY__'; // 创建fastTable完成后的事件
        return BwTableModule;
    }(Component));
    exports.BwTableModule = BwTableModule;
    function drillUrlGet(field, data, keyField) {
        var url;
        for (var _i = 0, _a = ['drillAddr', 'webDrillAddr', 'webDrillAddrWithNull']; _i < _a.length; _i++) {
            var type = _a[_i];
            var addr = field[type];
            url = addr && addr.dataAddr ? BwRule_1.BwRule[type](addr, data, keyField) : '';
            if (url) {
                break;
            }
        }
        return url ? CONF.siteUrl + url : '';
    }
    exports.drillUrlGet = drillUrlGet;
});

define("BwMainTableModule", ["require", "exports", "BwTableModule", "Spinner"], function (require, exports, BwTableModule_1, spinner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var BwMainTableModule = /** @class */ (function (_super) {
        __extends(BwMainTableModule, _super);
        function BwMainTableModule(para) {
            var _this = _super.call(this, para) || this;
            _this.para = para;
            d.classAdd(_this.wrapper, 'table-module-main');
            return _this;
        }
        BwMainTableModule.prototype.ftableReady = function () {
            _super.prototype.ftableReady.call(this);
            this.tableHeightInit();
            if (!tools.isMb) {
                if (this.ui.printList && this.ui.printList.length > 0) {
                    this.initLabelPrint();
                    this.initFormPrint();
                }
            }
        };
        BwMainTableModule.prototype.tdClickHandler = function (field, rowData) {
            _super.prototype.tdClickHandler.call(this, field, rowData);
            // linkName 快捷点击按键
            if (!field)
                return;
            var fieldName = field.name;
            if (this.btnsLinkName.includes(fieldName)) {
                var allBtn = (this.subBtns.box && this.subBtns.box.children) || [];
                var _loop_1 = function (btn) {
                    var rBtn = btn.data;
                    if (rBtn && rBtn.linkName && rBtn.linkName === fieldName) {
                        // 等待表格行选中后
                        setTimeout(function () {
                            btn.onClick.call(btn, null);
                        }, 100);
                    }
                };
                for (var _i = 0, allBtn_1 = allBtn; _i < allBtn_1.length; _i++) {
                    var btn = allBtn_1[_i];
                    _loop_1(btn);
                }
            }
        };
        BwMainTableModule.prototype.clickInit = function () {
            _super.prototype.clickInit.call(this);
            var ftable = this.ftable;
            //
            // this.ftable.click.add(`${clickableSelector} tbody td`, function () {
            //     // 是否为快捷按钮
            //
            //
            //
            // });
        };
        BwMainTableModule.prototype.tableHeightInit = function () {
            var ui = this.ui, clientHeight = document.body.clientHeight;
            // 移动端计算表格的高度
            if (tools.isMb) {
                if (tools.isNotEmpty(ui.subButtons) || tools.isNotEmpty(this.editParam)) {
                    clientHeight -= 37;
                }
                if (ui.rfidCols && ui.rfidCols.amountFlag) {
                    clientHeight -= 42;
                }
                if (ui.reportTitle) {
                    clientHeight -= 42;
                }
                clientHeight -= 45;
                // iphone x 兼容
                if (CSS && CSS.supports && CSS.supports('height: env(safe-area-inset-bottom)')) {
                    this.ftable.wrapper.style.height = "calc(" + clientHeight + "px - env(safe-area-inset-bottom) - env(safe-area-inset-bottom))";
                }
                else {
                    this.ftable.wrapper.style.height = clientHeight + 'px';
                }
            }
        };
        /*
        * 初始化报表打印
        * */
        BwMainTableModule.prototype.initFormPrint = function () {
            var _this = this;
            var formPri, isFirst = true;
            this.ftable.btnAdd('formPrint', {
                content: '报表打印',
                icon: 'label',
                onClick: function () {
                    if (isFirst) {
                        isFirst = false;
                        var sp_1 = new spinner_1.Spinner({
                            el: _this.ftable.btnGet('formPrint').wrapper,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        });
                        sp_1.show();
                        require(['FormPrintModule'], function (formPrint) {
                            formPri = new formPrint({
                                container: _this.wrapper,
                                cols: _this.ftable.dataTools.getCols(),
                                middleTable: _this.ftable.mainTable.head.wrapper,
                                tableData: function () { return _this.ftable.data; }
                            });
                            // formPri.modal.isShow = true;
                            sp_1.hide();
                        });
                    }
                    else {
                        formPri.modal.isShow = true;
                    }
                }
            }, 1);
        };
        /*
        * 初始化标签打印
        * */
        BwMainTableModule.prototype.initLabelPrint = function (callback) {
            var _this = this;
            var label, isFirst = true;
            this.ftable.btnAdd('labelPrint', {
                content: '标签打印',
                icon: 'label',
                onClick: function () {
                    if (isFirst) {
                        isFirst = false;
                        var sp_2 = new spinner_1.Spinner({
                            el: _this.ftable.btnGet('labelPrint').wrapper,
                            size: 14,
                            type: spinner_1.Spinner.SHOW_TYPE.replace,
                        });
                        sp_2.show();
                        require(['LabelPrintModule'], function (Print) {
                            var moneys = [];
                            _this.ftable.columnsVisible.forEach(function (col) {
                                if (col.content && col.content.dataType === '11') {
                                    moneys.push(col.name);
                                }
                            });
                            label = new Print({
                                moneys: moneys,
                                printList: _this.para.ui.printList,
                                container: _this.wrapper,
                                cols: _this.ftable.columnsVisible,
                                getData: function () { return _this.ftable.data; },
                                selectedData: function () { return _this.ftable.selectedRowsData; },
                                callBack: function () {
                                    callback && callback();
                                }
                            });
                            sp_2.hide();
                        });
                    }
                    else {
                        label.modal.isShow = true;
                    }
                }
            }, 0);
        };
        return BwMainTableModule;
    }(BwTableModule_1.BwTableModule));
    exports.BwMainTableModule = BwMainTableModule;
});

define("BwSubTableModule", ["require", "exports", "BwTableModule"], function (require, exports, BwTableModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tools = G.tools;
    var d = G.d;
    var BwSubTableModule = /** @class */ (function (_super) {
        __extends(BwSubTableModule, _super);
        function BwSubTableModule(para) {
            return _super.call(this, para) || this;
        }
        BwSubTableModule.prototype.ftableReady = function () {
            _super.prototype.ftableReady.call(this);
            tools.isNotEmpty(this.ui.subButtons) && this.subBtns.init(this.subBtnWrapper);
        };
        Object.defineProperty(BwSubTableModule.prototype, "subBtnWrapper", {
            get: function () {
                if (!this._subBtnWrapper) {
                    // debugger;
                    if (tools.isMb) {
                        var modal = this.tableModule.mobileModal;
                        var btnWrapper = h("div", { className: "sub-btn-wrapper mui-bar-footer" });
                        modal.bodyWrapper.style.height = 'calc(100% - 39px)';
                        d.after(modal.bodyWrapper, btnWrapper);
                        this._subBtnWrapper = btnWrapper;
                    }
                    else {
                        this._subBtnWrapper = this.ftable.btnWrapper;
                    }
                }
                return this._subBtnWrapper;
            },
            enumerable: true,
            configurable: true
        });
        BwSubTableModule.prototype.wrapperInit = function (para) {
            var wrapper = _super.prototype.wrapperInit.call(this, para);
            d.classAdd(wrapper, 'table-module-sub');
            return wrapper;
        };
        return BwSubTableModule;
    }(BwTableModule_1.BwTableModule));
    exports.BwSubTableModule = BwSubTableModule;
});

define("newTableModule", ["require", "exports", "BwRule", "BwMainTableModule", "FastTable", "BwSubTableModule", "Modal", "MbPage", "CheckBox", "InputBox", "Button", "Loading", "Tab", "FormCom"], function (require, exports, BwRule_1, BwMainTable_1, FastTable_1, BwSubTableModule_1, Modal_1, MbPage_1, checkBox_1, InputBox_1, Button_1, loading_1, tab_1, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var CONF = BW.CONF;
    var NewTableModule = /** @class */ (function () {
        function NewTableModule(para) {
            var _this = this;
            this.main = null;
            this.sub = {};
            this.subIndex = 0;
            this.mobileModal = null;
            this.subWrapper = null;
            this.draggedEvent = (function () {
                var mainHeight = 0, subHeight = 0, mouseDownHandler = null, mouseMoveHandler = null, mouseUpHandler = null;
                return {
                    on: function () {
                        var mainWrapper = _this.main.wrapper;
                        var subWrapper = _this.subWrapper;
                        mainHeight = mainWrapper.offsetHeight;
                        subHeight = subWrapper.offsetHeight;
                        d.on(_this.main.container, 'mousedown', '.drag-line', mouseDownHandler = function (ev) {
                            document.body.style.cssText = 'cursor: n-resize!important';
                            var disY = ev.clientY;
                            d.off(document, 'mousemove', mouseMoveHandler);
                            d.off(document, 'mouseup', mouseUpHandler);
                            d.on(document, 'mousemove', mouseMoveHandler = function (ev) {
                                var translate = ev.clientY - disY;
                                if (mainHeight + translate > 200 && subHeight - translate > 200) {
                                    disY = ev.clientY;
                                    mainHeight += translate;
                                    subHeight -= translate;
                                    mainWrapper.style.height = mainHeight + 'px';
                                    subWrapper.style.height = subHeight + 'px';
                                }
                            });
                            d.on(document, 'mouseup', mouseUpHandler = function () {
                                d.off(document, 'mousemove', mouseMoveHandler);
                                d.off(document, 'mouseup', mouseUpHandler);
                                document.body.style.removeProperty('cursor');
                            });
                        });
                    },
                    off: function () {
                        d.off(_this.dragLine, 'mousedown', mouseDownHandler);
                    }
                };
            })();
            this.editBtns = (function () {
                var box, editBtnData = [];
                var start = function () {
                    btnStatus.start();
                    return _this.edit.start();
                };
                var dbclick = (function () {
                    var selector = '.section-inner-wrapper:not(.pseudo-table) tbody td:not(.cell-img)', handler = function () {
                        var _this = this;
                        start().then(function () {
                            _this.click();
                        });
                    };
                    return {
                        on: function () {
                            d.on(_this.main.container, 'dblclick', selector, handler);
                        },
                        off: function () {
                            d.off(_this.main.container, 'dblclick', selector, handler);
                        }
                    };
                })();
                var editParamHas = function (varNames, isMain) {
                    var params = [], mainEditParam = _this.main.editParam, subEditParam = tools.isNotEmpty(_this.sub) && tools.isNotEmpty(_this.sub[_this.subTabActiveIndex]) && _this.sub[_this.subTabActiveIndex].editParam;
                    if (typeof isMain === 'undefined') {
                        params = [mainEditParam, subEditParam];
                    }
                    else {
                        params = [isMain ? mainEditParam : subEditParam];
                    }
                    return params.some(function (param) { return editVarHas(param, varNames); });
                };
                var btnStatus = {
                    end: function (isMain) {
                        var status = {
                            edit: editParamHas(['update'], isMain),
                            insert: editParamHas(['insert'], isMain),
                            del: editParamHas(['delete'], isMain),
                            save: false,
                            cancel: false
                        };
                        if (box) {
                            for (var key in status) {
                                var btn = box.getItem(key);
                                btn && (btn.isDisabled = !status[key]);
                            }
                        }
                        dbclick.on();
                    },
                    start: function (isMain) {
                        var status = {
                            edit: false,
                            insert: editParamHas(['insert'], isMain),
                            del: editParamHas(['delete'], isMain),
                            save: true,
                            cancel: true
                        };
                        //
                        for (var key in status) {
                            var btn = box.getItem(key);
                            if (btn) {
                                btn.isDisabled = !status[key];
                            }
                        }
                        dbclick.off();
                    }
                };
                var initInner = function (wrapper) {
                    editBtnData = [
                        {
                            key: 'edit',
                            content: '编辑',
                            onClick: function () {
                                start();
                            },
                            icon: 'app-bianji',
                            iconPre: 'appcommon'
                        }, {
                            key: 'insert',
                            content: '新增',
                            onClick: function () {
                                btnStatus.start();
                                _this.edit.insert();
                            },
                            icon: 'app-xinzeng',
                            iconPre: 'appcommon'
                        }, {
                            key: 'del',
                            content: '删除',
                            onClick: function () {
                                btnStatus.start();
                                _this.edit.del();
                            },
                            icon: 'app-shanchu',
                            iconPre: 'appcommon'
                        }, {
                            key: 'save',
                            content: '保存',
                            onClick: function () {
                                _this.edit.save();
                            },
                            icon: 'app-baocun',
                            iconPre: 'appcommon'
                        }, {
                            key: 'cancel',
                            content: '取消',
                            onClick: function () {
                                btnStatus.end();
                                _this.edit.cancel();
                            },
                            icon: 'app-quxiao',
                            iconPre: 'appcommon'
                        }
                    ];
                    box = new InputBox_1.InputBox({
                        container: wrapper
                    });
                    d.classAdd(box.wrapper, 'pull-left edit-btns');
                    editBtnData.forEach(function (btnData) {
                        box.addItem(new Button_1.Button(btnData));
                    });
                    btnStatus.end();
                    _this.active.onChange = function (isMain) {
                        _this.main.ftable.editing ? btnStatus.start(isMain) : btnStatus.end(isMain);
                    };
                };
                return {
                    init: function (wrapper) {
                        initInner(wrapper);
                    },
                    get box() {
                        return box;
                    },
                    start: start,
                    end: function () {
                        btnStatus.end();
                    }
                };
            })();
            this.active = (function () {
                var isMainActive = true, handler1, handler2, onChange = function (isActive) {
                };
                var on = function () {
                    _this.sub && d.on(_this.subWrapper, 'click', handler1 = function () {
                        isMainActive = false;
                        tools.isFunction(onChange) && onChange(isMainActive);
                    });
                    d.on(_this.main.wrapper, 'click', handler2 = function () {
                        isMainActive = true;
                        tools.isFunction(onChange) && onChange(isMainActive);
                    });
                };
                var off = function () {
                    _this.sub && d.off(_this.subWrapper, 'click', handler1);
                    d.off(_this.main.wrapper, 'click', handler2);
                };
                return {
                    on: on, off: off,
                    get isMain() {
                        return isMainActive;
                    },
                    set isMain(isMain) {
                        isMainActive = isMain;
                    },
                    set onChange(hander) {
                        onChange = hander;
                    }
                };
            })();
            this.edit = (function () {
                var self = _this, editModule = null;
                var tableEach = function (fun) {
                    [_this.main].concat(Object.values(_this.sub)).forEach(function (table, i) {
                        fun(table, i);
                    });
                };
                var cancel = function () {
                    _this.main.ftable.editorCancel();
                    _this.sub && Object.values(_this.sub).forEach(function (subTable) {
                        subTable.ftable.editorCancel();
                    });
                };
                var start = function () {
                    // debugger;
                    var mftable = _this.main.ftable;
                    if (mftable.editing) {
                        return;
                    }
                    var allPromise = [];
                    tableEach(function (table) {
                        if (table) {
                            allPromise.push(Promise.all([
                                editModuleLoad(),
                                table.rowDefData
                            ]).then(function (_a) {
                                var TableEditModule = _a[0], defData = _a[1];
                                var index = mftable.pseudoTable ? mftable.pseudoTable.presentOffset : -1, mainData = table.isSub && index >= 0 ? mftable.tableData.rowDataGet(index) : null;
                                tableEditInit(TableEditModule, table, Object.assign({}, defData, mainData));
                            }));
                        }
                    });
                    return Promise.all(allPromise).then(function () {
                    });
                };
                var tableEditInit = function (TableEditModule, bwTable, defData) {
                    editModule = new TableEditModule({
                        auto: false,
                        type: 'table',
                        fields: bwTable.cols.map(function (f) {
                            return {
                                dom: null,
                                field: f
                            };
                        })
                    });
                    bwTable.ftable.editorInit({
                        defData: defData,
                        isPivot: _this.bwEl.relateType === 'P',
                        autoInsert: false,
                        inputInit: function (cell, col, data) {
                            var rowIndex = cell.row.index, row = bwTable.ftable.rowGet(rowIndex), field = col.content;
                            var value = data;
                            if (field.elementType === 'lookup') {
                                var lookUpKeyField = field.lookUpKeyField, cell_1 = row.cellGet(lookUpKeyField);
                                value = cell_1 ? cell_1.data : '';
                            }
                            var com = !BwRule_1.BwRule.isImage(field.atrrs && field.atrrs.dataType) ? editModule.init(col.name, {
                                dom: cell.wrapper,
                                data: row.data,
                                field: field,
                                onExtra: function (data, relateCols, isEmptyClear) {
                                    if (isEmptyClear === void 0) { isEmptyClear = false; }
                                    if (tools.isEmpty(data) && isEmptyClear) {
                                        // table.edit.modifyTd(td, '');
                                        cell.data = '';
                                        return;
                                    }
                                    //TODO 给row.data赋值会销毁当前cell的input
                                    // row.data = Object.assign({}, row.data, data);
                                    if (field.elementType === 'lookup') {
                                        var lookUpKeyField = field.lookUpKeyField, cell_2 = row.cellGet(lookUpKeyField);
                                        if (cell_2 && cell_2.column) {
                                            var filed_1 = cell_2.column.content;
                                            cell_2.data = data[lookUpKeyField];
                                            if (filed_1.assignSelectFields && filed_1.assignAddr) {
                                                NewTableModule.initAssignData(filed_1.assignAddr, row ? row.data : {})
                                                    .then(function (_a) {
                                                    var response = _a.response;
                                                    var data = response.data;
                                                    if (data && data[0]) {
                                                        filed_1.assignSelectFields.forEach(function (name) {
                                                            var assignCell = row.cellGet(name);
                                                            if (assignCell) {
                                                                assignCell.data = data[0][name];
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }) : null;
                            if (com instanceof basic_1.FormCom) {
                                com.set(value);
                            }
                            return com;
                        },
                        cellCanInit: function (col, type) {
                            // let field = col.content || {};
                            // return  type === 1 ? !field.noModify : !field.noEdit;
                            return cellCanInit(col, type);
                        },
                        rowCanInit: function (row) {
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
                            return rowCanInit(row, bwTable.isSub);
                        }
                    });
                    // 控件销毁时验证
                    bwTable.ftable.on(FastTable_1.FastTable.EVT_CELL_EDIT_CANCEL, function (cell) {
                        validate(cell);
                    });
                    var validate = function (cell) {
                        // debugger;
                        var name = cell.name, field = cell.column.content, fastRow = cell.frow, rowData = fastRow.data, lookUpCell, result;
                        if (field.elementType === 'lookup') {
                            lookUpCell = fastRow.cellGet(field.lookUpKeyField);
                            if (lookUpCell && lookUpCell.column) {
                                field = lookUpCell.column.content;
                                result = editModule.validate.start(lookUpCell.name, lookUpCell.data);
                            }
                        }
                        else {
                            result = editModule.validate.start(name, cell.data);
                        }
                        if (result && result[name]) {
                            cell.errorMsg = result[name].errMsg;
                            // callback(td, false);
                        }
                        else if (field.chkAddr && tools.isNotEmpty(rowData[name])) {
                            TableEditModule.checkValue(field, rowData, function () {
                                cell.data = null;
                                lookUpCell && (lookUpCell.data = null);
                            })
                                .then(function (res) {
                                var errors = res.errors, okNames = res.okNames;
                                Array.isArray(errors) && errors.forEach(function (err) {
                                    var name = err.name, msg = err.msg, cell = fastRow.cellGet(name);
                                    if (cell) {
                                        cell.errorMsg = msg;
                                    }
                                    //     callback(el, false);
                                });
                                Array.isArray(okNames) && okNames.forEach(function (name) {
                                    cell.errorMsg = null;
                                });
                            });
                        }
                        else {
                            cell.errorMsg = '';
                            // callback(td, true);
                        }
                    };
                };
                var editModuleLoad = function () {
                    return new Promise(function (resolve) {
                        require(['EditModule'], function (edit) {
                            resolve(edit.EditModule);
                        });
                    });
                };
                var editParamDataGet = function (tableData, varList) {
                    var paramData = {};
                    varList && ['update', 'delete', 'insert'].forEach(function (key) {
                        var dataKey = varList[key + "Type"];
                        if (varList[key] && tableData[dataKey][0]) {
                            var data = BwRule_1.BwRule.varList(varList[key], tableData[dataKey], true, _this.bwEl.relateType !== 'P');
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
                var editDataGet = function (data) {
                    var postData = {
                        param: []
                    };
                    [_this.main].concat(Object.values(_this.sub)).forEach(function (bwTable, i) {
                        if (!bwTable) {
                            return;
                        }
                        var editData = bwTable.ftable.editedData;
                        if (i === 1) {
                            // 带上当前主表的字段
                            var mainData_1 = _this.main.ftable.edit;
                            var _loop_1 = function (key) {
                                if (tools.isNotEmpty(editData[key])) {
                                    editData[key].forEach(function (obj, i) {
                                        editData[key][i] = Object.assign({}, mainData_1, obj);
                                    });
                                }
                            };
                            for (var key in editData) {
                                _loop_1(key);
                            }
                        }
                        //
                        var data = editParamDataGet(editData, bwTable.editParam);
                        // tm.table.edit.reshowEditing();
                        //
                        if (!tools.isEmpty(data)) {
                            postData.param.push(data);
                        }
                    });
                    return postData;
                };
                var insert = function () {
                    var main = _this.main, sub = _this.sub[_this.subTabActiveIndex];
                    (main.ftable.editing ? Promise.resolve() : start())
                        .then(function () {
                        var currentTable = _this.active.isMain ? main : sub;
                        currentTable && currentTable.ftable.rowAdd();
                    });
                };
                var save = function () {
                    return editModule.assignPromise.then(function () {
                        var saveData = editDataGet();
                        if (tools.isEmpty(saveData.param)) {
                            Modal_1.Modal.toast('没有数据改变');
                            cancel();
                            _this.editBtns.end();
                            return;
                        }
                        var loading = new loading_1.Loading({
                            msg: '保存中',
                            disableEl: _this.main.wrapper
                        });
                        BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + _this.bwEl.tableAddr.dataAddr, {
                            type: 'POST',
                            data: saveData,
                        }).then(function (_a) {
                            var response = _a.response;
                            BwRule_1.BwRule.checkValue(response, saveData, function () {
                                // 刷新主表
                                _this.refresh();
                                // 刷新子表
                                !(_this.subIndex in _this.main.ftable.rows) && (_this.subIndex = 0);
                                var row = _this.main.ftable.rowGet(_this.subIndex);
                                _this.subRefresh(row.data);
                                Modal_1.Modal.toast(response.msg);
                                _this.editBtns.end();
                                // loading && loading.destroy();
                                // loading = null;
                                cancel();
                                tools.event.fire(NewTableModule.EVT_EDIT_SAVE);
                            });
                        }).finally(function () {
                            loading && loading.destroy();
                            loading = null;
                        });
                    });
                };
                var del = function () {
                    var main = _this.main, sub = _this.sub[_this.subTabActiveIndex];
                    (main.ftable.editing ? Promise.resolve() : start())
                        .then(function () {
                        // let currentTable = isMainActive ? main : sub;
                        // currentTable && currentTable.ftable.rowAdd();
                        var mainFtable = main.ftable, subFtable = sub ? sub.ftable : null;
                        if (!subFtable || tools.isEmpty(subFtable.data)) {
                            mainFtable.rowDel(mainFtable.selectedRows.map(function (row) { return row.index; }));
                        }
                        else if (subFtable && tools.isNotEmpty(subFtable.selectedRows)) {
                            subFtable.rowDel(subFtable.selectedRows.map(function (row) { return row.index; }));
                        }
                        else {
                            Modal_1.Modal.alert('不能删除有明细的主表数据');
                        }
                    });
                };
                var cellCanInit = function (col, type) {
                    var field = col.content || {};
                    return type === 1 ? !field.noModify : !field.noEdit;
                };
                var rowCanInit = function (row, isSub) {
                    var canRowInit = function (isMain, rowData) {
                        if (isMain) {
                            return !(rowData && (rowData['EDITEXPRESS'] === 0));
                        }
                        else {
                            var main = self.main.ftable, mainIndex = main.pseudoTable.presentOffset, row_1 = main.rowGet(mainIndex), mainRowData = row_1 ? row_1.data : {};
                            return canRowInit(true, mainRowData);
                        }
                    };
                    return tools.isEmpty(row) ? false : canRowInit(!isSub, row.data);
                    //当为0时不可编辑
                };
                return {
                    start: start,
                    cancel: cancel,
                    save: save,
                    insert: insert,
                    del: del,
                    cellCanInit: cellCanInit,
                    rowCanInit: rowCanInit
                };
            })();
            console.log(para);
            this.bwEl = para.bwEl;
            this._defaultData = para.data || null;
            this.subTabActiveIndex = 0;
            var subUi = this.bwEl.subTableList, _a = getMainSubVarList(para.bwEl.tableAddr), mainParam = _a.mainParam, subParam = _a.subParam;
            // this.mainEditable = !!mainVarList;
            // this.subEditable = !!subVarList;
            this.editable = !!(mainParam || (subUi && subParam));
            var main = this.main = new BwMainTable_1.BwMainTableModule({
                ui: para.bwEl,
                container: para.container,
                editParam: mainParam,
                ajaxData: para.ajaxData,
                tableModule: this,
            });
            main.onFtableReady = function () {
                if (tools.isNotEmpty(_this.bwEl.subButtons)) {
                    main.subBtns.init(_this.btnWrapper);
                }
                if (_this.editable) {
                    _this.editBtns.init(_this.btnWrapper);
                }
                // this.editInit(para.bwEl);
                if (tools.isNotEmpty(subUi)) {
                    var mftable_1 = main.ftable, pseudoTable_1 = mftable_1.pseudoTable;
                    // 创建标签页
                    var container = _this.main.container, modal_1 = null;
                    d.classAdd(container, 'table-module-has-sub');
                    var tabWrapper_1 = null;
                    if (!tools.isMb) {
                        if (tools.isEmpty(_this.dragLine)) {
                            _this.dragLine = h("div", { className: "drag-line" });
                            d.append(container, _this.dragLine);
                        }
                        tabWrapper_1 = h("div", { className: "sub-table-tab-wrapper" });
                        d.append(container, tabWrapper_1);
                    }
                    else {
                        modal_1 = new Modal_1.Modal({
                            className: 'modal-mbPage sub-table',
                            isBackground: false,
                            height: '60%',
                            width: '75%',
                            isMb: false,
                            position: 'right',
                            onClose: function () {
                                var pseudoTable = _this.main.ftable.pseudoTable;
                                pseudoTable && pseudoTable.clearPresentSelected();
                                _this.active.isMain = true;
                            }
                        });
                        _this.main.subBtns.box && (modal_1.wrapper.style.bottom = '36px');
                        // modal.wrapper.style.right = '0';
                        modal_1.wrapper.style.left = 'auto';
                        modal_1.wrapper.style.top = 'auto';
                        modal_1.wrapper.style.bottom = '40px';
                        _this.mobileModal = modal_1;
                        var mbPage = new MbPage_1.MbPage({
                            headerHeight: '30px',
                            container: modal_1.bodyWrapper,
                            title: '子表',
                            right: [{
                                    icon: 'close',
                                    onClick: function () {
                                        modal_1.isShow = false;
                                    }
                                }],
                            left: [{
                                    icon: 'fa fa-expand',
                                    iconPre: 'mui-icon',
                                    onClick: function () {
                                        d.classToggle(modal_1.wrapper, 'full-screen');
                                        d.classToggle(modal_1.wrapper, 'sub-table');
                                    }
                                }],
                        });
                        tabWrapper_1 = mbPage.bodyEl;
                    }
                    var tabs_1 = [];
                    _this.subWrapper = tools.isMb ? modal_1.wrapper : tabWrapper_1;
                    !tools.isMb && _this.draggedEvent.on();
                    _this.active.on();
                    var isFirst_1 = true;
                    mftable_1.on(FastTable_1.FastTable.EVT_RENDERED, function () {
                        // let sub = this.sub || this.subInit(subUi);
                        if (mftable_1.editing) {
                            return;
                        }
                        !(_this.subIndex in mftable_1.rows) && (_this.subIndex = 0);
                        var firstRow = mftable_1.rowGet(_this.subIndex);
                        if (!firstRow) {
                            _this.mobileModal && (_this.mobileModal.isShow = false);
                            return;
                        }
                        firstRow.selected = true;
                        if (tools.isEmpty(_this.tab)) {
                            _this.tab = new tab_1.Tab({
                                panelParent: tabWrapper_1,
                                tabParent: tabWrapper_1,
                                tabs: tabs_1,
                                onClick: function (index) {
                                    _this.subTabActiveIndex = index;
                                    var selectedData = _this.rowData ? _this.rowData : (mftable_1.selectedRowsData[0] || {}), ajaxData = Object.assign({}, main.ajaxData, BwRule_1.BwRule.varList(_this.bwEl.subTableList[index].dataAddr.varList, selectedData));
                                    if (!tools.isNotEmpty(_this.sub[index])) {
                                        var subParam_1 = getMainSubVarList(_this.bwEl.tableAddr).subParam, tabEl = d.query(".tab-pane[data-index=\"" + index + "\"]", _this.tab.getPanel());
                                        _this.subInit(_this.bwEl.subTableList[index], subParam_1, ajaxData, tabEl);
                                    }
                                    else {
                                        _this.mobileModal && (_this.mobileModal.isShow = true);
                                        _this.sub[index].refresh(ajaxData).catch();
                                    }
                                }
                            });
                            if (!tools.isMb) {
                                d.query('ul.nav-tabs').appendChild(h("i", { className: "fa fa-expand full-icon" }));
                            }
                        }
                        _this.tab.len <= 0 && _this.bwEl.subTableList.forEach(function (sub) {
                            _this.tab.addTab([{
                                    title: sub.caption,
                                    dom: null
                                }]);
                        });
                        setTimeout(function () {
                            // this.subRefresh(firstRow.data);
                            if (isFirst_1) {
                                _this.tab.active(0);
                                pseudoTable_1 && pseudoTable_1.setPresentSelected(_this.subIndex);
                                isFirst_1 = false;
                            }
                            if (!tools.isMb) {
                                d.on(_this.tab.getTab(), 'click', '.full-icon', function () {
                                    var tabEl = d.query('.table-module-sub', d.query(".tab-pane[data-index=\"" + _this.subTabActiveIndex + "\"]", _this.tab.getPanel()));
                                    new Modal_1.Modal({
                                        body: tabEl,
                                        className: 'full-screen sub-table-full',
                                        header: {
                                            title: _this.bwEl.subTableList[_this.subTabActiveIndex].caption
                                        },
                                        onClose: function () {
                                            _this.sub[_this.subTabActiveIndex].ftable.removeAllModal();
                                            d.query(".tab-pane[data-index=\"" + _this.subTabActiveIndex + "\"]", _this.tab.getPanel()).appendChild(tabEl);
                                        }
                                    });
                                });
                            }
                        }, 200);
                    });
                    var self_1 = _this;
                    mftable_1.click.add('.section-inner-wrapper.pseudo-table tbody tr[data-index]', function () {
                        var rowIndex = parseInt(this.dataset.index), row = mftable_1.rowGet(rowIndex);
                        self_1.subIndex = rowIndex;
                        if (row && row.selected) {
                            self_1.subRefresh(row.data);
                            pseudoTable_1 && pseudoTable_1.setPresentSelected(rowIndex);
                        }
                        else {
                            self_1.mobileModal && (self_1.mobileModal.isShow = false);
                        }
                    });
                }
            };
        }
        Object.defineProperty(NewTableModule.prototype, "defaultData", {
            get: function () {
                return this._defaultData
                    ? this._defaultData.map(function (obj) { return Object.assign({}, obj || {}); })
                    : null;
            },
            enumerable: true,
            configurable: true
        });
        NewTableModule.prototype.subRefresh = function (rowData) {
            var bwEl = this.bwEl, subUi = bwEl.subTableList && bwEl.subTableList[this.subTabActiveIndex], main = this.main, mftable = main.ftable;
            if (tools.isEmpty(subUi)) {
                return;
            }
            var selectedData = rowData ? rowData : (mftable.selectedRowsData[0] || {}), ajaxData = Object.assign({}, main.ajaxData, BwRule_1.BwRule.varList(subUi.dataAddr.varList, selectedData));
            // 查询从表时不需要带上选项参数
            delete ajaxData['queryoptionsparam'];
            this.mobileModal && (this.mobileModal.isShow = true);
            Object.values(this.sub).forEach(function (subTable) {
                subTable.refresh(ajaxData).catch();
            });
            // if (!tools.isNotEmpty(this.sub[this.subTabActiveIndex])) {
            //     let {subParam} = getMainSubVarList(bwEl.tableAddr);
            //     this.subInit(subUi, subParam, ajaxData);
            // } else {
            //     this.mobileModal && (this.mobileModal.isShow = true);
            //     this.sub.forEach((subTable) => {
            //         subTable.refresh(ajaxData).catch();
            //     });
            // }
        };
        NewTableModule.prototype.subInit = function (ui, editParam, ajaxData, tabEl) {
            this.sub[this.subTabActiveIndex] = new BwSubTableModule_1.BwSubTableModule({
                ui: ui,
                editParam: editParam,
                ajaxData: ajaxData,
                isSub: true,
                tableModule: this,
                container: tabEl
            });
        };
        NewTableModule.prototype.refresh = function (data) {
            return this.main.refresh(data);
        };
        NewTableModule.initAssignData = function (assignAddr, data) {
            return BwRule_1.BwRule.Ajax.fetch(CONF.siteUrl + BwRule_1.BwRule.reqAddr(assignAddr, data), {
                cache: true,
            });
        };
        Object.defineProperty(NewTableModule.prototype, "btnWrapper", {
            get: function () {
                var _this = this;
                if (!this._btnWrapper) {
                    var main = this.main;
                    // debugger;
                    if (tools.isMb) {
                        d.classAdd(this.main.wrapper, 'has-footer-btn');
                        this._btnWrapper = h("footer", { className: "mui-bar mui-bar-footer" });
                        //
                        d.append(this.main.wrapper, this._btnWrapper);
                        if (this.editable && tools.isNotEmpty(this.bwEl.subButtons)) {
                            var btnWrapper = h("div", { className: "all-btn" });
                            new checkBox_1.CheckBox({
                                className: 'edit-toggle',
                                container: this._btnWrapper,
                                onClick: function (isChecked) {
                                    _this.main.subBtns.box.isShow = !isChecked;
                                    _this.editBtns.box.isShow = isChecked;
                                }
                            });
                            d.append(this._btnWrapper, btnWrapper);
                            this._btnWrapper = btnWrapper;
                        }
                    }
                    else {
                        this._btnWrapper = main.ftable.btnWrapper;
                    }
                }
                return this._btnWrapper;
            },
            enumerable: true,
            configurable: true
        });
        NewTableModule.prototype.destroy = function () {
            this.mobileModal && this.mobileModal.destroy();
            this.draggedEvent.off();
            d.remove(this.dragLine);
            this.main && this.main.destroy();
            this.sub && Object.values(this.sub).forEach(function (subTable) {
                subTable.destroy();
            });
            d.remove(this.subWrapper);
            this.subWrapper = null;
            this.main = null;
            this.sub = null;
            this.edit = null;
            this.bwEl = null;
            this._btnWrapper = null;
            this.tab = null;
        };
        NewTableModule.EVT_EXPORT_DATA = '__EVENT_EXPORT_TABLE_DATA__';
        NewTableModule.EVT_EDIT_SAVE = "__event_edit_save__";
        return NewTableModule;
    }());
    exports.NewTableModule = NewTableModule;
    function getMainSubVarList(addr) {
        var varlist = {
            mainParam: null,
            subParam: null,
        };
        addr && Array.isArray(addr.param) && addr.param.forEach(function (p) {
            if (p.type === 'sub') {
                varlist.subParam = p;
            }
            else if (p.type === 'main') {
                varlist.mainParam = p;
            }
        });
        return varlist;
    }
    function editVarHas(varList, hasTypes) {
        var types = ['update', 'insert', 'delete'];
        if (varList) {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var t = types_1[_i];
                if (hasTypes.indexOf(varList[t + "Type"]) > -1) {
                    return true;
                }
            }
        }
        return false;
    }
});

define("BwInventoryBtnFun", ["require", "exports", "Modal"], function (require, exports, Modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CONF = BW.CONF;
    var tools = G.tools;
    var Shell = G.Shell;
    var sys = BW.sys;
    var Ajax = G.Ajax;
    function InventoryBtn(btn, bwTable) {
        var rBtn = btn.data;
        var session;
        if (rBtn.openType === 'rfid_down') {
            //获取下载地址
            var uploadUrl_1 = "";
            bwTable.ui.subButtons.forEach(function (value, index) {
                if (value.openType == "rfid_up") {
                    uploadUrl_1 = value.actionAddr.dataAddr;
                }
            });
            console.log(uploadUrl_1);
            down(rBtn.actionAddr.dataAddr + "", uploadUrl_1 + "", btn, bwTable).then(function () {
                bwTable.rfidDownAndUpInitHead();
                btn.isDisabled = false;
                //bwTable.rfidColthead(true,700);
                btn.content = btn.content.replace(/下载/g, "更新");
            });
        }
        else if (rBtn.openType === 'rfid_up') {
            up(rBtn.actionAddr.dataAddr, bwTable);
            //btn.content = btn.content.replace(/上传/g,"更新");
        }
        else if (rBtn.openType === 'rfid_begin' || rBtn.openType === 'rfid_stop') {
            start(rBtn.openType, btn, bwTable);
            //检索数据中FIELD是行数
        }
        else if (rBtn.openType === 'rfid_find' || rBtn.openType === 'rfid_nofind') {
            //开始扫货
            search(rBtn.openType, btn, bwTable);
        }
        else if (rBtn.openType === 'rfid_import') {
            sys.window.open({
                url: tools.url.addObj(CONF.siteUrl + rBtn.actionAddr.dataAddr, {
                    param1: JSON.stringify(bwTable.ajaxData)
                })
            });
        }
    }
    exports.InventoryBtn = InventoryBtn;
    //数据实时更新方法
    function ontimeRefresh(invenData, bwTable, rfidCol) {
        var ftable = bwTable.ftable, tableData = ftable.data, tableKeyData = {}, classifyField = rfidCol.classify.toUpperCase(), scanamountField = rfidCol.amount.toUpperCase();
        tableData.forEach(function (rowData, i) {
            tableKeyData[rowData[classifyField]] = {
                rowData: rowData,
                index: i
            };
        });
        // let iii = 0;
        for (var _i = 0, invenData_1 = invenData; _i < invenData_1.length; _i++) {
            var data = invenData_1[_i];
            var tempRow = tableKeyData[data.field];
            if (tools.isEmpty(tempRow)) {
                continue;
            }
            var rowData = tempRow.rowData, index = tempRow.index, row = ftable.rowGet(index);
            rowData[scanamountField] = data.count;
            if (rfidCol.ruleFields) {
                for (var _a = 0, _b = rfidCol.ruleFields; _a < _b.length; _a++) {
                    var val = _b[_a];
                    // debugger;
                    var diffValue = tools.str.parseTpl(val.amountRule.toUpperCase(), rowData);
                    rowData[val.amountField.toUpperCase()] = tools.calc(diffValue);
                    row.data = rowData;
                }
            }
            else {
                row.data = rowData;
            }
        }
    }
    exports.ontimeRefresh = ontimeRefresh;
    var sessionInve;
    function start(content, btn, bwTable) {
        var invenData;
        if (content === 'rfid_begin') {
            var rfidCol_1 = bwTable.ui.rfidCols;
            var when = rfidCol_1.calc.when;
            //判断rfidCol 如果为空 就直接退出；
            if (G.tools.isEmpty(rfidCol_1)) {
                return;
            }
            btn.content = '结束扫描';
            btn.data.openType = 'rfid_stop';
            sessionInve = setInterval(function () {
                Ajax.fetch(CONF.ajaxUrl.rfidLoginTime);
            }, 9 * 60 * 1000);
            if (rfidCol_1.classify) {
                G.Shell.inventory.startCheck({
                    "memSearch": "S1",
                    "memTime": "20",
                    "field": rfidCol_1.classify.toUpperCase()
                }, function (res) {
                    invenData = res.data;
                    ontimeRefresh(invenData, bwTable, rfidCol_1);
                    // bwTable.rfidColStatistics();
                });
                bwTable.rfidColthead();
            }
        }
        else {
            var rfidCol = bwTable.ui.rfidCols;
            G.Shell.inventory.stopCheck({}, function (res) {
                Modal_1.Modal.alert("结束扫描");
            });
            btn.content = '开始';
            btn.data.openType = 'rfid_begin';
            //close
            Shell.inventory.columnCountOff({}, 1, rfidCol.inventoryKey, function (res) {
            });
            clearInterval(sessionInve);
        }
    }
    function up(url, bwTable) {
        var inventoryKey = "";
        bwTable.ui.subButtons.forEach(function (value, index, array) {
            if (value.openType == "rfid_up") {
                inventoryKey = value.inventoryKey;
            }
        });
        if (inventoryKey) {
            G.Shell.inventory.uploadData(tools.url.addObj(CONF.siteUrl + url, bwTable.ajaxData), inventoryKey, function (res) {
                // alert(JSON.stringify(res));
            });
        }
    }
    function down(url, uploadUrl, btn, bwTable) {
        var uploadUrl1 = tools.url.addObj(CONF.siteUrl + uploadUrl, bwTable.ajaxData);
        var url1 = tools.url.addObj(CONF.siteUrl + url, bwTable.ajaxData);
        return new Promise((function (resolve) {
            btn.isDisabled = true;
            var inVen, inventoryKey = "";
            bwTable.ui.subButtons.forEach(function (value, index) {
                if (value.openType == "rfid_down") {
                    inventoryKey = value.inventoryKey;
                }
            });
            if (inventoryKey) {
                inVen = G.Shell.inventory.loadData(url1, uploadUrl1, inventoryKey, function (res) {
                    // alert('盘点信息:' + JSON.stringify(res));
                    resolve();
                });
                if (!inVen) {
                    btn.isDisabled = false;
                }
            }
        }));
    }
    function search(openType, btn, bwTable) {
        var ftable = bwTable.ftable, rfidCol = bwTable.ui.rfidCols, epcs = ftable.columnGet(rfidCol.searchField.toUpperCase()).data;
        if (G.tools.isEmpty(epcs)) {
            Modal_1.Modal.alert('无EPC码数据');
        }
        else {
            //测试
            if (openType === 'rfid_find') {
                Shell.inventory.findGoods(epcs, function (res) {
                    //实时渲染扫描状态
                    var resData = res.data, wifiStrength = ['无信号', '弱', '中', '强', '超强'];
                    // 页面上的epc 和 陈乾的数据 两个EPC 相同 就渲染该行的 是否扫描 和 信号强号强弱
                    for (var _i = 0, _a = ftable.rows; _i < _a.length; _i++) {
                        var row = _a[_i];
                        var data = row.data;
                        for (var _b = 0, resData_1 = resData; _b < resData_1.length; _b++) {
                            var val = resData_1[_b];
                            if (data[rfidCol.searchField.toUpperCase()] === val.epc) {
                                data[rfidCol.amount.toUpperCase()] = val.isScan;
                                data[rfidCol.wifiField.toUpperCase()] = wifiStrength[val.strength];
                                row.data = data;
                                break;
                            }
                        }
                    }
                });
                btn.content = '停止找货';
                btn.data.openType = 'rfid_nofind';
            }
            else {
                Shell.inventory.stopFind({}, function (res) {
                    Modal_1.Modal.alert('停止找货');
                });
                btn.content = '开始找货';
                btn.data.openType = 'rfid_find';
            }
        }
    }
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

/// <reference path="Config.ts"/>
/// <reference path="common/sys/sys.ad.ts"/>
/// <reference path="common/sys/sys.h5.ts"/>
/// <reference path="common/sys/sys.ip.ts"/>
/// <reference path="common/sys/sys.pc.ts"/>
/// <reference path="common/sys/sysHistory.pc.ts"/>
/// <reference path="common/sys/sysPage.pc.ts"/>
/// <reference path="common/sys/sysTab.pc.ts"/>
/// <reference path="common/sys/sys.ts"/>
