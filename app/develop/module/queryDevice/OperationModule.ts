/// <amd-module name="OperationModule"/>

import d = G.d;
import tools = G.tools;
import config = DV.CONF;
import {Button} from "../../../global/components/general/button/Button";
import {DropDownModule} from "../dropDown/DropDownModule";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTableRow} from "../../../global/components/newTable/FastTableRow";
import {DVAjax} from "../util/DVAjax";
import {TextInputModule} from "../textInput/TextInputModule";
import {QueryDevicePage} from "../../page/design/QueryDevicePage";
import Component = G.Component;
import IComponentPara = G.IComponentPara;

interface IOperationModulePara extends IComponentPara {
    qdData?: obj;
}

export class OperationModule extends Component {
    protected wrapperInit(): HTMLElement {
        return d.create(`
        <div class="operation hide">
             <div class="operation-condition">
                <div class="buttons"></div>
                <div class="element-type"></div>
             </div>
             <div class="operation-table"></div>
        </div>
        `);
    }

    constructor(para: IOperationModulePara) {
        super(para);
        if (tools.isEmpty(para)) {
            para = {};
        }
        this.init(para);
    }

    private init(para: IOperationModulePara) {
        this.initAllItems();
        this.isFirstShow = true;
    }

    private elementType: DropDownModule;

    private initAllItems() {
        let btnArr = [
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
        btnArr.forEach((btn, index) => {
            new Button({
                content: btn.name,
                iconPre: btn.iconPre,
                icon: btn.icon,
                container: d.query('.buttons', this.wrapper),
                onClick: () => {
                    let elementType = this.elementType.get();
                    switch (index) {
                        case 0: {
                            this.elementAjaxPara = {
                                element_id: ''
                            };
                            this.createElementModal(elementType);
                        }
                            break;
                        case 1: {
                            let table: FastTable = this.allItems[elementType] as FastTable,
                                selectedRows = table.selectedRows;
                            if (table.rows.length <= 0) {
                                Modal.alert('无可解绑元素');
                            } else {
                                if (selectedRows.length <= 0) {
                                    Modal.alert('请选择需要解绑的元素');
                                } else {
                                    // 解绑元素
                                    selectedRows.forEach((row) => {
                                        table.rowDel(row.index);
                                    });
                                    table.pseudoTable._clearCellSelected();
                                }
                            }
                        }
                            break;
                        default:
                            break;
                    }
                }
            })
        });
        let self = this;
        let elementTypeData = ["action", "adt", "aggregate", 'assign', 'associate', 'calculate', 'default', 'handle', 'import', 'lookup', 'pick', 'value'];
        // let elementTypeData = ["action",  'assign',  'default', 'handle', 'lookup'];
        this.elementType = new DropDownModule({
            container: d.query('.element-type', this.wrapper),
            title: '元素类型',
            data: elementTypeData,
            changeValue(val) {
                let colsData = self.elementManagermentData;
                self.initTable(colsData[val.value].cols, val.value);
            },
            disabled: false
        });
    }

    private modalTable: FastTable;

    private createElementModal(elementType: string) {
        let self = this, body = d.create('<div class="modal-body-container"></div>');
        body.appendChild(d.create('<div class="conditions"></div>'));
        body.appendChild(d.create('<div class="table"></div>'));
        let inputModule = new TextInputModule({
            title: '元素ID',
            container: d.query('.conditions', body)
        });
        inputModule.textInput.on('blur', () => {
            handlerElementConditions();
        });

        function handlerElementConditions() {
            let element_id = inputModule.get().replace(/\s+/g, "");
            let ajaxPara = {
                element_id: element_id
            };
            self.elementAjaxPara = ajaxPara;
        }

        let tableModule = new FastTable({
            container: d.query('.table', body),
            cols: [this.elementManagermentData[elementType].cols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.elementDesign + '/' + elementType + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        return {data: response.dataArr, total: response.head.total};
                    })
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
        let modal = new Modal({
            body: body,
            header: {
                title: '元素选择'
            },
            width: '700px',
            footer: {},
            className: 'elementModal',
            onOk: () => {
                let selectedRows = tableModule.selectedRows;
                if (selectedRows.length <= 0) {
                    Modal.alert('请选择至少一条元素');
                } else {
                    this.handlerTableData(elementType, selectedRows);
                    tableModule.destroy();
                    modal.destroy();
                }
            },
            onCancel: function (e) {
                tableModule.destroy();
                modal.destroy();
            }
        })
    }

    private _elementAjaxPara: obj;
    set elementAjaxPara(para: obj) {
        this._elementAjaxPara = para;
        this.modalTable && this.modalTable._clearAllSelectedCells();
        this.modalTable && this.modalTable.tableData.refresh();
    }

    get elementAjaxPara() {
        if (!this._elementAjaxPara) {
            this._elementAjaxPara = {
                element_id: ''
            }
        }
        return this._elementAjaxPara;
    }

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '',
            cond = this.elementAjaxPara;
        for (let key in cond) {
            if (tools.isNotEmpty(cond[key])) {
                paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(cond[key]) ? '"' + cond[key] + '"' : '""') + ',';
            }
        }
        if (tools.isNotEmpty(paraStr)) {
            paraStr = paraStr.slice(0, paraStr.length - 1);
            str = str + paraStr + '}';
            return encodeURI(str);
        } else {
            return '';
        }
    }

