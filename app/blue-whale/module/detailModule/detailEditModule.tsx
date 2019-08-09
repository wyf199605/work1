/// <amd-module name="DetailEditModule"/>

import {DetailModule} from "./detailModule";
import {Modal} from "../../../global/components/feedback/modal/Modal";
import {DetailItem} from "./detailItem";
import {EditModule} from "../edit/editModule";
import tools = G.tools;
import {BwRule} from "../../common/rule/BwRule";
import CONF = BW.CONF;
import d = G.d;

export interface IDetailEditModulePara {
    detail: DetailModule;
    editParam: IBW_TableAddrParam;
    url: string;
    field: R_Field[];
}

export class DetailEditModule {
    protected detail: DetailModule;
    protected editParam: IBW_TableAddrParam;
    protected url: string;
    protected editModule: EditModule;
    protected field: R_Field[];

    constructor(para: IDetailEditModulePara) {
        this.detail = para.detail;
        this.editParam = para.editParam;
        this.url = para.url;
        this.field = para.field;

        this.editModule = new EditModule({
            auto: false,
            type: 'table',
            fields: para.field.map((field) => {
                return {
                    dom: null,
                    field: field
                }
            }),
            container: this.detail.container,
            cols: para.field,
            defaultData: Object.assign({}, this.detail.ajaxData || {}, this.detail.detailData)
        });
    }

    get isUpdate() {
        return tools.isNotEmpty(this.editParam.update);
    }

    protected isEdit = false;

    protected createItem(type: 'current' | 'modal' = 'current') {
        let items: DetailItem[];
        switch (type){
            case 'modal':
                this.initModal();
                items = this.detail.initItems(d.query('.detail-content', this.modal.bodyWrapper));
                items.forEach((item) => {
                    item.edit.init((field, item) => this.initEditCom(field, item.contentEl));
                });
                break;
            case 'current':
            default:
                items = this.detail.items;
                items.forEach((item) => {
                    item.edit.init((field, item) => this.initEditCom(field, item.contentEl))
                });
                break;
        }
        return items;
    }

