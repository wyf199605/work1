/// <amd-module name="ItemList"/>
import tools = C.tools;
import d = C.d;
import {Com} from "../../com";
import Rule = C.Rule;
import {CashierRequest} from "../../request/CashierRequest";
import {TableLite} from "../../global/tableLite/TableLite";
interface ItemListPara extends IProps{
    // type? : number   //1扫描枪；2键盘输入；3键盘选择 4键盘输入后进行扫描
    loadData?: number;
    nextField?: obj;
    table?: TableListPara;
    hasEvent?: boolean;
    afterInit?(): void;
}

/**
 * 表格模块
 * 1.tableLite 常规表格型
 * 2.非tableLite 数据类型与表格一致，展示方法非表格形式。
 */
let allTableLite: TableLite[] = []; // 存储所有表格

export class ItemList{
    public mainTable: TableLite;
    public props: ItemListPara;
    public data: obj;
    private hasEvent: boolean;

    constructor(para: ItemListPara) {
        this.props = para;
        let tag = para.data.tag;
        this.hasEvent = typeof para.hasEvent === 'undefined' ? [1, 3, 5, 7].includes(tag) : para.hasEvent;

        // 加载表格数据
        this.ajaxLoad((response) => {
            let data = response.data;
            this.initTable(data ? data : []);
            let text = response.showText;

            tools.isNotEmpty(text) && this.logTip(text);
        });


    }
    private _tipEl: HTMLElement;
    private logTip(str: string) {
        if (!this._tipEl) {
            this._tipEl = d.query('.reminder-msg', document);
        }
        this._tipEl.innerHTML = str;
    }

    /**
     * 表格上下按键选中
     * @param e
     */
    private trSelect = (e) => {
        e.preventDefault();
        let code =  e.keyCode || e.which || e.charCode;
        if([37, 38, 39, 40, 98, 99, 104, 110].includes(code)){
            let table = this.props.dom,
                select = d.query('.tr-select', table);
            if(!select){
                let tr = d.query('tr[data-index="0"]', table);
                tr && tr.classList.add('tr-select');
                return;
            }
            let index = parseInt(select.dataset.index),
                selectHeight = select.offsetHeight,
                head = d.query('thead', table),
                headHeight = head.offsetHeight, // head高度
                minus = select.offsetTop - table.scrollTop + headHeight + selectHeight,
                sum = headHeight + 2 * selectHeight + 10,
                nextIndex, next;

            switch (code){
                case 98: // 数字键盘2下一条
                case 40: // ↓
                case 39: // →
                case 110: // 数字键盘'.'
                    nextIndex = index + 1;
                    if(minus <= table.offsetHeight){
                        selectHeight = 0;
                    }
                    break;
                case 104: // 数字键盘8上一条
                case 99: // 数字键盘3
                case 38: // ↑
                case 37:  // ←
                    nextIndex = index - 1;
                    if(minus < sum){
                        selectHeight = - selectHeight + 0.5;
                    }else {
                        selectHeight = 0;
                    }
                    break;
                default:
                    return;
            }

            next = d.query('tr[data-index ="' + nextIndex +'"]',table);
            table.scrollTop += selectHeight;
            head.style.transform = `translateY(${table.scrollTop}px)`;
            if(next){
                select.classList.remove('tr-select');
                next.classList.add('tr-select');
            }
        }
    };

    /**
     * 初始化表格
     * @param tableData
     */

    wrapper : HTMLElement;
    private initTable(tableData){
        let num = 0, sum = 0,
            data = this.props.data;
        this.wrapper = d.create(`<table class="table-container"></table>`);
        this.props.dom.appendChild(this.wrapper);

        // 售货员一栏三个表格宽度计算
        if(data.uiTmpl === 'sale-info'){
            data.tabeList.forEach(table => {
                table.cols.forEach(col => {
                    if(!col.noShow){
                        sum ++;
                    }
                })
            });
            this.props.table.cols.forEach(obj => {
                if(!obj.noShow){
                    num ++;
                }
            });

            this.wrapper.style.width = num/sum*100 + '%';
        }

        // 应收一栏初始化添加一行空数据
        if(data.uiTmpl === 'sale-count' && !tableData[0]){
            tableData.push({});
            this.props.table.cols.forEach(c => {
                tableData[0][c.fieldName] = '';
            })

        }


        let tag = data.tag;
        tools.isEmpty(tag) && (tag = 0);
        this.mainTable = new TableLite({
            cols: this.props.table.cols,
            table: <HTMLElement>this.wrapper,
            data:  tableData,
            hasNumber : [4,5,6,7].includes(tag),
            onChange : (newField : string, col : TableLiteColPara, data, tr) => {
                tools.isNotEmpty(newField) && this.assign(col, data, tr);
            },
            toFixed : (field : string | number, col : TableLiteColPara) => {
                let toFixed = col && col.toFixed;
                if(tools.isNotEmpty(toFixed)){
                    if(typeof field === 'string'){
                        field = Number(field);
                    }
                    let pow = Math.pow(10, toFixed);
                    field = Math.round(field * pow)/pow + '';
                }
                return <string>field;
            },
            showField : (showField : string | number, col : TableLiteColPara) => {
                let format = col.displayFormat;
                if(Rule.isNumber(col.dataType) && typeof showField === 'string' && format){
                    showField = Number(showField)
                }
                return Rule.formatText(showField, {
                    dataType : col.dataType,
                    displayFormat : format ? format : ''
                }, true, true);
            }
        });

        // 记录所有可以上下选择的表格，焦距当前表格，开启按键事件
        if(this.hasEvent){
            allTableLite.push(this.mainTable);
            this.mainTable.wrapper.focus();
            this.on();
        }


        if([0,1,4,5].includes(tag)){
            // 菜单
            this.wrapper.classList.add('menu-bar');
        }else{
            // 表格
            this.wrapper.parentElement.classList.add('has-table');
            if([1,3,5,7].includes(tag)) {
                this.mainTable.select(0);
            }
        }
        Com.count(data.dataRules, data.panelId);

        this.props.afterInit && this.props.afterInit();
    }