    private handlerTableData(elementType: string, rows: FastTableRow[]) {
        let data = [],
            table: FastTable = this.allItems[elementType],
            tableData = this.getTableData(table);
        rows.forEach((row) => {
            let obj = {};
            row.cells.forEach((cell) => {
                obj[cell.name] = cell.text;
            });
            data.push(obj);
        });
        data = data.filter((row)=>{
            let num = 0;
            for (let i = 0;i<tableData.length;i++){
                let r = tableData[i];
                if (r.elementId === row.elementId){
                    num += 1;
                    break;
                }
            }
            return num === 0 ? true : false;
        });
        if (tools.isNotEmpty(table.pseudoTable.body.rows)) {
            table.pseudoTable.body.rows = table.pseudoTable.body.rows.filter((row) => {
                return tools.isNotEmpty(row);
            });
        }
        table.tableData.data = table.tableData.data.filter((row) => {
            return tools.isNotEmpty(row);
        }).concat(data);
        table.render(0, void 0);
    }

    private initTable(cols: IFastTableCol[], value: string) {
        if (!this.allItems[value]) {
            let table = new FastTable({
                container: d.query('.operation-table', this.wrapper),
                cols: [cols],
                pseudo: {
                    type: 'checkbox'
                }
            });
            this.allItems[value] = table;
            let itemId = QueryDevicePage.itemId;
            if (tools.isNotEmpty(itemId)) {
                DVAjax.queryItemRelatedElements(itemId, value, (res) => {
                    tools.isNotEmpty(res.dataArr) && (table.data = res.dataArr);
                })
            }
        }
        this.showTable(value);
    }

    private showTable(value) {
        let items = this.allItems;
        for (let key in items) {
            if (!!items[key]) {
                items[key].wrapper.classList.toggle('hide', key !== value);
            }
        }
    }

    private _allItems: obj;
    set allItems(obj) {
        if (tools.isEmpty(obj)) {
            obj = {};
        }
        this._allItems = obj;
    }

