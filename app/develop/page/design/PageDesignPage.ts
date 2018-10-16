/// <amd-module name="PageDesignPage"/>
import SPAPage = G.SPAPage;
import d = G.d;
import tools = G.tools;
import config = DV.CONF;

import {DropDownModule} from "../../module/dropDown/DropDownModule";
import {Button} from "../../../global/components/general/button/Button";
import {FastTable, IFastTableCol} from "../../../global/components/newTable/FastTable";
import {TextInputModule} from "../../module/textInput/TextInputModule";
import {DVAjax} from "../../module/util/DVAjax";
import SPA = G.SPA;
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {MountMenuModal} from "../../module/mountMenu/MountMenu";
import {TextInput} from "../../../global/components/form/text/text";

export class PageDesignPage extends SPAPage {

    protected wrapperInit() {
        return d.create(`
        <div class="pageDesign">
            <div class="conditions">
                
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

    init(para, data) {
        this.title = "页面设计";
        this.initConditions();
        this.initBtn();
        this.initTable();
    }


    private conditions: obj;

    private initConditions() {
        let itemIdText = '';
        let itemId = new TextInputModule({
            container: d.query('.conditions', this.wrapper),
            title: '页面编码',
            disabled: false,
        });

        itemId.textInput.on('blur', (e) => {
            let inputValue = (e.target as HTMLFormElement).value.replace(/\s+/g, '');
            if (inputValue === itemIdText) {
                return;
            }
            this.queryByConditions();
            itemIdText = inputValue;
        });
        let captionSqlText = '';
        let captionSql = new TextInputModule({
            container: d.query('.conditions', this.wrapper),
            title: '标题',
            disabled: false,
        });
        captionSql.textInput.on('blur', (e) => {
            let inputValue = (e.target as HTMLFormElement).value.replace(/\s+/g, '');
            if (inputValue === captionSqlText) {
                return;
            }
            this.queryByConditions();
            captionSqlText = inputValue;
        });

        let itemType = new DropDownModule({
            container: d.query('.conditions', this.wrapper),
            title: '页面类型',
            disabled: false,
            data: ['请选择', '目录', '查询器', '自定义'],
            changeValue: (val) => {
                this.queryByConditions();
            }
        });

        let dataSource = new DropDownModule({
            container: d.query('.conditions', this.wrapper),
            title: '数据源',
            disabled: false,
            changeValue: (val) => {
                this.queryByConditions();
            }
        });
        this.conditions = {
            itemId: itemId,
            dataSource: dataSource,
            itemType: itemType,
            captionSql: captionSql
        };
        DVAjax.dataSourceQueryAjax(function (res) {
            res.unshift('请选择');
            dataSource.dpData = res;
        });
        d.query('.conditions', this.wrapper).appendChild(d.create('<div class="clear"></div>'));
    }

    private initBtn() {
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
            },
            {
                name: '预览',
                iconPre: 'dev',
                icon: 'de-yulan'
            }
        ];
        btnArr.forEach((btn, index) => {
            new Button({
                content: btn.name,
                iconPre: btn.iconPre,
                icon: btn.icon,
                container: d.query('.buttons', this.wrapper),
                onClick: () => {
                    let selectedRow = this.table.selectedRows;
                    switch (index) {
                        case 0: {
                            // 新增
                            let modalBody = d.create(`<div class="modalBody"></div>`);
                            new Button({
                                content: '新增查询器',
                                container: modalBody,
                                onClick: (e) => {
                                    SPA.close(SPA.hashCreate('develop', 'queryDevice'));
                                    SPA.open(SPA.hashCreate('develop', 'queryDevice'));
                                    modal.destroy();
                                }
                            });
                            new Button({
                                content: '新增目录',
                                container: modalBody,
                                onClick: (e) => {
                                    SPA.close(SPA.hashCreate('develop', 'menuDevelop'));
                                    SPA.open(SPA.hashCreate('develop', 'menuDevelop'));
                                    modal.destroy();
                                }
                            });
                            let modal = new Modal({
                                body: modalBody,
                                top: 150
                            })
                        }
                            break;
                        case 1: {
                            // 修改
                            if (selectedRow.length <= 0) {
                                Modal.alert('请先选择需要修改的Item');
                            } else if (selectedRow.length > 1) {
                                Modal.alert('请只选择一条数据修改');
                            } else {
                                let route = '';
                                if (selectedRow[0].cells[1].text === 'list') {
                                    route = 'queryDevice';
                                } else if (selectedRow[0].cells[1].text === 'menu') {
                                    route = 'menuDevelop';
                                }else{
                                    Modal.alert('暂不支持CUSTOM类型的修改！');
                                    return;
                                }
                                SPA.close(SPA.hashCreate('develop', route));
                                SPA.open(SPA.hashCreate('develop', route), [selectedRow[0].cells[0].text]);
                            }
                        }
                            break;
                        case 2: {
                            // 删除
                            if (selectedRow.length <= 0) {
                                Modal.alert("请先选择要删除的ITEM");
                                return;
                            }
                            let deleteObj = this.jageDeleteItem(),
                                type = deleteObj.type;
                            if (!deleteObj.isDelete) {
                                Modal.alert('批量删除请选择统一类型的ITEM');
                                return;
                            }
                            let para = {
                                type: type,
                                delete: deleteObj.deleteData
                            };
                            Modal.confirm({
                                msg: '确定要删除吗？',
                                title: '温馨提示',
                                callback: (flag) => {
                                    flag && DVAjax.itemDelete((res) => {
                                        Modal.toast(res.msg);
                                        this.clearTableAjaxData();
                                    }, {type: 'POST', data: para}, type);
                                }
                            })
                        }
                            break;
                        case 3: {
                            if (selectedRow.length <= 0) {
                                Modal.alert('请先选择需要预览的Item');
                            } else if (selectedRow.length > 1) {
                                Modal.alert('请只选择一个item进行预览');
                            }else{
                                let itemId = selectedRow[0].cells[0].text,
                                    itemType = selectedRow[0].cells[1].text,
                                    itemCaption = selectedRow[0].cells[2].text;
                                if (itemType === 'custom'){
                                    Modal.alert('抱歉，暂不支持CUSTOM类型预览！');
                                    return;
                                }
                                if (tools.isNotEmpty(itemId)){
                                    DVAjax.itemInterface(itemId,(res) => {
                                        if (res.errorCode === 0) {
                                            let body = d.create('<div class="inputModal"></div>'),
                                                loginUrl = res.data.sso.loginUrl,
                                                nodeId = res.data.nodeId,
                                                userInput = new TextInput({
                                                    container: body,
                                                    className: 'userInput',
                                                    placeholder: '请输入用户名'
                                                });
                                            let m = new Modal({
                                                header: '请输入预览登录用户名',
                                                body: body,
                                                footer: {},
                                                isOnceDestroy: true,
                                                onOk: () => {
                                                    let userId = userInput.get().replace(/\s+/g, '');
                                                    if (tools.isEmpty(userId)) {
                                                        Modal.alert('登录用户名不能为空!');
                                                    } else {
                                                        let url = tools.url.addObj(loginUrl, {
                                                            userid: userId.toUpperCase(),
                                                            forwardurl: 'commonui/pageroute?page=static%2Fmain'
                                                        });
                                                        url = url + `#page=/ui/select/${nodeId}`;
                                                        window.open(url);
                                                        m.destroy();
                                                    }
                                                },
                                                onCancel: () => {
                                                    m.destroy();
                                                }
                                            })
                                        }
                                    },(error)=>{
                                        let errorRes = JSON.parse(error.xhr.responseText);
                                        console.log(errorRes)
                                        Modal.confirm({
                                            msg:errorRes.msg,
                                            title:'预览提示',
                                            btns:['取消预览','挂载菜单'],
                                            callback:(flag)=>{
                                                if (flag){
                                                    new MountMenuModal(itemId,itemCaption);
                                                }
                                            }
                                        })
                                    })
                                }else{
                                    Modal.alert('ITEM不存在，请重新选择！');
                                }
                            }
                        }
                            break;
                        default:
                            break
                    }
                }
            })
        })
    }

    private jageDeleteItem(): obj {
        let selectRows = this.table.selectedRows,
            len = selectRows.length,
            fItemType = '',
            deleteData = [];
        for (let i = 0; i < len; i++) {
            let row = selectRows[i],
                itemType = row.cells[1].text;
            if (i === 0) {
                fItemType = itemType;
            } else {
                if (fItemType !== itemType) {
                    return {
                        type: '',
                        isDelete: false,
                        deleteData: []
                    };
                }
            }
            let item = {};
            row.cells.forEach((cell) => {
                if (cell.name.indexOf('Flag') !== -1 || cell.name === 'pause') {
                    item[cell.name] = cell.text === '否' ? 0 : 1;
                } else {
                    item[cell.name] = cell.text;
                }
            });
            deleteData.push(item);
        }
        return {
            type: fItemType,
            isDelete: true,
            deleteData: deleteData
        };
    }

    private _itemCols: IFastTableCol[];
    get itemCols() {
        if (tools.isEmpty(this._itemCols)) {
            this._itemCols = [
                {name: 'itemId', title: '页面编码'},
                {name: 'itemType', title: '页面类型'},
                {name: 'captionSql', title: '标题'},
                {name: 'dataSource', title: '数据源'},
                {name: 'keyField', title: '主键字段'},
                {name: 'pause', title: '是否启用'}
            ]
        }
        return this._itemCols;
    }

    private table: FastTable;

    private initTable() {
        d.query('.table', this.wrapper).innerHTML = '';
        this.table = new FastTable({
            container: d.query('.table', this.wrapper),
            cols: [this.itemCols],
            pseudo: {
                type: 'checkbox'
            },
            ajax: {
                fun: ({current, pageSize, isRefresh}) => {
                    let queryStr = `{"index"=${current + 1} , "size"=${pageSize},"total"=1}`;
                    queryStr = encodeURIComponent(queryStr);
                    let url = config.ajaxUrl.itemQuery + '?pageparams=' + queryStr;
                    url = url + this.handlerAjaxPara();
                    return DVAjax.Ajax.fetch(url).then(({response}) => {
                        // let data: obj[] = tools.isNotEmpty(response.dataArr) ? response.dataArr : [response.data],
                        let data: obj[] = response.dataArr,
                            total = 0;
                        data.forEach((item) => {
                            item.pause = item.pause === 0 ? '否' : '是';
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
                options: [50, 100]
            }
        });
    }


    private _ajaxPara: obj;
    set ajaxPara(para: obj) {
        this._ajaxPara = para;
        this.table && this.table._clearAllSelectedCells();
        this.table && this.table.tableData.refresh();
    }

    get ajaxPara() {
        if (!this._ajaxPara) {
            this._ajaxPara = {
                item_id: '',
                data_source: '',
                item_type: '',
                caption_sql: ''
            }
        }
        return this._ajaxPara;
    }

    private clearTableAjaxData() {
        let cond = this.conditions;
        cond['captionSql'].set('');
        cond['itemId'].set('');
        cond['itemType'].set('');
        cond['dataSource'].set('请选择');
        this.queryByConditions();
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

    private queryByConditions() {
        let items = this.conditions,
            captionSql = '',
            dataSource = '',
            itemType = '',
            itemId = '';
        if (tools.isNotEmpty(items)) {
            captionSql = items['captionSql'].get().replace(/\s+/g, '');
            dataSource = items['dataSource'].get().replace(/\s+/g, '');
            itemType = items['itemType'].get().replace(/\s+/g, '');
            itemId = items['itemId'].get().replace(/\s+/g, '');
            let typeObj = {
                "自定义": 'custom',
                "目录": 'menu',
                "查询器": 'list',
                "请选择": ''
            };
            itemType = typeObj[itemType];
        }
        dataSource = dataSource === '请选择' ? '' : dataSource;
        let obj = {
            item_id: itemId,
            data_source: dataSource,
            item_type: itemType,
            caption_sql: captionSql
        };
        this.ajaxPara = obj;
    }
}