/// <amd-module name="DetailEditModule"/>

import {DetailModule} from "./detailModule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DetailItem} from "./detailItem";
import {EditModule} from "../edit/editModule";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;

export interface IDetailEditModulePara{
    detail: DetailModule;
    editParam: IBW_TableAddrParam;
    url: string;
    caption?: string;
    editType: 'current' | 'modal';
}

export class DetailEditModule{

    protected detail: DetailModule;
    protected editModule: EditModule;
    protected items: DetailItem[];
    protected url: string;
    protected editParam: IBW_TableAddrParam;
    protected editType: 'current' | 'modal';
    protected caption: string;

    constructor(para: IDetailEditModulePara){
        this.detail = para.detail;
        this.url = para.url;
        this.caption = para.caption || '';
        this.editParam = para.editParam;
        this.editType = para.editType || 'current';

        switch (this.editType){
            case 'modal':
                this.items = this.detail.initItems(this.modal.bodyWrapper);
                break;
            case 'current':
            default:
                this.items = this.detail.items;
                break;
        }
    }

    protected initCom(){
        let fields = this.items.map(({custom}) => custom),
            data = this.detail.detailData,
            editModule = this.editModule = new EditModule({
                auto: false,
                type: 'table',
                fields: fields.map(({custom}) => {
                    return {
                        dom: null,
                        field: custom
                    }
                }),
                container: this.detail.container,
                cols: fields
            });
        this.items.forEach((item) => {
            item.edit.init((field, item) => {
                let com = editModule.init(field.name, {
                    dom: item.contentEl,
                    data: data,
                    field,
                    onExtra: (data, relateCols, isEmptyClear = false) => {
                        if (tools.isEmpty(data) && isEmptyClear) {
                            // table.edit.modifyTd(td, '');
                            com.set('');
                            return;
                        }
                        for (let key in data) {
                            let hCom = editModule.getDom(key);
                            if (hCom && hCom !== com) {
                                let cellData = data[key];
                                if (hCom.get() != cellData) {
                                    hCom.set(cellData || '');
                                }
                            }
                        }
                    }
                });
                return com;
            })
        });
    }

    start(){
        if(tools.isEmpty(this.detail)){
            return
        }
        let data = this.detail.detailData;
        this.initCom();
        this.editModule.set(data);
        this.items.forEach((item) => {
            let field = item.custom;
            if(field.elementType === 'lookup'){
                let options = this.detail.lookUpData[field.name] || [];
                for (let opt of options) {
                    if (opt.value == data[field.lookUpKeyField]) {
                        let com = this.editModule.getDom(field.name);
                        com && com.set(opt.value);
                    }
                }
            }
        });
    }

    save(){
        if (this.editType === 'modal') {
            this.modal.isShow = true;
        }
        return this.fetch('edit');
    }

    insert(){
        switch (this.editType){
            case 'modal':
                this.modal.isShow = true;
                return this.fetch('insert');
            default:
                let detailEdit =  new DetailEditModule({
                    url: this.url,
                    editParam: this.editParam,
                    detail: this.detail,
                    caption: this.caption,
                    editType: 'modal',
                });

                return detailEdit.insert().finally(() => {
                    detailEdit.destroy();
                    detailEdit = null;
                });
        }
    }

    del(){
        Modal.confirm({
            msg: '确定要删除吗？',
            callback: (flag) => {
                if(flag){
                    this.fetch('delete');
                }
            }
        })
    }

    protected fetch(type: 'insert' | 'edit' | 'delete'): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            let editModule = this.editModule,
                editData = this.getEditData(type),
                detail = this.detail;

            if(tools.isEmpty(editModule) || tools.isEmpty(editData) || tools.isEmpty(detail)){
                reject();
                return
            }

            editModule && editModule.assignPromise ? editModule.assignPromise.then(() => {
                let url = this.url,
                    saveData = {
                        param: [editData]
                    };

                BwRule.Ajax.fetch(CONF.siteUrl + url, {
                    type: 'POST',
                    data: saveData,
                    loading: {
                        msg: '保存中',
                        disableEl: detail.container
                    }
                }).then(() => {
                    detail.refresh();
                    resolve();
                }).catch(e => {
                    reject(e);
                })
            }) : reject();
        })

    }

    protected getEditData(type: 'insert' | 'edit' | 'delete'): obj{
        let editModule = this.editModule;
        if(tools.isEmpty(this.editModule) || tools.isEmpty(this.detail)){
            return null;
        }
        let data = Object.assign({}, this.detail.detailData, this.detail.linkedData, editModule.get()),
            tableData = {
                [type]: [data]
            },
            varList: IBW_TableAddrParam = this.editParam;

        let paramData: obj = {};
        varList && ['update', 'delete', 'insert'].forEach(key => {
            let dataKey = varList[`${key}Type`];
            if (varList[key] && tableData[dataKey][0]) {
                let data = BwRule.varList(varList[key], tableData[dataKey], true);
                if (data) {
                    paramData[key] = data;
                }
            }
        });

        if (!tools.isEmpty(paramData)) {
            paramData.itemId = varList.itemId;
        }
        return paramData;
    }

    cancel(){
        this.items && this.items.forEach((item) => {
            item.edit.cancel();
        });
        this.editModule = null;
        this._modal && (this._modal.isShow = false);
    }

    protected _modal: Modal;
    get modal(){
        if(this._modal){
            let modal = this._modal = new Modal({
                header:  this.caption + '编辑',
                isMb: tools.isMb,
                className: 'detail-modal',
                isModal: tools.isMb,
                isShow: false,
                body: <div/>,
                closeMsg: '确定取消编辑吗?',
                footer: {
                    leftPanel: [
                        {
                            content: '取消',
                            className: 'modal-btn edit-cancel',
                            onClick: () => {
                                modal && (modal.isShow = false);
                            }
                        }
                    ],
                    rightPanel: [
                        {
                            content: '确定',
                            className: 'modal-btn eidt-confirm',
                            type: 'primary',
                            onClick: () => {

                            }
                        }
                    ]
                }
            });
        }
        return this._modal;
    }

    destroy(){
        this._modal && this._modal.destroy();
        this.editModule && this.editModule.destroy();
        this.editModule = null;
        this._modal = null;
        this.detail = null;
        this.items = null;
        this.editParam = null;
    }

}