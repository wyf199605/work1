/// <amd-module name="MainFuncModule"/>

import {DropDownModule} from "../dropDown/DropDownModule";
import {Button} from "global/components/general/button/Button";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {SQLEditor} from "../../../global/components/form/SQLEditor/SQLEditor";
import {TextInput} from "../../../global/components/form/text/text";
import {FastTable} from "../../../global/components/newTable/FastTable";
import {DVAjax} from "../util/DVAjax";
import {Modal} from "../../../global/components/feedback/modal/Modal";

import d = G.d;
import tools = G.tools;
import config = DV.CONF;
import {TextInputModule} from "../textInput/TextInputModule";
import {QueryDevicePage} from "../../page/design/QueryDevicePage";
import IComponentPara = G.IComponentPara;
import Component = G.Component;

interface IMainFuncModulePara extends IComponentPara {
    qdData?: obj;
}

export class MainFuncModule extends Component {
    protected wrapperInit(): HTMLElement {
        return <div class="mainFunc hide">
            <div class="mainTopContent" style="overflow: hidden">
                <div class="drop1" style="float: left"></div>
                <div class="drop2" style="float: left;"></div>
                <div class="suportChildQuery" style="float: left;"></div>
                <div class="clear"></div>
            </div>
            <div class="mainBottomContent">
                <div class="frontBtn">
                    <label class="title-label"></label>
                </div>
                <div class="sql-group group-selectSql">
                    <label class="title-label">查询SQL :</label>
                    <div class="sql-input selectSql">

                    </div>
                    <div class="clear"></div>
                </div>
                <div class="sql-group group-subselectSql hide">
                    <label class="title-label">子查询SQL :</label>
                    <div class="sql-input subselectSql">

                    </div>
                    <div class="clear"></div>
                </div>
                <div class="sql-group group-insertSql">
                    <label class="title-label">新增SQL :</label>
                    <div class="sql-input insertSql">

                    </div>
                    <div class="clear"></div>
                </div>
                <div class="sql-group group-updateSql">
                    <label class="title-label">更新SQL :</label>
                    <div class="sql-input updateSql">

                    </div>
                    <div class="clear"></div>
                </div>
                <div class="sql-group group-deleteSql">
                    <label class="title-label">删除SQL :</label>
                    <div class="sql-input deleteSql">

                    </div>
                    <div class="clear"></div>
                </div>
                <div class="group-fields">
                    <div class="title-label">隐藏字段 :</div>
                    <div class="noshowFields"></div>
                    <div class="clear"></div>
                </div>
                <div class="backBtn">
                    <label class="title-label"></label>
                </div>
            </div>
        </div>;
    }

    constructor(para: IMainFuncModulePara) {
        super(para);
        if (tools.isEmpty(para)) {
            para = {};
        }
        this.init(para);
    }