    get allItems() {
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
            }
        }
        return this._allItems;
    }

    private _isFirstShow: boolean;
    set isFirstShow(f: boolean) {
        this._isFirstShow = f;
    }

    get isFirstShow() {
        return this._isFirstShow;
    }

    private _isShow: Boolean;
    set isShow(isShow) {
        this._isShow = isShow;
        if (this._isShow) {
            this.wrapper.classList.add('show');
            this.wrapper.classList.remove('hide');
            if (this.isFirstShow){
                this.allItems['action'].calcWidth();
            }
            this.isFirstShow = false;
        } else {
            this.wrapper.classList.remove('show');
            this.wrapper.classList.add('hide');
        }
    }

    private _elementManagermentData: obj;
    get elementManagermentData() {
        if (!this._elementManagermentData) {
            this._elementManagermentData = {
                action: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'caption', title: '标题'},
                        {name: 'iconName', title: '图标'},
                        {name: 'actionType', title: '操作类型'},
                        {name: 'actionSql', title: '操作SQL'},
                        // {name: 'portId', title: '接口ID'},
                        // {name: 'portSql', title: '接口SQL'},
                        // {name: 'lockSql', title: '锁SQL'},
                        // {name: 'filterExpress', title: '数据集过滤'},
                        // {name: 'updateFields', title: '修改的字段'},
                        {name: 'selectFields', title: '选中字段'},
                        {name: 'refreshFlag', title: '刷新标志'},
                        {name: 'multiPageFlag', title: '分页标志'},
                        {name: 'preFlag', title: '预处理标志'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                adt: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '抽象字段名'},
                        {name: 'caption', title: '抽象字段名称'},
                        {name: 'subFields', title: '子字段名称'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                aggregate: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '聚集字段名'},
                        {name: 'expression', title: '表达式'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                assign: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '字段名'},
                        {name: 'assignSql', title: '赋值SQL'},
                        {name: 'forceFlag', title: '强制标志'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                associate: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '关联字段'},
                        {name: 'associateType', title: '关联类型'},
                        {name: 'caption', title: '标题'},
                        {name: 'iconName', title: '图标'},
                        {name: 'dataType', title: '数据集类型'},
                        {name: 'nodeId', title: '节点ID'},
                        {name: 'pause', title: '是否禁用'}
                        // {name: 'dataSql', title: '数据集SQL'}
                    ]
                },
                calculate: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '计算字段'},
                        {name: 'expression', title: '表达式'},
                        {name: 'beforeField', title: '前置字段'},
                        {name: 'posindex', title: '位置编号'},
                        {name: 'dataSize', title: '数据长度'}
                    ]
                },
                default: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'defaultSql', title: '默认值SQL'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                handle: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '字段名'},
                        {name: 'fieldType', title: '字段类型'},
                        {name: 'caption', title: '标题'},
                        {name: 'iconName', title: '图标'},
                        // {name: 'hintFlag', title: '提示标志'},
                        {name: 'refreshFlag', title: '刷新标志'},
                        // {name: 'handleType', title: '全局操作类'},
                        // {name: 'baseTable', title: '基表'},
                        // {name: 'sourceSql', title: '源SQL'},
                        // {name: 'targetSql', title: '目标SQL'},
                        // {name: 'seqNo', title: '序号'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                import: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'caption', title: '标题'},
                        {name: 'iconName', title: '图标'},
                        {name: 'inventoryType', title: '盘点类型'},
                        {name: 'hotKey', title: '热键'},
                        {name: 'getTitleSql', title: '获取标题SQL'},
                        // {name: 'subTitleSql', title: '子标题SQL'},
                        {name: 'getDataSql', title: '获取数据SQL'},
                        {name: 'inventorySql', title: '判断SQL'},
                        // {name: 'classifySql', title: '分类SQL'},
                        {name: 'keyField', title: '主键字段'},
                        {name: 'nameFields', title: '名称字段'},
                        // {name: 'amountField', title: '数量字段'},
                        {name: 'readOnlyFlag', title: '只读标志'},
                        {name: 'refreshFlag', title: '刷新标志'},
                        {name: 'tagFlag', title: '标识标志'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                lookup: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '字段名'},
                        {name: 'lookUpSql', title: '列表SQL'},
                        {name: 'dataType', title: '数据类型'},
                        {name: 'keyField', title: '主键字段'},
                        // {name: 'resultField', title: '显示字段'},
                        {name: 'beforeField', title: '前置字段'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                pick: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '关联字段名'},
                        {name: 'caption', title: '图标'},
                        {name: 'pickSql', title: '选择SQL'},
                        {name: 'fromField', title: '来源字段'},
                        // {name: 'queryFields', title: '查询字段'},
                        // {name: 'otherFields', title: '其他字段'},
                        {name: 'treeField', title: '树形字段'},
                        // {name: 'levelField', title: '层级字段'},
                        // {name: 'imageNames', title: '图标名称'},
                        // {name: 'treeId', title: '层级树ID'},
                        // {name: 'seperator', title: '多值分隔符'},
                        {name: 'multiValueFlag', title: '多值标志'},
                        {name: 'recursionFlag', title: '递归树图标志'},
                        {name: 'customQuery', title: '自定义查询'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
                value: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'fieldName', title: '字段名'},
                        {name: 'valueSql', title: '字段值SQL'},
                        {name: 'dynamicFlag', title: '限制标志'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                }
            }
        }
        return this._elementManagermentData;
    }

    get() {
        let operationData = {
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
        for (let key in operationData) {
            if (this.allItems.hasOwnProperty(key)) {
                if (tools.isNotEmpty(this.allItems[key])) {
                    operationData[key] = this.getTableData(this.allItems[key]);
                }
            }
        }
        return operationData;
    }

    private getTableData(table: FastTable): obj[] {
        let data = [];
        if (table.rows.length <= 0) {
            return data;
        } else {
            table.rows.forEach((row) => {
                if (tools.isNotEmpty(row)) {
                    let obj = {};
                    row.cells.forEach((cell) => {
                        obj[cell.name] = cell.text;
                    });
                    data.push(obj);
                }
            });
            return data;
        }
    }
}