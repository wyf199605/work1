/// <amd-module name="PickTable"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {FastTable} from "../../../global/components/newTable/FastTable";
import tools = G.tools;
import {BwTableModule} from "../table/BwTableModule";

export interface IPickTablePara {
    title?: string;
    fields: R_Field[];
    data: obj[];
    onDataGet?: (obj: obj[]) => void;
    onClose?: () => void;
    multi?: boolean;
    container?: HTMLElement;
    isOnceDestroy?: boolean;
}

export class PickTable {
    protected wrapper: HTMLElement;
    protected modal: Modal;
    protected table: FastTable;
    protected onDataGet: (obj: obj[]) => void;
    protected onClose: () => void;
    protected isOnceDestroy: boolean = true;
    constructor(para: IPickTablePara){
        this.wrapper = <div class="pick-table-wrapper"/>;

        this.isOnceDestroy = tools.isEmpty(para.isOnceDestroy) ? true : para.isOnceDestroy;
        this.onDataGet = para.onDataGet;
        this.onClose = para.onClose;

        this.initModal(para);
        this.initTable(para);

    }

    protected initModal(para: IPickTablePara){
        let length = para.fields.filter((field) => !field.noShow).length,
            width = 200 + length * 100;
        width = Math.min(width, 1000);
        this.modal = new Modal({
            body: this.wrapper,
            header: para.title || '选择框',
            className: 'pick-table-modal',
            width: width + 'px',
            height: '75%',
            isBackground: false,
            footer: {},
            top: 40,
            isMb: false,
            onClose: () => {
                this.onClose && this.onClose();
            },
            container: para.container || document.body
        });
        this.modal.onOk = () => {
            this.getData();
        };
    }

    protected initTable(para: IPickTablePara){

        this.table = new FastTable({
            cols: BwTableModule.colParaGet(para.fields),
            data: para.data,
            container: this.wrapper,
            pseudo: {
                type: 'checkbox',
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
            if(data.length === 0){
                Modal.alert('没有选中任何数据', '温馨提示');
            }else{
                this.onDataGet && this.onDataGet(data);
                this.isOnceDestroy && this.destroy();
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