    initEditCom(field: R_Field, wrapper: HTMLElement){

        let com = this.editModule.init(field.name, {
            dom: wrapper,
            data: this.detail.detailData,
            field,
            onExtra: (data, relateCols, isEmptyClear = false) => {
                if (tools.isEmpty(data) && isEmptyClear) {
                    // table.edit.modifyTd(td, '');
                    com.set('');
                    return;
                }
                for (let key in data) {
                    let hCom = this.editModule.getDom(key);
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
    }

    isChanged(){
        let editData = this.editModule.get(),
            detailData = this.detail.detailData;

        return Object.keys(detailData).some((key) => {
            let detailItem = detailData[key],
                editItem = editData[key];
            if(!(key in detailData && key in editData)){
                return false;
            }
            if(tools.isEmpty(detailItem) && tools.isEmpty(editItem)){
                return false;
            }
            return detailData[key] != editData[key];
        })
    }

    protected editType: 'insert' | 'update' | 'delete';
    start(type: 'current' | 'modal' = 'current') {
        this.editType = 'update';
        this.isEdit = true;
        let data = this.detail.detailData,
            items = this.createItem(type);

        this.setData(data);
        items.forEach((item) => {
            let field = item.custom;
            if (field.elementType === 'lookup') {
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

    protected setData(data: obj){
        if(tools.isEmpty(this.editModule)){
            return;
        }
        for(let name in data){
            let com = this.editModule.getDom(name);
            if(com){
                let onSet = com.onSet;
                com.onSet = null;
                com.set(data[name]);
                com.onSet = onSet;
            }
        }
    }

    save() {
        return new Promise((resolve, reject) => {
            if (!this.isEdit) {
                reject();
                return
            }
            let data = this.editModule.get();
            Promise.all(this.field.filter((field) => field.chkAddr).map((field) => {
                return EditModule.checkValue(field, data, () => {
                    let com = this.editModule.getDom(field.name);
                    com && com.set('');
                });
            })).then((checkMsgList) => {
                for (let checkValueResult of checkMsgList) {
                    let {errors} = checkValueResult;
                    if(Array.isArray(errors) && errors[0]){
                        let msg = errors[0].msg;
                        if(msg){
                            Modal.alert(msg);
                            return ;
                        }
                    }
                    this.fetch(data).then(() => {
                        let urls = [];
                        this.field.forEach((field) => {
                            if(field.link && field.atrrs && field.atrrs.dataType === '20'){
                                let url = tools.url.addObj(CONF.siteUrl + BwRule.reqAddr(field.link, data), this.detail.ajaxData || {}, true, true);
                                urls.push(url);
                            }
                        });
                        this.detail.updateImgVersion(urls)
                            .then(() => {})
                            .catch((e) => console.log(e))
                            .finally(() => {
                                resolve();
                            });
                        this.cancel();
                    }).catch((e) => {
                        reject(e);
                    });
                }
            }).catch((e) => {
                console.log(e);
            });
        })
    }

    cancel() {
        this.detail && this.detail.items && this.detail.items.forEach((item) => {
            item.disabled = false;
            item.wrapper && item.wrapper.classList.remove('editing');
        });
        this.isEdit = false;
        this.editModule.destroy();
        this.modal && this.modal.destroy();
        this.modal = null;

    }

    get isDelete() {
        return tools.isNotEmpty(this.editParam.delete);
    }

    del() {
        this.editType = 'delete';
        return new Promise((resolve, reject) => {
            this.fetch(this.detail.detailData).then(() => {
                resolve();
                this.cancel();
            }).catch(() => {
                reject();
            });
        })
    }

    get isInsert() {
        return tools.isNotEmpty(this.editParam.insert);
    }

    insert(defData: obj = {}) {
        this.editType = 'insert';
        this.isEdit = true;
        this.createItem('modal');
        this.setData(defData);
    }

    protected fetch(data: obj): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let editModule = this.editModule,
                detail = this.detail,
                editData = this.getEditData(Object.assign({}, detail.ajaxData || {}, data), this.editType);

            if (tools.isEmpty(editModule) || tools.isEmpty(editData)) {
                reject('null');
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
                        msg: '加载中...',
                        disableEl: detail.container
                    }
                }).then(() => {
                    resolve();
                }).catch(e => {
                    reject(e);
                })
            }) : reject();
        })

    }

    protected getEditData(data: obj, type: 'insert' | 'update' | 'delete'): obj {
        let tableData = {
                [type]: [data]
            },
            varList: IBW_TableAddrParam = this.editParam;

        let paramData: obj = {};
        varList && ['update', 'delete', 'insert'].forEach(key => {
            let dataKey = varList[`${key}Type`];
            if (varList[key] && tableData[dataKey] && tableData[dataKey][0]) {
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

    protected modal: Modal;
    initModal() {
        this.modal && (this.modal.isShow = false);
        let modal = this.modal = new Modal({
            header: '编辑',
            isMb: tools.isMb,
            height: tools.isMb ? void 0 : '80%',
            width: tools.isMb ? void 0 : '80%',
            className: 'detail-edit-modal',
            isShow: true,
            body: <div className="detail-content"/>,
            closeMsg: '确定取消编辑吗?',
            onClose: () => {
                this.cancel();
            },
            footer: {
                leftPanel: [
                    {
                        content: '取消',
                        className: 'modal-btn edit-cancel',
                        onClick: () => {
                            modal.modalHidden();
                        }
                    }
                ],
                rightPanel: [
                    {
                        content: '确定',
                        className: 'modal-btn eidt-confirm',
                        type: 'primary',
                        onClick: () => {
                            this.save().then(() => {
                                Modal.toast('保存成功');
                                this.detail.refresh().catch((e) => {
                                    console.log(e);
                                })
                            }).catch(() => {
                                Modal.toast('保存失败');
                            });
                        }
                    }
                ]
            }
        });
    }

    destroy(){
        this.modal && this.modal.destroy();
        this.editModule && this.editModule.destroy();
        this.editModule = null;
        this.modal = null;
        this.detail = null;
        this.editParam = null;
    }

}