    private init(mainFuncPara: IMainFuncModulePara) {
        this.initTopContent();
        this.initBottomContent();
        let mainFuncQDData = {
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
        let itemId = QueryDevicePage.itemId;
        if (tools.isNotEmpty(itemId)) {
            DVAjax.primaryFunctionAjax(itemId, (res) => {
                for (let key in mainFuncQDData) {
                    if (res.data.hasOwnProperty(key)) {
                        mainFuncQDData[key] = res.data[key];
                    }
                }
                this.qdData = mainFuncQDData;
            });
            DVAjax.queryItemRelatedConds(itemId, (res) => {
                tools.isNotEmpty(res.dataArr) && this.handleEelevanceCond(res.dataArr);
            });
        } else {
            this.qdData = mainFuncQDData;
        }

        d.on(this.wrapper, 'click', '.closeCond', (e) => {
            let condItem = d.closest(e.target as HTMLElement, '.cond-item'),
                name = condItem.dataset.name,
                id = parseInt(condItem.dataset.id);
            d.remove(condItem);
            if (id === 0) {
                this.frontCond = this.frontCond.filter((cond) => {
                    return cond.condId !== name;
                })
            } else {
                this.backCond = this.backCond.filter((cond) => {
                    return cond.condId !== name;
                })
            }
        })
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
                queryType: null,
                multiPageFlag: null,
                suportChildQuery: null,
                selectSql: null,
                updateSql: null,
                insertSql: null,
                deleteSql: null,
                noshowFields: null,
                subselectSql: null
            }
        }
        return this._allItems;
    }

    private initTopContent() {
        let drop1 = new DropDownModule({
            title: '查询方式',
            data: ["不能查询", "简单查询", "高级查询"],
            container: d.query('.drop1', this.wrapper),
            disabled: false,
            dropClassName: 'queryDrop'
        });
        this.allItems['queryType'] = drop1;
        let drop2 = new DropDownModule({
            title: '分页方式',
            data: ['不分页', '服务端分页', '客户端分页'],
            container: d.query('.drop2', this.wrapper),
            disabled: false,
            dropClassName: 'pageDrop'
        });
        this.allItems['multiPageFlag'] = drop2;
        let suportChildQuery = new CheckBox({
            container: d.query('.suportChildQuery', this.wrapper),
            text: "支持子查询",
            onSet: (val) => {
                if (val) {
                    d.query('.group-subselectSql', this.wrapper).classList.remove('hide');
                } else {
                    d.query('.group-subselectSql', this.wrapper).classList.add('hide');
                }
            }
        });
        this.allItems['suportChildQuery'] = suportChildQuery;
        let noshowFields = new TextInput({
            container: d.query('.noshowFields', this.wrapper)
        });
        this.allItems['noshowFields'] = noshowFields;

        let selectSql = new SQLEditor({
            container: d.query('.selectSql', this.wrapper),
            width: '100%',
            height: 100
        });
        this.allItems['selectSql'] = selectSql;
        let updateSql = new SQLEditor({
            container: d.query('.updateSql', this.wrapper),
            width: '100%',
            height: 100
        });
        this.allItems['updateSql'] = updateSql;
        let insertSql = new SQLEditor({
            container: d.query('.insertSql', this.wrapper),
            width: '100%',
            height: 100
        });
        this.allItems['insertSql'] = insertSql;
        let deleteSql = new SQLEditor({
            container: d.query('.deleteSql', this.wrapper),
            width: '100%',
            height: 100
        });
        this.allItems['deleteSql'] = deleteSql;

        let subselectSql = new SQLEditor({
            container: d.query('.subselectSql', this.wrapper),
            width: '100%',
            height: 100
        });
        this.allItems['subselectSql'] = subselectSql;
    }

    private handleEelevanceCond(data: obj[]) {
        let fc = [],
            bc = [];
        data.forEach((cond) => {
            if (cond.ctlType === 0) {
                fc.push(cond);
                this.createCondEle(true, cond);
            } else {
                bc.push(cond);
                this.createCondEle(false, cond);
            }
        });
        this.frontCond = fc;
        this.backCond = bc;
    }

    private createCondEle(isFront: boolean, cond: obj);
    private createCondEle(isFront: boolean, cond: obj[]) {
        let container: HTMLElement = isFront ? d.query('.frontBtn', this.wrapper) : d.query('.backBtn', this.wrapper),
            id = isFront ? 0 : 1;
        if (!Array.isArray(cond)) {
            cond = [cond];
        }
        cond.forEach((co) => {
            let condEle = d.create(`
        <div class="cond-item" data-name="${co.condId}" data-id="${id}">
        <div class="condId">${co.condId} </div>
        <span class="closeCond dev de-guanbi"></span>
        </div>
        `);
            container.appendChild(condEle);
        })
    }

    private initBottomContent() {
        let frontBtn = new Button({
            content: '前置条件',
            container: d.query('.frontBtn', this.wrapper),
            onClick: (event) => {
                // 前置条件
                this.isFront = true;
                if (tools.isNotEmpty(this.condModal)) {
                    let obj = {
                        cond_id: '',
                        datasource: ''
                    };
                    this.condAjaxPara = obj;
                    this.condModal.isShow = true;
                } else {
                    DVAjax.dataSourceQueryAjax((res) => {
                        res.unshift('请选择');
                        this.createConditonsModal(res);
                    })
                }
            }
        });

        let backBtn = new Button({
            content: '后置条件',
            container: d.query('.backBtn', this.wrapper),
            onClick: (event) => {
                // 后置条件
                this.isFront = false;
                if (tools.isNotEmpty(this.condModal)) {
                    let obj = {
                        cond_id: '',
                        datasource: ''
                    };
                    this.condAjaxPara = obj;
                    this.condModal.isShow = true;
                } else {
                    DVAjax.dataSourceQueryAjax((res) => {
                        res.unshift('请选择');
                        this.createConditonsModal(res);
                    })
                }
            }
        });
    }

    private dataMap: obj = {
        queryType: [
            '不能查询',
            '简单查询',
            '高级查询'
        ],
        multiPageFlag: [
            '不分页',
            '服务端分页',
            '客户端分页'
        ]
    };
    private _qdData: obj;
    set qdData(da: obj) {
        this._qdData = da;
        let items = this.allItems;
        for (let key in items) {
            if (key === 'queryType') {
                let index = parseInt(this._qdData[key]),
                    findex = index;
                if (index === 3) {
                    findex = 2;
                } else if (index === 2) {
                    findex = 1;
                }
                items[key].set(this.dataMap[key][index]);
            } else if (key === 'multiPageFlag') {
                items[key].set(this.dataMap[key][this._qdData[key]]);
            } else {
                items[key].set(this._qdData[key]);
            }
        }
    }

    get qdData() {
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
            }
        }
        return this._qdData;
    }

    private _isShow: Boolean;
    set isShow(isShow) {
        this._isShow = isShow;
        if (this._isShow) {
            this.wrapper.classList.add('show');
            this.wrapper.classList.remove('hide');
        } else {
            this.wrapper.classList.remove('show');
            this.wrapper.classList.add('hide');
        }
    }

    // 前置后置条件
    private _frontCond: obj[] = [];
    set frontCond(data: obj[]) {
        this._frontCond = data;
    }

    get frontCond() {
        return this._frontCond;
    }

    private _backCond: obj[] = [];
    set backCond(data: obj[]) {
        this._backCond = data;
    }

    get backCond() {
        return this._backCond;
    }


    // 获取当前页所有表单数据
    get() {
        let qd = this.qdData,
            itemListData = {
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

        for (let key in itemListData) {
            if (this.allItems.hasOwnProperty(key)) {
                if (key === 'subselectSql') {
                    if (this.allItems['suportChildQuery'].get()) {
                        itemListData[key] = this.allItems[key].get();
                    }
                } else if (key === 'queryType') {
                    let index = this.dataMap[key].indexOf(this.allItems[key].get()),
                        findex = index;
                    if (index === 1) {
                        findex = 2;
                    } else if (index === 2) {
                        findex = 3;
                    }
                    itemListData[key] = findex;
                } else if (key === 'multiPageFlag') {
                    itemListData[key] = this.dataMap[key].indexOf(this.allItems[key].get())
                } else {
                    itemListData[key] = this.allItems[key].get();
                }
            }
        }
        return itemListData;
    }

    // 条件弹窗
    private condModal: Modal;
    private condTable: FastTable;
    private _isFront: boolean = false;
    set isFront(front: boolean) {
        this._isFront = front;
    }

    get isFront() {
        return this._isFront;
    }

    private createConditonsModal(ds: string[]) {
        let self = this,
            body = d.create('<div class="modal-body-container"></div>');
        body.appendChild(d.create('<div class="conditions"></div>'));
        body.appendChild(d.create('<div class="table"></div>'));
        let inputModule = new TextInputModule({
            title: '条件ID',
            container: d.query('.conditions', body)
        });
        inputModule.textInput.on('blur', () => {
            handlerConditions();
        });

        let dataSource = new DropDownModule({
            title: '数据源',
            container: d.query('.conditions', body),
            disabled: false,
            changeValue: () => {
                handlerConditions();
            }
        });
        dataSource.dpData = ds;

        function handlerConditions() {
            let condId = inputModule.get().replace(/\s+/g, ""),
                datasource = dataSource.get().replace(/\s+/g, "");
            datasource = datasource === '请选择' ? '' : datasource;
            let ajaxPara = {
                cond_id: condId,
                data_source: datasource
            };
            self.condAjaxPara = ajaxPara;
        }

        this.condTable = new FastTable({
            container: d.query('.table', body),
            cols: [[{name: 'condId', title: '条件 ID'},
                {name: 'condSql', title: '条件Sql'},
                {name: 'condType', title: '条件类型'},
                {name: 'showText', title: '显示文本'},
                {name: 'dataSource', title: '数据源'},
                {name: 'condFieldName', title: '条件字段名称'}
            ]],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.queryCondition + '?pageparams=' + queryStr;
                    url = url + self.handlerAjaxPara();
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
        this.condModal = new Modal({
            body: body,
            header: {
                title: '请选择条件'
            },
            width: '800px',
            footer: {},
            className: 'condModal',
            onOk: () => {
                let data = self.handlerTableData(),
                    resultData = self.isHadCond(self.isFront, data);
                if (self.isFront) {
                    self.frontCond = self.frontCond.concat(resultData);
                } else {
                    self.backCond = self.backCond.concat(resultData);
                }
                self.createCondEle(this.isFront, resultData);
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
    }

    private _condAjaxPara: obj;
    set condAjaxPara(para: obj) {
        this._condAjaxPara = para;
        this.condTable && this.condTable._clearAllSelectedCells();
        this.condTable && this.condTable.tableData.refresh();
    }

    get condAjaxPara() {
        if (!this._condAjaxPara) {
            this._condAjaxPara = {
                cond_id: '',
                data_source: ''
            }
        }
        return this._condAjaxPara;
    }

    private handlerAjaxPara(): string {
        let str = '&fuzzyparams={',
            paraStr = '',
            cond = this.condAjaxPara;
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

    private handlerTableData(): obj[] {
        let rows = this.condTable.selectedRows,
            data = [];
        if (tools.isNotEmpty(rows)) {
            rows.forEach((row) => {
                let obj = {};
                obj['index'] = row.index;
                row.cells.forEach((cell) => {
                    obj[cell.name] = cell.text;
                });
                data.push(obj);
            });
        }
        return data;
    }

    // 判断cond是否已经添加
    private isHadCond(isFrond: boolean, cond: obj[]): obj[] {
        let arr = isFrond ? this.frontCond : this.backCond,
            resultArr = [],
            len = arr.length;
        cond.forEach((cond) => {
            let num = 0;
            for (let i = 0; i < len; i++) {
                let c = arr[i];
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
    }
}