/// <amd-module name="MainFuncModule"/>
define("MainFuncModule", ["require", "exports", "DropDownModule", "Button", "CheckBox", "SQLEditor", "TextInput", "FastTable", "DVAjax", "Modal", "TextInputModule", "QueryDevicePage"], function (require, exports, DropDownModule_1, Button_1, checkBox_1, SQLEditor_1, text_1, FastTable_1, DVAjax_1, Modal_1, TextInputModule_1, QueryDevicePage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var Component = G.Component;
    var MainFuncModule = /** @class */ (function (_super) {
        __extends(MainFuncModule, _super);
        function MainFuncModule(para) {
            var _this = _super.call(this, para) || this;
            _this.dataMap = {
                queryType: [
                    '不能查询',
                    '高级查询',
                    '简单查询'
                ],
                multiPageFlag: [
                    '不分页',
                    '服务端分页',
                    '客户端分页'
                ]
            };
            // 前置后置条件
            _this._frontCond = [];
            _this._backCond = [];
            _this._isFront = false;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        MainFuncModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"mainFunc hide\">\n            <div class=\"mainTopContent\" style=\"overflow: hidden\">\n                <div class=\"drop1\" style=\"float: left\"></div>\n                <div class=\"drop2\" style=\"float: left;\"></div>\n                <div class=\"suportChildQuery\" style=\"float: left;\"></div>\n                <div class=\"clear\"></div>\n            </div>\n            <div class=\"mainBottomContent\">\n                <div class=\"frontBtn\">\n                    <label class=\"title-label\"></label>\n                </div>\n                <div class=\"sql-group group-selectSql\">\n                    <label class=\"title-label\">\u67E5\u8BE2SQL :</label>\n                    <div class=\"sql-input selectSql\">\n                        \n                    </div>\n                    <div class=\"clear\"></div>\n                </div>\n                <div class=\"sql-group group-subselectSql hide\">\n                    <label class=\"title-label\">\u5B50\u67E5\u8BE2SQL :</label>\n                    <div class=\"sql-input subselectSql\">\n                        \n                    </div>\n                    <div class=\"clear\"></div>\n                </div>\n                <div class=\"sql-group group-insertSql\">\n                    <label class=\"title-label\">\u65B0\u589ESQL :</label>\n                    <div class=\"sql-input insertSql\">\n                        \n                    </div>\n                    <div class=\"clear\"></div>\n                </div>\n                <div class=\"sql-group group-updateSql\">\n                    <label class=\"title-label\">\u66F4\u65B0SQL :</label>\n                    <div class=\"sql-input updateSql\">\n                        \n                    </div>\n                    <div class=\"clear\"></div>\n                </div>\n                <div class=\"sql-group group-deleteSql\">\n                    <label class=\"title-label\">\u5220\u9664SQL :</label>\n                    <div class=\"sql-input deleteSql\">\n                        \n                    </div>\n                    <div class=\"clear\"></div>\n                </div>\n                <div class=\"group-fields\">\n                        <div class=\"title-label\">\u9690\u85CF\u5B57\u6BB5 :</div>\n                        <div class=\"noshowFields\"></div>\n                        <div class=\"clear\"></div>\n                </div>\n                <div class=\"backBtn\">\n                    <label class=\"title-label\"></label>\n                </div>\n            </div>\n        </div>\n        ");
        };
        MainFuncModule.prototype.init = function (mainFuncPara) {
            var _this = this;
            this.initTopContent();
            this.initBottomContent();
            var mainFuncQDData = {
                queryType: 0,
                queryCount: 0,
                selectSql: "",
                updateSql: "",
                insertSql: "",
                deleteSql: "",
                multiPageFlag: 1,
                subselectSql: '',
                showCheckbox: 0,
                pause: 0,
                noshowFields: ''
            };
            var itemId = QueryDevicePage_1.QueryDevicePage.itemId;
            if (tools.isNotEmpty(itemId)) {
                DVAjax_1.DVAjax.primaryFunctionAjax(itemId, function (res) {
                    for (var key in mainFuncQDData) {
                        if (res.data.hasOwnProperty(key)) {
                            mainFuncQDData[key] = res.data[key];
                        }
                    }
                    _this.qdData = mainFuncQDData;
                });
                DVAjax_1.DVAjax.queryItemRelatedConds(itemId, function (res) {
                    tools.isNotEmpty(res.dataArr) && _this.handleEelevanceCond(res.dataArr);
                });
            }
            else {
                this.qdData = mainFuncQDData;
            }
            d.on(this.wrapper, 'click', '.closeCond', function (e) {
                var condItem = d.closest(e.target, '.cond-item'), name = condItem.dataset.name, id = parseInt(condItem.dataset.id);
                d.remove(condItem);
                if (id === 0) {
                    _this.frontCond = _this.frontCond.filter(function (cond) {
                        return cond.condId !== name;
                    });
                }
                else {
                    _this.backCond = _this.backCond.filter(function (cond) {
                        return cond.condId !== name;
                    });
                }
            });
        };
        Object.defineProperty(MainFuncModule.prototype, "allItems", {
            get: function () {
                if (!this._allItems) {
                    this._allItems = {
                        queryType: null,
                        multiPageFlag: null,
                        suportChildQuery: null,
                        selectSql: null,
                        updateSql: null,
                        insertSql: null,
                        deleteSql: null,
                        noshowFields: null,
                        subselectSql: null
                    };
                }
                return this._allItems;
            },
            set: function (obj) {
                if (tools.isEmpty(obj)) {
                    obj = {};
                }
                this._allItems = obj;
            },
            enumerable: true,
            configurable: true
        });
        MainFuncModule.prototype.initTopContent = function () {
            var _this = this;
            var drop1 = new DropDownModule_1.DropDownModule({
                title: '查询方式',
                data: ["不能查询", "高级查询", "简单查询"],
                container: d.query('.drop1', this.wrapper),
                disabled: false,
                dropClassName: 'queryDrop'
            });
            this.allItems['queryType'] = drop1;
            var drop2 = new DropDownModule_1.DropDownModule({
                title: '分页方式',
                data: ['不分页', '服务端分页', '客户端分页'],
                container: d.query('.drop2', this.wrapper),
                disabled: false,
                dropClassName: 'pageDrop'
            });
            this.allItems['multiPageFlag'] = drop2;
            var suportChildQuery = new checkBox_1.CheckBox({
                container: d.query('.suportChildQuery', this.wrapper),
                text: "支持子查询",
                onSet: function (val) {
                    if (val) {
                        d.query('.group-subselectSql', _this.wrapper).classList.remove('hide');
                    }
                    else {
                        d.query('.group-subselectSql', _this.wrapper).classList.add('hide');
                    }
                }
            });
            this.allItems['suportChildQuery'] = suportChildQuery;
            var noshowFields = new text_1.TextInput({
                container: d.query('.noshowFields', this.wrapper)
            });
            this.allItems['noshowFields'] = noshowFields;
            var selectSql = new SQLEditor_1.SQLEditor({
                container: d.query('.selectSql', this.wrapper),
                width: '100%',
                height: 100
            });
            this.allItems['selectSql'] = selectSql;
            var updateSql = new SQLEditor_1.SQLEditor({
                container: d.query('.updateSql', this.wrapper),
                width: '100%',
                height: 100
            });
            this.allItems['updateSql'] = updateSql;
            var insertSql = new SQLEditor_1.SQLEditor({
                container: d.query('.insertSql', this.wrapper),
                width: '100%',
                height: 100
            });
            this.allItems['insertSql'] = insertSql;
            var deleteSql = new SQLEditor_1.SQLEditor({
                container: d.query('.deleteSql', this.wrapper),
                width: '100%',
                height: 100
            });
            this.allItems['deleteSql'] = deleteSql;
            var subselectSql = new SQLEditor_1.SQLEditor({
                container: d.query('.subselectSql', this.wrapper),
                width: '100%',
                height: 100
            });
            this.allItems['subselectSql'] = subselectSql;
        };
        MainFuncModule.prototype.handleEelevanceCond = function (data) {
            var _this = this;
            var fc = [], bc = [];
            data.forEach(function (cond) {
                if (cond.ctlType === 0) {
                    fc.push(cond);
                    _this.createCondEle(true, cond);
                }
                else {
                    bc.push(cond);
                    _this.createCondEle(false, cond);
                }
            });
            this.frontCond = fc;
            this.backCond = bc;
        };
        MainFuncModule.prototype.createCondEle = function (isFront, cond) {
            var container = isFront ? d.query('.frontBtn', this.wrapper) : d.query('.backBtn', this.wrapper), id = isFront ? 0 : 1;
            if (!Array.isArray(cond)) {
                cond = [cond];
            }
            cond.forEach(function (co) {
                var condEle = d.create("\n        <div class=\"cond-item\" data-name=\"" + co.condId + "\" data-id=\"" + id + "\">\n        <div class=\"condId\">" + co.condId + " </div>\n        <span class=\"closeCond dev de-guanbi\"></span>\n        </div>\n        ");
                container.appendChild(condEle);
            });
        };
        MainFuncModule.prototype.initBottomContent = function () {
            var _this = this;
            var frontBtn = new Button_1.Button({
                content: '前置条件',
                container: d.query('.frontBtn', this.wrapper),
                onClick: function (event) {
                    // 前置条件
                    _this.isFront = true;
                    if (tools.isNotEmpty(_this.condModal)) {
                        var obj = {
                            cond_id: '',
                            datasource: ''
                        };
                        _this.condAjaxPara = obj;
                        _this.condModal.isShow = true;
                    }
                    else {
                        DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                            res.unshift('请选择');
                            _this.createConditonsModal(res);
                        });
                    }
                }
            });
            var backBtn = new Button_1.Button({
                content: '后置条件',
                container: d.query('.backBtn', this.wrapper),
                onClick: function (event) {
                    // 后置条件
                    _this.isFront = false;
                    if (tools.isNotEmpty(_this.condModal)) {
                        var obj = {
                            cond_id: '',
                            datasource: ''
                        };
                        _this.condAjaxPara = obj;
                        _this.condModal.isShow = true;
                    }
                    else {
                        DVAjax_1.DVAjax.dataSourceQueryAjax(function (res) {
                            res.unshift('请选择');
                            _this.createConditonsModal(res);
                        });
                    }
                }
            });
        };
        Object.defineProperty(MainFuncModule.prototype, "qdData", {
            get: function () {
                if (!this._qdData) {
                    this._qdData = {
                        queryType: 0,
                        queryCount: 0,
                        selectSql: "",
                        updateSql: "",
                        insertSql: "",
                        deleteSql: "",
                        multiPageFlag: 1,
                        subselectSql: '',
                        showCheckbox: 0,
                        pause: 0,
                        noshowFields: '',
                    };
                }
                return this._qdData;
            },
            set: function (da) {
                this._qdData = da;
                var items = this.allItems;
                for (var key in items) {
                    if (key === 'multiPageFlag' || key === 'queryType') {
                        items[key].set(this.dataMap[key][this._qdData[key]]);
                    }
                    else {
                        items[key].set(this._qdData[key]);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainFuncModule.prototype, "isShow", {
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
                    this.wrapper.classList.add('show');
                    this.wrapper.classList.remove('hide');
                }
                else {
                    this.wrapper.classList.remove('show');
                    this.wrapper.classList.add('hide');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainFuncModule.prototype, "frontCond", {
            get: function () {
                return this._frontCond;
            },
            set: function (data) {
                this._frontCond = data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MainFuncModule.prototype, "backCond", {
            get: function () {
                return this._backCond;
            },
            set: function (data) {
                this._backCond = data;
            },
            enumerable: true,
            configurable: true
        });
        // 获取当前页所有表单数据
        MainFuncModule.prototype.get = function () {
            var qd = this.qdData, itemListData = {
                queryType: 0,
                queryCount: qd.queryCount,
                selectSql: "",
                updateSql: "",
                insertSql: "",
                deleteSql: "",
                multiPageFlag: 1,
                subselectSql: '',
                showCheckbox: qd.showCheckbox,
                pause: qd.pause,
                noshowFields: '',
                cond: {
                    front: [],
                    back: []
                }
            };
            itemListData.cond.front = this.frontCond;
            itemListData.cond.back = this.backCond;
            for (var key in itemListData) {
                if (this.allItems.hasOwnProperty(key)) {
                    if (key === 'subselectSql') {
                        if (this.allItems['suportChildQuery'].get()) {
                            itemListData[key] = this.allItems[key].get();
                        }
                    }
                    else if (key === 'multiPageFlag' || key === 'queryType') {
                        itemListData[key] = this.dataMap[key].indexOf(this.allItems[key].get());
                    }
                    else {
                        itemListData[key] = this.allItems[key].get();
                    }
                }
            }
            return itemListData;
        };
        Object.defineProperty(MainFuncModule.prototype, "isFront", {
            get: function () {
                return this._isFront;
            },
            set: function (front) {
                this._isFront = front;
            },
            enumerable: true,
            configurable: true
        });
        MainFuncModule.prototype.createConditonsModal = function (ds) {
            var _this = this;
            var self = this, body = d.create('<div class="modal-body-container"></div>');
            body.appendChild(d.create('<div class="conditions"></div>'));
            body.appendChild(d.create('<div class="table"></div>'));
            var inputModule = new TextInputModule_1.TextInputModule({
                title: '条件ID',
                container: d.query('.conditions', body)
            });
            inputModule.textInput.on('blur', function () {
                handlerConditions();
            });
            var dataSource = new DropDownModule_1.DropDownModule({
                title: '数据源',
                container: d.query('.conditions', body),
                disabled: false,
                changeValue: function () {
                    handlerConditions();
                }
            });
            dataSource.dpData = ds;
            function handlerConditions() {
                var condId = inputModule.get().replace(/\s+/g, ""), datasource = dataSource.get().replace(/\s+/g, "");
                datasource = datasource === '请选择' ? '' : datasource;
                var ajaxPara = {
                    cond_id: condId,
                    data_source: datasource
                };
                self.condAjaxPara = ajaxPara;
            }
            this.condTable = new FastTable_1.FastTable({
                container: d.query('.table', body),
                cols: [[{ name: 'condId', title: '条件 ID' },
                        { name: 'condSql', title: '条件Sql' },
                        { name: 'condType', title: '条件类型' },
                        { name: 'showText', title: '显示文本' },
                        { name: 'dataSource', title: '数据源' },
                        { name: 'condFieldName', title: '条件字段名称' }
                    ]],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.queryCondition + '?pageparams=' + queryStr;
                        url = url + self.handlerAjaxPara();
                        return DVAjax_1.DVAjax.Ajax.fetch(url).then(function (_a) {
                            var response = _a.response;
                            return { data: response.dataArr, total: response.head.total };
                        });
                    },
                    auto: true,
                    once: false
                },
                page: {
                    size: 50,
                    options: [50, 100]
                }
            });
            this.condModal = new Modal_1.Modal({
                body: body,
                header: {
                    title: '请选择条件'
                },
                width: '800px',
                footer: {},
                className: 'condModal',
                onOk: function () {
                    var data = self.handlerTableData(), resultData = self.isHadCond(self.isFront, data);
                    if (self.isFront) {
                        self.frontCond = self.frontCond.concat(resultData);
                    }
                    else {
                        self.backCond = self.backCond.concat(resultData);
                    }
                    self.createCondEle(_this.isFront, resultData);
                    self.condModal.isShow = false;
                    setValueForInput();
                },
                onCancel: function (e) {
                    self.condModal.isShow = false;
                    setValueForInput();
                }
            });
            function setValueForInput() {
                inputModule.set('');
                dataSource.set('请选择');
            }
        };
        Object.defineProperty(MainFuncModule.prototype, "condAjaxPara", {
            get: function () {
                if (!this._condAjaxPara) {
                    this._condAjaxPara = {
                        cond_id: '',
                        data_source: ''
                    };
                }
                return this._condAjaxPara;
            },
            set: function (para) {
                this._condAjaxPara = para;
                this.condTable && this.condTable._clearAllSelectedCells();
                this.condTable && this.condTable.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        MainFuncModule.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', cond = this.condAjaxPara;
            for (var key in cond) {
                if (tools.isNotEmpty(cond[key])) {
                    paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(cond[key]) ? '"' + cond[key] + '"' : '""') + ',';
                }
            }
            if (tools.isNotEmpty(paraStr)) {
                paraStr = paraStr.slice(0, paraStr.length - 1);
                str = str + paraStr + '}';
                return encodeURI(str);
            }
            else {
                return '';
            }
        };
        MainFuncModule.prototype.handlerTableData = function () {
            var rows = this.condTable.selectedRows, data = [];
            if (tools.isNotEmpty(rows)) {
                rows.forEach(function (row) {
                    var obj = {};
                    obj['index'] = row.index;
                    row.cells.forEach(function (cell) {
                        obj[cell.name] = cell.text;
                    });
                    data.push(obj);
                });
            }
            return data;
        };
        // 判断cond是否已经添加
        MainFuncModule.prototype.isHadCond = function (isFrond, cond) {
            var arr = isFrond ? this.frontCond : this.backCond, resultArr = [], len = arr.length;
            cond.forEach(function (cond) {
                var num = 0;
                for (var i = 0; i < len; i++) {
                    var c = arr[i];
                    if (c.condId === cond.condId) {
                        num = 1;
                        break;
                    }
                }
                if (num === 0) {
                    resultArr.push(cond);
                }
            });
            return resultArr;
        };
        return MainFuncModule;
    }(Component));
    exports.MainFuncModule = MainFuncModule;
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
