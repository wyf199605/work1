/// <amd-module name="BwTableEditModule"/>

import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DetailItem} from "../detailModule/detailItem";
import {EditModule} from "../edit/editModule";
import d = G.d;
import tools = G.tools;
import {BwTableModule} from "./BwTableModule";
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;

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

        this.modal = new Modal({
            header: para.title || '编辑',
            isMb: tools.isMb,
            container: this.container,
            className: 'detail-edit-modal',
            isShow: true,
            height: tools.isMb ? void 0 : '80%',
            width: tools.isMb ? void 0 : '80%',
            body: this.wrapper,
            closeMsg: '确定取消编辑吗?',
            onClose: () => {

            },
            footer: {
                rightPanel: [
                    {
                        content: '取消',
                        className: 'modal-btn edit-cancel',
                        onClick: () => {
                            this.modal.modalHidden();
                        }
                    },
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
        });

        this.editModule = new EditModule({
            auto: true,
            type: 'table',
            fields: para.fields.map((f) => {
                let el = BwTableEditModule.initItem(f);
                el && d.append(this.wrapper, el);
                return {
                    dom: el ? d.query('.detail-item-content', el) : null,
                    field: f,
                    onExtra: (data, relateCols, isEmptyClear = false) => {
                        let editModule = this.editModule,
                            com = editModule.getDom(f.name);
                        for(let key of relateCols){
                            let hCom = editModule.getDom(key);
                            if(hCom && hCom !== com){
                                let hField = hCom.custom as R_Field;
                                hCom.set(data[key] || '');

                                if (hField.assignSelectFields && hField.assignAddr) {
                                    BwRule.Ajax.fetch(CONF.siteUrl + BwRule.reqAddr(hField.assignAddr, this.get()), {
                                        cache: true,
                                    }).then(({response}) => {
                                        let res = response.data;
                                        if (res && res[0]) {
                                            hField.assignSelectFields.forEach((name) => {
                                                let assignCom = editModule.getDom(name);
                                                assignCom && assignCom.set(res[0][name]);
                                            });
                                            let data = this.get();
                                            this.fields.forEach((field) => {
                                                if(field.elementType === 'lookup'){
                                                    let lCom = editModule.getDom(field.name);
                                                    if(!data[field.lookUpKeyField]){
                                                        lCom.set('');
                                                    }else{
                                                        let options = this.bwTable.lookUpData[field.name] || [];
                                                        for (let opt of options) {
                                                            if (opt.value == data[field.lookUpKeyField]) {
                                                                lCom.set(opt.value);
                                                            }
                                                        }
                                                    }
                                                }
                                            })
                                        }

                                    })
                                }
                            }
                        }
                    }
                }
            }),
            container: this.container,
            cols: this.fields,
            defaultData: para.defaultData || {}
        });

        this.initStatus();
    }

    initStatus(isInsert = false, isModify = true){
        this.fields.forEach(field => {
            let isEdit = isInsert ? !field.noModify : !field.noEdit,
                com = this.editModule.getDom(field.name),
                wrapper = com.wrapper || com.container,
                parent = d.closest(wrapper, '.detail-item');
            parent && parent.classList.remove('disabled');
            if(isModify){
                com.disabled = false;
                if(!isEdit && com){
                    com.disabled = true;
                    tools.isMb && wrapper && wrapper.addEventListener('click', () => {
                        Modal.toast(field.caption + '不可编辑');
                    });
                    parent && parent.classList.add('disabled');
                }
            }else{
                com.disabled = true;
            }

        });
        if(this.modal)
            isModify ? (this.modal.closeMsg = '确定取消编辑吗?') : (this.modal.closeMsg = '');
    }

    set modalShow(flag: boolean){
        this.modal && (this.modal.isShow = flag);
    }

    set(data: obj){
        this.bwTable && this.bwTable.lookup.finally(() => {
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
                                break;
                            }
                        }
                    }else if(name in data){
                        com.set(data[name] || '');
                    }
                }
            });
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
        this.editModule && this.editModule.destroy();
        this.modal && this.modal.destroy();
        this.editModule = null;
        this.modal = null;
        this.bwTable = null;
        this.fields = null;
        this.container = null;
        this.wrapper = null;
        this.onFinish = null;
    }

}

