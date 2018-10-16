/// <amd-module name="CondDesignPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {DropDownModule} from "../../module/dropDown/DropDownModule";
import {DVAjax} from "../../module/util/DVAjax";
import {Button} from "../../../global/components/general/button/Button";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import config = DV.CONF;
import tools = G.tools;

export class CondDesignPage extends SPAPage {

    set title(title: string) {
        this._title = title;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit(): Node {
        return d.create(`<div class="condDesign">
<div class="conditions"></div>
            <div class="buttons"></div>
            <div class="table"></div>
</div>`);
    }

    protected init(para: Primitive[], data?) {
        this.title = "条件设计";
        this.initConditions();
        this.initButtons();
        this.initTable();
    }

    private conditions: obj;

    private initConditions() {
        let condIdValue = '',
            condId = new TextInputModule({
                title: '条件ID',
                container: d.query('.conditions', this.wrapper)
            });
        condId.textInput.on('blur', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === condIdValue) {
                return;
            }
            this.getAllConditions();
            condIdValue = input.value;
        });

        let condTypeValue = '',
            condType = new TextInputModule({
                title: '条件类型',
                container: d.query('.conditions', this.wrapper)
            });
        condType.textInput.on('blur', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === condTypeValue) {
                return;
            }
            this.getAllConditions();
            condTypeValue = input.value;
        });
        let dataSource = new DropDownModule({
            title: '数据源',
            container: d.query('.conditions', this.wrapper),
            disabled: false,
            changeValue: () => {
                this.getAllConditions();
            }
        });
        d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'))
        this.conditions = {
            condId: condId,
            condType: condType,
            dataSource: dataSource
        };

        DVAjax.dataSourceQueryAjax((res) => {
            this.dataSource = res.slice();
            res.unshift('请选择');
            dataSource.dpData = res;
        })
    }

    private getAllConditions() {
        let cond = this.conditions,
            cond_id = cond['condId'].get().replace(/\s+/g, ""),
            cond_type = cond['condType'].get().replace(/\s+/g, ""),
            dataSource = cond['dataSource'].get().replace(/\s+/g, "");
        dataSource = dataSource === '请选择' ? '' : dataSource;
        let obj = {
            cond_id: cond_id,
            cond_type: cond_type,
            data_source: dataSource
        };
        this.condAjaxPara = obj;
    }


    private _condAjaxPara: obj;
    set condAjaxPara(para: obj) {
        this._condAjaxPara = para;
        this.condTable && this.condTable._clearAllSelectedCells();
        this.condTable && this.condTable.tableData.refresh();
    }

    get condAjaxPara() {
        return this._condAjaxPara;
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
                            let selectRows = this.condTable.selectedRows;
                            if (selectRows.length <= 0) {
                                Modal.alert('请先选择一个条件');
                            } else if (selectRows.length > 1) {
                                Modal.alert('请只选择一个条件');
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
                            let selectRows = this.condTable.selectedRows,
                                deleteItem = [];
                            if (selectRows.length <= 0) {
                                Modal.alert("请先选择要删除的条件");
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
                                type: "cond",
                                delete: deleteItem
                            };
                            Modal.confirm({
                                msg: '确定要删除吗？',
                                title: '温馨提示',
                                callback: function (flag) {
                                    flag && DVAjax.handlerConditons({type: 'POST', data: para}, (res) => {
                                        Modal.toast(res.msg);
                                        self.clearCondAjaxPara();
                                    });
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

    private _condTableCols: IFastTableCol[];
    get condTableCols() {
        if (!this._condTableCols) {
            this._condTableCols = [{name: 'condId', title: '条件 ID'},
                {name: 'condSql', title: '条件Sql'},
                {name: 'condType', title: '条件类型'},
                {name: 'showText', title: '显示文本'},
                {name: 'dataSource', title: '数据源'},
                {name: 'condFieldName', title: '条件字段名称'}
            ]
        }
        return this._condTableCols;
    }

    private condTable: FastTable;

    private initTable() {
        this.condTable = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.condTableCols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.queryCondition + '?pageparams=' + queryStr;
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

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '',
            ajaxParaData = this.condAjaxPara;
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

    private updateOrInsertElement(obj?: obj) {
        let title = tools.isNotEmpty(obj) ? '修改条件' : '新增条件',// Modal的title
            cols = this.condTableCols, // 表单name对应
            html = this.createModalBody(cols, obj), // 获取Modal的body
            self = this;
        let modal = new Modal({
            header: {
                title: title
            },
            body: html,
            footer: {},
            width: '700px',
            isOnceDestroy: true,
            className: 'condModal',
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
                let condPara = {
                    type: 'cond',
                };
                condPara[type] = [data];
                let isOk = true;
                if (tools.isEmpty(data.condId)) {
                    Modal.alert('条件ID不能为空');
                    isOk = false;
                }
                if (isOk && data.dataSource === '请选择') {
                    Modal.alert('数据库不能为空');
                    isOk = false;
                }
                if (isOk && tools.isEmpty(data.condType)) {
                    Modal.alert('条件类型不能为空');
                    isOk = false;
                }
                if (isOk && tools.isEmpty(data.condSql)) {
                    Modal.alert('条件Sql不能为空');
                    isOk = false;
                }
                if (isOk) {
                    DVAjax.handlerConditons({type: 'POST', data: condPara},(res) => {
                        if (res.errorCode === 0) {
                            Modal.toast(res.msg);
                            modal.destroy();
                            self.clearCondAjaxPara();
                        }
                    });
                }
            },
            onCancel: function (e) {
                Modal.confirm({
                    msg: '确认要取消编辑吗？', title: '温馨提示', callback: (flag) => {
                       flag && modal.destroy();
                    }
                });
            }
        })
    }

    private clearCondAjaxPara() {
        let cond = this.conditions;
        cond['condId'].set('');
        cond['condType'].set('');
        cond['dataSource'].set('请选择');
        this.getAllConditions();
    }

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

    private _dataSource: string[];
    set dataSource(d: string[]) {
        this._dataSource = d;
    }

    get dataSource() {
        return this._dataSource;
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
}