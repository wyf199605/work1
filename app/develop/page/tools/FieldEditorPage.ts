/// <amd-module name="FieldEditorPage"/>

import SPAPage = G.SPAPage;
import d = G.d;
import Ajax = G.Ajax;
import config = DV.CONF;
import tools = G.tools;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {Button} from "../../../global/components/general/button/Button";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {CheckBox} from "../../../global/components/form/checkbox/checkBox";
import {DVAjax} from "../../module/util/DVAjax";
import {DropDownModule} from "../../module/dropDown/DropDownModule";


export class FieldEditorPage extends SPAPage {
    set title(str: string) {
        this._title = str;
    }

    get title() {
        return this._title;
    }

    protected wrapperInit() {
        return d.create(`<div class="fieldEditorPage">
<div class="conditions"></div>
<div class="buttons"></div>
<div class="table"></div>
</div>`);
    }

    init(para, data) {
        this.title = '字段编辑器';
        this.initConditions();
        this.initButtons();
        this.createPageTable();
    }

    private conditions: obj;

    private initConditions() {
        let filedNameValue = '';
        let fieldName = new TextInputModule({
            title: '字段名称',
            container: d.query('.conditions', this.wrapper),
        });
        fieldName.textInput.on('change', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === filedNameValue) {
                return;
            }
            this.getAllConditionsData();
            filedNameValue = input.value;
        });
        let captionValue = '';
        let caption = new TextInputModule({
            title: '字段标题',
            container: d.query('.conditions', this.wrapper),
        });
        caption.textInput.on('change', (e) => {
            let input = e.target as HTMLFormElement;
            if (input.value === captionValue) {
                return;
            }
            this.getAllConditionsData();
            captionValue = input.value;
        });
        this.conditions = {
            fieldName: fieldName,
            caption: caption
        };

        d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'))
    }

    private getAllConditionsData() {
        let cond = this.conditions;
        if (cond) {
            let fieldName = cond.fieldName.get().replace(/\s+/g, ""),
                caption = cond.caption.get().replace(/\s+/g, "");
            let obj = {
                field_name: fieldName,
                caption: caption
            };
            this.ajaxPara = obj;
        }
    }

    private _ajaxPara: obj;
    set ajaxPara(para: obj) {
        this._ajaxPara = para;
        this._table && this._table._clearAllSelectedCells();
        this._table && this._table.tableData.refresh();
    }

    get ajaxPara() {
        if (!this._ajaxPara) {
            this._ajaxPara = {
                field_name: '',
                caption: ''
            }
        }
        return this._ajaxPara;
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

    private _tableCol: IFastTableCol[];
    get tableCol() {
        if (!this._tableCol) {
            this._tableCol = [
                {name: 'fieldName', title: '字段名称'},
                {name: 'caption', title: '字段标题'},
                {name: 'alignment', title: '对齐方式'},
                {name: 'allowScan', title: '允许扫描输入'},
                {name: 'dataType', title: '数据类型'},
                {name: 'dataTypeFlag', title: '数据类型标识'},
                {name: 'displayWidth', title: '显示宽度'},
                {name: 'displayFormat', title: '显示格式'},
                {name: 'editFormt', title: '编辑格式'},
                {name: 'imeCare', title: '操纵输入法'},
                {name: 'imeOpen', title: '打开输入法'},
                {name: 'inputHint', title: '输入提示'},
                {name: 'validChars', title: '有效字符'},
                {name: 'invalidChars', title: '无效字符'},
                {name: 'checkExpress', title: '校验表达式'},
                {name: 'checkMessage', title: '校验信息'},
                {name: 'maxLength', title: '最大长度'},
                {name: 'minLength', title: '最小长度'},
                {name: 'maxValue', title: '最大值'},
                {name: 'minValue', title: '最小值'},
                {name: 'defaultValue', title: '默认值'},
                {name: 'multiValueFlag', title: '多值标识'},
                {name: 'noCopy', title: '不可复制'},
                {name: 'noEdit', title: '不可编辑'},
                {name: 'noSort', title: '不可排序'},
                {name: 'noSum', title: '不可汇总'},
                {name: 'readOnlyFlag', title: '只读标识'},
                {name: 'requieredFlag', title: '必输'},
                {name: 'valueListType', title: '字段值的列表类型'},
                {name: 'valueLists', title: '字段值的列表'},
                {name: 'hyperRes', title: '链接资源'},
                {name: 'trueExpr', title: '真值表达'},
                {name: 'falseExpr', title: '假值表达'},
                {name: 'nameRuleFlag', title: '命名规则标识'},
                {name: 'nameRuleId', title: '命名规则编号'},
            ]
        }
        return this._tableCol;
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
                    switch (index) {
                        case 0: {
                            // 新增
                            this.editModal(true);
                        }
                            break;
                        case 1: {
                            // 修改
                            this.editModal(false);
                        }
                            break;
                        case 2: {
                            // 删除
                            let selectRows = this._table.selectedRows,
                                deleteItem = [];
                            if (selectRows.length <= 0) {
                                Modal.alert("请先选择要删除的字段");
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
                                type: "field",
                                delete: deleteItem
                            };
                            Modal.confirm({
                                msg: '确定要删除吗？',
                                title: '温馨提示',
                                callback:  (flag)=> {
                                    flag && DVAjax.fieldManagerAjax({type: 'POST', data: para},(res) => {
                                        Modal.toast(res.msg);
                                        this.clearAjaxPara();
                                    }, );
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
        let cond = this.conditions;
        cond['fieldName'].set('');
        cond['caption'].set('');
        this.getAllConditionsData();
    }

    private _table: FastTable;

    private createPageTable() {
        let alignment = ['左对齐', '右对齐', '剧中'];
        this._table = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.tableCol],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.fieldEditor + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        let data = response.dataArr,
                            total = 0;
                        tools.isNotEmptyArray(data) && (total = response.head.total);
                        data.forEach((item) => {
                            item.noCopy = item.noCopy === 0 ? '否' : '是';
                            item.noEdit = item.noEdit === 0 ? '否' : '是';
                            item.noSort = item.noSort === 0 ? '否' : '是';
                            item.noSum = item.noSum === 0 ? '否' : '是';
                            item.readOnlyFlag = item.readOnlyFlag === 0 ? '否' : '是';
                            item.allowScan = item.allowScan === 0 ? '否' : '是';
                            item.imeCare = item.imeCare === 0 ? '否' : '是';
                            item.imeOpen = item.imeOpen === 0 ? '否' : '是';
                            item.requieredFlag = item.requieredFlag === 0 ? '否' : '是';
                            item.alignment = alignment[item.alignment];
                        });
                        return {data: data, total: total};
                    });
                },
                auto: true,
                once: false
            },
            page: {
                size: 50,
                options: [50, 100, 200]
            }
        })
    }

    private editModal(isNew: boolean) {
        let modalBody = d.create(`
        <div class="field-modal">
        <div class="long-inputs"></div>
        <div class="checkbox-items"></div>
</div>
        `);
        let textInputArr = [
            {
                title: '字段名称*',
                id: 'fieldName'
            },
            {
                title: '字段标题*',
                id: 'caption'
            },
            {
                title: '对齐方式*',
                value: ['左对齐', '右对齐', '居中'],
                id: 'alignment'
            },
            {
                title: '数据类型',
                id: 'dataType'
            },
            {
                title: '链接资源',
                id: 'hyperRes'
            },
            {
                title: '输入提示',
                id: 'inputHint'
            },
            {
                title: '显示格式',
                id: 'displayFormat'
            },
            {
                title: '编辑格式',
                id: 'editFormat'
            },
            {
                title: "最大长度",
                id: 'maxLength'
            },
            {
                title: "最小长度",
                id: 'minLength'
            },
            {
                title: "显示宽度",
                id: 'displayWidth'
            },
            {
                title: "最大值",
                id: 'maxValue'
            },
            {
                title: "最小值",
                id: 'minValue'
            },
            {
                title: "默认值",
                id: 'defaultValue'
            },
            {
                title: '有效字符',
                id: 'validChars'
            },
            {
                title: '无效字符',
                id: 'invalidChars'
            },
            {
                title: '校验表达式',
                id: 'checkExpress'
            },
            {
                title: '校验信息',
                id: 'checkMessage'
            },
            {
                title: '真值表达',
                id: 'trueExpr'
            },
            {
                title: '假值表达',
                id: 'falseExpr'
            },
            {
                title: '数据类型标识',
                id: 'dataTypeFlag'
            },
            {
                title: '字段值的列表',
                id: 'valueLists'
            },
            {
                title: '字段值的列表类型',
                id: 'valueListType',
                className: 'valueListType'
            }
        ];

        textInputArr.forEach((value, index, arr) => {
            let shortInput = null;
            if (Array.isArray(value.value)) {
                shortInput = new DropDownModule({
                    container: d.query('.long-inputs', modalBody),
                    title: value.title,
                    data: value.value,
                    disabled: false,
                    dropClassName: value.id
                });
                d.query('.long-inputs', modalBody).appendChild(d.create('<div class="clear"></div>'));
            } else {
                shortInput = new TextInputModule({
                    container: d.query('.long-inputs', modalBody),
                    title: value.title,
                    className: tools.isNotEmpty(value.className) ? value.className : ''
                });
            }
            this.modalItems[value.id] = shortInput;
        });
        d.query('.long-inputs', modalBody).appendChild(d.create('<div class="clear"></div>'));

        let checkBoxArr = [
            {
                text: "*必输",
                id: 'requieredFlag'
            },
            {
                text: '*只读',
                id: 'readOnlyFlag'
            },
            {
                text: "*不可编辑",
                id: 'noEdit'
            },
            {
                text: "*不可复制",
                id: 'noCopy'
            },
            {
                text: "*不可排序",
                id: 'noSort'
            },
            {
                text: '*操纵输入法',
                id: 'imeCare'
            },
            {
                text: '*打开输入法',
                id: 'imeOpen'
            },
            {
                text: "不可汇总",
                id: 'noSum'
            },
            {
                text: '允许扫描输入',
                id: 'allowScan'
            },
            {
                text: '多值标识',
                id: 'multiValueFlag'
            },
            {
                text: '命名规则标识',
                id: 'nameRuleFlag'
            },
            {
                text: '命名规则编号',
                id: 'nameRuleId'
            }
        ];
        checkBoxArr.forEach((value) => {
            let check = new CheckBox({
                text: value.text,
                container: d.query('.checkbox-items', modalBody)
            });
            this.modalItems[value.id] = check;
        });
        d.query('.checkbox-items', modalBody).appendChild(d.create('<div class="clear"></div>'));
        d.queryAll('label', modalBody).forEach((label) => {
            label.innerHTML = tools.highlight(label.innerText, '*', 'red');
        });
        d.queryAll('.select-box span', modalBody).forEach((span) => {
            span.innerHTML = tools.highlight(span.innerText, '*', 'red');
        });
        if (isNew === false) {
            if (!this.setModalBodyContent()) {
                return;
            }
        }
        let header = isNew ? '新增字段' : '修改字段';
        let modal = new Modal({
            body: modalBody,
            header: header,
            width: '600px',
            footer: {},
            onOk: () => {
                let editType = isNew ? 'insert' : 'update';
                let para = {
                    type: 'field'
                };
                let isOk = true;
                if (tools.isEmpty(this.modalItems['caption'].get().replace(/\s+/g, ''))) {
                    Modal.alert('字段名称不能为空!');
                    isOk = false;
                }
                if (isOk) {
                    if (tools.isEmpty(this.modalItems['fieldName'].get().replace(/\s+/g, ''))) {
                        Modal.alert('字段标题不能为空!');
                        isOk = false;
                    }
                }
                if (isOk) {
                    para[editType] = [this.getFormContent()];
                    DVAjax.fieldManagerAjax({type: 'POST', data: para}, function (res) {
                        Modal.toast(res.msg);
                        modal.destroy();
                    })
                }
            },
            onCancel: () => {
                Modal.confirm({
                    msg: '确认取消编辑?',
                    title: '温馨提示',
                    callback: (flag) => {
                        if (flag) {
                            modal.destroy();
                        }
                    }
                })
            }
        })

    }

    private _modalItems: obj;
    get modalItems() {
        if (!this._modalItems) {
            this._modalItems = {
                fieldName: null,
                caption: null,
                requieredFlag: null,
                inputHint: null,
                validChars: null,
                invalidChars: null,
                checkExpress: null,
                checkMessage: null,
                readOnlyFlag: null,
                noEdit: null,
                noCopy: null,
                noSum: null,
                noSort: null,
                alignment: null,
                maxLength: null,
                minLength: null,
                displayWidth: null,
                displayFormat: null,
                editFormat: null,
                dataType: null,
                maxValue: null,
                minValue: null,
                defaultValue: null,
                imeCare: null,
                imeOpen: null,
                valueLists: null,
                valueListType: null,
                hyperRes: null,
                multiValueFlag: null,
                trueExpr: null,
                falseExpr: null,
                nameRuleFlag: null,
                nameRuleId: null,
                dataTypeFlag: null,
                allowScan: null
            }
        }
        return this._modalItems;
    }

    private setModalBodyContent(): boolean {
        let selectRows = this._table.selectedRows;
        if (selectRows.length <= 0) {
            Modal.alert('请先选择修改的字段');
            return false;
        } else if (selectRows.length > 1) {
            Modal.alert('请只选择一个字段');
            return false;
        } else {
            let cells = selectRows[0].cells;
            let obj = {};
            let arr = ['noCopy', 'noSort', 'noSum', 'noEdit', 'readOnlyFlag', 'allowScan', 'requiredFlag', 'imeCare', 'imeOpen', 'multiValueFlag', 'nameRuleFlag', 'nameRuleId'];
            cells.forEach((cell) => {
                if (arr.indexOf(cell.name) !== -1) {
                    obj[cell.name] = (cell.text === '否' || tools.isEmpty(cell.text) || cell.text === '0') ? 0 : 1;
                } else {
                    obj[cell.name] = cell.text;
                }
            });
            for (let key in this.modalItems) {
                if (obj.hasOwnProperty(key)) {
                    this.modalItems[key].set(obj[key]);
                }
            }
            return true;
        }
    }

    private getFormContent(): obj {
        let obj = {},
            alignment = ['左对齐', '右对齐', '剧中'];
        for (let key in this.modalItems) {
            obj[key] = this.modalItems[key].get();
            if (typeof obj[key] === 'boolean') {
                obj[key] = obj[key] ? 1 : 0;
            }
            if (tools.isEmpty(obj[key])) {
                obj[key] = 0;
            }
        }
        return obj;
    }
}