/// <amd-module name="BwTableEditModule"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DetailItem} from "../detailModule/detailItem";
import {EditModule} from "../edit/editModule";
import d = G.d;
import tools = G.tools;
import {BwTableModule} from "./BwTableModule";

interface IBwTableEditPara{
    fields: R_Field[];
    container: HTMLElement;
    defaultData?: obj;
    title?: string;
    bwTable: BwTableModule;
}

export class BwTableEditModule {
    protected bwTable: BwTableModule;
    protected modal: Modal;
    protected fields: R_Field[];
    protected container: HTMLElement;
    protected wrapper: HTMLElement;
    protected editModule: EditModule;
    onFinish: (data: obj) => void;

    constructor(para: IBwTableEditPara){
        this.wrapper = <div className="detail-content"/>;
        this.container = para.container;
        this.bwTable = para.bwTable;
        this.fields = para.fields;
        this.editModule = new EditModule({
            auto: true,
            type: 'table',
            fields: para.fields.map((field) => {
                let el = BwTableEditModule.initItem(field);
                el && d.append(this.wrapper, el);
                return {
                    dom: el ? d.query('.detail-item-content', el) : null,
                    field: field
                }
            }),
            container: this.container,
            cols: this.fields,
            defaultData: para.defaultData || {}
        });

        this.initStatus();

        this.modal = new Modal({
            header: para.title || '编辑',
            isMb: tools.isMb,
            className: 'detail-edit-modal',
            isShow: true,
            height: tools.isMb ? void 0 : '80%',
            width: tools.isMb ? void 0 : '80%',
            body: this.wrapper,
            // container: this.container,
            closeMsg: '确定取消编辑吗?',
            onClose: () => {

            },
            footer: {
                leftPanel: [
                    {
                        content: '取消',
                        className: 'modal-btn edit-cancel',
                        onClick: () => {
                            this.modal.modalHidden();
                        }
                    }
                ],
                rightPanel: [
                    {
                        content: '确定',
                        className: 'modal-btn eidt-confirm',
                        type: 'primary',
                        onClick: () => {
                            this.onFinish && this.onFinish(this.get());
                        }
                    }
                ]
            }
        })
    }

    initStatus(isInsert = false){
        this.fields.forEach(field => {
            let isEdit = isInsert ? !field.noModify : !field.noEdit,
                com = this.editModule.getDom(field.name);
            com.disabled = false;
            if(!isEdit && com){
                com.disabled = true;
                tools.isMb && com.wrapper && com.wrapper.addEventListener('click', () => {
                    Modal.toast(field.caption + '不可编辑');
                });
            }
        });
    }

    set modalShow(flag: boolean){
        this.modal && (this.modal.isShow = flag);
    }

    set(data: obj){
        let lookUpData = this.bwTable.lookUpData;
        this.fields.forEach((field) => {
            let name = field.name,
                com = this.editModule.getDom(name);

            if(com){
                if(field.elementType === 'lookup' && field.lookUpKeyField in data){
                    let options = lookUpData[name] || [];
                    for (let opt of options) {
                        if (opt.value == data[field.lookUpKeyField]) {
                            com.set(opt || '');
                        }
                    }
                }else if(name in data){
                    com.set(data[name] || '');
                }
            }
        });
    }

    clear(){
        this.editModule.clear();
    }

    get(){
        return this.editModule.get();
    }

    static initItem(field: R_Field){
        let name = field.name,
            title = field.caption,
            isShow = !field.noShow,
            dataType = field.dataType || field.atrrs.dataType;

        let className = DetailItem.isBlock(dataType) ? 'col-xs-12' :' col-xs-12 col-md-4 col-sm-6';
        if(tools.isMb){
            className = 'col-xs-12'
        }

        return isShow ? <div className={"detail-item " + className} data-name={name}>
            <div className="detail-item-title">{title}</div>
            <div className="detail-item-content"/>
        </div> : null;
    }

    destroy(){

    }

}