    /**
     * 表格列字段值改变时候触发
     * @param col
     * @param data
     * @param tr
     */
    private assign(col : TableLiteColPara, data, tr : HTMLElement){
        let assignAddr = col.assignAddr;
        if(!assignAddr){
            return;
        }
        assignAddr['data'] = data;
        CashierRequest(<R_ReqAddr>assignAddr).then(({response}) => {
            let newField,
                resData = response.data && response.data[0],
                fields = col.assignSelectFields || [];

            fields.forEach(field => {
                newField = null;
                for(let item in resData){
                    if(item === field){
                        newField = resData[item];
                    }
                }
                newField && this.mainTable.resetData(field, newField, tr.dataset.index);

                // 写死，当实售价发生变化时候触发dataRule
                if(field === 'REALPRICE'){
                    let name = this.wrapper.parentElement.dataset.name,
                        data = Com.data[name],
                        dataRules = data && data.dataRules,
                        panelId = data && data.panelId;
                    dataRules && Com.count(dataRules, panelId, newField);
                }
            });
        });
    }

    /**
     * 表格数据获取
     * @param cb
     */
    private ajaxLoad(cb){
        let data = this.props.data;
        if(!data || !data.tabeList){
            return;
        }
        let table = this.props.table,
            addr = table.dataAddr,
            nextField = this.props.nextField;

        tools.isNotEmpty(nextField) && (addr['data'] = nextField);
        if(table.loadData === 0){
            cb([]);
            return;
        }
        return CashierRequest(addr).then(({response}) => {
            cb(response);
        });

    }


    getData() : obj[]{
        return this.mainTable && this.mainTable.get().data;
    }

    on() {
        d.on(this.mainTable.wrapper, 'keydown', this.trSelect);
    }

    off(){
        d.off(this.mainTable.wrapper, 'keydown', this.trSelect)
    }

    select(index : number){
        this.mainTable.select(index);
    }

    getSelect(){
        return this.mainTable && this.mainTable.getSelect();
    }

    resetData(name:string, newField:string, index? : string | number){
        this.mainTable.resetData(name, newField, index + '');
    }

    addByData(data : obj | obj[]){
        if(Com.mainItemList === this){
            let confData : IPrintConfPara = Com.local.getItem('printerConf'),
                row = confData && tools.isNotEmpty(confData.row) ? confData.row : 10;
            if(tools.isNotEmpty(row) && row !== 0){
                let len = Com.mainItemList.getData().length;
                if(len >= row){
                    Com.logTip('超出数据固定行数，无法添加商品数据。', true);
                    return;
                }
            }
        }
        this.mainTable.addByData(data);
        this.tableSelect();
    }

    tableSelect(){
        let tag = this.props.data.tag;
        if([1,3,5,7].includes(tag)){
            let d = this.mainTable.get().data;
            this.mainTable.select(d && d.length - 1);
        }
    }

    refresh(data? : obj[], isChange = true){
        if(!data){
            return;
        }
        this.mainTable.refresh(data, isChange);
        this.tableSelect();
    }

    emptied(){
        this.mainTable.emptied();

        // 表头位置复原
        if(this.props.data.uiTmpl === 'sale-table'){
            let head = d.query('thead', this.props.dom);
            head.style.transform = `translateY(0px)`;
        }

        // 应收一栏清空时候默认添加一行空数据
        if(this.props && this.props.data && this.props.data.uiTmpl === 'sale-count'){
            let para = Com.countItemList.get(), tableData = [{}];
            para.cols.forEach(c => {
                tableData[0][c.fieldName] = '';
            });
            Com.countItemList.addByData(tableData);
        }
    }

    get (){
        return this.mainTable.get();
    }

    destroy() {
        if(this.hasEvent){
            allTableLite = allTableLite.filter(km => km !== this.mainTable);
        }

        let last = allTableLite[allTableLite.length - 1];
        last && last.wrapper.focus();

        this.mainTable = null;
    }

}