/// <amd-module name="ElementDesignPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import config = DV.CONF;
import {DropDownModule} from "../../module/dropDown/DropDownModule";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {DVAjax} from "../../module/util/DVAjax";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTable} from "../../../global/components/newTable/FastTable";

export class ElementDesignPage extends SPAPage {
    init(para, data) {
        this.title = "元素设计";
        this.initButtons();
        this.initConditions();
        let elementTypeData = ['请选择', 'action', 'adt', 'aggregate', 'assign', 'associate', 'calculate', 'default', 'handle', 'import', 'lookup', 'pick', 'value'];
        // let elementTypeData = ['请选择', 'action','assign', 'default', 'handle',  'lookup'];
        this.conditions['elementType'].dpData = elementTypeData;
    }

    protected wrapperInit() {
        return d.create(`
        <div class="elementManagerment">
            <div class="conditions">
            <div class="dropDown"></div><div class="dropDown"></div><div class="dropDown"></div>
            </div>
            <div class="buttons"></div>
            <div class="table"></div>
        </div>`);
    }

    set title(str: string) {
        this._title = str;
    }

    get title() {
        return this._title;
    }

    private _elementManagermentData: obj;
    get elementManagermentData() {
        if (!this._elementManagermentData) {
            this._elementManagermentData = {
                all: {
                    cols: [
                        {name: 'elementId', title: '元素ID'},
                        {name: 'elementType', title: '元素类型'},
                        {name: 'dataSource', title: '数据源'},
                        {name: 'pause', title: '是否禁用'}
                    ]
                },
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

    private initButtons() {
        let btnArr = [
            {
                name: '新增',
                iconPre: 'dev',
                icon: 'de-xinzeng'
            },
            {
                name: '修改',
                iconPre: 'dev',
                icon: 'de-xiugai'
            },
            {
                name: '删除',
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
                onClick: (e) => {
                    let elementType = this.conditions['elementType'].get();
                    if (elementType === '请选择') {
                        Modal.alert("请先选择元素类型");
                        return;
                    }
                    switch (index) {
                        case 0: {
                            // 新增
                            this.updateOrInsertElement();
                        }
                            break;
                        case 1: {
                            // 修改
                            let selectRows = this._table.selectedRows;

                            if (selectRows.length <= 0) {
                                Modal.alert('请先选择一个元素');
                                return;
                            }
                            if (selectRows.length > 1) {
                                Modal.alert('请只选择一个元素');
                                return;
                            }
                            let row = selectRows[0],
                                cellsData = {};
                            row.cells.forEach((cell) => {
                                if (cell.name === 'pause') {
                                    cellsData[cell.name] = cell.text === '否' ? 0 : 1;
                                }
                                else {
                                    cellsData[cell.name] = cell.text;
                                }
                            });
                            this.updateOrInsertElement(cellsData);
                        }
                            break;
                        case 2: {
                            // 删除
                            let selectRows = this._table.selectedRows,
                                deleteItem = [];
                            if (selectRows.length <= 0) {
                                Modal.alert("请先选择要删除的元素");
                                return;
                            }
                            selectRows.forEach((row) => {
                                let item = {};
                                row.cells.forEach((cell) => {
                                    if (cell.name === 'pause' || cell.name.indexOf('Flag') !== -1) {
                                        item[cell.name] = cell.text === '否' ? 0 : 1;
                                    } else {
                                        item[cell.name] = cell.text;
                                    }
                                });
                                deleteItem.push(item);
                            });
                            let para = {
                                type: "field",
                                delete: deleteItem
                            };
                            Modal.confirm({
                                msg: '确定要删除吗？',
                                title: '温馨提示',
                                callback: (flag) => {
                                    flag && DVAjax.elementDesignAjax(elementType, (res) => {
                                        Modal.toast(res.msg);
                                        this.clearAjaxPara();
                                    }, {type: 'POST', data: para});
                                }
                            })
                        }
                            break;
                        default:
                            break;
                    }
                }
            })
        })
    }

    private clearAjaxPara() {
        this.conditions['elementId'].set('');
        this.conditions['dataSource'].set('请选择');
        this.getAllConditionsData();
    }

    // 更新或者新增element
    private updateOrInsertElement(obj = {}) {
        let title = tools.isNotEmpty(obj) ? '修改元素' : '新增元素',// Modal的title
            elementType = this.conditions['elementType'].get(); // 获取当前的elementType
        elementType = elementType === '请选择' ? 'all' : elementType;
        let cols = this.elementManagermentData[elementType].cols, // 表单name对应
            html = this.createModalBody(cols, obj), // 获取Modal的body
            paraType = elementType; // 参数中的type，insert->element 其他对应当前elementType
        let modal = new Modal({
            header: {
                title: title
            },
            body: html,
            footer: {},
            width: '700px',
            isOnceDestroy: true,
            className: 'element-modal',
            onOk: () => {
                let elements = d.queryAll('.form-control', d.query('.form-horizontal', document.body)),
                    data: obj = {};
                for (let j = 0; j < elements.length; j++) {
                    let name = elements[j].getAttribute('name'),
                        element = <HTMLFormElement>elements[j];
                    if (element.value) {
                        if (name === 'pause' || name.indexOf('Flag') !== -1) {
                            data[name] = parseInt(element.value);
                        } else {
                            data[name] = element.value;
                        }
                    }
                }
                let type = 'update';
                if (tools.isEmpty(obj)) {
                    // 新增
                    type = 'insert';
                    data['elementType'] = elementType;
                    paraType = 'element';
                }
                let elementPara = {
                    type: paraType,
                };
                elementPara[type] = [data];
                DVAjax.elementDesignAjax(elementType, (res) => {
                    if (res.errorCode === 0) {
                        // 新增或修改成功 关闭模态框
                        Modal.toast(res.msg);
                        this.clearAjaxPara();
                        modal.destroy();
                    }
                }, {type: 'POST', data: elementPara});
            },
            onCancel: function (e) {
                Modal.confirm({
                    msg: '确认要取消编辑吗？', title: '温馨提示', callback: (flag) => {
                        if (flag) {
                            modal.destroy();
                        }
                    }
                });
            }
        })
    }

    /** 创建Modal的body
     *  cols 当前表格的列，用于生成对应表单
     *  data 当前为修改时传递的数据，新增默认为{}
     *  type 当前是新增还是修改,默认为false 表示修改
     * */
    private createModalBody(cols: obj[], data = {}): HTMLElement {
        let parentNode: IVNode = {
            tag: 'from',
            props: {
                className: 'form-horizontal'
            },
            children: []
        };
        if (tools.isEmpty(data)) {
            // type为true则表示insert，否则为update
            parentNode.children.push(this.addElementNeedPara());
        }
        cols.forEach((col) => {
            let type = 'text',
                colName = col.name;
            let group:IVNode = {
                tag:'div'
            };
            if (colName === 'pause' || colName.indexOf('Flag') !== -1) {
                type = 'number';
            }
            if(colName.indexOf('Sql') > 0){
                group = {
                    tag: 'div',
                    props: {
                        className: 'form-group'
                    },
                    children: [
                        {
                            tag: 'label',
                            props: {
                                className: 'col-sm-2 control-label',
                                for: col.name
                            },
                            children: [col.title]
                        }, {
                            tag: 'div',
                            props: {
                                className: 'col-sm-10'
                            },
                            children: [
                                {
                                    tag: 'textarea',
                                    props: {
                                        type: type,
                                        className: 'form-control',
                                        id: col.name,
                                        placeHolder: '请输入' + col.title,
                                        name: col.name,
                                        style:'resize:none;'
                                    }
                                }
                            ]
                        }
                    ]
                };
            }else{
                group = {
                    tag: 'div',
                    props: {
                        className: 'form-group'
                    },
                    children: [
                        {
                            tag: 'label',
                            props: {
                                className: 'col-sm-2 control-label',
                                for: col.name
                            },
                            children: [col.title]
                        }, {
                            tag: 'div',
                            props: {
                                className: 'col-sm-10'
                            },
                            children: [
                                {
                                    tag: 'input',
                                    props: {
                                        type: type,
                                        className: 'form-control',
                                        id: col.name,
                                        placeHolder: '请输入' + col.title,
                                        name: col.name
                                    }
                                }
                            ]
                        }
                    ]
                };
            }
            // 如果是修改，则把当前内容填充到form表单中
            if (tools.isNotEmpty(data)) {
                if(col.name.indexOf('Sql') !== -1){
                    (<IVNode[]>(<IVNode[]>group.children)[1].children)[0].children = [data[col.name]];
                }else{
                    (<IVNode[]>(<IVNode[]>group.children)[1].children)[0].props['value'] = data[col.name];
                }
            }
            parentNode.children.push(group);
        });
        return d.create(parentNode);
    }

    // 新增时需要添加的字段
    private addElementNeedPara(): IVNode {
        let dataSource: IVNode =
            {
                tag: 'div',
                props: {
                    className: 'form-group'
                },
                children: [
                    {
                        tag: 'label',
                        props: {
                            className: 'col-sm-2 control-label',
                            for: 'elementType'
                        },
                        children: ['数据源']
                    },
                    {
                        tag: 'div',
                        props: {
                            className: 'col-sm-10'
                        },
                        children: [
                            {
                                tag: 'select',
                                props: {
                                    className: 'form-control',
                                    id: 'dataSource',
                                    name: 'dataSource'
                                },
                                children: []
                            }
                        ]
                    }
                ]
            };
        this.dataSource.forEach((data) => {
            let obj = {
                tag: 'option',
                children: [data]
            };
            let dataSourceGroup = <IVNode>dataSource.children[1];
            (<IVNode>dataSourceGroup.children[0]).children.push(obj);
        });

        return dataSource;
    }

    // 筛选条件
    private conditions: obj;
    private _ajaxPara: obj;
    get ajaxPara() {
        if (!this._ajaxPara) {
            this._ajaxPara = {
                element_id: '',
                data_source: ''
            }
        }
        return this._ajaxPara;
    }

    set ajaxPara(para: obj) {
        this.isRefreshTable(para, true);
    }

    private isRefreshTable(para: obj, isRefresh: boolean) {
        this._ajaxPara = para;
        if (isRefresh) {
            this._table && this._table._clearAllSelectedCells();
            this._table && this._table.tableData.refresh();
        }
    }

    private getAllConditionsData() {
        let elementId = tools.isNotEmpty(this.conditions) ? this.conditions['elementId'].get().replace(/\s+/g, ''):'',
            dataSource =tools.isNotEmpty(this.conditions) ? this.conditions['dataSource'].get().replace(/\s+/g, ''):'';
        dataSource = dataSource === '请选择' ? '' : dataSource;
        let paraObj = {
            element_id: elementId,
            data_source:dataSource
        };
        this.ajaxPara = paraObj;
    }

    private _dataSource: string[];
    set dataSource(d: string[]) {
        this._dataSource = d;
    }

    get dataSource() {
        return this._dataSource;
    }

    private initConditions() {
        let dropdowns = d.queryAll('.dropDown', this.wrapper);
        let text = '';
        let elementType = new DropDownModule({
            container: dropdowns[0],
            title: '元素类型',
            changeValue: (val) => {
                this.conditions.elementId.set('');
                text = '';
                this.getElementTableData();
                this.clearAjaxPara();
            },
            disabled: false,
            dropClassName: 'element'
        });

        let elementId = new TextInputModule({
            container: dropdowns[1],
            title: '元素ID',
            disabled: false,
        });
        elementId.textInput.on('blur', (e) => {
            let inputValue = (e.target as HTMLFormElement).value.replace(/\s+/g, ' ');
            if (inputValue === text) {
                return;
            }
            this.getAllConditionsData();
            text = inputValue;
        });

        let dataSource = new DropDownModule({
            container: dropdowns[2],
            title: '数据源',
            disabled: false,
            dropClassName: 'element',
            data: [''],
            changeValue: (val) => {
                this.getAllConditionsData();
            }
        });

        DVAjax.dataSourceQueryAjax((res) => {
            this.dataSource = res.slice();
            res.unshift('请选择');
            dataSource.dpData = res;
        });

        this.conditions = {
            elementType: elementType,
            elementId: elementId,
            dataSource: dataSource
        };
        d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
    }

    private _table: FastTable;

    // 根据当前筛选条件获取表数据
    private getElementTableData() {
        // this._table.destroy();
        let items = this.conditions,
            elementType = items['elementType'].get().replace(/\s+/g, ""),
            url = '?';

        if (elementType === '请选择') {
            elementType = 'all';
        } else {
            url = `/${elementType}?`;
        }
        d.query('.table', this.wrapper).innerHTML = '';
        // 清空ajaxPara
        let obj = {
            element_id: ''
        };
        this.isRefreshTable(obj, false);
        this.createPageTable(elementType, url);
    }

    private createPageTable(val: string, urlStrem: string) {
        this._table = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.elementManagermentData[val].cols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURI(queryStr);
                    let url = config.ajaxUrl.elementDesign + urlStrem + 'pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        let data = response.dataArr,
                            total = 0;
                        tools.isNotEmptyArray(data) && data.map((item) => {
                            if (item.hasOwnProperty('pause')) {
                                item.pause = item.pause === 0 ? '否' : '是';
                            }
                            return item;
                        });
                        tools.isNotEmptyArray(data) && (total = response.head.total);
                        return {data: data, total: total};
                    })
                },
                auto: false,
                once: false
            },
            page: {
                size: 50,
                options: [50, 100, 150]
            }
        });
    }

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '',
            ajaxParaData = this.ajaxPara;
        for (let key in ajaxParaData) {
            if (tools.isNotEmpty(ajaxParaData[key])) {
                paraStr = paraStr + '"' + key + '"' + ':' + (tools.isNotEmpty(ajaxParaData[key]) ? '"' + ajaxParaData[key] + '"' : '""') + ',';
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
}