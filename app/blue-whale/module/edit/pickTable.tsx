/// <amd-module name="PickTable"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTable} from "../../../global/components/newTable/FastTable";
import tools = G.tools;

export interface IPickTablePara {
    title?: string;
    meta: string[];
    fields: R_Field[];
    data: obj[];
    onDataGet?: (obj: obj[]) => void;
    multi?: boolean;
    container?: HTMLElement;
}

export class PickTable {
    protected wrapper: HTMLElement;
    protected modal: Modal;
    protected table: FastTable;
    protected onDataGet: (obj: obj[]) => void;
    constructor(para: IPickTablePara){
        this.wrapper = <div/>;

        this.onDataGet = para.onDataGet;

        this.initModal(para);
        this.initTable(para);

    }

    protected initModal(para: IPickTablePara){
        this.modal = new Modal({
            body: this.wrapper,
            header: para.title || '选择框',
            className: 'pick-table-modal',
            width: '500px',
            height: '80%',
            isBackground: false,
            footer: {},
            top: 40,
            isMb: false,
            onClose: () => {
                setTimeout(() => {
                    this.destroy();
                }, 300);
            },
            container: para.container || document.body
        });
        this.modal.onOk = () => {
            this.getData();
        };
    }

    protected initTable(para: IPickTablePara){
        let meta = para.meta,
            field: R_Field[] = meta.map((name) => {
                return para.fields.filter((col) => {
                    return col.name = name;
                })[0]
            });
        this.table = new FastTable({
            cols: [field],
            data: para.data,
            container: this.wrapper,
            pseudo: {
                type: 'number',
                isAll: false,
                multi: para.multi || false // 默认单选
            },
            sort: true,
            maxWidth: 200,
            isResizeCol: tools.isPc,
            tabIndex: true,
            clickSelect: true
        });
    }

    protected getData(){
        if(this.table) {
            let data = this.table.selectedRowsData;
            console.log(data);
            if(data.length === 0){
                this.onDataGet && this.onDataGet(data);
                this.modal.isShow = false;
            }else{
                Modal.alert('没有获取到数据') ;
            }
        }else{
           Modal.alert('没有获取到数据') ;
        }
    }

    destroy(){
        this.table.destroy();
        this.modal.destroy();
        this.table = null;
        this.wrapper = null;
        this.modal = null;
    }
}