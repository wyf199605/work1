/// <amd-module name="TableLite"/>
import d = C.d;
import tools = C.tools;
interface TableLitePara {
    cols?:TableLiteColPara[];
    data?:obj[];
    table?:HTMLElement;
    hasNumber? : boolean;
    onChange?(field : string, col : TableLiteColPara, data, tr) : void
    toFixed?(field : string | number, col : TableLiteColPara) : string   // 四舍五入
    showField?(showField : string | number, col : TableLiteColPara) : void
}
interface TableLiteColPara{
    caption: string;
    fieldName : string;
    noShow? : boolean;
    toFixed? : number;
    required?: number;
    showField? : string
    dataType? : string;
    assignAddr? : obj;
    displayFormat : string
    assignSelectFields? : string[];
}
/**
 * 表格生成
 */
export class TableLite{
    private thead: HTMLTableSectionElement;
    private tbody: HTMLTableSectionElement;
    constructor(private para:TableLitePara){
        this.thead = document.createElement('thead');
        this.tbody = document.createElement('tbody');
        this.initThead();
        this.initTbody();

        this.wrapper = this.para.table;
        this.wrapper.tabIndex = parseInt(tools.getGuid(''));
    }

    wrapper: HTMLElement;

    private initThead(){
        if(this.para.hasNumber){
            let th = document.createElement('th');
            th.innerHTML = '序号';
            this.thead.appendChild(th);
        }
        Array.isArray(this.para.cols) && this.para.cols.forEach((col) => {
            let th = document.createElement('th');
            th.innerHTML = col.caption ? col.caption : '';
            th.dataset.col = col.fieldName ? col.fieldName : '';
            col.noShow && th.classList.add('hide'); // 列隐藏
            this.thead.appendChild(th);
        });

        this.para.table.appendChild(this.thead);
    }
    private initTbody(){
        let data = this.para.data;
        Array.isArray(data) && data.forEach((o,i)=>{
            this.row.addByData(o,i,true);
        });

        this.para.table.appendChild(this.tbody);

    }


    public row = (function (self) {

        let addByData = function(data: obj, i?, isInit = false, isChange = true){
            let plus = 0,sum = null, cols = self.para.cols, tableData = self.para.data;
            if(tools.isEmpty(i)){
                plus = tableData ? tableData.length : 0;
                sum = plus
            }else {
                sum = i + plus;
            }

            let tr = document.createElement('tr');
            tr.setAttribute('data-index', sum);
            // 序号
            if(self.para.hasNumber){
                let td = document.createElement('td');
                td.innerHTML = sum + 1;
                tr.appendChild(td);
            }
            Array.isArray(cols) && cols.forEach((col: TableLiteColPara) => {
                // debugger;
                let td = document.createElement('td'),
                    name = col.fieldName,
                    field = data[name];

                // 四舍五入
                field = self.para.toFixed(field, col);

                td.innerHTML = self.getShowFiled(field, col);
                td.setAttribute('data-name', name);
                col.noShow && td.classList.add('hide'); // 列隐藏
                tr.appendChild(td);
            });

            self.tbody.appendChild(tr);

            if(isChange){
                cols.forEach((col : TableLiteColPara) => {
                    self.para.onChange && self.para.onChange(data[col.fieldName], col, data, tr);
                });
            }

            !tableData && (tableData = []);
            !isInit && tableData.push(data);
        };
        let addByTr = function (tr:HTMLTableRowElement) {
            self.tbody.appendChild(tr);
        };
        return {
            addByData: addByData,
            addByTr: addByTr
        }
    }(this));


    /**
     * 显示在表格上的值，不保存该值，仅显示作用。
     * @param showField
     * @param col
     * @returns {string}
     */
    private getShowFiled(showField, col : TableLiteColPara){
        if(this.para.showField){
            showField = this.para.showField(showField, col);
        }
        return tools.isNotEmpty(showField) ? showField : '';
    }

    get() {
        return this.para;
    }


    getSelect(): obj{
        let trSelect = d.query('.tr-select', this.tbody),
            index = trSelect && trSelect.dataset.index;
        return this.para.data[index];
    }

    select(index : number){
        let select = d.query('.tr-select', this.tbody),
            tr = d.query('[data-index="'+ index +'"]', this.tbody);

        if(tr){
            if(select){
                select.classList.remove('tr-select');
            }
            tr.classList.add('tr-select');
        }

    }

    /**
     * 修改数据
     * @param name
     * @param newField
     * @param index
     */
    resetData(name : string, newField : string, index? : string | number){
        let col = null;
        this.para.cols.forEach(obj => {
            if(obj.fieldName === name){
                col = obj;
            }
        });
        if(!col){
            return;
        }
        // 四舍五入
        newField = this.para.toFixed(newField, col);

        let trSelect = tools.isNotEmpty(index) && d.query('tr[data-index="'+index+'"]', this.tbody),
            dataCol = d.queryAll('[data-name='+ name +']', trSelect ? trSelect : this.tbody);
        if(!trSelect){
            //表格无选中时，更改所有数据
            this.para.data.forEach((d) => {
                d[name] = newField;
            });
        }else {
            this.para.data[index][name] = newField;
        }

        dataCol.forEach((td:HTMLElement) => {
            let index = td.parentElement.dataset.index;
            td.innerHTML = this.getShowFiled(newField, col);
            this.para.onChange && this.para.onChange(newField, col, this.para.data[index], td.parentElement);
        });

        // console.log(this.para,'table')
    }

    /**
     * 刷新表格
     * @param data
     * @param isChange 是否触发change
     */
    refresh(data?, isChange = true){
        this.para.data = [];
        this.tbody.innerHTML = null;
        data.forEach(d => {
            this.row.addByData(d, null, false, isChange);
        });
    }

    addByData(data : obj | obj[]){
        if(Array.isArray(data)){
            data.forEach( d =>{
                this.row.addByData(d);
            })
        }else {
            this.row.addByData(data);
        }

    }

    /**
     * 清空数据
     */
    emptied(){
        this.para.data = [];
        this.tbody.innerHTML = null;
    }
}