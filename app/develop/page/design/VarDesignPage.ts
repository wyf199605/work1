/// <amd-module name="VarDesignPage" />

import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import Ajax = G.Ajax;
import config = DV.CONF;
import {DVAjax} from "../../module/util/DVAjax";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {DropDownModule} from "../../module/dropDown/DropDownModule";

export class VarDesignPage extends SPAPage {
    init(para, data) {
        this.title = "变量设计";
        this.initConditions(); // 筛选条件
        this.initButtons(); // 初始化按钮
        this.getAllVarData(); // 获取表数据
    }

    protected wrapperInit() {
        return d.create(`
        <div class="varDesign">
        <div class="conditions"></div>
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

    private conditions: obj;

    private initConditions() {
        let varIdText = '';
        let varId = new TextInputModule({
            title: '变量 ID',
            container: d.query('.conditions', this.wrapper)
        });
        varId.textInput.on('change', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === varIdText) {
                return;
            }
            this.getAllConditions();
            varIdText = input.value;
        });
        let varNameText = '';
        let varName = new TextInputModule({
            title: '变量名称',
            container: d.query('.conditions', this.wrapper)
        });
        varName.textInput.on('blur', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === varNameText) {
                return;
            }
            this.getAllConditions();
            varNameText = input.value;
        });

        let varSqlText = '';
        let varSql = new TextInputModule({
            title: '变量Sql',
            container: d.query('.conditions', this.wrapper)
        });
        varSql.textInput.on('blur', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === varSqlText) {
                return;
            }
            this.getAllConditions();
            varSqlText = input.value;
        });

        let dataSource = new DropDownModule({
            title: '数据源',
            container: d.query('.conditions', this.wrapper),
            disabled: false,
            changeValue: (val) => {
                this.getAllConditions();
            }
        });

        DVAjax.dataSourceQueryAjax((res) => {
            this.dataSource = res;
            let da = res.slice();
            da.unshift('请选择');
            dataSource.dpData = da;
        });

        d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
        this.conditions = {
            varId: varId,
            varName: varName,
            dataSource: dataSource,
            varSql: varSql
        }
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
            let self = this;
            new Button({
                content: btn.name,
                iconPre: btn.iconPre,
                icon: btn.icon,
                container: d.query('.buttons', this.wrapper),
                onClick: (e) => {
                    switch (index) {
                        case 0: {
                            // 新增
                            this.updateOrInsertElement();
                        }
                            break;
                        case 1: {
                            let selectRows = this._table.selectedRows;
                            if (selectRows.length <= 0) {
                                Modal.alert('请先选择一个变量');
                            } else if (selectRows.length > 1) {
                                Modal.alert('请只选择一个变量');
                            } else {
                                let row = selectRows[0],
                                    cellsData = {};
                                row.cells.forEach((cell) => {
                                    cellsData[cell.name] = cell.text;
                                });
                                this.updateOrInsertElement(cellsData);
                            }
                        }
                            break;
                        case 2: {
                            // 删除
                            let selectRows = this._table.selectedRows,
                                deleteItem = [];
                            if (selectRows.length <= 0) {
                                Modal.alert("请先选择要删除的变量");
                                return;
                            }
                            selectRows.forEach((row) => {
                                let item = {};
                                row.cells.forEach((cell) => {
                                    item[cell.name] = cell.text;
                                });
                                deleteItem.push(item);
                            });
                            let para = {
                                type: "var",
                                delete: deleteItem
                            };
                            Modal.confirm({
                                msg: '确定要删除吗？',
                                title: '温馨提示',
                                callback:  (flag)=> {
                                    flag && DVAjax.varDesignAjax((res) => {
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

    private _varTableCols: IFastTableCol[];
    private get varTableCols() {
        if (!this._varTableCols) {
            this._varTableCols = [
                {name: 'varId', title: '变量ID'},
                {name: 'dataSource', title: '数据源'},
                {name: 'varName', title: '变量名称'},
                {name: 'varSql', title: '变量SQL'}
            ]
        }
        return this._varTableCols;
    }

    // 更新或者新增element
    private updateOrInsertElement(obj?: obj) {
        let title = tools.isNotEmpty(obj) ? '修改变量' : '新增变量',// Modal的title
            cols = this.varTableCols, // 表单name对应
            html = this.createModalBody(cols, obj); // 获取Modal的body
        let modal = new Modal({
            header: {
                title: title
            },
            body: html,
            footer: {},
            width: '700px',
            isOnceDestroy: true,
            className: 'varModal',
            onOk: () => {
                let elements = d.queryAll('.form-control', d.query('.form-horizontal', document.body)),
                    data: obj = {};
                for (let j = 0; j < elements.length; j++) {
                    let name = elements[j].getAttribute('name'),
                        element = <HTMLFormElement>elements[j];
                    if (element.value) {
                        data[name] = element.value;
                    }
                }
                let type = 'update';
                if (!obj) {
                    // 新增
                    type = 'insert';
                }
                let varPara = {
                    type: 'var',
                };
                varPara[type] = [data];
                let isOk = true;
                if (tools.isEmpty(data.varId)) {
                    Modal.alert('变量ID不能为空');
                    isOk = false;
                }
                if (isOk && data.dataSource === '请选择') {
                    Modal.alert('数据库不能为空');
                    isOk = false;
                }
                if (isOk && tools.isEmpty(data.varSql)) {
                    Modal.alert('变量Sql不能为空');
                    isOk = false;
                }
                if (isOk) {
                    DVAjax.varDesignAjax((res) => {
                        if (res.errorCode === 0) {
                            Modal.toast(res.msg);
                            modal.destroy();
                            this.clearAjaxPara();
                        }
                    }, {type: 'POST', data: varPara});
                }
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

    private clearAjaxPara() {
        let cond = this.conditions;
        cond['varId'].set('');
        cond['varName'].set('');
        cond['varSql'].set('');
        cond['dataSource'].set('请选择');
        this.getAllConditions();
    }

    private _dataSource: string[];
    private set dataSource(data) {
        this._dataSource = data;
    }

    private get dataSource() {
        return this._dataSource;
    }

    // 创建Modal的body
    private createModalBody(cols: obj[], data = {}): HTMLElement {
        let parentNode: IVNode = {
            tag: 'from',
            props: {
                className: 'form-horizontal'
            },
            children: []
        };
        let group: IVNode = {tag: ''};
        cols.forEach((col) => {
            if (col.name === 'dataSource') {
                let value = '';
                if (tools.isNotEmpty(data)) {
                    value = data[col.name];
                }
                group = this.addDataSource(value);
            } else {
                let type = 'text';
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
                if (tools.isNotEmpty(data)) {
                    (<IVNode[]>(<IVNode[]>group.children)[1].children)[0].props['value'] = data[col.name];
                }
            }
            parentNode.children.push(group);
        });
        return d.create(parentNode);
    }

    private addDataSource(value = ''): IVNode {
        value = tools.isEmpty(value) ? this.dataSource[0] : value;
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
                                    name: 'dataSource',
                                },
                                children: []
                            }
                        ]
                    }
                ]
            };
        this.dataSource.forEach((data) => {
            let obj: IVNode = {
                tag: 'option',
                children: [data]
            };
            if (data === value) {
                obj.props = {
                    selected: 'selected'
                }
            }
            let dataSourceGroup = <IVNode>dataSource.children[1];
            (<IVNode>dataSourceGroup.children[0]).children.push(obj);
        });
        return dataSource;
    }

    private getAllConditions() {
        let varId = this.conditions.varId.get().replace(/\s+/g, ""),
            varName = this.conditions.varName.get().replace(/\s+/g, ""),
            dataSource = this.conditions.dataSource.get().replace(/\s+/g, ""),
            varSql = this.conditions.varSql.get().replace(/\s+/g, "");
        dataSource = dataSource === '请选择' ? '' : dataSource;
        let obj = {
            var_id: varId,
            var_name: varName,
            data_source: dataSource,
            var_sql: varSql
        };
        this.tableAjaxPara = obj;
    }

    private _tableAjaxPara: obj = null;
    set tableAjaxPara(obj) {
        this._tableAjaxPara = obj;
        this._table && this._table._clearAllSelectedCells();
        this._table && this._table.tableData.refresh();
    }

    get tableAjaxPara() {
        if (!this._tableAjaxPara) {
            this._tableAjaxPara = {
                var_id: '',
                var_name: '',
                data_source: '',
                var_sql: ''
            }
        }
        return this._tableAjaxPara;
    }

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '',
            ajaxParaData = this.tableAjaxPara;
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

    // 当前表
    private _table: FastTable;
    private getAllVarData() {
        this._table = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.varTableCols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.varDesign + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        let data = response.dataArr,
                            total = 0;
                        tools.isNotEmptyArray(data) && (total = response.head.total);
                        return {data: data, total: total};
                    })
                },
                auto: false,
                once: false
            },
            page: {
                size: 50,
                options: [50, 100]
            }
        })
    }
}