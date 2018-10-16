/// <amd-module name="OperationModule"/>
define("OperationModule", ["require", "exports", "Button", "DropDownModule", "FastTable", "Modal", "DVAjax", "TextInputModule", "QueryDevicePage"], function (require, exports, Button_1, DropDownModule_1, FastTable_1, Modal_1, DVAjax_1, TextInputModule_1, QueryDevicePage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d = G.d;
    var tools = G.tools;
    var config = DV.CONF;
    var Component = G.Component;
    var OperationModule = /** @class */ (function (_super) {
        __extends(OperationModule, _super);
        function OperationModule(para) {
            var _this = _super.call(this, para) || this;
            if (tools.isEmpty(para)) {
                para = {};
            }
            _this.init(para);
            return _this;
        }
        OperationModule.prototype.wrapperInit = function () {
            return d.create("\n        <div class=\"operation hide\">\n             <div class=\"operation-condition\">\n                <div class=\"buttons\"></div>\n                <div class=\"element-type\"></div>\n             </div>\n             <div class=\"operation-table\"></div>\n        </div>\n        ");
        };
        OperationModule.prototype.init = function (para) {
            this.initAllItems();
            this.isFirstShow = true;
        };
        OperationModule.prototype.initAllItems = function () {
            var _this = this;
            var btnArr = [
                {
                    name: '绑定',
                    iconPre: 'dev',
                    icon: 'de-xinzeng'
                },
                {
                    name: '解绑',
                    iconPre: 'dev',
                    icon: 'de-shanchu'
                }
            ];
            btnArr.forEach(function (btn, index) {
                new Button_1.Button({
                    content: btn.name,
                    iconPre: btn.iconPre,
                    icon: btn.icon,
                    container: d.query('.buttons', _this.wrapper),
                    onClick: function () {
                        var elementType = _this.elementType.get();
                        switch (index) {
                            case 0:
                                {
                                    _this.elementAjaxPara = {
                                        element_id: ''
                                    };
                                    _this.createElementModal(elementType);
                                }
                                break;
                            case 1:
                                {
                                    var table_1 = _this.allItems[elementType], selectedRows = table_1.selectedRows;
                                    if (table_1.rows.length <= 0) {
                                        Modal_1.Modal.alert('无可解绑元素');
                                    }
                                    else {
                                        if (selectedRows.length <= 0) {
                                            Modal_1.Modal.alert('请选择需要解绑的元素');
                                        }
                                        else {
                                            // 解绑元素
                                            selectedRows.forEach(function (row) {
                                                table_1.rowDel(row.index);
                                            });
                                            table_1.pseudoTable._clearCellSelected();
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
            });
            var self = this;
            var elementTypeData = ["action", "adt", "aggregate", 'assign', 'associate', 'calculate', 'default', 'handle', 'import', 'lookup', 'pick', 'value'];
            // let elementTypeData = ["action",  'assign',  'default', 'handle', 'lookup'];
            this.elementType = new DropDownModule_1.DropDownModule({
                container: d.query('.element-type', this.wrapper),
                title: '元素类型',
                data: elementTypeData,
                changeValue: function (val) {
                    var colsData = self.elementManagermentData;
                    self.initTable(colsData[val.value].cols, val.value);
                },
                disabled: false
            });
        };
        OperationModule.prototype.createElementModal = function (elementType) {
            var _this = this;
            var self = this, body = d.create('<div class="modal-body-container"></div>');
            body.appendChild(d.create('<div class="conditions"></div>'));
            body.appendChild(d.create('<div class="table"></div>'));
            var inputModule = new TextInputModule_1.TextInputModule({
                title: '元素ID',
                container: d.query('.conditions', body)
            });
            inputModule.textInput.on('blur', function () {
                handlerElementConditions();
            });
            function handlerElementConditions() {
                var element_id = inputModule.get().replace(/\s+/g, "");
                var ajaxPara = {
                    element_id: element_id
                };
                self.elementAjaxPara = ajaxPara;
            }
            var tableModule = new FastTable_1.FastTable({
                container: d.query('.table', body),
                cols: [this.elementManagermentData[elementType].cols],
                pseudo: {
                    type: 'checkbox'
                },
                ajax: {
                    fun: function (_a) {
                        var current = _a.current, pageSize = _a.pageSize, isRefresh = _a.isRefresh;
                        var queryStr = "{\"index\"=" + (current + 1) + " , \"size\"=" + pageSize + ",\"total\"=1}";
                        queryStr = encodeURIComponent(queryStr);
                        var url = config.ajaxUrl.elementDesign + '/' + elementType + '?pageparams=' + queryStr;
                        url = url + _this.handlerAjaxPara();
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
            this.modalTable = tableModule;
            var modal = new Modal_1.Modal({
                body: body,
                header: {
                    title: '元素选择'
                },
                width: '700px',
                footer: {},
                className: 'elementModal',
                onOk: function () {
                    var selectedRows = tableModule.selectedRows;
                    if (selectedRows.length <= 0) {
                        Modal_1.Modal.alert('请选择至少一条元素');
                    }
                    else {
                        _this.handlerTableData(elementType, selectedRows);
                        tableModule.destroy();
                        modal.destroy();
                    }
                },
                onCancel: function (e) {
                    tableModule.destroy();
                    modal.destroy();
                }
            });
        };
        Object.defineProperty(OperationModule.prototype, "elementAjaxPara", {
            get: function () {
                if (!this._elementAjaxPara) {
                    this._elementAjaxPara = {
                        element_id: ''
                    };
                }
                return this._elementAjaxPara;
            },
            set: function (para) {
                this._elementAjaxPara = para;
                this.modalTable && this.modalTable._clearAllSelectedCells();
                this.modalTable && this.modalTable.tableData.refresh();
            },
            enumerable: true,
            configurable: true
        });
        OperationModule.prototype.handlerAjaxPara = function () {
            var str = '&fuzzyparams={', paraStr = '', cond = this.elementAjaxPara;
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
        OperationModule.prototype.handlerTableData = function (elementType, rows) {
            var data = [], table = this.allItems[elementType], tableData = this.getTableData(table);
            rows.forEach(function (row) {
                var obj = {};
                row.cells.forEach(function (cell) {
                    obj[cell.name] = cell.text;
                });
                data.push(obj);
            });
            data = data.filter(function (row) {
                var num = 0;
                for (var i = 0; i < tableData.length; i++) {
                    var r = tableData[i];
                    if (r.elementId === row.elementId) {
                        num += 1;
                        break;
                    }
                }
                return num === 0 ? true : false;
            });
            if (tools.isNotEmpty(table.pseudoTable.body.rows)) {
                table.pseudoTable.body.rows = table.pseudoTable.body.rows.filter(function (row) {
                    return tools.isNotEmpty(row);
                });
            }
            table.tableData.data = table.tableData.data.filter(function (row) {
                return tools.isNotEmpty(row);
            }).concat(data);
            table.render(0, void 0);
        };
        OperationModule.prototype.initTable = function (cols, value) {
            if (!this.allItems[value]) {
                var table_2 = new FastTable_1.FastTable({
                    container: d.query('.operation-table', this.wrapper),
                    cols: [cols],
                    pseudo: {
                        type: 'checkbox'
                    }
                });
                this.allItems[value] = table_2;
                var itemId = QueryDevicePage_1.QueryDevicePage.itemId;
                if (tools.isNotEmpty(itemId)) {
                    DVAjax_1.DVAjax.queryItemRelatedElements(itemId, value, function (res) {
                        tools.isNotEmpty(res.dataArr) && (table_2.data = res.dataArr);
                    });
                }
            }
            this.showTable(value);
        };
        OperationModule.prototype.showTable = function (value) {
            var items = this.allItems;
            for (var key in items) {
                if (!!items[key]) {
                    items[key].wrapper.classList.toggle('hide', key !== value);
                }
            }
        };
        Object.defineProperty(OperationModule.prototype, "allItems", {
            get: function () {
                if (!this._allItems) {
                    this._allItems = {
                        action: null,
                        handle: null,
                        assign: null,
                        default: null,
                        adt: null,
                        aggregate: null,
                        associate: null,
                        calculate: null,
                        import: null,
                        lookup: null,
                        pick: null,
                        value: null
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
        Object.defineProperty(OperationModule.prototype, "isFirstShow", {
            get: function () {
                return this._isFirstShow;
            },
            set: function (f) {
                this._isFirstShow = f;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OperationModule.prototype, "isShow", {
            set: function (isShow) {
                this._isShow = isShow;
                if (this._isShow) {
                    this.wrapper.classList.add('show');
                    this.wrapper.classList.remove('hide');
                    if (this.isFirstShow) {
                        this.allItems['action'].calcWidth();
                    }
                    this.isFirstShow = false;
                }
                else {
                    this.wrapper.classList.remove('show');
                    this.wrapper.classList.add('hide');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OperationModule.prototype, "elementManagermentData", {
            get: function () {
                if (!this._elementManagermentData) {
                    this._elementManagermentData = {
                        action: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'actionType', title: '操作类型' },
                                { name: 'actionSql', title: '操作SQL' },
                                // {name: 'portId', title: '接口ID'},
                                // {name: 'portSql', title: '接口SQL'},
                                // {name: 'lockSql', title: '锁SQL'},
                                // {name: 'filterExpress', title: '数据集过滤'},
                                // {name: 'updateFields', title: '修改的字段'},
                                { name: 'selectFields', title: '选中字段' },
                                { name: 'refreshFlag', title: '刷新标志' },
                                { name: 'multiPageFlag', title: '分页标志' },
                                { name: 'preFlag', title: '预处理标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        adt: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '抽象字段名' },
                                { name: 'caption', title: '抽象字段名称' },
                                { name: 'subFields', title: '子字段名称' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        aggregate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '聚集字段名' },
                                { name: 'expression', title: '表达式' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        assign: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'assignSql', title: '赋值SQL' },
                                { name: 'forceFlag', title: '强制标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        associate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '关联字段' },
                                { name: 'associateType', title: '关联类型' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'dataType', title: '数据集类型' },
                                { name: 'nodeId', title: '节点ID' },
                                { name: 'pause', title: '是否禁用' }
                                // {name: 'dataSql', title: '数据集SQL'}
                            ]
                        },
                        calculate: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '计算字段' },
                                { name: 'expression', title: '表达式' },
                                { name: 'beforeField', title: '前置字段' },
                                { name: 'posindex', title: '位置编号' },
                                { name: 'dataSize', title: '数据长度' }
                            ]
                        },
                        default: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'defaultSql', title: '默认值SQL' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        handle: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'fieldType', title: '字段类型' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                // {name: 'hintFlag', title: '提示标志'},
                                { name: 'refreshFlag', title: '刷新标志' },
                                // {name: 'handleType', title: '全局操作类'},
                                // {name: 'baseTable', title: '基表'},
                                // {name: 'sourceSql', title: '源SQL'},
                                // {name: 'targetSql', title: '目标SQL'},
                                // {name: 'seqNo', title: '序号'},
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        import: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'caption', title: '标题' },
                                { name: 'iconName', title: '图标' },
                                { name: 'inventoryType', title: '盘点类型' },
                                { name: 'hotKey', title: '热键' },
                                { name: 'getTitleSql', title: '获取标题SQL' },
                                // {name: 'subTitleSql', title: '子标题SQL'},
                                { name: 'getDataSql', title: '获取数据SQL' },
                                { name: 'inventorySql', title: '判断SQL' },
                                // {name: 'classifySql', title: '分类SQL'},
                                { name: 'keyField', title: '主键字段' },
                                { name: 'nameFields', title: '名称字段' },
                                // {name: 'amountField', title: '数量字段'},
                                { name: 'readOnlyFlag', title: '只读标志' },
                                { name: 'refreshFlag', title: '刷新标志' },
                                { name: 'tagFlag', title: '标识标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        lookup: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'lookUpSql', title: '列表SQL' },
                                { name: 'dataType', title: '数据类型' },
                                { name: 'keyField', title: '主键字段' },
                                // {name: 'resultField', title: '显示字段'},
                                { name: 'beforeField', title: '前置字段' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        pick: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '关联字段名' },
                                { name: 'caption', title: '图标' },
                                { name: 'pickSql', title: '选择SQL' },
                                { name: 'fromField', title: '来源字段' },
                                // {name: 'queryFields', title: '查询字段'},
                                // {name: 'otherFields', title: '其他字段'},
                                { name: 'treeField', title: '树形字段' },
                                // {name: 'levelField', title: '层级字段'},
                                // {name: 'imageNames', title: '图标名称'},
                                // {name: 'treeId', title: '层级树ID'},
                                // {name: 'seperator', title: '多值分隔符'},
                                { name: 'multiValueFlag', title: '多值标志' },
                                { name: 'recursionFlag', title: '递归树图标志' },
                                { name: 'customQuery', title: '自定义查询' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        },
                        value: {
                            cols: [
                                { name: 'elementId', title: '元素ID' },
                                { name: 'fieldName', title: '字段名' },
                                { name: 'valueSql', title: '字段值SQL' },
                                { name: 'dynamicFlag', title: '限制标志' },
                                { name: 'pause', title: '是否禁用' }
                            ]
                        }
                    };
                }
                return this._elementManagermentData;
            },
            enumerable: true,
            configurable: true
        });
        OperationModule.prototype.get = function () {
            var operationData = {
                action: [],
                handle: [],
                assign: [],
                default: [],
                adt: [],
                aggregate: [],
                associate: [],
                calculate: [],
                import: [],
                lookup: [],
                pick: [],
                value: []
            };
            for (var key in operationData) {
                if (this.allItems.hasOwnProperty(key)) {
                    if (tools.isNotEmpty(this.allItems[key])) {
                        operationData[key] = this.getTableData(this.allItems[key]);
                    }
                }
            }
            return operationData;
        };
        OperationModule.prototype.getTableData = function (table) {
            var data = [];
            if (table.rows.length <= 0) {
                return data;
            }
            else {
                table.rows.forEach(function (row) {
                    if (tools.isNotEmpty(row)) {
                        var obj_1 = {};
                        row.cells.forEach(function (cell) {
                            obj_1[cell.name] = cell.text;
                        });
                        data.push(obj_1);
                    }
                });
                return data;
            }
        };
        return OperationModule;
    }(Component));
    exports.OperationModule = OperationModule;
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
